# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Tabacaria do Muleta** — single-tenant web shop where the customer places an order on the site and the payload is delivered to the shop owner over WhatsApp. Orders are persisted in Supabase so customers can see their open order and history; the owner closes orders from an admin panel.

Stack: **Next.js 15 (App Router) · React 19 (RC) · TypeScript · Tailwind v3 · Supabase (Auth + Postgres + Storage) · Vercel**.

## Commands

```
npm install         # first time
npm run dev         # dev server on :3000
npm run build       # production build
npm start           # serve the build
npm run lint        # next lint
```

No test suite is configured.

## First-time setup (essential — none of this is automated)

1. Supabase project → **Authentication → Providers → Email → disable "Confirm email"**. The app assumes signup gives an immediate session.
2. **Run `supabase/schema.sql` in the SQL Editor.** It creates tables, RLS, the `is_admin()` SECURITY DEFINER function, the `products` Storage bucket and its policies.
3. `.env.local` (already in `.gitignore`) needs the project URL **without** the `/rest/v1/` suffix and the publishable/anon key:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
   ```
   The **secret key** is never used — RLS does all access control.
4. There is no admin signup flow. To promote a user, run:
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'EMAIL');
   ```
5. README.md contains the long-form walkthrough.

## Architecture you need to know to be productive

### Order lifecycle (the central flow)

`Checkout → DB row + WhatsApp deeplink → customer waits → admin closes`.

- `/checkout` (client component, `checkout-form.tsx`) inserts an `orders` row + `order_items`, then opens `wa.me/<phone>?text=<msg>` built by `src/lib/whatsapp.ts`. The shop never receives orders via the site — it receives them via WhatsApp, but the DB is the source of truth for status.
- Statuses: `em_aberto` (default) → `entregue` or `cancelado`. Both terminal statuses are set by the admin only; customer can only flip `customer_confirmed` boolean while `status='em_aberto'`.
- `/meu-pedido` shows the customer's open orders + collapsible history.
- `/admin` lists open orders; "Confirmar entrega" / "Cancelar" set status + `closed_at`.

### Supabase access layer (`src/lib/supabase/`)

Three clients, one per execution context. Use the right one:

- `server.ts` (`createClient`) — **async**, used in Server Components, route handlers, server actions. Reads cookies via `next/headers`.
- `client.ts` (`createClient`) — used in `"use client"` components. Uses `document.cookie`.
- `middleware.ts` (`updateSession`) — wired in `src/middleware.ts`, refreshes the session cookie on every non-static request.

### Auth flows: the non-obvious bits

Both signed-in writes to the cookie and the server's view of the session involve cookies that **client-side `signOut`/`signIn` cannot fully control**. So:

- **Logout** must go through `POST /auth/logout` (route handler) so the server-side client clears the cookies, then do `window.location.href = "/"`. Calling only the browser `signOut` leaves the server still "authenticated".
- **Login and signup** end with `window.location.href = next` (hard reload). `router.refresh() + router.push()` is unreliable because the Header is a Server Component in the root layout and doesn't always re-render with the new session immediately.
- Pattern: `user-menu.tsx` (logout), `app/login/page.tsx`, `app/cadastro/page.tsx` all follow this.

### RLS and the `is_admin()` function

Policies on `profiles` that contain `exists (select … from profiles …)` cause RLS recursion that silently returns `null` even when the first OR branch should pass. **Always use `public.is_admin(auth.uid())`** (declared in `schema.sql`, `SECURITY DEFINER`) instead of inlining the admin check. This affects every table where admins can read/write across users.

If a logged-in user sees blank data that the DB has, RLS recursion is the prime suspect.

### Color tokens are remapped — the names lie

`tailwind.config.ts` declares colors `ink-*`, `gold-*`, `cream-*`, `wood-*`. **The hex values do not match the names.** The theme is currently dark mode with neon-lime accent:

- `bg-ink-900` → near-black page background, not "ink"
- `text-cream-100` → off-white text, not cream
- `text-gold-500` / `bg-gold-600` → **neon lime green** (`#c6ff3d` / `#a3d829`), not gold
- `wood-*` → purple secondary accent

Components across the app use these class names everywhere. **Re-skinning the site is done by editing only `tailwind.config.ts` + `src/app/globals.css` + the fonts in `src/app/layout.tsx`** — do not rename classes throughout the codebase. The repo has been re-skinned three times this way (premium dark, vintage retro, then current neon).

Component classes that depend on this convention: `.btn-gold`, `.btn-ghost`, `.btn-danger`, `.card`, `.divider-gold`, `.stamp`, `.stamp-outline`, `.stamp-purple`, `.stamp-oxblood` (all in `globals.css`).

### Server / Client module boundary gotcha

Exporting `as const` arrays or other non-primitive values from a `"use client"` file and importing them in a Server Component breaks at runtime (the array arrives as `{}` and `.find()` throws). Pattern used in this repo: put shared constants in a **neutral module** (no `"use client"`), import from both sides. See `src/app/produtos/sort.ts` (neutral) vs `sort-select.tsx` (client).

### Cart

`src/lib/cart.ts` — `localStorage`-backed store using `useSyncExternalStore`. No Supabase, no server. Cleared by `clearCart()` after a successful checkout insert.

### Image uploads

Product photos go to the public `products` Storage bucket. Upload is done client-side in `admin/produtos/product-form.tsx` using the browser client + RLS (the bucket's insert policy gates by `is_admin()`). `next.config.ts` allow-lists the Supabase host derived from `NEXT_PUBLIC_SUPABASE_URL` for `next/image` (the app currently uses plain `<img>` tags anyway).

## Conventions

- All UI copy and identifiers are in **Portuguese (BR)** (`/produtos`, `/carrinho`, `/meu-pedido`, `/cadastro`, etc.). Keep new pages/labels in Portuguese.
- Money is stored everywhere as **integer cents** (`price_cents`, `subtotal_cents`, etc.). Format only at the edge with `formatBRL()` in `src/lib/format.ts`.
- Phones are stored as digits-only strings; `digitsOnly()` and `formatPhone()` helpers exist.
- Age validation (18+) is in `ageFrom()` and only enforced at signup/profile update — there is no separate age-gate modal.
- Order item rows snapshot `product_name` and `unit_price_cents` so a later product edit/delete doesn't corrupt closed orders.

## Things that don't exist (don't invent them)

- No tests, no Storybook, no Playwright.
- No `service_role` usage anywhere.
- No email confirmation, no password reset flow, no OAuth.
- No payment gateway — Pix is just a static key shown in the WhatsApp message; settlement happens off-site.
- No multi-shop / multi-tenant support — the `settings` table is a single row with `id=1`.
