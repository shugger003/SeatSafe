# Toilet seat sanitizer store

A mobile-first storefront and administrator dashboard for a physical toilet seat sanitizer. The business name, product specifications, prices, policies, and claims are editable. Until they are replaced, the site uses clearly marked placeholder copy and does not invent certifications, reviews, or delivery promises.

## Architecture

- **Next.js App Router** renders the public site and keeps payment, inventory, and administrator actions on the server.
- **Supabase Postgres** stores products, orders, content, and inquiries. The server uses the service role. Anonymous and signed-in browser roles have no table access.
- **Moolre** is the payment provider when `MOOLRE_API_USER`, `MOOLRE_API_PUBKEY`, `MOOLRE_ACCOUNT_NUMBER`, and `MOOLRE_WEBHOOK_SECRET` are set. The server verifies every transaction. A browser redirect is not treated as proof of payment.
- **Administrator sessions** are signed cookies. There is no public registration route.
- **Email** uses Resend when configured. Otherwise the order is saved and the confirmation page says that email was not sent.

Stock reservation, payment updates, and restocking run inside database functions so two checkouts cannot sell the same unit. The service role key stays on the server and must not be placed in a git-tracked file.

## What you need to supply before launch

- Business name, legal name, logo, and contact details
- Verified product name, description, price, SKU, images, and instructions
- Delivery methods and fees
- Moolre username, public API key, account number, and callback secret from the merchant account
- A public site URL
- Reviewed shipping, returns, privacy, and terms text
- Administrator email and password hash
- Email sending credentials, if customers should receive email
- Analytics ID, only if you want analytics and have decided on consent

Do not publish draft benefits, use cases, or FAQs until the wording is supported.

## Installation

Requires Node.js 24.

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`. Generate the administrator password hash:

```bash
npm run admin:hash
```

Put the printed `ADMIN_PASSWORD_HASH` in `.env.local` with `ADMIN_EMAIL` and a long `SESSION_SECRET`.

## Local development

```bash
npm run dev
```

Open `http://localhost:3000`. The dashboard is at `http://localhost:3000/admin`.

The first launch creates the database and a coming-soon placeholder product named “Product name”. It is not for sale.

## Environment

See `.env.example`. Variable names only belong in git. Real keys belong in `.env.local` or the host’s secret store.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL and Moolre redirect |
| `SUPABASE_URL` | Supabase project URL, server only |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key. Never expose it to the browser |
| `SESSION_SECRET` | Signs the admin cookie |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH` | Administrator sign-in |
| `MOOLRE_API_USER` / `MOOLRE_API_PUBKEY` / `MOOLRE_ACCOUNT_NUMBER` / `MOOLRE_WEBHOOK_SECRET` | Server-side Moolre calls and callback checks |
| `PAYMENTS_MODE` | `test` enables the local simulator outside production |
| `RESEND_API_KEY` / `EMAIL_FROM` | Customer and admin email |
| `NEXT_PUBLIC_ANALYTICS_ID` | Optional GA4 ID, loaded only after consent |

`ADMIN_PASSWORD` works only when `NODE_ENV` is not `production`. Prefer the hash.

## Database

The first server read writes the placeholder settings and the coming-soon product when the settings row is missing. Tables cover products, orders, order events, payment events, discount codes, inquiries, an audit log, and JSON settings for homepage content.

Uploaded images live in `data/uploads`. Back up the Supabase project from its dashboard.

## Authentication

1. Set `SESSION_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD_HASH`.
2. Sign in at `/admin/login`.
3. A missing or invalid session is redirected away from `/admin`.
4. Server actions check the session again. Changing data in the browser cannot grant access.

## Payments

Checkout sequence:

1. The customer submits contact and delivery details.
2. The server reloads products, stock, discounts, and delivery fees.
3. It creates a pending order and reserves stock.
4. Moolre is given a one-time payment link for the server total, or the local test screen is used.
5. After the customer returns, and again on a signed webhook, the server calls Moolre’s status endpoint.
6. The order becomes `paid` only when the verified amount and currency match.
7. A failed, cancelled, or expired payment returns the reserved stock.
8. The same verification can arrive twice. The second one does not deduct stock again.

Webhook URL: `https://seatshieldghana.com/api/moolre/webhook`

In the Moolre dashboard, set that address as the payment callback URL. The route checks the callback `secret` and then verifies the transaction with Moolre.

`PAYMENTS_MODE=test` shows a page that can mark a test order successful, failed, or cancelled. It is disabled when `NODE_ENV` is `production`. It does not talk to Moolre and must not be described as a real charge.

If the Moolre values are missing, checkout explains that payment is not configured and does not create a paid order.

Customers pay with MTN, Telecel, or AirtelTigo on Moolre’s page. This site does not store wallet PINs.

## Products and orders

In the dashboard:

- Create and edit products, prices, stock, options, and publication status.
- Upload images after the product exists. Until then, the storefront shows a labeled placeholder, not a fake photograph.
- Open orders, filter them, add notes, tracking, and fulfillment status.
- Fulfillment is available after a verified payment or an audited reconciliation.
- Reconciliation records an external reference and a reason. It does not count as verified revenue and cannot flip an order to `paid`.

Prices are stored in minor units (pesewas for GHS). The forms ask for normal amounts such as `25.00`.

Pending orders hold stock for the configured reservation window, 30 minutes by default. Expired unpaid orders return stock.

## Content

The Content screen edits the announcement, homepage, benefits, steps, use cases, FAQs, about page, policies, and campaign URLs (`/c/your-slug`).

Unpublished entries are hidden. Policy pages that are not marked reviewed show that they are drafts.

## Images and video

- Product images: product edit screen, JPEG, PNG, WEBP, or GIF, up to 5 MB.
- Video: paste an MP4, WEBM, YouTube, or Vimeo URL on the homepage content form. The player uses `preload="none"` or a lazy iframe.
- Logo: paste an image URL in settings, or leave it empty and the wordmark is the business name.

## Deployment

1. Use Node.js 24 on a host with a persistent disk.
2. Set every production variable in the host, not in git.
3. Production canonical is `https://seatshieldghana.com`. Set `NEXT_PUBLIC_SITE_URL` only for local or preview work.
4. Set the four Moolre values from the live merchant account when you are ready to charge customers.
5. Do not set `PAYMENTS_MODE=test` in production.
6. Point the domain at the host and confirm `https`.
7. Register `https://seatshieldghana.com/api/moolre/webhook` as the Moolre callback URL.
8. Run `npm run build` and `npm start`, or the host’s equivalent.
9. Sign in, replace placeholder content, publish a priced product, add delivery, then place a small live Moolre payment before taking customer orders.

This repository does not deploy itself and is not connected to a host, domain, or Moolre account until you do that.

## Production checks

- Homepage, shop, and product pages render with placeholder or published content.
- Cart quantities and the server quote match.
- Checkout rejects a missing name, email, phone, or address.
- An unpublished or out-of-stock product cannot be ordered.
- A successful test payment (non-production) or a verified Moolre payment shows the paid state once.
- A failed or cancelled payment does not stay paid and returns stock.
- Repeating the webhook does not reduce stock again.
- `/admin` redirects when signed out.
- A content edit appears on the storefront.
- Order pages use an unguessable token, not a sequential number.

## Backup and maintenance

- Copy `data/store.db` and `data/uploads` on a schedule.
- Keep Moolre and email secrets rotated through the host, not through the database.
- Review low-stock items on the dashboard.
- Verified revenue is the sum of orders with payment status `paid` only.

## Scripts

```bash
npm run dev
npm run test
npm run lint
npm run build
npm run admin:hash
```
