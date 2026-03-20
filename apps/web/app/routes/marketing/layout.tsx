import { Outlet } from 'react-router';

import { SiteFooter } from './_components/site-footer';
import { SiteHeader } from './_components/site-header';

export default function MarketingLayout() {
  return (
    <div className="flex min-h-[100vh] flex-col bg-white text-black">
      <SiteHeader />
      <Outlet />
      <SiteFooter />
    </div>
  );
}
