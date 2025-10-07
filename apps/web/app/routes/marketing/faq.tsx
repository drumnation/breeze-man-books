import { Link } from 'react-router';

import { ArrowRight, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { SitePageHeader } from '~/routes/marketing/_components/site-page-header';
import type { Route } from '~/types/app/routes/marketing/+types/faq';

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { t } = await createI18nServerInstance(request);

  const faqItems = [
    {
      question: `Do you offer a free trial?`,
      answer: `Yes, we offer a 14-day free trial. You can cancel at any time during the trial period and you won't be charged.`,
    },
    {
      question: `Can I cancel my subscription?`,
      answer: `You can cancel your subscription at any time. You can do this from your account settings.`,
    },
    {
      question: `Where can I find my invoices?`,
      answer: `You can find your invoices in your account settings.`,
    },
    {
      question: `What payment methods do you accept?`,
      answer: `We accept all major credit cards and PayPal.`,
    },
    {
      question: `Can I upgrade or downgrade my plan?`,
      answer: `Yes, you can upgrade or downgrade your plan at any time. You can do this from your account settings.`,
    },
    {
      question: `Do you offer discounts for non-profits?`,
      answer: `Yes, we offer a 50% discount for non-profits. Please contact us to learn more.`,
    },
  ];

  return {
    title: t('marketing:faq'),
    faqItems,
  };
};

export const meta = ({ data }: Route.MetaArgs) => {
  return [
    {
      title: data?.title,
    },
  ];
};

export default function FAQPage(props: Route.ComponentProps) {
  const { faqItems } = props.loaderData;
  const { t } = useTranslation();

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => {
      return {
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      };
    }),
  };

  return (
    <>
      <script
        key={'ld:json'}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className={'flex flex-col space-y-4 xl:space-y-8'}>
        <SitePageHeader
          title={t('marketing:faq')}
          subtitle={t('marketing:faqSubtitle')}
        />

        <div className={'container flex flex-col items-center space-y-8 pb-16'}>
          <div className="divide-border flex w-full max-w-xl flex-col divide-y divide-dashed rounded-md border">
            {faqItems.map((item, index) => {
              return <FaqItem key={index} item={item} />;
            })}
          </div>

          <div>
            <Button asChild variant={'outline'}>
              <Link to={'/contact'}>
                <span>
                  <Trans i18nKey={'marketing:contactFaq'} />
                </span>

                <ArrowRight className={'ml-2 w-4'} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function FaqItem({
  item,
}: React.PropsWithChildren<{
  item: {
    question: string;
    answer: string;
  };
}>) {
  return (
    <details
      className={
        'hover:bg-muted/70 [&:open]:bg-muted/70 [&:open]:hover:bg-muted transition-all'
      }
    >
      <summary
        className={'flex items-center justify-between p-4 hover:cursor-pointer'}
      >
        <h2 className={'cursor-pointer font-sans text-base'}>
          <Trans i18nKey={item.question} defaults={item.question} />
        </h2>

        <div>
          <ChevronDown
            className={'h-5 transition duration-300 group-open:-rotate-180'}
          />
        </div>
      </summary>

      <div className={'text-muted-foreground flex flex-col gap-y-2 px-4 pb-2'}>
        <Trans i18nKey={item.answer} defaults={item.answer} />
      </div>
    </details>
  );
}
