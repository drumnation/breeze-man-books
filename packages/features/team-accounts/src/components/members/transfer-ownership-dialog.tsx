'use client';

import { useEffect } from 'react';

import { useFetcher } from 'react-router';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { useCsrfToken } from '@kit/csrf/client';
import { VerifyOtpForm } from '@kit/otp/components';
import { useUser } from '@kit/supabase/hooks/use-user';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@kit/ui/alert-dialog';
import { Button } from '@kit/ui/button';
import { Form } from '@kit/ui/form';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';

import {
  TransferOwnershipConfirmationSchema,
  type TransferOwnershipSchema,
} from '../../schema';

export const TransferOwnershipDialog: React.FC<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  accountId: string;
  userId: string;
  targetDisplayName: string;
}> = ({ isOpen, setIsOpen, targetDisplayName, accountId, userId }) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <Trans i18nKey="team:transferOwnership" />
          </AlertDialogTitle>

          <AlertDialogDescription>
            <Trans i18nKey="team:transferOwnershipDescription" />
          </AlertDialogDescription>
        </AlertDialogHeader>

        <TransferOrganizationOwnershipForm
          accountId={accountId}
          userId={userId}
          targetDisplayName={targetDisplayName}
          onSuccess={() => setIsOpen(false)}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
};

function TransferOrganizationOwnershipForm({
  accountId,
  userId,
  targetDisplayName,
  onSuccess,
}: {
  userId: string;
  accountId: string;
  targetDisplayName: string;
  onSuccess: () => void;
}) {
  const user = useUser();
  const csrfToken = useCsrfToken();

  const fetcher = useFetcher<{
    success: boolean;
  }>();

  const form = useForm({
    resolver: zodResolver(TransferOwnershipConfirmationSchema),
    defaultValues: {
      otp: '',
      accountId,
      userId,
      csrfToken,
    },
  });

  const pending = fetcher.state === 'submitting';
  const error = fetcher.data && !fetcher.data.success;
  const { otp } = useWatch({ control: form.control });

  useEffect(() => {
    if (fetcher.data?.success) {
      onSuccess();
    }
  }, [fetcher.data, onSuccess]);

  if (!otp) {
    return (
      <VerifyOtpForm
        purpose={`transfer-ownership-${accountId}`}
        email={user.data?.email as string}
        onSuccess={(otp) => form.setValue('otp', otp, { shouldValidate: true })}
        CancelButton={
          <AlertDialogCancel>
            <Trans i18nKey={'common:cancel'} />
          </AlertDialogCancel>
        }
      />
    );
  }

  return (
    <Form {...form}>
      <form
        className={'flex flex-col space-y-4 text-sm'}
        onSubmit={form.handleSubmit((payload) => {
          return fetcher.submit(
            {
              intent: 'transfer-ownership',
              payload,
            } satisfies z.infer<typeof TransferOwnershipSchema>,
            {
              method: 'POST',
              encType: 'application/json',
            },
          );
        })}
      >
        <If condition={error}>
          <TransferOwnershipErrorAlert />
        </If>

        <p>
          <Trans
            i18nKey={'teams:transferOwnershipDisclaimer'}
            values={{
              member: targetDisplayName,
            }}
            components={{ b: <b /> }}
          />
        </p>

        <div>
          <p className={'text-muted-foreground'}>
            <Trans i18nKey={'common:modalConfirmationQuestion'} />
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>
            <Trans i18nKey={'common:cancel'} />
          </AlertDialogCancel>

          <Button
            type={'submit'}
            data-test={'confirm-transfer-ownership-button'}
            variant={'destructive'}
            disabled={pending}
          >
            <If
              condition={pending}
              fallback={<Trans i18nKey={'teams:transferOwnership'} />}
            >
              <Trans i18nKey={'teams:transferringOwnership'} />
            </If>
          </Button>
        </AlertDialogFooter>
      </form>
    </Form>
  );
}

function TransferOwnershipErrorAlert() {
  return (
    <Alert variant={'destructive'}>
      <AlertTitle>
        <Trans i18nKey={'teams:transferTeamErrorHeading'} />
      </AlertTitle>

      <AlertDescription>
        <Trans i18nKey={'teams:transferTeamErrorMessage'} />
      </AlertDescription>
    </Alert>
  );
}
