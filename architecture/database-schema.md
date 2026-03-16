# Database Schema

The app supports two storage modes:
- **localStorage** — works immediately, no setup needed (current default)
- **Supabase** — cloud sync, requires credentials in `.env`

---

## Supabase SQL Schema

Run this in your Supabase project → SQL Editor:

```sql
-- ─────────────────────────────────────────────
-- Table: grocery_lists
-- One list per user (e.g. "मार्च का किराना लिस्ट")
-- ─────────────────────────────────────────────
create table grocery_lists (
  id          uuid          primary key default gen_random_uuid(),
  user_id     text          not null,           -- Google sub or "guest_local_001"
  email       text,                             -- Gmail address, e.g. user@gmail.com
  list_name   text          not null,
  created_at  timestamptz   not null default now()
);

-- Index to quickly fetch all lists for a user
create index idx_grocery_lists_user on grocery_lists (user_id, created_at desc);

-- ─────────────────────────────────────────────
-- Table: grocery_items
-- Items belonging to a list
-- ─────────────────────────────────────────────
create table grocery_items (
  id          uuid          primary key default gen_random_uuid(),
  list_id     uuid          not null references grocery_lists (id) on delete cascade,
  list_name   text,                              -- denormalized copy for easy querying
  item_name   text          not null,           -- Hindi name, e.g. "चावल"
  quantity    text          not null default '-', -- e.g. "2 किलो" | "-"
  brand       text          not null default '-', -- e.g. "अमूल" | "-"
  checked     boolean       not null default false,
  created_at  timestamptz   not null default now()
);

-- Index to fetch items for a list ordered by insertion
create index idx_grocery_items_list on grocery_items (list_id, created_at asc);

-- ─────────────────────────────────────────────
-- Row-Level Security (RLS)
-- Each user can only see and modify their own data
-- ─────────────────────────────────────────────
alter table grocery_lists  enable row level security;
alter table grocery_items  enable row level security;

-- Permissive policies — the app uses Google GIS tokens (not Supabase Auth),
-- so JWT-based RLS won't work. User isolation is enforced at the query level
-- via .eq('user_id', userId) in all Supabase calls.
create policy "allow_all" on grocery_lists for all using (true) with check (true);
create policy "allow_all" on grocery_items  for all using (true) with check (true);
```

---

## Table Relationships

```
grocery_lists
  id          ◄──┐
  user_id        │  (one user → many lists)
  list_name      │
  created_at     │
                 │
grocery_items    │
  id             │
  list_id ───────┘  (one list → many items, cascade delete)
  item_name
  quantity
  brand
  checked
  created_at
```

---

## Column Reference

### grocery_lists

| Column      | Type        | Notes                               |
|-------------|-------------|-------------------------------------|
| id          | uuid        | Primary key, auto-generated         |
| user_id     | text        | Google `sub` claim or guest ID      |
| email       | text        | Gmail address, e.g. user@gmail.com (null for guests) |
| list_name   | text        | Hindi name, e.g. मार्च का किराना लिस्ट |
| created_at  | timestamptz | Auto-set on insert                  |

### grocery_items

| Column     | Type        | Notes                                    |
|------------|-------------|------------------------------------------|
| id         | uuid        | Primary key, auto-generated              |
| list_id    | uuid        | FK → grocery_lists.id (cascade delete)   |
| list_name  | text        | Denormalized copy of the list name       |
| item_name  | text        | Hindi item name, e.g. चावल               |
| quantity   | text        | e.g. "2 किलो", "250 ग्राम", "-"         |
| brand      | text        | e.g. "अमूल", "-"                         |
| checked    | boolean     | true = struck-through (bought)           |
| created_at | timestamptz | Used for display date (DD/MM/YYYY)       |

---

## localStorage Schema (offline / guest fallback)

Storage key: `kiraana_lists_v1`

```json
{
  "lists": {
    "<list_id>": {
      "id": "ls_1710499200000",
      "list_name": "मार्च का किराना लिस्ट",
      "created_at": 1710499200000,
      "items": [
        {
          "id": "i_1710499200001",
          "list_id": "ls_1710499200000",
          "item_name": "चावल",
          "quantity": "2 किलो",
          "brand": "-",
          "checked": false,
          "created_at": 1710499200001
        }
      ]
    }
  }
}
```

---

## Notes

- `quantity` and `brand` use `"-"` as null sentinel (never empty string or null)
- Date displayed as `DD/MM/YYYY` — derived from `created_at` timestamp at render time
- RLS policies use the JWT `sub` claim — works with Google Identity Services (GIS) tokens
- For guest mode, `user_id` is hardcoded to `"guest_local_001"` and data stays in localStorage only
