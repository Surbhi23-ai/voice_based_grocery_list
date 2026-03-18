/* ══════════════════════════════════════════════════════
   AI AGENT — MODEL CHOOSER (OpenRouter Free Models)
   Auto-selects the best available free model on startup.
   Falls back to mistral-7b if the fetch fails.
══════════════════════════════════════════════════════ */

const OPENROUTER_API_KEY = "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";

/* ── Fallback if auto-select fails ──────────────────── */
const FALLBACK_MODEL = "mistralai/mistral-7b-instruct:free";

/* ── Preferred models in priority order ─────────────────
   Auto-select picks the first one from this list that is
   currently available and free on OpenRouter.
──────────────────────────────────────────────────────── */
const PREFERRED_MODELS = [
  "mistralai/mistral-7b-instruct:free",
  "qwen/qwen-2-7b-instruct:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "microsoft/phi-3-mini-128k-instruct:free",
  "google/gemma-3-1b-it:free",
];

/* ── Active model (set automatically on init) ───────── */
let activeModel = FALLBACK_MODEL;
let modelReady = false;

/* ── Master Prompt ────────────────────────────────────── */
const MASTER_PROMPT = `You are an AI assistant for a grocery list application.

Your task is to analyze a user's spoken or typed sentence and extract grocery items that should be added to a list.

The input may be in:
- Hindi
- Hinglish (Hindi written in English)
- Mixed Hindi + English
- Voice-transcription text with possible mistakes

You must identify the user's intent and extract only valid grocery items.

--------------------------------

INTENT TYPES

Return one of the following intents:

ADD_ITEMS → The user is mentioning grocery items to add.
IRRELEVANT_QUERY → The sentence is unrelated to groceries.
UNCLEAR_INPUT → The sentence is too messy or too many items were spoken together.

--------------------------------

ITEM EXTRACTION RULES

1. Extract only grocery items.
2. Ignore filler words like: add, please, daal do, list mein, laga do, le aana, aur, bhi
3. Remove quantities such as: 2 kilo, 3 packet, 1 dozen, half kilo
4. Convert Hinglish grocery names to Hindi when possible.
5. Remove duplicate items.
6. Ignore dates or context words like: kal, aaj, weekend ke liye
7. Return each grocery item separately.

--------------------------------

VOICE ERROR CORRECTION

If the input contains speech or spelling mistakes, correct them.
Examples: tamater → टमाटर | bread → ब्रेड | dood → दूध | anda → अंडा

--------------------------------

COMPLEX INPUT HANDLING

If more than 10 items are spoken together or the sentence is confusing, return:
intent = UNCLEAR_INPUT and ask the user to speak slowly.

--------------------------------

NON-GROCERY INPUT

If the sentence does not contain grocery items, return:
intent = IRRELEVANT_QUERY

--------------------------------

OUTPUT FORMAT

Return ONLY JSON. Do not add explanation text.

{
  "intent": "",
  "items": [],
  "message": ""
}

Rules for message field:
- intent = ADD_ITEMS        → message must be empty.
- intent = IRRELEVANT_QUERY → message = "मैं केवल किराना सूची से संबंधित बातें समझ सकता हूँ।"
- intent = UNCLEAR_INPUT    → message = "कृपया सामान धीरे-धीरे या एक-एक करके बोलें।"

--------------------------------

EXAMPLES

Input: "doodh dahi anda tamatar aloo"
Output: {"intent":"ADD_ITEMS","items":["दूध","दही","अंडा","टमाटर","आलू"],"message":""}

Input: "list mein doodh aur bread aur 2 kilo aloo daal do"
Output: {"intent":"ADD_ITEMS","items":["दूध","ब्रेड","आलू"],"message":""}

Input: "आज मौसम कैसा है"
Output: {"intent":"IRRELEVANT_QUERY","items":[],"message":"मैं केवल किराना सूची से संबंधित बातें समझ सकता हूँ।"}

Input: "doodh anda bread tamatar aloo pyaz bhindi lauki karela palak gobhi shimla mirch matar"
Output: {"intent":"UNCLEAR_INPUT","items":[],"message":"कृपया सामान धीरे-धीरे या एक-एक करके बोलें।"}

Now analyze the user's input and return the JSON response.`;


