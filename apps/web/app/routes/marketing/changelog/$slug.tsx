import { redirect, useLoaderData } from 'react-router';

import { createCmsClient } from '@kit/cms';

import { Route } from '~/types/app/routes/marketing/changelog/+types/$slug';

import { ChangelogDetail } from './_components/changelog-detail';

export function meta({ loaderData }: Route.MetaArgs) {
  const { title, publishedAt, description, image } = loaderData.entry;

  return [
    {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
        publishedTime: publishedAt,
        url: loaderData.entry.url,
        images: image
          ? [
              {
                url: image,
              },
            ]
          : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: image ? [image] : [],
      },
    },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const slug = params.slug as string;
  const data = await getChangelogData(slug);

  if (!data) {
    return redirect('/404');
  }

  return {
    entry: data.entry,
    previousEntry: data.previousEntry,
    nextEntry: data.nextEntry,
  };
}

function ChangelogEntryPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="container sm:max-w-none sm:p-0">
      <ChangelogDetail
        entry={data.entry}
        content={data.entry.content}
        previousEntry={data.previousEntry ?? null}
        nextEntry={data.nextEntry ?? null}
      />
    </div>
  );
}

export default ChangelogEntryPage;

async function getChangelogData(slug: string) {
  const client = await createCmsClient();

  const [entry, allEntries] = await Promise.all([
    client.getContentItemBySlug({ slug, collection: 'changelog' }),
    client.getContentItems({
      collection: 'changelog',
      sortBy: 'publishedAt',
      sortDirection: 'desc',
      content: false,
    }),
  ]);

  if (!entry) {
    return null;
  }

  // Find previous and next entries in the timeline
  const currentIndex = allEntries.items.findIndex((item) => item.slug === slug);

  const previousEntry =
    currentIndex > 0 ? allEntries.items[currentIndex - 1] : null;

  const nextEntry =
    currentIndex < allEntries.items.length - 1
      ? allEntries.items[currentIndex + 1]
      : null;

  return {
    entry,
    previousEntry,
    nextEntry,
  };
}
