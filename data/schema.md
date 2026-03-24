# Data Schema

## Storage Modes

| Mode | Backend | Trigger |
|------|---------|---------|
| Authenticated | Supabase (PostgreSQL) | Google Sign-In |
| Guest | localStorage | Skip Login |

---

## Supabase Tables

### `grocery_lists`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | Auto-generated |
| `user_id` | text | Google user sub / guest ID |
| `name` | text | List name (e.g., "मार्च का किराना") |
| `created_at` | timestamptz | Auto |

### `grocery_items`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | Auto-generated |
| `list_id` | uuid (FK → grocery_lists.id) | Parent list |
| `name` | text | Item name in Hindi |
| `qty` | text | Quantity string (e.g., "2 किलो") |
| `brand` | text | Brand name or empty string |
| `date_added` | text | Formatted as `DD/MM/YYYY` |
| `checked` | boolean | `false` = active, `true` = done |

---

## Grocery Item Object (JS)

```js
{
  id: "uuid",
  list_id: "uuid",
  name: "चावल",        // Required — Hindi item name
  qty: "2 किलो",       // Optional — Hindi unit string
  brand: "अमूल",       // Optional — brand name or ""
  date_added: "12/03/2026",  // DD/MM/YYYY
  checked: false       // false = active, true = strikethrough
}
```

---

## AI Agent Response Shape

Returned by `callAIAgent(userInput)` in `index.html`:

```js
{
  intent: "ADD_ITEMS" | "IRRELEVANT_QUERY" | "UNCLEAR_INPUT",
  items: [
    { name: "दूध", qty: "2 लीटर", brand: "अमूल" }
  ],
  message: ""  // Hindi message for IRRELEVANT or UNCLEAR intents
}
```

---

## localStorage Schema (Guest Mode)

```
Key: "kirana_lists"
Value: JSON array of list objects

[
  {
    id: "local-uuid",
    name: "मार्च का किराना",
    items: [
      { id: "...", name: "चावल", qty: "2 किलो", brand: "", date_added: "12/03/2026", checked: false }
    ]
  }
]
```
