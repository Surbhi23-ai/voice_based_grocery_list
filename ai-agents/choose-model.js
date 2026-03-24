/* ══════════════════════════════════════════════════════
   AI AGENT — OpenRouter Model Handler
   - Calls /api/ai proxy (OPENROUTER_API_KEY lives in Vercel env)
   - Retries each model twice, rotates on rate-limit (429)
   - Local dev: set OPENROUTER_API_KEY in .env.local, run `vercel dev`
══════════════════════════════════════════════════════ */

const MODELS = [
  "mistralai/mistral-small-3.1-24b-instruct:free",  // PRIMARY
  "meta-llama/llama-3.3-70b-instruct:free",          // SECONDARY
  "google/gemma-3-27b-it:free",                      // LAST
];

// Tracks which model last responded — read by showParserBadge in index.html
let lastUsedModel = null;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/* ── Main AI Call Function ── */
async function callAIAgent(userInput) {
  if (!userInput?.trim()) return null;
  const isNode = typeof window === "undefined";

  const url = isNode
    ? "https://openrouter.ai/api/v1/chat/completions"
    : "/api/ai";

  const baseHeaders = isNode
    ? { "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };

  for (const model of MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: baseHeaders,
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: AI_MASTER_PROMPT },
              { role: "user",   content: userInput.trim() }
            ],
            temperature: 0.1,
            max_tokens: 150
          })
        });

        if (res.status === 429) {
          console.warn(`⚠ Rate limited on ${model} (attempt ${attempt})`);
          await sleep(2000);
          continue;
        }

        if (!res.ok) {
          console.warn(`❌ ${model} returned HTTP ${res.status}`);
          break;
        }

        const data = await res.json();
        const raw = (data.choices?.[0]?.message?.content || "").trim()
          .replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

        const parsed = JSON.parse(raw);
        if (!parsed.intent || !Array.isArray(parsed.items)) {
          throw new Error("Invalid JSON structure from model");
        }

        lastUsedModel = model;
        return parsed;

      } catch (err) {
        console.warn(`⚠ ${model} attempt ${attempt}:`, err.message);
        await sleep(1000);
      }
    }
    console.log(`➡ Switching to next model...`);
  }

  console.error("❌ All models failed");
  return null;
}

/* ── Batch runner for eval.html ── */
async function runTestsSafely(testCases) {
  const results = [];
  for (const test of testCases) {
    results.push(await callAIAgent(test));
    await sleep(1000);
  }
  return results;
}

if (typeof module !== "undefined") {
  module.exports = { callAIAgent, runTestsSafely, MODELS };
}
