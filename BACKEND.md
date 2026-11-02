# Backend guide — Rebel Fashion marketplace

Hi! 👋 This document is for the backend developer who connects a real server to this frontend.

Rebel Fashion is a **general fashion marketplace**: the platform sells its own products (kaftans for now, more
categories later) and approved independent sellers list any clothing, shoes, bags or accessories. The frontend is
finished and runs today on a **mock store kept in the browser**. Your job is to build the API that returns the same
JSON shapes, then flip one environment variable.

**Primary path: Next.js API routes in this same app ("http" mode), with a database of your choice.**
Create Route Handlers under `src/app/api/v1/…` (Postgres, MySQL, MongoDB, Prisma, Drizzle… your call), set
`NEXT_PUBLIC_API_MODE=http` and `NEXT_PUBLIC_API_BASE_URL=/api/v1`. `src/lib/api/http.ts` already calls every
endpoint in section 3. A separate server works the same way (use its full URL as the base).

Supabase is **optional** (appendix A). You never need to touch a React component: everything goes through one file.

Payments use **Fairsure** (https://fairsurepay.com, docs https://docs.fairsurepay.com/), see section 5.

---

## 1. How the frontend is organised

```
src/lib/
├── config.ts          ← SITE_NAME, CATEGORIES, PLATFORM_COMMISSION_PERCENT (10), shipping rates, env switches, Fairsure public settings
├── types.ts           ← every domain type (Product, Seller, Order, CheckoutInit, …). Your JSON must match these.
├── categories.ts      ← category helpers (counts, non-empty list, links)
├── seed-data.ts       ← the platform's own 30 kaftans ("Sold by Rebel Fashion", category "kaftans")
├── payments/
│   └── fairsure.ts    ← browser-only: loads the Fairsure inline script and opens the modal (public key only)
├── image-utils.ts     ← pure photo helpers (size limits, reorder, chips) — unit-tested
├── image-compress.ts  ← browser photo compression (max 1200px WebP, JPEG fallback, q 0.8; low-memory decode)
├── commission.ts      ← how a line is split between seller and platform
└── api/
    ├── contract.ts    ← the DataApi interface: the full list of operations
    ├── index.ts       ← picks the implementation from NEXT_PUBLIC_API_MODE and re-exports every function
    ├── mock.ts        ← default implementation (localStorage + seed-data.ts)
    ├── http.ts        ← REST implementation: fetch() calls to the endpoints in section 3 (already written)
    └── supabase.ts    ← optional, not written (appendix A)
```

Components only ever do `import { getProducts } from "@/lib/api"`. They never call `fetch` or `localStorage`
for domain data. Build the endpoints below and the whole UI just works.

### Switching from mock to real

`NEXT_PUBLIC_API_MODE` picks the implementation (set it in `.env.local`, and in Vercel → Project → Settings → Environment Variables):

| `NEXT_PUBLIC_API_MODE` | Implementation | Notes |
|---|---|---|
| `mock` (default) | `mock.ts` | Browser-only demo store. Nothing is shared between visitors. |
| **`http`** (primary) | `http.ts` | Set `NEXT_PUBLIC_API_BASE_URL=/api/v1` for Route Handlers in this app, or `https://api.your-domain.com/api/v1` for a separate server (no trailing slash). |
| `supabase` (optional) | `supabase.ts` | Add the file first (appendix A). Until then the app logs a warning and falls back to the mock. |

Backward compatible: if `NEXT_PUBLIC_API_MODE` is not set, `NEXT_PUBLIC_USE_MOCK_API=false` still means `http`.

### Building it as Next.js Route Handlers (recommended)

```
src/app/api/v1/
├── products/route.ts                      GET    /products
├── products/[slugOrId]/route.ts           GET    /products/:slugOrId
├── categories/route.ts                    GET    /categories
├── sellers/signup/route.ts                POST   /sellers/signup
├── sellers/login/route.ts                 POST   /sellers/login
├── sellers/me/…                           GET/POST (listings, orders)
├── uploads/route.ts                       POST   /uploads
├── admin/…                                admin routes
├── orders/route.ts                        POST   /orders            ← checkout init (section 5.2)
├── orders/[reference]/route.ts            GET    /orders/:reference
├── orders/[reference]/confirm/route.ts    POST   /orders/:reference/confirm  ← verify payment (5.3)
└── payments/fairsure/webhook/route.ts     POST   Fairsure webhook   ← (5.4)
```

Route Handlers run on the server, so they can read server-only env vars (`FAIRSURE_PRIVATE_KEY`, `DATABASE_URL`).
Note that in Next.js 16 dynamic `params` are a Promise: `export async function GET(req: Request, { params }: { params: Promise<{ reference: string }> }) { const { reference } = await params; … }`.
When the API lives in this app you can delete the mock route `src/app/api/checkout/route.ts` and unset `MOCK_PAYMENTS`.

---

## 2. General rules

- **JSON everywhere.** `Content-Type: application/json`, except image upload (multipart).
- **Money is whole Naira** (integers, e.g. `48000` = ₦48,000). Fairsure also takes Naira (major units), so no kobo conversion.
- **Dates** are ISO 8601 strings (`"2026-10-29T14:03:00.000Z"`).
- **IDs** are strings. Any format is fine (UUID, cuid, …).
- **Errors:** return a non-2xx status with `{ "error": "Human readable message" }`. The message is shown to the user as-is.
  - `400` validation, `401` not logged in / bad token, `403` not allowed, `404` not found, `409` conflict (email taken, price changed).
- **CORS:** only needed if the API is on another domain: allow the frontend origin and the `Authorization` header.
- **Never trust the browser** for prices, totals, commission, listing status or payment status. Always recompute from your database and verify payments with Fairsure.

### Authentication

| Who | How they log in | What the frontend sends afterwards |
|-----|-----------------|------------------------------------|
| Seller | `POST /sellers/login` or `POST /sellers/signup` → `{ token, seller }` | `Authorization: Bearer <token>` |
| Admin | `POST /admin/login` → `{ token, email, name }` | `Authorization: Bearer <token>` |
| Shopper | No account (guest checkout) | nothing |

- The token can be a JWT or an opaque session id — the frontend only stores it (in `localStorage`) and sends it back.
- Seller tokens must **never** work on `/admin/*` routes. Keep a `role` claim (`seller` / `admin`).
- When a token is expired/invalid, return **401**; the frontend clears it and sends the user to the login page.
- Hash passwords with bcrypt/argon2. Rate-limit the login routes.
- The admin login in `config.ts` (`ADMIN_DEMO_CREDENTIALS`) is **only** used by the mock and is never shown in the UI. Create real admin users in your database.

---

## 3. Endpoint reference

Base URL = `NEXT_PUBLIC_API_BASE_URL` (e.g. `/api/v1`). "Auth" column: — = public, **S** = seller token, **A** = admin token.

| # | Method | Path | Auth | Request body | Response | Frontend function |
|---|--------|------|------|--------------|----------|-------------------|
| 1 | GET | `/categories` | — | – | `CategorySummary[]` (all 9, with approved counts) | `getCategories` |
| 2 | GET | `/products?gender=&category=&search=&seller=&ids=` | — | – | `Product[]` (**approved only**) | `getProducts` |
| 3 | GET | `/products/:slugOrId` | — | – | `Product` or 404 (approved only) | `getProduct` |
| 4 | POST | `/sellers/signup` | — | `SellerSignupInput` | `{ token, seller: Seller }` | `createSeller` |
| 5 | POST | `/sellers/login` | — | `{ email, password }` | `{ token, seller: Seller }` | `loginSeller` |
| 6 | POST | `/sellers/logout` | S | – | `{ ok: true }` | `logoutSeller` |
| 7 | GET | `/sellers/me` | S | – | `Seller` | `getCurrentSeller` |
| 8 | GET | `/sellers/me/listings` | S | – | `Product[]` (all statuses, newest first) | `getSellerListings` |
| 9 | POST | `/sellers/me/listings` | S | `NewListingInput` | `Product` with `status: "pending"` | `createListing` |
| 10 | POST | `/uploads` | S | multipart, field `file` | `{ url: string }` | `uploadListingImage` |
| 11 | GET | `/sellers/me/orders` | S | – | `SellerOrderView[]` | `getSellerOrders` |
| 12 | POST | `/admin/login` | — | `{ email, password }` | `AdminSession` (`{ token, email, name }`) | `loginAdmin` |
| 13 | GET | `/admin/me` | A | – | `AdminSession` | `getAdminSession` |
| 14 | GET | `/admin/listings?status=pending` | A | – | `Product[]` | `getPendingListings` |
| 15 | GET | `/admin/products` | A | – | `Product[]` (all statuses) | `getAllProducts` |
| 16 | POST | `/admin/listings/:id/approve` | A | – | `Product` (approved) | `approveListing` |
| 17 | POST | `/admin/listings/:id/reject` | A | `{ reason }` | `Product` (rejected) | `rejectListing` |
| 18 | GET | `/admin/sellers` | A | – | `Seller[]` | `getSellers` |
| 19 | GET | `/admin/orders` | A | – | `Order[]` (newest first) | `getOrders` |
| 20 | PATCH | `/admin/orders/:id` | A | `{ status: OrderStatus }` | `Order` | `updateOrderStatus` |
| 21 | GET | `/admin/overview` | A | – | `AdminOverview` | `getAdminOverview` |
| 22 | POST | `/orders` | — | `CreateOrderInput` | `CheckoutInit` `{ orderId, ref, amount, currency, publicKey, narration? }` | `createOrder` / `initCheckout` |
| 23 | POST | `/orders/:reference/confirm` | — | `{ transactionRef? }` | `PaymentConfirmation` `{ status, order, message? }` | `confirmPayment` |
| 24 | GET | `/orders/:reference` | — | – | `Order` or 404 | `getOrderByReference` |
| 25 | POST | `/payments/fairsure/webhook` | `X-Paysure-Signature` | Fairsure event (raw JSON) | `200` within 10 s | *(backend only, section 5.4)* |

`?gender=men` should also return `unisex` items. `?category=` takes one category slug.
All TypeScript shapes are in `src/lib/types.ts`. Examples below.

### 3.1 Examples

**`Product`** (responses #2, #3, #8, #9, #14–#17)

```json
{
  "id": "prd_8f2k1",
  "slug": "charcoal-linen-kaftan",
  "name": "Charcoal Linen Kaftan",
  "description": "A soft washed-linen kaftan with a neat band collar…",
  "category": "kaftans",
  "productType": "Linen kaftan",
  "gender": "men",
  "typeOption": { "label": "Length", "values": ["Short", "Long"] },
  "price": 42000,
  "compareAtPrice": 48000,
  "badge": "New",
  "featured": true,
  "images": ["https://<project>.supabase.co/storage/v1/object/public/product-images/u/abc.jpg"],
  "colors": [
    { "name": "Charcoal", "hex": "#4A4A4A", "image": "https://…/charcoal.jpg" },
    { "name": "Stone", "hex": "#CFC6B5" }
  ],
  "sizes": ["S", "M", "L", "XL"],
  "stock": 40,
  "material": "100% washed linen",
  "fit": "Regular fit with band collar",
  "care": "Machine wash cold",
  "sellerId": "sel_arewa",
  "sellerName": "Arewa Threads",
  "status": "approved",
  "rejectionReason": null,
  "createdAt": "2026-10-01T09:00:00.000Z",
  "updatedAt": "2026-10-02T10:00:00.000Z"
}
```

- `category` is **required** and is one of the fixed slugs in [section 4, Categories](#4-categories) (`"kaftans"`, `"hoodies"`, …). Reject anything else with 400.
- `productType` is an **optional free-text detail** typed by the seller (e.g. `"Oversized shirt"`, `"Ankara tote"`); `""` when not given. Display only; include it in search.
- `gender` is `men | women | kids | unisex`; `unisex` also means "not specified" (the seller form makes gender optional). For `?gender=men`, also return `unisex` items.
- `typeOption` (optional, may be `null`) is the extra **Type** choice shoppers must make before adding to the bag, e.g. `{ "label": "Length", "values": ["Short", "Long"] }` or `{ "label": "Set", "values": ["Top only", "Top + trousers"] }`.
- Every product needs at least one colour and one size; shoppers pick **Type (if any), Colour and Size** and the bag/order line stores all three.
- The platform's own products use `sellerId: "platform"` and `sellerName: "Rebel Fashion"` (`PLATFORM_SELLER_ID` in `config.ts`).
- `sellerName` should be denormalised (or joined) so product cards can show "Sold by …".

**`SellerSignupInput`** (#4 request)

```json
{
  "businessName": "Arewa Threads",
  "ownerName": "Musa Abdullahi",
  "phone": "08030000001",
  "email": "arewa@example.com",
  "password": "at-least-8-chars",
  "bank": { "bankName": "Guaranty Trust Bank", "accountNumber": "0123456789", "accountName": "Arewa Threads Ventures" }
}
```

**`Seller`** (#4, #5, #7, #18) — never return the password or hash

```json
{
  "id": "sel_arewa",
  "businessName": "Arewa Threads",
  "ownerName": "Musa Abdullahi",
  "email": "arewa@example.com",
  "phone": "08030000001",
  "bank": { "bankName": "Guaranty Trust Bank", "accountNumber": "0123456789", "accountName": "Arewa Threads Ventures" },
  "payout": { "status": "active", "reference": "BEN_8f4s1eq7", "provider": "WokPay" },
  "status": "active",
  "createdAt": "2026-09-12T10:00:00.000Z"
}
```

`payout.status` is `not_set_up | pending | active | on_hold`. `reference` / `provider` are free text for display
(e.g. the beneficiary id at your payout provider). The frontend only shows them; never return secrets.

**`NewListingInput`** (#9 request). The listing must be saved with `status: "pending"`, `sellerId` taken from the token (never from the body).

```json
{
  "name": "Oversized Linen Shirt",
  "description": "Relaxed linen shirt with a camp collar. True to size.",
  "category": "t-shirts-shirts",
  "productType": "Oversized shirt",
  "gender": "men",
  "typeOption": { "label": "Sleeve", "values": ["Short", "Long"] },
  "sizes": ["M", "L", "XL", "One size"],
  "colors": [{ "name": "Navy", "hex": "#1D2840", "image": "https://cdn.example.com/u/navy.jpg" }],
  "images": ["https://cdn.example.com/u/front.jpg", "https://cdn.example.com/u/back.jpg"],
  "price": 25000,
  "stock": 10,
  "material": "100% linen"
}
```

`category` is required (one of the slugs). `productType`, `gender` and `typeOption` are optional (omitted gender → store `"unisex"`). `sizes` are free text chips typed by the seller.
`images` order matters: the first one is the cover (sellers can reorder before submitting).

**`SellerOrderView`** (#11) — only the seller's own lines

```json
{
  "orderId": "ord_123",
  "reference": "RF-261024-AB12C",
  "status": "shipped",
  "createdAt": "2026-10-24T11:20:00.000Z",
  "customerName": "Aisha Yusuf",
  "city": "Kaduna",
  "state": "Kaduna",
  "items": [ /* OrderItem[] */ ],
  "grossAmount": 240000,
  "commissionAmount": 24000,
  "sellerAmount": 216000
}
```

**`CreateOrderInput`** (#22 request — sent by the checkout page)

```json
{
  "customer": { "fullName": "Aisha Yusuf", "email": "aisha@example.com", "phone": "08031234567", "address": "12 Ahmadu Bello Way", "city": "Kaduna", "state": "Kaduna" },
  "deliveryLocation": { "latitude": 10.52, "longitude": 7.43 },
  "items": [
    { "productId": "prd_x1", "slug": "oversized-linen-shirt", "name": "Oversized Linen Shirt", "image": "https://…", "type": "Long", "color": "Navy", "size": "XL", "quantity": 1, "unitPrice": 240000, "sellerId": "sel_arewa", "sellerName": "Arewa Threads" }
  ],
  "shippingMethod": "standard",
  "paymentMethod": "card",
  "displayedSubtotal": 240000,
  "displayedShipping": 3500,
  "displayedTotal": 243500
}
```

Backend must: look up each product (must be `approved` and in stock), use **its** price, compute
shipping (`standard` 3500 / `priority` 6500, see `SHIPPING_RATES`), compare with `displayedTotal`
and return **409** `{ "error": "Prices have changed. Please review your bag." }` if they differ.

**`CheckoutInit`** (#22 response — what the browser needs to open the Fairsure modal)

```json
{
  "orderId": "ord_123",
  "ref": "RF-261024-AB12C",
  "amount": 243500,
  "currency": "NGN",
  "publicKey": "TEST_9XYZABCDEFGHIJKLMNOP",
  "narration": "Rebel Fashion order RF-261024-AB12C",
  "order": { /* optional: the Order you just created, status "pending" */ }
}
```

- `ref` must be **unique per payment attempt** (Fairsure calls it `merchant_reference`). Using the order reference is fine;
  every checkout attempt creates a new order, so each attempt has a new ref.
- `amount` is **whole Naira** (Fairsure takes Naira, not kobo), computed from your database.
- `publicKey` is the Fairsure **public** key (`TEST_…` / `LIVE_…`) or `null` (the frontend then uses
  `NEXT_PUBLIC_FAIRSURE_PUBLIC_KEY`). **Never** return the private key.

**`PaymentConfirmation`** (#23 response)

```json
{ "status": "paid", "order": { /* Order */ }, "message": "optional text shown on the success page" }
```

`status` is `paid | pending | failed`. Return `paid` only when **you** confirmed it with Fairsure (section 5).

**`Order`** (#19, #20, #23, #24)

```json
{
  "id": "ord_123",
  "reference": "RF-261024-AB12C",
  "customer": { "fullName": "Aisha Yusuf", "email": "aisha@example.com", "phone": "08031234567", "address": "12 Ahmadu Bello Way", "city": "Kaduna", "state": "Kaduna" },
  "items": [
    {
      "productId": "prd_x1", "slug": "oversized-linen-shirt", "name": "Oversized Linen Shirt",
      "image": "https://…", "type": "Long", "color": "Navy", "size": "XL", "quantity": 1,
      "unitPrice": 240000, "lineTotal": 240000,
      "sellerId": "sel_arewa", "sellerName": "Arewa Threads",
      "commissionPercent": 10, "commissionAmount": 24000, "sellerAmount": 216000
    },
    {
      "productId": "sand-everyday-jalabiya", "slug": "sand-everyday-jalabiya", "name": "Sand Everyday Jalabiya",
      "image": "https://…", "type": "Regular", "color": "Sand", "size": "L", "quantity": 2,
      "unitPrice": 28000, "lineTotal": 56000,
      "sellerId": "platform", "sellerName": "Rebel Fashion",
      "commissionPercent": 0, "commissionAmount": 0, "sellerAmount": 56000
    }
  ],
  "subtotal": 296000,
  "shippingCost": 3500,
  "total": 299500,
  "commissionTotal": 24000,
  "sellerSplits": [
    { "sellerId": "sel_arewa", "sellerName": "Arewa Threads", "grossAmount": 240000, "commissionAmount": 24000, "sellerAmount": 216000 },
    { "sellerId": "platform", "sellerName": "Rebel Fashion", "grossAmount": 56000, "commissionAmount": 0, "sellerAmount": 56000 }
  ],
  "shippingMethod": "standard",
  "paymentMethod": "card",
  "status": "paid",
  "paymentStatus": "paid",
  "paymentReference": "PSR-20261024-00014872",
  "paidAt": "2026-10-24T11:22:00.000Z",
  "createdAt": "2026-10-24T11:20:00.000Z",
  "updatedAt": "2026-10-24T11:22:00.000Z"
}
```

`OrderStatus` = `pending | paid | shipped | delivered | cancelled`. `paymentStatus` (`unpaid | paid | failed`),
`paymentReference` (Fairsure's `transaction_reference`) and `paidAt` are optional but recommended.

Order lines carry `type` (the chosen Type value, `""` when the product has none), `color` and `size`.

**Commission rule** (same as `src/lib/commission.ts`):

```
lineTotal        = unitPrice × quantity
commissionPercent = 0 if sellerId == "platform" else PLATFORM_COMMISSION_PERCENT (10)
commissionAmount  = round(lineTotal × commissionPercent / 100)
sellerAmount      = lineTotal − commissionAmount
```

Shipping goes to the platform (it is not part of any seller's share) unless you decide otherwise.
Store `commissionAmount` and `sellerAmount` on every order line: until Fairsure split payments are set up, these
recorded amounts are what you pay sellers out (section 5.6).

**`AdminOverview`** (#21)

```json
{
  "productCounts": { "approved": 20, "pending": 2, "rejected": 1, "total": 23 },
  "sellerCount": 3,
  "orderCount": 3,
  "gmv": 514000,
  "commissionEarned": 45800,
  "ownStoreRevenue": 56000,
  "sellerPayouts": 412200,
  "ordersByStatus": { "pending": 0, "paid": 1, "shipped": 1, "delivered": 1, "cancelled": 0 }
}
```

GMV = sum of order subtotals; all money figures exclude cancelled orders.

### 3.2 Image uploads (#10)

The "New listing" form uploads each photo **one at a time** before submitting the listing:

- The browser first compresses every photo (`compressImageToFile` in `src/lib/image-compress.ts`, called by
  `http.ts`) to **max 1200px on the longest edge, quality 0.8, as WebP** (`image/webp`, file name `*.webp`), or
  **JPEG** (`*.jpg`) on browsers that can't encode WebP (older Safari). It decodes big phone photos straight to
  that size (no full-resolution bitmap, so mid-range Android phones don't run out of memory), applies EXIF
  rotation, and opens HEIC where the browser can (iPhone Safari). Uploads are therefore small (~100–400 KB).
- `POST /uploads` with `multipart/form-data`, field name **`file`**, seller token required.
- Accept `image/webp`, `image/jpeg` and `image/png`; limit size (e.g. 8 MB).
- Store in Vercel Blob / S3 / Cloudinary / Supabase Storage and return a public HTTPS URL: `{ "url": "https://cdn.example.com/u/abc.jpg" }`.
- The listing body (#9) then contains those URLs in `images` and `colors[].image`.
- Add your storage domain to `images.remotePatterns` in `next.config.ts` so `next/image` can display it.
- In mock mode the compressed photos are stored as data URLs in `localStorage`. If the browser runs out of space
  the mock shrinks the listing's photos once (800px, 0.7) and otherwise shows a friendly "not enough space" message.
- Tests for the photo pipeline: `npm run test:images` (Node's test runner, fake DOM; covers HEIC, fallbacks, sizing, reorder).

---


---

## 4. Categories

A **fixed list** lives in `src/lib/config.ts` (`CATEGORIES`). Every product has exactly one, stored as its slug:

| Slug | Name |
|---|---|
| `kaftans` | Kaftans |
| `hoodies` | Hoodies |
| `jeans` | Jeans |
| `t-shirts-shirts` | T-shirts & Shirts |
| `dresses` | Dresses |
| `shoes` | Shoes |
| `bags` | Bags |
| `accessories` | Accessories |
| `other` | Other |

- `Product.category` is required. Validate it against this list on `POST /sellers/me/listings` (400 otherwise) and
  store it in its own column (index it).
- `GET /products?category=bags` filters by slug.
- `GET /categories` returns **all nine** with their number of **approved** products, in the order above:

```json
[
  { "slug": "kaftans", "name": "Kaftans", "productCount": 30 },
  { "slug": "hoodies", "name": "Hoodies", "productCount": 0 },
  { "slug": "jeans", "name": "Jeans", "productCount": 0 }
]
```

  The navigation ("Shop" dropdown, mobile menu) and the shop's category chips show only categories with
  `productCount > 0`, so a category appears by itself as soon as an admin approves the first listing in it.
  `/category/<slug>` pages exist for every slug; an empty one shows a friendly empty state.
- The 30 platform products all use `kaftans`.
- To add a category later: add it to `CATEGORIES` in `config.ts` and to your validation / DB check constraint.

---

## 5. Payments with Fairsure

Docs: https://docs.fairsurepay.com/ · Dashboard: https://merchant.fairsurepay.com/ (Settings → API keys, Settings → Webhooks).

### 5.0 Keys and environment variables

| Variable | Where | Value |
|---|---|---|
| `FAIRSURE_PRIVATE_KEY` | **server only** | `test_…` / `live_…`. Verifies transactions and webhook signatures. **Never** in the browser, a `NEXT_PUBLIC_*` variable, or git. |
| `FAIRSURE_API_BASE` | server only | `https://sandbox.fairsurepay.com` (test) or `https://api.fairsurepay.com` (live) |
| `NEXT_PUBLIC_FAIRSURE_PUBLIC_KEY` | browser | `TEST_…` / `LIVE_…`. Optional when `POST /orders` returns `publicKey`. |
| `NEXT_PUBLIC_FAIRSURE_ENV` | browser | `sandbox` (default) or `live`. Picks the inline script: `https://checkout-sandbox.fairsurepay.com/js/host/fairsure-checkout-inline.js` or `https://checkout.fairsurepay.com/js/host/fairsure-checkout-inline.js`, and the matching hosted checkout for `window.FAIRSURE_CHECKOUT_CONFIG`. |

All are in `.env.example`. Use test keys with `sandbox`, live keys with `live`; never mix them.

### 5.1 The flow (already built in the frontend)

1. Checkout page → `api.createOrder(input)` (= `initCheckout`) → **`POST /orders`**.
2. Your server creates the order (`pending`) from database prices and returns `CheckoutInit`
   `{ orderId, ref, amount, currency: "NGN", publicKey, narration }`.
3. The browser loads the Fairsure inline script (`src/lib/payments/fairsure.ts`) and calls
   `window.FairsureCheckout.setup({ key: publicKey, email, amount, currency: "NGN", first_name, last_name, phone_number, customerId: email, ref, narration, callback_url, paymentMethod, onSuccess, onError, onClose })`.
   **`paymentMethod`** opens the modal straight on one channel: `"bankCard"` (checkout choice *Card*) or
   `"bankTransfer"` (choice *Bank transfer*); `"ussd"` is also accepted. It is not in the public docs, but the inline
   script and Fairsure's WordPress plugin (`payment_method="bankCard"`) support it: the script adds `?paymentMethod=`
   to the hosted checkout URL and sends it in the postMessage payload. Other values are ignored (the buyer sees the
   method picker). The buyer can still switch method inside the modal, so `CreateOrderInput.paymentMethod` is the
   buyer's *intended* channel, not proof of how they paid: read the channel from the verified transaction.
4. `onSuccess(r)` (`r.transactionRef`, `r.amount`, `r.paymentReference`) → the browser goes to
   `/checkout/success?order=<ref>&tx=<transactionRef>`. That page calls `api.confirmPayment(ref, transactionRef)` →
   **`POST /orders/:ref/confirm`**, and shows paid / awaiting confirmation / failed from your answer.
   The bag is emptied only when the answer is not `failed`.
5. `onClose` / `onError` → a friendly message on the checkout page; **the bag is kept** so the shopper can retry
   (a retry creates a new order and a new `ref`).
6. Independently, Fairsure calls your **webhook** (5.4). The webhook is the source of truth; the confirm call just
   makes the success page instant.

The demo store (`mock` mode) skips the modal when no public key is set and marks the order paid; with a `TEST_`
key it opens the real sandbox modal. The redirect alternative (no modal) is
`https://sandbox.fairsurepay.com/?key=…&amount=…&ref=…&email=…&first_name=…&last_name=…&phone_number=…&narration=…&callback_url=…`
(live: `https://api.fairsurepay.com/`); the frontend uses the inline modal.

### 5.2 `POST /orders` — create the order and return the init values

1. Validate the body (`CreateOrderInput`, section 3.1).
2. For every line, load the product from **your database**: it must be `approved` and in stock. Use **its** price.
3. Shipping = `SHIPPING_RATES[shippingMethod]` (standard 3500 / priority 6500).
4. Per line: `commissionPercent = 0` for `sellerId "platform"`, else 10; `commissionAmount = round(lineTotal × 10 / 100)`;
   `sellerAmount = lineTotal − commissionAmount` (same as `src/lib/commission.ts`). Build `sellerSplits`.
5. If `subtotal + shipping !== displayedTotal` → **409** `{ "error": "Prices have changed. Please review your bag." }`.
6. Generate a unique reference (`RF-YYMMDD-XXXXX`), insert the order (`status: "pending"`, `paymentStatus: "unpaid"`) and its lines.
7. Return:

```ts
return Response.json({
  orderId: order.id,
  ref: order.reference,
  amount: order.total,                 // Naira
  currency: "NGN",
  publicKey: process.env.NEXT_PUBLIC_FAIRSURE_PUBLIC_KEY ?? null,  // PUBLIC key only
  narration: `Rebel Fashion order ${order.reference}`,
});
```

Do not decrement stock here (do it when the payment is confirmed), and expire/cancel `pending` orders that are never
paid (e.g. after 24 h).

### 5.3 `POST /orders/:reference/confirm` — verify with Fairsure

Never trust `onSuccess`. Ask Fairsure from the server with the **private** key:

```http
GET {FAIRSURE_API_BASE}/api/v1/transactions/{reference}
Authorization: Bearer FAIRSURE_PRIVATE_KEY
```

`{reference}` may be your `ref` (merchant reference) or Fairsure's transaction reference. Response `data` has
`status` (`SUCCESS`, `PENDING`, …), `amount` (after fees) and `totalAmount` (what the customer paid), both in Naira.

```ts
// src/app/api/v1/orders/[reference]/confirm/route.ts
export async function POST(req: Request, { params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const order = await db.orders.findByReference(reference);
  if (!order) return Response.json({ status: "pending", order: null, message: "Order not found." });
  if (order.paymentStatus === "paid") return Response.json({ status: "paid", order });

  const res = await fetch(`${process.env.FAIRSURE_API_BASE}/api/v1/transactions/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${process.env.FAIRSURE_PRIVATE_KEY}` },
    cache: "no-store",
  });
  if (res.status === 404) return Response.json({ status: "pending", order });   // not seen yet: webhook will confirm
  if (!res.ok) return Response.json({ status: "pending", order, message: "Payment check unavailable, try again shortly." });

  const { data } = await res.json();
  const paidEnough = Number(data.totalAmount ?? data.amount) >= order.total;
  if (data.status === "SUCCESS" && paidEnough) {
    const updated = await markOrderPaid(order, data.transactionReference); // idempotent, same as the webhook
    return Response.json({ status: "paid", order: updated });
  }
  if (["FAILED", "DECLINED", "CANCELLED"].includes(String(data.status))) return Response.json({ status: "failed", order });
  return Response.json({ status: "pending", order });
}
```

`markOrderPaid` (shared with the webhook): in one transaction, if not already paid → set `paymentStatus = "paid"`,
`status = "paid"`, `paymentReference`, `paidAt`, decrement stock, record the seller payouts owed (5.6), notify sellers.

> **Test mode:** with a test key, Fairsure's transaction endpoint only resolves the fixed reference
> `TEST-REF-000000000000`; every other reference returns 404 (test transactions are not persisted). So in sandbox the
> confirm route will usually answer `pending`; rely on the **test webhook** (5.4) to mark sandbox orders paid, and use
> `TEST-REF-000000000000` to unit-test your verify code.

### 5.4 Webhook — `POST /payments/fairsure/webhook`

Configure the URL in the dashboard (Settings → Webhooks), both Test and Live, e.g.
`https://<your-domain>/api/v1/payments/fairsure/webhook`. HTTPS, public, must answer **200 within 10 seconds**.

Payload (JSON):

```json
{
  "event_id": "evt_…",
  "event": "payment.success",
  "transaction_reference": "PSR-20240521-00014872",
  "merchant_reference": "RF-261024-AB12C",
  "amount": 243500.00,
  "status": "SUCCESS",
  "payment_channel": "CARD",
  "customer_email": "aisha@example.com",
  "transaction_date": "2026-10-24 11:21:40.000",
  "timestamp": 1716299520000
}
```

Header `X-Paysure-Signature` = **HMAC-SHA512 hex of the raw body**, keyed with your private secret key.
Verify with the raw bytes (never re-serialise the JSON), compare timing-safe, be **idempotent on `event_id`**
(retries and dashboard resends reuse the same `event_id` and the same frozen `timestamp`, for up to 24 h — don't
reject old timestamps), and return 200 fast. 4xx answers are not retried; 5xx/timeouts are.

```ts
// src/app/api/v1/payments/fairsure/webhook/route.ts
import { createHmac, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";          // node:crypto
export const dynamic = "force-dynamic";

function isValidSignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = createHmac("sha512", secret).update(rawBody, "utf8").digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature.trim().toLowerCase(), "utf8");
  return a.length === b.length && timingSafeEqual(a, b);   // timingSafeEqual throws on length mismatch
}

export async function POST(req: Request) {
  const rawBody = await req.text();                        // RAW body, before any JSON.parse
  const secret = process.env.FAIRSURE_PRIVATE_KEY;
  if (!secret || !isValidSignature(rawBody, req.headers.get("x-paysure-signature"), secret)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as {
    event_id: string; event: string; transaction_reference: string; merchant_reference: string;
    amount: number; status: string; payment_channel?: string; customer_email?: string;
  };

  // Idempotency: insert the event id first (unique constraint). Already there → we handled it, say 200.
  const isNew = await db.webhookEvents.insertIfAbsent({ eventId: event.event_id, payload: rawBody });
  if (!isNew) return Response.json({ received: true });

  if (event.event === "payment.success" && ["SUCCESS", "PAID"].includes(event.status?.toUpperCase())) {
    const order = await db.orders.findByReference(event.merchant_reference);
    if (order && Number(event.amount) >= order.total) {
      await markOrderPaid(order, event.transaction_reference);   // idempotent
    } else {
      await db.webhookEvents.flag(event.event_id, order ? "amount_mismatch" : "order_not_found"); // review manually
    }
  }
  return Response.json({ received: true });                 // keep it under 10 s; queue slow work
}
```

(The docs' example payload shows `"status": "PAID"` while the field reference says `"SUCCESS"`, so accept both.
If `amount` turns out to be net of fees in practice, compare against `totalAmount` from 5.3 instead.)

Local testing: `ngrok http 3000`, set the Test webhook URL, pay with the sandbox card below, check the signature
passes, then resend the same event from Webhooks → Delivery Log and confirm it is ignored.

**Sandbox test card:** `5123450000000008`, expiry `05/30`, CVV `100`, PIN `1234`, OTP `000000`
(only with a `TEST_` public key).

### 5.5 Card vs transfer

The checkout lets shoppers pick "card" or "transfer" (stored as `paymentMethod`). The Fairsure modal itself offers
Card, Transfer and USSD, so both choices open the same modal.

### 5.6 Split payments and seller payouts (action needed)

The merchant dashboard has a **Split-Payments** section, but the public docs do **not** document a split /
sub-account API. Get the details (API, how sub-accounts are created, how a split is attached to a checkout) from
Fairsure: the dashboard, or support@fairsurepayment.com.ng.

Until then:

- The platform **collects the full amount** of every order into the Rebel Fashion Fairsure account.
- Each order line records `commissionAmount` (10%) and `sellerAmount` (90%); `order.sellerSplits` sums them per seller
  (the platform's own products have 0% commission; shipping stays with the platform).
- When an order is paid, create a payout record per seller (`seller_id`, `order_id`, `amount = sellerAmount`, `status: owed`),
  and pay sellers out to `Seller.bank` on a schedule (e.g. after delivery), by bank transfer or Fairsure's payout
  product **WokPay**. Mark payouts `paid` with the transfer reference.
- `Seller.payout` (`{ status, reference, provider }`) shows the seller's payout set-up: `not_set_up` at signup,
  `pending` while you verify the bank account, `active` when they can be paid, `on_hold` if paused. The admin
  "Owed to sellers" figure is `AdminOverview.sellerPayouts`.
- Once Fairsure confirms a split API, create a sub-account per seller on approval, store its id in
  `payout.reference`, and attach the split when you initialise the payment. The frontend does not change.

---

## 6. The mock route `/api/checkout`

`src/app/api/checkout/route.ts` is a **mock checkout-init route** (enabled with `MOCK_PAYMENTS=true`) used only by
`mock.ts`. It validates the bag, recalculates totals and the seller split, and returns the same `CheckoutInit`
shape as `POST /orders` (with `publicKey` = `NEXT_PUBLIC_FAIRSURE_PUBLIC_KEY` if it is a `TEST_`/`LIVE_` key, else
`null`). It never touches the private key. With your API live, delete it or leave `MOCK_PAYMENTS` unset.

In mock mode, listings created by sellers only exist in the visitor's browser, so this route has to accept the price
sent for those items. **Your backend must always read prices from the database.**

---

## 7. Suggested database tables (any database)

- `sellers` (id, business_name, owner_name, email unique, phone, password_hash, bank_name, bank_code, account_number, account_name, payout_status, payout_reference, payout_provider, status, created_at)
- `admins` (id, email unique, name, password_hash)
- `products` (id, slug unique, seller_id → sellers or null/"platform", seller_name, name, description, **category** (indexed, one of the 9 slugs), product_type, gender, type_option json, price, compare_at_price, badge, featured, images json, colors json, sizes json, stock, material, fit, care, status, rejection_reason, created_at, updated_at)
- `orders` (id, reference unique, customer json, delivery_location json, subtotal, shipping_cost, total, commission_total, seller_splits json, shipping_method, payment_method, status, payment_status, payment_reference, paid_at, created_at, updated_at)
- `order_items` (id, order_id, product_id, seller_id, seller_name, slug, name, image, type, color, size, quantity, unit_price, line_total, commission_percent, commission_amount, seller_amount)
- `webhook_events` (event_id **unique**, payload, received_at, flag) — idempotency for 5.4
- `seller_payouts` (id, seller_id, order_id, amount, status owed/paid, transfer_reference, paid_at) — 5.6

---

## 8. Checklist before going live

- [ ] All endpoints in section 3 implemented (Route Handlers under `src/app/api/v1`), returning the shapes in `src/lib/types.ts`
- [ ] `NEXT_PUBLIC_API_MODE=http` and `NEXT_PUBLIC_API_BASE_URL=/api/v1` set in Vercel; `MOCK_PAYMENTS` removed
- [ ] Passwords hashed, tokens expire, admin and seller roles separated
- [ ] Prices/totals/commission recomputed server-side; only `approved` products purchasable; `category` validated
- [ ] `FAIRSURE_PRIVATE_KEY` + `FAIRSURE_API_BASE` set (server only); `NEXT_PUBLIC_FAIRSURE_PUBLIC_KEY` + `NEXT_PUBLIC_FAIRSURE_ENV` set
- [ ] Webhook URL configured (Test and Live); signature verified on the raw body; idempotent on `event_id`; answers 200 in < 10 s
- [ ] Orders marked paid only from the webhook or the server-side verify call, and only when the amount matches
- [ ] Split payments: details obtained from Fairsure, or the manual seller payout process (5.6) in place
- [ ] Sandbox end-to-end test with the test card, then switch keys + `NEXT_PUBLIC_FAIRSURE_ENV=live`
- [ ] Upload storage domain added to `next.config.ts` → `images.remotePatterns`
- [ ] The 30 platform products from `src/lib/seed-data.ts` imported (seller `platform`, category `kaftans`), photos uploaded

---

## Appendix A. Optional: Supabase

Only if you prefer Supabase (Postgres + Auth + Storage) over your own API. The http mode above stays the primary path;
you can also use Supabase *as the database* behind your Next.js API routes and ignore A.1.

### A.1 Add the implementation and switch it on

1. `npm i @supabase/supabase-js` (and `@supabase/ssr` for cookie sessions in route handlers).
2. Create **`src/lib/api/supabase.ts`** exporting `export const supabaseApi: DataApi = { … }` with exactly the functions
   of the `DataApi` interface (`src/lib/api/contract.ts`). TypeScript refuses to compile if one is missing.
   Map snake_case columns to camelCase; map `seller_id = null` to `sellerId: "platform"`.
3. In **`src/lib/api/index.ts`** uncomment the two marked lines (import + `supabase: supabaseApi`).
4. Set `NEXT_PUBLIC_API_MODE=supabase`.
5. Add `<project-ref>.supabase.co` to `images.remotePatterns` in `next.config.ts`.
6. Throw `ApiError(message, status)` from `./contract` for failures so the UI shows the message.
7. Checkout (`createOrder`, `confirmPayment`) and the webhook still need **server routes** (section 5): they use the
   Fairsure private key and the service-role key, which must never reach the browser.

### A.2 Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | browser | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser | Anon key (safe in the browser **only because RLS is on**) |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Route handlers: signup bank details, approval, orders, webhook |
| `FAIRSURE_PRIVATE_KEY`, `FAIRSURE_API_BASE` | **server only** | Section 5 |


### A.3 Tables (suggested)

```sql
-- One row per signed-up user (Supabase Auth). role decides what they can do.
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null check (role in ('seller','admin')),
  full_name text,
  created_at timestamptz not null default now()
);

create table sellers (
  id uuid primary key references profiles on delete cascade,   -- same id as the auth user
  business_name text not null,
  owner_name text not null,
  email text not null unique,
  phone text not null,
  status text not null default 'active' check (status in ('active','suspended')),
  payout_status text not null default 'not_set_up' check (payout_status in ('not_set_up','pending','active','on_hold')),
  payout_reference text,                                       -- beneficiary id at your payout provider
  created_at timestamptz not null default now()
);

-- Bank details in their own table so RLS can make them admin-only.
create table seller_bank_details (
  seller_id uuid primary key references sellers on delete cascade,
  bank_name text not null,
  bank_code text,                 -- NIP/CBN bank code, as your payout provider expects
  account_number text not null check (account_number ~ '^\d{10}$'),
  account_name text not null
);

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  seller_id uuid references sellers,         -- NULL = the platform itself ("Sold by Rebel Fashion")
  seller_name text not null,                  -- denormalised for "Sold by …"
  name text not null,
  description text not null,
  category text not null check (category in ('kaftans','hoodies','jeans','t-shirts-shirts','dresses','shoes','bags','accessories','other')),
  product_type text not null default '',      -- optional free-text detail
  gender text not null default 'unisex' check (gender in ('men','women','kids','unisex')),
  type_option jsonb,                          -- {"label":"Length","values":["Short","Long"]} or null
  price integer not null check (price > 0),   -- whole Naira
  compare_at_price integer,
  badge text,
  featured boolean not null default false,
  images text[] not null default '{}',        -- public Storage URLs, first = cover
  sizes text[] not null default '{}',
  stock integer not null default 0 check (stock >= 0),
  material text, fit text, care text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_colours (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products on delete cascade,
  name text not null,
  hex text not null,
  image text,                                 -- optional colour photo
  position integer not null default 0
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,             -- also the Fairsure `ref` (merchant_reference)
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','paid','failed')),
  payment_reference text,                     -- Fairsure transaction_reference
  customer jsonb not null,                    -- Customer shape
  delivery_location jsonb,
  subtotal integer not null, shipping_cost integer not null, total integer not null,
  commission_total integer not null,
  seller_splits jsonb not null,               -- SellerSplit[]
  shipping_method text not null, payment_method text not null,
  status text not null default 'pending' check (status in ('pending','paid','shipped','delivered','cancelled')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders on delete cascade,
  product_id uuid not null references products,
  seller_id uuid references sellers,          -- NULL = platform
  seller_name text not null,
  slug text not null, name text not null, image text,
  type text not null default '', color text not null, size text not null,
  quantity integer not null, unit_price integer not null, line_total integer not null,
  commission_percent integer not null, commission_amount integer not null, seller_amount integer not null
);
```

Import the 30 platform products from `src/lib/seed-data.ts` once (`seller_id = null`, `seller_name = 'Rebel Fashion'`,
`status = 'approved'`, `category = 'kaftans'`), uploading `public/products/*.webp` to the bucket or keeping them as `/products/...` paths.

### A.4 Row Level Security (turn RLS on for every table)

```sql
create function is_admin() returns boolean language sql stable security definer as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin')
$$;

-- profiles: you see yourself; admin sees all. Rows are created by the signup route (service role).
create policy "own profile" on profiles for select using (id = auth.uid() or is_admin());

-- sellers: a seller reads their own row (status/payout fields are changed by server routes only); admin all.
create policy "seller reads self" on sellers for select using (id = auth.uid() or is_admin());
create policy "admin manages sellers" on sellers for all using (is_admin()) with check (is_admin());

-- bank details: ADMIN ONLY (written by the signup route with the service role key).
create policy "admin bank details" on seller_bank_details for all using (is_admin()) with check (is_admin());

-- products: public reads approved; sellers manage their own; admin everything.
create policy "public approved" on products for select using (status = 'approved');
create policy "seller reads own" on products for select using (seller_id = auth.uid());
create policy "seller inserts pending" on products for insert
  with check (seller_id = auth.uid() and status = 'pending');
create policy "seller edits own pending" on products for update
  using (seller_id = auth.uid() and status <> 'approved') with check (seller_id = auth.uid() and status = 'pending');
create policy "admin products" on products for all using (is_admin()) with check (is_admin());

-- product_colours follow their product.
create policy "colours readable" on product_colours for select using (
  exists (select 1 from products p where p.id = product_id and (p.status = 'approved' or p.seller_id = auth.uid() or is_admin())));
create policy "seller writes own colours" on product_colours for insert with check (
  exists (select 1 from products p where p.id = product_id and p.seller_id = auth.uid()));
create policy "admin colours" on product_colours for all using (is_admin()) with check (is_admin());

-- orders: created/updated only by server routes (service role). Admin reads all;
-- a seller reads orders that contain their items (and only sees their own lines via order_items).
create policy "admin orders" on orders for all using (is_admin()) with check (is_admin());
create policy "seller orders" on orders for select using (
  exists (select 1 from order_items i where i.order_id = id and i.seller_id = auth.uid()));
create policy "admin items" on order_items for all using (is_admin()) with check (is_admin());
create policy "seller items" on order_items for select using (seller_id = auth.uid());
```

Guest shoppers have no account: `getOrderByReference` should go through a server route that looks the order
up by its (unguessable) reference with the service role and returns only that order.

### A.5 Storage: bucket `product-images`

- Create a **public** bucket `product-images` (public read; uploads restricted by policy).
- Path convention: `sellers/<auth.uid()>/<uuid>.jpg` (platform photos: `platform/<file>`).
- Policy: authenticated users may `insert` only under their own folder:
  ```sql
  create policy "sellers upload own folder" on storage.objects for insert to authenticated
    with check (bucket_id = 'product-images' and (storage.foldername(name))[1] = 'sellers'
                and (storage.foldername(name))[2] = auth.uid()::text);
  create policy "sellers delete own" on storage.objects for delete to authenticated
    using (bucket_id = 'product-images' and (storage.foldername(name))[2] = auth.uid()::text);
  ```
- `uploadListingImage(file)`: compress in the browser first (`compressImageToFile` from
  `src/lib/image-compress.ts`), upload with `contentType: compressed.type` (`image/webp` or `image/jpeg`),
  and return `getPublicUrl(path).data.publicUrl`.


### A.6 Mapping: each API function → Supabase

| `DataApi` function | Supabase |
|---|---|
| `getProducts(filters)` | `from('products').select('*, product_colours(*)').eq('status','approved')` + `.in('gender',[g,'unisex'])`, `.eq('category',c)`, `.or('name.ilike.%q%,description.ilike.%q%,product_type.ilike.%q%')`, `.eq('seller_id',…)`, `.in('id',ids)` |
| `getCategories()` | `select category, count(*) from products where status = 'approved' group by category`, merged with the fixed list (0 for missing) |
| `getProduct(slugOrId)` | same select, `.or('slug.eq.X,id.eq.X')` (id only if it's a uuid) `.eq('status','approved').maybeSingle()` |
| `createSeller(input)` | server route: `auth.admin.createUser` (or `auth.signUp`) → insert `profiles` (role seller), `sellers`, `seller_bank_details` with service role → then `auth.signInWithPassword` in the browser |
| `loginSeller(email, pw)` | `auth.signInWithPassword` → check `profiles.role = 'seller'` → return `{ token: session.access_token, seller }` |
| `logoutSeller()` / `logoutAdmin()` | `auth.signOut()` |
| `getCurrentSeller()` | `auth.getUser()` → `from('sellers').select('*').eq('id', uid).maybeSingle()` (bank details: masked, via a server route or omitted) |
| `getSellerListings()` | `from('products').select('*, product_colours(*)').eq('seller_id', uid).order('created_at',{ascending:false})` |
| `createListing(input)` | insert `products` (`status:'pending'`, `seller_id: uid`, `seller_name`, unique `slug`) then insert `product_colours` |
| `uploadListingImage(file)` | compress → `storage.from('product-images').upload('sellers/<uid>/<uuid>.webp', compressed)` → `getPublicUrl` |
| `getSellerOrders()` | `from('order_items').select('*, orders(reference,status,created_at,customer)').eq('seller_id', uid)` grouped per order into `SellerOrderView` |
| `loginAdmin(email, pw)` | `auth.signInWithPassword` → require `profiles.role = 'admin'` (else sign out + 403) |
| `getAdminSession()` | `auth.getSession()` + `profiles` role check → `{ token, email, name }` or `null` |
| `getPendingListings()` | `from('products').select('*, product_colours(*)').eq('status','pending')` (admin RLS) |
| `getAllProducts()` | `from('products').select('*, product_colours(*)').order('created_at',{ascending:false})` |
| `approveListing(id)` | server route: update status; start payout set-up for the seller if `payout_status = 'not_set_up'` |
| `rejectListing(id, reason)` | `from('products').update({ status:'rejected', rejection_reason: reason }).eq('id', id)` |
| `getSellers()` | `from('sellers').select('*, seller_bank_details(*)')` (admin only) |
| `getOrders()` | `from('orders').select('*, order_items(*)').order('created_at',{ascending:false})` |
| `updateOrderStatus(id, s)` | `from('orders').update({ status: s, updated_at: now }).eq('id', id).select().single()` |
| `getAdminOverview()` | a SQL function / view (`rpc('admin_overview')`) summing products by status, sellers, orders, GMV, commission, own-store revenue, payouts (excluding cancelled) |
| `createOrder(input)` | server route `POST /api/v1/orders` (section 5.2) → `CheckoutInit` |
| `confirmPayment(ref)` | server route `POST /api/v1/orders/:ref/confirm` (section 5.3) → `PaymentConfirmation` |
| `getOrderByReference(ref)` | `GET /api/orders/:reference` server route (service role, returns just that order) |

