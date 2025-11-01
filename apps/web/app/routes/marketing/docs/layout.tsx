import { Outlet } from 'react-router';

import { Cms } from '@kit/cms';
import { SidebarProvider } from '@kit/ui/shadcn-sidebar';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import type { Route } from '~/types/app/routes/marketing/docs/+types/layout';

// local imports
import { DocsNavigation } from './_components/docs-navigation';
import { getDocs } from './_lib/get-docs';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { resolvedLanguage } = await createI18nServerInstance(request);
  const docs = await getDocs(resolvedLanguage);
  const pages = buildDocumentationTree(docs);

  return {
    pages,
  };
};

export default function DocsLayout(props: Route.ComponentProps) {
  const { pages } = props.loaderData;

  return (
    <div className={'container h-[calc(100vh-56px)] overflow-y-hidden'}>
      <SidebarProvider
        className="lg:gap-x-6"
        style={{ '--sidebar-width': '17em' } as React.CSSProperties}
      >
        <HideFooterStyles />

        <DocsNavigation pages={pages} />

        <Outlet />
      </SidebarProvider>
    </div>
  );
}

function HideFooterStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          .site-footer {
            display: none;
          }
        `,
      }}
    />
  );
}

// we want to place all the children under their parent
// based on the property parentId
function buildDocumentationTree(pages: Cms.ContentItem[]) {
  const tree: Cms.ContentItem[] = [];
  const map: Record<string, Cms.ContentItem> = {};

  pages.forEach((page) => {
    map[page.id] = page;
  });

  pages.forEach((page) => {
    if (page.parentId) {
      const parent = map[page.parentId];

      if (!parent) {
        return;
      }

      if (!parent.children) {
        parent.children = [];
      }

      parent.children.push(page);

      // sort children by order
      parent.children.sort((a, b) => a.order - b.order);
    } else {
      tree.push(page);
    }
  });

  return tree.sort((a, b) => a.order - b.order);
}
