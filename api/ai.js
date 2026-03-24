/* ══════════════════════════════════════════════════════
   Vercel Serverless Proxy — OpenRouter AI
   Keeps OPENROUTER_API_KEY out of client-side code.

   Set env var in Vercel dashboard:
     OPENROUTER_API_KEY = sk-or-v1-...

   Local dev: run `vercel dev` (reads .env.local)
══════════════════════════════════════════════════════ */

module.exports = async function handler(req, res) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req.body)
  });

  const data = await response.json();
  res.status(response.status).json(data);
}
