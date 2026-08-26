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
   Local prose helpers — same rhythm as the privacy policy, no global CSS.
--------------------------------------------------------------------------- */

function P({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-relaxed text-ink/70 sm:text-[15px]">{children}</p>
}

function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-sm leading-relaxed text-ink/70 sm:text-[15px]">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-pitch" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

const SUMMARY = [
  {
    tag: 'Coaching tool',
    title: 'Estimates, not officiating',
    body: 'CricLab reads what your footage shows and reports its best estimate. It is built for coaching, not for umpiring or selection disputes.',
  },
  {
    tag: 'Your content',
    title: 'You keep your footage',
    body: 'You own what you upload. You give us only the permission needed to give you your reports back.',
  },
  {
    tag: 'Your plan',
    title: 'Cancel when you like',
    body: 'Subscriptions renew until you stop them. Cancel and you keep access to the end of the period you have paid for.',
  },
]

const SECTIONS: { id: string; title: string; body: ReactNode; highlight?: boolean }[] = [
  {
    id: 'acceptance',
    title: 'Accepting these terms',
    body: (
      <>
        <P>
          These terms are the agreement between you and CricLab. By creating an account,
          uploading a clip or otherwise using CricLab, you accept them. If you do not accept
          them, do not use the service.
        </P>
        <P>
          If you are accepting on behalf of a club, academy, school or county programme, you
          confirm you are entitled to commit that organisation, and “you” in these terms
          means that organisation as well as you personally.
        </P>
      </>
    ),
  },
  {
    id: 'accounts',
    title: 'Accounts',
    body: (
      <>
        <Bullets
          items={[
            'You must be 16 or over to hold an account. Younger players are filmed and reviewed through a coach’s or parent’s account.',
            'Give accurate details when you sign up, and keep them up to date — the bowler’s height and bowling arm in particular, because the numbers depend on them.',
            'Keep your password to yourself. Anything done through your account is treated as done by you, so tell us straight away if you think someone else has got in.',
            'Coaches and academies adding players to a squad are responsible for having the permissions that allow them to film and upload those players.',
            'We can suspend or close an account that breaches these terms, and we will tell you why unless the law prevents us.',
            'You can close your account at any time; what happens to your footage afterwards is set out in the privacy policy.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable use',
    body: (
      <>
        <P>Use CricLab for cricket, and for cricket you have a right to film. Do not:</P>
        <Bullets
          items={[
            'upload footage of a player who has not agreed to be filmed, or of a minor without the consent of a parent or guardian;',
            'upload anything unlawful, abusive, explicit or unrelated to cricket;',
            'pass CricLab reports off as your own analysis service, or resell access to your account;',
            'copy, scrape or reproduce the product, its reports or its drill material for a competing service;',
            'attempt to reach another user’s footage, or interfere with anyone else’s use of CricLab;',
            'present a CricLab figure as an official record of a match, a delivery or a player.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'your-content',
    title: 'Your content and the licence you give us',
    body: (
      <>
        <P>
          You keep ownership of every clip you upload and everything you write alongside it.
        </P>
        <P>
          To give you the product, you grant CricLab a limited, non-exclusive licence to
          hold your footage, to produce your reports and review clips from it, and to make
          it available to the coaches and squad members you have chosen to share it with.
          That licence exists only to run the service for you, and it ends when you delete
          the footage or close your account.
        </P>
        <P>
          You confirm you have the right to upload what you upload, including permission
          from anybody identifiable in it. If you send us feedback, ideas or a suggestion for
          a feature, we may use it freely and without owing you anything for it.
        </P>
      </>
    ),
  },
  {
    id: 'measurement',
    title: 'What the measurements are — and are not',
    highlight: true,
    body: (
      <>
        <P>
          CricLab reports <strong className="font-semibold text-ink">estimates</strong> read
          from the footage you provide. It is a coaching and performance tool. It is not
          officiating equipment, and it is not a medical device.
        </P>
        <Bullets
          items={[
            'Accuracy depends on the clip. Camera angle, distance, lighting, frame rate and how much of the body is in frame all change what can be measured — which is why every figure is reported with a confidence, and why some are withheld rather than guessed.',
            'Figures are for training and development. Do not use them to settle a no-ball, a dismissal, a match record or an official speed, and do not treat them as a substitute for a calibrated speed gun or a match official.',
            'CricLab does not diagnose injuries and does not give medical advice. Pain, discomfort or a suspected injury is a matter for a doctor or physiotherapist, not a report.',
            'Coaching decisions remain yours. Selection, workload and technical change are judgements for the coach, made with the whole picture — of which a CricLab report is one part.',
          ]}
        />
        <P>
          Read a low confidence as an instruction to re-film rather than a number to argue
          with. The{' '}
          <Link to="/record" className="font-semibold text-pitch underline underline-offset-4">
            filming guide
          </Link>{' '}
          sets out how to get a clip that supports a confident reading.
        </P>
      </>
    ),
  },
  {
    id: 'subscriptions',
    title: 'Subscriptions and billing',
    body: (
      <>
        <Bullets
          items={[
            'Current plans, inclusions and prices are on the pricing page and form part of these terms.',
            'Paid plans are billed in advance, monthly or annually depending on the plan you choose.',
            'A subscription renews automatically at the end of each period until you cancel it.',
            'Cancel at any time from your account. You keep access until the end of the period you have already paid for; we do not refund part-periods except where the law requires it.',
            'We will tell you before a price change, and it will only apply from your next renewal. If you do not want it, cancel before then.',
            'Prices exclude any tax that applies where you are, unless stated otherwise.',
            'If a payment fails, we may pause access to paid features until it is settled.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'availability',
    title: 'Availability and changes to the service',
    body: (
      <>
        <P>
          We work to keep CricLab available and quick, but we do not promise it will be
          uninterrupted. Occasional maintenance is unavoidable, and we will give notice of
          planned work where we can.
        </P>
        <P>
          Features change. We may add, alter or withdraw parts of the service; where a change
          materially reduces what a paid plan gives you, we will tell you in advance and you
          may cancel.
        </P>
      </>
    ),
  },
  {
    id: 'liability',
    title: 'Liability',
    body: (
      <>
        <P>
          To the extent the law allows, CricLab is provided as it is, and we do not give
          warranties beyond those set out in these terms.
        </P>
        <Bullets
          items={[
            'We are not liable for indirect or consequential loss, lost opportunity, lost selection, or loss of data outside our control.',
            'We are not liable for decisions taken on the basis of a report — including technical changes, workload decisions or selection.',
            'Where we are liable, our total liability is limited to the amount you paid CricLab in the twelve months before the claim arose.',
            'Nothing in these terms excludes liability that cannot lawfully be excluded, including for death or personal injury caused by our negligence, or for fraud.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to these terms',
    body: (
      <P>
        We may update these terms as the product develops. The date at the top changes with
        them, and where a change materially affects your rights we will tell you by email or
        in the app before it takes effect. Continuing to use CricLab after that means you
        accept the updated terms.
      </P>
    ),
  },
  {
    id: 'governing-law',
    title: 'Governing law',
    body: (
      <>
        <P>
          These terms are governed by the laws of{' '}
          <span className="rounded bg-warn/20 px-1.5 py-0.5 font-semibold text-ink">
            [jurisdiction to be confirmed]
          </span>
          , and the courts of{' '}
          <span className="rounded bg-warn/20 px-1.5 py-0.5 font-semibold text-ink">
            [jurisdiction to be confirmed]
          </span>{' '}
          have exclusive jurisdiction over any dispute arising from them.
        </P>
        <P>
          Placeholder pending legal advice: the governing law, the forum for disputes and any
          consumer rights that cannot be overridden must be settled by counsel before launch.
        </P>
      </>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    body: (
      <>
        <P>
          Questions about these terms go to{' '}
          <a
            href="mailto:legal@criclab.com"
            className="font-semibold text-pitch underline underline-offset-4"
          >
            legal@criclab.com
          </a>
          , or through the{' '}
          <Link to="/contact" className="font-semibold text-pitch underline underline-offset-4">
            contact page
          </Link>
          .
        </P>
        <P>
          How we handle your footage and your details is set out separately in the{' '}
          <Link to="/privacy" className="font-semibold text-pitch underline underline-offset-4">
            privacy policy
          </Link>
          .
        </P>
      </>
    ),
  },
]

export function TermsPage() {
  return (
    <MarketingLayout title="Terms of Service">
      <PageHero
        eyebrow="Terms of service"
        title={
          <>
            The deal, in{' '}
            <span className="text-gradient-lime">plain language</span>
          </>
        }
        lead="What you can expect from CricLab, what we expect from you, and — most importantly — exactly what the numbers on a report are for."
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
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/60">
                Please read before launch
              </span>
              <p className="text-sm leading-relaxed text-ink/75 sm:text-[15px]">
                This page is a working template, written to be readable rather than to be
                final. It has not been reviewed by a lawyer. Before CricLab is offered
                publicly, these terms — and in particular the measurement disclaimer, the
                billing terms, the liability cap and the governing-law clause — must be
                checked and adapted by qualified legal counsel for every jurisdiction the
                service is sold in.
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
                  <h2 className="font-display text-lg font-bold text-ink">{s.title}</h2>
                  <p className="text-sm leading-relaxed text-ink/65">{s.body}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ===================== TERMS BODY ===================== */}
      <Section tone="light" className="py-20 sm:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[250px_1fr] lg:gap-14">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <Reveal>
                <div className="rounded-[var(--radius-card)] border border-pitch/10 bg-white p-5 shadow-lg shadow-pitch/5">
                  <p className="pb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-ink/40">
                    On this page
                  </p>
                  <nav className="flex flex-col gap-0.5">
                    {SECTIONS.map((s, i) => (
                      <a
                        key={s.id}
                        href={`#${s.id}`}
                        className="flex gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-ink/60 transition hover:bg-pitch/5 hover:text-pitch"
                      >
                        <span className="font-mono text-[11px] leading-5 text-ink/30">
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
                    <div
                      className={
                        s.highlight
                          ? 'flex flex-col gap-4 rounded-[var(--radius-card)] border border-pitch/20 bg-white p-6 shadow-xl shadow-pitch/5 sm:p-8'
                          : 'flex flex-col gap-4'
                      }
                    >
                      {s.highlight ? (
                        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-pitch/15 bg-pitch/5 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-pitch">
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          Read this one twice
                        </span>
                      ) : null}
                      <h2 className="font-display text-2xl font-extrabold leading-tight text-ink sm:text-[1.75rem]">
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
                <div className="rounded-[var(--radius-card)] border border-pitch/10 bg-white p-6 text-xs leading-relaxed text-ink/50">
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
                eyebrow="Anything unclear?"
                title="Ask before you sign up, not after"
                lead="If a clause reads as though it is hiding something, tell us and we will rewrite it. Terms nobody understands protect nobody."
                className="max-w-none"
              />
              <Reveal delay={120}>
                <div className="flex flex-wrap gap-3">
                  <Button to="/contact" size="lg">
                    Contact us
                    <span aria-hidden>→</span>
                  </Button>
                  <Button to="/pricing" variant="secondary" size="lg">
                    See the plans
                  </Button>
                </div>
              </Reveal>
            </div>

            <Reveal delay={160}>
              <div className="flex flex-col items-start gap-4 rounded-[var(--radius-card)] border border-white/10 bg-white/[0.04] p-6">
                <div className="flex items-center gap-4">
                  <SeamBall size={54} className="shrink-0" />
                  <Eyebrow>The important line</Eyebrow>
                </div>
                <p className="text-sm leading-relaxed text-chalk/65">
                  CricLab reports measured estimates from the footage you provide. It is a
                  coaching and performance tool, not officiating equipment.
                </p>
                <Link
                  to="/privacy"
                  className="text-sm font-semibold text-lime transition hover:text-chalk"
                >
                  Read the privacy policy →
                </Link>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>
    </MarketingLayout>
  )
}
