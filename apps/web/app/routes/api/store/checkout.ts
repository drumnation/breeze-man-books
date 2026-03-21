import { z } from 'zod';

import type { Route } from '~/types/app/routes/api/store/+types/checkout';

const CheckoutSchema = z.object({
  productId: z.enum([
    'book1-signed',
    'book2-signed',
    'book3-signed',
    'classroom-pack',
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
  'classroom-pack': {
    name: 'Breeze Man Classroom Pack (5 books)',
    price: 3500,
    description: '5 books for classroom use by Zubair Raymond Latib',
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

    // Support both direct account and Connect connected accounts
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
    const options: any = {};
    if (connectedAccountId) {
      options.stripeAccount = connectedAccountId;
    }

    const session = await stripe.checkout.sessions.create(sessionParams, options);

    return Response.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    return Response.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    );
  }
}
