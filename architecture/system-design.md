# System Design

## Overview

Single-page application (SPA) — no build step, no framework, no server required.
Open `src/index.html` directly in Chrome or Android WebView.

---

## Screen state machine

```
[Auth Screen]
    │
    ├─ Google Sign-In ──┐
    └─ Skip Login ──────┤
                        ▼
              [List Name Screen]
                (speak list name)
                        │
                        ▼
               [App Screen]  ◄──────────────────┐
                (speak item)                      │
                        │                         │
                   item parsed                    │
                        │                         │
                 addItem() → TTS                  │
                        │                         │
                   6s timer                       │
                        │                         │
              "और कुछ?" → mic restart ───────────┘
                        │
                 stop command
                        │
                  TTS → mic off
```

---

## Module responsibilities

| File | Responsibility |
|---|---|
| `src/index.html` | HTML structure — 3 screens, DOM elements |
| `src/style.css` | All visual design — tokens, layout, animations |
| `src/app.js` | All logic — state, NLP, TTS, speech recognition, events |

---

## State shape (localStorage)

```js
{
  user: null | { name: string },
  listName: string,
  items: [
    {
      id: number,        // Date.now()
      name: string,      // Hindi item name
      qty: string,       // e.g. "2 किलो" or "-"
      brand: string,     // e.g. "अमूल" or "-"
      date: string,      // "DD/MM/YYYY"
      checked: boolean
    }
  ]
}
```

Storage key: `kiranaApp_v5`

---

## Voice pipeline

```
User taps mic
    │
SpeechRecognition.start()  (lang: hi-IN)
    │
onresult → interim transcript shown live
    │
isFinal → handleFinal(text)
    │
    ├─ isStopCommand?  → TTS "सेव हो गई" → stop
    ├─ extractGroceryItem(text)
    │     ├─ brand match (BRANDS list)
    │     ├─ पाव conversion (PAV_MAP)
    │     ├─ unit + number extraction
    │     └─ returns { name, qty, brand } or null
    │
    ├─ parsed ok  → addItem() → TTS → 6s → "और कुछ?"
    └─ null       → handleBadSpeech() → TTS → auto-retry
```

---

## Key design decisions

- **No backend** — all data in localStorage, no API calls
- **No build step** — vanilla JS/CSS/HTML, deployable as a folder
- **Android Chrome target** — uses `webkitSpeechRecognition`, `touchend` preventDefault
- **TTS rate 0.86** — slower speech for elderly users
- **Auto-restart on bad speech** — reduces friction for non-technical users
- **Items unshift** (newest first) — most recent item is always visible at top
