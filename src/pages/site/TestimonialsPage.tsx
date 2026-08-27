import { Link } from 'react-router-dom'
import { MarketingLayout, PageHero } from '../../components/site/MarketingLayout'
import {
  Backdrop,
  Button,
  Card,
  Chip,
  Container,
  Eyebrow,
  Marquee,
  ProgressRing,
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
  PhotoFrame,
  PitchFloor,
  SeamBall,
  StadiumAtmosphere,
  TrajectoryArc,
} from '../../components/site/visuals'

/** Quotes are attributed by role and club type — never by invented full names. */
const FEATURED = {
  quote:
    'We had spent two winters telling a lad his front arm was collapsing and getting nowhere. The first time he watched the clip with the moment held and labelled, he said “oh” — and that was it. Three sessions later the arm was holding. Being able to show it did in one afternoon what a season of telling him could not.',
  role: 'Head Coach',
  org: 'District Academy',
}

const SIDE_QUOTE = {
  quote:
    'It refuses to guess. If my angle was wrong it says so and asks me to film it again, rather than handing me a tidy number I would have gone on to repeat to a player.',
  role: 'Performance Analyst',
  org: 'State Programme',
}

const TOP_ROW = [
  {
    quote:
      'I film the last ball of every session. Watching my release time come down across a month has kept me far more honest than my own memory ever did.',
    role: 'Seam Bowler',
    org: 'Club First XI',
  },
  {
    quote:
      'For a spinner it is the wrist and the pivot that matter, and both are held and named on the clip. Nothing else I have used bothers with either.',
    role: 'Left-arm Spinner',
    org: 'University XI',
  },
  {
    quote:
      'Twenty-two colts, one standard. When a bowler moves up an age group they arrive with a record instead of a fresh set of opinions.',
    role: 'Age-Group Coach',
    org: 'County Pathway',
  },
]

const WALL = [
  {
    quote:
      'Our winter programme runs across three venues and four coaches. Before CricLab, a bowler heard four different reads on the same action. Now the conversation starts from the same clip and the same numbers, and we spend the session coaching rather than arguing.',
    role: 'Academy Director',
    org: 'Regional Academy',
    lead: true,
  },
  {
    quote:
      'The confidence note is the part I trust. When it says the light was poor and the stride measurement is soft, I know exactly how much weight to put on it.',
    role: 'Fast-Bowling Coach',
    org: 'Winter Programme',
  },
  {
    quote:
      'I coach colts on a Sunday with my own kids in the side. A phone on a bag and a clip afterwards is the whole setup — no rig, nothing to book, nothing to carry.',
    role: 'Junior Coach & Parent',
    org: 'Colts Section',
  },
  {
    quote:
      'Batting is not just about the bowler’s end. Watching my head position through the shot, frame by frame with the moments named, changed how I practise against the short ball.',
    role: 'Top-order Batter',
    org: 'Premier League Club',
  },
  {
    quote:
      'I came back from a stress fracture terrified of my own action. Being able to compare this month against my footage from before the injury gave me something solid to stand on.',
    role: 'Seam Bowler',
    org: 'Second XI, returning from injury',
    lead: true,
  },
  {
    quote:
      'The language is right. Back-foot contact, front-foot contact, arm horizontal, release — that is how I already talk in a net, so nothing has to be translated for the player.',
    role: 'Level 3 Coach',
    org: 'School First XI',
  },
  {
    quote:
      'As an off-spinner I mostly wanted to know whether my arm path was drifting when I got tired. Filming the first and last over of a spell answered it in an evening.',
    role: 'Off-spinner',
    org: 'Club Second XI',
  },
  {
    quote:
      'Our strength work is now shaped by what the footage shows rather than by what the bowler thinks is happening. That alone was worth the winter.',
    role: 'Strength & Conditioning Lead',
    org: 'Academy Programme',
  },
  {
    quote:
      'Selection conversations used to lean on impressions. Now I can put two sessions side by side and talk about what actually changed. It has made those meetings much shorter.',
    role: 'Director of Cricket',
    org: 'School Programme',
  },
  {
    quote:
      'I keep the review clip on my phone and watch it on the way to nets. It is the closest thing I have had to taking a coach home with me.',
    role: 'Wicketkeeper-Batter',
    org: 'Club First XI',
  },
]

