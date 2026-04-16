import type Stripe from 'stripe';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type { Route } from '~/types/app/routes/api/store/+types/webhook';

const ORDER_NOTIFICATION_EMAIL = 'orders@thebrainrotbooks.com';

const PRODUCT_NAMES: Record<string, string> = {
  'book1-signed': 'Breeze Man vs. The Laser Sharks — Signed Copy',
  'book2-signed': 'Breeze Man vs. The Basic Overlord — Signed Copy',
  'book3-signed': 'Breeze Man vs. The Rizz Badger — Signed Copy',
  'bundle-3book': 'Breeze Man 3-Book Signed Bundle',
};

async function sendOrderNotificationEmail(orderDetails: {
  productName: string;
  amountPaid: number;
  orderId: string;
  customerEmail: string;
  customerName: string;
  shippingAddress: {
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  } | null;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;

  const {
    productName,
    amountPaid,
    orderId,
    customerEmail,
    customerName,
    shippingAddress,
  } = orderDetails;

  const amountFormatted = `$${(amountPaid / 100).toFixed(2)}`;

  const shippingBlock = shippingAddress
    ? [
        customerName,
        shippingAddress.line1,
        shippingAddress.line2,
        `${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}`,
        shippingAddress.country,
      ]
        .filter(Boolean)
        .join('\n')
    : 'No shipping address captured';

  const emailBody = `New order received!

Product: ${productName}
Amount: ${amountFormatted}
Order ID: ${orderId}

Ship to:
${shippingBlock}

Customer email: ${customerEmail}`;

  const htmlBody = `<p>New order received!</p>
<table>
  <tr><td><strong>Product:</strong></td><td>${productName}</td></tr>
  <tr><td><strong>Amount:</strong></td><td>${amountFormatted}</td></tr>
  <tr><td><strong>Order ID:</strong></td><td>${orderId}</td></tr>
</table>
<p><strong>Ship to:</strong><br>${shippingBlock.replace(/\n/g, '<br>')}</p>
<p><strong>Customer email:</strong> ${customerEmail}</p>`;

  // Primary: n8n webhook (self-hosted, no external service)
  const n8nWebhookUrl = process.env.N8N_ORDER_WEBHOOK_URL;
  if (n8nWebhookUrl) {
    try {
      await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'New Order — Brain Rot Books',
          text: emailBody,
          html: htmlBody,
          to: ORDER_NOTIFICATION_EMAIL,
        }),
      });
      return;
    } catch (err) {
      console.error('n8n webhook failed, falling back to log:', err);
    }
  }

  // Fallback: Resend API (if configured)
  if (resendApiKey) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Brain Rot Books Orders <orders@thebrainrotbooks.com>',
        to: [ORDER_NOTIFICATION_EMAIL],
        subject: 'New Order — Brain Rot Books',
        text: emailBody,
        html: htmlBody,
      }),
    });
    if (!res.ok) console.error('Resend failed:', res.status, await res.text());
    return;
  }

  // Last resort: log so orders are never silently lost
  console.log('ORDER NOTIFICATION (no email configured):', emailBody);
}

/**
 * Stripe Connect webhook note:
 *
 * This store uses the DESTINATION CHARGES model. The platform (Singularity Labs) creates
 * the Checkout Session; `payment_intent_data.transfer_data.destination` routes funds to the
 * connected account (Zuber's acct_1TMtz16CZ1cr9Dv6) after settlement.
 *
 * With destination charges, `checkout.session.completed` fires on the PLATFORM account, so
 * this single webhook endpoint handles everything correctly. No separate Connect webhook
 * endpoint is needed.
 *
 * If the model were ever changed to DIRECT charges (stripeAccount header), you would need:
 * - A separate webhook registered in the Stripe Connect dashboard for the connected account
 * - A different webhook secret (STRIPE_CONNECT_WEBHOOK_SECRET)
 * - This endpoint checking `event.account` to distinguish platform vs. connected events
 */
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

    // In Stripe v20, shipping details moved to collected_information.shipping_details.
    // customer_details remains at the top level.
    const shippingDetails = session.collected_information?.shipping_details;
    const customerDetails = session.customer_details;

    const shippingAddress = shippingDetails?.address
      ? {
          line1: shippingDetails.address.line1 ?? '',
          line2: shippingDetails.address.line2 ?? null,
          city: shippingDetails.address.city ?? '',
          state: shippingDetails.address.state ?? '',
          postalCode: shippingDetails.address.postal_code ?? '',
          country: shippingDetails.address.country ?? '',
        }
      : null;

    const buyerName = shippingDetails?.name ?? customerDetails?.name ?? '';
    const buyerEmail = customerDetails?.email ?? '';
    const productId = session.metadata?.productId ?? 'unknown';
    const productName = PRODUCT_NAMES[productId] ?? productId;

    // The store orders table has custom columns (book_title, buyer_name, etc.) that were
    // added via migration 20260320000000_orders.sql. The Supabase types reflect the billing
    // module's orders table instead — cast to bypass until `supabase:web:typegen` is re-run.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from as any)('orders').insert({
      book_title: productId,
      quantity: 1,
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      buyer_address: shippingAddress
        ? [
            shippingAddress.line1,
            shippingAddress.line2,
            `${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}`,
            shippingAddress.country,
          ]
            .filter(Boolean)
            .join(', ')
        : '',
      stripe_session_id: session.id,
      status: 'pending',
    });

    await sendOrderNotificationEmail({
      productName,
      amountPaid: session.amount_total ?? 0,
      orderId: session.id,
      customerEmail: buyerEmail,
      customerName: buyerName,
      shippingAddress,
    }).catch((err) => {
      console.error('Order notification email failed (non-fatal):', err);
    });
  }

  return new Response('ok', { status: 200 });
}
