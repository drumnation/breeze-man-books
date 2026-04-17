import { Link } from 'react-router';

import { ArrowRight } from 'lucide-react';

import { Button } from '@kit/ui/button';

import { SitePageHeader } from '~/routes/marketing/_components/site-page-header';
import type { Route } from '~/types/app/routes/marketing/+types/about';

export const meta: Route.MetaFunction = () => {
  return [
    {
      title:
        'Zubair Raymond Latib — Author, Music Educator & School Performer (Philadelphia, PA Suburbs)',
    },
    {
      name: 'description',
      content:
        'Zubair Raymond Latib is a music educator, performer, and author of the Brain Rot Books, based in the Philadelphia, PA suburbs. Live readings and school performances across Greater Philadelphia.',
    },
    {
      name: 'keywords',
      content:
        "Zubair Raymond Latib, Brain Rot Books, Breeze Man Books, Philadelphia music educator, Philadelphia suburbs author, school visits Philadelphia, children's book author Pennsylvania, live school readings PA",
    },
    {
      property: 'og:type',
      content: 'profile',
    },
    {
      property: 'og:locale',
      content: 'en_US',
    },
    {
      tagName: 'script',
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Zubair Raymond Latib',
        jobTitle: 'Music Educator, Performer, and Author',
        description:
          'Music educator, live performer, and author of the Brain Rot Books. Performs live readings for kids in schools across the Philadelphia region.',
        url: 'https://thebrainrotbooks.com/about',
        image: 'https://thebrainrotbooks.com/images/zubair.webp',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Philadelphia Suburbs',
          addressRegion: 'PA',
          addressCountry: 'US',
        },
        worksFor: {
          '@type': 'Organization',
          name: 'Brain Rot Books',
          url: 'https://thebrainrotbooks.com',
        },
        knowsAbout: [
          'Music Education',
          "Children's Literature",
          'Live School Performances',
          'Author Visits',
        ],
        areaServed: {
          '@type': 'AdministrativeArea',
          name: 'Greater Philadelphia',
        },
      }),
    },
  ];
};

export default function AboutPage() {
  return (
    <div>
      <SitePageHeader
        title="Origin Story of the Brain Rot Books"
        subtitle="By Zubair Raymond Latib"
      />

      <div className="container mx-auto max-w-3xl px-4 pt-10 pb-24">
        <div className="relative mx-auto mb-10 flex aspect-square w-full max-w-[32rem] items-center justify-center">
          <img
            src="/images/zubair-brainrot-friends.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 z-0 h-full w-full object-contain opacity-95"
          />
          <img
            src="/images/zubair.webp"
            alt="Zubair Raymond Latib"
            className="relative z-10 aspect-square w-56 rounded-full border-4 border-white bg-white object-cover object-top drop-shadow-[0_25px_25px_rgba(0,0,0,0.35)] md:w-64"
          />
        </div>

        <div className="space-y-5 text-center text-lg leading-relaxed text-black/85">
          <p>It was one of those days, just like any other.</p>
          <p>
            I was blasting music at home, recording nonsense, and teaching
            lessons all day.
          </p>
          <p>I thought I was locked in.</p>

          <p>Next morning I woke up and boom.</p>
          <p>My ear got hit with a Level 100 Gyatt straight from Ohio.</p>

          <p>
            Every sound
            <br />
            Delulu coded.
            <br />
            Like nails on a chalkboard.
            <br />
            Like someone rage quitting and I was the actual screen they were
            yelling at, cranked to 6 to 7 volume.
          </p>

          <p>
            The world went full send on my brain.
            <br />
            Straight chalkboard rizz.
            <br />
            Straight sigma pain.
            <br />
            Hyperacusis unlocked.
          </p>

          <aside className="rounded-lg border-t-4 border-black/20 bg-black/5 px-5 py-4 text-base text-black/70 italic">
            Hyperacusis is sensitivity to everyday sounds, usually from
            overexposure to loud noise. Check it out online if you want to know
            more. And real talk, please wear earplugs at loud sporting events,
            concerts, or if you are a musician in a band.
          </aside>

          <p className="pt-2">Back to the origin story.</p>

          <p>
            Teaching cooked.
            <br />
            Playing live music clapped.
            <br />
            Recording music in shambles.
          </p>

          <p>Everything felt like an I had pasta tonight moment.</p>

          <p>So I did the only thing left.</p>
          <p>Hit pause.</p>
          <p>Meditated.</p>
          <p>And in that silence</p>

          <p className="text-2xl font-bold">a new path spawned.</p>

          <p className="text-2xl font-bold">The books.</p>

          <p>
            Level 100 goofy power ups.
            <br />
            The lore. The drip. The legends.
            <br />
            The creative freedom.
          </p>

          <p>And here is the plot twist.</p>

          <p>
            20 plus years of music, never once asked for an autograph.
            <br />
            But the first time I read one of these books to a third grade
            classroom
          </p>

          <p className="text-2xl font-bold">they asked.</p>

          <p>
            Caught me in 4K.
            <br />
            That moment was a Huge W.
          </p>

          <p>
            Shout out to Ms. Krier and my daughter&apos;s third grade classroom
            of legends.
            <br />
            You made me feel like the GOAT of all GOATS.
          </p>

          <p>
            I even double checked the next day with my daughter.
            <br />
            Was I really goated in the classroom
          </p>

          <p>Turns out yeah.</p>

          <p>I told them I would write another book.</p>
          <p>And now we are here.</p>

          <p>
            Instead of coming home and making noise
            <br />I have the creative freedom I love in the silence of these
            books.
          </p>

          <p>But here is the funny part</p>

          <p>
            these might actually be the loudest books out there
            <br />
            thanks to all the wild interactive parts.
          </p>

          <p>
            Even in the quiet of writing
            <br />I still ended up creating full send chaos.
          </p>

          <p>
            I guess I can never fully escape the noise
            <br />
            but at least now I get to remix it
            <br />
            and turn the volume down on my own terms.
          </p>

          <p className="pt-4 text-xl font-bold tracking-tight">
            Stay goofy. Stay weird. Stay legendary.
          </p>
          <p>Peace</p>
          <p className="text-xl font-bold">Zubair</p>
        </div>

        <div className="mx-auto mt-16 max-w-xl border-t-2 border-black/10 pt-8 text-center">
          <p className="mb-2 text-xs font-bold tracking-widest uppercase opacity-50">
            About the Author
          </p>
          <p className="text-base leading-relaxed text-black/75">
            <strong>Zubair Raymond Latib</strong> is a music educator,
            performer, and author based in the{' '}
            <strong>Philadelphia, PA suburbs</strong>. He teaches students
            every day, performs live, writes the Brain Rot Books series, and
            brings the books to life with live readings for kids in schools
            across the Greater Philadelphia region.
          </p>
          <p className="mt-4 text-sm text-black/55">
            Looking to bring a live Brain Rot Books reading to your
            Philadelphia-area school or event?{' '}
            <a
              href="mailto:hello@thebrainrotbooks.com"
              className="underline hover:text-black"
            >
              Get in touch.
            </a>
          </p>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-semibold">Read the books</h2>
          <p className="max-w-md text-black/70">
            Signed copies direct from Zubair — no middleman, just books and a
            quick hello.
          </p>
          <Button asChild size="lg">
            <Link to="/#books">
              Browse the books
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
