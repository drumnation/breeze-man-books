'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@kit/ui/form';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';

import { PasswordSignUpSchema } from '../schemas/password-sign-up.schema';
import { EmailInput } from './email-input';
import { PasswordInput } from './password-input';
import { TermsAndConditionsFormField } from './terms-and-conditions-form-field';

export const PasswordSignUpForm: React.FC<{
  onSubmit: (params: {
    email: string;
    password: string;
    repeatPassword: string;
  }) => unknown;
  loading: boolean;
  displayTermsCheckbox?: boolean;
  captchaLoading?: boolean;
}> = ({ onSubmit, loading, displayTermsCheckbox, captchaLoading = false }) => {
  const form = useForm({
    resolver: zodResolver(PasswordSignUpSchema),
    defaultValues: {
      email: '',
      password: '',
      repeatPassword: '',
    },
  });

  return (
    <Form {...form}>
      <form
        className={'w-full space-y-2.5'}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name={'email'}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <EmailInput {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={'password'}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <PasswordInput {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={'repeatPassword'}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <PasswordInput data-test="repeat-password-input" {...field} />
              </FormControl>

              <FormMessage />

              <FormDescription className={'pb-2 text-xs'}>
                <Trans i18nKey={'auth:repeatPasswordHint'} />
              </FormDescription>
            </FormItem>
          )}
        />

        <If condition={displayTermsCheckbox}>
          <TermsAndConditionsFormField />
        </If>

        <Button
          data-test={'auth-submit-button'}
          className={'w-full'}
          type="submit"
          disabled={loading || captchaLoading}
        >
          <If condition={captchaLoading}>
            <Trans i18nKey={'auth:verifyingCaptcha'} />
          </If>

          <If condition={loading && !captchaLoading}>
            <Trans i18nKey={'auth:signingUp'} />
          </If>

          <If condition={!loading && !captchaLoading}>
            <>
              <Trans i18nKey={'auth:signUpWithEmail'} />

              <ArrowRight
                className={
                  'zoom-in animate-in slide-in-from-left-2 fill-mode-both h-4 delay-500 duration-500'
                }
              />
            </>
          </If>
        </Button>
      </form>
    </Form>
  );
};
