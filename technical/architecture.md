# Architecture

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Vanilla HTML + CSS + JS | Single `index.html`, no build step |
| Voice Input | Web Speech API (`hi-IN`) | Browser-native, no SDK |
| Text-to-Speech | Web Speech API | Indian Hindi voice |
| Authentication | Google Identity Services | OAuth 2.0 |
| Database | Supabase (PostgreSQL) | REST + realtime |
| AI Parsing | OpenRouter API | Free LLM auto-selection |
| Hosting | Vercel | Static site, instant deploy |
| PWA | Web App Manifest | Installable on Android/iOS |

---

## File Structure

```
Grocery_list/
├── index.html              ← Complete app (HTML + CSS + JS)
├── .env                    ← API keys (not committed)
├── .gitignore
├── vercel.json             ← Vercel static deployment config
├── README.md               ← Developer quick-start
│
├── public/
│   ├── manifest.json       ← PWA manifest
│   └── assets/
│       ├── favicon.png
│       └── logo.png
│
└── ai-agents/
    ├── README.md           ← AI agent documentation
    ├── prompts.js          ← AI_MASTER_PROMPT (loaded by index.html)
    └── choose-model.js     ← Standalone OpenRouter model selector (reference)
```

---

## Data Flow

```
User speaks
  ↓ Web Speech API (hi-IN)
Transcribed text
  ↓ callAIAgent()
OpenRouter LLM (free model)
  ↓ JSON response
{ intent, items: [{name, qty, brand}] }
  ↓ handleAddItem()
Supabase INSERT  ←→  localStorage (guest fallback)
  ↓ renderList()
Table re-renders with new row
```

---

## Authentication Flow

```
App loads
  ↓
Google Identity Services init
  ├─ Google Sign-In button rendered
  └─ Skip button rendered

Google Sign-In
  ↓ Google JWT credential
  ↓ decode payload → user name, email, avatar
  ↓ currentUser set → Supabase mode

Skip Login
  ↓ isGuestMode = true
  ↓ localStorage mode
```

---

## Environment Variables

Stored in `.env` (never committed):

```
GOOGLE_CLIENT_ID=...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
OPENROUTER_API_KEY=...
```

> **Note:** Currently hardcoded in index.html for static deployment on Vercel.
> For production, use a backend proxy or Vercel Edge Functions to protect keys.

---

## Deployment

```
git push origin main
  ↓ Vercel auto-deploys
  ↓ vercel.json routes all requests to static files
Live at: https://your-app.vercel.app
```
