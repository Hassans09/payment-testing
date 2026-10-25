
# Rebel Fashion

A modern, responsive fashion e-commerce storefront built with Next.js, TypeScript, and Tailwind CSS.

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
- Card and bank transfer payment options
- Form validation and user-friendly error messages
- Optional current-location detection for delivery details
- Editable delivery address fields
- Order summary before submission

### Order Handling
- Checkout API integration point
- Payment-provider handoff for supported online payments
- Order confirmation flow for pay on delivery
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
│   ├── header.tsx
│   ├── footer.tsx
│   ├── ProductCard.tsx
│   └── store-provider.tsx
└── lib/
    └── store-data.ts
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
git clone https://github.com/Hassans09/payment-testing.git
```

Move into the project directory:

```bash
cd payment-testing
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

The frontend checkout currently uses the following integration point:

```text
POST /api/checkout
```

The frontend and backend developers should agree on the API contract before integration.

### Example Request

```json
{
  "customer": {
    "fullName": "Example Customer",
    "email": "customer@example.com",
    "phone": "08012345678",
    "address": "Example Street",
    "city": "Abuja",
    "state": "Federal Capital Territory (FCT)"
  },
  "items": [],
  "shippingMethod": "standard",
  "paymentMethod": "card",
  "displayedSubtotal": 0,
  "displayedShipping": 3500,
  "displayedTotal": 3500
}
```

This is an illustrative request. Actual cart items and totals are supplied by the application. The backend must validate product prices, availability, shipping charges, and totals independently rather than trusting client-provided values.

### Expected Response

For card or bank transfer payments, the frontend currently expects a response containing a secure checkout URL:

```json
{
  "checkoutUrl": "https://payment-provider.example/checkout"
}
```

For pay on delivery, the frontend currently expects:

```json
{
  "orderId": "server-generated-order-reference"
}
```

These are expected response shapes, not real payment-provider endpoints or proof of an existing backend implementation.

### Backend Responsibilities

The backend should handle:

- Server-side validation of customer and order data
- Secure creation and storage of orders
- Authoritative product pricing and shipping calculations
- Payment-provider integration
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
