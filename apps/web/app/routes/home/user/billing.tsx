import { Form } from 'react-router';

import {
  BillingPortalCard,
  CurrentLifetimeOrderCard,
  CurrentSubscriptionCard,
} from '@kit/billing-gateway/components';
import { CsrfTokenFormField, useCsrfToken } from '@kit/csrf/client';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { If } from '@kit/ui/if';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import billingConfig from '~/config/billing.config';
import { resolveProductPlan } from '~/lib/billing/.server/resolve-product-plan.server';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { requireUserLoader } from '~/lib/require-user-loader';
import { HomeLayoutPageHeader } from '~/routes/home/user/_components/home-page-header';
import type { Route } from '~/types/app/routes/home/user/+types/billing';

import { PersonalAccountCheckoutForm } from './_components/personal-account-checkout-form';
import { loadPersonalAccountBillingPageData } from './_lib/load-personal-account-billing.server';

export const meta = ({ data }: Route.MetaArgs) => {
  return [
    {
      title: data?.title,
    },
  ];
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const user = await requireUserLoader(request);
  const { t } = await createI18nServerInstance(request);

  const client = getSupabaseServerClient(request);

  const [data, customerId] = await loadPersonalAccountBillingPageData({
    userId: user.id,
    client,
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
    title: t('account:billingTab'),
    data,
    customerId,
    productPlan,
  };
};

export default function PersonalAccountBillingPage(
  props: Route.ComponentProps,
) {
  const { data, customerId, productPlan } = props.loaderData;

  return (
    <>
      <HomeLayoutPageHeader
        title={<Trans i18nKey={'common:routes.billing'} />}
        description={<AppBreadcrumbs />}
      />

      <PageBody>
        <div className={'flex max-w-2xl flex-col space-y-4'}>
          <If condition={!data}>
            <PersonalAccountCheckoutForm customerId={customerId} />

            <If condition={customerId}>
              <CustomerBillingPortalForm />
            </If>
          </If>

          <If condition={data}>
            {(data) => (
              <div className={'flex w-full flex-col space-y-6'}>
                {'active' in data ? (
                  <CurrentSubscriptionCard
                    subscription={data}
                    product={productPlan!.product}
                    plan={productPlan!.plan}
                  />
                ) : (
                  <CurrentLifetimeOrderCard
                    order={data}
                    config={billingConfig}
                  />
                )}

                <If condition={!data}>
                  <PersonalAccountCheckoutForm customerId={customerId} />
                </If>

                <If condition={customerId}>
                  <CustomerBillingPortalForm />
                </If>
              </div>
            )}
          </If>
        </div>
      </PageBody>
    </>
  );
}

function CustomerBillingPortalForm() {
  const csrfToken = useCsrfToken();

  return (
    <Form method={'POST'} action={'/api/billing/customer-portal'}>
      <input
        type="hidden"
        name={'intent'}
        value={'personal-account-billing-portal'}
      />

      <CsrfTokenFormField value={csrfToken} />

      <BillingPortalCard />
    </Form>
  );
}
