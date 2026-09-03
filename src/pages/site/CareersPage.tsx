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
} from '../../components/site/visuals'

const REASONS = [
  {
    tag: 'The work',
    title: 'You will watch your work change an action',
    body: 'A coach films a colt on Tuesday, shows them the marked-up clip on Wednesday, and by the weekend the front arm is holding. That loop is short enough that you see the effect of what you shipped.',
  },
  {
    tag: 'The bar',
    title: 'Nothing ships that a coach cannot trust',
    body: 'We would rather hold a feature back a fortnight than put a shaky number in front of a fifteen-year-old. If you like getting things right more than getting them out, you will feel at home.',
  },
  {
    tag: 'The room',
    title: 'Cricket people sit in every conversation',
    body: 'Coaches, club players and analysts are in the room from the first sketch. Nobody here designs for a cricketer they have never watched bowl.',
  },
]

const HOW_WE_WORK = [
  {
    title: 'Small side, clear roles',
    body: 'Everyone owns something end to end and can name the player it helps. No layers of sign-off between an idea and a coach using it.',
  },
  {
    title: 'Written before it is discussed',
    body: 'Proposals go round as a page, not a meeting invite. Meetings are for the parts that genuinely need voices, which keeps calendars mostly empty.',
  },
  {
    title: 'In-season and off-season rhythm',
    body: 'We ship carefully through the season and take the winter for the bigger rebuilds. The calendar follows cricket rather than fighting it.',
  },
  {
    title: 'Time at the ground counts as work',
    body: 'Sessions at clubs and academies are in the schedule, not squeezed around it. Watching real filming go wrong teaches more than any amount of feedback triage.',
  },
]

const ROLES = [
  {
    title: 'Product Engineer',
    location: 'Remote / Hybrid — London',
    type: 'Full-time',
    tag: 'Product',
    body: 'Build the screens a coach opens between overs: the review clip, the session history, the comparison view. You care about the feel of a page on a three-year-old phone at the boundary edge, in bright sun.',
  },
  {
    title: 'Cricket Performance Analyst',
    location: 'Hybrid — Birmingham',
    type: 'Full-time',
    tag: 'Cricket',
    body: 'Own the coaching language. Decide which phases matter, what a useful threshold looks like across age groups, and how a finding gets phrased so a player can act on it that session.',
  },
  {
    title: 'Movement Research Scientist',
    location: 'Remote — UK',
    type: 'Full-time',
    tag: 'Research',
    body: 'Pressure-test every measurement we publish against real footage from real grounds, and define exactly when we should decline to report a number rather than guess at it.',
  },
  {
    title: 'Product Designer',
    location: 'Remote / Hybrid — London',
    type: 'Full-time',
    tag: 'Design',
    body: 'Design for one hand, bright light and forty seconds of attention. From the filming guide to the session report, make the honest answer the easiest one to read.',
  },
  {
    title: 'Academy Partnerships Manager',
    location: 'Hybrid — Manchester',
    type: 'Full-time',
    tag: 'Partnerships',
    body: 'Work with academies, county pathways and school programmes: get CricLab into winter nets, gather what coaches actually need next, and bring it back to the team unfiltered.',
  },
  {
    title: 'Cricket Content Lead',
    location: 'Remote — UK / India',
    type: 'Part-time',
    tag: 'Content',
    body: 'Write the filming guides, drill notes and season pieces that players read on the way to training. Cricket writing that respects the reader’s time and knows a leg cutter from a slower ball.',
  },
]

const BENEFITS = [
  {
    title: '28 days, plus bank holidays',
    body: 'Taken properly. The whole team is nudged towards a fortnight in one go rather than days stolen back one at a time.',
  },
  {
    title: 'Kit and coaching budget',
    body: 'An annual allowance for coaching badges, club subs, nets hire or the camera you have been meaning to buy.',
  },
  {
    title: 'Remote-first, together often',
    body: 'Work from wherever you play your cricket, with the whole side meeting at a ground once a quarter for a few days.',
  },
  {
    title: 'Match-day flexibility',
    body: 'If you are playing Saturday league or coaching Sunday colts, the week bends around it. Everybody here has a fixture list.',
  },
  {
    title: 'Hardware you choose',
    body: 'Pick the machine and phone you want to build and test on, refreshed on a sensible cycle rather than a bureaucratic one.',
  },
  {
    title: 'Real ownership',
    body: 'Every permanent role carries equity, with the terms explained in plain English before you sign rather than after.',
  },
]

