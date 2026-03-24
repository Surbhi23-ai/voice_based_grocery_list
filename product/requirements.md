# Product Requirements

## Authentication

| Option | Hindi Text | Behavior |
|--------|-----------|----------|
| Google Sign-In | `Google से साइन इन करें` | OAuth via Google Identity Services |
| Skip Login | `अभी के लिए छोड़ें` | Guest mode — localStorage only |

---

## List Management

- User must **create a list** before adding items
- Assistant prompts: **"कृपया अपनी लिस्ट का नाम बोलें"**
- Example list names: `मार्च का किराना लिस्ट`, `जनवरी की लिस्ट`, `घर का राशन लिस्ट`
- Multiple lists supported; user selects from dropdown

---

## Item Display

4-column table layout:

| Item | Quantity | Brand | Date |
|------|----------|-------|------|
| चावल | 2 किलो | अमूल | 12/03/2026 |

- Date format: `DD/MM/YYYY`
- Checkbox on left side of each row
- Delete button (red trash icon) on right side of each row

---

## Checkbox Behavior

When checkbox is checked:
- Row background becomes grey
- Item text gets strikethrough styling
- Item remains visible in list (not deleted — just marked done)

---

## Feature Checklist

- [x] Google Sign-In
- [x] Skip/guest login
- [x] Voice list creation
- [x] Voice item adding
- [x] AI parsing of item name, quantity, brand
- [x] 4-column item table
- [x] Checkbox strike-through
- [x] Per-item delete (red trash icon)
- [x] View all lists (dropdown)
- [x] Supabase persistence
- [x] localStorage fallback for guests