/**
 * initModel()
 *
 * Called once on page load. Fetches available free models from
 * OpenRouter, picks the best one from PREFERRED_MODELS, and sets
 * activeModel. Falls back to FALLBACK_MODEL if anything fails.
 *
 * Flow:
 *   getAvailableFreeModels()
 *       ↓
 *   Match against PREFERRED_MODELS (priority order)
 *       ↓
 *   Set activeModel → modelReady = true
 */
async function initModel() {
  console.log("[AI Agent] Fetching available free models…");
  try {
    const freeModels = await getAvailableFreeModels();
    const freeIds = freeModels.map(m => m.id);

    // Pick first preferred model that is currently available
    const best = PREFERRED_MODELS.find(id => freeIds.includes(id));

    if (best) {
      activeModel = best;
      console.log(`[AI Agent] Auto-selected model: ${activeModel}`);
    } else if (freeIds.length > 0) {
      // None of our preferred models available — use whatever is free
      activeModel = freeIds[0];
      console.log(`[AI Agent] No preferred model available. Using: ${activeModel}`);
    } else {
      activeModel = FALLBACK_MODEL;
      console.warn(`[AI Agent] Could not fetch models. Using fallback: ${activeModel}`);
    }
  } catch (err) {
    activeModel = FALLBACK_MODEL;
    console.warn(`[AI Agent] initModel error. Using fallback: ${activeModel}`, err);
  }
  modelReady = true;
}


/**
 * callAIAgent(userInput)
 *
 * Sends userInput to the auto-selected free model.
 * Waits for initModel() to finish if it hasn't yet.
 *
 * Returns:
 * {
 *   intent:  "ADD_ITEMS" | "IRRELEVANT_QUERY" | "UNCLEAR_INPUT"
 *   items:   string[]
 *   message: string
 * }
 */
async function callAIAgent(userInput) {
  if (!userInput || !userInput.trim()) {
    return { intent: "UNCLEAR_INPUT", items: [], message: "कृपया कुछ बोलें।" };
  }

  // Wait until model is selected (max 5 seconds)
  if (!modelReady) {
    await new Promise((resolve) => {
      const check = setInterval(() => {
        if (modelReady) { clearInterval(check); resolve(); }
      }, 100);
      setTimeout(() => { clearInterval(check); resolve(); }, 5000);
    });
  }

  console.log(`[AI Agent] Using model: ${activeModel}`);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": typeof window !== "undefined" ? window.location.href : "https://kirana-app",
        "X-Title": "Kirana List AI Agent",
      },
      body: JSON.stringify({
        model: activeModel,
        messages: [
          { role: "system", content: MASTER_PROMPT },
          { role: "user", content: userInput.trim() }
        ],
        temperature: 0.1,
        max_tokens: 300,
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("[OpenRouter] API error:", err);
      return { intent: "UNCLEAR_INPUT", items: [], message: "AI सेवा उपलब्ध नहीं है। दोबारा प्रयास करें।" };
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim() || "";

    // Strip markdown code fences if model wraps output in ```json ... ```
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

    const parsed = JSON.parse(cleaned);

    if (!parsed.intent || !Array.isArray(parsed.items)) {
      throw new Error("Unexpected response shape");
    }

    return parsed;

  } catch (err) {
    console.error("[callAIAgent] Error:", err);
    return { intent: "UNCLEAR_INPUT", items: [], message: "जवाब समझ नहीं आया। दोबारा बोलें।" };
  }
}


/**
 * getAvailableFreeModels()
 *
 * Fetches all currently free models from OpenRouter API.
 * Returns array of { id, name, context }
 */
async function getAvailableFreeModels() {
  const res = await fetch("https://openrouter.ai/api/v1/models", {
    headers: { "Authorization": `Bearer ${OPENROUTER_API_KEY}` }
  });
  const data = await res.json();
  return (data.data || [])
    .filter(m => m.pricing?.prompt === "0" || m.id.endsWith(":free"))
    .map(m => ({ id: m.id, name: m.name, context: m.context_length }));
}


// ── Auto-init when script loads ───────────────────────
initModel();

// Export for Node / module environments
if (typeof module !== "undefined") {
  module.exports = { callAIAgent, initModel, getAvailableFreeModels, MASTER_PROMPT };
}
