import { Link } from 'react-router-dom'
import { MarketingLayout, PageHero } from '../../components/site/MarketingLayout'
import {
  Accordion,
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
  BowlerSkeleton,
  MetricBars,
  PhotoFrame,
  PitchFloor,
  SeamBall,
  StadiumAtmosphere,
  TrajectoryArc,
} from '../../components/site/visuals'

const PROBLEM = [
  {
    tag: 'The lab',
    title: 'The best feedback sits behind a booking form',
    body: 'Marker suits, force plates, a room ringed with cameras and a specialist to read the output. Excellent work — and out of reach for almost every club, school and academy side in the world.',
  },
  {
    tag: 'The ground',
    title: 'The rest of cricket is coached from memory',
    body: 'A coach watches a spell from mid-off, forms a view, and has one clip on a phone to argue it with. A good eye catches a lot. It is not repeatable, and it is hard to hand to the player.',
  },
  {
    tag: 'The gap',
    title: 'So progress gets felt, never shown',
    body: '“It felt better today” ends up being the only record a bowler keeps. Two months on, nobody can say whether the action actually changed or whether the pitch simply suited them.',
  },
]

const DIFFERENCE = [
  {
    title: 'Cricket-native, not adapted',
    body: 'Back-foot contact, front-foot contact, arm horizontal, release, follow-through. The phases are the ones a coach already shouts from the side, not a generic movement template with the labels swapped.',
  },
  {
    title: 'Honest about what it can see',
    body: 'Every number arrives with a confidence and a plain note. When the angle, the light or the frame will not carry a measurement, CricLab says so and asks for another take rather than printing a convincing figure.',
  },
  {
    title: 'A phone is the whole kit',
    body: 'No markers, no suit, no rig, no third party to book. One clear side-on clip of one delivery, filmed on whatever is already in the kit bag, is the entire input.',
  },
  {
    title: 'Progress you can prove',
    body: 'Every session is kept, so a change in action becomes a comparison against last month instead of a memory of how it felt. Improvement stops being a claim and becomes a line you can show.',
  },
]

const AUDIENCE = [
  {
    mark: 'P',
    title: 'Players',
    body: 'Film your own spell, watch the delivery back the way a coach reads it, and take one clear thing into the next net.',
  },
  {
    mark: 'C',
    title: 'Coaches',
    body: 'Turn a hunch into something the player can see. The marked-up clip does the convincing that a description never quite manages.',
  },
  {
    mark: 'A',
    title: 'Academies',
    body: 'Give every age group the same read on an action, so a bowler moving up a group is handed a record rather than a fresh set of opinions.',
  },
  {
    mark: 'T',
    title: 'Teams & schools',
    body: 'One standard across a squad, on the kit the squad already owns — no lab slot to book, no specialist to schedule around fixtures.',
  },
]

const TEAM = [
  {
    initials: 'FP',
    role: 'Founder & Product',
    focus:
      'Decides what CricLab measures and, just as firmly, what it refuses to guess at when the footage will not support it.',
  },
  {
    initials: 'CP',
    role: 'Cricket Performance Lead',
    focus:
      'Keeps the phases, language and thresholds true to how coaching actually sounds in a net, a squad session and a match week.',
  },
  {
    initials: 'MR',
    role: 'Movement & Measurement Research',
    focus:
      'Pressure-tests every reported number against real footage until it holds up on a wet outfield, not only in ideal conditions.',
  },
  {
    initials: 'CO',
    role: 'Coaching Partnerships',
    focus:
      'Works alongside clubs, academies and school programmes so what ships next comes from the ground, not from a whiteboard.',
  },
]

/* Ticker strip — what CricLab holds itself to, in a handful of words. */
const CREED_WORDS = [
  'Cricket words, not lab words',
  'One phone',
  'One delivery',
  'A blank beats a guess',
  'Every session kept',
  'Built in the nets',
  'The footage is the player’s',
  'Colts to first XI',
]

/**
 * Milestones. Written as what changed for the people using it, which is the
 * only version of this story a coach has any reason to care about.
 */
