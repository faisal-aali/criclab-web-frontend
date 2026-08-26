/**
 * Support — the list of your tickets, and the form for opening a new one.
 *
 * The form is inline rather than on its own route: opening a ticket is a small
 * act and pushing someone through a page transition for it makes it feel
 * heavier than it is.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  STATUS_LABEL,
  STATUS_TONE,
  support,
  type SupportMeta,
  type Ticket,
} from '../../api/support'
import { Button, Card, Chip, Reveal } from '../../components/site/ui'

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

function FilePills({ files, onRemove }: { files: File[]; onRemove: (i: number) => void }) {
  if (!files.length) return null
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {files.map((file, i) => (
        <span
          key={`${file.name}-${i}`}
          className="flex items-center gap-2 rounded-lg border border-white/12 bg-white/5 px-2.5 py-1 text-[11px] text-chalk/70"
        >
          <span className="max-w-[10rem] truncate">{file.name}</span>
          <span className="text-chalk/35">{Math.round(file.size / 1024)}kB</span>
          <button
            type="button"
            onClick={() => onRemove(i)}
            aria-label={`Remove ${file.name}`}
            className="text-chalk/40 transition hover:text-bad"
          >
            ✕
          </button>
        </span>
      ))}
    </div>
  )
}

function NewTicketForm({
  meta,
  onCreated,
  onCancel,
}: {
  meta: SupportMeta | null
  onCreated: (ticket: Ticket) => void
  onCancel: () => void
}) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('analysis')
  const [priority, setPriority] = useState('normal')
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const fileInput = useRef<HTMLInputElement | null>(null)

  const maxFiles = meta?.max_attachments ?? 4
  const maxMb = meta?.max_attachment_mb ?? 12

  const addFiles = (list: FileList | null) => {
    if (!list) return
    const incoming = Array.from(list)
    const oversized = incoming.find((f) => f.size > maxMb * 1024 * 1024)
    if (oversized) {
      // Caught here as well as on the server, so the person is not made to wait
      // for an upload that was always going to be refused.
      setError(`${oversized.name} is larger than ${maxMb}MB.`)
      return
    }
    setError('')
    setFiles((prev) => [...prev, ...incoming].slice(0, maxFiles))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const { ticket } = await support.create(
        { subject: subject.trim(), body: body.trim(), category, priority },
        files,
      )
      onCreated(ticket)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That did not go through')
    } finally {
      setBusy(false)
    }
  }

  const ready = subject.trim().length >= 3 && body.trim().length >= 10

  return (
    <Card tone="dark" interactive={false} className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-chalk">Open a ticket</h2>
          <p className="pt-1 text-sm text-chalk/55">
            The more you tell us up front, the fewer questions come back.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="shrink-0 text-xs font-semibold text-chalk/45 transition hover:text-chalk"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4 pt-5">
        {error ? (
          <div role="alert" className="rounded-xl border border-bad/30 bg-bad/10 px-4 py-2.5 text-sm text-bad">
            {error}
          </div>
        ) : null}

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-chalk/55">Subject</span>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={140}
            placeholder="Ball not tracked on a night clip"
            className="field field-dark"
            required
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-chalk/55">
              What is it about
            </span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="field field-dark"
            >
              {(meta?.categories ?? []).map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-chalk/55">
              How urgent
            </span>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="field field-dark"
            >
              {(meta?.priorities ?? []).map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-chalk/55">
            What happened
          </span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            maxLength={8000}
            placeholder="What you expected, what you saw instead, and the reference of the delivery if it is about one."
            className="field field-dark resize-y"
            required
          />
          <span className="text-[11px] text-chalk/35">{body.length}/8000</span>
        </label>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={files.length >= maxFiles}
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-chalk/70 transition hover:border-lime/40 hover:text-chalk disabled:opacity-40"
            >
              Attach a file
            </button>
            <span className="text-[11px] text-chalk/35">
              Up to {maxFiles} files, {maxMb}MB each — screenshots, PDFs or a short clip.
            </span>
          </div>
          <input
            ref={fileInput}
            type="file"
            multiple
            hidden
            accept={(meta?.accepted_types ?? []).join(',')}
            onChange={(e) => {
              addFiles(e.target.files)
              e.target.value = ''
            }}
          />
          <FilePills files={files} onRemove={(i) => setFiles((p) => p.filter((_, j) => j !== i))} />
        </div>

        <div>
          <Button type="submit" disabled={busy || !ready}>
            {busy ? 'Sending…' : 'Open ticket'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

function TicketRow({ ticket }: { ticket: Ticket }) {
  return (
    <Link
      to={`/app/support/${ticket.id}`}
      className="group flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 transition hover:border-lime/35 hover:bg-white/[0.05]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {ticket.unread_for_user > 0 ? (
            <span className="h-2 w-2 shrink-0 rounded-full bg-lime" aria-label="Unread reply" />
          ) : null}
          <span className="truncate font-semibold text-chalk group-hover:text-lime">
            {ticket.subject}
          </span>
        </div>
        <Chip tone={STATUS_TONE[ticket.status]}>{STATUS_LABEL[ticket.status]}</Chip>
      </div>
      <p className="line-clamp-2 text-sm leading-relaxed text-chalk/50">{ticket.preview}</p>
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-chalk/35">
        <span className="font-mono">{ticket.id}</span>
        <span>·</span>
        <span>
          {ticket.message_count} {ticket.message_count === 1 ? 'message' : 'messages'}
        </span>
        <span>·</span>
        <span>Updated {timeAgo(ticket.updated_at)}</span>
      </div>
    </Link>
  )
}

export function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null)
  const [meta, setMeta] = useState<SupportMeta | null>(null)
  const [composing, setComposing] = useState(false)
  const [showClosed, setShowClosed] = useState(false)

  const load = useCallback(async () => {
    try {
      const r = await support.list({ liveOnly: !showClosed })
      setTickets(r.items)
    } catch {
      setTickets([])
    }
  }, [showClosed])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    support.meta().then(setMeta).catch(() => setMeta(null))
  }, [])

  return (
    <div className="flex flex-col gap-7">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-chalk">Support</h1>
            <p className="pt-1.5 text-sm text-chalk/55">
              Report a problem, ask a question, or tell us something is wrong with a reading.
            </p>
          </div>
          {!composing ? <Button onClick={() => setComposing(true)}>Open a ticket</Button> : null}
        </div>
      </Reveal>

      {composing ? (
        <Reveal>
          <NewTicketForm
            meta={meta}
            onCancel={() => setComposing(false)}
            onCreated={(ticket) => {
              setComposing(false)
              setTickets((prev) => [ticket, ...(prev ?? [])])
            }}
          />
        </Reveal>
      ) : null}

      <Reveal delay={60}>
        <div className="flex items-center justify-between gap-4 pb-1">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-chalk/45">
            {showClosed ? 'All tickets' : 'Open tickets'}
          </h2>
          <button
            type="button"
            onClick={() => setShowClosed((v) => !v)}
            className="text-[11px] font-semibold text-lime transition hover:text-chalk"
          >
            {showClosed ? 'Show open only' : 'Show resolved and closed'}
          </button>
        </div>

        {tickets === null ? (
          <div className="flex flex-col gap-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <Card tone="dark" interactive={false} className="flex flex-col items-center gap-3 p-10 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/5 text-xl">🎧</span>
            <p className="font-display text-lg font-bold text-chalk">
              {showClosed ? 'Nothing here yet' : 'No open tickets'}
            </p>
            <p className="max-w-sm text-sm leading-relaxed text-chalk/50">
              If something is not reading right, tell us — a clip that came back wrong is the most
              useful thing you can send.
            </p>
            {!composing ? (
              <Button variant="secondary" size="sm" onClick={() => setComposing(true)}>
                Open a ticket
              </Button>
            ) : null}
          </Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {tickets.map((t) => (
              <TicketRow key={t.id} ticket={t} />
            ))}
          </div>
        )}
      </Reveal>
    </div>
  )
}
