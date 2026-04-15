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

  const { productName, amountPaid, orderId, customerEmail, customerName, shippingAddress } =
    orderDetails;

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

  if (!resendApiKey) {
    // TODO: Set RESEND_API_KEY env var to enable email notifications.
    // Sign up at https://resend.com and create an API key.
    // For now, log the order details so they are not lost.
    console.log('ORDER NOTIFICATION (email not configured — set RESEND_API_KEY):', emailBody);
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: 'Brain Rot Books Orders <orders@thebrainrotbooks.com>',
      to: [ORDER_NOTIFICATION_EMAIL],
      subject: `New Order — Brain Rot Books`,
      text: emailBody,
      html: htmlBody,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Failed to send order notification email:', res.status, errorText);
  }
}

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

    await supabase.from('orders').insert({
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
