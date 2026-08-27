import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { MarketingLayout, PageHero } from '../../components/site/MarketingLayout'
import {
  Button,
  Card,
  Chip,
  Container,
  Eyebrow,
  Reveal,
  Section,
  SectionHeading,
} from '../../components/site/ui'
import { SeamBall, StadiumAtmosphere } from '../../components/site/visuals'

const LAST_UPDATED = '27 August 2026'

/* ---------------------------------------------------------------------------
   Local prose helpers. Legal copy needs a consistent rhythm, and these keep
   every paragraph and list on the same one without touching global CSS.
--------------------------------------------------------------------------- */

function P({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-relaxed text-ink/70 dark:text-chalk/70 sm:text-[15px]">{children}</p>
}

function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-sm leading-relaxed text-ink/70 dark:text-chalk/70 sm:text-[15px]">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-pitch" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

const SUMMARY = [
  {
    tag: 'Ownership',
    title: 'Your footage is yours',
    body: 'You keep every clip you upload. We use it to give you your reports and nothing else, and we never sell it.',
  },
  {
    tag: 'Control',
    title: 'Delete it whenever',
    body: 'Remove a delivery, a session or the whole account. When it goes, the clip and its report go with it.',
  },
  {
    tag: 'Sharing',
    title: 'Shared only when you share it',
    body: 'A clip reaches a coach, a squad or a team-mate because you sent it there — never because we passed it on.',
  },
]

const SECTIONS: { id: string; title: string; body: ReactNode }[] = [
  {
    id: 'who-this-covers',
    title: 'Who this covers',
    body: (
      <>
        <P>
          This policy explains what CricLab holds about you, why we hold it, and what you
          can ask us to do with it. It applies to the CricLab website and to the CricLab
          app, whether you are a player filming your own bowling, a coach reviewing a
          squad, or an academy running age groups.
        </P>
        <P>
          Where an academy, club or county programme sets up accounts for its players, that
          organisation decides who in its coaching set-up can see a player’s footage. This
          policy still governs how CricLab itself handles that footage.
        </P>
      </>
    ),
  },
  {
    id: 'what-we-collect',
    title: 'What we collect',
    body: (
      <>
        <P>Three kinds of information, and nothing beyond what the product needs.</P>
        <Bullets
          items={[
            <>
              <strong className="font-semibold text-ink dark:text-chalk">Account details.</strong> Your name,
              email address, the password you set, and — if you belong to one — the club,
              academy or squad you are attached to.
            </>,
            <>
              <strong className="font-semibold text-ink dark:text-chalk">Videos and clips you upload,</strong>{' '}
              together with the details you add about the delivery so the numbers come back
              in real units: the bowler’s height, bowling arm, age group where relevant, and
              any note or label you attach to a session.
            </>,
            <>
              <strong className="font-semibold text-ink dark:text-chalk">How you use CricLab.</strong> Which
              features you open, when you upload, whether a report was viewed, and basic
              information about the device and browser you use. This is how we spot what is
              broken and what is worth building.
            </>,
          ]}
        />
        <P>
          If you buy a subscription, we keep a record of what you bought and when. Card
          numbers are handled by our payment provider and are never held by CricLab.
        </P>
      </>
    ),
  },
  {
    id: 'how-we-use-it',
    title: 'How we use it',
    body: (
      <>
        <Bullets
          items={[
            'To give you what you asked for: the marked-up clip, the measurements and the written read on the delivery you uploaded.',
            'To keep your history, so a session in August can be put next to one in April and compared honestly.',
            'To let the coaches you belong to — and only those coaches — review the deliveries you have shared with them.',
            'To answer you when you contact us, including looking at a clip you send us so we can explain a result.',
            'To keep CricLab working, secure and free of misuse.',
            'To tell you about changes to the product or your plan. Marketing email is separate, opt-in, and has an unsubscribe link in every message.',
          ]}
        />
        <P>
          We do not build advertising profiles, and we do not pass your details to
          advertisers.
        </P>
      </>
    ),
  },
  {
    id: 'your-footage',
    title: 'Your footage stays yours',
    body: (
      <>
        <P>
          You own the video you upload. Uploading a clip gives CricLab permission to hold it
          and to give you back your report on it — no more than that.
        </P>
        <P>
          We do not sell footage. We do not publish it. We do not put a player’s delivery in
          a marketing video, a case study or a coaching article unless we have asked you and
          you have said yes in writing — and for a player under 18, unless a parent or
          guardian has said yes in writing.
        </P>
      </>
    ),
  },
  {
    id: 'retention-and-deletion',
    title: 'How long we keep it, and how to delete it',
    body: (
      <>
        <Bullets
          items={[
            'Clips and reports are kept while your account is open, so your history stays intact for comparison.',
            'Delete a delivery and both the clip and the report built from it are removed.',
            'Close your account and your clips, reports and account details are removed within 30 days.',
            'Copies held for safekeeping are cleared on a rolling basis, and in any case within 30 days of deletion.',
            'We keep a minimal record of purchases for as long as tax and accounting rules require.',
          ]}
        />
        <P>
          If an academy holds your account and you want your footage removed, ask us
          directly at{' '}
          <a
            href="mailto:privacy@criclab.com"
            className="font-semibold text-pitch underline underline-offset-4"
          >
            privacy@criclab.com
          </a>{' '}
          — you do not have to go through your coach.
        </P>
      </>
    ),
  },
  {
    id: 'sharing',
    title: 'Who else sees it',
    body: (
      <>
        <Bullets
          items={[
            'Coaches and staff of the club, academy or squad your account belongs to, for the deliveries filed under that squad.',
            'Anyone you deliberately send a review clip to — a team-mate, a parent, a selector.',
            'Companies that help us run CricLab, under contract, only to the extent needed to keep the service working. They may not use your footage for anything of their own.',
            'Authorities, where the law requires it, or where it is needed to protect someone’s safety.',
            'A buyer, if CricLab is ever sold or merged — in which case this policy travels with your information and you will be told.',
          ]}
        />
        <P>
          That is the complete list. We do not sell or rent your information to anybody, for
          any purpose.
        </P>
      </>
    ),
  },
  {
    id: 'young-players',
    title: 'Young players and academy settings',
    body: (
      <>
        <P>
          A great deal of cricket coaching happens with under-18s, so this section matters
          more here than in most policies.
        </P>
        <Bullets
          items={[
            'CricLab accounts are for people aged 16 or over. Younger players are filmed and reviewed through a coach’s or a parent’s account, never their own.',
            'Where an academy uploads footage of a minor, that academy is responsible for holding the parent or guardian consent that allows it, and must be able to show it on request.',
            'A parent or guardian can ask us to show what we hold on their child and to delete it, and we will act on that request without needing the academy’s agreement.',
            'We never market to children, and we never use a minor’s footage in any promotional material.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your rights',
    body: (
      <>
        <P>Depending on where you live, you can ask us to:</P>
        <Bullets
          items={[
            'show you what we hold about you;',
            'correct anything that is wrong — a mis-typed height, the wrong bowling arm, an out-of-date email;',
            'give you a copy of your own footage and reports;',
            'delete your information, subject to records we must keep by law;',
            'stop or limit a particular use of your information;',
            'withdraw a consent you gave, without affecting what was done before you withdrew it.',
          ]}
        />
        <P>
          Write to{' '}
          <a
            href="mailto:privacy@criclab.com"
            className="font-semibold text-pitch underline underline-offset-4"
          >
            privacy@criclab.com
          </a>{' '}
          and we will come back to you within 30 days. If you are not satisfied with how we
          have handled it, you can complain to the data protection regulator where you live.
        </P>
      </>
    ),
  },
  {
    id: 'keeping-it-safe',
    title: 'Keeping it safe',
    body: (
      <>
        <P>
          Access to footage is limited to the small number of people at CricLab whose work
          requires it, and it is looked at for support and safety reasons only. Your
          deliveries are visible to your account and to the squad you have joined — not to
          other users.
        </P>
        <P>
          No service can promise perfect security. If something goes wrong that affects your
          information, we will tell you and the relevant regulator as quickly as the law
          requires, and we will tell you plainly what happened.
        </P>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    body: (
      <P>
        When this policy changes, the date at the top changes with it. If a change
        meaningfully affects what we do with your footage or your details, we will tell you
        by email or in the app before it takes effect, rather than quietly updating the
        page.
      </P>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    body: (
      <>
        <P>
          Questions about anything on this page — including a request to see or delete what
          we hold — go to{' '}
          <a
            href="mailto:privacy@criclab.com"
            className="font-semibold text-pitch underline underline-offset-4"
          >
            privacy@criclab.com
          </a>
          , or through the{' '}
          <Link to="/contact" className="font-semibold text-pitch underline underline-offset-4">
            contact page
          </Link>
          .
        </P>
        <P>
          Our{' '}
          <Link to="/terms" className="font-semibold text-pitch underline underline-offset-4">
            terms of service
          </Link>{' '}
          cover the rest of the relationship: accounts, subscriptions and what CricLab’s
          measurements are — and are not — for.
        </P>
      </>
    ),
  },
]

export function PrivacyPage() {
  return (
    <MarketingLayout title="Privacy Policy">
      <PageHero
      plate="bokeh"
        eyebrow="Privacy"
        title={
          <>
            Your footage is{' '}
            <span className="text-gradient-lime">yours</span>
          </>
        }
        lead="Plain English, no clever wording. What CricLab holds, why it holds it, who else can see it, and how to get rid of it."
      >
        <div className="flex flex-wrap gap-2 pt-1">
          <Chip tone="lime">Last updated {LAST_UPDATED}</Chip>
          <Chip tone="warn">Template — pending legal review</Chip>
        </div>
      </PageHero>

      {/* ===================== NOTICE + SUMMARY ===================== */}
      <Section tone="plain" className="py-16 sm:py-20">
        <Container>
          <Reveal>
            <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-warn/40 bg-warn/10 p-6 sm:p-7">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/60 dark:text-chalk/60">
                Please read before launch
              </span>
              <p className="text-sm leading-relaxed text-ink/75 dark:text-chalk/75 sm:text-[15px]">
                This page is a working template, written to be readable rather than to be
                final. It has not been reviewed by a lawyer. Before CricLab launches
                publicly, this policy must be checked and adapted by qualified legal counsel
                for the jurisdictions it operates in — including the data protection rules
                and the safeguarding obligations that apply to filming young players.
              </p>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {SUMMARY.map((s, i) => (
              <Reveal key={s.tag} delay={i * 80}>
                <Card tone="light" className="flex h-full flex-col gap-2.5 p-6">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-pitch">
                    {s.tag}
                  </span>
                  <h2 className="font-display text-lg font-bold text-ink dark:text-chalk">{s.title}</h2>
                  <p className="text-sm leading-relaxed text-ink/65 dark:text-chalk/65">{s.body}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ===================== POLICY BODY ===================== */}
      <Section tone="light" className="py-20 sm:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[250px_1fr] lg:gap-14">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <Reveal>
                <div className="rounded-[var(--radius-card)] border border-pitch/10 dark:border-white/10 bg-white dark:bg-white/6 p-5 shadow-lg shadow-pitch/5">
                  <p className="pb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-ink/40 dark:text-chalk/40">
                    On this page
                  </p>
                  <nav className="flex flex-col gap-0.5">
                    {SECTIONS.map((s, i) => (
                      <a
                        key={s.id}
                        href={`#${s.id}`}
                        className="flex gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-ink/60 dark:text-chalk/60 transition hover:bg-pitch/5 hover:text-pitch"
                      >
                        <span className="font-mono text-[11px] leading-5 text-ink/30 dark:text-chalk/30">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        {s.title}
                      </a>
                    ))}
                  </nav>
                </div>
              </Reveal>
            </aside>

            <div className="flex min-w-0 flex-col gap-12">
              {SECTIONS.map((s, i) => (
                <section key={s.id} id={s.id} className="scroll-mt-28">
                  <Reveal>
                    <div className="flex flex-col gap-4">
                      <h2 className="font-display text-2xl font-extrabold leading-tight text-ink dark:text-chalk sm:text-[1.75rem]">
                        <span className="pr-3 font-mono text-base font-bold text-pitch/40">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        {s.title}
                      </h2>
                      {s.body}
                    </div>
                  </Reveal>
                </section>
              ))}

              <Reveal>
                <div className="rounded-[var(--radius-card)] border border-pitch/10 dark:border-white/10 bg-white dark:bg-white/6 p-6 text-xs leading-relaxed text-ink/50 dark:text-chalk/50">
                  Last updated {LAST_UPDATED}. This document is a template prepared for
                  review and must be signed off by legal counsel before CricLab is offered
                  publicly.
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* ===================== CTA ===================== */}
      <Section tone="dark" className="py-20 sm:py-24">
        <StadiumAtmosphere />
        <Container className="relative">
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="flex flex-col gap-5">
              <SectionHeading
                tone="dark"
                align="left"
                eyebrow="Still unsure?"
                title="Ask us anything about your footage"
                lead="If something on this page is not clear, that is our fault, not yours. Tell us which bit and we will explain it — and fix the wording."
                className="max-w-none"
              />
              <Reveal delay={120}>
                <div className="flex flex-wrap gap-3">
                  <Button to="/contact" size="lg">
                    Contact us
                    <span aria-hidden>→</span>
                  </Button>
                  <Button to="/terms" variant="secondary" size="lg">
                    Read the terms
                  </Button>
                </div>
              </Reveal>
            </div>

            <Reveal delay={160}>
              <div className="flex flex-col items-start gap-4 rounded-[var(--radius-card)] border border-white/10 bg-white/[0.04] p-6">
                <div className="flex items-center gap-4">
                  <SeamBall size={54} className="shrink-0" />
                  <Eyebrow>In short</Eyebrow>
                </div>
                <p className="text-sm leading-relaxed text-chalk/65">
                  You film it, you own it, you can delete it. Everything else on this page is
                  detail around those three sentences.
                </p>
                <Link
                  to="/record"
                  className="text-sm font-semibold text-lime transition hover:text-chalk"
                >
                  Read the filming guide →
                </Link>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>
    </MarketingLayout>
  )
}
