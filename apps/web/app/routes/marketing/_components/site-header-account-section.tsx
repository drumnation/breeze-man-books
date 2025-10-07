import { Link } from 'react-router';

import { JwtPayload } from '@supabase/supabase-js';

import { PersonalAccountDropdown } from '@kit/accounts/personal-account-dropdown';
import { useSignOut } from '@kit/supabase/hooks/use-sign-out';
import { Button } from '@kit/ui/button';
import { If } from '@kit/ui/if';
import { ModeToggle } from '@kit/ui/mode-toggle';
import { Trans } from '@kit/ui/trans';

import featuresFlagConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';

const paths = {
  home: pathsConfig.app.home,
};

const features = {
  enableThemeToggle: featuresFlagConfig.enableThemeToggle,
};

export function SiteHeaderAccountSection({
  user,
}: {
  user: JwtPayload | null;
}) {
  const signOut = useSignOut();

  if (user) {
    return (
      <PersonalAccountDropdown
        showProfileName={false}
        paths={paths}
        features={features}
        user={user}
        signOutRequested={() => signOut.mutateAsync()}
      />
    );
  }

  return <AuthButtons />;
}

function AuthButtons() {
  return (
    <div
      className={'animate-in fade-in flex items-center gap-x-2 duration-500'}
    >
      <div className={'hidden md:flex'}>
        <If condition={features.enableThemeToggle}>
          <ModeToggle />
        </If>
      </div>

      <div className={'flex items-center gap-x-2'}>
        <Button
          className={'hidden md:flex md:text-sm'}
          asChild
          variant={'outline'}
          size={'sm'}
        >
          <Link to={pathsConfig.auth.signIn}>
            <Trans i18nKey={'auth:signIn'} />
          </Link>
        </Button>

        <Button
          asChild
          className="text-xs md:text-sm"
          variant={'default'}
          size={'sm'}
        >
          <Link to={pathsConfig.auth.signUp}>
            <Trans i18nKey={'auth:signUp'} />
          </Link>
        </Button>
      </div>
    </div>
  );
}
