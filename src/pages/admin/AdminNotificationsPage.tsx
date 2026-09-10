import { useEffect, useState } from 'react'
import { admin, type AdminUserRow, type Broadcast } from '../../api/admin'
import { useConfirm } from '../../components/site/ConfirmDialog'
import { Button, Card, Chip, Reveal } from '../../components/site/ui'
import { useToast } from '../../components/site/Toast'

function when(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AdminNotificationsPage() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [audience, setAudience] = useState<'all' | 'selected'>('all')
  const [search, setSearch] = useState('')
  const [hits, setHits] = useState<AdminUserRow[]>([])
  const [selected, setSelected] = useState<AdminUserRow[]>([])
  const [history, setHistory] = useState<Broadcast[] | null>(null)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const confirm = useConfirm()
  const toast = useToast()

  const loadHistory = () => {
    admin
      .broadcastHistory()
      .then((r) => {
        setHistory(r.items)
        setHistoryError(null)
      })
      .catch((err) => {
        setHistory([])
        setHistoryError(err instanceof Error ? err.message : 'Could not load the broadcast history')
      })
  }

  useEffect(() => {
    loadHistory()
  }, [])

  useEffect(() => {
    if (audience !== 'selected' || search.trim().length < 2) {
      setHits([])
      return
    }
    const handle = window.setTimeout(() => {
      admin
        .users({ search: search.trim(), page: 1, pageSize: 8 })
        .then((r) => {
          setHits(r.items.filter((u) => !selected.some((s) => s.id === u.id)))
          setSearchError(null)
        })
        .catch((err) => {
          setHits([])
          setSearchError(err instanceof Error ? err.message : 'Could not search users')
        })
    }, 250)
    return () => window.clearTimeout(handle)
  }, [search, audience, selected])

  const send = async () => {
    const t = title.trim()
    const b = body.trim()
    if (!t || !b || busy) return
    if (audience === 'selected' && selected.length === 0) {
      toast.push('Pick at least one recipient, or send to everyone.', 'error')
      return
    }
    const ok = await confirm({
      title: audience === 'all' ? 'Send to every account?' : `Send to ${selected.length} people?`,
      body:
        audience === 'all'
          ? 'This notification will appear for every signed-up user.'
          : `Only ${selected.map((u) => u.name).join(', ')} will see this.`,
      confirmLabel: 'Send notification',
    })
    if (!ok) return
    setBusy(true)
    try {
      const result = await admin.broadcast(
        t,
        b,
        audience === 'selected' ? selected.map((u) => u.id) : undefined,
      )
      toast.push(`Sent to ${result.sent} ${result.sent === 1 ? 'person' : 'people'}.`, 'ok')
      setTitle('')
      setBody('')
      setSelected([])
      setSearch('')
      loadHistory()
    } catch (err) {
      toast.push(err instanceof Error ? err.message : 'Could not send that notification', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <h1 className="font-display text-3xl font-extrabold text-chalk">Notifications</h1>
        <p className="pt-1.5 text-sm text-chalk/55">Broadcast a message into every matching inbox.</p>
      </Reveal>

      <Reveal delay={40}>
        <Card tone="dark" interactive={false} className="p-6">
          <label className="block text-xs font-semibold text-chalk/55">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={140}
              className="field field-dark mt-1.5 w-full"
              placeholder="Something landed in their inbox"
            />
          </label>
          <label className="mt-4 block text-xs font-semibold text-chalk/55">
            Body
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={400}
              rows={4}
              className="field field-dark mt-1.5 w-full"
              placeholder="Keep it short — this is a notification, not an email."
            />
          </label>
          <p className="pt-1 text-right text-[11px] text-chalk/35">{body.length}/400</p>

          <div className="flex flex-wrap gap-1.5 pt-2">
            {(['all', 'selected'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setAudience(key)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                  audience === key
                    ? 'border-lime/50 bg-lime/15 text-lime'
                    : 'border-white/10 bg-white/[0.03] text-chalk/60 hover:text-chalk'
                }`}
              >
                {key === 'all' ? 'Everyone' : 'Selected people'}
              </button>
            ))}
          </div>

          {audience === 'selected' ? (
            <div className="pt-4">
              {selected.length ? (
                <div className="flex flex-wrap gap-2 pb-3">
                  {selected.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setSelected((prev) => prev.filter((s) => s.id !== u.id))}
                      className="rounded-full border border-lime/30 bg-lime/10 px-2.5 py-1 text-[11px] font-semibold text-lime"
                    >
                      {u.name} ×
                    </button>
                  ))}
                </div>
              ) : null}
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email…"
                className="field field-dark max-w-sm"
              />
              {searchError ? (
                <p role="alert" className="pt-2 text-xs text-bad">{searchError}</p>
              ) : null}
              {hits.length ? (
                <ul className="mt-2 overflow-hidden rounded-xl border border-white/10">
                  {hits.map((u) => (
                    <li key={u.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelected((prev) => [...prev, u])
                          setSearch('')
                          setHits([])
                        }}
                        className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm hover:bg-white/5"
                      >
                        <span className="font-semibold text-chalk">{u.name}</span>
                        <span className="text-xs text-chalk/40">{u.email}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <div className="pt-5">
            <Button disabled={!title.trim() || !body.trim() || busy} onClick={send}>
              Send notification
            </Button>
          </div>
        </Card>
      </Reveal>

      <Reveal delay={80}>
        <h2 className="pb-3 text-xs font-bold uppercase tracking-[0.18em] text-chalk/45">History</h2>
        <Card tone="dark" interactive={false} className="overflow-hidden p-0">
          {history === null ? (
            <div className="h-24 animate-pulse bg-white/5" />
          ) : historyError ? (
            <p role="alert" className="px-5 py-8 text-center text-sm text-bad">{historyError}</p>
          ) : history.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-chalk/40">Nothing sent yet.</p>
          ) : (
            <ul>
              {history.map((b) => (
                <li key={b.id} className="border-b border-white/6 px-5 py-4 last:border-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-chalk">{b.title}</p>
                    <Chip tone={b.audience === 'all' ? 'lime' : 'neutral'}>
                      {b.audience === 'all' ? 'Everyone' : 'Selected'}
                    </Chip>
                    <span className="text-xs text-chalk/40">{b.recipient_count} received</span>
                  </div>
                  <p className="pt-1 text-sm text-chalk/60">{b.body}</p>
                  <p className="pt-1.5 text-[11px] text-chalk/35">{when(b.created_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </Reveal>
    </div>
  )
}
