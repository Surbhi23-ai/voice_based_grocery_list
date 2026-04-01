/* ══════════════════════════════════════════════════════
   AI AGENT — OpenRouter Model Handler
   - Calls /api/ai proxy (OPENROUTER_API_KEY lives in Vercel env)
   - Retries each model twice, rotates on rate-limit (429)
   - Local dev: set OPENROUTER_API_KEY in .env.local, run `vercel dev`
══════════════════════════════════════════════════════ */

const MODELS = [
  "nvidia/nemotron-3-super-120b-a12b:free",  // PRIMARY  (120B, reasoning disabled)
  "stepfun/step-3.5-flash:free",             // SECONDARY
  "nvidia/nemotron-nano-9b-v2:free",         // LAST
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
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(url, {
          method: "POST",
          headers: baseHeaders,
          signal: controller.signal,
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: AI_MASTER_PROMPT },
              { role: "user",   content: userInput.trim() }
            ],
            temperature: 0.1,
            max_tokens: 200,
            reasoning: { effort: "none" }
          })
        });
        clearTimeout(timeout);

        if (res.status === 429) {
          console.warn(`⚠ Rate limited on ${model} (attempt ${attempt})`);
          await sleep(500);
          continue;
        }

        if (!res.ok) {
          console.warn(`❌ ${model} returned HTTP ${res.status}`);
          break;
        }

        const data = await res.json();
        const msg = data.choices?.[0]?.message || {};
        // Reasoning models return null content — extract JSON from reasoning field
        const rawText = (msg.content || msg.reasoning || "").trim();
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        const raw = jsonMatch ? jsonMatch[0] : rawText
          .replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

        const parsed = JSON.parse(raw);
        if (!parsed.intent || !Array.isArray(parsed.items)) {
          throw new Error("Invalid JSON structure from model");
        }

        lastUsedModel = model;
        return parsed;

      } catch (err) {
        clearTimeout(timeout);
        const label = err.name === 'AbortError' ? 'timeout 6s' : err.message;
        console.warn(`⚠ ${model} attempt ${attempt}: ${label}`);
        await sleep(300);
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
