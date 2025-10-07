import { data, redirect } from 'react-router';

import { Cms, ContentRenderer, createCmsClient } from '@kit/cms';
import { If } from '@kit/ui/if';
import { Separator } from '@kit/ui/separator';
import { cn } from '@kit/ui/utils';

import type { Route } from '~/types/app/routes/marketing/docs/+types/$slug';

import { DocsCards } from './_components/docs-cards';

const getPageBySlug = async (slug: string) => {
  const client = await createCmsClient();

  return client.getContentItemBySlug({ slug, collection: 'documentation' });
};

export const meta = (args: Route.MetaArgs) => {
  if (!args.data) {
    return [];
  }

  const { title, description } = args.data.page;

  return [
    {
      title,
      description,
    },
  ];
};

export const loader = async ({ params }: Route.LoaderArgs) => {
  const page = await getPageBySlug(params['*'] as string);

  if (!page) {
    throw redirect('/404');
  }

  return data({
    page,
  });
};

export default function DocumentationPage(props: Route.ComponentProps) {
  const { page } = props.loaderData;
  const description = page?.description ?? '';

  return (
    <div className={'flex flex-1 flex-col'}>
      <article className={cn('gap-y-12 overflow-y-auto px-4')}>
        <section
          className={'flex flex-col gap-y-1 border-b border-dashed pb-4'}
        >
          <h1 className={'text-foreground text-3xl'}>{page.title}</h1>

          <h2 className={'text-secondary-foreground/80 text-lg'}>
            {description}
          </h2>
        </section>

        <div className={'markdoc'}>
          <ContentRenderer content={page.content} />
        </div>

        <If condition={page.children.length > 0}>
          <Separator />

          <DocsCards cards={(page.children ?? []) as Cms.ContentItem[]} />
        </If>
      </article>
    </div>
  );
}
