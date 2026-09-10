/**
 * Notification centre.
 *
 * Polls only the unread *count* on a timer — a cheap counted-index hit — and
 * fetches the list itself only when the panel is opened. Polling the full list
 * every 45 seconds would move a lot of rows nobody is looking at.
 *
 * Polling pauses while the tab is hidden, so a backgrounded tab costs nothing.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { notifications as api, type Notification } from '../../api/auth'

const POLL_MS = 45_000

const KIND_STYLE: Record<string, { dot: string; label: string }> = {
  account: { dot: 'bg-lime', label: 'Account' },
  security: { dot: 'bg-warn', label: 'Security' },
  support: { dot: 'bg-seam', label: 'Support' },
  coaching: { dot: 'bg-ok', label: 'Coaching' },
  analysis: { dot: 'bg-lime', label: 'Analysis' },
  system: { dot: 'bg-white/40', label: 'CricLab' },
}

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const secs = Math.max(0, (Date.now() - then) / 1000)
  if (secs < 60) return 'just now'
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  if (secs < 86_400) return `${Math.floor(secs / 3600)}h ago`
  if (secs < 604_800) return `${Math.floor(secs / 86_400)}d ago`
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

export function NotificationBell() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const [items, setItems] = useState<Notification[] | null>(null)
  const [listError, setListError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)

  const pollCount = useCallback(async () => {
    if (document.hidden) return
    try {
      const { unread: n } = await api.unreadCount()
      setUnread(n)
    } catch {
      /* a dropped poll is not worth surfacing */
    }
  }, [])

  useEffect(() => {
    pollCount()
    const id = setInterval(pollCount, POLL_MS)
    // Catch up immediately when the tab comes back rather than waiting a cycle.
    document.addEventListener('visibilitychange', pollCount)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', pollCount)
    }
  }, [pollCount])

  const load = useCallback(async () => {
    setBusy(true)
    try {
      const r = await api.list({ limit: 15 })
      setItems(r.items)
      setUnread(r.unread)
      setListError(null)
    } catch (err) {
      setItems([])
      setListError(err instanceof Error ? err.message : 'Could not load notifications')
    } finally {
      setBusy(false)
    }
  }, [])

  useEffect(() => {
    if (open) load()
  }, [open, load])

  // Close on outside click and on Escape.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const openItem = async (n: Notification) => {
    if (!n.read) {
      // Optimistic: the badge should not lag the click.
      setItems((prev) => prev?.map((x) => (x.id === n.id ? { ...x, read: true } : x)) ?? prev)
      setUnread((u) => Math.max(0, u - 1))
      api.markRead(n.id).catch(() => undefined)
    }
    setOpen(false)
    if (n.link) navigate(n.link)
  }

  const markAll = async () => {
    setItems((prev) => prev?.map((x) => ({ ...x, read: true })) ?? prev)
    setUnread(0)
    try {
      await api.markAllRead()
    } catch {
      load()
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-expanded={open}
        className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/12 bg-white/5 text-chalk/70 transition hover:border-lime/40 hover:text-chalk"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" strokeLinecap="round" />
        </svg>
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 grid min-w-[18px] place-items-center rounded-full bg-lime px-1 text-[10px] font-extrabold text-night">
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-50 w-[min(92vw,22rem)] overflow-hidden rounded-2xl border border-white/12 bg-charcoal shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
            <span className="text-sm font-bold text-chalk">Notifications</span>
            {unread > 0 ? (
              <button
                type="button"
                onClick={markAll}
                className="text-[11px] font-semibold text-lime transition hover:text-chalk"
              >
                Mark all read
              </button>
            ) : null}
          </div>

          <div className="scroll-slim max-h-[60vh] overflow-y-auto">
            {busy && !items ? (
              <div className="flex flex-col gap-2 p-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="animate-pulse rounded-xl bg-white/5 p-3">
                    <div className="h-3 w-1/3 rounded bg-white/10" />
                    <div className="mt-2 h-2.5 w-4/5 rounded bg-white/8" />
                  </div>
                ))}
              </div>
            ) : listError ? (
              <p role="alert" className="px-6 py-8 text-center text-sm text-bad">{listError}</p>
            ) : items && items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-white/5 text-lg">🏏</span>
                <p className="text-sm font-semibold text-chalk">Nothing yet</p>
                <p className="text-xs leading-relaxed text-chalk/50">
                  Bookings, ticket replies, clip start times and account activity will land here.
                </p>
              </div>
            ) : (
              (items ?? []).map((n) => {
                const style = KIND_STYLE[n.kind] ?? KIND_STYLE.system
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => openItem(n)}
                    className={`flex w-full gap-3 border-b border-white/6 px-4 py-3.5 text-left transition hover:bg-white/[0.04] ${
                      n.read ? '' : 'bg-lime/[0.04]'
                    }`}
                  >
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-white/15' : style.dot}`} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className={`truncate text-sm ${n.read ? 'font-medium text-chalk/70' : 'font-bold text-chalk'}`}>
                          {n.title}
                        </span>
                        <span className="shrink-0 text-[10px] text-chalk/35">{timeAgo(n.created_at)}</span>
                      </span>
                      {n.body ? (
                        <span className="mt-0.5 block text-xs leading-relaxed text-chalk/50">{n.body}</span>
                      ) : null}
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