const MILESTONES = [
  {
    year: '2023',
    title: 'One clip, one evening',
    body: 'CricLab starts as a favour. A club coach films a colt’s delivery on a phone and gets the action back split into phases before the players have left the ground. That first clip is the whole reason there is a product.',
  },
  {
    year: '2024',
    title: 'Named the way cricket names it',
    body: 'A winter of net sessions rewrote the labels. Back-foot contact, front-foot contact, arm horizontal, release, follow-through — words you can shout from square of the wicket, not terms that need a glossary.',
  },
  {
    year: '2024',
    title: 'A blank beats a guess',
    body: 'Confidence notes arrive, and with them the decision that has shaped everything since: where the footage cannot carry a measurement, the report says so and asks for another take.',
  },
  {
    year: '2025',
    title: 'Batting joins bowling',
    body: 'Trigger movement, backlift, front-foot stride, bat path and head position at contact — read off the same single clip, filmed square of the wicket on the same phone.',
  },
  {
    year: '2026',
    title: 'Sessions kept side by side',
    body: 'Deliveries from different weeks line up against each other, so a change in an action becomes something a coach can show a player rather than something they both hope happened.',
  },
  {
    year: 'Next',
    title: 'One record, colts to first XI',
    body: 'A bowler’s first filmed delivery still there when they are opening the bowling ten years on — the same phases, the same measurements, the same honest notes underneath.',
  },
]

/* Confidence, shown rather than claimed — the honesty principle made visible. */
const REPORTED_CONFIDENCE = [
  { v: 94, l: 'Release' },
  { v: 88, l: 'Stride' },
]

const PRINCIPLES = [
  {
    q: 'A number you cannot trust is worse than no number',
    a: 'A confident-looking figure that quietly falls apart costs a coach more than a blank space would. Where the evidence is thin, CricLab reports it as thin — and tells you what to change about the filming to get a firm answer.',
  },
  {
    q: 'Say plainly what the camera could not see',
    a: 'Frames drop, arms get hidden behind the body, and a stump-line angle simply cannot carry a stride measurement. Those limits are written on the report in the same size type as the results.',
  },
  {
    q: 'Cricket words, not lab words',
    a: 'If a finding cannot be said to a fifteen-year-old seamer in one sentence at the top of their mark, it is not finished. Every phase name, every prompt and every drill note is written to be used out loud.',
  },
  {
    q: 'One delivery has to be worth filming',
    a: 'Nobody is going to capture a full spell before they trust the thing. A single ball must come back with something a coach can act on that afternoon, or the tool has not earned the next upload.',
  },
  {
    q: 'The footage belongs to the player',
    a: 'Clips, sessions and reports stay the property of whoever recorded them. Sharing a review with a coach, a parent or a selector is a deliberate choice, made one session at a time.',
  },
]

