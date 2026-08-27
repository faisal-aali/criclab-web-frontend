/**
 * Coaching — pick a coach, pick a slot, and manage what you have booked.
 *
 * Times are rendered in the coach's own timezone with the zone named, and the
 * viewer's local time shown underneath when the two differ. Silently converting
 * to the viewer's clock is how people turn up an hour late.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  coaching,
  localHint,
  slotDay,
  slotTime,
  type Availability,
  type Booking,
  type Coach,
} from '../../api/coaching'
import { useConfirm } from '../../components/site/ConfirmDialog'
import { Button, Card, Chip, Reveal } from '../../components/site/ui'
import { useToast } from '../../components/site/Toast'

const ACCENT: Record<string, string> = {
  lime: 'from-lime to-lime-deep text-night',
  seam: 'from-seam to-seam/70 text-night',
  warm: 'from-warn to-warn/70 text-night',
}

function Avatar({ coach, size = 'md' }: { coach: Coach; size?: 'sm' | 'md' }) {
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-2xl bg-gradient-to-br font-display font-extrabold ${
        ACCENT[coach.accent] ?? ACCENT.lime
      } ${size === 'sm' ? 'h-10 w-10 text-xs' : 'h-14 w-14 text-base'}`}
    >
      {coach.initials}
    </span>
  )
}

function BookingCard({
  booking,
  onChanged,
  onReschedule,
}: {
  booking: Booking
  onChanged: () => void
  onReschedule: (booking: Booking) => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const confirm = useConfirm()
  const toast = useToast()
  const past = booking.status === 'completed'
  const cancelled = booking.status === 'cancelled'
  const hint = localHint(booking.starts_at, booking.timezone)

  return (
    <Card tone="dark" interactive={false} className={`p-5 ${cancelled || past ? 'opacity-60' : ''}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-bold text-chalk">{booking.coach.name}</span>
            {cancelled ? <Chip tone="neutral">Cancelled</Chip> : null}
            {past ? <Chip tone="neutral">Done</Chip> : null}
            {!cancelled && !past ? <Chip tone="ok">Confirmed</Chip> : null}
          </div>
          <p className="pt-1 text-sm text-chalk/70">
            {slotDay(booking.starts_at, booking.timezone)} ·{' '}
            {slotTime(booking.starts_at, booking.timezone)} · {booking.minutes} min
          </p>
          {hint ? <p className="pt-0.5 text-[11px] text-chalk/35">{hint}</p> : null}
          <p className="pt-1.5 text-[11px] text-chalk/40">
            {booking.session_label}
            {booking.focus ? ` · ${booking.focus}` : ''}
          </p>
          {booking.cancel_reason ? (
            <p className="pt-1 text-[11px] text-chalk/35">{booking.cancel_reason}</p>
          ) : null}
        </div>

        {booking.can_cancel ? (
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex gap-2">
              {booking.can_reschedule ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onReschedule(booking)}
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-chalk/70 transition hover:border-lime/45 hover:text-lime disabled:opacity-50"
                >
                  Reschedule
                </button>
              ) : null}
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  const ok = await confirm({
                    title: 'Cancel this session?',
                    body: `Your ${slotTime(booking.starts_at, booking.timezone)} session with ${booking.coach.name} on ${slotDay(booking.starts_at, booking.timezone)} will be cancelled. The slot goes back on their calendar.`,
                    confirmLabel: 'Cancel session',
                    cancelLabel: 'Keep it',
                    tone: 'danger',
                  })
                  if (!ok) return
                  setBusy(true)
                  setError('')
                  try {
                    await coaching.cancel(booking.id)
                    toast.push('Session cancelled.', 'ok')
                    onChanged()
                  } catch (err) {
                    const message = err instanceof Error ? err.message : 'Could not cancel'
                    setError(message)
                    toast.push(message, 'error')
                  } finally {
                    setBusy(false)
                  }
                }}
                className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-chalk/70 transition hover:border-bad/50 hover:text-bad disabled:opacity-50"
              >
                {busy ? 'Cancelling…' : 'Cancel'}
              </button>
            </div>
            <span className="text-[10px] text-chalk/30">
              Free up to {booking.cancel_window_hours}h before
            </span>
          </div>
        ) : !cancelled && !past ? (
          <span className="text-[10px] text-chalk/30">
            Inside the {booking.cancel_window_hours}h window —{' '}
            <Link to="/app/support" className="text-lime hover:underline">
              ask support
            </Link>
          </span>
        ) : null}
      </div>
      {error ? <p className="pt-3 text-xs text-bad">{error}</p> : null}
    </Card>
  )
}

function BookingPanel({
  coach,
  reschedule,
  onBooked,
  onClose,
}: {
  coach: Coach
  /** Present when moving an existing session rather than creating a new one. */
  reschedule?: Booking
  onBooked: () => void
  onClose: () => void
}) {
  const [sessionType, setSessionType] = useState(
    reschedule?.session_type ?? coach.session_types[0]?.id ?? '',
  )
  const [availability, setAvailability] = useState<Availability | null>(null)
  const [loading, setLoading] = useState(true)
  const [slot, setSlot] = useState<string | null>(null)
  const [focus, setFocus] = useState('')
  const [busy, setBusy] = useState(false)
  const toast = useToast()
  const [error, setError] = useState('')

  const loadSlots = useCallback(async () => {
    setLoading(true)
    setSlot(null)
    try {
      setAvailability(await coaching.availability(coach.slug, sessionType))
    } catch {
      setAvailability(null)
    } finally {
      setLoading(false)
    }
  }, [coach.slug, sessionType])

  useEffect(() => {
    loadSlots()
  }, [loadSlots])

  const book = async () => {
    if (!slot || busy) return
    setBusy(true)
    setError('')
    try {
      if (reschedule) {
        await coaching.reschedule(reschedule.id, slot)
        toast.push('Session moved — the new time is confirmed.', 'ok')
      } else {
        await coaching.book({
          coach: coach.slug,
          starts_at: slot,
          session_type: sessionType,
          focus: focus.trim(),
        })
        toast.push(`Booked with ${coach.name} — check your email for the confirmation.`, 'ok')
      }
      onBooked()
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : reschedule
            ? 'Could not move to that time'
            : 'That slot could not be booked'
      setError(message)
      toast.push(message, 'error')
      // The calendar has moved on — reload it rather than leaving a stale grid.
      loadSlots()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card tone="dark" interactive={false} className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar coach={coach} />
          <div>
            <h2 className="font-display text-xl font-bold text-chalk">
              {reschedule ? `Move your session with ${coach.name}` : coach.name}
            </h2>
            <p className="text-sm text-chalk/55">
              {reschedule
                ? `Was ${slotDay(reschedule.starts_at, reschedule.timezone)}, ${slotTime(reschedule.starts_at, reschedule.timezone)}`
                : coach.title}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-xs font-semibold text-chalk/45 transition hover:text-chalk"
        >
          Close
        </button>
      </div>

      <div className="flex flex-col gap-5 pt-6">
        {reschedule ? null : (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-chalk/55">
              Kind of session
            </span>
            <div className="flex flex-wrap gap-2">
              {coach.session_types.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSessionType(s.id)}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    sessionType === s.id
                      ? 'border-lime/50 bg-lime/10'
                      : 'border-white/12 bg-white/[0.03] hover:border-white/25'
                  }`}
                >
                  <span className="block text-sm font-semibold text-chalk">{s.label}</span>
                  <span className="block text-[11px] text-chalk/45">{s.minutes} minutes</span>
                  <span className="block max-w-[15rem] pt-1 text-[11px] leading-relaxed text-chalk/40">
                    {s.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-chalk/55">
              Pick a time
            </span>
            <span className="text-[11px] text-chalk/35">
              Times shown in {availability?.timezone ?? coach.timezone}
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />
              ))}
            </div>
          ) : !availability?.days.length ? (
            <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-5 text-sm text-chalk/50">
              Nothing free in the next three weeks. Try a shorter session, or open a support ticket
              and we will find you a time.
            </p>
          ) : (
            <div className="scroll-slim flex max-h-80 flex-col gap-4 overflow-y-auto pr-1">
              {availability.days.map((day) => (
                <div key={day.date}>
                  <p className="pb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-chalk/40">
                    {slotDay(day.slots[0], availability.timezone)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {day.slots.map((iso) => (
                      <button
                        key={iso}
                        type="button"
                        onClick={() => setSlot(iso)}
                        className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                          slot === iso
                            ? 'border-lime bg-lime text-night'
                            : 'border-white/12 bg-white/[0.03] text-chalk/75 hover:border-lime/40 hover:text-chalk'
                        }`}
                      >
                        {slotTime(iso, availability.timezone)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {slot ? (
            <p className="text-[11px] text-chalk/40">
              {localHint(slot, availability?.timezone ?? coach.timezone) || 'Same as your local time'}
            </p>
          ) : null}
        </div>

        {reschedule ? null : (
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-chalk/55">
              What do you want to work on <span className="text-chalk/30">(optional)</span>
            </span>
            <input
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              maxLength={200}
              placeholder="Release is drifting when I go for pace"
              className="field field-dark"
            />
          </label>
        )}

        {error ? (
          <div role="alert" className="rounded-xl border border-bad/30 bg-bad/10 px-4 py-2.5 text-sm text-bad">
            {error}
          </div>
        ) : null}

        <div>
          <Button onClick={book} disabled={!slot || busy}>
            {busy
              ? reschedule
                ? 'Moving…'
                : 'Booking…'
              : slot
                ? `${reschedule ? 'Move to' : 'Book'} ${slotTime(slot, availability?.timezone ?? coach.timezone)}`
                : 'Pick a time'}
          </Button>
        </div>
      </div>
    </Card>
  )
}

export function CoachingPage() {
  const [coaches, setCoaches] = useState<Coach[] | null>(null)
  const [bookings, setBookings] = useState<Booking[] | null>(null)
  const [selected, setSelected] = useState<Coach | null>(null)
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const [reschedulingBooking, setReschedulingBooking] = useState<Booking | null>(null)
  const toast = useToast()

  const startReschedule = useCallback(
    async (booking: Booking) => {
      try {
        const { coach } = await coaching.coach(booking.coach.slug)
        setReschedulingBooking(booking)
        setSelected(coach)
      } catch {
        toast.push('Could not load that coach right now — try again.', 'error')
      }
    },
    [toast],
  )

  const loadBookings = useCallback(async () => {
    try {
      const r = await coaching.bookings(tab === 'upcoming')
      setBookings(r.items)
    } catch {
      setBookings([])
    }
  }, [tab])

  useEffect(() => {
    coaching.coaches().then((r) => setCoaches(r.items)).catch(() => setCoaches([]))
  }, [])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  const upcomingCount = useMemo(
    () => (tab === 'upcoming' ? (bookings?.length ?? 0) : 0),
    [bookings, tab],
  )

  return (
    <div className="flex flex-col gap-8">
      <Reveal>
        <h1 className="font-display text-3xl font-extrabold text-chalk">Coaching</h1>
        <p className="pt-1.5 max-w-xl text-sm leading-relaxed text-chalk/55">
          Sit down with a coach and go through your footage properly. Upload a clip first if you
          can — a session with something to look at is worth several without.
        </p>
      </Reveal>

      {selected ? (
        <Reveal>
          <BookingPanel
            coach={selected}
            reschedule={reschedulingBooking ?? undefined}
            onClose={() => {
              setSelected(null)
              setReschedulingBooking(null)
            }}
            onBooked={() => {
              setSelected(null)
              setReschedulingBooking(null)
              setTab('upcoming')
              loadBookings()
            }}
          />
        </Reveal>
      ) : (
        <Reveal delay={60}>
          <h2 className="pb-3 text-xs font-bold uppercase tracking-[0.18em] text-chalk/45">
            Who you can book
          </h2>
          {coaches === null ? (
            <div className="grid gap-4 md:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-56 animate-pulse rounded-2xl bg-white/5" />
              ))}
            </div>
          ) : coaches.length === 0 ? (
            <Card tone="dark" interactive={false} className="p-8 text-center text-sm text-chalk/50">
              No coaches are taking sessions right now. Check back shortly.
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {coaches.map((coach) => (
                <Card key={coach.id} tone="dark" className="flex flex-col gap-4 p-5">
                  <div className="flex items-center gap-3.5">
                    <Avatar coach={coach} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate font-display text-base font-bold text-chalk">
                        {coach.name}
                      </p>
                      <p className="truncate text-[11px] text-chalk/45">{coach.title}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-chalk/60">{coach.headline}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {coach.specialities.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-chalk/55"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                    <span className="text-[10px] text-chalk/30">
                      {coach.languages.join(' · ')}
                    </span>
                    <Button size="sm" onClick={() => setSelected(coach)}>
                      See times
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Reveal>
      )}

      <Reveal delay={120}>
        <div className="flex items-center justify-between gap-4 pb-3">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-chalk/45">
            Your sessions {upcomingCount ? `(${upcomingCount})` : ''}
          </h2>
          <div className="flex gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
            {(['upcoming', 'past'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-md px-3 py-1.5 text-[11px] font-semibold capitalize transition ${
                  tab === t ? 'bg-lime/15 text-lime' : 'text-chalk/50 hover:text-chalk'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {bookings === null ? (
          <div className="flex flex-col gap-2.5">
            {[0, 1].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <Card tone="dark" interactive={false} className="p-8 text-center">
            <p className="text-sm text-chalk/50">
              {tab === 'upcoming'
                ? 'Nothing booked. Pick a coach above and find a time that suits.'
                : 'No past sessions yet.'}
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {bookings.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                onChanged={loadBookings}
                onReschedule={startReschedule}
              />
            ))}
          </div>
        )}
      </Reveal>
    </div>
  )
}
