import { useState, type FormEvent } from 'react'
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
  Reveal,
  Section,
  SectionHeading,
  SectionSeam,
  TiltCard,
  WordReveal,
} from '../../components/site/ui'
import { SeamBall, StadiumAtmosphere } from '../../components/site/visuals'

const SUBJECTS = [
  { value: 'general', label: 'General' },
  { value: 'sales', label: 'Sales & academies' },
  { value: 'support', label: 'Support' },
  { value: 'partnerships', label: 'Partnerships' },
  { value: 'careers', label: 'Careers' },
]

const DETAILS = [
  {
    tag: 'Email',
    title: 'hello@criclab.com',
    body: 'One inbox, read by the people who build CricLab. Attach a clip if the question is about a delivery.',
    foot: 'Support: support@criclab.com',
  },
  {
    tag: 'Response time',
    title: 'Within one working day',
    body: 'Monday to Friday. Anything sent over a weekend of club cricket is picked up first thing Monday.',
    foot: 'Urgent match-day issue? Put “match day” in the subject.',
  },
  {
    tag: 'Academies',
    title: 'Squad and academy enquiries',
    body: 'Bulk seats, coach accounts and squad reporting for age groups. Tell us the squad size and we will come back with a shape that fits.',
    foot: 'academies@criclab.com',
  },
]

const HELP = [
  {
    q: 'My clip came back with a low-confidence reading',
    a: (
      <>
        Nine times out of ten it is the camera angle or the light. Run through the{' '}
        <Link to="/record" className="font-semibold text-pitch underline underline-offset-4">
          filming guide
        </Link>{' '}
        first — side-on, whole body in frame, one delivery per clip — then send us the
        clip if it still reads short.
      </>
    ),
  },
  {
    q: 'Can we get every coach in the academy on one account?',
    a: 'Yes. Coaches get their own sign-in and share a squad, so a bowler filmed by one coach can be reviewed by another. Tell us how many coaches and age groups you run and we will set it up with you.',
  },
  {
    q: 'Do you run sessions with clubs?',
    a: 'We do. A short session on filming and reading the results usually gets a squad self-sufficient in an evening. Pick “Sales & academies” above and mention your ground.',
  },
  {
    q: 'I would rather just try it before I ask anything',
    a: (
      <>
        Sensible. Film one delivery and see what comes back —{' '}
        <Link to="/app" className="font-semibold text-pitch underline underline-offset-4">
          open CricLab
        </Link>{' '}
        and upload it. The questions get sharper once you have a report in front of you.
      </>
    ),
  },
  {
    q: 'Where do I find pricing?',
    a: (
      <>
        On the{' '}
        <Link to="/pricing" className="font-semibold text-pitch underline underline-offset-4">
          pricing page
        </Link>
        . If none of the plans match how your squad trains, say so in a message and we
        will talk it through.
      </>
    ),
  },
]

const AFTER_SEND = [
  {
    title: 'It lands in one inbox',
    body: 'Every note arrives in the same place and is read by the people who build CricLab. No ticket number, no call centre, no being passed sideways.',
  },
  {
    title: 'A cricket person answers',
    body: 'Your reply comes from someone who has stood at a ground in the drizzle waiting for the covers to come off, so you can talk in overs and sessions rather than in forms.',
  },
  {
    title: 'If there is a clip, we watch it',
    body: 'Attach the delivery you are asking about. We will watch the footage before we answer and tell you plainly what we would have filmed differently.',
  },
]

type Errors = {
  name?: string
  email?: string
  subject?: string
  message?: string
}

