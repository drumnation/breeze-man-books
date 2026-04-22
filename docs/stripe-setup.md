# Stripe Setup — Breeze Man Books

## Charge Model

This store uses **direct charges to the Singularity Labs platform Stripe account**.

- Singularity Labs is the **merchant of record**.
- Every checkout lands fully on the platform Stripe account.
- There is **no Stripe Connect**, no connected account, no `transfer_data` routing, no `application_fee_amount`.
- Settlement with the author (Zubair Raymond Latib) is handled **manually, outside Stripe**.

```
Buyer -> Stripe Checkout -> Singularity Labs Stripe account
                                   |
                                   +-> Dave manually reconciles with author
```

This keeps the Stripe integration minimal: one account, one webhook, one dashboard.

## Required Environment Variables

| Variable | Required? | Purpose |
|----------|-----------|---------|
| `STRIPE_SECRET_KEY` | Yes | Singularity Labs' secret key (`sk_live_...` in prod, `sk_test_...` locally). |
| `STRIPE_WEBHOOK_SECRET` | Yes | Signing secret for the platform webhook endpoint. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Optional | Only needed if the frontend embeds Stripe Elements. |

Where to find them in Stripe Dashboard:

- **Secret key**: Developers -> API keys -> "Reveal live/test secret key"
- **Webhook secret**: Developers -> Webhooks -> select your endpoint -> "Signing secret"

## Webhook Configuration

Register a single webhook in the **Singularity Labs Stripe Dashboard** (not on a connected account):

| Field | Value |
|-------|-------|
| Endpoint URL | `https://<your-domain>/api/store/webhook` |
| Events to send | `checkout.session.completed` |

Copy the signing secret into `STRIPE_WEBHOOK_SECRET` in Coolify.

## Buyer Receipts

Stripe automatically emails a payment receipt to the buyer when:

1. The customer provides an email at Checkout (default behavior).
2. Receipt emails are enabled in **Stripe Dashboard -> Settings -> Emails -> "Successful payments"**.

No additional code is required.

## Local Development Checklist

- [ ] `STRIPE_SECRET_KEY=sk_test_...` (Stripe test mode key)
- [ ] `STRIPE_WEBHOOK_SECRET=whsec_...` (from `stripe listen` or a test webhook endpoint)
- [ ] Run `stripe listen --forward-to http://localhost:3000/api/store/webhook` to relay test events
- [ ] Use Stripe test card `4242 4242 4242 4242` at checkout

## Production Checklist (Coolify)

- [ ] `STRIPE_SECRET_KEY=sk_live_...` (Singularity Labs live secret key)
- [ ] `STRIPE_WEBHOOK_SECRET=whsec_...` (signing secret from the live webhook endpoint)
- [ ] Webhook endpoint `https://<your-domain>/api/store/webhook` registered in Stripe Dashboard and subscribed to `checkout.session.completed`
- [ ] Receipt emails enabled in Stripe Dashboard settings

## Removed Variables

The following variables were used by the old Stripe Connect setup and are **no longer read by the app**. Remove them from Coolify (and anywhere else) when migrating:

- `STRIPE_CONNECT_ENABLED`
- `STRIPE_CONNECTED_ACCOUNT_ID`
- `STRIPE_PLATFORM_FEE_CENTS`
