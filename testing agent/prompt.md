# Testing Agent Prompts
This file contains prompts for testing the Grocery List voice app.
---
## Voice Input Test Cases

### Happy Path — Grocery Items
| Test | Voice Input | Expected Item | Expected Quantity | Expected Brand |
|------|-------------|---------------|-------------------|----------------|
| T01 | चावल दो किलो | चावल | 2 किलो | - |
| T02 | अमूल दूध दो लीटर | दूध | 2 लीटर | अमूल |
| T03 | चीनी पाव भर | चीनी | 250 ग्राम | - |
| T04 | चाय पत्ती डेढ़ पाव | चाय पत्ती | 375 ग्राम | - |
| T05 | दो पैकेट मैगी नूडल्स | नूडल्स | 2 पैकेट | मैगी |
| T06 | एक पाव चावल | चावल | 250 ग्राम | - |
| T07 | आटा पाँच किलो | आटा | 5 किलो | - |
| T08 | पतंजलि घी एक किलो | घी | 1 किलो | पतंजलि |

---
### Stop Commands
| Test | Voice Input | Expected TTS Response | Expected Action |
|------|-------------|----------------------|-----------------|
| S01 | बस | ठीक है, लिस्ट सेव हो गई। | Stop listening |
| S02 | नहीं | ठीक है, लिस्ट सेव हो गई। | Stop listening |
| S03 | अभी नहीं | ठीक है, लिस्ट सेव हो गई। | Stop listening |


---

### Negative Behavior — Non-Grocery Speech

| Test | Voice Input | Expected TTS Response | Expected Action |
|------|-------------|----------------------|-----------------|
| N01 | आज मौसम कैसा है | क्या आप मुझसे कुछ कहना चाहते हैं? कृपया करके दोबारा दोहराएं, मैं आपकी बात को समझ नहीं पायी। | Auto-restart listening |
| N02 | मुझे भूख लगी है | (same as above) | Auto-restart listening |
| N03 | आप कैसे हैं | (same as above) | Auto-restart listening |
| N04 | हाँ | (same as above — too short) | Auto-restart listening |
| N05 | क्या समय हुआ है | (same as above) | Auto-restart listening |
| N06 | कल क्या बनाएंगे | (same as above) | Auto-restart listening |

---

### List Creation

| Test | Voice Input | Expected List Name |
|------|-------------|--------------------|
| L01 | मार्च का किराना लिस्ट | मार्च का किराना लिस्ट |
| L02 | जनवरी की लिस्ट | जनवरी की लिस्ट |
| L03 | घर का राशन लिस्ट | घर का राशन लिस्ट |
---
## Authentication Test Cases

| Test | Action | Expected Behavior |
|------|--------|-------------------|
| A01 | Click "Google से साइन इन करें" | Google OAuth popup opens |
| A02 | Click "अभी के लिए छोड़ें" | App loads in guest/local mode |
| A03 | Sign in successfully | User name/avatar appears, Supabase used for storage |
| A04 | Guest mode — create list | List saved to localStorage only |

---

## Storage Test Cases

| Test | Condition | Expected Storage |
|------|-----------|-----------------|
| DB01 | Signed-in user creates list | Row appears in Supabase `grocery_lists` |
| DB02 | Signed-in user adds item | Row appears in Supabase `grocery_items` with correct `list_id` and `list_name` |
| DB03 | Guest user creates list | Stored in `localStorage` key `kiraana_lists_v1` |
| DB04 | Supabase unavailable | Falls back to localStorage, toast shown |

---

## UI / UX Test Cases

| Test | Action | Expected Behavior |
|------|--------|-------------------|
| U01 | Check item checkbox | Row turns grey, text strikethrough |
| U02 | Click trash icon on item | Item deleted from list and storage |
| U03 | Open app on mobile browser (Android Chrome) | Layout fits mobile screen, mic button large and tappable |
| U04 | Browser without Web Speech API | Error banner: "यह ब्राउज़र आवाज़ नहीं पहचानता", mic disabled |

---

## Hindi Quantity Conversion — Unit Tests

| Input Phrase | Expected Output |
|--------------|-----------------|
| पाव | 250 ग्राम |
| एक पाव | 250 ग्राम |
| पाव भर | 250 ग्राम |
| डेढ़ पाव | 375 ग्राम |
| दो पाव | 500 ग्राम |
| ढाई पाव | 625 ग्राम |
| तीन पाव | 750 ग्राम |
| चार पाव | 1 किलो |



### Rare scenarios 

| ID | Condition | Voice Input | Current (Bug) | Expected Behavior |
|----|-----------|-------------|---------------|-------------------|
| S04 | List created, zero items added | बस | Says "ठीक है, लिस्ट सेव हो गई।" ❌ | Should say "आपकी लिस्ट खाली है। क्या आप कोई चीज़ ऐड करना चाहते हैं?" and keep listening if say yes add item or else leave it saying "ठीक है" |
| S05 | List created, zero items added | नहीं | Says "ठीक है, लिस्ट सेव हो गई।" ❌ | Same as S04 — warn before saving empty list |
| S06 | List created, zero items added | अभी नहीं | Says "ठीक है, लिस्ट सेव हो गई।" ❌ | Same as S04 |

