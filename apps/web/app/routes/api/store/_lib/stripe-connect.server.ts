/**
 * Stripe Connect utilities for the Breeze Man Books store.
 *
 * Charge model: DESTINATION CHARGES
 * - Platform (Singularity Labs) creates the Checkout Session under its own Stripe account.
 * - `payment_intent_data.transfer_data.destination` routes remaining funds to the connected
 *   account (Zuber's acct_1TMtz16CZ1cr9Dv6) after the platform fee is deducted.
 * - `payment_intent_data.application_fee_amount` keeps the platform's cut.
 * - Customer relationship lives on the platform; refunds are issued by the platform.
 *
 * Why NOT direct charges (stripeAccount header)?  Direct charges create the session ON the
 * connected account, which moves the customer relationship there and complicates refunds/disputes.
 *
 * Why NOT separate charges + transfers?  Requires two Stripe API calls and manual reconciliation.
 * Destination charges auto-transfer at settlement with one call.
 */

interface ConnectedAccountInfo {
  id: string;
  displayName: string;
}

// Simple in-process TTL cache — the connected account name rarely changes.
let cachedAccount: ConnectedAccountInfo | null = null;
let cacheExpiresAt = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function getConnectedAccountInfo(
  stripe: import('stripe').default,
  connectedAccountId: string,
): Promise<ConnectedAccountInfo> {
  const now = Date.now();
  if (cachedAccount && now < cacheExpiresAt) {
    return cachedAccount;
  }

  try {
    const account = await stripe.accounts.retrieve(connectedAccountId);
    const displayName =
      account.settings?.dashboard?.display_name ??
      account.business_profile?.name ??
      'Breeze Man Books';

    cachedAccount = { id: connectedAccountId, displayName };
    cacheExpiresAt = now + CACHE_TTL_MS;
    return cachedAccount;
  } catch {
    // Account not accessible in test mode or not yet connected — return fallback.
    return { id: connectedAccountId, displayName: 'Breeze Man Books' };
  }
}

export function getPlatformFeeAmount(): number {
  const raw = process.env.STRIPE_PLATFORM_FEE_CENTS;
  if (!raw) return 0;
  const parsed = parseInt(raw, 10);
  return isNaN(parsed) || parsed < 0 ? 0 : parsed;
}