const HIRING = [
  {
    q: '1. Intro call — 30 minutes',
    a: 'A conversation about what you have built or coached, and what you want next. We tell you honestly where the role sits and what the first six months look like.',
  },
  {
    q: '2. Craft conversation — 60 minutes',
    a: 'A proper look at your work with the person you would sit next to. Bring something you are proud of; we will dig into the decisions rather than quiz you on trivia.',
  },
  {
    q: '3. A paid, timeboxed piece of work',
    a: 'A short real problem, scoped to a day and paid at your rate. No unpaid weekends, and nothing we would ship without paying you for it.',
  },
  {
    q: '4. Meet the side, then an offer',
    a: 'Informal chats with everyone you would work alongside, references when you are ready, and a decision within a week of the last conversation.',
  },
]

export function CareersPage() {
  return (
    <MarketingLayout title="Careers">
      <PageHero
        plate="nets"
        eyebrow="Careers at CricLab"
        title={
          <>
            Build the tools cricket
            <br />
            <span className="text-gradient-lime">has been coaching without</span>
          </>
        }
        lead="We are a small side building performance analysis for the grounds where most cricket is actually played. If you have coached a colt, opened the bowling on a wet Saturday, or simply cannot let a sloppy measurement go, there may be a seat here for you."
      >
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button href="#open-roles" size="lg">
            See open roles
            <span aria-hidden>↓</span>
          </Button>
          <Button to="/about" variant="secondary" size="lg">
            About CricLab
          </Button>
        </div>
      </PageHero>

      {/* ===================== QUICK FACTS ===================== */}
      <Section tone="warm" className="border-y border-pitch/10 py-14">
        <Container>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <Reveal>
              <Stat value={6} label="Open roles" tone="light" />
            </Reveal>
            <Reveal delay={80}>
              <Stat value={100} suffix="%" label="Remote-friendly" tone="light" />
            </Reveal>
            <Reveal delay={160}>
              <Stat value={28} label="Days holiday" tone="light" />
            </Reveal>
            <Reveal delay={240}>
              <Stat value={4} label="Team meet-ups a year" tone="light" />
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ===================== WHY CRICLAB ===================== */}
      <Section tone="dark" className="py-24 sm:py-32">
        <Backdrop plate="nets" scrim="dark-soft" parallax={0.09} />
        <StadiumAtmosphere />
        <div
          className="pointer-events-none absolute -right-32 top-24 h-80 w-80 animate-glow-breathe rounded-full bg-lime/10 blur-[130px]"
          aria-hidden
        />
        <Container className="relative">
          <SectionHeading
            tone="dark"
            align="left"
            eyebrow="Why work here"
            title="Short loop, high bar, real cricket"
            lead="This is a product people use standing on grass, in the middle of a session, with a player waiting. That constraint makes the work sharper than most."
          />

          <div className="mt-14 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <Reveal delay={120}>
              <div className="relative">
                <div className="absolute -inset-5 rounded-[2rem] bg-lime/10 blur-3xl" aria-hidden />
                <PhotoFrame
                  src="/hero-bowling.jpg"
                  alt="A coach and bowler reviewing a delivery at the ground"
                  className="relative aspect-[5/4] w-full"
                >
                  <div className="flex h-full flex-col justify-between p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <Chip tone="lime">Tuesday nets</Chip>
                      <Chip>Winter programme</Chip>
                    </div>
                    <div className="rounded-2xl border border-white/15 bg-night/70 p-4 backdrop-blur">
                      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-chalk/45">
                        What we are working on
                      </div>
                      <div className="mt-3 h-16">
                        <MetricBars bars={[58, 72, 49, 86, 64, 91]} />
                      </div>
                    </div>
                  </div>
                </PhotoFrame>
                <div className="absolute -bottom-7 -left-6 hidden animate-bob sm:block">
                  <SeamBall size={74} />
                </div>
              </div>
            </Reveal>

            <div className="flex flex-col gap-4">
              {REASONS.map((r, i) => (
                <Reveal key={r.title} delay={i * 90}>
                  <TiltCard>
                    <Card className="ring-glow flex flex-col gap-3 p-6">
                      <Chip tone="lime">{r.tag}</Chip>
                      <h3 className="font-display text-lg font-bold text-chalk sm:text-xl">
                        {r.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-chalk/60">{r.body}</p>
                    </Card>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
        <PitchFloor />
      </Section>

      {/* ===================== HOW WE WORK ===================== */}
      <Section tone="light" className="py-24 sm:py-32">
        <Container>
          <SectionHeading
            eyebrow="How we work"
            title="Few meetings, plain writing, cricket in the calendar"
            lead="A small side gets its speed from clarity rather than hours. These four habits are what keep the week honest."
          />

          <div className="mt-16 grid gap-5 sm:grid-cols-2">
            {HOW_WE_WORK.map((h, i) => (
              <Reveal key={h.title} delay={i * 80}>
                <Card tone="light" className="ring-glow flex h-full flex-col gap-3 p-6 sm:p-7">
                  <span
                    className="animate-pop-in grid h-10 w-10 place-items-center rounded-xl bg-pitch text-lime"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <span className="font-display text-sm font-extrabold">{i + 1}</span>
                  </span>
                  <h3 className="font-display text-lg font-bold text-ink dark:text-chalk">{h.title}</h3>
                  <p className="text-sm leading-relaxed text-ink/65 dark:text-chalk/65">{h.body}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ===================== OPEN ROLES ===================== */}
      <Section tone="pitch" id="open-roles" className="py-24 sm:py-32">
        <Backdrop plate="turf" scrim="dark-soft" parallax={0.1} />
        <div className="pointer-events-none absolute inset-0 bg-grid-tech opacity-40" aria-hidden />
        <Container className="relative">
          <SectionHeading
            tone="dark"
            eyebrow="Open roles"
            title={<WordReveal text="Six seats, one dressing room" />}
            lead="Every role is hired for judgement over years served. If you can do the work and love the game, apply even if the years on the ad do not match yours."
          />

          <div className="mt-16 grid gap-5 lg:grid-cols-2">
            {ROLES.map((role, i) => (
              <Reveal key={role.title} delay={i * 70}>
                <TiltCard className="h-full">
                <Card className="ring-glow flex h-full flex-col gap-4 p-6 sm:p-7">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="font-display text-xl font-bold text-chalk">{role.title}</h3>
                    <Chip tone="lime">{role.tag}</Chip>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-[0.12em] text-chalk/45">
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-lime" />
                      {role.location}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-seam" />
                      {role.type}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-chalk/60">{role.body}</p>

                  <div className="mt-auto pt-2">
                    <Button to="/contact" variant="secondary" size="sm">
                      Apply
                      <span aria-hidden>→</span>
                    </Button>
                  </div>
                </Card>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ===================== BENEFITS ===================== */}
      <Section tone="warm" className="py-24 sm:py-32">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="flex flex-col gap-6">
              <SectionHeading
                align="left"
                eyebrow="Benefits"
                title="Looked after properly, not perked to death"
                lead="No table football, no fruit basket. Time, kit, ownership and a week that fits around your fixtures."
                className="max-w-none"
              />
              <Reveal delay={120}>
                <div className="rounded-2xl border border-pitch/10 dark:border-white/10 bg-white dark:bg-white/6 p-6 shadow-lg shadow-pitch/5">
                  <div className="pb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ink/40 dark:text-chalk/40">
                    Where we hire
                  </div>
                  <p className="text-sm leading-relaxed text-ink/65 dark:text-chalk/65">
                    We are set up for the UK and India, and open to anywhere within a few
                    hours of those working days. Every role is written remote-first, with
                    a desk available in London if you would rather not work from the
                    kitchen table.
                  </p>
                </div>
              </Reveal>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {BENEFITS.map((b, i) => (
                <Reveal key={b.title} delay={i * 70}>
                  <Card tone="light" className="ring-glow flex h-full flex-col gap-2.5 p-6">
                    <h3 className="font-display text-base font-bold text-ink dark:text-chalk">{b.title}</h3>
                    <p className="text-sm leading-relaxed text-ink/65 dark:text-chalk/65">{b.body}</p>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* ===================== HIRING ===================== */}
      <Section tone="mid" className="py-24 sm:py-32">
        <Backdrop plate="bokeh" scrim="dark-soft" parallax={0.07} />
        <Container className="relative">
          <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className="flex flex-col gap-6">
              <SectionHeading
                tone="dark"
                align="left"
                eyebrow="Hiring"
                title="Four conversations, no unpaid weekends"
                lead="You will always know what the next step is and roughly when to expect it. If the answer is no, you get it quickly and with a reason."
                className="max-w-none"
              />
              <Reveal delay={120}>
                <div className="flex flex-wrap gap-3">
                  {['Intro call', 'Craft conversation', 'Paid piece of work', 'Meet the side'].map(
                    (t, i) => (
                      <span
                        key={t}
                        className="animate-pop-in inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-chalk/60"
                        style={{ animationDelay: `${i * 90}ms` }}
                      >
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-lime/15 text-[10px] font-extrabold text-lime">
                          {i + 1}
                        </span>
                        {t}
                      </span>
                    ),
                  )}
                </div>
              </Reveal>
            </div>

            <Accordion tone="dark" items={HIRING} />
          </div>
        </Container>
      </Section>

      <SectionSeam />

      {/* ===================== OPEN APPLICATION ===================== */}
      <Section tone="night" className="py-24 sm:py-32">
        <Backdrop plate="stadium" scrim="dark" parallax={0.06} />
        <Container className="relative" size="narrow">
          <Reveal>
            <TiltCard>
              <Card className="ring-glow flex flex-col gap-5 p-7 sm:p-9">
                <div className="flex items-center justify-between gap-4">
                  <Eyebrow>Open application</Eyebrow>
                  <div className="hidden h-16 w-16 shrink-0 animate-bob opacity-70 sm:block">
                    <BowlerSkeleton />
                  </div>
                </div>
                <h3 className="font-display text-2xl font-extrabold leading-tight text-chalk sm:text-3xl">
                  No open role that fits?
                </h3>
                <p className="text-sm leading-relaxed text-chalk/65">
                  Send us a note anyway. Tell us what you would want to own, what you have
                  built or coached, and the thing about cricket analysis that irritates you
                  most. Some of the best people here arrived before the role existed —
                  we wrote the seat around them.
                </p>
                <ul className="flex flex-col gap-3 pt-1">
                  {[
                    'One paragraph beats a three-page covering letter',
                    'Coaching and playing experience counts as experience',
                    'Every note gets read by a person, and answered',
                  ].map((t, i) => (
                    <li key={t} className="flex items-start gap-3 text-sm text-chalk/70">
                      <span
                        className="animate-pop-in mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-lime text-[11px] font-bold text-night"
                        style={{ animationDelay: `${i * 90}ms` }}
                      >
                        ✓
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="pt-2">
                  <Button to="/contact" size="md">
                    Send an open application
                    <span aria-hidden>→</span>
                  </Button>
                </div>
              </Card>
            </TiltCard>
          </Reveal>
        </Container>
      </Section>

      {/* ===================== CTA ===================== */}
      <Section tone="light" className="py-20 sm:py-28">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] bg-stadium px-7 py-16 text-center text-chalk sm:px-14">
              <Backdrop plate="nets" scrim="dark" parallax={0.05} />
              <StadiumAtmosphere />
              <div
                className="pointer-events-none absolute -right-20 top-1/2 h-64 w-64 -translate-y-1/2 animate-glow-breathe rounded-full bg-lime/12 blur-[110px]"
                aria-hidden
              />
              <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
                <SeamBall size={64} className="animate-bob" />
                <h2 className="font-display text-3xl font-extrabold leading-tight sm:text-[2.6rem]">
                  Come and <span className="text-gradient-lime">build the lab</span>
                </h2>
                <p className="text-base leading-relaxed text-chalk/65">
                  Use the product first — film a delivery and see what comes back. Then
                  tell us what you would fix, and which seat you would want while fixing
                  it.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button to="/app/action" size="lg">
                    Try CricLab
                    <span aria-hidden>→</span>
                  </Button>
                  <Button to="/contact" variant="secondary" size="lg">
                    Get in touch
                  </Button>
                </div>
                <Link
                  to="/about"
                  className="text-sm font-semibold text-lime transition hover:text-chalk"
                >
                  Read about how we got here →
                </Link>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </MarketingLayout>
  )
}
