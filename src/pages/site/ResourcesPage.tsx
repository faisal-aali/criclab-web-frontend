import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { MarketingLayout, PageHero } from '../../components/site/MarketingLayout'
import {
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
  BowlerSkeleton,
  MetricBars,
  PhotoFrame,
  PitchFloor,
  SeamBall,
  StadiumAtmosphere,
  TrajectoryArc,
} from '../../components/site/visuals'

/* ---------------------------------------------------------------------------
   Writing from the ground: filming craft, bowling technique, and how coaches
   turn a review clip into a net session. Artwork falls back to the drawn
   visuals so a piece never waits on photography.
--------------------------------------------------------------------------- */

type ArtKind = 'skeleton' | 'arc' | 'bars' | 'ball'

type Article = {
  category: 'Bowling Technique' | 'Filming' | 'Coaching' | 'Performance'
  title: string
  read: string
  excerpt: string
  art: ArtKind
}

const FEATURED = {
  category: 'Bowling Technique',
  title: 'The front foot tells you more than the arm ever will',
  read: '8 min read',
  excerpt:
    'Every bowler who wants another yard of pace goes looking for it in the arm. The footage keeps pointing somewhere else — at what the front leg does in the fraction of a second between landing and release, and how much of a hard-earned run-up it quietly gives back.',
  points: [
    'Why a collapsing front knee costs more than a slow arm',
    'The timing split that separates a good spell from a flat one',
    'What to film if you want to see it for yourself',
  ],
}

const ARTICLES: Article[] = [
  {
    category: 'Filming',
    title: 'A side-on set-up that takes ninety seconds',
    read: '5 min read',
    excerpt:
      'Where to stand, how high to hold the phone, and the one framing mistake that quietly costs you half the measurements.',
    art: 'arc',
  },
  {
    category: 'Bowling Technique',
    title: 'Arm path: what “falling away” actually looks like',
    read: '7 min read',
    excerpt:
      'Easy to say at the top of a bowler’s mark, hard to see at full pace. Here it is frame by frame, with the trunk lean that gives it away.',
    art: 'skeleton',
  },
  {
    category: 'Coaching',
    title: 'Turning a review clip into a net session',
    read: '6 min read',
    excerpt:
      'Three drills matched to the three faults that turn up most often in club-level seam bowling, and the order to work them in.',
    art: 'bars',
  },
  {
    category: 'Performance',
    title: 'Why your quickest ball is rarely your best ball',
    read: '6 min read',
    excerpt:
      'Pace without a repeatable release height takes a wicket once a spell. Repeatability is the number worth chasing through a season.',
    art: 'ball',
  },
  {
    category: 'Filming',
    title: 'Indoor nets: light, netting and the wall behind you',
    read: '4 min read',
    excerpt:
      'Indoor footage is harder than it looks. A few small adjustments make an indoor clip every bit as readable as one filmed in June sun.',
    art: 'arc',
  },
  {
    category: 'Bowling Technique',
    title: 'Spinners: reading the wrist at the moment of release',
    read: '9 min read',
    excerpt:
      'Leg-break, googly and slider separate across a handful of frames. Filming closer and slower is very nearly the whole trick.',
    art: 'skeleton',
  },
  {
    category: 'Coaching',
    title: 'Feedback that lands: showing rather than telling',
    read: '5 min read',
    excerpt:
      'Players change what they can see. A note on when to put the clip in front of them, and when to say nothing at all.',
    art: 'bars',
  },
  {
    category: 'Performance',
    title: 'Building a season baseline in four sessions',
    read: '7 min read',
    excerpt:
      'Pre-season is the cheapest time to find out what your action really does. A simple four-session plan you can run in any net.',
    art: 'ball',
  },
  {
    category: 'Coaching',
    title: 'What to do when a figure comes back unavailable',
    read: '3 min read',
    excerpt:
      'It happens, and it is usually the camera. How to read the reason given, fix the film, and have the number next time.',
    art: 'arc',
  },
]

const GUIDES = [
  {
    n: '01',
    title: 'The filming guide',
    body: 'The side-on set-up, step by step: where to stand, how to frame the bound, and what to check before the bowler runs in.',
    to: '/record',
    cta: 'Read the guide',
  },
  {
    n: '02',
    title: 'How CricLab works',
    body: 'Record, upload, review, improve — the whole loop from a phone in the nets to a drill you can run next session.',
    to: '/how-it-works',
    cta: 'Walk the flow',
  },
  {
    n: '03',
    title: 'What gets measured',
    body: 'Every phase, every figure, and the confidence note that sits beside it. The reference for reading your own results.',
    to: '/features',
    cta: 'See the detail',
  },
]

/* A four-stage path for someone who has never filmed a delivery. Ordered by
   what to do next, not by how long each piece takes to read. */