export function AboutPage() {
  return (
    <MarketingLayout title="About">
      <PageHero
        plate="stadium"
        eyebrow="About CricLab"
        title={
          <>
            Lab-grade feedback,
            <br />
            <span className="text-gradient-lime">wherever cricket is played</span>
          </>
        }
        lead="CricLab began with a simple frustration: the feedback that changes a bowling action is brilliant, well understood, and almost entirely unavailable to the people who need it most. We build for the net session, the school field and the club ground — not the laboratory."
      >
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button to="/app" size="lg">
            Start analysing
            <span aria-hidden>→</span>
          </Button>
          <Button to="/how-it-works" variant="secondary" size="lg">
            See how it works
          </Button>
        </div>
      </PageHero>

      {/* ===================== TICKER ===================== */}
      <Section tone="mid" className="border-y border-white/8 py-4">
        <Marquee
          items={CREED_WORDS.map((t) => (
            <span
              key={t}
              className="whitespace-nowrap text-xs font-bold uppercase tracking-[0.2em] text-chalk/45"
            >
              {t}
            </span>
          ))}
        />
      </Section>

      {/* ===================== MISSION ===================== */}
      <Section tone="plain" className="border-b border-pitch/10 py-20 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <Reveal>
              <div className="flex flex-col items-start gap-5">
                <Eyebrow tone="light">Our mission</Eyebrow>
                <h2 className="font-display text-3xl font-extrabold leading-[1.1] text-ink dark:text-chalk sm:text-4xl">
                  Put a performance lab in every cricketer’s pocket
                </h2>
                <p className="text-base leading-relaxed text-ink/65 dark:text-chalk/65">
                  Cricket has never been short of coaching knowledge. What it has
                  lacked is a way to measure a delivery where the delivery actually
                  happens — at the top of someone’s mark, on a Tuesday, with twenty
                  minutes of light left.
                </p>
                <p className="text-base leading-relaxed text-ink/65 dark:text-chalk/65">
                  Our job is to close that distance. One clip, one honest read on the
                  action, and a record that still means something in three months’
                  time.
                </p>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <Card tone="light" className="p-7 sm:p-8" interactive={false}>
                <p className="font-display text-xl font-bold leading-snug text-ink dark:text-chalk sm:text-2xl">
                  “Every cricketer deserves to know what their action is doing —
                  not just how it felt.”
                </p>
                <div className="mt-7 grid grid-cols-3 gap-6 border-t border-pitch/10 pt-6">
                  <Stat value={1} label="Camera needed" tone="light" />
                  <Stat value={5} label="Delivery phases" tone="light" />
                  <Stat value={60} suffix="s" label="To film a ball" tone="light" />
                </div>
              </Card>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ===================== THE PROBLEM ===================== */}
      <Section tone="dark" className="py-24 sm:py-32">
        <Backdrop plate="nets" scrim="dark-soft" parallax={0.09} />
        <StadiumAtmosphere />
        <Container className="relative">
          <SectionHeading
            tone="dark"
            align="left"
            eyebrow="The problem"
            title={
              <>
                Cricket’s best feedback is
                <br className="hidden sm:block" /> its hardest to reach
              </>
            }
            lead="Good coaching insight has been locked behind expensive labs and specialist rigs, while most cricket is played, coached and improved with a phone in someone’s pocket."
          />

          <div className="mt-14 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="flex flex-col gap-4">
              {PROBLEM.map((p, i) => (
                <Reveal key={p.title} delay={i * 90}>
                  <TiltCard max={5}>
                    <Card className="ring-glow flex flex-col gap-3 p-6">
                      <Chip tone="lime">{p.tag}</Chip>
                      <h3 className="font-display text-lg font-bold text-chalk sm:text-xl">
                        {p.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-chalk/60">{p.body}</p>
                    </Card>
                  </TiltCard>
                </Reveal>
              ))}
            </div>

            <Reveal delay={160}>
              <div className="relative">
                <div
                  className="absolute -inset-5 animate-glow-breathe rounded-[2rem] bg-lime/10 blur-3xl"
                  aria-hidden
                />
                <PhotoFrame
                  src="/hero-bowling.jpg"
                  alt="A bowler in the delivery stride at a club ground"
                  className="relative aspect-[4/5] w-full sm:aspect-[5/4] lg:aspect-[4/5]"
                >
                  <div className="flex h-full flex-col justify-between p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <Chip tone="lime">Club ground</Chip>
                      <Chip>No rig</Chip>
                    </div>
                    <div className="rounded-2xl border border-white/15 bg-night/70 p-4 backdrop-blur">
                      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-chalk/45">
                        Same delivery, measured
                      </div>
                      <div className="mt-3 h-20">
                        <MetricBars bars={[42, 61, 55, 78, 88, 71]} />
                      </div>
                    </div>
                  </div>
                </PhotoFrame>
                <div className="absolute -bottom-7 -left-6 hidden animate-bob sm:block">
                  <SeamBall size={78} />
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
        <PitchFloor />
      </Section>

      {/* ===================== WHY CRICLAB ===================== */}
      <Section tone="light" className="py-24 sm:py-32">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex flex-col gap-6">
              <SectionHeading
                align="left"
                eyebrow="Why CricLab"
                title="Built to be trusted at the top of the mark"
                lead="Four commitments shape every screen we ship. They are the reasons a coach keeps the tab open during a session rather than opening it once out of curiosity."
                className="max-w-none"
              />
              <Reveal delay={120}>
                <div className="rounded-2xl border border-pitch/10 dark:border-white/10 bg-white dark:bg-white/6 p-5 shadow-lg shadow-pitch/5">
                  <div className="pb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-ink/40 dark:text-chalk/40">
                    Six sessions, one bowler
                  </div>
                  <div className="h-28">
                    <MetricBars bars={[46, 55, 52, 71, 83, 91]} />
                  </div>
                  <p className="pt-4 text-xs leading-relaxed text-ink/50 dark:text-chalk/50">
                    Kept side by side, so a change in action is something you can show
                    the player rather than something you both hope happened.
                  </p>
                </div>
              </Reveal>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {DIFFERENCE.map((d, i) => (
                <Reveal key={d.title} delay={i * 80}>
                  <TiltCard className="h-full" max={6}>
                    <Card tone="light" className="ring-glow flex h-full flex-col gap-3 p-6">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-pitch text-lime">
                        <span className="font-display text-sm font-extrabold">{i + 1}</span>
                      </span>
                      <h3 className="font-display text-lg font-bold text-ink dark:text-chalk">{d.title}</h3>
                      <p className="text-sm leading-relaxed text-ink/65 dark:text-chalk/65">{d.body}</p>
                    </Card>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* ===================== WHO IT SERVES ===================== */}
      <Section tone="pitch" className="py-24 sm:py-32">
        <Backdrop plate="pitch" scrim="dark-soft" parallax={0.1} />
        <div className="pointer-events-none absolute inset-0 bg-grid-tech opacity-30" aria-hidden />
        <Container className="relative">
          <SectionHeading
            tone="dark"
            eyebrow="Who it’s for"
            title={<WordReveal text="Written for everyone who works on an action" />}
            lead="From a colt filming their own run-up to a pathway coach carrying four age groups, the same clip does the same job."
          />

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {AUDIENCE.map((a, i) => (
              <Reveal key={a.title} delay={i * 90}>
                <TiltCard className="h-full" max={7}>
                  <Card className="ring-glow flex h-full flex-col gap-4 p-6">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-night/50 font-display text-lg font-extrabold text-lime">
                      {a.mark}
                    </span>
                    <h3 className="font-display text-xl font-bold text-chalk">{a.title}</h3>
                    <p className="text-sm leading-relaxed text-chalk/60">{a.body}</p>
                  </Card>
                </TiltCard>
              </Reveal>
            ))}
          </div>

          <Reveal delay={260} className="mt-14">
            <div className="grid items-center gap-8 rounded-[var(--radius-card)] border border-white/10 bg-night/35 p-6 sm:p-8 lg:grid-cols-[1fr_0.85fr]">
              <div className="flex flex-col items-start gap-4">
                <Eyebrow>The vision</Eyebrow>
                <h3 className="font-display text-2xl font-extrabold leading-tight text-chalk sm:text-3xl">
                  A record of every action, from colts to first XI
                </h3>
                <p className="text-sm leading-relaxed text-chalk/65 sm:text-base">
                  We want a young bowler’s first filmed delivery to still be there when
                  they are opening the bowling ten years later — the same phases, the
                  same measurements, the same honest notes. Cricket keeps meticulous
                  batting and bowling figures. It should keep a record of how the action
                  itself has grown up too.
                </p>
                <Link
                  to="/features"
                  className="pt-1 text-sm font-semibold text-lime transition hover:text-chalk"
                >
                  See what a session returns →
                </Link>
              </div>
              <div className="h-48 sm:h-56">
                <TrajectoryArc />
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      <SectionSeam />

      {/* ===================== MILESTONES ===================== */}
      <Section tone="night" className="py-24 sm:py-32">
        <Backdrop plate="turf" scrim="dark" parallax={0.07} />
        <div
          className="pointer-events-none absolute -left-32 top-1/3 h-[26rem] w-[26rem] animate-drift rounded-full bg-pitch-soft/25 blur-[140px]"
          aria-hidden
        />
        <Container className="relative">
          <SectionHeading
            tone="dark"
            align="left"
            eyebrow="How we got here"
            title="From one clip at a club net to a record of an action"
            lead="Every step below came out of a session with a coach or a player. None of it started on a whiteboard."
          />

          <div className="relative mt-14">
            {/* The rail runs the length of the story once the years sit in
                their own column. Below md there is no spine — the dots carry
                it, and a rail would only be a stripe down the gutter. */}
            <div
              className="pointer-events-none absolute bottom-8 top-8 hidden w-px bg-gradient-to-b from-transparent via-lime/30 to-transparent md:left-[6.125rem] md:block"
              aria-hidden
            />

            <div className="flex flex-col gap-4">
              {MILESTONES.map((m, i) => (
                <Reveal key={m.title} delay={i * 85}>
                  <div className="flex items-start gap-4 md:gap-6">
                    <div className="flex shrink-0 items-center gap-4 md:w-[6.5rem] md:justify-end">
                      <span className="hidden font-display text-sm font-extrabold uppercase tracking-[0.1em] text-chalk/45 md:inline">
                        {m.year}
                      </span>
                      <span
                        className="relative z-10 mt-1.5 h-3 w-3 shrink-0 rounded-full bg-lime shadow-[0_0_0_5px_rgba(182,242,74,0.14)] md:mt-0"
                        aria-hidden
                      />
                    </div>
                    <TiltCard className="min-w-0 flex-1" max={4}>
                      <Card className="ring-glow flex flex-col gap-2.5 p-5 sm:p-6">
                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-lime/70 md:hidden">
                          {m.year}
                        </span>
                        <h3 className="font-display text-lg font-bold text-chalk sm:text-xl">
                          {m.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-chalk/60">{m.body}</p>
                      </Card>
                    </TiltCard>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* ===================== TEAM ===================== */}
      <Section tone="warm" className="py-24 sm:py-32">
        <Container>
          <SectionHeading
            eyebrow="The team"
            title="A small side, picked for cricket as much as craft"
            lead="Profiles and photography go up as each seat is confirmed. The roles below are the ones shaping what CricLab ships this season."
          />

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((t, i) => (
              <Reveal key={t.role} delay={i * 85}>
                <TiltCard className="h-full" max={6}>
                  <Card tone="light" className="ring-glow flex h-full flex-col gap-4 p-6">
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-pitch-soft to-pitch font-display text-base font-extrabold text-lime">
                      {t.initials}
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-bold leading-snug text-ink dark:text-chalk">
                        {t.role}
                      </h3>
                      <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-pitch/15 bg-pitch/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-pitch">
                        Profile coming soon
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-ink/65 dark:text-chalk/65">{t.focus}</p>
                  </Card>
                </TiltCard>
              </Reveal>
            ))}
          </div>

          <Reveal delay={340} className="mt-8">
            <div className="flex flex-col items-start justify-between gap-5 rounded-[var(--radius-card)] border border-pitch/10 dark:border-white/10 bg-white dark:bg-white/6 p-6 shadow-lg shadow-pitch/5 sm:flex-row sm:items-center sm:p-7">
              <div>
                <h3 className="font-display text-lg font-bold text-ink dark:text-chalk">
                  There is a seat open for a cricket person
                </h3>
                <p className="pt-1 text-sm leading-relaxed text-ink/60 dark:text-chalk/60">
                  If you have coached, played or analysed at any level and want to build
                  the tools you wished you had, we would rather hear from you than from a
                  recruiter.
                </p>
              </div>
              <Button to="/careers" variant="light" className="shrink-0">
                See open roles
              </Button>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ===================== PRINCIPLES ===================== */}
      <Section tone="mid" className="py-24 sm:py-32">
        <Backdrop plate="bokeh" scrim="dark" parallax={0.06} />
        <Container className="relative">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="flex flex-col gap-8">
              <SectionHeading
                tone="dark"
                align="left"
                eyebrow="Principles"
                title="The rules we will not trade away"
                lead="Five commitments that decide what gets built, what gets cut, and what we are willing to put in front of a coach mid-session."
                className="max-w-none"
              />
              <Accordion tone="dark" items={PRINCIPLES} />
            </div>

            <Reveal delay={150}>
              <div className="relative">
                <div
                  className="absolute -inset-5 animate-glow-breathe rounded-[2rem] bg-pitch-soft/25 blur-3xl"
                  aria-hidden
                />
                <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-white/10 bg-night/60 p-6">
                  <div className="flex items-center justify-between pb-4">
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-chalk/45">
                      What we look at
                    </span>
                    <Chip tone="lime">Side-on</Chip>
                  </div>
                  <div className="h-64 sm:h-72">
                    <BowlerSkeleton />
                  </div>
                  <p className="pt-4 text-xs leading-relaxed text-chalk/50">
                    Wrists, elbows, hips, trunk and feet — the same landmarks a coach
                    watches for, held still long enough to talk about.
                  </p>

                  {/* The first principle, shown rather than asserted: how sure
                      CricLab is travels with the figure. */}
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-6 border-t border-white/10 pt-5 sm:justify-between sm:gap-4">
                    {REPORTED_CONFIDENCE.map((c, i) => (
                      <Reveal key={c.l} delay={i * 110}>
                        <ProgressRing value={c.v} size={88} stroke={7} label={c.l} sub="conf." />
                      </Reveal>
                    ))}
                    <p className="max-w-[13rem] text-xs leading-relaxed text-chalk/50">
                      Reported alongside every measurement — and left blank when the
                      clip will not carry one.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ===================== CTA ===================== */}
      <Section tone="light" className="py-20 sm:py-28">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] bg-stadium px-7 py-16 text-center text-chalk sm:px-14">
              <Backdrop plate="turf" scrim="dark" parallax={0.05} />
              <StadiumAtmosphere />
              <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
                <span className="inline-block animate-bob">
                  <SeamBall size={64} />
                </span>
                <h2 className="font-display text-3xl font-extrabold leading-tight sm:text-[2.6rem]">
                  Bring us your <span className="text-gradient-lime">next delivery</span>
                </h2>
                <p className="text-base leading-relaxed text-chalk/65">
                  Film one ball and see what comes back. If you are a coach, an academy
                  or a club side wanting to work with us on what comes next, we would
                  like to hear from you.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button to="/app" size="lg">
                    Start analysing
                    <span aria-hidden>→</span>
                  </Button>
                  <Button to="/contact" variant="secondary" size="lg">
                    Talk to us
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
