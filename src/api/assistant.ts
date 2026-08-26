/**
 * The CricLab assistant.
 *
 * Conversation history is held in the component and sent with each question —
 * nothing is stored server-side, so a refresh starts a clean conversation.
 */
import { authFetch, hasSession, publicFetch } from './auth'

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

export const assistant = {
  starters: () => publicFetch<{ starters: string[] }>('/assistant/starters'),

  ask: (question: string, history: ChatTurn[] = []) => {
    const body = JSON.stringify({ question, history: history.slice(-6) })
    // Signed in, the assistant can greet by name and gets a larger allowance;
    // signed out it still answers, which is the point.
    return hasSession()
      ? authFetch<AssistantReply>('/assistant/ask', { method: 'POST', body })
      : publicFetch<AssistantReply>('/assistant/ask', { method: 'POST', body })
  },
}