const PATH = [
  {
    n: '01',
    stage: 'Before the first ball',
    title: 'Get the camera in the right place',
    body: 'Side-on, waist height, whole body in frame, landscape. Almost every disappointing read starts here.',
    read: '5 min',
    to: '/record',
    cta: 'Filming guide',
  },
  {
    n: '02',
    stage: 'The first session',
    title: 'Film one delivery and read it back',
    body: 'One ball, not an over. Watch the moments held on the clip before you go anywhere near the numbers.',
    read: '6 min',
    to: '/how-it-works',
    cta: 'Walk the flow',
  },
  {
    n: '03',
    stage: 'The first month',
    title: 'Learn what each figure carries',
    body: 'Release height, stride, timing splits — and the confidence note that says how much weight to put on each.',
    read: '7 min',
    to: '/features',
    cta: 'See the detail',
  },
  {
    n: '04',
    stage: 'The first block',
    title: 'Build a baseline you can argue with',
    body: 'Four sessions filmed the same way turn a feeling about an action into a line you can point at.',
    read: '7 min',
    to: '/app',
    cta: 'Start filming',
  },
]

function ArticleArt({ kind }: { kind: ArtKind }) {
  switch (kind) {
    case 'skeleton':
      return (
        <div className="absolute inset-0 grid place-items-center p-6 opacity-75">
          <BowlerSkeleton />
        </div>
      )
    case 'arc':
      return (
        <div className="absolute inset-0 grid place-items-center p-3 opacity-85">
          <TrajectoryArc />
        </div>
      )
    case 'bars':
      return (
        <div className="absolute inset-0 p-7 opacity-80">
          <MetricBars bars={[42, 66, 55, 78, 61, 88]} />
        </div>
      )
    case 'ball':
      return (
        <div className="absolute inset-0 grid place-items-center opacity-90">
          <SeamBall size={92} />
        </div>
      )
  }
}

