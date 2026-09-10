/**
 * The CricLab assistant, as a floating popover.
 *
 * Present on every page, marketing and workspace alike, because the question
 * "how do I film this?" arrives well before anyone signs up.
 *
 * The conversation lives in this component and is sent with each question.
 * Nothing is stored, so closing the tab ends it — which is the right default
 * for something people type half-formed questions into.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { assistant, type AssistantSource, type ChatTurn } from '../../api/assistant'
import { Markdown } from './Markdown'
import { isWorkspacePathHidden } from '../../config/nav'

type Message = ChatTurn & {
  id: number
  sources?: AssistantSource[]
  escalate?: boolean
  failed?: boolean
  /** Still receiving deltas — suppresses the "From:" footer until settled. */
  streaming?: boolean
}

const GREETING =
  'Ask me anything about using CricLab — filming a clip that reads well, what a number in your report means, your account, or booking a session.'

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-0.5" aria-label="Thinking">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-lime"
          style={{ animationDelay: `${i * 160}ms`, animationDuration: '0.9s' }}
        />
      ))}
    </span>
  )
}

let nextId = 1

export function AssistantWidget() {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [starters, setStarters] = useState<string[]>([])
  const [draft, setDraft] = useState('')
  const [thinking, setThinking] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  // Starters are fetched once, the first time the panel is opened — a visitor
  // who never opens it should not pay for the request.
  useEffect(() => {
    if (!open || starters.length) return
    assistant.starters().then((r) => setStarters(r.starters)).catch(() => setStarters([]))
  }, [open, starters.length])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, thinking])

  // Close on Escape, and on a navigation — the panel floating over a new page
  // the person just chose is in the way.
  useEffect(() => setOpen(false), [location.pathname])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const ask = useCallback(
    async (question: string) => {
      const text = question.trim()
      if (!text || thinking) return
      const history: ChatTurn[] = messages.map((m) => ({ role: m.role, content: m.content }))

      // Ids are minted *outside* the setState updater. Putting `nextId++` (or
      // "create the bubble on first delta") inside the updater is impure —
      // React Strict Mode runs updaters twice in development, the second pass
      // sees the mutated flag and returns the previous state, and the
      // assistant message never lands. That is why greetings (one fast delta)
      // showed the user's bubble and nothing else.
      const userId = nextId++
      const assistantId = nextId++
      setMessages((prev) => [
        ...prev,
        { id: userId, role: 'user', content: text },
        { id: assistantId, role: 'assistant', content: '', streaming: true },
      ])
      setDraft('')
      setThinking(true)

      let meta: { sources?: AssistantSource[]; escalate?: boolean } = {}
      const patchAssistant = (patch: Partial<Message>) => {
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, ...patch } : m)))
      }

      try {
        await assistant.askStream(text, history, {
          onMeta: (m) => {
            meta = { sources: m.sources, escalate: m.escalate }
          },
          onDelta: (delta) => {
            setThinking(false)
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + delta, streaming: true } : m,
              ),
            )
          },
          onRedacted: (answer) => {
            setThinking(false)
            patchAssistant({ content: answer, sources: meta.sources, streaming: false })
          },
        })
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  streaming: false,
                  sources: meta.sources,
                  escalate: meta.escalate,
                  failed: !m.content.trim(),
                  content:
                    m.content.trim() ||
                    'I could not answer that just now. Try again in a moment.',
                }
              : m,
          ),
        )
      } catch (err) {
        patchAssistant({
          content:
            err instanceof Error && err.message
              ? err.message
              : 'I could not answer that just now. Try again in a moment.',
          failed: true,
          streaming: false,
        })
      } finally {
        setThinking(false)
      }
    },
    [messages, thinking],
  )

  // The admin panel is a third surface — the assistant belongs to the product
  // the player uses, not the staff tools sitting next to it.
  if (location.pathname.startsWith('/admin')) return null

  return (
    <>
      {/* ---------------- Launcher ----------------
          A speech bubble with three dots — the shape people already read as
          "chat", not a sparkle that reads as a generic AI button. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close the CricLab AI Assistant' : 'Open the CricLab AI Assistant'}
        aria-expanded={open}
        className={`fixed right-5 z-[60] grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-lime to-lime-deep text-night shadow-xl shadow-black/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-lime/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime/60 focus-visible:ring-offset-2 focus-visible:ring-offset-night active:scale-95 max-lg:bottom-[calc(5.25rem+env(safe-area-inset-bottom))] lg:bottom-5 ${
          open ? 'scale-95' : ''
        }`}
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-6 w-6">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden>
            <path
              d="M4.5 6.5A3.5 3.5 0 0 1 8 3h8a3.5 3.5 0 0 1 3.5 3.5v6.2A3.5 3.5 0 0 1 16 16.2h-3.15L8.2 20.4a.7.7 0 0 1-1.15-.53v-3.67A3.5 3.5 0 0 1 4.5 12.7V6.5Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <circle cx="9" cy="9.6" r="1.15" fill="currentColor" />
            <circle cx="12" cy="9.6" r="1.15" fill="currentColor" />
            <circle cx="15" cy="9.6" r="1.15" fill="currentColor" />
          </svg>
        )}
      </button>

      {/* ---------------- Panel ---------------- */}
      {open ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="CricLab assistant"
          className="animate-rise fixed z-[60] flex flex-col overflow-hidden border border-white/12 bg-charcoal shadow-2xl shadow-black/60 max-lg:inset-0 max-lg:max-h-none max-lg:w-full max-lg:rounded-none max-lg:pt-[env(safe-area-inset-top)] max-lg:pb-[env(safe-area-inset-bottom)] lg:bottom-24 lg:right-5 lg:max-h-[min(34rem,calc(100vh-8rem))] lg:w-[min(94vw,24rem)] lg:rounded-3xl"
        >
          <header className="flex items-center gap-3 border-b border-white/8 px-5 py-4">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-lime to-lime-deep">
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                <circle cx="12" cy="12" r="9" fill="#05090a" />
                <path d="M6 6.5 Q12 12 6 17.5" fill="none" stroke="#b6f24a" strokeWidth="1.7" strokeLinecap="round" />
                <path d="M18 6.5 Q12 12 18 17.5" fill="none" stroke="#b6f24a" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-bold text-chalk">CricLab assistant</p>
              <p className="text-[10px] text-chalk/40">Answers from the CricLab guide</p>
            </div>
            {messages.length > 0 ? (
              <button
                type="button"
                onClick={() => setMessages([])}
                title="Clear conversation"
                aria-label="Clear conversation"
                className="shrink-0 rounded-lg p-1.5 text-chalk/35 transition hover:bg-white/5 hover:text-chalk/70"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-.7 12a2 2 0 0 1-2 1.8H9.7a2 2 0 0 1-2-1.8L7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : null}
          </header>

          <div className="scroll-slim flex-1 overflow-y-auto px-5 py-4">
            {messages.length === 0 ? (
              <div className="flex flex-col gap-4">
                <p className="text-sm leading-relaxed text-chalk/60">{GREETING}</p>
                <div className="flex flex-col gap-2">
                  {starters.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => ask(s)}
                      className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-left text-[13px] text-chalk/75 transition hover:border-lime/40 hover:text-chalk"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {messages.map((m) => (
                  <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : ''}>
                    <div
                      className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-lime/15 text-chalk'
                          : m.failed
                            ? 'border border-bad/25 bg-bad/8 text-chalk/80'
                            : 'border border-white/10 bg-white/[0.04] text-chalk/85'
                      }`}
                    >
                      {m.role === 'assistant' ? (
                        m.content ? (
                          <Markdown text={m.content} />
                        ) : m.streaming ? (
                          <TypingDots />
                        ) : null
                      ) : (
                        <p className="whitespace-pre-wrap break-words">{m.content}</p>
                      )}
                      {m.escalate && !m.streaming && !isWorkspacePathHidden('/app/support') ? (
                        <Link
                          to="/app/support"
                          className="mt-2 inline-block text-[11px] font-semibold text-lime hover:underline"
                        >
                          Open a support ticket →
                        </Link>
                      ) : null}
                      {m.sources?.length && !m.streaming ? (
                        <p className="mt-2 border-t border-white/8 pt-2 text-[10px] text-chalk/35">
                          From: {m.sources.map((s) => s.title).join(' · ')}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              ask(draft)
            }}
            className="flex items-end gap-2 border-t border-white/8 px-4 py-3"
          >
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                // Enter sends; Shift+Enter is a newline, as people expect.
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  ask(draft)
                }
              }}
              rows={1}
              maxLength={800}
              placeholder="Ask about CricLab…"
              className="max-h-24 min-h-[2.75rem] flex-1 resize-none rounded-xl border border-white/12 bg-white/5 px-3.5 py-2.5 text-base text-chalk placeholder:text-chalk/30 focus:border-lime/45 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!draft.trim() || thinking}
              aria-label="Send"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-lime text-night transition hover:bg-lime-deep disabled:opacity-35"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4.5 w-4.5">
                <path d="M4 12h15m0 0-5-5m5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </div>
      ) : null}
    </>
  )
}
