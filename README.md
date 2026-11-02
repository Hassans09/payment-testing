
# Rebel Fashion

A multi-vendor **general fashion marketplace** frontend built with Next.js 16, React 19, TypeScript and Tailwind CSS v4.
Rebel Fashion's own products are kaftans for now (30 house products, more categories later); approved independent
sellers list any clothing, shoes, bags or accessories in fixed categories (Kaftans, Hoodies, Jeans, T-shirts & Shirts,
Dresses, Shoes, Bags, Accessories, Other); an admin approves listings and manages orders. Payments: **Fairsure**. The platform keeps a commission
(`PLATFORM_COMMISSION_PERCENT`, 10%) on every marketplace sale.

> **Frontend only.** Until a backend is connected, data lives in a mock store in the browser
> (no demo sellers or fake listings; sellers sign up through the form). The backend developer builds Next.js API
> routes with a database of their choice ("http" mode; Supabase optional): start with **[BACKEND.md](./BACKEND.md)**.

## Marketplace quick tour

| Area | Routes |
|------|--------|
| Storefront | `/` (intro splash once per session), `/shop` (category chips, gender, sold by, search, price; `?category=`, `?sold=platform\|marketplace`), `/category/[slug]`, `/product/[slug]` (choose Type, Colour, Size), `/cart`, `/checkout`, `/checkout/success`, `/wishlist`, `/account` |
| Sellers | `/sell` (pitch), `/seller/signup`, `/seller/login`, `/seller/dashboard`, `/seller/listings/new` |
| Admin | `/admin/login`, `/admin` (overview, pending listings, all products, sellers, orders) |
| Mock API | `POST /api/checkout` (demo checkout-init, returns `{ orderId, ref, amount, publicKey }`, needs `MOCK_PAYMENTS=true`) |

Admin login in mock mode: `ADMIN_DEMO_CREDENTIALS` in `src/lib/config.ts` (never shown in the UI).
Sellers create real accounts at `/seller/signup`.

Key files:
- `src/lib/config.ts` — `SITE_NAME`, `CATEGORIES`, `PLATFORM_COMMISSION_PERCENT`, shipping rates, env switches, Fairsure public settings.
- `src/lib/payments/fairsure.ts` — loads the Fairsure inline checkout and opens the modal (public key only).
- `src/app/template.tsx` + `src/components/page-transition.tsx` — page transitions; `src/components/scroll-reveal.tsx` — scroll reveal (`data-reveal`, `data-reveal-stagger`).
- `src/lib/types.ts` — all domain types.
- `src/lib/api/` — the only data layer (`index.ts` picks `mock.ts`, `http.ts` or an optional `supabase.ts` from `NEXT_PUBLIC_API_MODE`).
- `src/lib/seed-data.ts` — the platform's 30 kaftans. Photos are in `public/products/` (generated product shots, no faces).
- `npm run test:images` — tests for the photo upload/compression pipeline.

Reset the mock store by clearing the site's localStorage (key `rf-mock-db`) or bumping `SEED_VERSION`.

## About the Project

Rebel Fashion is an online fashion shopping platform designed to provide customers with a smooth and convenient shopping experience. This repository is used to develop and test frontend features before integrating them with the production application and backend services.

The frontend is being developed separately from the backend integration, so some features may require backend configuration before they are fully functional.

## Tech Stack

- Next.js with App Router
- React
- TypeScript
- Tailwind CSS
- React Context for shared shopping state
- Browser storage for selected client-side state
- REST API integration for checkout
- Vercel for frontend deployment

## Features

### Shopping Experience
- Responsive storefront for desktop and mobile
- Product browsing and product detail pages
- Shopping cart with quantity controls
- Add-to-bag notifications
- Cart subtotal calculation
- Wishlist interface

### Checkout
- Guest checkout without requiring an account
- Customer contact and delivery information
- Nigerian states and Federal Capital Territory selection
- Standard and priority shipping options
- Card and bank transfer via the Fairsure inline checkout (sandbox or live); the modal opens on the method the buyer picked (`paymentMethod: "bankCard" | "bankTransfer"`, see BACKEND.md); demo payment when no public key is set
- Form validation and user-friendly error messages
- Optional current-location detection for delivery details
- Editable delivery address fields
- Order summary before submission

