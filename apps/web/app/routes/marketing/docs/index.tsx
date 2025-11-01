import { useRouteLoaderData } from 'react-router';

import { Cms } from '@kit/cms';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { SitePageHeader } from '~/routes/marketing/_components/site-page-header';
import type { Route } from '~/types/app/routes/marketing/docs/+types';

import { DocsCards } from './_components/docs-cards';
import type { loader as docsLoader } from './layout';

export const loader = async (args: Route.LoaderArgs) => {
  const { t } = await createI18nServerInstance(args.request);

  return {
    title: t('marketing:documentation'),
    description: t('marketing:documentationSubtitle'),
  };
};

export const meta = ({ loaderData }: Route.MetaArgs) => {
  return [
    {
      title: loaderData?.title,
      description: loaderData?.description,
    },
  ];
};

export default function DocsPage(props: Route.ComponentProps) {
  const { title, description } = props.loaderData;

  const data = useRouteLoaderData<typeof docsLoader>(
    'routes/marketing/docs/layout',
  );

  // only top level cards
  const cards = (data?.pages ?? []).filter((item) => !item.parentId);

  return (
    <div className={'flex flex-col space-y-6 xl:space-y-8'}>
      <SitePageHeader title={title} subtitle={description} />

      <div className={'flex flex-col items-center'}>
        <div className={'container mx-auto max-w-5xl'}>
          <DocsCards cards={cards as Cms.ContentItem[]} />
        </div>
      </div>
    </div>
  );
}
