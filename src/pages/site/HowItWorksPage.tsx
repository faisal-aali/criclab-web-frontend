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

/**
 * How it works.
 *
 * Four steps as the player and coach live them — upload, wait, read, act.
 * The page deliberately stays on their side of the screen: what to send,
 * how long it takes, what comes back, and what to do with it.
 */

const STEPS = [
  {
    n: '01',
    title: 'Upload',
    body: 'Drop in one clip of one delivery. Add the player’s height and bowling arm so the measurements come back in real units rather than pixels, and give the session a name you will recognise next month.',
    note: 'Phone footage is fine',
  },
  {
    n: '02',
    title: 'Analyze',
    body: 'Hand it over and get on with the net. Most clips are ready in the time it takes to walk back to your mark — you can close the tab and the finished delivery will be waiting in your session list.',
    note: 'Usually a few minutes',
  },
  {
    n: '03',
    title: 'Review',
    body: 'The delivery comes back marked up: key moments held and named, the ball’s path drawn over your own footage, and the numbers sitting beside the frame they were taken from.',
    note: 'Clip plus numbers',
  },
  {
    n: '04',
    title: 'Improve',
    body: 'Take the short list of what to work on into the next session, then film the same delivery again and put the two side by side to see what actually moved.',
    note: 'Kept for comparison',
  },
]

/* Ticker strip — the plain-language shape of a session. */
const FLOW_WORDS = [
  'Film one ball',
  'Trim to the delivery',
  'Height and bowling arm',
  'Upload',
  'Walk back to your mark',
  'Session ready',
  'Open the clip',
  'Show the player',
  'Film it again',
  'Put the two side by side',
]

/**
 * The wait, from the coach's side of the screen. Deliberately about what the
 * person is doing — walking back, putting the phone away, opening the clip —
 * rather than anything happening out of their sight.
 */
const WAITING = [
  {
    mark: 'Minute one',
    title: 'You hand the clip over',
    body: 'Pick the delivery, add the player’s height and bowling arm so the measurements land in real units, and give the session a name you will recognise next month.',
  },
  {
    mark: 'Straight after',
    title: 'You put the phone away',
    body: 'Nothing to sit and watch. Close the tab, mark out your run again, finish the over — the session is waiting for you either way.',
  },
  {
    mark: 'A few minutes',
    title: 'The session turns up ready',
    body: 'The delivery appears in your list marked ready. Step away for a coffee or a whole net and it is still sitting there when you come back to it.',
  },
  {
    mark: 'First look',
    title: 'You open the delivery',
    body: 'It plays back slowed, with the key moments held and named, the ball’s path drawn over your own footage, and the numbers beside the frame they came from.',
  },
  {
    mark: 'Same session',
    title: 'You turn the screen round',
    body: 'Show the player the frame rather than describe it. That is usually where the point actually lands — and where the next thing to work on gets agreed.',
  },
]

/* What the review screen scores, once the delivery has read cleanly. */
const SCORES = [
  { v: 86, l: 'Front-leg brace' },
  { v: 92, l: 'Kinematic sequence' },
  { v: 74, l: 'Arm speed' },
]

const REVIEW_GIVES = [
  {
    k: 'The marked-up clip',
    v: 'Slow motion with back-foot contact, front-foot contact, arm horizontal, release and follow-through held and labelled.',
  },
  {
    k: 'The ball’s path',
    v: 'Flight drawn from the hand to the pitch point, with the length measured off the stumps.',
  },
  {
    k: 'The numbers',
    v: 'Speed, release height, stride, timing splits and rotation — each with a note on how confident the measurement is.',
  },
  {
    k: 'The read',
    v: 'A short written summary of what the delivery showed and what to work on before the next one.',
  },
]

const FILMING = [
  {
    t: 'Stand square of the crease',
    d: 'Side-on to the bowler, roughly level with the popping crease. One camera, held still or propped on anything sturdy.',
  },
  {
    t: 'Keep the whole body in frame',
    d: 'From the last few strides of the run-up through to the end of the follow-through — head and feet both inside the frame.',
  },
  {
    t: 'One delivery per clip',
    d: 'Trim to a single ball. A whole over in one file makes it harder to line deliveries up against each other later.',
  },
  {
    t: 'Give it light',
    d: 'Daylight or floodlights, filming with the sun behind you. A dim indoor net will soften the release moment.',
  },
]

