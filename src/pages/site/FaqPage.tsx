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
  Reveal,
  Section,
  SectionHeading,
  SectionSeam,
  TiltCard,
  WordReveal,
} from '../../components/site/ui'
import {
  BowlerSkeleton,
  MetricBars,
  PitchFloor,
  SeamBall,
  StadiumAtmosphere,
  TrajectoryArc,
} from '../../components/site/visuals'

/* ---------------------------------------------------------------------------
   Four categories, in the order a new user meets them: get going, film it,
   read the result, then sort the account out.
--------------------------------------------------------------------------- */

const CATEGORIES = [
  {
    id: 'getting-started',
    label: 'Getting started',
    blurb: 'What you need before the first ball, and what comes back.',
  },
  {
    id: 'filming',
    label: 'Filming',
    blurb: 'Angles, light, nets, floodlights and left-armers.',
  },
  {
    id: 'results',
    label: 'Results & accuracy',
    blurb: 'What the numbers mean and where they stop.',
  },
  {
    id: 'account',
    label: 'Account & billing',
    blurb: 'Plans, seats, squads and who can see what.',
  },
]

/* The half-dozen answers people want before they will read anything longer.
   One line each — anything that needs a paragraph belongs in an accordion. */
const QUICK_ANSWERS = [
  {
    q: 'What do I film?',
    a: 'One delivery, side-on, whole body in frame.',
    tag: 'Filming',
  },
  {
    q: 'What kit do I need?',
    a: 'A phone and something to rest it on. No markers, no rig.',
    tag: 'Kit',
  },
  {
    q: 'How long does it take?',
    a: 'A few minutes for a single ball — a walk back to your mark.',
    tag: 'Timing',
  },
  {
    q: 'Seamers or spinners?',
    a: 'Both. Film a spinner closer and at the highest frame rate you have.',
    tag: 'Bowling',
  },
  {
    q: 'Batting or fielding?',
    a: 'Not yet. Bowling first, and properly, before anything else.',
    tag: 'Scope',
  },
  {
    q: 'Behind the arm?',
    a: 'Great for line and length, poor for an action. Film side-on.',
    tag: 'Angle',
  },
]

const GETTING_STARTED = [
  {
    q: 'What do I need before my first analysis?',
    a: (
      <>
        A phone, one clear delivery filmed side-on, and two details about the bowler
        — their height and which arm they bowl with. Height is what turns pixels
        into metres, so a rough guess will cost you accuracy on release height and
        stride. That is the whole set-up. The{' '}
        <Link to="/record" className="font-semibold text-pitch underline underline-offset-2">
          filming guide
        </Link>{' '}
        covers the rest in about a minute.
      </>
    ),
  },
  {
    q: 'How long until I see something back?',
    a: 'A single delivery usually comes back inside a few minutes — long enough to walk back to your mark, not long enough to lose the session. Longer clips with several balls in them take a little more.',
  },
  {
    q: 'Do I need to be a coach to make sense of the results?',
    a: 'No. Each finding is written in plain cricket language — front foot collapsing, arm falling away, release drifting later through the spell — and every one comes with something to actually go and do about it in the next net.',
  },
  {
    q: 'Does it work for spinners as well as seamers?',
    a: 'Yes. The delivery is broken into the same phases and the arm path reads the same way whichever pace you bowl at. The one difference is wrist detail: a leg-break and a googly separate over a handful of frames, so film a spinner a little closer and at the highest frame rate your phone offers.',
  },
  {
    q: 'Can I analyse batting or fielding too?',
    a: 'Not yet. CricLab starts with bowling — seam and spin actions, plus the flight of the ball — because that is where a single side-on clip carries the most information. Batting is the next thing we want to get right rather than the next thing we want to ship.',
  },
  {
    q: 'What about junior players?',
    a: 'It works the same way, and height matters even more with juniors because it changes month to month. Update the height on the profile at the start of each block so the measurements stay honest as they grow.',
  },
]

