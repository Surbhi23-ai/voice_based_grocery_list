# किराना लिस्ट

A mobile-first Hindi voice-based grocery list app for elderly Indian parents.

## Quick start

Open `src/index.html` in Chrome (desktop or Android).

No build step. No dependencies. No server.

## How it works

1. Sign in with Google or skip login
2. Speak your list name in Hindi
3. Speak grocery items — the app parses item, quantity, and brand
4. Check off items while shopping (strikethrough, stays in list)

## Project structure

```
├── prompt.md                    Project brief
├── README.md                    This file
│
├── src/
│   ├── index.html               HTML structure
│   ├── style.css                All styles
│   └── app.js                   All logic (state, NLP, voice, events)
│
├── context/
│   ├── examples.md              Voice interaction examples
│   ├── voice-phrases.md         All recognized phrases and TTS responses
│   ├── negative-behaviors.md    How the app handles bad/unrelated input
│   └── screenshots/             Reference UI screenshots
│       └── README.md
│
└── architecture/
    ├── system-design.md         Screen flow, module responsibilities, voice pipeline
    └── database-schema.md       localStorage data shape
```

## Voice assistant controls

| Action | What happens |
|--------|-------------|
| Tap 🎤 mic button while assistant is speaking | TTS stops immediately, mic starts listening |
| Say **"चुप"** / "चुप करो" / "शांत" | TTS silenced instantly, mic restarts |
| Say **"बस"** / "नहीं" / "रुको" | Session ends, list saved |

> **Mute behaviour:** Tapping the mic button at any time — even mid-sentence — cancels ongoing speech synthesis and activates the microphone within 300ms.

## Tech stack

- Vanilla HTML / CSS / JS — no framework, no build step
- Web Speech API (`SpeechRecognition` + `SpeechSynthesis`)
- `localStorage` for persistence

## Target users

Elderly Indian parents (60+), Hindi-speaking, Android phones, not comfortable typing.
