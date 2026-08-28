/**
 * The CricLab assistant.
 *
 * Conversation history is held in the component and sent with each question —
 * nothing is stored server-side, so a refresh starts a clean conversation.
 */
import { authFetch, authFetchRaw, hasSession, publicFetch, publicFetchRaw } from './auth'

export type AssistantSource = { title: string; section: string }

export type AssistantReply = {
  answer: string
  sources: AssistantSource[]
  grounded: boolean
  generated?: boolean
  refused?: boolean
  escalate?: boolean
}

export type ChatTurn = { role: 'user' | 'assistant'; content: string }

function clipHistory(history: ChatTurn[]): ChatTurn[] {
  return history.slice(-8).map((turn) => ({
    role: turn.role,
    content: turn.content.slice(0, 600),
  }))
}

// How long to wait for the *next* chunk before treating the stream as
// stalled. Generous — a slow generation is not a stall — but bounded, so a
// connection that silently stopped delivering never leaves the UI waiting
// forever with no error and no answer.
const READ_TIMEOUT_MS = 20_000

/** One line of the streamed response — see `app/assistant/chat.py:answer_stream`. */
type StreamEvent =
  | { type: 'meta'; sources: AssistantSource[]; grounded: boolean; refused?: boolean; escalate?: boolean }
  | { type: 'delta'; text: string }
  | { type: 'redacted'; answer: string }
  | { type: 'done' }

export type StreamHandlers = {
  onMeta?: (meta: Omit<Extract<StreamEvent, { type: 'meta' }>, 'type'>) => void
  onDelta?: (text: string) => void
  /** A leak check failed mid-stream; `answer` replaces whatever was shown so far. */
  onRedacted?: (answer: string) => void
}

export const assistant = {
  starters: () => publicFetch<{ starters: string[] }>('/assistant/starters'),

  ask: (question: string, history: ChatTurn[] = []) => {
    const body = JSON.stringify({ question, history: clipHistory(history) })
    // Signed in, the assistant can greet by name and gets a larger allowance;
    // signed out it still answers, which is the point.
    return hasSession()
      ? authFetch<AssistantReply>('/assistant/ask', { method: 'POST', body })
      : publicFetch<AssistantReply>('/assistant/ask', { method: 'POST', body })
  },

  /**
   * Streamed answer: `handlers` fire as each line of the response arrives, so
   * the caller can render text as it is generated instead of waiting for the
   * whole thing. Falls back to the non-streaming `ask` on any failure —
   * a network hiccup mid-stream should not be a dead end, and the caller
   * does not have to implement that fallback itself.
   */
  askStream: async (question: string, history: ChatTurn[], handlers: StreamHandlers): Promise<void> => {
    const body = JSON.stringify({ question, history: clipHistory(history) })
    let response: Response
    try {
      response = hasSession()
        ? await authFetchRaw('/assistant/ask/stream', { method: 'POST', body })
        : await publicFetchRaw('/assistant/ask/stream', { method: 'POST', body })
    } catch {
      return assistant._fallback(question, history, handlers)
    }
    if (!response.ok || !response.body) {
      return assistant._fallback(question, history, handlers)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let sawAnything = false
    const dispatch = (line: string) => {
      assistant._dispatch(line, handlers, () => {
        sawAnything = true
      })
    }

    try {
      for (;;) {
        // A dev-proxy (or any intermediary that buffers a chunked response)
        // can leave a read pending forever after delivering only the first
        // chunk — observed in practice, not a hypothetical. Racing each read
        // against a timeout turns that into a graceful stop instead of a
        // conversation that hangs with a spinner showing forever.
        const outcome = await Promise.race([
          reader.read().then((r) => ({ timedOut: false as const, ...r })),
          new Promise<{ timedOut: true }>((resolve) => setTimeout(() => resolve({ timedOut: true }), READ_TIMEOUT_MS)),
        ])
        if (outcome.timedOut) {
          void reader.cancel().catch(() => undefined)
          break
        }
        if (outcome.done) break
        buffer += decoder.decode(outcome.value, { stream: true })
        let newlineAt: number
        while ((newlineAt = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineAt).trim()
          buffer = buffer.slice(newlineAt + 1)
          if (line) dispatch(line)
        }
      }
      if (buffer.trim()) dispatch(buffer.trim())
    } catch {
      // A connection drop mid-stream: fall back only if nothing useful ever
      // arrived. Partway through a good answer, cutting to a fresh non-stream
      // call would restart the whole thing and likely double it up.
    }

    // Nothing ever came through — a hard error, a stall on the very first
    // read, or a connection that closed before the first byte — so the
    // caller has shown nothing yet and a fallback is still a clean recovery
    // rather than a visible restart. Once *something* has streamed, a later
    // stall (no closing `done`) just ends the turn with whatever arrived
    // rather than risk duplicating it via a fresh non-stream call.
    if (!sawAnything) return assistant._fallback(question, history, handlers)
  },

  _dispatch: (line: string, handlers: StreamHandlers, onContent?: () => void) => {
    let event: StreamEvent
    try {
      event = JSON.parse(line)
    } catch {
      return
    }
    if (event.type === 'meta') handlers.onMeta?.(event)
    else if (event.type === 'delta') {
      onContent?.()
      handlers.onDelta?.(event.text)
    } else if (event.type === 'redacted') {
      onContent?.()
      handlers.onRedacted?.(event.answer)
    }
  },

  _fallback: async (question: string, history: ChatTurn[], handlers: StreamHandlers): Promise<void> => {
    try {
      const reply = await assistant.ask(question, history)
      handlers.onMeta?.({ sources: reply.sources, grounded: reply.grounded, refused: reply.refused, escalate: reply.escalate })
      handlers.onDelta?.(reply.answer)
    } catch (err) {
      throw err instanceof Error ? err : new Error('I could not answer that just now. Try again in a moment.')
    }
  },
}