const FILMING = [
  {
    q: 'What footage actually works best?',
    a: 'Side-on, roughly level with the crease, camera about waist height, and the whole body in frame from a couple of strides before the jump through to the follow-through. Keep the phone steady — a small tripod or a mate who will not flinch — film in landscape, and use 60 frames per second or better. Good light beats good kit every time.',
  },
  {
    q: 'Indoor nets or outdoors — does it matter?',
    a: 'Both work. Indoors, watch for uneven overhead light and, above all, do not shoot through the side netting: a mesh between the camera and the bowler blurs exactly the joints that need to be seen. Outdoors, keep the sun behind the camera rather than behind the bowler, or you will film a silhouette.',
  },
  {
    q: 'Can I film under floodlights or in the evening?',
    a: 'You can, and plenty of people do. Low light and flickering lamps cost you sharpness on the fast-moving parts — the wrist and the ball — so move a little closer, make sure the bowler is lit from the front, and never film straight into the lights. If a number comes back unavailable on a night clip, this is usually why.',
  },
  {
    q: 'Do left-arm bowlers need anything different?',
    a: 'Only one thing: set the bowling arm on the profile before you upload. Get that right and everything else is identical — same side-on position, same framing. Get it wrong and the read comes back mirrored, calling the front leg the back leg.',
  },
  {
    q: 'How much of the run-up should I capture?',
    a: 'From a couple of strides before the bound is plenty; the full thirty-yard approach only shrinks the bowler in frame. Do make sure the ball pitching is in shot, though — the bounce is what anchors the flight, and without it you lose the ball-flight read.',
  },
  {
    q: 'Can I film from behind the arm instead?',
    a: 'Behind the arm is the best angle in cricket for line and length, and a poor one for an action. It hides the side-on geometry, so stride, release height and arm path will come back unavailable. Film side-on for the action, and keep your behind-the-arm clips for the line-and-length conversation.',
  },
  {
    q: 'One ball per clip, or a whole over?',
    a: 'One ball per clip is cleanest and easiest to compare later. If you film a whole over in one take, trim it down before uploading — a tight clip of a single delivery is read more reliably than a long one where the bowler walks back twice.',
  },
]

const RESULTS = [
  {
    q: 'Why does a metric sometimes come back as unavailable?',
    a: 'Because the footage could not support it honestly. Wrong angle, a joint hidden behind the netting, too little light, too few frames through the quick part of the action — any of these and the measurement is withheld rather than estimated. Each one tells you which it was, so the fix is usually one filming adjustment away.',
  },
  {
    q: 'How accurate is the ball speed?',
    a: 'It depends on your frame rate and how much of the flight is in shot, which is why a confidence note sits next to the figure rather than a bare number. Treat it as a reliable reference against your own previous deliveries filmed the same way. It is not a broadcast speed gun and we will not pretend it is.',
  },
  {
    q: 'Does this replace a coach?',
    a: 'No, and it is not trying to. It gives a coach evidence instead of an argument — what the front foot did, when the arm came through, how the release changed across a spell. Deciding what to do about any of that is coaching, and that is still a person’s job.',
  },
  {
    q: 'Two deliveries look identical to me, so why do the numbers differ?',
    a: 'Because at full speed you are seeing about a fifth of what happened. Stride length, timing between front-foot contact and release, and trunk lean move by amounts the eye cannot hold — that gap is the entire point of measuring. If the difference looks wild rather than small, check the two clips were filmed from the same distance and angle.',
  },
  {
    q: 'Can I compare deliveries filmed weeks apart?',
    a: 'Yes, and it is the most useful thing you can do with it. Sessions are kept, so a pre-season action and a mid-season action sit side by side. The one condition is consistent filming: same side, similar distance, similar height. Mark your camera spot and reuse it.',
  },
  {
    q: 'Does it tell me whether an action is legal?',
    a: 'No. It reports arm path and elbow angles as measured from your footage, and that is a coaching input, not a verdict. Assessing the legality of an action is a formal process carried out under controlled conditions by qualified people. Please do not use CricLab to call anyone.',
  },
  {
    q: 'What if the numbers do not match what I expected?',
    a: 'Check the framing first — most surprises come from the camera, not the bowler. If the clip was filmed cleanly and the read still looks wrong to you, send it over. We would rather hear about a delivery we got wrong than have you quietly stop trusting it.',
  },
]

