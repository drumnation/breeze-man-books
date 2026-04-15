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

const PRODUCTS: Record<string, { name: string; price: number; description: string }> = {
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
      'All three signed Breeze Man books — great for gifts, reading groups, and classrooms. By Zubair Raymond Latib.',
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

    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(stripeSecretKey);

    const origin = new URL(request.url).origin;

    const sessionParams: any = {
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
      success_url: `${origin}/store?success=true`,
      cancel_url: `${origin}/store?canceled=true`,
      metadata: { productId },
    };

    // If using Stripe Connect, charge on behalf of the connected account
    const session = connectedAccountId
      ? await stripe.checkout.sessions.create(sessionParams, {
          stripeAccount: connectedAccountId,
        })
      : await stripe.checkout.sessions.create(sessionParams);

    return Response.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    return Response.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    );
  }
}
