import type Stripe from 'stripe';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import {
  renderNewOrderNotificationEmail,
  renderOrderConfirmationEmail,
} from '@kit/email-templates';

import type { Route } from '~/types/app/routes/api/store/+types/webhook';

const ORDER_NOTIFICATION_EMAIL = 'orders@thebrainrotbooks.com';
const ORDER_EMAIL_FROM = 'thebrainrotbooks <orders@thebrainrotbooks.com>';

const PRODUCT_NAMES: Record<string, string> = {
  'book1-signed': 'Breeze Man vs. The Laser Sharks — Signed Copy',
  'book2-signed': 'Breeze Man vs. The Basic Overlord — Signed Copy',
  'book3-signed': 'Breeze Man vs. The Rizz Badger — Signed Copy',
  'bundle-3book': 'Breeze Man 3-Book Signed Bundle',
};

async function sendStoreEmail(message: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  const payload = {
    from: ORDER_EMAIL_FROM,
    ...message,
  };

  const resendApiKey = process.env.RESEND_API_KEY;

  // Primary: n8n webhook (self-hosted, no external service)
  const n8nWebhookUrl = process.env.N8N_ORDER_WEBHOOK_URL;
  if (n8nWebhookUrl) {
    try {
      const res = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        return;
      }

      console.error('n8n webhook failed:', res.status, await res.text());
    } catch (err) {
      console.error('n8n webhook failed, falling back to Resend:', err);
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
        ...payload,
        to: [message.to],
      }),
    });

    if (!res.ok) {
      console.error('Resend failed:', res.status, await res.text());
    }

    return;
  }

  // Last resort: log so orders are never silently lost
  console.log('STORE EMAIL (no email configured):', message);
}

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
  const {
    productName,
    amountPaid,
    orderId,
    customerEmail,
    customerName,
    shippingAddress,
  } = orderDetails;

  const amountFormatted = `$${(amountPaid / 100).toFixed(2)}`;

  // Plain-text fallback for n8n webhook and logging
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

  const emailBody = `New order received!\n\nProduct: ${productName}\nAmount: ${amountFormatted}\nOrder ID: ${orderId}\n\nShip to:\n${shippingBlock}\n\nCustomer email: ${customerEmail}`;

  // Render the branded HTML template
  const { html: htmlBody, subject } = await renderNewOrderNotificationEmail({
    productName,
    amountPaid: amountFormatted,
    orderId,
    customerEmail,
    customerName,
    shippingAddress,
  });

  await sendStoreEmail({
    subject,
    text: emailBody,
    html: htmlBody,
    to: ORDER_NOTIFICATION_EMAIL,
  });
}

async function sendCustomerConfirmationEmail(orderDetails: {
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
  if (!orderDetails.customerEmail) {
    return;
  }

  const amountFormatted = `$${(orderDetails.amountPaid / 100).toFixed(2)}`;

  const { html, subject } = await renderOrderConfirmationEmail({
    customerName: orderDetails.customerName,
    orderId: orderDetails.orderId,
    items: [
      {
        title: orderDetails.productName,
        quantity: 1,
        price: amountFormatted,
      },
    ],
    total: amountFormatted,
    shippingAddress: orderDetails.shippingAddress
      ? {
          ...orderDetails.shippingAddress,
          name: orderDetails.customerName,
        }
      : null,
    estimatedDelivery:
      'Signed copies are prepared by Zubair and shipped as soon as possible.',
  });

  const text = [
    `Your Brain Rot Books order is confirmed.`,
    '',
    `Order ID: ${orderDetails.orderId}`,
    `Product: ${orderDetails.productName}`,
    `Total: ${amountFormatted}`,
    '',
    'Thank you for supporting Zubair and The Brain Rot Books.',
  ].join('\n');

  await sendStoreEmail({
    to: orderDetails.customerEmail,
    subject,
    text,
    html,
  });
}

/**
 * Stripe webhook: direct charges to the Singularity Labs platform account.
 *
 * All checkouts land on the platform Stripe account; there are no connected accounts or
 * transfer_data routing. `checkout.session.completed` fires on the platform account, so a
 * single webhook endpoint with `STRIPE_WEBHOOK_SECRET` is all that's needed. Settlement
 * with the book author is handled manually outside Stripe.
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
    const buyerAddressJson =
      customerDetails?.address ?? shippingDetails?.address ?? null;
    const productId = session.metadata?.productId ?? 'unknown';
    const productName = PRODUCT_NAMES[productId] ?? productId;

    // Insert into `store_orders` (custom Breeze Man Books table) — NOT the
    // Makerkit `public.orders` table which belongs to the billing schema.
    // See migration 20260422000000_store_orders.sql. Generated Supabase types
    // will include store_orders after `pnpm supabase:web:typegen` is re-run
    // against the updated schema; until then we scope an `as any` to `.from()`
    // only so the insert payload itself remains plain-typed.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const storeOrders = (supabase.from as any)('store_orders') as {
      insert: (row: Record<string, unknown>) => Promise<{ error: unknown }>;
    };
    const { error: insertError } = await storeOrders.insert({
      stripe_session_id: session.id,
      book_title: productName,
      quantity: 1,
      amount_total: session.amount_total ?? 0,
      currency: session.currency ?? 'usd',
      buyer_name: buyerName || null,
      buyer_email: buyerEmail || null,
      buyer_address: buyerAddressJson,
      status: 'paid',
    });

    if (insertError) {
      console.error('store_orders insert failed:', insertError);
    }

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

    await sendCustomerConfirmationEmail({
      productName,
      amountPaid: session.amount_total ?? 0,
      orderId: session.id,
      customerEmail: buyerEmail,
      customerName: buyerName,
      shippingAddress,
    }).catch((err) => {
      console.error('Customer confirmation email failed (non-fatal):', err);
    });
  }

  return new Response('ok', { status: 200 });
}