const ACCOUNT = [
  {
    q: 'Can I change plan in the middle of a season?',
    a: 'Yes, in both directions. Moving up takes effect immediately so you can cover a busy block of fixtures, and moving down applies at your next billing date. Nothing you have already filmed is affected either way.',
  },
  {
    q: 'What happens to my sessions if I cancel?',
    a: 'Your history stays viewable — the clips, the marked-up reviews and the numbers all remain where you left them. What stops is new analyses. Come back for a pre-season block and everything is still there to compare against.',
  },
  {
    q: 'Can two coaches share one login?',
    a: 'Please do not. On the Academy plan every coach gets their own sign-in, which keeps each player’s history attributed to the bowler who actually sent the ball down. Shared logins are how a squad ends up with one profile containing four different actions.',
  },
  {
    q: 'Who can see a player’s footage?',
    a: 'Only the account it was filmed under, and anyone you deliberately share a clip with. Nothing is made public, nothing appears in a feed, and a player’s footage is not shown to other members of your squad unless you share it with them.',
  },
  {
    q: 'Do you offer club, school or county pricing?',
    a: (
      <>
        We do — squads, academies and school programmes are priced per set-up rather
        than per head.{' '}
        <Link to="/contact" className="font-semibold text-lime hover:text-chalk">
          Tell us the size of your roster
        </Link>{' '}
        and how often you film, and we will come back with a number.
      </>
    ),
  },
  {
    q: 'Where do I find the plan details?',
    a: (
      <>
        Everything on limits, seats, billing and refunds sits on the{' '}
        <Link to="/pricing" className="font-semibold text-lime hover:text-chalk">
          pricing page
        </Link>
        , including a full comparison of what each plan carries.
      </>
    ),
  },
]

