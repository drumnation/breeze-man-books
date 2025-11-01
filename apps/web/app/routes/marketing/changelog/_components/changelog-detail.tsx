import { Link } from 'react-router';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { Cms } from '@kit/cms';
import { ContentRenderer } from '@kit/cms';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

import { CoverImage } from '../../blog/_components/cover-image';
import { DateFormatter } from '../../blog/_components/date-formatter';

interface ChangelogDetailProps {
  entry: Cms.ContentItem;
  content: unknown;
  previousEntry: Cms.ContentItem | null;
  nextEntry: Cms.ContentItem | null;
}

interface ChangelogNavigationProps {
  previousEntry: Cms.ContentItem | null;
  nextEntry: Cms.ContentItem | null;
}

interface NavLinkProps {
  entry: Cms.ContentItem;
  direction: 'previous' | 'next';
}

export function ChangelogDetail({
  entry,
  content,
  previousEntry,
  nextEntry,
}: ChangelogDetailProps) {
  return (
    <div>
      <ChangelogHeader entry={entry} />

      <div className="mx-auto flex max-w-3xl flex-col space-y-6 py-8">
        <article className="markdoc">
          <ContentRenderer content={content} />
        </article>
      </div>

      <ChangelogNavigation
        previousEntry={previousEntry}
        nextEntry={nextEntry}
      />
    </div>
  );
}

function NavLink({ entry, direction }: NavLinkProps) {
  const isPrevious = direction === 'previous';

  const Icon = isPrevious ? ChevronLeft : ChevronRight;
  const i18nKey = isPrevious
    ? 'marketing:changelogNavigationPrevious'
    : 'marketing:changelogNavigationNext';

  return (
    <Link
      to={`/changelog/${entry.slug}`}
      className={cn(
        'border-border/50 hover:bg-muted/50 group flex flex-col gap-2 rounded-lg border p-4 transition-all',
        !isPrevious && 'text-right md:items-end',
      )}
    >
      <div className="text-muted-foreground flex items-center gap-2 text-xs">
        {isPrevious && <Icon className="h-3 w-3" />}

        <span className="font-medium tracking-wider uppercase">
          <Trans i18nKey={i18nKey} />
        </span>
        {!isPrevious && <Icon className="h-3 w-3" />}
      </div>

      <div className="space-y-1">
        <h3 className="group-hover:text-primary text-sm leading-tight font-semibold transition-colors">
          {entry.title}
        </h3>

        <div className="text-muted-foreground text-xs">
          <DateFormatter dateString={entry.publishedAt} />
        </div>
      </div>
    </Link>
  );
}

function ChangelogNavigation({
  previousEntry,
  nextEntry,
}: ChangelogNavigationProps) {
  return (
    <div className="border-border/50 border-t py-8">
      <div className="mx-auto max-w-3xl">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <If condition={previousEntry} fallback={<div />}>
            {(prev) => <NavLink entry={prev} direction="previous" />}
          </If>

          <If condition={nextEntry} fallback={<div />}>
            {(next) => <NavLink entry={next} direction="next" />}
          </If>
        </div>
      </div>
    </div>
  );
}

function ChangelogHeader({ entry }: { entry: Cms.ContentItem }) {
  const { title, publishedAt, description, image } = entry;

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-border/50 border-b py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link
            to="/changelog"
            className="text-muted-foreground hover:text-primary flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <Trans i18nKey="marketing:changelog" />
          </Link>
        </div>
      </div>

      <div className={cn('border-border/50 border-b py-8')}>
        <div className="mx-auto flex max-w-3xl flex-col gap-y-2.5">
          <div>
            <span className="text-muted-foreground text-xs">
              <DateFormatter dateString={publishedAt} />
            </span>
          </div>

          <h1 className="font-heading text-2xl font-medium tracking-tighter xl:text-4xl dark:text-white">
            {title}
          </h1>

          {description && (
            <h2
              className="text-muted-foreground text-base"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}
        </div>
      </div>

      <If condition={image}>
        {(imageUrl) => (
          <div className="relative mx-auto mt-8 flex h-[378px] w-full max-w-3xl justify-center">
            <CoverImage className="rounded-md" title={title} src={imageUrl} />
          </div>
        )}
      </If>
    </div>
  );
}
