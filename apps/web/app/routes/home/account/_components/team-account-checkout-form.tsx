import { useFetcher } from 'react-router';

import { EmbeddedCheckout } from '@kit/billing-gateway/checkout';
import { PlanPicker } from '@kit/billing-gateway/components';
import { useAppEvents } from '@kit/shared/events';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';

import billingConfig from '~/config/billing.config';

export function TeamAccountCheckoutForm(params: {
  accountId: string;
  accountSlug: string;
  customerId: string | null | undefined;
}) {
  const appEvents = useAppEvents();

  const fetcher = useFetcher<{
    checkoutToken: string;
  }>();

  const pending = fetcher.state === 'submitting';

  // only allow trial if the user is not already a customer
  const canStartTrial = !params.customerId;
  const checkoutToken = fetcher.data?.checkoutToken;

  return (
    <>
      <If condition={checkoutToken}>
        <EmbeddedCheckout
          checkoutToken={checkoutToken!}
          provider={billingConfig.provider}
          onClose={() =>
            fetcher.reset({
              reason: 'Checkout was closed',
            })
          }
        />
      </If>

      <Card>
        <CardHeader>
          <CardTitle>
            <Trans i18nKey={'billing:manageTeamPlan'} />
          </CardTitle>

          <CardDescription>
            <Trans i18nKey={'billing:manageTeamPlanDescription'} />
          </CardDescription>
        </CardHeader>

        <CardContent>
          <PlanPicker
            pending={pending}
            config={billingConfig}
            canStartTrial={canStartTrial}
            onSubmit={(payload) => {
              return fetcher.submit(
                {
                  intent: 'account-checkout',
                  payload: {
                    slug: params.accountSlug,
                    accountId: params.accountId,
                    ...payload,
                  },
                },
                {
                  action: '/api/billing/checkout',
                  method: 'POST',
                  encType: 'application/json',
                },
              );

              appEvents.emit({
                type: 'checkout.started',
                payload: {
                  planId: payload.planId,
                  account: params.accountSlug,
                },
              });
            }}
          />
        </CardContent>
      </Card>
    </>
  );
}
