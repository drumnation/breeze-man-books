import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type { Route } from '~/types/app/routes/api/store/+types/webhook';

export async function action({ request }: Route.ActionArgs) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey || !webhookSecret) {
    return new Response('Stripe not configured', { status: 500 });
  }

  const { default: Stripe } = await import('stripe');
  const stripe = new Stripe(stripeSecretKey);

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const supabase = getSupabaseServerClient(request);

    const shippingDetails = session.shipping_details;

    await supabase.from('orders').insert({
      book_title: session.metadata?.productId ?? 'unknown',
      quantity: 1,
      buyer_name: shippingDetails?.name ?? session.customer_details?.name ?? '',
      buyer_email: session.customer_details?.email ?? '',
      buyer_address: shippingDetails?.address
        ? `${shippingDetails.address.line1 ?? ''}, ${shippingDetails.address.city ?? ''}, ${shippingDetails.address.state ?? ''} ${shippingDetails.address.postal_code ?? ''}, ${shippingDetails.address.country ?? ''}`
        : '',
      stripe_session_id: session.id,
      status: 'pending',
    });

    // TODO: Send notification email to gordon@singularity-labs.org
  }

  return new Response('ok', { status: 200 });
}