export function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState(false)

  function validate(): Errors {
    const next: Errors = {}
    if (!name.trim()) next.name = 'Tell us who is writing.'
    if (!email.trim()) next.email = 'We need an address to reply to.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = 'That address does not look right.'
    if (!subject) next.subject = 'Pick the closest subject.'
    if (!message.trim()) next.message = 'Add a line or two so we can answer properly.'
    else if (message.trim().length < 15) next.message = 'A little more detail helps us reply usefully.'
    return next
  }

  // Presentation only: nothing leaves the page. Submitting simply switches the
  // card over to the acknowledgement state.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) return
    setSent(true)
  }

  function reset() {
    setName('')
    setEmail('')
    setSubject('')
    setMessage('')
    setErrors({})
    setSent(false)
  }

  const chosenSubject = SUBJECTS.find((s) => s.value === subject)?.label ?? 'General'

  return (
    <MarketingLayout title="Contact">
      <PageHero
        plate="stadium"
        eyebrow="Contact"
        title={
          <>
            Talk to the people who
            <br className="hidden sm:block" />{' '}
            <span className="text-gradient-lime">build CricLab</span>
          </>
        }
        lead="Coaches, players, academies, clubs and county programmes — whatever the question, it lands with a small team that watches a lot of cricket."
      >
        <div className="flex flex-wrap gap-2 pt-1">
          <Chip tone="lime">Replies within one working day</Chip>
          <Chip>No call centre</Chip>
          <Chip>Clips welcome</Chip>
        </div>
      </PageHero>

      {/* ===================== FORM + DETAILS ===================== */}
      <Section tone="warm" className="py-20 sm:py-28">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            {/* --- Form --- */}
            <Reveal>
              <div className="rounded-[var(--radius-card)] border border-pitch/10 bg-white p-6 shadow-xl shadow-pitch/5 sm:p-8">
                {sent ? (
                  <div className="flex flex-col items-start gap-5 py-6">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-pitch text-2xl font-bold text-lime">
                      ✓
                    </span>
                    <h2 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
                      Message noted — thank you
                    </h2>
                    <p className="max-w-md text-sm leading-relaxed text-ink/65">
                      Thanks, {name.split(' ')[0] || 'there'}. Your note about{' '}
                      <span className="font-semibold text-ink">{chosenSubject.toLowerCase()}</span>{' '}
                      is with us and we will come back to{' '}
                      <span className="font-semibold text-ink">{email}</span> within one working
                      day. If it is faster to show than tell, have a clip ready when we reply.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-1">
                      <Button to="/app" variant="light">
                        Open CricLab
                        <span aria-hidden>→</span>
                      </Button>
                      <button
                        type="button"
                        onClick={reset}
                        className="rounded-full border border-pitch/20 px-6 py-3 text-sm font-semibold text-pitch transition hover:border-pitch/45 hover:bg-pitch/5"
                      >
                        Send another message
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-2 pb-6">
                      <Eyebrow tone="light">Send a message</Eyebrow>
                      <h2 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
                        Tell us what you are trying to work out
                      </h2>
                      <p className="text-sm leading-relaxed text-ink/60">
                        The more specific the question — a bowler, a session, a squad — the
                        more useful the answer.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                          <label
                            htmlFor="contact-name"
                            className="text-xs font-bold uppercase tracking-[0.14em] text-ink/50"
                          >
                            Name
                          </label>
                          <input
                            id="contact-name"
                            name="name"
                            className="field"
                            placeholder="Sam Fielding"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            aria-invalid={Boolean(errors.name)}
                            aria-describedby={errors.name ? 'contact-name-error' : undefined}
                          />
                          {errors.name ? (
                            <span id="contact-name-error" className="text-xs font-medium text-ball">
                              {errors.name}
                            </span>
                          ) : null}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label
                            htmlFor="contact-email"
                            className="text-xs font-bold uppercase tracking-[0.14em] text-ink/50"
                          >
                            Email
                          </label>
                          <input
                            id="contact-email"
                            name="email"
                            type="email"
                            className="field"
                            placeholder="you@club.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            aria-invalid={Boolean(errors.email)}
                            aria-describedby={errors.email ? 'contact-email-error' : undefined}
                          />
                          {errors.email ? (
                            <span id="contact-email-error" className="text-xs font-medium text-ball">
                              {errors.email}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="contact-subject"
                          className="text-xs font-bold uppercase tracking-[0.14em] text-ink/50"
                        >
                          Subject
                        </label>
                        <select
                          id="contact-subject"
                          name="subject"
                          className="field"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          aria-invalid={Boolean(errors.subject)}
                          aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
                        >
                          <option value="">Choose a subject…</option>
                          {SUBJECTS.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                        {errors.subject ? (
                          <span id="contact-subject-error" className="text-xs font-medium text-ball">
                            {errors.subject}
                          </span>
                        ) : null}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="contact-message"
                          className="text-xs font-bold uppercase tracking-[0.14em] text-ink/50"
                        >
                          Message
                        </label>
                        <textarea
                          id="contact-message"
                          name="message"
                          rows={6}
                          className="field resize-y"
                          placeholder="Twelve seamers in the age-group squad, filming after Tuesday nets — what would you set up?"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          aria-invalid={Boolean(errors.message)}
                          aria-describedby={errors.message ? 'contact-message-error' : undefined}
                        />
                        {errors.message ? (
                          <span id="contact-message-error" className="text-xs font-medium text-ball">
                            {errors.message}
                          </span>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 pt-1">
                        <Button type="submit" variant="light" size="lg">
                          Send message
                          <span aria-hidden>→</span>
                        </Button>
                        <p className="text-xs leading-relaxed text-ink/45">
                          By sending, you agree to our{' '}
                          <Link
                            to="/privacy"
                            className="font-semibold text-pitch underline underline-offset-4"
                          >
                            privacy policy
                          </Link>
                          .
                        </p>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </Reveal>

            {/* --- Details panel --- */}
            <Reveal delay={140}>
              <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-stadium p-6 text-chalk sm:p-8">
                <Backdrop plate="stadium" scrim="dark" parallax={0.05} />
                <StadiumAtmosphere />
                <div className="relative flex flex-col gap-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <Eyebrow>Direct lines</Eyebrow>
                      <h2 className="font-display text-2xl font-extrabold leading-tight">
                        Or skip the form
                      </h2>
                    </div>
                    <SeamBall size={58} className="hidden shrink-0 animate-bob sm:block" />
                  </div>

                  {DETAILS.map((d, i) => (
                    <Reveal key={d.tag} delay={i * 80}>
                      <TiltCard>
                        <Card className="ring-glow flex flex-col gap-2.5 p-5">
                          <Chip tone="lime">{d.tag}</Chip>
                          <h3 className="font-display text-lg font-bold text-chalk">{d.title}</h3>
                          <p className="text-sm leading-relaxed text-chalk/60">{d.body}</p>
                          <p className="border-t border-white/10 pt-3 text-xs font-semibold text-lime/80">
                            {d.foot}
                          </p>
                        </Card>
                      </TiltCard>
                    </Reveal>
                  ))}

                  <Reveal delay={260}>
                    <p className="text-xs leading-relaxed text-chalk/45">
                      Filming question? The{' '}
                      <Link to="/record" className="font-semibold text-lime hover:text-chalk">
                        filming guide
                      </Link>{' '}
                      answers most of them in a minute flat.
                    </p>
                  </Reveal>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ===================== WHAT HAPPENS NEXT ===================== */}
      <Section tone="mid" className="py-20 sm:py-28">
        <Backdrop plate="stadium" scrim="dark-soft" parallax={0.12} />
        <div
          className="pointer-events-none absolute -left-28 top-8 h-72 w-72 animate-glow-breathe rounded-full bg-lime/10 blur-[120px]"
          aria-hidden
        />
        <Container className="relative">
          <SectionHeading
            tone="dark"
            eyebrow="After you press send"
            title={<WordReveal text="What happens next" />}
            lead="No auto-acknowledgement that says nothing. Here is the whole of it, in order."
          />

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {AFTER_SEND.map((a, i) => (
              <Reveal key={a.title} delay={i * 90}>
                <TiltCard className="h-full">
                  <Card className="ring-glow flex h-full flex-col gap-3.5 p-6 sm:p-7">
                    <span
                      className="animate-pop-in grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-lime/40 bg-lime/10 font-display text-sm font-extrabold text-lime"
                      style={{ animationDelay: `${i * 90}ms` }}
                    >
                      {i + 1}
                    </span>
                    <h3 className="font-display text-lg font-bold text-chalk">{a.title}</h3>
                    <p className="text-sm leading-relaxed text-chalk/60">{a.body}</p>
                  </Card>
                </TiltCard>
              </Reveal>
            ))}
          </div>

          <Reveal delay={280} className="mt-10 text-center">
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-chalk/55">
              Monday to Friday, within one working day. Anything sent over a weekend of club
              cricket is picked up first thing Monday.
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* ===================== HELP ===================== */}
      <Section tone="light" className="py-20 sm:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="flex flex-col gap-6">
              <SectionHeading
                align="left"
                eyebrow="Before you write"
                title="The five things we get asked most"
                lead="If one of these is your question, you have your answer in ten seconds instead of a day."
                className="max-w-none"
              />
              <Reveal delay={120}>
                <div className="flex flex-wrap gap-3">
                  <Button to="/faq" variant="light">
                    Full FAQ
                  </Button>
                  <Link
                    to="/resources"
                    className="inline-flex items-center px-2 py-3 text-sm font-semibold text-pitch transition hover:text-ink"
                  >
                    Coaching resources →
                  </Link>
                </div>
              </Reveal>
            </div>

            <Accordion items={HELP} />
          </div>
        </Container>
      </Section>

      {/* ===================== ASK US ABOUT ===================== */}
      <Section tone="night" className="border-y border-white/8 py-4">
        <Backdrop plate="bokeh" scrim="dark" parallax={0.06} />
        <div className="relative">
          <Marquee
            items={[
              'Squad and academy accounts',
              'Winter nets programmes',
              'Filming a left-armer',
              'Age-group reporting',
              'Coach sign-ins',
              'A clip that read short',
              'Club coaching sessions',
              'County pathway squads',
              'School programmes',
              'Match-day questions',
            ].map((t) => (
              <span
                key={t}
                className="whitespace-nowrap text-xs font-bold uppercase tracking-[0.2em] text-chalk/45"
              >
                {t}
              </span>
            ))}
          />
        </div>
      </Section>

      <SectionSeam />

      {/* ===================== CTA ===================== */}
      <Section tone="pitch" className="py-20 sm:py-24">
        <Backdrop plate="turf" scrim="dark-soft" parallax={0.08} />
        <Container className="relative">
          <Reveal>
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-3">
                <h2 className="font-display text-2xl font-extrabold leading-tight text-chalk sm:text-3xl">
                  Nothing beats a clip on the table
                </h2>
                <p className="max-w-xl text-sm leading-relaxed text-chalk/65 sm:text-base">
                  Film one delivery before you write to us and the conversation starts with
                  something real in front of both of us.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button to="/app" size="lg">
                  Start Analyzing
                  <span aria-hidden>→</span>
                </Button>
                <Button to="/record" variant="secondary" size="lg">
                  Filming guide
                </Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </MarketingLayout>
  )
}
