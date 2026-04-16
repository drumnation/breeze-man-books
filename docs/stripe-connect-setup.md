# Stripe Connect Setup — Breeze Man Books

## Charge Model: Destination Charges

This store uses **destination charges**. The platform (Singularity Labs / Dave's Stripe account) creates every Checkout Session. At settlement, Stripe automatically transfers the balance—minus the platform fee—to the connected account (Zuber's).

```
Customer payment ($15)
        │
        ▼
  Platform account (Singularity Labs)
        │  application_fee_amount (e.g. $0 currently)
        │  transfer_data.destination = acct_1TMtz16CZ1cr9Dv6
        ▼
  Connected account (Zuber / acct_1TMtz16CZ1cr9Dv6)
```

### Why destination charges?

| Criterion | Destination | Direct | Separate |
|-----------|-------------|--------|----------|
| Platform keeps customer | ✅ | ❌ | ✅ |
| Single API call | ✅ | ✅ | ❌ |
| Platform handles refunds | ✅ | ❌ | ✅ |
| Platform fee built-in | ✅ | ❌ | Manual |
| Connected account needs OAuth | ❌ | ✅ | ❌ |

**Bottom line**: destination charges give Singularity Labs full control over the customer relationship and simplify refunds, while still routing revenue to Zuber automatically.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `STRIPE_SECRET_KEY` | ✅ | Platform Stripe secret key (`sk_test_…` or `sk_live_…`) |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Webhook signing secret from Stripe Dashboard |
| `STRIPE_CONNECTED_ACCOUNT_ID` | ✅ for live | Zuber's Stripe account: `acct_1TMtz16CZ1cr9Dv6` |
| `STRIPE_PLATFORM_FEE_CENTS` | Optional | Platform fee in cents, e.g. `100` = $1.00. Default: `0` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | ✅ | Stripe publishable key (used by billing UI) |
| `N8N_ORDER_WEBHOOK_URL` | Recommended | n8n webhook for order notification emails |
| `RESEND_API_KEY` | Optional | Fallback email via Resend |

### Coolify (singularity-toilet / 87.99.135.112)

The production app runs on Coolify. Set these env vars in the Coolify project settings:

```
STRIPE_SECRET_KEY=sk_live_...          # Dave's live Stripe key
STRIPE_WEBHOOK_SECRET=whsec_...        # From Stripe Dashboard → Webhooks
STRIPE_CONNECTED_ACCOUNT_ID=acct_1TMtz16CZ1cr9Dv6
STRIPE_PLATFORM_FEE_CENTS=0            # Adjust when agreed with Zuber
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
N8N_ORDER_WEBHOOK_URL=http://...       # n8n order notification webhook
```

---

## Webhook Setup

### Endpoint

Register a single webhook in **your platform Stripe Dashboard** (not the connected account):

```
URL:    https://thebrainrotbooks.com/api/store/webhook
Events: checkout.session.completed
```

With destination charges, all events fire on the **platform account**, so one endpoint handles everything.

### Why no Connect webhook?

Connect webhooks (with separate `STRIPE_CONNECT_WEBHOOK_SECRET`) are only needed for **direct charges** where the event fires on the *connected account*. Since this store uses destination charges, that isn't necessary.

---

## Merchant Name Display

The store page fetches `acct_1TMtz16CZ1cr9Dv6` via `stripe.accounts.retrieve()` and shows the `settings.dashboard.display_name` (or `business_profile.name`) in the store header. The result is cached in-process for 1 hour.

Fallback when the account isn't accessible: `"Breeze Man Books"`.

---

## Onboarding Another Connected Account

To route revenue to a different author in the future:

1. Set `STRIPE_CONNECTED_ACCOUNT_ID` in Coolify to the new author's Stripe account ID.
2. Ensure the new account has verified their Stripe identity (charges_enabled = true).
3. Redeploy — no code changes needed.

The author does **not** need to go through OAuth. You just need their Stripe account ID and for them to have a connected/verified account under your platform (or you can add them as a Standard connected account via the Stripe Dashboard).

---

## Test Mode Checklist

Before going live, verify in Stripe test mode:

- [ ] `STRIPE_SECRET_KEY=sk_test_...` is set
- [ ] `STRIPE_CONNECTED_ACCOUNT_ID` is set (use a test connected account ID, not the live `acct_1TMtz16CZ1cr9Dv6`)
- [ ] Create a checkout session via `POST /api/store/checkout` with `{ "productId": "book1-signed" }`
- [ ] Confirm the returned Stripe Checkout URL shows a payment form
- [ ] Complete with test card `4242 4242 4242 4242` (any future date, any CVC)
- [ ] Verify `checkout.session.completed` fires in Stripe Dashboard → Events
- [ ] Verify the webhook hits `/api/store/webhook` and the order is saved in Supabase
- [ ] Verify the order notification email fires (check n8n logs or Resend logs)

## Go-Live Checklist

- [ ] Dave approves switching to live keys
- [ ] Set `STRIPE_SECRET_KEY=sk_live_...` in Coolify
- [ ] Set `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...` in Coolify
- [ ] Re-register the webhook in the **live** Stripe Dashboard and update `STRIPE_WEBHOOK_SECRET`
- [ ] `STRIPE_CONNECTED_ACCOUNT_ID=acct_1TMtz16CZ1cr9Dv6` (same ID — works in both modes)
- [ ] Run a small live test purchase; confirm funds appear in Zuber's Stripe dashboard
- [ ] Remove the "coming soon" notice from the store (happens automatically when `checkoutEnabled=true`)
