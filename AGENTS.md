# AGENTS.md — Kens.lk

## Project

Kens.lk is a web app for a bookshop chain (13 branches, "Leeds International School", Sri Lanka) selling curriculum Books, Past Papers, Stationery, and discounted "Offer" bundles (books and/or stationery, grade-specific) to students KG1–Grade 12. Customers browse, order, and either pay online for delivery or reserve for in-branch collection. One admin manages the entire chain.

## Tech stack — use exactly this, no substitutions

- Next.js 14, App Router, TypeScript, React 18
- Tailwind CSS v3 + shadcn/ui components + lucide-react icons. **shadcn CLI must be pinned to `shadcn@2.3.0`** for both `init` and `add` — later versions default to Tailwind v4 scaffolding (CSS-first `@theme` config, OKLCH colors), which is incompatible with our locked Tailwind v3 setup. Never run `shadcn@latest`.
- Auth: NextAuth.js v5 (Auth.js), Credentials provider, JWT sessions, bcryptjs for hashing
- DB: PostgreSQL hosted on Supabase. Two connection strings: `DATABASE_URL` (Transaction Pooler / pgBouncer, port 6543) for normal app queries; `DIRECT_URL` (Session Pooler, port 5432) for Prisma Migrate **and for any script using `upsert()`** — pgBouncer transaction mode does not support the prepared statements `upsert()` requires. Plain `create`/`update`/`findMany` work fine on `DATABASE_URL`.
- ORM: Prisma (schema.prisma is the source of truth; use Prisma Migrate). Run `npx prisma generate` after every schema change, even ones that seem client-independent — a stale generated client causes `Property 'x' does not exist` errors that look like a code bug but aren't.
- Images: Cloudinary (signed upload from the client, never proxy image bytes through our server)
- Payments: PayHere (Sri Lanka gateway, LKR). Sandbox first, hosted-checkout redirect model. Card data never touches our server — PayHere handles it, we only receive a webhook callback.
- Email: Resend + React Email for templates
- Validation: Zod schemas, shared between client (React Hook Form via `@hookform/resolvers/zod` + shadcn `Form`/`FormField` primitives) and API routes
- Cart state: Zustand — see Cart rules below
- Charts: Recharts (admin dashboard only)
- Hosting: Vercel
- Tooling: ESLint + Prettier + Husky pre-commit

## Folder structure

```
app/(storefront)/...        customer-facing pages
app/admin/login/            admin login — public, outside the protected route group
app/admin/(protected)/...   admin portal pages — everything else under /admin, wrapped in the sidebar layout + auth guard
app/api/...                  API routes
components/                  shared UI components
lib/                         db client, auth config, validation schemas, email templates
prisma/schema.prisma
```

`/admin/login` must live outside the `(protected)` route group, not just be excluded by a runtime check — a shared layout wraps every route nested beneath it with no automatic exception, so if login sits inside the same folder as the protected layout it will inherit that layout's sidebar UI even before any auth logic runs.

## User types — exactly 3, no more

1. **Registered customer** — fields: name, email, password (hashed), address, school branch, phone.
2. **Guest customer** — no account. At checkout: name, email (MANDATORY, never optional), phone, plus address (delivery) or branch (collect).
3. **Admin** — exactly ONE account for the whole chain. No roles, no permissions system, no per-branch admins. Do not build role-based access control — a single `isAdmin` boolean/claim on the session is sufficient. Admin login is a separate route (`/admin/login`) with its own dark-navy themed UI, distinct from the customer site, and must never render the admin sidebar.

## Database entities (Prisma)