export function ResourcesPage() {
  const [email, setEmail] = useState('')
  const [signedUp, setSignedUp] = useState(false)

  function handleSignUp(event: FormEvent<HTMLFormElement>) {
    // Presentation only — the form keeps its state on the page and goes nowhere.
    event.preventDefault()
    if (!email.trim()) return
    setSignedUp(true)
  }

  return (
    <MarketingLayout title="Resources">
      {/* ===================== HERO ===================== */}
      <PageHero
        plate="bokeh"
        eyebrow="Insights & resources"
        title={
          <>
            Notes from{' '}
            <span className="text-gradient-lime">the bowler’s mark</span>
          </>
        }
        lead="Filming craft, action technique and coaching practice — written for people who spend their evenings in a net, not in a lecture theatre. Short pieces you can read between overs."
      >
        <div className="flex flex-wrap gap-2 pt-3">
          <Chip tone="lime">Bowling Technique</Chip>
          <Chip tone="neutral">Filming</Chip>
          <Chip tone="neutral">Coaching</Chip>
          <Chip tone="neutral">Performance</Chip>
        </div>
      </PageHero>

      <SectionSeam />

      {/* ===================== LEARNING PATH ===================== */}
      <Section tone="mid" className="py-20 sm:py-28">
        <Backdrop plate="nets" scrim="dark" parallax={0.08} />
        <div
          className="pointer-events-none absolute -right-28 top-10 h-72 w-72 animate-glow-breathe rounded-full bg-lime/10 blur-[120px]"
          aria-hidden
        />
        <Container className="relative">
          <SectionHeading
            tone="dark"
            eyebrow="Start here"
            title={<WordReveal text="A path, not a pile" />}
            lead="Nine pieces and three guides is a lot to land on. Read them in this order and each one makes the next one shorter."
          />

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PATH.map((s, i) => (
              <Reveal key={s.n} delay={i * 90} className="h-full">
                <Link to={s.to} className="group block h-full">
                  <TiltCard className="h-full" max={6}>
                    <Card className="ring-glow flex h-full flex-col gap-3 p-6">
                      <div className="flex items-center gap-3">
                        <span className="font-display text-3xl font-extrabold text-lime/25">
                          {s.n}
                        </span>
                        <span className="h-px flex-1 bg-gradient-to-r from-lime/40 to-transparent" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-lime/70">
                        {s.stage}
                      </span>
                      <h3 className="font-display text-lg font-bold leading-snug text-chalk">
                        {s.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-chalk/60">{s.body}</p>
                      <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-chalk/40">
                        <span>{s.read}</span>
                        <span className="text-lime transition group-hover:translate-x-1">
                          {s.cta} →
                        </span>
                      </div>
                    </Card>
                  </TiltCard>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal delay={220} className="mt-8 text-center">
            <p className="text-sm text-chalk/50">
              Roughly twenty-five minutes of reading, spread across your first block
              of sessions.
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* ===================== FEATURED ===================== */}
      <Section tone="light" className="py-20 sm:py-28">
        <Container>
          <SectionHeading
            align="left"
            eyebrow="Featured"
            title="The piece we keep sending people"
            className="max-w-none"
          />

          <Reveal delay={120} className="mt-10">
            <div className="grid gap-8 overflow-hidden rounded-[2rem] border border-pitch/10 dark:border-white/10 bg-white dark:bg-white/6 p-6 shadow-xl shadow-pitch/5 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <PhotoFrame
                src="/hero-bowling.jpg"
                alt="A bowler in the delivery stride, front foot landing"
                className="aspect-[16/10] w-full"
              >
                <div className="flex h-full flex-col justify-between p-5">
                  <div className="flex items-start justify-between gap-3">
                    <Chip tone="lime">{FEATURED.category}</Chip>
                    <Chip tone="neutral">{FEATURED.read}</Chip>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-chalk/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-lime" />
                    Front-foot contact → release
                  </div>
                </div>
              </PhotoFrame>

              <div className="flex flex-col items-start gap-5">
                <h3 className="font-display text-2xl font-extrabold leading-[1.15] text-ink dark:text-chalk sm:text-3xl">
                  {FEATURED.title}
                </h3>
                <p className="text-base leading-relaxed text-ink/65 dark:text-chalk/65">{FEATURED.excerpt}</p>
                <ul className="flex flex-col gap-3">
                  {FEATURED.points.map((p) => (
                    <li
                      key={p}
                      className="flex items-start gap-3 text-sm font-medium leading-relaxed text-ink/75 dark:text-chalk/75"
                    >
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-pitch text-[11px] font-bold text-lime">
                        ✓
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink/40 dark:text-chalk/40">
                  <span>{FEATURED.read}</span>
                  <span>Written with club coaches</span>
                </div>
                <Button to="/features" variant="light" className="mt-1">
                  See what it measures
                  <span aria-hidden>→</span>
                </Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ===================== ARTICLE GRID ===================== */}
      <Section tone="dark" className="py-20 sm:py-28">
        <Backdrop plate="bokeh" scrim="dark" parallax={0.07} />
        <StadiumAtmosphere />
        <div
          className="pointer-events-none absolute -left-24 top-40 h-72 w-72 animate-drift rounded-full bg-pitch-soft/25 blur-[120px]"
          aria-hidden
        />
        <Container size="wide" className="relative">
          <SectionHeading
            tone="dark"
            eyebrow="The reading room"
            title="Everything else worth a look"
            lead="Sorted by what you are trying to fix: the camera, the action, the session, or the season."
          />

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ARTICLES.map((a, i) => (
              <Reveal key={a.title} delay={(i % 3) * 90} className="h-full">
                <TiltCard className="h-full" max={6}>
                  <Card className="ring-glow flex h-full flex-col overflow-hidden p-0">
                    <PhotoFrame
                      className="aspect-[16/10] w-full rounded-none"
                      overlay={false}
                      fallback={<ArticleArt kind={a.art} />}
                    >
                      <div className="flex h-full items-start justify-between p-4">
                        <Chip tone="lime">{a.category}</Chip>
                      </div>
                    </PhotoFrame>
                    <div className="flex flex-1 flex-col gap-3 p-6">
                      <h3 className="font-display text-lg font-bold leading-snug text-chalk">
                        {a.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-chalk/60">{a.excerpt}</p>
                      <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-chalk/40">
                        <span>{a.read}</span>
                        <span className="text-lime/70">Full piece soon</span>
                      </div>
                    </div>
                  </Card>
                </TiltCard>
              </Reveal>
            ))}
          </div>

          <div className="mt-14 grid grid-cols-2 gap-8 border-t border-white/10 pt-10 sm:grid-cols-4">
            <Reveal>
              <Stat value={4} label="Categories" />
            </Reveal>
            <Reveal delay={80}>
              <Stat value={10} suffix=" min" label="Longest read" />
            </Reveal>
            <Reveal delay={160}>
              <Stat value={2} label="New pieces a month" />
            </Reveal>
            <Reveal delay={240}>
              <div className="flex flex-col gap-1">
                <div className="font-display text-3xl font-extrabold text-gradient-lime sm:text-4xl">
                  <CountUp to={0} prefix="£" />
                </div>
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-chalk/50">
                  Cost to read
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
        <PitchFloor />
      </Section>

      {/* ===================== GUIDES STRIP ===================== */}
      <Section tone="warm" className="py-20 sm:py-28">
        <Container>
          <SectionHeading
            eyebrow="The references"
            title="The three guides worth keeping open"
            lead="If you only read one thing before your next net, make it the filming guide. Everything else gets easier once the camera is in the right place."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {GUIDES.map((g, i) => (
              <Reveal key={g.to} delay={i * 90} className="h-full">
                <Link to={g.to} className="group block h-full">
                  <Card tone="light" className="ring-glow flex h-full flex-col gap-4 p-6">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-4xl font-extrabold text-pitch/15 dark:text-lime/15">
                        {g.n}
                      </span>
                      <span className="h-px flex-1 bg-gradient-to-r from-pitch/25 to-transparent" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-ink dark:text-chalk">{g.title}</h3>
                    <p className="text-sm leading-relaxed text-ink/65 dark:text-chalk/65">{g.body}</p>
                    <span className="mt-auto pt-2 text-sm font-semibold text-pitch dark:text-lime transition group-hover:translate-x-1">
                      {g.cta} →
                    </span>
                  </Card>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ===================== NEWSLETTER ===================== */}
      <Section tone="pitch" className="py-20 sm:py-28">
        <Backdrop plate="turf" scrim="dark-soft" parallax={0.1} />
        <div className="pointer-events-none absolute inset-0 bg-grid-tech opacity-40" aria-hidden />
        <div
          className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 animate-glow-breathe rounded-full bg-lime/10 blur-[120px]"
          aria-hidden
        />
        <Container className="relative">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="flex flex-col items-start gap-5">
              <Reveal>
                <Eyebrow>The fortnightly note</Eyebrow>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="font-display text-3xl font-extrabold leading-[1.12] text-chalk sm:text-4xl">
                  One email a fortnight, and only when we have something
                </h2>
              </Reveal>
              <Reveal delay={140}>
                <p className="max-w-xl text-base leading-relaxed text-chalk/65">
                  A new piece, a filming tip that saved somebody a wasted session,
                  and the occasional thing we got wrong and corrected. No fixtures
                  list, no round-ups, nothing you would skim past.
                </p>
              </Reveal>
              <Reveal delay={200}>
                <ul className="flex flex-col gap-2.5 pt-1">
                  {[
                    'Written by the people building CricLab',
                    'A filming tip in every issue',
                    'Unsubscribe from any email, in one tap',
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-3 text-sm text-chalk/70">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-lime/15 text-[11px] font-bold text-lime">
                        ✓
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            <Reveal delay={160}>
              <Card className="p-7 sm:p-8" interactive={false}>
                {signedUp ? (
                  <div className="flex flex-col items-start gap-4">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-lime text-xl font-bold text-night">
                      ✓
                    </span>
                    <h3 className="font-display text-2xl font-extrabold text-chalk">
                      You’re on the list
                    </h3>
                    <p className="text-sm leading-relaxed text-chalk/65">
                      Thanks — the next note goes out in a fortnight. Until then, the
                      filming guide is the best twenty minutes you can spend before
                      your next session.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-1">
                      <Button to="/record" variant="secondary">
                        Read the filming guide
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setSignedUp(false)
                          setEmail('')
                        }}
                      >
                        Add another address
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSignUp} className="flex flex-col gap-4">
                    <h3 className="font-display text-2xl font-extrabold text-chalk">
                      Sign up for the note
                    </h3>
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="resources-email"
                        className="text-xs font-semibold uppercase tracking-[0.14em] text-chalk/45"
                      >
                        Email address
                      </label>
                      <input
                        id="resources-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@yourclub.co.uk"
                        className="field field-dark"
                      />
                    </div>
                    <Button type="submit" size="lg" className="w-full">
                      Join the list
                      <span aria-hidden>→</span>
                    </Button>
                    <p className="text-xs leading-relaxed text-chalk/45">
                      Your address is used for the fortnightly note and nothing else.
                      Leave whenever you like.
                    </p>
                  </form>
                )}
              </Card>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ===================== CTA ===================== */}
      <Section tone="plain" className="py-20 sm:py-28">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] bg-stadium px-7 py-16 text-center text-chalk sm:px-14">
              <Backdrop plate="bokeh" scrim="dark" parallax={0.05} />
              <StadiumAtmosphere />
              <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
                <SeamBall size={64} className="animate-float-slow" />
                <h2 className="font-display text-3xl font-extrabold leading-tight sm:text-[2.6rem]">
                  Reading is one thing.{' '}
                  <span className="shimmer-text">Filming is another.</span>
                </h2>
                <p className="text-base leading-relaxed text-chalk/65">
                  Everything on this page is easier to follow once you have watched
                  one of your own deliveries pulled apart. Send down a ball and see
                  what comes back.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button to="/app" size="lg">
                    Start Analyzing
                    <span aria-hidden>→</span>
                  </Button>
                  <Button to="/pricing" variant="secondary" size="lg">
                    View pricing
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