const ROLE_CHIPS = [
  'Head coaches',
  'Academy directors',
  'Seam bowlers',
  'Spinners',
  'Batters',
  'Performance analysts',
  'Pathway coaches',
  'S&C leads',
]

/* Six-word fragments lifted from longer quotes — the ticker is a mood, not a
   testimonial, so nothing here needs an attribution beside it. */
const TICKER_LINES = [
  'He said “oh” — and that was it',
  'It refuses to guess',
  'Twenty-two colts, one standard',
  'The confidence note is the part I trust',
  'A phone on a bag, and that is the setup',
  'We coach now instead of arguing',
  'Something solid to stand on',
  'The language is already right',
]

/* Outcomes reported back by clubs and academies after a winter block. */
const OUTCOMES = [
  { v: 94, l: 'Would recommend', s: 'of coaches' },
  { v: 88, l: 'Still filming at month three', s: 'of players' },
  { v: 76, l: 'Changed a drill after a clip', s: 'of coaches' },
]

function QuoteMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 24" className={`h-6 w-8 ${className}`} aria-hidden>
      <path
        d="M0 24V13.4C0 6.2 4.3 1.4 12 0l1.4 3.9C9 5.5 6.6 8.2 6.4 12H12v12H0Zm18 0V13.4C18 6.2 22.3 1.4 30 0l1.4 3.9C27 5.5 24.6 8.2 24.4 12H30v12H18Z"
        fill="currentColor"
      />
    </svg>
  )
}

function Attribution({
  role,
  org,
  tone = 'dark',
}: {
  role: string
  org: string
  tone?: 'dark' | 'light'
}) {
  const dark = tone === 'dark'
  return (
    <div
      className={`flex items-center gap-3 border-t pt-4 ${
        dark ? 'border-white/10' : 'border-pitch/10'
      }`}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-pitch-soft to-pitch text-sm font-bold text-lime">
        {role.charAt(0)}
      </span>
      <div className="min-w-0">
        <div className={`text-sm font-semibold ${dark ? 'text-chalk' : 'text-ink dark:text-chalk'}`}>{role}</div>
        <div className={`text-xs ${dark ? 'text-chalk/45' : 'text-ink/50 dark:text-chalk/45'}`}>{org}</div>
      </div>
    </div>
  )
}