const FAQS = [
  {
    q: 'Which angle should I film from?',
    a: (
      <>
        Side-on, square of the crease, is the angle that supports the most
        measurements. Front-on clips still give you movement and the ball’s path,
        but stride and release height read best from the side. The{' '}
        <Link to="/record" className="font-semibold text-pitch dark:text-lime underline underline-offset-2">
          filming guide
        </Link>{' '}
        walks through it in a minute.
      </>
    ),
  },
  {
    q: 'Do I need a high-speed camera?',
    a: 'No. A recent phone at its normal setting is enough for the full report. If your phone shoots at 120 or 240 fps, use it — the release moment and the timing splits sharpen up — but it is an upgrade, not a requirement.',
  },
  {
    q: 'Can I upload a whole over or a full net session?',
    a: 'Upload one delivery at a time. A single ball, trimmed from the last strides of the run-up to the end of the follow-through, gives the cleanest read and keeps your session list easy to compare ball by ball.',
  },
  {
    q: 'Does it work for spinners as well as seamers?',
    a: 'Yes. The phases of the action are the same whether the ball is being seamed or spun, and the report names what is specific to the delivery you filmed. Pace, release height, stride and alignment all come back either way.',
  },
  {
    q: 'What about batting clips?',
    a: 'Batting is covered too. Film square of the wicket with the whole stance and stride in frame, and the shot comes back broken into trigger movement, backlift, stride, bat path and head position at contact.',
  },
  {
    q: 'What if a number looks wrong?',
    a: 'Every measurement carries a confidence note, and where the footage cannot support a figure CricLab says so rather than printing a convincing one. If a delivery comes back light on detail, it is almost always the framing — re-film against the guide and try it again.',
  },
]

