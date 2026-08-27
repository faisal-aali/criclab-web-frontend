import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MarketingLayout, PageHero } from '../../components/site/MarketingLayout'
import {
  Accordion,
  Backdrop,
  Button,
  Card,
  Chip,
  Container,
  CountUp,
  Eyebrow,
  Reveal,
  Section,
  SectionHeading,
  SectionSeam,
  Stat,
  TiltCard,
  WordReveal,
} from '../../components/site/ui'
import {
  MetricBars,
  PitchFloor,
  SeamBall,
  StadiumAtmosphere,
  TrajectoryArc,
} from '../../components/site/visuals'

/* ---------------------------------------------------------------------------
   Plans. Pricing figures are placeholders while launch pricing is settled —
   yearly is priced at ten months, so a full season costs two months less.
--------------------------------------------------------------------------- */

type Tier = {
  id: string
  name: string
  who: string
  price: { monthly: number; yearly: number } | null
  cta: { label: string; to: string }
  features: string[]
  featured?: boolean
}

const TIERS: Tier[] = [
  {
    id: 'player',
    name: 'Player',
    who: 'For the bowler who films their own nets and wants the honest read.',
    price: { monthly: 9, yearly: 90 },
    cta: { label: 'Start with Player', to: '/app' },
    features: [
      '12 delivery analyses a month',
      'Marked-up slow-motion review clip',
      'Ball flight drawn over your own footage',
      'Speed, release height, stride and timing splits',
      'A confidence note on every number',
      'Session history kept for side-by-side comparison',
      'Drills matched to what the footage showed',
    ],
  },
  {
    id: 'coach',
    name: 'Coach',
    who: 'For coaches running nets across a group of seamers and spinners.',
    price: { monthly: 29, yearly: 290 },
    cta: { label: 'Choose Coach', to: '/app' },
    featured: true,
    features: [
      'Everything in Player, plus:',
      '60 delivery analyses a month',
      'Up to 12 player profiles, each with its own history',
      'Any two deliveries lined up side by side',
      'Clips shared with your notes pinned to the timeline',
      'A session summary the player takes away',
      'Priority turnaround on match days',
    ],
  },
  {
    id: 'academy',
    name: 'Academy',
    who: 'For squads, academies and performance programmes with a full roster.',
    price: null,
    cta: { label: 'Talk to us', to: '/contact' },
    features: [
      'Everything in Coach, plus:',
      'Unlimited player profiles and coaching seats',
      'Squad-wide reporting across age groups',
      'A shared drill library for your staff',
      'Onboarding for the coaching team',
      'A named contact for the season',
    ],
  },
]

type CellValue = string | boolean

type ComparisonGroup = {
  name: string
  rows: { label: string; player: CellValue; coach: CellValue; academy: CellValue }[]
}

const COMPARISON: ComparisonGroup[] = [
  {
    name: 'Every delivery',
    rows: [
      { label: 'Delivery analyses each month', player: '12', coach: '60', academy: 'Unlimited' },
      { label: 'Marked-up slow-motion review clip', player: true, coach: true, academy: true },
      { label: 'Ball flight drawn over your footage', player: true, coach: true, academy: true },
      { label: 'Keypoint map of the action', player: true, coach: true, academy: true },
      { label: 'Confidence note on every figure', player: true, coach: true, academy: true },
      { label: 'Phases named the way coaches name them', player: true, coach: true, academy: true },
    ],
  },
  {
    name: 'Working with players',
    rows: [
      { label: 'Player profiles', player: '1', coach: '12', academy: 'Unlimited' },
      { label: 'Side-by-side delivery comparison', player: false, coach: true, academy: true },
      { label: 'Session summary to hand the player', player: false, coach: true, academy: true },
      { label: 'Notes pinned to the review clip', player: false, coach: true, academy: true },
      { label: 'Squad-wide reporting by age group', player: false, coach: false, academy: true },
      { label: 'Shared drill library for your staff', player: false, coach: false, academy: true },
    ],
  },
  {
    name: 'Access and support',
    rows: [
      { label: 'Coaching seats', player: '1', coach: '3', academy: 'Unlimited' },
      { label: 'Priority turnaround on match days', player: false, coach: true, academy: true },
      { label: 'Onboarding for your coaching team', player: false, coach: false, academy: true },
      { label: 'Support', player: 'Email', coach: 'Email and chat', academy: 'Named contact' },
    ],
  },
]

