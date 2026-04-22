import type Stripe from 'stripe';
import { z } from 'zod';

import type { Route } from '~/types/app/routes/api/store/+types/checkout';

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
    price: 1200,
    description: 'Signed copy of Book 1 by Zubair Raymond Latib',
  },
  'book2-signed': {
    name: 'Breeze Man vs. The Basic Overlord — Signed Copy',
    price: 1200,
    description: 'Signed copy of Book 2 by Zubair Raymond Latib',
  },
  'book3-signed': {
    name: 'Breeze Man vs. The Rizz Badger — Signed Copy',
    price: 1200,
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

    if (!stripeSecretKey || stripeSecretKey.startsWith('sk_test_placeholder')) {
      return Response.json(
        { error: 'Stripe is not configured yet. Please check back soon!' },
        { status: 503 },
      );
    }

    const { default: StripeClient } = await import('stripe');
    const stripe = new StripeClient(stripeSecretKey);

    const origin = new URL(request.url).origin;

    // Direct charges: Singularity Labs is the merchant of record. All funds land on the
    // platform Stripe account. Settlement with the author is handled manually outside Stripe.
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
      success_url: `${origin}/?success=true`,
      cancel_url: `${origin}/?canceled=true`,
      metadata: { productId },
    };

    console.log(
      `[store/checkout] direct charge to platform (product=${productId})`,
    );

    const session = await stripe.checkout.sessions.create(sessionParams);

    return Response.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);

    return Response.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    );
  }
}