export function FaqPage() {
  return (
    <MarketingLayout title="FAQ">
      {/* ===================== HERO ===================== */}
      <PageHero
        plate="nets"
        eyebrow="Frequently asked"
        title={
          <>
            The questions people ask{' '}
            <span className="text-gradient-lime">at the nets</span>
          </>
        }
        lead="Straight answers about filming, accuracy and what CricLab will and will not tell you. Where the honest answer is “it depends”, we have said what it depends on."
      >
        <div className="flex flex-wrap gap-2 pt-3">
          <Chip tone="lime">No jargon</Chip>
          <Chip tone="neutral">Updated each season</Chip>
        </div>
      </PageHero>

      <SectionSeam />

      {/* ===================== QUICK ANSWERS ===================== */}
      <Section tone="mid" className="py-16 sm:py-20">
        <Backdrop plate="bokeh" scrim="dark" parallax={0.09} />
        <div
          className="pointer-events-none absolute -left-24 -top-16 h-72 w-72 animate-glow-breathe rounded-full bg-lime/10 blur-[120px]"
          aria-hidden
        />
        <Container className="relative">
          <SectionHeading
            tone="dark"
            eyebrow="The short version"
            title="Six answers before you scroll"
            lead="The ones asked most often at the top of a bowler’s mark. Everything below this takes a paragraph."
          />

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_ANSWERS.map((item, i) => (
              <Reveal key={item.q} delay={i * 70} className="h-full">
                <TiltCard className="h-full" max={5}>
                  <Card className="ring-glow flex h-full flex-col gap-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-display text-base font-bold text-chalk">{item.q}</h3>
                      <Chip tone="neutral">{item.tag}</Chip>
                    </div>
                    <p className="text-sm leading-relaxed text-chalk/60">{item.a}</p>
                  </Card>
                </TiltCard>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200} className="mt-8 text-center">
            <p className="text-sm text-chalk/50">
              Need the longer answer?{' '}
              <a href="#getting-started" className="font-semibold text-lime hover:text-chalk">
                Pick a section below →
              </a>
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* ===================== CATEGORY NAV ===================== */}
      <Section tone="plain" className="border-b border-pitch/10 py-12 sm:py-14">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((c, i) => (
              <Reveal key={c.id} delay={i * 80} className="h-full">
                <a
                  href={`#${c.id}`}
                  className="ring-glow group flex h-full flex-col gap-2 rounded-2xl border border-pitch/10 dark:border-white/10 bg-white dark:bg-white/6 p-5 transition duration-300 hover:-translate-y-1 hover:border-pitch/30 hover:shadow-lg hover:shadow-pitch/10"
                >
                  <span className="font-display text-xs font-extrabold uppercase tracking-[0.16em] text-lime-deep">
                    0{i + 1}
                  </span>
                  <span className="font-display text-lg font-bold text-ink dark:text-chalk">{c.label}</span>
                  <span className="text-sm leading-relaxed text-ink/60 dark:text-chalk/60">{c.blurb}</span>
                  <span className="mt-auto pt-2 text-sm font-semibold text-pitch opacity-0 transition group-hover:opacity-100">
                    Jump down →
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ===================== GETTING STARTED ===================== */}
      <Section tone="light" id="getting-started" className="py-20 sm:py-28">
        <Container>
          <SectionHeading
            eyebrow="Getting started"
            title="Your first delivery"
            lead="What you need in your hand before you mark out a run-up, and what lands back afterwards."
          />
          <div className="mx-auto mt-12 max-w-3xl">
            <Accordion items={GETTING_STARTED} tone="light" />
          </div>
        </Container>
      </Section>

      {/* ===================== FILMING ===================== */}
      <Section tone="dark" id="filming" className="py-20 sm:py-28">
        <Backdrop plate="nets" scrim="dark-soft" parallax={0.12} />
        <StadiumAtmosphere />
        <div
          className="pointer-events-none absolute -right-24 top-32 h-72 w-72 animate-drift rounded-full bg-pitch-soft/25 blur-[120px]"
          aria-hidden
        />
        <Container className="relative">
          <SectionHeading
            tone="dark"
            eyebrow="Filming"
            title={<WordReveal text="Getting the clip right" />}
            lead="Nearly every disappointing result traces back to the camera rather than the bowler. Two minutes of set-up buys you the whole read."
          />

          <div className="mt-14 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <Reveal>
              <Card className="flex flex-col gap-4 p-6" interactive={false}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-chalk/45">
                    The side-on set-up
                  </span>
                  <Chip tone="lime">Side-on</Chip>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-40 rounded-2xl border border-white/10 bg-night/60 p-3">
                    <BowlerSkeleton />
                  </div>
                  <div className="h-40 rounded-2xl border border-white/10 bg-night/60 p-3">
                    <TrajectoryArc />
                  </div>
                </div>
                <ul className="flex flex-col gap-2.5 border-t border-white/10 pt-4">
                  {[
                    'Camera level with the crease, waist height',
                    'Whole body in frame, landscape',
                    '60 frames per second or better',
                    'The ball pitching kept in shot',
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-3 text-sm text-chalk/70">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-lime/15 text-[11px] font-bold text-lime">
                        ✓
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
                <Button to="/record" variant="secondary" className="mt-1 w-full">
                  Full filming guide
                  <span aria-hidden>→</span>
                </Button>
              </Card>
            </Reveal>

            <Accordion items={FILMING} tone="dark" />
          </div>
        </Container>
        <PitchFloor />
      </Section>

      {/* ===================== RESULTS & ACCURACY ===================== */}
      <Section tone="warm" id="results" className="py-20 sm:py-28">
        <Container>
          <SectionHeading
            eyebrow="Results & accuracy"
            title="What the numbers can carry"
            lead="A figure a coach cannot rely on is worse than no figure at all — so here is exactly where ours stop."
          />
          <div className="mx-auto mt-12 max-w-3xl">
            <Accordion items={RESULTS} tone="light" />
          </div>

          <Reveal delay={160} className="mx-auto mt-12 max-w-3xl">
            <div className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-pitch/10 dark:border-white/10 bg-white dark:bg-white/6 p-6 shadow-lg shadow-pitch/5 sm:flex-row sm:items-center sm:gap-8">
              <div className="h-20 w-full sm:w-48">
                <MetricBars bars={[46, 58, 63, 71, 84, 92]} />
              </div>
              <p className="text-sm leading-relaxed text-ink/65 dark:text-chalk/65">
                The value is not in one delivery. It is in six of them, filmed the
                same way across a block, where a genuine change in the action stops
                being a feeling and starts being a line you can point at.
              </p>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ===================== ACCOUNT & BILLING ===================== */}
      <Section tone="pitch" id="account" className="py-20 sm:py-28">
        <Backdrop plate="pitch" scrim="dark-soft" parallax={0.08} />
        <div className="pointer-events-none absolute inset-0 bg-grid-tech opacity-40" aria-hidden />
        <div
          className="pointer-events-none absolute -bottom-20 left-1/2 h-64 w-64 -translate-x-1/2 animate-glow-breathe rounded-full bg-lime/10 blur-[120px]"
          aria-hidden
        />
        <Container className="relative">
          <SectionHeading
            tone="dark"
            eyebrow="Account & billing"
            title="Plans, seats and squads"
            lead="How the money works, who gets a sign-in, and who can see a player’s footage."
          />
          <div className="mx-auto mt-12 max-w-3xl">
            <Accordion items={ACCOUNT} tone="dark" />
          </div>
        </Container>
      </Section>

      {/* ===================== STILL NEED HELP ===================== */}
      <Section tone="light" className="py-20 sm:py-28">
        <Container>
          <Reveal>
            <div className="grid gap-10 rounded-[2rem] border border-pitch/10 dark:border-white/10 bg-white dark:bg-white/6 p-8 shadow-xl shadow-pitch/5 sm:p-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="flex flex-col items-start gap-5">
                <Eyebrow tone="light">Still stuck</Eyebrow>
                <h2 className="font-display text-3xl font-extrabold leading-[1.12] text-ink dark:text-chalk sm:text-4xl">
                  Not found your question?
                </h2>
                <p className="text-base leading-relaxed text-ink/65 dark:text-chalk/65">
                  Send us the clip and the question together — it is far quicker to
                  answer “why did this come back unavailable” when we can see the
                  delivery you are asking about. We read everything that comes in.
                </p>
                <div className="flex flex-wrap gap-3 pt-1">
                  <Button to="/contact" variant="light" size="lg">
                    Get in touch
                    <span aria-hidden>→</span>
                  </Button>
                  <Link
                    to="/record"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-pitch/20 px-8 py-4 text-base font-semibold text-pitch transition duration-300 hover:border-pitch/40 hover:bg-pitch/5"
                  >
                    Re-read the filming guide
                  </Link>
                </div>
                <p className="text-sm text-ink/50 dark:text-chalk/50">
                  Comparing plans instead?{' '}
                  <Link
                    to="/pricing"
                    className="font-semibold text-pitch underline underline-offset-4 hover:text-lime-deep"
                  >
                    Head to pricing →
                  </Link>
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {[
                  { t: 'Filming guide', b: 'The side-on set-up, step by step.', to: '/record' },
                  { t: 'How it works', b: 'Record, upload, review, improve.', to: '/how-it-works' },
                  { t: 'What we measure', b: 'Every phase and figure explained.', to: '/features' },
                ].map((l, i) => (
                  <Reveal key={l.to} delay={i * 80}>
                    <Link
                      to={l.to}
                      className="ring-glow group flex items-center justify-between gap-4 rounded-2xl border border-pitch/10 dark:border-white/10 bg-chalk dark:bg-white/[0.04] p-5 transition duration-300 hover:border-pitch/30 hover:bg-white dark:hover:bg-white/[0.08]"
                    >
                      <span className="flex flex-col gap-1">
                        <span className="font-display text-base font-bold text-ink dark:text-chalk">{l.t}</span>
                        <span className="text-sm text-ink/60 dark:text-chalk/60">{l.b}</span>
                      </span>
                      <span
                        className="text-lg font-bold text-pitch transition group-hover:translate-x-1"
                        aria-hidden
                      >
                        →
                      </span>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ===================== CTA ===================== */}
      <Section tone="plain" className="py-20 sm:py-28">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] bg-stadium px-7 py-16 text-center text-chalk sm:px-14">
              <Backdrop plate="nets" scrim="dark" parallax={0.05} />
              <StadiumAtmosphere />
              <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
                <SeamBall size={64} className="animate-float-slow" />
                <h2 className="font-display text-3xl font-extrabold leading-tight sm:text-[2.6rem]">
                  Enough reading. <span className="shimmer-text">Mark out a run.</span>
                </h2>
                <p className="text-base leading-relaxed text-chalk/65">
                  One delivery answers more of these questions than the whole page
                  does. Film a ball, see the read, and come back if anything still
                  puzzles you.
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
