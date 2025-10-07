import { useMemo } from 'react';

import { useFetcher } from 'react-router';

import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

import {
  BillingPortalCard,
  CurrentLifetimeOrderCard,
  CurrentSubscriptionCard,
} from '@kit/billing-gateway/components';
import { useCsrfToken } from '@kit/csrf/client';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { If } from '@kit/ui/if';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import billingConfig from '~/config/billing.config';
import { resolveProductPlan } from '~/lib/billing/.server/resolve-product-plan.server';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { requireUserLoader } from '~/lib/require-user-loader';
import type { Route } from '~/types/app/routes/home/account/+types/billing';

import { TeamAccountCheckoutForm } from './_components/team-account-checkout-form';
import { TeamAccountLayoutPageHeader } from './_components/team-account-layout-page-header';
import { loadTeamAccountBillingPage } from './_lib/load-team-account-billing-page.server';
import { loadTeamWorkspace } from './_lib/team-account-workspace-loader.server';

export const meta = ({ data }: Route.MetaArgs) => {
  return [
    {
      title: data?.title,
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  await requireUserLoader(args.request);

  const client = getSupabaseServerClient(args.request);
  const accountSlug = args.params.account as string;

  const i18n = await createI18nServerInstance(args.request);
  const title = i18n.t('teams:billing.pageTitle');

  const workspace = await loadTeamWorkspace({
    client,
    accountSlug,
  });

  const accountId = workspace.account.id;

  const [data, customerId] = await loadTeamAccountBillingPage({
    client,
    accountId,
  });

  const variantId = data ? data.items[0]!.variant_id : '';

  const productPlan = variantId
    ? await resolveProductPlan(
        client,
        billingConfig,
        variantId,
        data?.currency || 'USD',
      )
    : null;

  return {
    title,
    data,
    customerId,
    accountId,
    workspace,
    accountSlug,
    productPlan,
  };
}

export default function TeamAccountBillingPage(props: Route.ComponentProps) {
  const { data, workspace, customerId, accountId, accountSlug, productPlan } =
    props.loaderData;

  const canManageBilling =
    workspace.account.permissions.includes('billing.manage');

  const fetcher = useFetcher();
  const csrfToken = useCsrfToken();

  const Checkout = useMemo(() => {
    if (!canManageBilling) {
      return <CannotManageBillingAlert />;
    }

    return (
      <TeamAccountCheckoutForm
        customerId={customerId}
        accountId={accountId}
        accountSlug={accountSlug}
      />
    );
  }, [accountId, accountSlug, canManageBilling, customerId]);

  const BillingPortal = useMemo(() => {
    if (!canManageBilling || !customerId) {
      return null;
    }

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();

          return fetcher.submit(
            {
              intent: 'account-billing-portal',
              payload: {
                accountId,
                slug: accountSlug,
                csrfToken,
              },
            },
            {
              action: '/api/billing/customer-portal',
              method: 'POST',
              encType: 'application/json',
            },
          );
        }}
      >
        <BillingPortalCard />
      </form>
    );
  }, [
    accountId,
    accountSlug,
    canManageBilling,
    customerId,
    fetcher,
    csrfToken,
  ]);

  return (
    <>
      <TeamAccountLayoutPageHeader
        account={accountSlug}
        title={<Trans i18nKey={'common:billingTabLabel'} />}
        description={<AppBreadcrumbs />}
      />

      <PageBody>
        <div className={`flex w-full max-w-2xl flex-col space-y-4`}>
          <If condition={data} fallback={<div>{Checkout}</div>}>
            {(data) => {
              if ('active' in data) {
                return (
                  <CurrentSubscriptionCard
                    subscription={data}
                    product={productPlan!.product}
                    plan={productPlan!.plan}
                  />
                );
              }

              return (
                <CurrentLifetimeOrderCard order={data} config={billingConfig} />
              );
            }}
          </If>

          {BillingPortal}
        </div>
      </PageBody>
    </>
  );
}

function CannotManageBillingAlert() {
  return (
    <Alert variant={'warning'}>
      <ExclamationTriangleIcon className={'h-4'} />

      <AlertTitle>
        <Trans i18nKey={'billing:cannotManageBillingAlertTitle'} />
      </AlertTitle>

      <AlertDescription>
        <Trans i18nKey={'billing:cannotManageBillingAlertDescription'} />
      </AlertDescription>
    </Alert>
  );
}
