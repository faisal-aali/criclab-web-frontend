import { Link } from 'react-router-dom'
import { MarketingLayout, PageHero } from '../../components/site/MarketingLayout'
import {
  Button,
  Card,
  Chip,
  Container,
  CountUp,
  Eyebrow,
  Reveal,
  Section,
  SectionHeading,
  Stat,
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
 * Features.
 *
 * The nine capabilities are grouped into the three things a coach actually
 * does with a clip — watch it, measure it, act on it — rather than dropped
 * into one flat grid where every card carries the same weight.
 */

type Feature = {
  tag: string
  title: string
  body: string
  icon: string
}

/* Group one — what CricLab watches on the footage you filmed. */
const WATCH: Feature[] = [
  {
    tag: 'Footage',
    title: 'Cricket video analysis',
    body: 'Send up one delivery or one shot and get it back read frame by frame, broken into the phases a coach would pause on rather than a single blur of movement.',
    icon: 'M3 6h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm14 4 5-3v10l-5-3',
  },
  {
    tag: 'Movement',
    title: 'Player movement analysis',
    body: 'Wrists, elbows, shoulders, hips, knees and ankles followed through every frame, so stride, trunk lean and alignment are measured rather than eyeballed from the boundary.',
    icon: 'M12 3.4a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4M12 8v6m-4.5-4L12 12l4.5-2.6M10.5 14 8 21m4-7 3 7',
  },
  {
    tag: 'Tracking',
    title: 'Ball tracking',
    body: 'The ball is followed out of the hand, through its flight and onto the pitch point, with the whole path drawn over your own footage so you can see length as well as read it.',
    icon: 'M2 18C6 6.5 13.5 3 22 6M6.6 14.4a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2m8.4-6.2a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2',
  },
]

/* Group two — what comes back as measurement. */
const MEASURE: Feature[] = [
  {
    tag: 'Bowling',
    title: 'Bowling analysis',
    body: 'The delivery split at back-foot contact, front-foot contact, arm horizontal, release and follow-through — every phase timed, marked on the clip and named the way it is named in the nets.',
    icon: 'M12 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4M6 21v-5l3.5-4L11 6m-1.5 6 5 3 4.5-1',
  },
  {
    tag: 'Batting',
    title: 'Batting analysis',
    body: 'Trigger movement, backlift, front-foot stride, bat path through the line and head position at contact — the shot laid out from first movement to the finish of the swing.',
    icon: 'm4 20 3-3m0 0 8.5-9.7a2.4 2.4 0 1 1 3.4 3.4L9.2 19.2 7 17Z',
  },
  {
    tag: 'Consistency',
    title: 'Action analysis',
    body: 'One delivery set beside the ones before it, so you can see where the action repeats and where it drifts — the difference between a bad ball and a change in the action itself.',
    icon: 'M4 9h12a4 4 0 0 1 0 8H9m11-13-4 4 4 4M9 17l3 3m-3-3 3-3',
  },
  {
    tag: 'Metrics',
    title: 'Performance metrics',
    body: 'Ball speed, release height, stride length, arm speed, trunk rotation and the timing splits between phases — each reported with a note on how confident the measurement is.',
    icon: 'M4 20V10m5 10V4m5 16v-7m5 7V8',
  },
]

/* Group three — what you take into the next session. */
const ACT: Feature[] = [
  {
    tag: 'Coaching',
    title: 'Training insights',
    body: 'The findings turned into what to work on next over, next net, next week — with drills matched to what the footage actually showed rather than a generic plan.',
    icon: 'M12 3a6 6 0 0 0-3.5 10.9V17h7v-3.1A6 6 0 0 0 12 3Zm-2.5 17h5',
  },
  {
    tag: 'Review',
    title: 'Video-based performance review',
    body: 'A shareable slow-motion clip with the key moments held, labelled and marked up, and the numbers on the panel beside the frame they belong to.',
    icon: 'M3 5h18v11H3Zm5 15h8m-4-4v4M9.5 8.2v5l4.5-2.5Z',
  },
]

const SEEN_ON_SCREEN = [
  'Ball path drawn over your footage',
  'Phase markers on the timeline',
  'Keypoint overlay on the body',
  'Metric panel tied to the frame',
  'Confidence note on every number',
  'Session-to-session comparison',
]

const COMPARISON = [
  {
    eye: 'It looked like he fell away a bit.',
    lab: 'Trunk lean at release: 14° away from the target line, up from 9° last session.',
  },
  {
    eye: 'That one came out quicker.',
    lab: 'Ball speed 84.1 km/h against a 79.6 km/h average across the over.',
  },
  {
    eye: 'His front foot is landing late.',
    lab: 'Front-foot contact to release: 125 ms, the longest of the six deliveries filmed.',
  },
  {
    eye: 'He is short of a length again.',
    lab: 'Pitch point 6.9 m from the stumps, a metre back on the two before it.',
  },
]

export function FeaturesPage() {
  return (
    <MarketingLayout title="Features">
      {/* ===================== HERO ===================== */}
      <PageHero
        eyebrow="Features"
        title={
          <>
            Everything the eye misses,{' '}
            <span className="text-gradient-lime">written down</span>
          </>
        }
        lead="One clip from a phone comes back as a marked-up delivery, a set of measured numbers and a clear read on what to change. No rig, no markers, no specialist standing behind the camera."
      >
        <Reveal delay={120}>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button to="/app" size="lg">
              Start Analyzing
              <span aria-hidden>→</span>
            </Button>
            <Button to="/how-it-works" variant="secondary" size="lg">
              See how it works
            </Button>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div className="flex flex-wrap gap-2 pt-4">
            <Chip tone="lime">Bowling</Chip>
            <Chip tone="lime">Batting</Chip>
            <Chip>Ball flight</Chip>
            <Chip>Movement</Chip>
            <Chip>Session history</Chip>
          </div>
        </Reveal>
      </PageHero>

      {/* ===================== AT A GLANCE ===================== */}
      <Section tone="plain" className="border-y border-pitch/10 py-14">
        <Container>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <Reveal>
              <Stat value={9} label="Analysis features" tone="light" />
            </Reveal>
            <Reveal delay={80}>
              <Stat value={33} suffix="+" label="Landmarks tracked" tone="light" />
            </Reveal>
            <Reveal delay={160}>
              <Stat value={5} label="Delivery phases" tone="light" />
            </Reveal>
            <Reveal delay={240}>
              <Stat value={1} label="Camera needed" tone="light" />
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ===================== GROUP 1 — WATCH ===================== */}
      <Section tone="light" className="py-24 sm:py-32">
        <Container>
          <SectionHeading
            align="left"
            eyebrow="On the footage"
            title="What CricLab watches"
            lead="Before a single number is printed, the clip is read: the player, the ball and the ground they move against."
          />

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WATCH.map((f, i) => (
              <Reveal key={f.title} delay={i * 80}>
                <Card tone="light" className="flex h-full flex-col gap-4 p-6 sm:p-7">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-pitch text-lime">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                      <path
                        d={f.icon}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-pitch/60">
                      {f.tag}
                    </span>
                    <h3 className="font-display text-xl font-bold text-ink">{f.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-ink/65">{f.body}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ===================== GROUP 2 — MEASURE ===================== */}
      <Section tone="dark" className="py-24 sm:py-32">
        <Container>
          <SectionHeading
            tone="dark"
            align="left"
            eyebrow="In the numbers"
            title="What CricLab measures"
            lead="Cricket phases, cricket units, cricket language. Every figure is tied to the frame it came from, so it can be checked rather than taken on trust."
          />

          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {MEASURE.map((f, i) => (
              <Reveal key={f.title} delay={i * 80}>
                <Card className="flex h-full flex-col gap-4 p-6 sm:p-7">
                  <div className="flex items-center justify-between gap-4">
                    <span className="grid h-11 w-11 place-items-center rounded-xl border border-lime/25 bg-lime/10 text-lime">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                        <path
                          d={f.icon}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <Chip tone="lime">{f.tag}</Chip>
                  </div>
                  <h3 className="font-display text-xl font-bold text-chalk">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-chalk/60">{f.body}</p>
                </Card>
              </Reveal>
            ))}
          </div>

          <Reveal delay={160} className="mt-10">
            <div className="flex flex-col items-start gap-4 rounded-[var(--radius-card)] border border-white/10 bg-white/[0.03] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
              <p className="max-w-xl text-sm leading-relaxed text-chalk/65">
                Seam or spin, right arm or left, front foot or back — the phases are
                the same and the report names what is specific to the delivery you
                filmed.
              </p>
              <Button to="/how-it-works" variant="secondary" className="shrink-0">
                See the four steps
              </Button>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ============= SHOWCASE — BALL TRACKING (visual right) ============= */}
      <Section tone="light" className="py-24 sm:py-32">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <div className="flex flex-col items-start gap-5">
                <Eyebrow tone="light">Ball tracking</Eyebrow>
                <h2 className="font-display text-3xl font-extrabold leading-[1.1] text-ink sm:text-4xl">
                  Follow the ball from the hand to the pitch point
                </h2>
                <p className="text-base leading-relaxed text-ink/65">
                  The flight is drawn over the delivery you filmed, with the sample
                  points kept visible and the bounce marked. Length stops being a
                  feeling and becomes a distance from the stumps you can quote back
                  to the bowler.
                </p>
                <ul className="flex flex-col gap-3 pt-1">
                  {[
                    'Release point and pitch point marked',
                    'Speed reported through the flight',
                    'Length measured from the stumps',
                    'Every over kept for comparison',
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-3 text-sm font-medium text-ink/75">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-pitch text-[11px] font-bold text-lime">
                        ✓
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
                <Button to="/app" variant="light" className="mt-2">
                  Upload a delivery
                </Button>
              </div>
            </Reveal>

            <Reveal delay={140}>
              <div className="relative">
                <div className="absolute -inset-4 rounded-[2rem] bg-pitch/10 blur-2xl" aria-hidden />
                <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-pitch/10 bg-night p-5 shadow-2xl shadow-pitch/20 sm:p-6">
                  <div className="flex items-center justify-between pb-4">
                    <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-chalk/45">
                      <span className="h-2 w-2 animate-pulse-bar rounded-full bg-lime" />
                      Flight path
                    </span>
                    <Chip tone="lime">Over 4 · Ball 3</Chip>
                  </div>
                  <div className="h-52 sm:h-60">
                    <TrajectoryArc />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[
                      { k: 'Speed', v: 84.1, u: 'km/h', d: 1 },
                      { k: 'Length', v: 6.9, u: 'm', d: 1 },
                      { k: 'Release', v: 1.87, u: 'm', d: 2 },
                    ].map((m) => (
                      <div
                        key={m.k}
                        className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
                      >
                        <div className="font-display text-lg font-extrabold text-chalk sm:text-xl">
                          <CountUp to={m.v} decimals={m.d} />
                          <span className="pl-1 text-[10px] font-bold text-seam">{m.u}</span>
                        </div>
                        <div className="pt-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-chalk/40">
                          {m.k}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ========== SHOWCASE — MOVEMENT (visual left on desktop) ========== */}
      <Section tone="pitch" className="py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0 bg-grid-tech opacity-40" aria-hidden />
        <Container className="relative">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal className="lg:order-2">
              <div className="flex flex-col items-start gap-5">
                <Eyebrow>Movement &amp; action</Eyebrow>
                <h2 className="font-display text-3xl font-extrabold leading-[1.1] text-chalk sm:text-4xl">
                  The body mapped through the delivery stride
                </h2>
                <p className="text-base leading-relaxed text-chalk/65">
                  Every joint that matters to the action is held from the final
                  stride to the end of the follow-through. Alignment, stride length
                  and the angle of the trunk at release come back as measurements a
                  coach can set a target against.
                </p>
                <div className="grid w-full gap-3 pt-1 sm:grid-cols-2">
                  {[
                    { k: 'Front-foot alignment', v: 'Open 11°' },
                    { k: 'Stride length', v: '1.62 m' },
                    { k: 'Trunk lean at release', v: '14°' },
                    { k: 'FFC → release', v: '125 ms' },
                  ].map((m) => (
                    <div
                      key={m.k}
                      className="rounded-xl border border-white/12 bg-white/[0.05] px-4 py-3"
                    >
                      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-chalk/45">
                        {m.k}
                      </div>
                      <div className="pt-1 font-display text-lg font-extrabold text-lime">
                        {m.v}
                      </div>
                    </div>
                  ))}
                </div>
                <Button to="/record" variant="secondary" className="mt-2">
                  How to film it
                </Button>
              </div>
            </Reveal>

            <Reveal delay={140} className="lg:order-1">
              <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-white/10 bg-night/60 p-6 sm:p-8">
                <div className="grid items-center gap-6 sm:grid-cols-[1fr_1fr]">
                  <div className="h-60 sm:h-72">
                    <BowlerSkeleton />
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-chalk/45">
                      Phase timing
                    </div>
                    <div className="h-32">
                      <MetricBars bars={[42, 68, 55, 88, 74, 96]} />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
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
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ===================== WHAT YOU SEE ===================== */}
      <Section tone="plain" className="py-24 sm:py-32">
        <Container>
          <SectionHeading
            eyebrow="What you see"
            title="From “that looked off” to a number you can coach"
            lead="The same delivery, described two ways. One of them survives the drive home."
          />

          <div className="mt-14 grid gap-4">
            <Reveal>
              <div className="hidden gap-4 px-2 text-[11px] font-bold uppercase tracking-[0.16em] sm:grid sm:grid-cols-2">
                <span className="text-ink/40">By eye, from the boundary</span>
                <span className="text-pitch">With CricLab</span>
              </div>
            </Reveal>

            {COMPARISON.map((row, i) => (
              <Reveal key={row.lab} delay={i * 70}>
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  <div className="rounded-2xl border border-pitch/10 bg-mist/60 px-5 py-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/40 sm:hidden">
                      By eye
                    </span>
                    <p className="pt-1 text-sm leading-relaxed text-ink/55 sm:pt-0">
                      “{row.eye}”
                    </p>
                  </div>
                  <div className="rounded-2xl border border-pitch/20 bg-white px-5 py-4 shadow-lg shadow-pitch/5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-pitch sm:hidden">
                      With CricLab
                    </span>
                    <p className="pt-1 text-sm font-medium leading-relaxed text-ink/80 sm:pt-0">
                      {row.lab}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200} className="mt-12">
            <div className="flex flex-wrap justify-center gap-2">
              {SEEN_ON_SCREEN.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-2 rounded-full border border-pitch/15 bg-pitch/5 px-3.5 py-1.5 text-xs font-semibold text-pitch"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {s}
                </span>
              ))}
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ===================== GROUP 3 — ACT ===================== */}
      <Section tone="dark" className="pb-32 pt-24 sm:pb-40 sm:pt-32">
        <Container>
          <SectionHeading
            tone="dark"
            align="left"
            eyebrow="Into the next session"
            title="What you take away"
            lead="A report nobody opens is a report nobody uses. Everything lands as a clip you can play to the player and a short list of what to work on."
          />

          <div className="mt-14 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="grid gap-5">
              {ACT.map((f, i) => (
                <Reveal key={f.title} delay={i * 90}>
                  <Card className="flex h-full flex-col gap-4 p-6 sm:p-7">
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-lime/25 bg-lime/10 text-lime">
                        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                          <path
                            d={f.icon}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-lime/70">
                          {f.tag}
                        </span>
                        <h3 className="font-display text-xl font-bold text-chalk">{f.title}</h3>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-chalk/60">{f.body}</p>
                  </Card>
                </Reveal>
              ))}

              <Reveal delay={200}>
                <Link
                  to="/resources"
                  className="inline-block text-sm font-semibold text-lime transition hover:text-chalk"
                >
                  Browse drills and filming resources →
                </Link>
              </Reveal>
            </div>

            <Reveal delay={160}>
              <div className="relative">
                <div className="absolute -inset-4 rounded-[2rem] bg-lime/10 blur-3xl" aria-hidden />
                <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-white/10 bg-night shadow-2xl">
                  <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-bad/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-warn/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-ok/70" />
                    <span className="pl-2 truncate text-xs font-semibold text-chalk/45">
                      delivery-review.mp4
                    </span>
                  </div>
                  <PhotoFrame
                    src="/hero-bowling.jpg"
                    alt="Bowling delivery under review with the release moment marked"
                    className="aspect-video rounded-none"
                  >
                    <div className="flex h-full flex-col justify-between p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <Chip tone="lime">Release</Chip>
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
                </div>
              </div>
            </Reveal>
          </div>
        </Container>

        <PitchFloor />
      </Section>

      {/* ===================== CTA ===================== */}
      <Section tone="light" className="py-20 sm:py-28">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] bg-stadium px-6 py-16 text-center text-chalk sm:px-14">
              <StadiumAtmosphere />
              <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
                <SeamBall size={64} className="animate-float-slow" />
                <h2 className="font-display text-3xl font-extrabold leading-tight sm:text-[2.6rem]">
                  Put one delivery through the{' '}
                  <span className="text-gradient-lime">whole lab</span>
                </h2>
                <p className="text-base leading-relaxed text-chalk/65">
                  Every feature on this page runs off the same clip. Film a ball at
                  the next net session and see the lot come back.
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