export function HowItWorksPage() {
  return (
    <MarketingLayout title="How it works">
      {/* ===================== HERO ===================== */}
      <PageHero
        plate="pitch"
        eyebrow="How it works"
        title={
          <>
            Upload. Analyze. Review.{' '}
            <span className="text-gradient-lime">Improve.</span>
          </>
        }
        lead="Four steps between filming a delivery and knowing what to change about it. No rig to set up, no markers to stick on, nobody standing behind the camera with a clipboard."
      >
        <Reveal delay={120}>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button to="/app" size="lg">
              Start Analyzing
              <span aria-hidden>→</span>
            </Button>
            <Button to="/record" variant="secondary" size="lg">
              Read the filming guide
            </Button>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div className="flex flex-wrap gap-2 pt-4">
            <Chip tone="lime">One phone</Chip>
            <Chip>One delivery</Chip>
            <Chip>No markers</Chip>
          </div>
        </Reveal>
      </PageHero>

      {/* ===================== TICKER ===================== */}
      <Section tone="warm" className="border-b border-pitch/10 py-4">
        <Marquee
          items={FLOW_WORDS.map((t) => (
            <span
              key={t}
              className="whitespace-nowrap text-xs font-bold uppercase tracking-[0.2em] text-pitch/55 dark:text-lime/55"
            >
              {t}
            </span>
          ))}
        />
      </Section>

      {/* ===================== AT A GLANCE ===================== */}
      <Section tone="plain" className="border-b border-pitch/10 py-14">
        <Container>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <Reveal>
              <Stat value={4} label="Steps end to end" tone="light" />
            </Reveal>
            <Reveal delay={80}>
              <Stat value={1} label="Delivery per clip" tone="light" />
            </Reveal>
            <Reveal delay={160}>
              <Stat value={1} label="Camera needed" tone="light" />
            </Reveal>
            <Reveal delay={240}>
              <Stat value={0} label="Markers to wear" tone="light" />
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ===================== THE FOUR STEPS ===================== */}
      <Section tone="light" className="py-24 sm:py-32">
        <Container>
          <SectionHeading
            eyebrow="The flow"
            title={<WordReveal text="From the net to the notebook" />}
            lead="Every session follows the same four steps, whether it is one ball after training or a squad’s worth of deliveries on a Sunday."
          />

          <div className="relative mt-16">
            {/* Connector: horizontal across the row on desktop, vertical beside
                the cards on mobile — so the four steps read as one run. */}
            <div
              className="pointer-events-none absolute inset-x-8 top-[3.4rem] hidden h-px bg-gradient-to-r from-transparent via-pitch/25 to-transparent lg:block"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute bottom-8 left-[2.15rem] top-8 w-px bg-gradient-to-b from-transparent via-pitch/20 to-transparent sm:hidden"
              aria-hidden
            />

            <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s, i) => (
                <Reveal key={s.n} delay={i * 110}>
                  <TiltCard className="h-full" max={6}>
                    <Card
                      tone="light"
                      className="ring-glow flex h-full flex-col gap-4 p-6 sm:p-7"
                    >
                      <div className="flex items-center gap-4">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-pitch font-display text-lg font-extrabold text-lime shadow-lg shadow-pitch/25">
                          {s.n}
                        </span>
                        <span className="h-px flex-1 bg-gradient-to-r from-pitch/25 to-transparent" />
                      </div>
                      <h3 className="font-display text-xl font-bold text-ink dark:text-chalk">{s.title}</h3>
                      <p className="text-sm leading-relaxed text-ink/65 dark:text-chalk/65">{s.body}</p>
                      <span className="mt-auto pt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-pitch/70 dark:text-lime/70">
                        {s.note}
                      </span>
                    </Card>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={220} className="mt-12 text-center">
            <p className="text-sm text-ink/55 dark:text-chalk/55">
              Step one takes about a minute.{' '}
              <Link
                to="/features"
                className="font-semibold text-pitch dark:text-lime underline underline-offset-2"
              >
                See everything step three covers →
              </Link>
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* ============ THE WAIT, FROM YOUR SIDE OF THE SCREEN ============ */}
      <Section tone="mid" className="py-24 sm:py-32">
        <Backdrop plate="turf" scrim="dark" parallax={0.09} />
        <div
          className="pointer-events-none absolute -right-28 top-16 h-[24rem] w-[24rem] animate-drift rounded-full bg-pitch-soft/25 blur-[130px]"
          aria-hidden
        />
        <Container className="relative">
          <SectionHeading
            tone="dark"
            align="left"
            eyebrow="Step two, in real time"
            title="What the wait actually looks like"
            lead="Between pressing upload and reading the delivery back, there is very little for you to do. Here is the whole of it, in the order you live it."
          />

          <div className="relative mt-14">
            {/* Rail: the run of the session, drawn once down the left. */}
            <div
              className="pointer-events-none absolute bottom-6 left-[1.4rem] top-6 w-px bg-gradient-to-b from-transparent via-lime/25 to-transparent sm:left-[1.65rem]"
              aria-hidden
            />

            <div className="flex flex-col gap-4">
              {WAITING.map((w, i) => (
                <Reveal key={w.title} delay={i * 90}>
                  <div className="flex items-start gap-4 sm:gap-6">
                    <span className="relative z-10 mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-lime/25 bg-night font-display text-sm font-extrabold text-lime sm:h-[3.3rem] sm:w-[3.3rem] sm:text-base">
                      {i + 1}
                    </span>
                    <TiltCard className="min-w-0 flex-1" max={4}>
                      <Card className="ring-glow flex flex-col gap-2.5 p-5 sm:p-6">
                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-lime/70">
                          {w.mark}
                        </span>
                        <h3 className="font-display text-lg font-bold text-chalk sm:text-xl">
                          {w.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-chalk/60">{w.body}</p>
                      </Card>
                    </TiltCard>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={200} className="mt-10">
            <p className="text-sm leading-relaxed text-chalk/50">
              Nothing here needs you to sit and watch it. Most coaches upload at the
              top of the mark and read the delivery back at the end of the spell.
            </p>
          </Reveal>
        </Container>
      </Section>

      <SectionSeam />

      {/* ===================== THE REVIEW SCREEN ===================== */}
      <Section tone="dark" className="pb-32 pt-24 sm:pb-40 sm:pt-32">
        <Backdrop plate="bokeh" scrim="dark" parallax={0.07} />
        <Container className="relative">
          <SectionHeading
            tone="dark"
            align="left"
            eyebrow="Step three, up close"
            title="What the review screen gives you"
            lead="This is where the session actually happens: the clip, the path, the numbers and the read, on one screen you can turn round and show the player."
          />

          <div className="mt-14 grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <Reveal>
              <div className="relative">
                <div
                  className="absolute -inset-4 animate-glow-breathe rounded-[2rem] bg-lime/10 blur-3xl"
                  aria-hidden
                />
                <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-white/10 bg-night shadow-2xl">
                  <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-bad/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-warn/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-ok/70" />
                    <span className="truncate pl-2 text-xs font-semibold text-chalk/45">
                      session-14 · delivery-03.mp4
                    </span>
                  </div>

                  <PhotoFrame
                    src="/hero-bowling.jpg"
                    alt="Review screen showing a delivery with the release moment marked"
                    className="aspect-video rounded-none"
                  >
                    <div className="flex h-full flex-col justify-between p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                          <Chip tone="lime">Release</Chip>
                          <Chip tone="ok">High confidence</Chip>
                        </div>
                        <div className="rounded-lg border border-white/15 bg-night/70 px-3 py-1.5 text-right backdrop-blur">
                          <div className="font-display text-lg font-extrabold text-chalk">
                            <CountUp to={84.1} decimals={1} />
                          </div>
                          <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-chalk/45">
                            km/h
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex flex-wrap gap-1.5 pb-2">
                          {['BFC', 'FFC', 'MER', 'REL', 'FT'].map((p, i) => (
                            <span
                              key={p}
                              className={`rounded px-2 py-1 text-[9px] font-bold tracking-wide ${
                                i === 3 ? 'bg-lime text-night' : 'bg-white/10 text-chalk/60'
                              }`}
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-full bg-white/15">
                          <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-pitch-soft to-lime" />
                        </div>
                      </div>
                    </div>
                  </PhotoFrame>

                  {/* Readout strip below the frame */}
                  <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10">
                    <div className="p-3 sm:p-4">
                      <div className="h-20">
                        <BowlerSkeleton />
                      </div>
                      <div className="pt-2 text-center text-[9px] font-bold uppercase tracking-[0.14em] text-chalk/40">
                        Keypoints
                      </div>
                    </div>
                    <div className="p-3 sm:p-4">
                      <div className="h-20">
                        <TrajectoryArc />
                      </div>
                      <div className="pt-2 text-center text-[9px] font-bold uppercase tracking-[0.14em] text-chalk/40">
                        Ball path
                      </div>
                    </div>
                    <div className="p-3 sm:p-4">
                      <div className="h-20">
                        <MetricBars bars={[46, 70, 58, 92, 77]} />
                      </div>
                      <div className="pt-2 text-center text-[9px] font-bold uppercase tracking-[0.14em] text-chalk/40">
                        Phase timing
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            <div className="grid gap-4">
              {REVIEW_GIVES.map((r, i) => (
                <Reveal key={r.k} delay={i * 90}>
                  <Card className="ring-glow flex gap-4 p-5 sm:p-6">
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-lime/25 bg-lime/10 text-[11px] font-bold text-lime">
                      {i + 1}
                    </span>
                    <div className="flex flex-col gap-1.5">
                      <h3 className="font-display text-base font-bold text-chalk sm:text-lg">
                        {r.k}
                      </h3>
                      <p className="text-sm leading-relaxed text-chalk/60">{r.v}</p>
                    </div>
                  </Card>
                </Reveal>
              ))}

              <Reveal delay={380}>
                <Link
                  to="/features"
                  className="inline-block text-sm font-semibold text-lime transition hover:text-chalk"
                >
                  All nine analysis features →
                </Link>
              </Reveal>
            </div>
          </div>

          {/* The scored read, on the same screen as the clip. */}
          <Reveal delay={140} className="mt-14">
            <div className="rounded-[var(--radius-card)] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <div className="flex flex-col gap-2 pb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-lime/70">
                    And the delivery, scored
                  </span>
                  <h3 className="font-display text-xl font-bold text-chalk sm:text-2xl">
                    A read you can act on before the next over
                  </h3>
                </div>
                <p className="max-w-md text-sm leading-relaxed text-chalk/55">
                  Each area is scored off what the clip actually carried, and left
                  blank when it could not support one.
                </p>
              </div>
              <div className="flex flex-wrap items-start justify-center gap-8 sm:gap-14">
                {SCORES.map((s, i) => (
                  <Reveal key={s.l} delay={i * 100}>
                    <ProgressRing value={s.v} size={108} stroke={8} label={s.l} sub="score" />
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        </Container>

        <PitchFloor />
      </Section>

      {/* ===================== WHAT TO FILM ===================== */}
      <Section tone="pitch" className="py-24 sm:py-32">
        <Backdrop plate="nets" scrim="dark-soft" parallax={0.12} />
        <div className="pointer-events-none absolute inset-0 bg-grid-tech opacity-40" aria-hidden />
        <div
          className="pointer-events-none absolute -left-24 top-10 h-[22rem] w-[22rem] animate-glow-breathe rounded-full bg-lime/10 blur-[130px]"
          aria-hidden
        />
        <Container className="relative">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <Reveal>
              <div className="flex flex-col items-start gap-5">
                <Eyebrow>Before you upload</Eyebrow>
                <h2 className="font-display text-3xl font-extrabold leading-[1.1] text-chalk sm:text-4xl">
                  What you need to film
                </h2>
                <p className="text-base leading-relaxed text-chalk/65">
                  Four things decide whether a clip reads cleanly. Get them right
                  once and every delivery you film afterwards will come back with
                  the full set of numbers.
                </p>
                <Button to="/record" size="lg" className="mt-1">
                  Open the filming guide
                  <span aria-hidden>→</span>
                </Button>
                <div className="hidden animate-bob pt-4 lg:block">
                  <SeamBall size={72} />
                </div>
              </div>
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2">
              {FILMING.map((f, i) => (
                <Reveal key={f.t} delay={i * 90}>
                  <TiltCard className="h-full" max={6}>
                    <Card className="ring-glow flex h-full flex-col gap-3 p-6">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-lime text-sm font-extrabold text-night">
                        {i + 1}
                      </span>
                      <h3 className="font-display text-lg font-bold text-chalk">{f.t}</h3>
                      <p className="text-sm leading-relaxed text-chalk/60">{f.d}</p>
                    </Card>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* ===================== FAQ ===================== */}
      <Section tone="light" className="py-24 sm:py-32">
        <Container size="narrow">
          <SectionHeading
            eyebrow="Questions"
            title="Asked in the nets"
            lead="The things coaches and players want settled before they film the first delivery."
          />

          <div className="mt-14">
            <Accordion items={FAQS} />
          </div>

          <Reveal delay={200} className="mt-10 text-center">
            <Link to="/faq" className="text-sm font-semibold text-pitch dark:text-lime hover:text-ink dark:hover:text-chalk">
              Read the full FAQ →
            </Link>
          </Reveal>
        </Container>
      </Section>

      {/* ===================== CTA ===================== */}
      <Section tone="plain" className="py-20 sm:py-28">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] bg-stadium px-6 py-16 text-center text-chalk sm:px-14">
              <Backdrop plate="stadium" scrim="dark" parallax={0.05} />
              <StadiumAtmosphere />
              <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
                <span className="inline-block animate-bob">
                  <SeamBall size={60} />
                </span>
                <h2 className="font-display text-3xl font-extrabold leading-tight sm:text-[2.6rem]">
                  Step one is a{' '}
                  <span className="text-gradient-lime">single clip</span>
                </h2>
                <p className="text-base leading-relaxed text-chalk/65">
                  Film one delivery at the next net session and run it through. By
                  the time you have walked back to your mark, you will know what the
                  action is doing.
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
