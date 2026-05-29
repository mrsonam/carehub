This is a [Next.js](https://nextjs.org) project bootstrapped with `[create-next-app](https://github.com/vercel/next.js/tree/canary/packages/create-next-app)`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

## Stripe setup (appointment payments)

Online payments use [Stripe Checkout](https://stripe.com/docs/payments/checkout) in test mode for local development.

1. Create a [Stripe account](https://dashboard.stripe.com/register) and open the [Developers → API keys](https://dashboard.stripe.com/test/apikeys) page.
2. Copy your **test** keys (`pk_test_...` and `sk_test_...`) into `.env.local` (see `.env.example`):
  ```bash
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   PAYMENT_CURRENCY=aud
  ```
3. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and forward webhooks to your local app (with `npm run dev` running):
  ```bash
   stripe listen --forward-to localhost:3000/api/payments/webhook
  ```
   The CLI prints a webhook signing secret (`whsec_...`). Set that value as `STRIPE_WEBHOOK_SECRET` in `.env` and restart the dev server. Use the secret from `**stripe listen**`, not the Dashboard webhook secret, while testing locally.
4. Use Stripe [test cards](https://stripe.com/docs/testing#cards) (e.g. `4242424242424242`) when completing Checkout during development.

After payment, the app confirms with Stripe on redirect (`/api/payments/confirm`). The webhook should still run in production; if status stays **Unpaid** locally, `stripe listen` is usually not running or `STRIPE_WEBHOOK_SECRET` does not match the CLI secret.

## Supabase setup (profile photos)

Doctors and patients can upload profile photos from `/doctor/profile` and `/patient/profile`.

1. Create a [Supabase](https://supabase.com) project.
2. In **Storage**, create a public bucket named `avatars` (or run `node scripts/ensure-avatar-bucket.mjs` — the app will also try to create it on first upload).
3. Add to `.env.local` (see `.env.example`):
  ```bash
   SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
  ```
4. Uploads run server-side via the service role key. Do not expose the service role key to the browser.

Without these variables, profile fields still save; photo upload returns a “not configured” message.

This project uses `[next/font](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)` to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.