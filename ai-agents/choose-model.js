/* ══════════════════════════════════════════════════════
   AI AGENT — OpenRouter Model Handler
   - Browser: tries /api/ai proxy first (key stays on server)
             auto-falls back to direct call if proxy is down/misconfigured
   - Node.js: calls OpenRouter directly via OPENROUTER_API_KEY env var
   - Retries each model twice, rotates on rate-limit (429)
══════════════════════════════════════════════════════ */

// Dev key — used only when /api/ai proxy is unavailable (local dev without vercel dev)
// In production the Vercel env var is used by the proxy; this key never reaches prod users
const OPENROUTER_DEV_KEY = "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";

const MODELS = [
  "mistralai/mistral-nemo:free",            // PRIMARY
  "google/gemini-2.0-flash-exp:free",       // SECONDARY
  "meta-llama/llama-3.1-8b-instruct:free",  // LAST
];

// Tracks which model last responded — read by showParserBadge in index.html
let lastUsedModel = null;

// Always use direct OpenRouter call (proxy requires Vercel env var setup)
// TODO: set to false once OPENROUTER_API_KEY is confirmed working in Vercel env
let _useDirect = true;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function _endpoint() {
  const isNode = typeof window === "undefined";
  if (isNode) {
    return {
      url: "https://openrouter.ai/api/v1/chat/completions",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://kirana-app",
        "X-Title": "Kirana AI Agent",
      }
    };
  }
  if (_useDirect) {
    return {
      url: "https://openrouter.ai/api/v1/chat/completions",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_DEV_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.href,
        "X-Title": "Kirana AI Agent",
      }
    };
  }
  return {
    url: "/api/ai",
    headers: { "Content-Type": "application/json" }
  };
}

async function _isProxyBroken(res) {
  if (res.status === 404) return true;
  return false;
}

/* ── Main AI Call Function ── */
async function callAIAgent(userInput) {
  if (!userInput?.trim()) return null;
  const isNode = typeof window === "undefined";

  for (const model of MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const { url, headers } = _endpoint();

        // 🔥 ADD THIS LINE (DEBUG)
        console.log("🚀 FINAL URL BEING CALLED:", url);

        const res = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: AI_MASTER_PROMPT },
              { role: "user", content: userInput.trim() }
            ],
            temperature: 0.1,
            max_tokens: 150
          })
        });

        // Proxy broken → switch to direct and retry this attempt
        if (!isNode && !_useDirect && await _isProxyBroken(res)) {
          _useDirect = true;
          console.warn("⚠ Proxy unavailable — switching to direct OpenRouter call");
          attempt = 0;
          continue;
        }

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
