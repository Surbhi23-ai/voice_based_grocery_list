# Negative Behavior Handling

These are the unrecognized or unrelated inputs the app must gracefully handle.

---

## Unrelated speech (off-topic)

**Voice:** आज मौसम कैसा है

**App response (TTS):**
> "मैं केवल किराना सूची से संबंधित प्रश्न समझ सकता हूँ। कृपया कोई वस्तु जोड़ें या सूची देखें।"

**Action:** Auto-restart listening (same mode)

---

## Detection logic — what makes speech NON-grocery

The app detects non-grocery speech by checking if the raw spoken text looks like a
**Hindi sentence** rather than a **grocery phrase**.

Grocery phrases are short noun+quantity fragments:
> चावल दो किलो / अमूल दूध / चाय पत्ती डेढ़ पाव

Sentences have grammatical markers that grocery items never have:

### 1. Hindi verbs (sentence endings)
है, हैं, था, थी, थे, हो, होगा, होगी, होंगे, करना, करो, करें, करता, करती,
बताओ, बताएं, बता, दो, दे, देना, लो, लेना, जाओ, आओ, बोलो, सुनो, पूछो

### 2. Question words
कैसा, कैसे, कैसी, क्या, कब, कहाँ, कहां, कौन, क्यों, क्योंकि,
किसका, किसकी, किसके, कितना, कितने, कितनी

### 3. Personal pronouns (never in grocery items)
मैं, मुझे, मुझको, मेरा, मेरी, मेरे, तुम, तुमको, तुम्हारा,
आप, आपको, आपका, वो, वह, उसे, हम, हमें, यह, इसे

### 4. Conversational connectors used as sentence subjects
आज, कल, परसों, अभी, अब — only flagged when combined with a verb

### 5. Too long after NLP stripping
After brand + quantity are extracted, if the remaining item name is > 4 words,
it is almost certainly conversational speech, not a grocery item name.

---

## No speech / silence

**Trigger:** `no-speech` error from Web Speech API

**App response:** Same as unrelated speech — gentle retry prompt, auto-restart listening

---

## Too-short input

**Example:** Single syllable like "हाँ" or "ओह"

**App behavior:** `parseSpokenText` returns empty item → treated as bad speech → retry prompt

---

## Ambiguous stop-like words during item-add mode

**Example:** "नहीं" when the app is mid-flow

**App behavior:** Recognized as stop command → TTS says "ठीक है, लिस्ट सेव हो गई।" → stops listening

---

## Browser does not support Web Speech API

**Trigger:** `SpeechRecognition` and `webkitSpeechRecognition` both unavailable

**App behavior:** Shows error banner — "यह ब्राउज़र आवाज़ नहीं पहचानता" — mic disabled

---

## Design rules

- Never show a blank screen or crash
- Always give TTS + visual banner feedback
- Auto-restart rather than asking user to tap again
- When in doubt, reject — it is better to ask again than to add garbage to the list
