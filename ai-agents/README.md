# AI Agents

This folder contains the AI parsing layer for the किराना लिस्ट app.

---

## Files

| File | Role | Loaded by index.html? |
|------|------|-----------------------|
| `prompts.js` | Defines `AI_MASTER_PROMPT` — the system prompt sent to the LLM | Yes (`<script src>`) |
| `choose-model.js` | Standalone OpenRouter model selector + `callAIAgent()` | No (reference module) |

---

## How It Works

### In Production (`index.html`)

1. `prompts.js` is loaded as a `<script>` — it exposes `AI_MASTER_PROMPT` globally.
2. `callAIAgent(userInput)` is defined inline in `index.html` and uses `AI_MASTER_PROMPT`.
3. The function calls OpenRouter with a free LLM model and parses the JSON response.

```
User voice input (Hindi)
  ↓ Web Speech API transcription
  ↓ callAIAgent(text)
  ↓
Gemini Flash (PRIMARY)
  ↓ (if rate limited / fail)
Mistral Nemo (FALLBACK)
  ↓ (if simple input detected)
LLaMA 8B (FAST PATH)
  ↓ (if complex/messy)
DeepSeek (LAST RESORT)
  ↓
{ intent, items: [{name, qty, brand}], message }
  ↓ handleAddItem() — inserts into Supabase or localStorage
```

---

## AI_MASTER_PROMPT (prompts.js)

The prompt instructs the LLM to:

- Accept Hindi, Hinglish, or mixed input
- Detect intent: `ADD_ITEMS` | `IRRELEVANT_QUERY` | `UNCLEAR_INPUT`
- Extract each grocery item with:
  - `name` — Hindi item name (corrects Hinglish: tamater → टमाटर)
  - `qty` — Hindi unit string (converts: pav → 250 ग्राम, kilo → किलो)
  - `brand` — brand name or `""` (detects: Amul, Maggi, Patanjali, etc.)
- Return **only JSON** — no extra explanation text

### Response Format

```json
{
  "intent": "ADD_ITEMS",
  "items": [
    { "name": "दूध", "qty": "2 लीटर", "brand": "अमूल" }
  ],
  "message": ""
}
```

---

## choose-model.js (reference)

A standalone module that auto-selects the best available free model from OpenRouter on startup.

**Not currently loaded by `index.html`** — the inline `callAIAgent` uses a fixed model.

Can be integrated to enable dynamic model selection:

```html
<script src="./ai-agents/prompts.js"></script>
<script src="./ai-agents/choose-model.js"></script>
```

Then remove the inline `callAIAgent` from `index.html`.

### Model Priority Order

| # | Model | Role | Trigger |
|---|-------|------|---------|
| 1 | `google/gemini-flash-1.5-8b:free` | PRIMARY | Always tried first |
| 2 | `mistralai/mistral-nemo:free` | FALLBACK | Gemini rate-limited or fails |
| 3 | `meta-llama/llama-3.1-8b-instruct:free` | FAST PATH | Simple inputs |
| 4 | `deepseek/deepseek-chat:free` | LAST RESORT | Complex/messy inputs |

Falls back to Gemini Flash if the model fetch fails.

---

## Editing the Prompt

To change how items are parsed, edit `AI_MASTER_PROMPT` in `prompts.js`.

Key sections to modify:
- **RULES** — extraction and conversion logic
- **EXAMPLES** — few-shot examples that guide the LLM
- **OUTPUT FORMAT** — JSON shape (keep consistent with `handleAddItem` in `index.html`)
