'use client';

import { getSafeRedirectPath } from '@kit/shared/utils';
import { useSignOut } from '@kit/supabase/hooks/use-sign-out';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

export function SignOutInvitationButton(
  props: React.PropsWithChildren<{
    nextPath: string;
  }>,
) {
  const signOut = useSignOut();

  return (
    <Button
      variant={'ghost'}
      onClick={async () => {
        await signOut.mutateAsync();
        window.location.assign(getSafeRedirectPath(props.nextPath, '/'));
      }}
    >
      <Trans i18nKey={'teams:signInWithDifferentAccount'} />
    </Button>
  );
}
