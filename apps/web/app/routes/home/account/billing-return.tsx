import { lazy } from 'react';

import { redirect } from 'react-router';

import { SupabaseClient } from '@supabase/supabase-js';

import { getBillingGatewayProvider } from '@kit/billing-gateway';
import { BillingSessionStatus } from '@kit/billing-gateway/components';
import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import billingConfig from '~/config/billing.config';
import { Database } from '~/lib/database.types';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import type { Route } from '~/types/app/routes/home/account/+types/billing-return';

export const meta = ({ data }: Route.MetaArgs) => {
  return [
    {
      title: data?.title,
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const client = getSupabaseServerClient(args.request);
  const i18n = await createI18nServerInstance(args.request);

  const searchParams = new URL(args.request.url).searchParams;
  const title = i18n.t('teams:billing.pageTitle');

  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    throw redirect('../billing');
  }

  const { customerEmail, checkoutToken } = await loadCheckoutSession(
    client,
    sessionId,
  );

  return {
    title,
    customerEmail,
    checkoutToken,
  };
}

const LazyEmbeddedCheckout = lazy(async () => {
  const { EmbeddedCheckout } = await import('@kit/billing-gateway/checkout');

  return {
    default: EmbeddedCheckout,
  };
});

export default function ReturnCheckoutSessionPage(props: Route.ComponentProps) {
  const { checkoutToken, customerEmail } = props.loaderData;

  if (checkoutToken) {
    return (
      <LazyEmbeddedCheckout
        checkoutToken={checkoutToken}
        provider={billingConfig.provider}
      />
    );
  }

  return (
    <>
      <div className={'fixed top-48 left-0 z-50 mx-auto w-full'}>
        <BillingSessionStatus
          redirectPath={'../'}
          customerEmail={customerEmail ?? ''}
        />
      </div>

      <BlurryBackdrop />
    </>
  );
}

function BlurryBackdrop() {
  return (
    <div
      className={
        'bg-background/30 fixed top-0 left-0 w-full backdrop-blur-sm' +
        ' !m-0 h-full'
      }
    />
  );
}

async function loadCheckoutSession(
  client: SupabaseClient<Database>,
  sessionId: string,
) {
  const { error } = await requireUser(client);

  if (error) {
    throw new Error('Authentication required');
  }

  const gateway = await getBillingGatewayProvider(client);

  const session = await gateway.retrieveCheckoutSession({
    sessionId,
  });

  if (!session) {
    throw redirect('../billing');
  }

  const checkoutToken = session.isSessionOpen ? session.checkoutToken : null;

  // otherwise - we show the user the return page
  // and display the details of the session
  return {
    status: session.status,
    customerEmail: session.customer.email,
    checkoutToken,
  };
}
