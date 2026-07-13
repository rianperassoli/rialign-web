# Rianganizze Web

SvelteKit (Svelte 5) frontend for the Rianganizze personal-finance API.
TypeScript (strict) · Tailwind CSS v4 · SSR · Vitest · Playwright.

> **Design system:** colors, theming (light/dark/system), button semantics and
> icon rules are documented in [DESIGN.md](./DESIGN.md). Read it before
> touching any UI.

## Requirements

- Node 20+ (developed on Node 22)
- The Rails API (`rianganizze-api`) running on `http://localhost:3000`

## Getting started

```bash
cd rianganizze-web
cp .env.example .env        # API_URL defaults to http://localhost:3000
npm install
npm run dev                 # http://localhost:5173
```

Make sure the API is up (`cd ../rianganizze-api && docker compose up`) and seeded.
Log in with the demo user: `demo@rianganizze.com` / `password123`.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server |
| `npm run build` / `npm run preview` | Production build / preview |
| `npm run check` | `svelte-check` type checking |
| `npm run test` | Vitest unit tests |
| `npm run test:e2e` | Playwright E2E |
| `npm run lint` / `npm run format` | Prettier + ESLint |

## How it works

### Auth & the API proxy (the key design decision)

The JWT is stored in an **httpOnly cookie**, so it is never exposed to client
JS. A catch-all proxy route — `src/routes/api/v1/[...path]/+server.ts` — forwards
every `/api/v1/*` call to the Rails API with the token attached as a Bearer
header.

This makes the API client **isomorphic**: it always calls the relative path
`/api/v1/...`, which works identically in SSR `load` functions and in the
browser. Benefits:

- Token stays server-side (XSS can't read it).
- One client, one code path — no separate "server client" vs "browser client".
- SSR `load` functions fetch real data on the server for fast first paint.

`hooks.server.ts` reads the cookie into `locals.token`; the proxy uses it.
Login/register/logout are **form actions** (`+page.server.ts` / `logout/+server.ts`)
that set/clear the cookie — the only places that touch the token directly.

### Data flow

- **SSR first:** each page's `+page.server.ts` `load` fetches initial data via
  the API client using SvelteKit's `fetch` (cookies forwarded). No client
  re-fetch on first render.
- **Reactive after:** Svelte 5 **runes** composables (`$lib/composables/*.svelte.ts`)
  take the SSR data as their seed and own subsequent filtering, pagination and
  mutations — with **optimistic updates** (e.g. deleting a transaction/account
  removes it immediately and rolls back on error).

### Project layout

```
src/
  lib/
    api/         client.ts (isomorphic, retry + ApiError), types.ts (API contract)
    composables/ useAuth, useTransactions, useDashboard, useAccounts (runes)
    components/  ui/ (Button, Input, Select, Card, Modal, Skeleton, Badge)
                 finance/ (StatCard, AccountCard, TransactionList/Row/Form, TransferForm)
                 layout/ (Navbar, ThemeToggle)
    server/      rails.ts (env, cookie helpers — server only)
    utils/       formatting.ts (currency/date/mask + parseMoney)
  routes/
    api/v1/[...path]/  proxy to Rails
    (auth)/            login, register (centered layout)
    (app)/             dashboard, transactions, accounts (guarded + navbar)
    logout/            POST endpoint
```

### Notes

- **Money is sent as strings** by the API (decimal precision). `parseMoney`
  converts for arithmetic; `formatCurrency` renders it.
- Aliases: `$components`, `$composables`, `$api`, `$utils` (see `svelte.config.js`).
- `API_URL` is server-only and never bundled into client code.

## Features

- Authentication (login / register / logout)
- Dashboard: consolidated balance, monthly totals, forecast, accounts, cards
- Transactions: SSR list + search/type/status filters, pagination, create modal,
  optimistic delete
- Accounts: list with total, create modal, optimistic archive
- Skeleton loaders, error boundary (`+error.svelte`), loading states
