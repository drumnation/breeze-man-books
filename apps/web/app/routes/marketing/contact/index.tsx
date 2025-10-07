import { Heading } from '@kit/ui/heading';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { SitePageHeader } from '~/routes/marketing/_components/site-page-header';
import type { Route } from '~/types/app/routes/marketing/contact/+types';

import { ContactForm } from './_components/contact-form';
import { ContactEmailSchema } from './_lib/contact-email.schema';
import { sendContactEmailAction } from './_lib/server/send-contact-email-action.server';

export const meta = ({ data }: Route.MetaArgs) => {
  return [
    {
      title: data?.title,
      description: data?.subtitle,
    },
  ];
};

export const loader = async function ({ request }: Route.LoaderArgs) {
  const { t } = await createI18nServerInstance(request);

  return {
    title: t('marketing:contact'),
    subtitle: t('marketing:contactDescription'),
  };
};

export default function ContactPage(props: Route.ComponentProps) {
  const data = props.loaderData;

  return (
    <div>
      <SitePageHeader title={data.title} subtitle={data.subtitle} />

      <div className={'container mx-auto'}>
        <div
          className={'flex flex-1 flex-col items-center justify-center py-8'}
        >
          <div
            className={
              'flex w-full max-w-lg flex-col space-y-4 rounded-lg border p-8'
            }
          >
            <div>
              <Heading level={3}>
                <Trans i18nKey={'marketing:contactHeading'} />
              </Heading>

              <p className={'text-muted-foreground'}>
                <Trans i18nKey={'marketing:contactSubheading'} />
              </p>
            </div>

            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}

export const action = async function ({ request }: Route.ActionArgs) {
  const data = ContactEmailSchema.parse(await request.json());

  return sendContactEmailAction(data);
};
