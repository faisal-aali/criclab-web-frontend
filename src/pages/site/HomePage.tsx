import { Link } from 'react-router-dom'
import { MarketingLayout } from '../../components/site/MarketingLayout'
import {
  Button,
  Card,
  Chip,
  Container,
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

const FEATURES = [
  {
    tag: 'Bowling',
    title: 'Action analysis',
    body: 'Release, front-foot contact, arm path and follow-through — the delivery broken into the moments coaches actually talk about.',
    to: '/features',
  },
  {
    tag: 'Tracking',
    title: 'Ball flight tracking',
    body: 'The ball is followed from the hand through its flight, with the path drawn over your own footage.',
    to: '/features',
  },
  {
    tag: 'Movement',
    title: 'Body & keypoint mapping',
    body: 'Wrists, elbows, hips, trunk and feet mapped through every frame, so movement is measured rather than eyeballed.',
    to: '/features',
  },
  {
    tag: 'Metrics',
    title: 'Performance metrics',
    body: 'Speed, release height, stride, timing splits and rotation — each reported with how confident the measurement is.',
    to: '/features',
  },
  {
    tag: 'Review',
    title: 'Slow-motion review clip',
    body: 'A shareable clip with the key moments held, marked up and labelled — built for the session, not the lab.',
    to: '/features',
  },
  {
    tag: 'Coaching',
    title: 'Training insight',
    body: 'Findings turned into what to work on next, with drills matched to what the footage showed.',
    to: '/features',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Record',
    body: 'Film one delivery on a phone. Side-on, whole body in frame. Our filming guide takes a minute to read.',
    to: '/record',
    cta: 'Filming guide',
  },
  {
    n: '02',
    title: 'Upload',
    body: 'Add the player’s height and bowling arm so measurements come back in real units, then upload the clip.',
    to: '/app',
    cta: 'Open CricLab',
  },
  {
    n: '03',
    title: 'Review',
    body: 'Get the marked-up slow-motion clip, the measured numbers, and a written read on the delivery.',
    to: '/how-it-works',
    cta: 'See the flow',
  },
  {
    n: '04',
    title: 'Improve',
    body: 'Work the matched drills, film again, and put the two side by side to see what actually moved.',
    to: '/features',
    cta: 'Explore features',
  },
]

const BENEFITS = [
  {
    title: 'Built for cricket, not adapted to it',
    body: 'Cricket names, cricket phases, cricket geometry. Back-foot contact, front-foot contact, arm horizontal, release, follow-through — not a generic motion template with the labels changed.',
  },
  {
    title: 'Honest about what it can see',
    body: 'Every number carries a confidence and a note. When the camera angle or the footage cannot support a measurement, CricLab says so instead of printing a convincing figure.',
  },
  {
    title: 'A phone is enough',
    body: 'No markers, no suits, no rig. One clear video of one delivery, filmed on whatever is in your pocket, is the whole input.',
  },
  {
    title: 'Progress you can prove',
    body: 'Sessions are kept, so a change in action is a comparison against last month rather than a memory of how it felt.',
  },
]

const TESTIMONIALS = [
  {
    quote:
      'The slow-motion clip with the moments marked is what finally made the front-foot issue land with the player. He could see it, not just be told it.',
    name: 'Head Coach',
    role: 'District Academy',
  },
  {
    quote:
      'What I value is that it refuses to guess. If the angle is wrong it tells me, and I re-film. That is the opposite of most tools I have tried.',
    name: 'Performance Analyst',
    role: 'State Programme',
  },
  {
    quote:
      'I film after each session. Being able to line up the last four deliveries and see the release time come down has kept me honest.',
    name: 'Seam Bowler',
    role: 'Club First XI',
  },
]

export function HomePage() {
  return (
    <MarketingLayout>
      {/* ===================== HERO ===================== */}
      <section className="relative isolate min-h-[92vh] overflow-hidden bg-stadium pt-32 text-chalk">
        <StadiumAtmosphere />
        <PhotoFrame
          src="/hero-bowling.jpg"
          alt=""
          overlay={false}
          position="absolute"
          className="pointer-events-none inset-0 rounded-none opacity-[0.35] mix-blend-luminosity"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-night/70 via-night/60 to-night"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 bg-crease-lines opacity-40" aria-hidden />

        <Container size="wide" className="relative z-10 grid items-center gap-14 pb-24 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="flex flex-col items-start gap-7">
            <Reveal>
              <Eyebrow>The Cricket Performance Lab</Eyebrow>
            </Reveal>

            <Reveal delay={90}>
              <h1 className="font-display text-[2.6rem] font-extrabold leading-[1.02] sm:text-6xl lg:text-[4.3rem]">
                Every delivery,
                <br />
                <span className="text-gradient-lime">measured.</span>
              </h1>
            </Reveal>

            <Reveal delay={170}>
              <p className="max-w-xl text-base leading-relaxed text-chalk/70 sm:text-lg">
                Film one ball on your phone. CricLab returns the marked-up
                slow-motion clip, the numbers behind the action, and a clear read on
                what to work on — the kind of feedback that used to need a lab.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="flex flex-wrap items-center gap-3">
                <Button to="/app" size="lg">
                  Start Analyzing
                  <span aria-hidden>→</span>
                </Button>
                <Button to="/how-it-works" variant="secondary" size="lg">
                  See how it works
                </Button>
              </div>
            </Reveal>

            <Reveal delay={310}>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2 text-xs font-semibold uppercase tracking-[0.14em] text-chalk/45">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-lime" /> Phone footage
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-lime" /> No markers
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-lime" /> Results in minutes
                </span>
              </div>
            </Reveal>
          </div>

          {/* Hero visual: a live-looking readout panel */}
          <Reveal delay={200} className="relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="absolute -inset-6 rounded-[2rem] bg-lime/10 blur-3xl" aria-hidden />
              <Card className="relative p-5" interactive={false}>
                <div className="flex items-center justify-between pb-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-chalk/45">
                    <span className="h-2 w-2 animate-pulse-bar rounded-full bg-lime" />
                    Delivery analysed
                  </div>
                  <Chip tone="lime">Side-on</Chip>
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/10 bg-night/60">
                  <div className="grid grid-cols-[1.1fr_1fr]">
                    <div className="border-r border-white/10 p-4">
                      <div className="h-40">
                        <BowlerSkeleton />
                      </div>
                      <div className="pt-2 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-chalk/40">
                        Keypoint map
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="h-40">
                        <TrajectoryArc />
                      </div>
                      <div className="pt-2 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-chalk/40">
                        Ball flight
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-4">
                  {[
                    { k: 'Ball speed', v: '84.1', u: 'km/h' },
                    { k: 'Release', v: '1.87', u: 'm' },
                    { k: 'FFC → release', v: '125', u: 'ms' },
                  ].map((m) => (
                    <div
                      key={m.k}
                      className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
                    >
                      <div className="font-display text-xl font-extrabold text-chalk">
                        {m.v}
                        <span className="pl-1 text-[10px] font-bold text-seam">{m.u}</span>
                      </div>
                      <div className="pt-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-chalk/40">
                        {m.k}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Parked in the empty space below-right of the panel: at
                  -left-12/top-6 it sat on the panel header, and at -bottom-8
                  it covered the metric tiles. */}
              <div className="pointer-events-none absolute -bottom-12 -right-10 hidden animate-float-slow xl:block">
                <SeamBall size={80} />
              </div>
            </div>
          </Reveal>
        </Container>

        <PitchFloor />
      </section>

      {/* ===================== STATS ===================== */}
      <Section tone="plain" className="border-y border-pitch/10 py-14">
        <Container>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <Reveal>
              <Stat value={33} suffix="+" label="Landmarks tracked" tone="light" />
            </Reveal>
            <Reveal delay={80}>
              <Stat value={5} label="Delivery phases" tone="light" />
            </Reveal>
            <Reveal delay={160}>
              <Stat value={240} suffix=" fps" label="High-speed ready" tone="light" />
            </Reveal>
            <Reveal delay={240}>
              <Stat value={1} label="Camera needed" tone="light" />
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ===================== FEATURES ===================== */}
      <Section tone="dark" className="py-24 sm:py-32">
        <Container>
          <SectionHeading
            tone="dark"
            eyebrow="What you get"
            title={
              <>
                A full read on the delivery,
                <br className="hidden sm:block" /> not a single number
              </>
            }
            lead="CricLab breaks the action into the phases coaches work in, measures what happens in each, and shows its working over your own footage."
          />

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 70}>
                <Link to={f.to} className="group block h-full">
                  <Card className="flex h-full flex-col gap-3.5 p-6">
                    <Chip tone="lime">{f.tag}</Chip>
                    <h3 className="font-display text-xl font-bold text-chalk">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-chalk/60">{f.body}</p>
                    <span className="mt-auto pt-2 text-sm font-semibold text-lime opacity-0 transition group-hover:opacity-100">
                      Learn more →
                    </span>
                  </Card>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ===================== SHOWCASE ===================== */}
      <Section tone="light" className="py-24 sm:py-32">
        <Container>
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <Reveal>
              <div className="flex flex-col items-start gap-5">
                <Eyebrow tone="light">The review clip</Eyebrow>
                <h2 className="font-display text-3xl font-extrabold leading-[1.1] text-ink sm:text-4xl">
                  Watch the delivery the way a coach reads it
                </h2>
                <p className="text-base leading-relaxed text-ink/65">
                  The moments that matter are held on screen and labelled — back-foot
                  contact, front-foot contact, arm horizontal, release,
                  follow-through — with the ball’s path drawn in and the key numbers
                  on the panel beside it.
                </p>
                <ul className="flex flex-col gap-3 pt-1">
                  {[
                    'Key frames paused and named',
                    'Ball path drawn over your footage',
                    'Metrics panel matched to the frame',
                    'Shareable with player or squad',
                  ].map((t) => (
                    <li key={t} className="flex items-center gap-3 text-sm font-medium text-ink/75">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-pitch text-[11px] font-bold text-lime">
                        ✓
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
                <Button to="/features" variant="light" className="mt-2">
                  Explore the analysis
                </Button>
              </div>
            </Reveal>

            <Reveal delay={140}>
              <div className="relative">
                <div className="absolute -inset-4 rounded-[2rem] bg-pitch/10 blur-2xl" aria-hidden />
                <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-pitch/10 bg-night shadow-2xl shadow-pitch/20">
                  <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-bad/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-warn/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-ok/70" />
                    <span className="pl-2 text-xs font-semibold text-chalk/45">
                      delivery-review.mp4
                    </span>
                  </div>
                  <PhotoFrame
                    src="/hero-bowling.jpg"
                    alt="Bowling delivery under review"
                    className="aspect-video rounded-none"
                  >
                    <div className="flex h-full flex-col justify-between p-5">
                      <div className="flex items-start justify-between">
                        <Chip tone="lime">Release</Chip>
                        <div className="rounded-lg border border-white/15 bg-night/70 px-3 py-1.5 text-right backdrop-blur">
                          <div className="font-display text-lg font-extrabold text-chalk">84.1</div>
                          <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-chalk/45">
                            km/h
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="flex gap-1.5 pb-2">
                          {['BFC', 'FFC', 'MER', 'REL', 'FT'].map((p, i) => (
                            <span
                              key={p}
                              className={`rounded px-2 py-1 text-[9px] font-bold tracking-wide ${
                                i === 3
                                  ? 'bg-lime text-night'
                                  : 'bg-white/10 text-chalk/60'
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
      </Section>

      {/* ===================== HOW IT WORKS ===================== */}
      <Section tone="pitch" className="py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0 bg-grid-tech opacity-40" aria-hidden />
        <Container className="relative">
          <SectionHeading
            tone="dark"
            eyebrow="How CricLab works"
            title="Four steps, one phone"
            lead="From filming a delivery to knowing what to change — without a rig, a lab, or a specialist."
          />

          <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 90}>
                <Card className="flex h-full flex-col gap-4 p-6">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-4xl font-extrabold text-lime/25">{s.n}</span>
                    <span className="h-px flex-1 bg-gradient-to-r from-lime/40 to-transparent" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-chalk">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-chalk/60">{s.body}</p>
                  <Link
                    to={s.to}
                    className="mt-auto pt-2 text-sm font-semibold text-lime transition hover:text-chalk"
                  >
                    {s.cta} →
                  </Link>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ===================== BENEFITS ===================== */}
      <Section tone="light" className="py-24 sm:py-32">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex flex-col gap-6">
              <SectionHeading
                align="left"
                eyebrow="Why CricLab"
                title="Built to be trusted in a session"
                lead="A number a coach cannot rely on is worse than no number at all. That principle shapes the whole product."
                className="max-w-none"
              />
              <Reveal delay={120}>
                <div className="h-44 rounded-2xl border border-pitch/10 bg-white p-5 shadow-lg shadow-pitch/5">
                  <div className="pb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-ink/40">
                    Session comparison
                  </div>
                  <div className="h-28">
                    <MetricBars bars={[48, 62, 58, 74, 81, 93]} />
                  </div>
                </div>
              </Reveal>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {BENEFITS.map((b, i) => (
                <Reveal key={b.title} delay={i * 80}>
                  <Card tone="light" className="flex h-full flex-col gap-3 p-6">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-pitch text-lime">
                      <span className="font-display text-sm font-extrabold">{i + 1}</span>
                    </span>
                    <h3 className="font-display text-lg font-bold text-ink">{b.title}</h3>
                    <p className="text-sm leading-relaxed text-ink/65">{b.body}</p>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* ===================== TESTIMONIALS ===================== */}
      <Section tone="dark" className="py-24 sm:py-32">
        <Container>
          <SectionHeading
            tone="dark"
            eyebrow="From the ground"
            title="What coaches and players say"
            lead="CricLab is built alongside the people who use it between overs, not in a boardroom."
          />
          <div className="mt-16 grid gap-5 lg:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 90}>
                <Card className="flex h-full flex-col gap-5 p-7">
                  <svg viewBox="0 0 32 24" className="h-6 w-8 text-lime/50" aria-hidden>
                    <path
                      d="M0 24V13.4C0 6.2 4.3 1.4 12 0l1.4 3.9C9 5.5 6.6 8.2 6.4 12H12v12H0Zm18 0V13.4C18 6.2 22.3 1.4 30 0l1.4 3.9C27 5.5 24.6 8.2 24.4 12H30v12H18Z"
                      fill="currentColor"
                    />
                  </svg>
                  <p className="flex-1 text-sm leading-relaxed text-chalk/75">“{t.quote}”</p>
                  <div className="flex items-center gap-3 border-t border-white/10 pt-4">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-pitch-soft to-pitch text-sm font-bold text-lime">
                      {t.name.charAt(0)}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-chalk">{t.name}</div>
                      <div className="text-xs text-chalk/45">{t.role}</div>
                    </div>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200} className="mt-10 text-center">
            <Link to="/testimonials" className="text-sm font-semibold text-lime hover:text-chalk">
              Read more stories →
            </Link>
          </Reveal>
        </Container>
      </Section>

      {/* ===================== CTA ===================== */}
      <Section tone="light" className="py-20 sm:py-28">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] bg-stadium px-7 py-16 text-center text-chalk sm:px-14">
              <StadiumAtmosphere />
              <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
                <SeamBall size={64} className="animate-float-slow" />
                <h2 className="font-display text-3xl font-extrabold leading-tight sm:text-[2.6rem]">
                  Your next delivery is a{' '}
                  <span className="text-gradient-lime">data point</span>
                </h2>
                <p className="text-base leading-relaxed text-chalk/65">
                  Film one ball today and see what CricLab finds. No rig, no setup —
                  just the clip you already know how to take.
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
