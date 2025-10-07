import { PricingTable } from '@kit/billing-gateway/marketing';

import billingConfig from '~/config/billing.config';
import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { SitePageHeader } from '~/routes/marketing/_components/site-page-header';
import type { Route } from '~/types/app/routes/marketing/+types/pricing';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { t } = await createI18nServerInstance(request);

  return {
    title: t('marketing:pricing'),
    subtitle: t('marketing:pricingSubtitle'),
  };
};

export const meta = ({ data }: Route.MetaArgs) => {
  return [
    {
      title: data?.title,
    },
  ];
};

const paths = {
  signUp: pathsConfig.auth.signUp,
  return: pathsConfig.app.home,
};

export default function PricingPage(props: Route.ComponentProps) {
  const data = props.loaderData;

  return (
    <div className={'flex flex-col space-y-8'}>
      <SitePageHeader title={data.title} subtitle={data.subtitle} />

      <div className={'container mx-auto pb-8 xl:pb-16'}>
        <PricingTable paths={paths} config={billingConfig} />
      </div>
    </div>
  );
}
