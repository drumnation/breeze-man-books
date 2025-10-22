import { Link, redirect } from 'react-router';

import type { Provider } from '@supabase/supabase-js';

import { LinkAccountsList } from '@kit/accounts/personal-account-settings';
import { AuthLayoutShell } from '@kit/auth/shared';
import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Button } from '@kit/ui/button';
import { Heading } from '@kit/ui/heading';
import { Trans } from '@kit/ui/trans';

import { AppLogo } from '~/components/app-logo';
import authConfig from '~/config/auth.config';
import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import type { Route } from '~/types/app/routes/+types/identities';

export const meta = ({ data }: Route.MetaArgs) => {
  return [
    {
      title: data?.title,
    },
  ];
};

/**
 * @name loader
 * @description Loader for the /identities route.
 * Validates that user is authenticated, and provides available auth methods.
 */
export const loader = async ({ request }: Route.LoaderArgs) => {
  const client = getSupabaseServerClient(request);
  const auth = await requireUser(client);

  // If not authenticated, redirect to sign in
  if (!auth.data) {
    throw redirect(pathsConfig.auth.signIn);
  }

  // Get the next path from URL params (where to redirect after setup)
  const searchParams = new URL(request.url).searchParams;
  const nextPath = searchParams.get('next') || pathsConfig.app.home;

  // Available auth methods to add
  const showPasswordOption = authConfig.providers.password;
  const oAuthProviders = authConfig.providers.oAuth;

  // Show email option if password, magic link, or OTP is enabled
  const showEmailOption =
    authConfig.providers.password || authConfig.providers.magicLink;

  const enableIdentityLinking = authConfig.enableIdentityLinking;

  const i18n = await createI18nServerInstance(request);
  const title = i18n.t('auth:setupAccount');

  return {
    title,
    nextPath,
    showPasswordOption,
    showEmailOption,
    oAuthProviders,
    enableIdentityLinking,
  };
};

/**
 * @name IdentitiesPage
 * @description Displays linked accounts and available authentication methods.
 */
export default function IdentitiesPage(props: Route.ComponentProps) {
  const {
    nextPath,
    showPasswordOption,
    oAuthProviders,
    showEmailOption,
    enableIdentityLinking,
  } = props.loaderData;

  return (
    <AuthLayoutShell
      Logo={AppLogo}
      contentClassName="max-w-md overflow-y-hidden"
    >
      <div className="flex max-h-[70vh] w-full flex-col items-center space-y-6 overflow-y-auto">
        <div className={'flex flex-col items-center space-y-2'}>
          <Heading level={4}>
            <Trans i18nKey={'auth:linkAccountToSignIn'} />
          </Heading>

          <Heading
            level={6}
            className={'text-muted-foreground text-center text-sm'}
          >
            <Trans i18nKey={'auth:linkAccountToSignInDescription'} />
          </Heading>
        </div>

        <IdentitiesStep
          nextPath={nextPath}
          showPasswordOption={showPasswordOption}
          showEmailOption={showEmailOption}
          oAuthProviders={oAuthProviders}
          enableIdentityLinking={enableIdentityLinking}
        />
      </div>
    </AuthLayoutShell>
  );
}

/**
 * @name IdentitiesStep
 * @description Displays linked accounts and available authentication methods.
 * LinkAccountsList component handles all authentication options including OAuth and Email/Password.
 */
function IdentitiesStep(props: {
  nextPath: string;
  showPasswordOption: boolean;
  showEmailOption: boolean;
  enableIdentityLinking: boolean;
  oAuthProviders: Provider[];
}) {
  return (
    <div
      className={
        'animate-in fade-in slide-in-from-bottom-4 mx-auto flex w-full max-w-md flex-col space-y-4 duration-500'
      }
      data-test="join-step-two"
    >
      <LinkAccountsList
        providers={props.oAuthProviders}
        showPasswordOption={props.showPasswordOption}
        showEmailOption={props.showEmailOption}
        redirectTo={props.nextPath}
        enabled={props.enableIdentityLinking}
      />

      <Button asChild data-test="skip-identities-button">
        <Link to={props.nextPath}>
          <Trans i18nKey={'common:continueKey'} />
        </Link>
      </Button>
    </div>
  );
}
