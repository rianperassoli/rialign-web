# Rialign Design System

Clean, minimal, cozy, calm, warm, trustworthy, modern, premium, effortless.
It should feel like organizing your finances in a peaceful place — **not** like
operating banking software. Favor whitespace over density, simplicity over
decoration, one clear focal point per screen. **Never blue as the brand color.**

Everything below is implemented in `src/app.css`. Pages and components must use
the **semantic tokens**, not raw Tailwind palette classes — that is what makes
light/dark theming automatic.

## Typography

- **Inter** (variable, self-hosted via `@fontsource-variable/inter`) for everything.
- Headings: `font-medium` / `font-semibold`. Body: regular.
- Generous spacing; excellent readability first.

## Token architecture (how theming works)

```
@theme            → brand scale + accent colors (static)
:root             → light neutrals (stone)
:root[data-theme="dark"] + @media (prefers-color-scheme: dark) → dark neutrals (zinc)
@theme inline     → maps the vars to Tailwind utilities (bg-surface, text-ink, …)
```

The navbar theme switcher (`ThemeToggle.svelte`) sets `data-theme="light|dark"`
on `<html>` and persists it in `localStorage`; "System" removes the attribute.
An inline script in `app.html` applies the saved value **before first paint**.

## Logo

Source of truth: `../identidade visual-base.png` (brand sheet). The mark is four
pieces aligned into an "R"; it lives in `src/lib/components/brand/Logo.svelte`
(`symbol` / `horizontal` / `vertical`, optional tagline) and `static/favicon.svg`.
The mark is Green 700 on light and dark backgrounds, white on a green one
(`class="text-white"`). Wordmark is Inter semibold in `ink`; the tagline
("Your finances, finally aligned.", `brand_tagline`) is `brand-ink`.

## Brand (green — Tailwind `green` scale as `brand-*`)

| Role                                | Token              | Hex                              |
| ----------------------------------- | ------------------ | -------------------------------- |
| Primary actions                     | `brand-700`        | `#15803d`                        |
| Primary hover                       | `brand-800`        | `#166534`                        |
| Primary active                      | `brand-900`        | `#14532d`                        |
| Accent / highlights                 | `brand-500`        | `#22c55e`                        |
| Soft background (chips, active nav) | `brand-soft`       | green-100 light / green-900 dark |
| Soft background hover               | `brand-soft-hover` | green-200 light / green-800 dark |
| Text on soft background             | `brand-soft-ink`   | green-800 light / green-200 dark |
| Green text on plain backgrounds     | `brand-ink`        | green-700 light / green-400 dark |

Use `brand-soft` + `brand-soft-ink` together — never hardcode `green-100`
text-on-chip colors, they don't survive dark mode.

## Neutrals (semantic — stone in light, zinc in dark)

| Token            | Utility examples           | Light (stone)       | Dark (zinc)         | Use for                                         |
| ---------------- | -------------------------- | ------------------- | ------------------- | ----------------------------------------------- |
| `app`            | `bg-app`                   | Stone 50 `#fafaf8`  | Stone 900 `#0c0c0c` | Page background                                 |
| `surface`        | `bg-surface`               | white               | zinc-900 `#18181b`  | Cards, modals, navbar, inputs                   |
| `surface-subtle` | `bg-surface-subtle`        | Stone 100 `#f1f1ed` | zinc-800 `#27272a`  | Inner boxes, pills, tracks, elevated dark cards |
| `edge`           | `border-edge`, `ring-edge` | stone-200 `#e7e5e4` | zinc-700 `#3f3f46`  | Borders                                         |
| `edge-subtle`    | `divide-edge-subtle`       | Stone 100           | zinc-800            | Row dividers                                    |
| `ink`            | `text-ink`, `fill-ink`     | Stone 900 `#0c0c0c` | zinc-50 `#fafafa`   | Primary text                                    |
| `ink-secondary`  | `text-ink-secondary`       | Stone 600 `#52525b` | zinc-400 `#a1a1aa`  | Secondary text, labels                          |
| `ink-muted`      | `text-ink-muted`           | stone-400 `#a8a29e` | zinc-500 `#71717a`  | Muted text, placeholders                        |
| `hover`          | `hover:bg-hover`           | Stone 100           | zinc-800            | Hover surfaces                                  |

Never use `slate-*` (removed) or raw `stone-*`/`zinc-*`/`white` in components.

## Accents & money-flow semantics

| Meaning             | Token       | Hex                 | Rule                                                                         |
| ------------------- | ----------- | ------------------- | ---------------------------------------------------------------------------- |
| Income / money in   | `income`    | green-500 `#22c55e` | Anything about **income** is this green: amounts, badges, icons, **buttons** |
| Expense / money out | `expense`   | red-500 `#ef4444`   | Anything about **expenses** is this red: amounts, badges, icons, **buttons** |
| Transfer            | — (neutral) | `ink` on `app`      | Transfers use **neutral** styling, including buttons                         |
| Warning             | `warning`   | amber-500 `#f59e0b` | Open invoices, pending states                                                |
| Info                | `info`      | sky-500 `#0ea5e9`   | Informational only — **never** as brand                                      |

Tinted backgrounds use opacity, not palette-100 shades (dark-safe):
`bg-income/15 text-income`, `bg-expense/10 text-expense`, `bg-warning/15 text-warning`.

## Buttons (`Button.svelte` variants)

| Variant     | Style                                                            | When                                              |
| ----------- | ---------------------------------------------------------------- | ------------------------------------------------- |
| `primary`   | `brand-700` → hover `brand-800` → active `brand-900`, white text | Default/generic actions (New card, Save account…) |
| `secondary` | transparent, `ring-edge` border, `hover:bg-hover`                | Cancel, secondary choices                         |
| `ghost`     | transparent, very soft hover                                     | Inline/low-emphasis actions                       |
| `expense`   | solid `expense` red                                              | Submitting/creating an **expense**                |
| `income`    | solid `income` green                                             | Submitting an **income**, paying an invoice       |
| `neutral`   | solid `ink` with `app` text (auto-inverts per theme)             | **Transfers**                                     |
| `danger`    | solid red                                                        | Destructive actions (delete)                      |

## Shape, depth, motion

- **Radius:** `rounded-xl` (controls, inputs, buttons) and `rounded-2xl` (cards,
  modals). Nothing sharper — soft and approachable.
- **Shadows:** very subtle only — `shadow-xs` on cards, `shadow-sm` max (floating
  controls). No heavy elevation.
- **Motion:** 150–200ms (`transition duration-150`); honors `prefers-reduced-motion`.
- **Whitespace:** large cards (`p-6`), breathable layouts, reduce borders where
  a background shift is enough.
- **Never:** gradients (unless nearly invisible), glassmorphism, neumorphism.

## Icons

**Lucide only** (`@lucide/svelte`), outline style, consistent stroke.
Import per icon: `import Plus from "@lucide/svelte/icons/plus";`
Sizes: 15–16 inside buttons/nav, 18–20 standalone. Money-flow icons follow the
semantics above (expense icon red, income green, transfer neutral).

## Charts

Keep charts simple — mostly shades of green, no rainbows.

| Series      | Color                 |
| ----------- | --------------------- |
| Income      | `income` (green-500)  |
| Expenses    | `expense` (red-500)   |
| Investments | `brand-700`           |
| Goals       | `warning` (amber-500) |

Grid lines / axis text use `var(--app-edge)` / `ink-muted` so charts follow the theme.
(Category colors are user data from the API and are rendered as chosen.)
