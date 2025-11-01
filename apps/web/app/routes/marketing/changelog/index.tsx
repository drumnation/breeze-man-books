import { useLoaderData } from 'react-router';

import { useTranslation } from 'react-i18next';

import { createCmsClient } from '@kit/cms';
import { getLogger } from '@kit/shared/logger';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { Route } from '~/types/app/routes/marketing/changelog/+types';

import { SitePageHeader } from '../_components/site-page-header';
import { ChangelogEntry } from './_components/changelog-entry';
import { ChangelogPagination } from './_components/changelog-pagination';

const CHANGELOG_ENTRIES_PER_PAGE = 50;

export const meta = ({ loaderData }: Route.MetaArgs) => {
  return [
    {
      title: loaderData.title,
      description: loaderData.description,
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const { t, resolvedLanguage: language } = await createI18nServerInstance(
    args.request,
  );

  const searchParams = new URL(args.request.url).searchParams;
  const pageSearchParam = searchParams.get('page');
  const limit = CHANGELOG_ENTRIES_PER_PAGE;
  const page = pageSearchParam ? parseInt(pageSearchParam) : 0;
  const offset = page * limit;

  const { total, items } = await getContentItems(language, limit, offset);

  return {
    title: t('marketing:changelog'),
    description: t('marketing:changelogSubtitle'),
    items,
    total,
    page,
    canGoToNextPage: offset + limit < total,
    canGoToPreviousPage: page > 0,
  };
}

async function getContentItems(
  language: string | undefined,
  limit: number,
  offset: number,
) {
  const client = await createCmsClient();
  const logger = await getLogger();

  try {
    return await client.getContentItems({
      collection: 'changelog',
      limit,
      offset,
      content: false,
      language,
      sortBy: 'publishedAt',
      sortDirection: 'desc',
    });
  } catch (error) {
    logger.error({ error }, 'Failed to load changelog entries');

    return { total: 0, items: [] };
  }
}

function ChangelogPage() {
  const { items, page, canGoToNextPage, canGoToPreviousPage } =
    useLoaderData<typeof loader>();

  const { t } = useTranslation();

  return (
    <>
      <SitePageHeader
        title={t('marketing:changelog')}
        subtitle={t('marketing:changelogSubtitle')}
      />

      <div className="container flex max-w-4xl flex-col space-y-12 py-12">
        <If
          condition={items.length > 0}
          fallback={<Trans i18nKey="marketing:noChangelogEntries" />}
        >
          <div className="space-y-0">
            {items.map((item, index) => {
              return (
                <ChangelogEntry
                  key={item.id}
                  entry={item}
                  highlight={index === 0}
                />
              );
            })}
          </div>

          <ChangelogPagination
            currentPage={page}
            canGoToNextPage={canGoToNextPage}
            canGoToPreviousPage={canGoToPreviousPage}
          />
        </If>
      </div>
    </>
  );
}

export default ChangelogPage;
