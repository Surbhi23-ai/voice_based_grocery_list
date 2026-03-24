# UX Guidelines for Elderly Users

## Core Principles

1. **Voice-first** — Every action must be completable by voice
2. **Large targets** — Microphone button is 120px, touch-friendly
3. **Minimal UI** — No hidden menus, no settings, no complex navigation
4. **Calm feedback** — Soft colors, gentle animations, no jarring alerts
5. **Forgiving errors** — Always prompt again if unclear, never dead-ends

---

## Interaction Design Rules

- All prompts and feedback are spoken aloud in Hindi (TTS)
- Mic button has pulse animation when listening
- Toast notifications for success/error states
- Loading overlay during API calls
- Empty state message when no items exist
- **≥3 words → AI parser** — inputs of 3+ words always go to the AI agent (handles descriptive names like "nahane ka sabun" → नहाने का साबुन, and multi-item combos like "बेसन 4 किलो आटा"); 1-2 words use the instant local parser

---

## Voice Feedback Flow

```
User taps mic
  → App listens (hi-IN)
  → Transcription appears on screen
  → AI parses input
  → Item added to table
  → TTS says: "ठीक है, लिस्ट में जोड़ दिया।"
  → Mic auto-restarts immediately (session mode — no tap needed)
  → Listening resumes until user says "बस"
```

---

## Stop Commands

If user says any of these, stop listening:

| Voice Input | Response |
|-------------|----------|
| बस | "ठीक है, लिस्ट सेव हो गई।" |
| अभी नहीं | "ठीक है, लिस्ट सेव हो गई।" |
| नहीं | "ठीक है, लिस्ट सेव हो गई।" |

---

## Unrelated Input Handling

If user says something unrelated to groceries (e.g., "आज मौसम कैसा है"):

Response: **"क्या आप मुझसे कुछ कहना चाहते हैं? कृपया करके दोबारा दोहराएं, मैं आपकी बात को समझ नहीं पायी।"**

Then restart listening automatically.

---

## Accessibility Notes

- Font size must remain readable at 100% zoom on mobile
- Color contrast must pass WCAG AA
- No time-limited interactions (elderly users need more time)
- TTS voice uses Indian Hindi voice when available
