import { deletePersonalAccountAction } from '@kit/accounts/actions';
import { PersonalAccountSettingsContainer } from '@kit/accounts/personal-account-settings';
import { DeletePersonalAccountSchema } from '@kit/accounts/schema';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import authConfig from '~/config/auth.config';
import featureFlagsConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { requireUserLoader } from '~/lib/require-user-loader';
import type { Route } from '~/types/app/routes/home/user/+types/settings';

import { HomeLayoutPageHeader } from './_components/home-page-header';

const features = {
  enableAccountDeletion: featureFlagsConfig.enableAccountDeletion,
  enablePasswordUpdate: authConfig.providers.password,
  enableAccountLinking: authConfig.enableIdentityLinking,
};

const paths = {
  callback: pathsConfig.auth.callback + `?next=${pathsConfig.app.accountHome}`,
};

const ActionsSchema = DeletePersonalAccountSchema;

export const meta = ({ data }: Route.MetaArgs) => {
  return [
    {
      title: data?.title,
    },
  ];
};

export const loader = async (args: Route.LoaderArgs) => {
  const user = await requireUserLoader(args.request);
  const userId = user.id;

  const i18n = await createI18nServerInstance(args.request);
  const title = i18n.t('account:settingsTab');

  return {
    title,
    userId,
  };
};

export default function PersonalAccountSettingsPage(
  props: Route.ComponentProps,
) {
  const { userId } = props.loaderData;

  return (
    <>
      <HomeLayoutPageHeader
        title={<Trans i18nKey={'account:accountTabLabel'} />}
        description={<AppBreadcrumbs />}
      />

      <PageBody>
        <div className={'flex w-full flex-1 flex-col lg:max-w-2xl'}>
          <PersonalAccountSettingsContainer
            userId={userId}
            features={features}
            paths={paths}
            providers={authConfig.providers.oAuth}
          />
        </div>
      </PageBody>
    </>
  );
}

export const action = async (args: Route.ActionArgs) => {
  const json = ActionsSchema.parse(await args.request.json());
  const client = getSupabaseServerClient(args.request);

  switch (json.intent) {
    case 'delete-account':
      return deletePersonalAccountAction({ client, otp: json.payload.otp });

    default:
      return new Response('Invalid action', { status: 400 });
  }
};
