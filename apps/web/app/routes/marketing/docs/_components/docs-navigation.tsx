import { ChevronDown } from 'lucide-react';

import { Cms } from '@kit/cms';
import { CollapsibleContent, CollapsibleTrigger } from '@kit/ui/collapsible';
import {
  Sidebar,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from '@kit/ui/shadcn-sidebar';

import { FloatingDocumentationNavigation } from '~/routes/marketing/docs/_components/floating-docs-navigation';

import { DocsNavLink } from './docs-nav-link';
import { DocsNavigationCollapsible } from './docs-navigation-collapsible';

function Node({
  node,
  level,
  prefix,
}: {
  node: Cms.ContentItem;
  level: number;
  prefix: string;
}) {
  const url = `${prefix}/${node.slug}`;
  const label = node.label ? node.label : node.title;

  const Container = (props: React.PropsWithChildren) => {
    if (node.collapsible) {
      return (
        <DocsNavigationCollapsible node={node} prefix={prefix}>
          {props.children}
        </DocsNavigationCollapsible>
      );
    }

    return props.children;
  };

  const ContentContainer = (props: React.PropsWithChildren) => {
    if (node.collapsible) {
      return <CollapsibleContent>{props.children}</CollapsibleContent>;
    }

    return props.children;
  };

  const Trigger = () => {
    if (node.collapsible) {
      return (
        <CollapsibleTrigger asChild>
          <SidebarMenuItem>
            <SidebarMenuButton>
              {label}
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </CollapsibleTrigger>
      );
    }

    return <DocsNavLink label={label} url={url} />;
  };

  return (
    <Container>
      <Trigger />

      <ContentContainer>
        <Tree pages={node.children ?? []} level={level + 1} prefix={prefix} />
      </ContentContainer>
    </Container>
  );
}

function Tree({
  pages,
  level,
  prefix,
}: {
  pages: Cms.ContentItem[];
  level: number;
  prefix: string;
}) {
  if (level === 0) {
    return pages.map((treeNode, index) => (
      <Node key={index} node={treeNode} level={level} prefix={prefix} />
    ));
  }

  if (pages.length === 0) {
    return null;
  }

  return (
    <SidebarMenuSub>
      {pages.map((treeNode, index) => (
        <Node key={index} node={treeNode} level={level} prefix={prefix} />
      ))}
    </SidebarMenuSub>
  );
}

export function DocsNavigation({
  pages,
  prefix = '/docs',
}: {
  pages: Cms.ContentItem[];
  prefix?: string;
}) {
  return (
    <>
      <Sidebar
        variant={'ghost'}
        className={
          'z-1 sticky mt-4 max-h-full overflow-y-auto border-r-transparent'
        }
      >
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <Tree pages={pages} level={0} prefix={prefix} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </Sidebar>

      <div className={'lg:hidden'}>
        <FloatingDocumentationNavigation>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <Tree pages={pages} level={0} prefix={prefix} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </FloatingDocumentationNavigation>
      </div>
    </>
  );
}