const PRICING_FAQ = [
  {
    q: 'How does billing work?',
    a: 'Monthly plans start on the day you join and renew on the same date each month. Yearly plans are taken once and run for a full twelve months, priced at ten — so a season costs you two months less. The figures on this page are placeholders while launch pricing is settled.',
  },
  {
    q: 'Can I cancel whenever I want?',
    a: 'Yes. Cancel from your account in a couple of taps and the plan runs to the end of the period you have already paid for. Nothing renews after that, and the sessions you have already filmed stay there to look back at.',
  },
  {
    q: 'What counts as one analysis?',
    a: 'One delivery. Submit a clip of a single ball and that is one analysis, however many times you then watch it, share it, or line it up against an older delivery. If you re-film the same ball and send it again, that is a fresh analysis.',
  },
  {
    q: 'How do seats work for a squad?',
    a: 'On Academy, every coach gets their own sign-in and every player gets their own profile, so a delivery is always attributed to the bowler who sent it down. Seats can be moved between coaching staff mid-season without losing any player history.',
  },
  {
    q: 'Is a phone enough, or do I need a proper camera?',
    a: (
      <>
        A recent phone filming side-on at 60 frames per second is enough for the full
        read. A higher frame rate sharpens the timing splits, and better light helps
        more than better kit does. The{' '}
        <Link to="/record" className="font-semibold text-pitch underline underline-offset-2">
          filming guide
        </Link>{' '}
        takes a minute and is worth the minute.
      </>
    ),
  },
  {
    q: 'Can I switch between monthly and yearly?',
    a: 'Any time, in both directions. Moving up to yearly applies straight away and what you have already paid for the current month is credited against it. Moving back to monthly takes effect when the year is up.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'If CricLab is not for you, tell us within 14 days of your first payment and we will refund it in full — no form, no reason required. After that, cancel any time and you simply will not be billed again.',
  },
]

/* The five moments a delivery is broken into, in the order they happen. Shown
   as a rail so "one analysis" reads as a span of the action, not a line item. */
const PHASES = [
  { code: 'BFC', name: 'Back-foot contact' },
  { code: 'FFC', name: 'Front-foot contact' },
  { code: 'MER', name: 'Arm horizontal' },
  { code: 'REL', name: 'Release' },
  { code: 'FT', name: 'Follow-through' },
]

const ANALYSIS_PARTS = [
  {
    n: '01',
    t: 'The review clip',
    b: 'Slow motion with the five moments held, named and marked over the footage you filmed yourself.',
  },
  {
    n: '02',
    t: 'The ball’s flight',
    b: 'The path from the hand to the pitch mark, drawn on your own delivery rather than on a diagram.',
  },
  {
    n: '03',
    t: 'The measured numbers',
    b: 'Speed, release height, stride and the timing splits — each one carrying a note on how far to trust it.',
  },
  {
    n: '04',
    t: 'Something to work on',
    b: 'A written read on the action and drills matched to what actually showed up, ready for the next net.',
  },
]

function CompareCell({ value }: { value: CellValue }) {
  if (typeof value === 'boolean') {
    return value ? (
      <span className="inline-grid h-6 w-6 place-items-center rounded-full bg-pitch text-[12px] font-bold text-lime">
        ✓
      </span>
    ) : (
      <span className="text-base font-semibold text-ink/20 dark:text-chalk/20" aria-label="Not included">
        —
      </span>
    )
  }
  return <span className="text-sm font-semibold text-ink/75 dark:text-chalk/75">{value}</span>
}

