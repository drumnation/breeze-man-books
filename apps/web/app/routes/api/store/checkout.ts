import type Stripe from 'stripe';
import { z } from 'zod';

import type { Route } from '~/types/app/routes/api/store/+types/checkout';

import {
  getConnectedAccountInfo,
  getPlatformFeeAmount,
} from './_lib/stripe-connect.server';

const CheckoutSchema = z.object({
  productId: z.enum([
    'book1-signed',
    'book2-signed',
    'book3-signed',
    'bundle-3book',
  ]),
});

const PRODUCTS: Record<
  string,
  { name: string; price: number; description: string }
> = {
  'book1-signed': {
    name: 'Breeze Man vs. The Laser Sharks — Signed Copy',
    price: 1500,
    description: 'Signed copy of Book 1 by Zubair Raymond Latib',
  },
  'book2-signed': {
    name: 'Breeze Man vs. The Basic Overlord — Signed Copy',
    price: 1500,
    description: 'Signed copy of Book 2 by Zubair Raymond Latib',
  },
  'book3-signed': {
    name: 'Breeze Man vs. The Rizz Badger — Signed Copy',
    price: 1500,
    description: 'Signed copy of Book 3 by Zubair Raymond Latib',
  },
  'bundle-3book': {
    name: 'Breeze Man 3-Book Signed Bundle',
    price: 2900,
    description:
      'All three signed Breeze Man books — the complete collection. Signed by the author, Zubair Raymond Latib. Great for gifts.',
  },
};

export async function action({ request }: Route.ActionArgs) {
  try {
    const json = await request.json();
    const { productId } = CheckoutSchema.parse(json);
    const product = PRODUCTS[productId]!;

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const connectedAccountId = process.env.STRIPE_CONNECTED_ACCOUNT_ID;

    if (!stripeSecretKey || stripeSecretKey.startsWith('sk_test_placeholder')) {
      return Response.json(
        { error: 'Stripe is not configured yet. Please check back soon!' },
        { status: 503 },
      );
    }

    const { default: StripeClient } = await import('stripe');
    const stripe = new StripeClient(stripeSecretKey);

    const origin = new URL(request.url).origin;

    // Destination charges: platform creates the session, transfer_data routes funds to Zuber.
    // application_fee_amount keeps the platform's cut before the transfer.
    let paymentIntentData:
      | Stripe.Checkout.SessionCreateParams['payment_intent_data']
      | undefined;

    if (connectedAccountId) {
      const platformFee = getPlatformFeeAmount();
      paymentIntentData = {
        transfer_data: { destination: connectedAccountId },
        ...(platformFee > 0 ? { application_fee_amount: platformFee } : {}),
      };
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.price,
          },
          quantity: 1,
        },
      ],
      ...(paymentIntentData ? { payment_intent_data: paymentIntentData } : {}),
      success_url: `${origin}/?success=true`,
      cancel_url: `${origin}/?canceled=true`,
      metadata: { productId },
    };

    // Log the charge routing for ops visibility (no sensitive data)
    if (connectedAccountId) {
      const { displayName } = await getConnectedAccountInfo(
        stripe,
        connectedAccountId,
      );
      console.log(
        `[store/checkout] destination charge → ${connectedAccountId} (${displayName}), fee=${getPlatformFeeAmount()}¢`,
      );
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return Response.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);

    // Stripe Connect: the connected account hasn't been added to this platform yet.
    // Action needed: go to Stripe Dashboard → Connect and add acct_1TMtz16CZ1cr9Dv6.
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      err.code === 'account_invalid'
    ) {
      return Response.json(
        {
          error:
            'Store checkout is being set up. Please check back soon or order on Amazon!',
        },
        { status: 503 },
      );
    }

    return Response.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    );
  }
}
