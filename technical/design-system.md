# Design System

## Philosophy

**Digital Wellness + Digital Minimalism** — calm, spacious, zero cognitive overload.

---

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#FDFCF8` | Page background |
| Sage | `#E8EFE8` | Card backgrounds, subtle sections |
| Lavender | `#EFEDF4` | Alternate card tint |
| Accent | `#FFB7B2` | Highlights, active states |
| Text | `#292524` | Primary body text |
| Muted Text | `#78716C` | Secondary labels, placeholders |

> Note: App currently uses green palette (`#2e7d32` primary, `#f1f8f1` background) — align with FDFCF8/sage on next design pass.

---

## Typography

| Role | Font | Size | Weight |
|------|------|------|--------|
| Primary | Outfit | body: 16px | 400–600 |
| Accent / Display | Reenie Beanie | display only | 400 |
| Headings | Outfit | 48px–96px | 700 |

- Letter spacing (headings): `-0.025em` (tracking-tight)
- Line height: `1.5` body, `1.1` headings

---

## Visual Effects

| Effect | Value |
|--------|-------|
| Grain overlay | opacity `0.35` |
| Border radius (cards) | `2rem – 4rem` |
| Shadows | `0 4px 24px rgba(0,0,0,0.06)` |
| Blob animation | 6s loop, floating |

---

## Component Specs

### Microphone Button
- Size: 120px × 120px
- Shape: Circle
- Active state: pulse animation (`box-shadow` ring, 2s loop)
- Icon: mic SVG, centered

### Grocery Table
- Full width, mobile-responsive
- Columns: Checkbox | Item | Quantity | Brand | Date | Delete
- Checked row: `background: #f3f3f3`, `text-decoration: line-through`, `color: #aaa`

### Toast Notifications
- Position: bottom-center
- Duration: 3 seconds
- Variants: success (green), error (red)

### Loading Overlay
- Full-screen semi-transparent
- Centered spinner
- Shown during: auth init, Supabase calls, AI parsing