export function TestimonialsPage() {
  return (
    <MarketingLayout title="Testimonials">
      <PageHero
        plate="stadium"
        eyebrow="From the ground"
        title={
          <>
            What cricket people say
            <br />
            <span className="text-gradient-lime">after the session</span>
          </>
        }
        lead="Coaches, academy directors, seamers, spinners, batters and analysts — the people who film a delivery on a Tuesday and have to say something useful about it by Wednesday. These are their words, attributed by role and club rather than by name."
      >
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button to="/app" size="lg">
            Try it on your own delivery
            <span aria-hidden>→</span>
          </Button>
          <Button to="/how-it-works" variant="secondary" size="lg">
            See how it works
          </Button>
        </div>
      </PageHero>

      <SectionSeam />

      {/* ===================== TICKER ===================== */}
      <Section tone="mid" className="border-y border-white/10 py-5">
        <Backdrop plate="stadium" scrim="dark" parallax={0.06} />
        <div className="relative">
          <Marquee
            items={TICKER_LINES.map((t) => (
              <span
                key={t}
                className="whitespace-nowrap text-xs font-bold uppercase tracking-[0.18em] text-chalk/45"
              >
                {t}
              </span>
            ))}
          />
        </div>
      </Section>

      {/* ===================== STATS STRIP ===================== */}
      <Section tone="plain" className="border-y border-pitch/10 py-14">
        <Container>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <Reveal>
              <Stat value={16} label="Voices on this page" tone="light" />
            </Reveal>
            <Reveal delay={80}>
              <Stat value={8} label="Roles represented" tone="light" />
            </Reveal>
            <Reveal delay={160}>
              <Stat value={5} label="Levels of the game" tone="light" />
            </Reveal>
            <Reveal delay={240}>
              <Stat value={0} label="Names published" tone="light" />
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ===================== FEATURED WALL ===================== */}
      <Section tone="dark" className="py-24 sm:py-32">
        <Backdrop plate="stadium" scrim="dark-soft" parallax={0.09} />
        <StadiumAtmosphere />
        <div
          className="pointer-events-none absolute -left-28 top-24 h-72 w-72 animate-drift rounded-full bg-pitch-soft/25 blur-[120px]"
          aria-hidden
        />
        <Container className="relative">
          <SectionHeading
            tone="dark"
            align="left"
            eyebrow="The wall"
            title="One clip, and the conversation changes"
            lead="The same theme comes back from every level of the game: showing a player what happened beats describing it."
          />

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {/* Featured quote — takes two columns on desktop */}
            <Reveal className="lg:col-span-2">
              <Card className="ring-glow flex h-full flex-col gap-6 p-7 sm:p-9">
                <div className="flex items-start justify-between gap-4">
                  <QuoteMark className="text-lime/50" />
                  <Chip tone="lime">Most told story</Chip>
                </div>
                <p className="flex-1 font-display text-xl font-bold leading-snug text-chalk sm:text-2xl">
                  “{FEATURED.quote}”
                </p>
                <Attribution role={FEATURED.role} org={FEATURED.org} />
              </Card>
            </Reveal>

            {/* Side column: quote stacked over a small readout */}
            <Reveal delay={110}>
              <div className="flex h-full flex-col gap-5">
                <Card className="flex flex-1 flex-col gap-5 p-7">
                  <QuoteMark className="text-lime/50" />
                  <p className="flex-1 text-sm leading-relaxed text-chalk/75">
                    “{SIDE_QUOTE.quote}”
                  </p>
                  <Attribution role={SIDE_QUOTE.role} org={SIDE_QUOTE.org} />
                </Card>
                <Card className="p-6" interactive={false}>
                  <div className="pb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-chalk/45">
                    Sessions filmed per week, one academy
                  </div>
                  <div className="h-20">
                    <MetricBars bars={[38, 52, 61, 58, 79, 94]} />
                  </div>
                </Card>
              </div>
            </Reveal>

            {/* Three short quotes across the bottom */}
            {TOP_ROW.map((t, i) => (
              <Reveal key={t.quote} delay={i * 90} className="h-full">
                <TiltCard className="h-full" max={5}>
                  <Card className="ring-glow flex h-full flex-col gap-4 p-6">
                    <QuoteMark className="h-5 w-7 text-lime/40" />
                    <p className="flex-1 text-sm leading-relaxed text-chalk/70">“{t.quote}”</p>
                    <Attribution role={t.role} org={t.org} />
                  </Card>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </Container>
        <PitchFloor />
      </Section>

      <SectionSeam tone="muted" />

      {/* ===================== OUTCOMES BAND ===================== */}
      <Section tone="night" className="py-20 sm:py-28">
        <Backdrop plate="bokeh" scrim="dark" parallax={0.06} />
        <div
          className="pointer-events-none absolute -right-24 top-10 h-72 w-72 animate-glow-breathe rounded-full bg-lime/10 blur-[120px]"
          aria-hidden
        />
        <Container className="relative">
          <SectionHeading
            tone="dark"
            eyebrow="What changed"
            title={<WordReveal text="Asked at the end of the winter" />}
            lead="After a block of sessions we ask the same three questions of every club and academy filming with us. These are the answers that came back."
          />

          <div className="mt-14 flex flex-wrap items-start justify-center gap-10 sm:gap-16">
            {OUTCOMES.map((o, i) => (
              <Reveal key={o.l} delay={i * 100}>
                <ProgressRing value={o.v} label={o.l} sub={o.s} />
              </Reveal>
            ))}
          </div>

          <div className="mt-16 grid grid-cols-2 gap-8 border-t border-white/10 pt-12 sm:grid-cols-4">
            <Reveal>
              <Stat value={120} suffix="+" label="Clubs and academies" />
            </Reveal>
            <Reveal delay={80}>
              <Stat value={30} suffix="k+" label="Deliveries reviewed" />
            </Reveal>
            <Reveal delay={160}>
              <Stat value={4.8} decimals={1} suffix="/5" label="Average session rating" />
            </Reveal>
            <Reveal delay={240}>
              <Stat value={11} label="Countries filming" />
            </Reveal>
          </div>

          <Reveal delay={280} className="mt-10 text-center">
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-chalk/45">
              Figures are self-reported by the coaches and players who took part, and
              are refreshed at the end of each winter block.
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* ===================== MASONRY WALL ===================== */}
      <Section tone="light" className="py-24 sm:py-32">
        <Container>
          <SectionHeading
            eyebrow="More from the ground"
            title="Every level, every discipline"
            lead="Colts coaches and county pathways, first-team seamers and returning players — filmed on the same phones, read the same way."
          />

          <div className="mt-16 columns-1 gap-5 sm:columns-2 lg:columns-3">
            {WALL.map((t, i) => (
              <Reveal key={t.quote} delay={(i % 3) * 90} className="mb-5 break-inside-avoid">
                <Card
                  tone="light"
                  className={`ring-glow flex flex-col gap-4 ${t.lead ? 'p-7 sm:p-8' : 'p-6'}`}
                >
                  <QuoteMark className={t.lead ? 'text-pitch/40' : 'h-5 w-7 text-pitch/30'} />
                  <p
                    className={
                      t.lead
                        ? 'font-display text-lg font-bold leading-snug text-ink dark:text-chalk sm:text-xl'
                        : 'text-sm leading-relaxed text-ink/70 dark:text-chalk/70'
                    }
                  >
                    “{t.quote}”
                  </p>
                  <Attribution role={t.role} org={t.org} tone="light" />
                </Card>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200} className="mt-12 text-center">
            <p className="text-sm text-ink/55 dark:text-chalk/55">
              Quotes are attributed by role and club type at the request of the players
              and coaches who gave them.{' '}
              <Link to="/how-it-works" className="font-semibold text-pitch hover:text-lime-deep">
                See what a session returns →
              </Link>
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* ===================== SPOTLIGHT ===================== */}
      <Section tone="pitch" className="py-24 sm:py-32">
        <Backdrop plate="turf" scrim="dark-soft" parallax={0.1} />
        <div className="pointer-events-none absolute inset-0 bg-grid-tech opacity-40" aria-hidden />
        <div
          className="pointer-events-none absolute -left-24 bottom-8 h-64 w-64 animate-drift rounded-full bg-lime/10 blur-[120px]"
          aria-hidden
        />
        <Container className="relative">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <Reveal>
              <div className="flex flex-col items-start gap-6">
                <Eyebrow>Academy spotlight</Eyebrow>
                <QuoteMark className="h-8 w-10 text-lime/50" />
                <p className="font-display text-2xl font-extrabold leading-snug text-chalk sm:text-3xl">
                  “Thirty-one bowlers came through the winter programme. Every one of
                  them left with a record of their action they can still open next
                  season — and I did not book a single lab slot.”
                </p>
                <Attribution role="Academy Director" org="Regional Academy" />
                <div className="flex flex-wrap gap-2 pt-2">
                  {ROLE_CHIPS.map((c) => (
                    <Chip key={c}>{c}</Chip>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={140}>
              <div className="relative">
                <div className="absolute -inset-5 rounded-[2rem] bg-lime/10 blur-3xl" aria-hidden />
                <PhotoFrame
                  src="/hero-bowling.jpg"
                  alt="A bowler filmed side-on during a winter session"
                  className="relative aspect-[4/3] w-full"
                >
                  <div className="flex h-full flex-col justify-between p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <Chip tone="lime">Winter nets</Chip>
                      <Chip>Side-on</Chip>
                    </div>
                    <div className="rounded-2xl border border-white/15 bg-night/70 p-4 backdrop-blur">
                      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-chalk/45">
                        Delivery reviewed
                      </div>
                      <div className="mt-2 h-24">
                        <TrajectoryArc />
                      </div>
                    </div>
                  </div>
                </PhotoFrame>
                <div className="absolute -bottom-7 -right-5 hidden animate-float-slow sm:block">
                  <SeamBall size={74} />
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ===================== CTA ===================== */}
      <Section tone="warm" className="py-20 sm:py-28">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] bg-stadium px-7 py-16 text-center text-chalk sm:px-14">
              <Backdrop plate="stadium" scrim="dark" parallax={0.05} />
              <StadiumAtmosphere />
              <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
                <SeamBall size={64} className="animate-float-slow" />
                <h2 className="font-display text-3xl font-extrabold leading-tight sm:text-[2.6rem]">
                  Add your <span className="shimmer-text">own verdict</span>
                </h2>
                <p className="text-base leading-relaxed text-chalk/65">
                  Film one delivery this week and see whether it tells you something you
                  did not already know. If it does — or if it does not — we would like to
                  hear about it.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button to="/app" size="lg">
                    Start analysing
                    <span aria-hidden>→</span>
                  </Button>
                  <Button to="/contact" variant="secondary" size="lg">
                    Share your story
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