### Order Handling
- Server-side order creation (`POST /orders` returns the Fairsure init values)
- Fairsure modal; closing it or a failed payment keeps the bag
- Success page asks the server to verify the payment (`POST /orders/:ref/confirm`)
- Frontend structure prepared for future guest order tracking

**Note:** Payment processing, payment verification, persistent order storage, and guest order tracking depend on the backend and payment-provider integration. The presence of a frontend option does not mean that a payment method is already operational.

## Project Structure

```text
src/
├── app/
│   ├── account/
│   ├── cart/
│   ├── checkout/
│   ├── product/
│   ├── shop/
│   ├── wishlist/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── header.tsx, footer.tsx, splash-intro.tsx, marquee.tsx
│   ├── product-card.tsx, product-detail-view.tsx
│   └── store-provider.tsx   (cart + wishlist)
├── hooks/                   (useAsync, seller/admin session guards)
└── lib/
    ├── config.ts, types.ts, commission.ts, seed-data.ts
    └── api/                 (contract.ts, index.ts, mock.ts, http.ts)
```

The exact file names and routes may change as development continues.

## Getting Started

### Prerequisites

- Node.js compatible with the project's Next.js version
- npm
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/sajjadh09/rebel-fashion-2.git
```

Move into the project directory:

```bash
cd rebel-fashion-2
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually:

```text
http://localhost:3000
```

## Backend Integration

See **[BACKEND.md](./BACKEND.md)** for the full API contract: every endpoint, auth, categories, uploads and the
Fairsure payment flow (checkout init, server-side verification, signed webhook, split-payment note).
Switch data source with `NEXT_PUBLIC_API_MODE=mock|http|supabase` (see `.env.example`; legacy `NEXT_PUBLIC_USE_MOCK_API=false` = `http`).

Payment environment variables: `NEXT_PUBLIC_FAIRSURE_ENV` (`sandbox`|`live`), `NEXT_PUBLIC_FAIRSURE_PUBLIC_KEY`
(`TEST_…`/`LIVE_…`, optional) and, on the server only, `FAIRSURE_PRIVATE_KEY`. The private key never goes in the frontend.

### Backend Responsibilities

The backend should handle:

- Server-side validation of customer and order data
- Secure creation and storage of orders
- Authoritative product pricing and shipping calculations
- Fairsure integration (checkout init, verification with the private key, webhook)
- Server-side payment verification and payment status updates
- Secure handling of provider credentials through environment variables
- Guest order tracking using a secure, non-guessable reference or token
- Appropriate error responses and protection against duplicate order submissions

The final API contract may change following agreement between the frontend and backend developers.

## Current Location

The checkout can request the customer's current location through the browser's Geolocation API, subject to device permissions and browser support.

A reverse-geocoding service may be used to convert coordinates into a readable address. Location lookup can fail independently of checkout, so customers must always be able to enter or correct their delivery address manually.

The application should request location only after the customer chooses to use it. Location coordinates and personal delivery information should be handled according to the project's privacy requirements.

## Security Notes

- Never commit API secrets, payment keys, private tokens, or passwords.
- Store sensitive configuration in environment variables.
- Do not treat frontend validation as a substitute for backend validation.
- Do not mark an online payment as successful without server-side verification.
- Avoid exposing customer information in public URLs or logs.
- Restrict access to private order information.
- Use HTTPS in deployed environments.

## Development and Testing

Before releasing changes, test:

- Product browsing and cart updates
- Cart persistence and item removal
- Checkout validation
- Manual address entry
- Location permission denied, unavailable, and timeout scenarios
- Payment-provider redirects and failure cases
- Pay-on-delivery order creation
- Empty-cart handling
- Mobile responsiveness
- API error handling

Use test credentials and sandbox payment environments where supported.

## Deployment

The frontend can be deployed to Vercel or another compatible hosting platform.

Deployment requires the correct environment variables, configured API endpoints, and a working backend integration. Successful frontend deployment alone does not establish that payment processing or order persistence is operational.

## Development Workflow

1. Make and test changes in the designated development or testing repository.
2. Commit changes with descriptive messages.
3. Coordinate API changes with the backend developer.
4. Test the complete checkout flow against the agreed backend environment.
5. Obtain approval before merging changes into the production repository.

## Project Status

**Status:** Frontend development and backend integration preparation.

Features and integrations may change as development progresses. Refer to the current implementation and agreed project requirements for the latest status.

## License

Specify the project's license before distributing or reusing this code publicly.
