import { useCallback, useEffect, useState } from 'react'
import { admin, type TicketMetrics } from '../../api/admin'
import {
  STATUS_LABEL,
  STATUS_TONE,
  support,
  type StaffTicket,
  type TicketMessage,
  type TicketStatus,
} from '../../api/support'
import { Button, Card, Chip, Reveal } from '../../components/site/ui'
import { useToast } from '../../components/site/Toast'

const QUEUE_FILTERS = [
  { key: 'live', label: 'Live' },
  { key: 'awaiting_support', label: 'Needs reply' },
  { key: 'awaiting_user', label: 'Waiting on player' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' },
  { key: 'all', label: 'All' },
]

function when(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <Card tone="dark" interactive={false} className="p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-chalk/40">{label}</p>
      <p className="font-display pt-1.5 text-3xl font-extrabold text-chalk">{value}</p>
      {sub ? <p className="pt-1 text-[11px] text-chalk/40">{sub}</p> : null}
    </Card>
  )
}

function Thread({
  id,
  onClose,
  onChanged,
}: {
  id: string
  onClose: () => void
  onChanged: () => void
}) {
  const [ticket, setTicket] = useState<StaffTicket | null>(null)
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const toast = useToast()

  const load = useCallback(() => {
    support
      .queueRead(id)
      .then((r) => {
        setTicket(r.ticket)
        setMessages(r.messages)
      })
      .catch(() => {
        setTicket(null)
        setMessages([])
      })
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const reply = async (resolve: boolean) => {
    const body = draft.trim()
    if (!body || busy) return
    setBusy(true)
    try {
      await support.queueReply(id, body, resolve)
      setDraft('')
      toast.push(resolve ? 'Replied and marked resolved.' : 'Reply sent.', 'ok')
      load()
      onChanged()
    } catch (err) {
      toast.push(err instanceof Error ? err.message : 'Could not send that reply', 'error')
    } finally {
      setBusy(false)
    }
  }

  const setStatus = async (status: TicketStatus) => {
    setBusy(true)
    try {
      await support.queueSetStatus(id, status)
      toast.push(`Marked ${STATUS_LABEL[status].toLowerCase()}.`, 'ok')
      load()
      onChanged()
    } catch (err) {
      toast.push(err instanceof Error ? err.message : 'Could not update that ticket', 'error')
    } finally {
      setBusy(false)
    }
  }

  if (!ticket) {
    return (
      <Card tone="dark" interactive={false} className="p-6">
        <div className="h-40 animate-pulse rounded-xl bg-white/5" />
      </Card>
    )
  }

  return (
    <Card tone="dark" interactive={false} className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-chalk">{ticket.subject}</h2>
          <p className="text-sm text-chalk/55">
            {ticket.user.name} · {ticket.user.email}
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Chip tone={STATUS_TONE[ticket.status]}>{STATUS_LABEL[ticket.status]}</Chip>
            <Chip tone="neutral">{ticket.category}</Chip>
            <Chip tone={ticket.priority === 'urgent' || ticket.priority === 'high' ? 'warn' : 'neutral'}>
              {ticket.priority}
            </Chip>
          </div>
        </div>
        <button type="button" onClick={onClose} className="text-xs font-semibold text-chalk/45 hover:text-chalk">
          Close
        </button>
      </div>

      <div className="mt-5 flex max-h-80 flex-col gap-3 overflow-y-auto scroll-slim">
        {messages.map((m) => {
          const staff = m.author_role !== 'user'
          return (
            <div key={m.id} className={`flex ${staff ? '' : 'justify-end'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  staff
                    ? 'border border-lime/20 bg-lime/[0.07] text-chalk'
                    : 'bg-white/[0.06] text-chalk/85'
                }`}
              >
                <p className="pb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-chalk/40">
                  {m.author_name || (staff ? 'Support' : 'Player')}
                </p>
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className="pt-1.5 text-[10px] text-chalk/35">{when(m.created_at)}</p>
              </div>
            </div>
          )
        })}
      </div>

      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={4}
        maxLength={8000}
        placeholder="Reply as CricLab Support…"
        className="field field-dark mt-5 w-full"
      />
      <div className="flex flex-wrap items-center gap-2 pt-3">
        <Button size="sm" disabled={!draft.trim() || busy} onClick={() => reply(false)}>
          Send reply
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={!draft.trim() || busy}
          onClick={() => reply(true)}
        >
          Reply and resolve
        </Button>
        {ticket.status !== 'resolved' && ticket.status !== 'closed' ? (
          <Button size="sm" variant="ghost" disabled={busy} onClick={() => setStatus('resolved')}>
            Resolve
          </Button>
        ) : null}
        {ticket.status !== 'closed' ? (
          <Button size="sm" variant="ghost" disabled={busy} onClick={() => setStatus('closed')}>
            Close ticket
          </Button>
        ) : null}
      </div>
    </Card>
  )
}

export function AdminTicketsPage() {
  const [metrics, setMetrics] = useState<TicketMetrics | null>(null)
  const [items, setItems] = useState<StaffTicket[] | null>(null)
  const [filter, setFilter] = useState('live')
  const [selected, setSelected] = useState<string | null>(null)

  const loadQueue = useCallback(() => {
    const opts =
      filter === 'live'
        ? { liveOnly: true }
        : filter === 'all'
          ? { liveOnly: false }
          : { status: filter, liveOnly: false }
    support
      .queue(opts)
      .then((r) => setItems(r.items))
      .catch(() => setItems([]))
  }, [filter])

  useEffect(() => {
    admin
      .ticketMetrics()
      .then(setMetrics)
      .catch(() => setMetrics({ counts: {}, avg_resolution_hours: null }))
  }, [])

  useEffect(() => {
    loadQueue()
  }, [loadQueue])

  const open =
    (metrics?.counts.open ?? 0) +
    (metrics?.counts.awaiting_support ?? 0) +
    (metrics?.counts.awaiting_user ?? 0)

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <h1 className="font-display text-3xl font-extrabold text-chalk">Support</h1>
        <p className="pt-1.5 text-sm text-chalk/55">Tickets across every account.</p>
      </Reveal>

      <Reveal delay={40}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Live" value={open} />
          <StatCard label="Needs reply" value={metrics?.counts.awaiting_support ?? 0} />
          <StatCard label="Resolved" value={metrics?.counts.resolved ?? 0} />
          <StatCard
            label="Avg. resolution"
            value={metrics?.avg_resolution_hours != null ? `${metrics.avg_resolution_hours}h` : '—'}
            sub="Last 100 resolved"
          />
        </div>
      </Reveal>

      {selected ? (
        <Reveal>
          <Thread
            id={selected}
            onClose={() => setSelected(null)}
            onChanged={() => {
              loadQueue()
              admin.ticketMetrics().then(setMetrics).catch(() => undefined)
            }}
          />
        </Reveal>
      ) : null}

      <Reveal delay={80}>
        <div className="flex flex-wrap gap-1.5 pb-3">
          {QUEUE_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                filter === f.key
                  ? 'border-lime/50 bg-lime/15 text-lime'
                  : 'border-white/10 bg-white/[0.03] text-chalk/60 hover:text-chalk'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Card tone="dark" interactive={false} className="overflow-hidden p-0">
          <div className="scroll-slim overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/8 text-[11px] uppercase tracking-[0.1em] text-chalk/40">
                  <th className="px-5 py-3 font-semibold">Subject</th>
                  <th className="px-5 py-3 font-semibold">Player</th>
                  <th className="px-5 py-3 font-semibold">Updated</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {items === null ? (
                  [0, 1, 2].map((i) => (
                    <tr key={i}>
                      <td colSpan={4} className="px-5 py-3">
                        <div className="h-8 animate-pulse rounded-lg bg-white/5" />
                      </td>
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-chalk/40">
                      No tickets in this queue.
                    </td>
                  </tr>
                ) : (
                  items.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => setSelected(t.id)}
                      className="cursor-pointer border-b border-white/6 transition hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-3">
                        <p className="font-semibold text-chalk">
                          {t.unread_for_staff ? (
                            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-lime" />
                          ) : null}
                          {t.subject}
                        </p>
                        <p className="truncate text-xs text-chalk/40">{t.preview}</p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-chalk/70">{t.user.name}</p>
                        <p className="text-xs text-chalk/40">{t.user.email}</p>
                      </td>
                      <td className="px-5 py-3 text-chalk/60">{when(t.updated_at)}</td>
                      <td className="px-5 py-3">
                        <Chip tone={STATUS_TONE[t.status]}>{STATUS_LABEL[t.status]}</Chip>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </Reveal>
    </div>
  )
}
