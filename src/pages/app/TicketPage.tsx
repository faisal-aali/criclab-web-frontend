/**
 * One support ticket, as a conversation.
 *
 * Opening the page is what clears the unread marker — the server does that on
 * read, so the badge in the header and the badge on the list agree without the
 * two ever talking to each other.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  STATUS_LABEL,
  STATUS_TONE,
  support,
  type Ticket,
  type TicketAttachment,
  type TicketMessage,
} from '../../api/support'
import { Button, Card, Chip, Reveal } from '../../components/site/ui'

function when(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function AttachmentChip({
  ticketId,
  attachment,
}: {
  ticketId: string
  attachment: TicketAttachment
}) {
  const [busy, setBusy] = useState(false)
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true)
        await support.download(ticketId, attachment)
        setBusy(false)
      }}
      className="flex items-center gap-2 rounded-lg border border-white/12 bg-white/5 px-2.5 py-1.5 text-[11px] text-chalk/70 transition hover:border-lime/40 hover:text-chalk disabled:opacity-50"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-3.5 w-3.5">
        <path d="M12 3v12m0 0-4-4m4 4 4-4M4 19h16" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="max-w-[11rem] truncate">{attachment.name}</span>
      <span className="text-chalk/35">{Math.round(attachment.size / 1024)}kB</span>
    </button>
  )
}

function Bubble({ message, ticketId }: { message: TicketMessage; ticketId: string }) {
  const mine = message.author_role === 'user'
  return (
    <div className={`flex gap-3 ${mine ? 'flex-row-reverse' : ''}`}>
      <span
        className={`mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[11px] font-extrabold ${
          mine ? 'bg-white/8 text-chalk/70' : 'bg-gradient-to-br from-lime to-lime-deep text-night'
        }`}
        aria-hidden
      >
        {mine ? 'You' : 'CL'}
      </span>
      <div className={`flex min-w-0 max-w-[85%] flex-col gap-1.5 ${mine ? 'items-end' : ''}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            mine
              ? 'bg-white/[0.06] text-chalk/85'
              : 'border border-lime/20 bg-lime/[0.07] text-chalk'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.body}</p>
        </div>
        {message.attachments.length ? (
          <div className={`flex flex-wrap gap-2 ${mine ? 'justify-end' : ''}`}>
            {message.attachments.map((a) => (
              <AttachmentChip key={a.id} ticketId={ticketId} attachment={a} />
            ))}
          </div>
        ) : null}
        <span className="text-[10px] text-chalk/30">
          {mine ? 'You' : message.author_name || 'CricLab Support'} · {when(message.created_at)}
        </span>
      </div>
    </div>
  )
}

export function TicketPage() {
  const { ticketId = '' } = useParams()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [reply, setReply] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const fileInput = useRef<HTMLInputElement | null>(null)
  const bottom = useRef<HTMLDivElement | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await support.read(ticketId)
      setTicket(r.ticket)
      setMessages(r.messages)
    } catch {
      setTicket(null)
    } finally {
      setLoading(false)
    }
  }, [ticketId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    // Land on the newest message, the way any thread should open.
    bottom.current?.scrollIntoView({ block: 'nearest' })
  }, [messages.length])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy || !reply.trim()) return
    setBusy(true)
    setError('')
    try {
      const r = await support.reply(ticketId, reply.trim(), files)
      setMessages((prev) => [...prev, r.message])
      setTicket(r.ticket)
      setReply('')
      setFiles([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That did not send')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <div className="h-20 animate-pulse rounded-2xl bg-white/5" />
        <div className="h-64 animate-pulse rounded-2xl bg-white/5" />
      </div>
    )
  }

  if (!ticket) {
    return (
      <Card tone="dark" interactive={false} className="flex flex-col items-center gap-3 p-10 text-center">
        <p className="font-display text-lg font-bold text-chalk">We could not find that ticket</p>
        <p className="max-w-sm text-sm text-chalk/50">
          It may have been opened on another account, or the reference is wrong.
        </p>
        <Button variant="secondary" size="sm" onClick={() => navigate('/app/support')}>
          Back to support
        </Button>
      </Card>
    )
  }

  const closed = ticket.status === 'closed'

  return (
    <div className="flex flex-col gap-5">
      <Reveal>
        <Link
          to="/app/support"
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-chalk/45 transition hover:text-chalk"
        >
          ← All tickets
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4 pt-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-extrabold text-chalk">{ticket.subject}</h1>
            <p className="pt-1.5 text-[11px] text-chalk/40">
              <span className="font-mono">{ticket.id}</span> · opened {when(ticket.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Chip tone={STATUS_TONE[ticket.status]}>{STATUS_LABEL[ticket.status]}</Chip>
            {ticket.status === 'awaiting_support' || ticket.status === 'open' ? (
              <button
                type="button"
                onClick={async () => {
                  const r = await support.setStatus(ticket.id, 'resolved').catch(() => null)
                  if (r) setTicket(r.ticket)
                }}
                className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-chalk/70 transition hover:border-ok/50 hover:text-ok"
              >
                Mark resolved
              </button>
            ) : null}
          </div>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <Card tone="dark" interactive={false} className="flex flex-col gap-6 p-6">
          {messages.map((m) => (
            <Bubble key={m.id} message={m} ticketId={ticket.id} />
          ))}
          <div ref={bottom} />
        </Card>
      </Reveal>

      <Reveal delay={120}>
        {closed ? (
          <Card tone="dark" interactive={false} className="p-5 text-center">
            <p className="text-sm text-chalk/55">
              This ticket is closed.{' '}
              <Link to="/app/support" className="font-semibold text-lime hover:underline">
                Open a new one
              </Link>{' '}
              and mention {ticket.id} if it is the same problem.
            </p>
          </Card>
        ) : (
          <Card tone="dark" interactive={false} className="p-5">
            <form onSubmit={send} className="flex flex-col gap-3">
              {error ? (
                <div role="alert" className="rounded-xl border border-bad/30 bg-bad/10 px-4 py-2.5 text-sm text-bad">
                  {error}
                </div>
              ) : null}
              {ticket.status === 'resolved' ? (
                <p className="text-[11px] text-chalk/40">
                  Replying reopens this ticket.
                </p>
              ) : null}
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={4}
                maxLength={8000}
                placeholder="Add to the thread…"
                className="field field-dark resize-y"
              />
              {files.length ? (
                <div className="flex flex-wrap gap-2">
                  {files.map((f, i) => (
                    <span
                      key={`${f.name}-${i}`}
                      className="flex items-center gap-2 rounded-lg border border-white/12 bg-white/5 px-2.5 py-1 text-[11px] text-chalk/70"
                    >
                      <span className="max-w-[10rem] truncate">{f.name}</span>
                      <button
                        type="button"
                        onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}
                        aria-label={`Remove ${f.name}`}
                        className="text-chalk/40 transition hover:text-bad"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  disabled={files.length >= 4}
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-chalk/70 transition hover:border-lime/40 hover:text-chalk disabled:opacity-40"
                >
                  Attach a file
                </button>
                <input
                  ref={fileInput}
                  type="file"
                  multiple
                  hidden
                  onChange={(e) => {
                    setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])].slice(0, 4))
                    e.target.value = ''
                  }}
                />
                <Button type="submit" size="sm" disabled={busy || !reply.trim()}>
                  {busy ? 'Sending…' : 'Send reply'}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </Reveal>
    </div>
  )
}
