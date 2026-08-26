/**
 * Coaching sessions.
 *
 * Browsing coaches and their calendars is open to anyone, so those two calls go
 * out unauthenticated; anything that holds a slot needs a session.
 */
import { authFetch, publicFetch } from './auth'

export type SessionType = {
  id: string
  label: string
  minutes: number
  description: string
}

export type Coach = {
  id: string
  slug: string
  name: string
  title: string
  headline: string
  specialities: string[]
  languages: string[]
  accent: string
  initials: string
  timezone: string
  session_types: SessionType[]
  bio?: string
  cancel_window_hours?: number
}

export type AvailabilityDay = { date: string; weekday: string; slots: string[] }

export type Availability = {
  session: SessionType
  timezone: string
  days: AvailabilityDay[]
}

export type Booking = {
  id: string
  coach: { id: string; name: string; slug: string }
  session_type: string
  session_label: string
  minutes: number
  starts_at: string
  ends_at: string
  timezone: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  focus: string
  notes: string
  delivery_ref: string | null
  created_at: string
  cancel_reason: string | null
  can_cancel: boolean
  can_reschedule: boolean
  cancel_window_hours: number
}

export const coaching = {
  coaches: () => publicFetch<{ items: Coach[] }>('/coaching/coaches'),

  coach: (slug: string) => publicFetch<{ coach: Coach }>(`/coaching/coaches/${slug}`),

  availability: (slug: string, sessionType?: string, days = 21) => {
    const q = new URLSearchParams({ days: String(days) })
    if (sessionType) q.set('session_type', sessionType)
    return publicFetch<Availability>(`/coaching/coaches/${slug}/availability?${q}`)
  },

  bookings: (upcoming?: boolean) => {
    const qs = upcoming === undefined ? '' : `?upcoming=${upcoming}`
    return authFetch<{ items: Booking[] }>(`/coaching/bookings${qs}`)
  },

  book: (payload: {
    coach: string
    starts_at: string
    session_type: string
    focus?: string
    notes?: string
    delivery_ref?: string
  }) =>
    authFetch<{ booking: Booking }>('/coaching/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  cancel: (id: string, reason = '') =>
    authFetch<{ booking: Booking }>(`/coaching/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  reschedule: (id: string, starts_at: string) =>
    authFetch<{ booking: Booking }>(`/coaching/bookings/${id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify({ starts_at }),
    }),
}

/**
 * Slots come back as instants. They are rendered in the coach's timezone, not
 * the viewer's — a coach in Karachi offering "17:00" should read as 17:00 to
 * them, with the label making the zone explicit for everyone else.
 */
export function inZone(iso: string, timezone: string, opts: Intl.DateTimeFormatOptions = {}) {
  return new Date(iso).toLocaleString(undefined, { timeZone: timezone, ...opts })
}

export function slotTime(iso: string, timezone: string) {
  return inZone(iso, timezone, { hour: '2-digit', minute: '2-digit' })
}

export function slotDay(iso: string, timezone: string) {
  return inZone(iso, timezone, { weekday: 'short', day: 'numeric', month: 'short' })
}

/** The same instant as the viewer's own clock reads it — shown alongside. */
export function localHint(iso: string, timezone: string) {
  const local = new Date(iso).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit' })
  const there = slotTime(iso, timezone)
  return local === there ? '' : `${local} your time`
}