`users`, `products` (category enum: book | past_paper | stationery, with shared + type-specific fields — stationery's `type` field, e.g. Pens/Pencils/Erasers/Rulers/Highlighters/Markers/Calculators/Folders/Other, is a real filterable column, not inferred from the product name), `bundles`, `bundle_items` (join table linking a bundle to existing products — `product_id` is a generic FK to `products`, not restricted to a single category), `orders` (nullable user_id for guests, guest_name/email/phone, fulfilment_type, branch_id, delivery_address, status, total_amount), `order_items`, `branches` (13 rows, seeded), `admin` (single row).

## Product fields by category

- **Book**: name, photo, price, stock_qty, ISBN, product_code, author, grade, subject, availability
- **Past paper**: photo, name, price, stock_qty, grade, subject, product_code, availability
- **Stationery**: photo, name, price, stock_qty, brand, type (one of the 9 fixed values above), product_code, availability
- **Bundle**: name, photo, price, product_code, grade, availability, plus a list of linked existing products (bundle_items). **Admin selects existing books AND/OR stationery items** to build a bundle — never creates new products inline. Past Papers are NOT selectable for bundles (unconfirmed whether this should change — see Guardrails). The grade picked for the bundle filters the books subset of the picker only; stationery has no grade and should appear ungated by grade, filterable instead by brand/type. When displaying bundle contents (admin summary panel and the storefront bundle detail page), render fields conditionally by category — books show grade/subject/author, stationery shows brand/type — rather than assuming every item is a book.

## Storefront filtering & search

- Books: filter by grade, subject, author, A–Z sort — all combinable simultaneously.
- Past papers: filter by grade, subject — combinable.
- Stationery: filter by brand, type, price sort (low↔high) — combinable.
- Global search bar (in the navbar, present on every page): searches Books + Past Papers + Stationery together in one query, results grouped by category on a single results page.

## Cart — critical rule, do not deviate

The cart is **session/cookie-based only**. It must **never** be persisted to the database and must **never** be tied to a user's account. Use Zustand with `persist` targeting `sessionStorage`, not `localStorage`. Logging in on a different device or a new browser session must always show an empty cart — there is no cross-device cart sync and no cart restoration on login. This is intentional, not a gap to fix.

## Checkout — two fulfilment paths, both must support guest and registered

1. **Card payment + delivery**: customer enters/confirms delivery address, pays online via PayHere hosted checkout. On successful webhook callback: create the order (status `Processing`), decrement stock, send confirmation email.
2. **Collect at branch**: customer selects one of the 13 branches. No online payment. Order is created immediately (status `Awaiting collection`), stock is decremented, confirmation email is sent. Customer pays cash in person at the branch.

Guest checkout requires email as a mandatory field in both paths — validate this explicitly, never allow an empty guest email to reach the order-creation step.

## Order status flow — all transitions are MANUAL, admin-driven. Do not build any cron/automation for status changes in this MVP.

- Delivery path: `Processing` → `Dispatched` → `Delivered`, or → `Cancelled` at any point.
- Collect path: `Awaiting collection` → `Collected`, or → `Cancelled` (admin cancels manually after being told by branch staff the customer didn't show up within 7 days — there is no automatic timer).
- Cancelling an order (either path) automatically restores the decremented stock back to the shared pool. This restoration IS automated — only the cancellation trigger itself is manual.

## Stock

Single shared pool across all 13 branches — there is no per-branch inventory. Auto-decrement on order creation, applied per line item — when the line item is a bundle, decrement stock for every product inside it individually (every book AND every stationery item, not books only). Auto-restore on cancellation, same per-item scope. Admin can also manually edit stock_qty from the product edit screen at any time.

## Transactional emails — exactly two triggers, no others

1. **Order placed** (either fulfilment path, registered or guest): send immediately on order creation. Full receipt — order ID, items, quantities, prices, total, fulfilment details.
2. **Order dispatched**: send only when admin manually changes a **delivery-path** order's status to `Dispatched`. Collect-at-branch orders never get a second email in the MVP — do not send anything when a collect order is marked `Collected`.

Use Resend + React Email components for both templates.

## Admin portal — single account, no roles

Dashboard (4 metric cards: Total orders, Delivered orders, Registered users, Awaiting collection — first 3 are clickable and navigate to filtered views; sales graph via Recharts with Day/Week/Month/Year/5 Years toggle), Orders (list + detail, manual status dropdown, triggers dispatch email when applicable), Books/Past Papers/Stationery (CRUD, matching field lists above), Offers (bundle builder — select existing books and/or stationery items, set bundle price, live "you save" calculation against summed individual prices), Registered Users (list + activate/deactivate toggle, no delete), About Us editor (13 branch cards, inline-editable: name, address, phone, email, hours).

## Design system

- Primary purple `#534AB7`, secondary blue `#185FA5`.
- Admin portal: light theme, sidebar `#F8F8F8`, teal `#0F6E56` accents. Admin login page only: dark navy `#1A1A2E` theme, visually distinct from the rest of the app.
- Offers/bundles: amber `#854F0B` accent.
- In-stock/success: green `#27500A`. Out-of-stock/errors: red.

## Explicitly OUT of MVP scope — do not build these unless asked

Customer order-history page, automated cancellation timer/cron, product reviews, SMS notifications, discount/promo codes, per-branch stock tracking, wishlists, multiple admin accounts or roles, multi-language support, PWA/offline support, cart sync across devices.

## Guardrails

- Never store raw card data — PayHere hosted checkout only.
- Never write cart data to the database.
- Never build a second admin role or permission tier.
- Never send a dispatch email for a collect-at-branch order.
- Never let a guest checkout proceed without a validated email.
- Always wrap stock decrement/restore + order write in a single DB transaction to prevent overselling — including every item inside a bundle, not just the bundle row itself.
- Never allow Past Papers to be added to bundles without explicit confirmation from the business first — this was raised and left unresolved when bundles were expanded from books-only to books-and-stationery (v1.1).
- Never run `shadcn@latest` — always the pinned `shadcn@2.3.0` (see Tech stack).
- The browser-automation/screenshot tool does not work in this environment (Playwright driver download consistently 404s, confirmed across multiple attempts). Do not retry it repeatedly when it fails — ask the developer to manually verify visual/runtime behavior in their own browser instead.
- Treat a passing `npm run build` as necessary, not sufficient — this project has repeatedly shipped code that compiled cleanly but failed against real data (empty seed tables, an auth redirect loop, a bundle scope mismatch). Confirm new functionality against real seeded data in an actual browser, not just a clean build, before considering any piece of work done.