function Tick({ children }: { children: string }) {
  return (
    <li className="flex items-start gap-3 text-sm leading-relaxed text-chalk/70">
      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-lime/15 text-[11px] font-bold text-lime">
        ✓
      </span>
      <span>{children}</span>
    </li>
  )
}

export function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const yearly = billing === 'yearly'

  return (
    <MarketingLayout title="Pricing">
      {/* ===================== HERO ===================== */}
      <PageHero
        plate="turf"
        eyebrow="Pricing"
        title={
          <>
            From one delivery to a{' '}
            <span className="text-gradient-lime">whole academy</span>
          </>
        }
        lead="Film a spell on the phone in your pocket and have it read back to you. Pick the plan that matches how often you film — and change it when the season does."
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-3 text-xs font-semibold uppercase tracking-[0.14em] text-chalk/45">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-lime" /> Cancel any time
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-lime" /> No rig, no markers
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-lime" /> Review clip on every plan
          </span>
        </div>
      </PageHero>

      <SectionSeam />

      {/* ===================== PLANS ===================== */}
      <Section tone="pitch" className="py-20 sm:py-28">
        <Backdrop plate="turf" scrim="dark-soft" parallax={0.08} />
        <div className="pointer-events-none absolute inset-0 bg-grid-tech opacity-40" aria-hidden />
        <div
          className="pointer-events-none absolute -right-28 top-16 h-72 w-72 animate-glow-breathe rounded-full bg-lime/10 blur-[120px]"
          aria-hidden
        />
        <Container size="wide" className="relative">
          <Reveal className="flex flex-col items-center gap-5 text-center">
            <Eyebrow>Three plans</Eyebrow>
            <h2 className="font-display text-3xl font-extrabold leading-[1.1] text-chalk sm:text-4xl">
              <WordReveal text="Priced by how much you film" />
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
              <div
                className="inline-flex items-center rounded-full border border-white/15 bg-white/5 p-1"
                role="group"
                aria-label="Billing period"
              >
                {(['monthly', 'yearly'] as const).map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setBilling(period)}
                    aria-pressed={billing === period}
                    className={`rounded-full px-5 py-2 text-sm font-semibold capitalize transition duration-300 ${
                      billing === period
                        ? 'bg-lime text-night shadow-[0_10px_26px_-12px_rgba(182,242,74,0.9)]'
                        : 'text-chalk/60 hover:text-chalk'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
              <Chip tone="lime">Yearly = 2 months free</Chip>
            </div>
          </Reveal>

          <div className="mt-14 grid items-stretch gap-6 md:grid-cols-3">
            {TIERS.map((tier, i) => {
              const amount = tier.price ? (yearly ? tier.price.yearly : tier.price.monthly) : null
              const saving = tier.price ? tier.price.monthly * 12 - tier.price.yearly : 0

              const body = (
                <Card
                  tone="dark"
                  interactive={!tier.featured}
                  className={`ring-glow flex h-full flex-col gap-6 p-7 sm:p-8 ${
                    // `.glass`'s own translucent background (6% white) is what
                    // gives every dark card its glassmorphism — but sitting a
                    // hair's width from the featured card's solid lime rim, it
                    // let almost all of that colour bleed through the whole
                    // face instead of just the intended thin edge. `!bg-charcoal`
                    // forces a properly opaque backdrop so the gradient only
                    // ever reads as a rim.
                    tier.featured ? '!bg-charcoal' : ''
                  }`}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-display text-2xl font-extrabold text-chalk">
                        {tier.name}
                      </h3>
                      {tier.featured ? <Chip tone="lime">Most popular</Chip> : null}
                    </div>
                    <p className="text-sm leading-relaxed text-chalk/60">{tier.who}</p>
                  </div>

                  <div className="flex flex-col gap-2 border-y border-white/10 py-6">
                    {amount === null ? (
                      <>
                        <div className="font-display text-4xl font-extrabold text-chalk">
                          Let’s talk
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-chalk/40">
                          Priced per squad
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-baseline gap-1.5">
                          <span className="font-display text-5xl font-extrabold text-chalk">
                            <CountUp key={billing} to={amount} prefix="£" />
                          </span>
                          <span className="text-sm font-semibold text-chalk/45">
                            {yearly ? '/ year' : '/ month'}
                          </span>
                        </div>
                        {yearly ? (
                          <div className="pt-1">
                            <Chip tone="lime">2 months free · save £{saving}</Chip>
                          </div>
                        ) : (
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-chalk/40">
                            Billed monthly · cancel any time
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  <ul className="flex flex-1 flex-col gap-3">
                    {tier.features.map((f) => (
                      <Tick key={f}>{f}</Tick>
                    ))}
                  </ul>

                  <Button
                    to={tier.cta.to}
                    variant={tier.featured ? 'primary' : 'secondary'}
                    size="lg"
                    className="w-full"
                  >
                    {tier.cta.label}
                    <span aria-hidden>→</span>
                  </Button>
                </Card>
              )

              return (
                <Reveal key={tier.id} delay={i * 110} className="h-full">
                  <TiltCard className="h-full" max={tier.featured ? 5 : 7}>
                    {tier.featured ? (
                      <div className="ring-glow h-full rounded-[calc(var(--radius-card)+2px)] bg-gradient-to-b from-lime/50 via-lime/15 to-transparent p-[1.5px] shadow-[0_18px_46px_-30px_rgba(182,242,74,0.45)] dark:from-lime/70 dark:via-lime/25 dark:to-lime/5 dark:shadow-[0_30px_70px_-32px_rgba(182,242,74,0.55)]">
                        {body}
                      </div>
                    ) : (
                      <div className="h-full">{body}</div>
                    )}
                  </TiltCard>
                </Reveal>
              )
            })}
          </div>

          <Reveal delay={200} className="mt-8 flex flex-col items-center gap-2 text-center">
            <p className="text-sm text-chalk/50">
              Not sure which one fits your set-up?{' '}
              <Link to="/contact" className="font-semibold text-lime hover:text-chalk">
                Tell us how you film and we’ll say →
              </Link>
            </p>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-chalk/35">
              Placeholder figures · launch pricing not yet settled
            </p>
          </Reveal>
        </Container>
      </Section>

      <SectionSeam tone="muted" />

      {/* ===================== ONE ANALYSIS, UNPACKED ===================== */}
      <Section tone="mid" className="py-20 sm:py-28">
        <Backdrop plate="pitch" scrim="dark" parallax={0.11} />
        <div
          className="pointer-events-none absolute -left-24 top-24 h-72 w-72 animate-drift rounded-full bg-pitch-soft/25 blur-[110px]"
          aria-hidden
        />
        <Container className="relative">
          <SectionHeading
            tone="dark"
            eyebrow="One analysis"
            title="What a single delivery buys you"
            lead="Every plan gets this, in full. The only thing a bigger plan changes is how many deliveries you can put through it."
          />

          <Reveal delay={100} className="mt-14">
            <div className="rounded-[var(--radius-card)] border border-white/10 bg-night/50 p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-chalk/45">
                  The delivery, moment by moment
                </span>
                <Chip tone="lime">Counts as 1</Chip>
              </div>
              <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
                {PHASES.map((p, i) => (
                  <div
                    key={p.code}
                    className={`min-w-0 rounded-xl border px-1.5 py-3 text-center transition duration-300 sm:px-2 ${
                      i === 3
                        ? 'border-lime/45 bg-lime/10'
                        : 'border-white/10 bg-white/[0.03]'
                    }`}
                  >
                    <div
                      className={`font-display text-sm font-extrabold sm:text-base ${
                        i === 3 ? 'text-lime' : 'text-chalk/70'
                      }`}
                    >
                      {p.code}
                    </div>
                    <div className="hidden pt-1 text-[10px] font-semibold leading-tight text-chalk/40 sm:block">
                      {p.name}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-pitch-soft via-lime-deep to-lime" />
              </div>
              <p className="pt-3 text-xs leading-relaxed text-chalk/45">
                One ball, one analysis — however many times you then watch it, share
                it, or line it up against a delivery from last winter.
              </p>
            </div>
          </Reveal>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ANALYSIS_PARTS.map((item, i) => (
              <Reveal key={item.n} delay={i * 90} className="h-full">
                <TiltCard className="h-full">
                  <Card className="ring-glow flex h-full flex-col gap-3 p-6">
                    <span className="font-display text-3xl font-extrabold text-lime/25">
                      {item.n}
                    </span>
                    <h3 className="font-display text-base font-bold text-chalk">{item.t}</h3>
                    <p className="text-sm leading-relaxed text-chalk/60">{item.b}</p>
                  </Card>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ===================== COMPARISON ===================== */}
      <Section tone="plain" className="py-20 sm:py-28">
        <Container>
          <SectionHeading
            eyebrow="Compare"
            title="Every line, side by side"
            lead="The same delivery analysis sits under all three plans. What changes is how many players you carry and how much of the squad you can run from one place."
          />

          <Reveal delay={120} className="mt-12">
            <div className="overflow-x-auto rounded-[var(--radius-card)] border border-pitch/10 dark:border-white/10 bg-white dark:bg-white/6 shadow-xl shadow-pitch/5">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <caption className="sr-only">
                  Feature comparison of the Player, Coach and Academy plans
                </caption>
                <thead>
                  <tr className="border-b border-pitch/10">
                    <th scope="col" className="px-5 py-4 font-display text-sm font-bold text-ink dark:text-chalk">
                      Feature
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-4 text-center font-display text-sm font-bold text-ink dark:text-chalk"
                    >
                      Player
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-4 text-center font-display text-sm font-bold text-pitch"
                    >
                      Coach
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-4 text-center font-display text-sm font-bold text-ink dark:text-chalk"
                    >
                      Academy
                    </th>
                  </tr>
                </thead>
                {COMPARISON.map((group) => (
                  <tbody key={group.name}>
                    <tr>
                      <th
                        scope="colgroup"
                        colSpan={4}
                        className="bg-mist px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.16em] text-ink/45 dark:text-chalk/45"
                      >
                        {group.name}
                      </th>
                    </tr>
                    {group.rows.map((row) => (
                      <tr key={row.label} className="border-b border-crease last:border-b-0">
                        <th
                          scope="row"
                          className="px-5 py-3.5 text-left text-sm font-medium text-ink/80 dark:text-chalk/80"
                        >
                          {row.label}
                        </th>
                        <td className="px-5 py-3.5 text-center">
                          <CompareCell value={row.player} />
                        </td>
                        <td className="bg-pitch/[0.03] px-5 py-3.5 text-center">
                          <CompareCell value={row.coach} />
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <CompareCell value={row.academy} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ))}
              </table>
            </div>
            <p className="pt-3 text-xs font-medium text-ink/45 dark:text-chalk/45 sm:hidden">
              Swipe the table sideways to compare all three plans.
            </p>
          </Reveal>

          <Reveal delay={180} className="mt-8 text-center">
            <p className="text-sm text-ink/55 dark:text-chalk/55">
              Want the detail behind each line?{' '}
              <Link
                to="/features"
                className="font-semibold text-pitch underline underline-offset-4 hover:text-lime-deep"
              >
                See what CricLab measures →
              </Link>
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* ===================== IN EVERY PLAN ===================== */}
      <Section tone="dark" className="py-20 sm:py-28">
        <Backdrop plate="stadium" scrim="dark" parallax={0.07} />
        <StadiumAtmosphere />
        <Container className="relative">
          <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="flex flex-col gap-6">
              <SectionHeading
                tone="dark"
                align="left"
                eyebrow="On every plan"
                title="The whole read, whichever tier you pick"
                lead="We do not hold the useful parts back for the expensive plan. A bowler on Player gets the same marked-up clip, the same measured numbers and the same honesty about what the footage could and could not support."
                className="max-w-none"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    t: 'The five phases',
                    b: 'Back-foot contact, front-foot contact, arm horizontal, release and follow-through — held on screen and named.',
                  },
                  {
                    t: 'Numbers with a caveat',
                    b: 'Every figure arrives with how much to trust it. When the footage cannot carry a measurement, it says so.',
                  },
                  {
                    t: 'Your own footage',
                    b: 'Everything is drawn over the clip you filmed, so a player recognises themselves rather than a diagram.',
                  },
                  {
                    t: 'Something to work on',
                    b: 'A written read on the delivery and drills matched to what showed up, ready for the next net.',
                  },
                ].map((item, i) => (
                  <Reveal key={item.t} delay={i * 80} className="h-full">
                    <Card className="ring-glow flex h-full flex-col gap-2.5 p-6">
                      <h3 className="font-display text-base font-bold text-chalk">{item.t}</h3>
                      <p className="text-sm leading-relaxed text-chalk/60">{item.b}</p>
                    </Card>
                  </Reveal>
                ))}
              </div>
            </div>

            <Reveal delay={140}>
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute -inset-5 rounded-[2rem] bg-lime/10 blur-3xl" aria-hidden />
                <Card className="relative flex flex-col gap-5 p-6" interactive={false}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-chalk/45">
                      Included everywhere
                    </span>
                    <span className="inline-flex animate-bob">
                      <SeamBall size={34} />
                    </span>
                  </div>
                  <div className="h-40 overflow-hidden rounded-2xl border border-white/10 bg-night/60 p-3">
                    <TrajectoryArc />
                  </div>
                  <div className="h-24 rounded-2xl border border-white/10 bg-night/60 p-3">
                    <MetricBars bars={[54, 68, 61, 82, 76, 91]} />
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-5">
                    <Stat value={5} label="Phases marked" />
                    <Stat value={33} suffix="+" label="Landmarks" />
                    <Stat value={1} label="Camera needed" />
                  </div>
                </Card>
              </div>
            </Reveal>
          </div>
        </Container>
        <PitchFloor />
      </Section>

      {/* ===================== PRICING FAQ ===================== */}
      <Section tone="warm" className="py-20 sm:py-28">
        <Container>
          <SectionHeading
            eyebrow="Before you pick"
            title="Questions about the money"
            lead="The awkward ones, answered plainly. Anything else about the analysis itself lives on the full FAQ."
          />
          <div className="mx-auto mt-12 max-w-3xl">
            <Accordion items={PRICING_FAQ} tone="light" />
          </div>
          <Reveal delay={160} className="mt-10 text-center">
            <p className="text-sm text-ink/55 dark:text-chalk/55">
              Still turning it over?{' '}
              <Link
                to="/faq"
                className="font-semibold text-pitch underline underline-offset-4 hover:text-lime-deep"
              >
                Read the full FAQ
              </Link>{' '}
              or{' '}
              <Link
                to="/contact"
                className="font-semibold text-pitch underline underline-offset-4 hover:text-lime-deep"
              >
                have a word with us
              </Link>
              .
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* ===================== CTA ===================== */}
      <Section tone="plain" className="py-20 sm:py-28">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] bg-stadium px-7 py-16 text-center text-chalk sm:px-14">
              <Backdrop plate="turf" scrim="dark" parallax={0.05} />
              <StadiumAtmosphere />
              <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
                <SeamBall size={64} className="animate-float-slow" />
                <h2 className="font-display text-3xl font-extrabold leading-tight sm:text-[2.6rem]">
                  Film a ball first.{' '}
                  <span className="shimmer-text">Decide after.</span>
                </h2>
                <p className="text-base leading-relaxed text-chalk/65">
                  You will know within one delivery whether this belongs in your
                  sessions. Send down a ball, take the clip you already know how to
                  take, and see what comes back.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button to="/app" size="lg">
                    Start Analyzing
                    <span aria-hidden>→</span>
                  </Button>
                  <Button to="/record" variant="secondary" size="lg">
                    Read the filming guide
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </MarketingLayout>
  )
}
