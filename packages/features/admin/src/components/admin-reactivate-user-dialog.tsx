'use client';

import { useEffect } from 'react';

import { useFetcher } from 'react-router';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useCsrfToken } from '@kit/csrf/client';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@kit/ui/alert-dialog';
import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { toast } from '@kit/ui/sonner';

import { ReactivateUserSchema } from '../lib/server/schema/admin-actions.schema';

export function AdminReactivateUserDialog(
  props: React.PropsWithChildren<{
    userId: string;
  }>,
) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{props.children}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reactivate User</AlertDialogTitle>

          <AlertDialogDescription>
            Are you sure you want to reactivate this user?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AdminReactivateUserForm userId={props.userId} />
      </AlertDialogContent>
    </AlertDialog>
  );
}

function AdminReactivateUserForm(props: { userId: string }) {
  const fetcher = useFetcher();
  const csrfToken = useCsrfToken();
  const isLoading = fetcher.state !== 'idle';

  const form = useForm({
    resolver: zodResolver(
      z.object({
        userId: z.string(),
        confirmation: z.string().refine((data) => data === 'CONFIRM', {
          message: 'You must type CONFIRM to confirm',
        }),
        csrfToken: z.string(),
      }),
    ),
    defaultValues: {
      userId: props.userId,
      confirmation: '' as 'CONFIRM',
      csrfToken,
    },
  });

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data?.success) {
        toast.success('User reactivated successfully');
      } else {
        toast.error('Failed to reactivate user');
      }
    }
  }, [fetcher.data]);

  return (
    <Form {...form}>
      <form
        className={'flex flex-col space-y-8'}
        onSubmit={form.handleSubmit((data) => {
          return fetcher.submit(
            {
              intent: 'reactivate-user',
              payload: {
                ...data,
                csrfToken,
              },
            } satisfies z.infer<typeof ReactivateUserSchema>,
            {
              method: 'POST',
              encType: 'application/json',
            },
          );
        })}
      >
        <FormField
          name={'confirmation'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Type <b>CONFIRM</b> to confirm
              </FormLabel>

              <FormControl>
                <Input
                  required
                  pattern={'CONFIRM'}
                  placeholder={'Type CONFIRM to confirm'}
                  {...field}
                />
              </FormControl>

              <FormDescription>
                Are you sure you want to do this?
              </FormDescription>

              <FormMessage />
            </FormItem>
          )}
        />

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <Button type={'submit'}>
            {isLoading ? 'Reactivating...' : 'Reactivate User'}
          </Button>
        </AlertDialogFooter>
      </form>
    </Form>
  );
}
