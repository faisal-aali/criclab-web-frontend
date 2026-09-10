import { useCallback, useEffect, useState } from 'react'
import { admin, type AdminBookingRow } from '../../api/admin'
import { coaching, type Coach } from '../../api/coaching'
import { Card, Chip, Reveal } from '../../components/site/ui'

const BOOKING_FILTERS = [
  { key: '', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

function when(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function bookingTone(status: string): 'ok' | 'warn' | 'bad' | 'neutral' | 'lime' {
  if (status === 'completed') return 'ok'
  if (status === 'cancelled') return 'bad'
  if (status === 'confirmed') return 'lime'
  if (status === 'pending') return 'warn'
  return 'neutral'
}

export function AdminCoachingPage() {
  const [items, setItems] = useState<AdminBookingRow[] | null>(null)
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [coaches, setCoaches] = useState<(Coach & { active: boolean })[] | null>(null)
  const pageSize = 20

  const load = useCallback(() => {
    admin
      .bookings({ status: status || undefined, page, pageSize })
      .then((r) => {
        setItems(r.items)
        setTotal(r.total)
      })
      .catch(() => setItems([]))
  }, [status, page])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    coaching
      .adminCoaches()
      .then((r) => setCoaches(r.items))
      .catch(() => setCoaches([]))
  }, [])

  const pages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <h1 className="font-display text-3xl font-extrabold text-chalk">Coaching</h1>
        <p className="pt-1.5 text-sm text-chalk/55">{total} sessions across the roster.</p>
      </Reveal>

      <Reveal delay={40}>
        <div className="flex flex-wrap gap-1.5">
          {BOOKING_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => {
                setPage(1)
                setStatus(f.key)
              }}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                status === f.key
                  ? 'border-lime/50 bg-lime/15 text-lime'
                  : 'border-white/10 bg-white/[0.03] text-chalk/60 hover:text-chalk'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Reveal>

      <Reveal delay={80}>
        <Card tone="dark" interactive={false} className="overflow-hidden p-0">
          <div className="scroll-slim overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/8 text-[11px] uppercase tracking-[0.1em] text-chalk/40">
                  <th className="px-5 py-3 font-semibold">Player</th>
                  <th className="px-5 py-3 font-semibold">Coach</th>
                  <th className="px-5 py-3 font-semibold">Session</th>
                  <th className="px-5 py-3 font-semibold">When</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {items === null ? (
                  [0, 1, 2].map((i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-5 py-3">
                        <div className="h-8 animate-pulse rounded-lg bg-white/5" />
                      </td>
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-chalk/40">
                      No sessions match that filter.
                    </td>
                  </tr>
                ) : (
                  items.map((b) => (
                    <tr key={b.id} className="border-b border-white/6">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-chalk">{b.user_name}</p>
                        <p className="text-xs text-chalk/40">{b.user_email}</p>
                      </td>
                      <td className="px-5 py-3 text-chalk/70">{b.coach_name}</td>
                      <td className="px-5 py-3 text-chalk/70">{b.session_label}</td>
                      <td className="px-5 py-3 text-chalk/60">{when(b.starts_at)}</td>
                      <td className="px-5 py-3">
                        <Chip tone={bookingTone(b.status)}>{b.status}</Chip>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-white/8 px-5 py-3 text-xs text-chalk/50">
            <span>
              Page {page} of {pages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-white/10 px-3 py-1.5 font-semibold disabled:opacity-30"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= pages}
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                className="rounded-lg border border-white/10 px-3 py-1.5 font-semibold disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        </Card>
      </Reveal>

      <Reveal delay={120}>
        <h2 className="pb-3 text-xs font-bold uppercase tracking-[0.18em] text-chalk/45">Roster</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {coaches === null ? (
            [0, 1].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/5" />)
          ) : coaches.length === 0 ? (
            <p className="text-sm text-chalk/40">No coaches on the roster yet.</p>
          ) : (
            coaches.map((c) => (
              <Card key={c.id} tone="dark" interactive={false} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-chalk">{c.name}</p>
                    <p className="text-xs text-chalk/45">{c.title}</p>
                  </div>
                  <Chip tone={c.active ? 'ok' : 'neutral'}>{c.active ? 'Active' : 'Inactive'}</Chip>
                </div>
              </Card>
            ))
          )}
        </div>
      </Reveal>
    </div>
  )
}
