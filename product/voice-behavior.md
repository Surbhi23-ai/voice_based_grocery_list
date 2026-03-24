# Voice Behavior & Example Interactions

## Voice Recognition Setup

- API: Web Speech API (browser-native)
- Language: `hi-IN`
- Mode: Continuous listening with interim results
- Auto-restart on silence or error

---

## Example Interactions

### Single Item
**Voice:** `चावल दो किलो`
**Result:** चावल | 2 किलो | - | 12/03/2026
**App says:** "ठीक है, लिस्ट में जोड़ दिया।"

---

### Item with Brand
**Voice:** `अमूल दूध दो लीटर`
**Result:** दूध | 2 लीटर | अमूल | 12/03/2026

---

### Pav Measurement
**Voice:** `एक पाव चावल`
**Result:** चावल | 250 ग्राम | - | 12/03/2026

**Voice:** `चाय पत्ती डेढ़ पाव`
**Result:** चाय पत्ती | 375 ग्राम | - | 12/03/2026

---

### Brand + Unit
**Voice:** `दो पैकेट मैगी नूडल्स`
**Result:** नूडल्स | 2 पैकेट | मैगी | 12/03/2026

---

### Stop Session
**Voice:** `बस`
**App says:** "ठीक है, लिस्ट सेव हो गई।"
**Action:** Stops listening

---

### Unrelated Query
**Voice:** `आज मौसम कैसा है`
**App says:** "क्या आप मुझसे कुछ कहना चाहते हैं? कृपया करके दोबारा दोहराएं, मैं आपकी बात को समझ नहीं पायी।"
**Action:** Restarts listening

---

## Hindi Quantity Conversion Table

| Voice Input | Parsed Value |
|-------------|-------------|
| पाव / एक पाव / पाव भर | 250 ग्राम |
| डेढ़ पाव | 375 ग्राम |
| दो पाव | 500 ग्राम |
| ढाई पाव | 625 ग्राम |
| तीन पाव | 750 ग्राम |
| चार पाव | 1 किलो |

---

## Voice Error Corrections

| Spoken (Hinglish) | Corrected (Hindi) |
|-------------------|------------------|
| tamater | टमाटर |
| brad / bread | ब्रेड |
| dood | दूध |
| anda | अंडा |
| aloo | आलू |
| chawal | चावल |
