# Voice Recognition

## Web Speech API Setup

```js
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'hi-IN';
recognition.continuous = false;
recognition.interimResults = true;
```

- **Language:** `hi-IN` (Indian Hindi) — locked, no toggle
- **Continuous:** false (single utterance per tap)
- **Interim results:** true (live transcript shown while speaking)

---

## Recognition Lifecycle

| Event | Action |
|-------|--------|
| `onstart` | Show "सुन रही हूँ..." status |
| `onresult` | Update live transcript; on final result → send to AI |
| `onerror` | Show error toast; auto-restart if `no-speech` |
| `onend` | Reset mic button state |

---

## Text-to-Speech (TTS)

```js
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'hi-IN';
  utterance.rate = 0.9;
  // Prefer Indian Hindi voice if available
  const voices = speechSynthesis.getVoices();
  const hindiVoice = voices.find(v => v.lang === 'hi-IN');
  if (hindiVoice) utterance.voice = hindiVoice;
  speechSynthesis.speak(utterance);
}
```

---

## Hindi Quantity Conversions

Handled by the AI agent prompt (`AI_MASTER_PROMPT` in `ai-agents/prompts.js`):

| Input | Output |
|-------|--------|
| पाव / एक पाव / पाव भर | 250 ग्राम |
| डेढ़ पाव | 375 ग्राम |
| दो पाव | 500 ग्राम |
| ढाई पाव | 625 ग्राम |
| तीन पाव | 750 ग्राम |
| चार पाव | 1 किलो |
| kilo → | किलो |
| gram → | ग्राम |
| litre → | लीटर |
| packet → | पैकेट |

---

## Known Limitations

- Web Speech API requires HTTPS (works on Vercel, fails on plain HTTP)
- Not supported in Firefox — Chrome/Edge only on Android
- Regional Hindi accents may cause transcription variance
- Background noise degrades accuracy
- Long pauses may trigger `no-speech` error
