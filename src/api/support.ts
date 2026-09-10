/**
 * Support ticketing.
 *
 * Ticket creation and replies go up as multipart because they can carry
 * attachments; everything else is plain JSON. `authFetch` handles the token,
 * the renewal and the error shape, so nothing here repeats that.
 */
import { authFetch, authFetchBlob } from './auth'

export type TicketStatus =
  | 'open'
  | 'awaiting_support'
  | 'awaiting_user'
  | 'resolved'
  | 'closed'

export type Ticket = {
  id: string
  subject: string
  category: string
  priority: string
  status: TicketStatus
  message_count: number
  unread_for_user: number
  created_at: string
  updated_at: string
  last_message_at: string
  resolved_at: string | null
  preview: string
}

export type TicketAttachment = {
  id: string
  name: string
  content_type: string
  size: number
}

export type TicketMessage = {
  id: string
  author_role: 'user' | 'support' | 'system'
  author_name: string
  body: string
  attachments: TicketAttachment[]
  created_at: string
}

export type SupportMeta = {
  categories: { value: string; label: string }[]
  priorities: { value: string; label: string }[]
  max_attachments: number
  max_attachment_mb: number
  accepted_types: string[]
}

/** How each state reads to the person who opened the ticket. */
export const STATUS_LABEL: Record<TicketStatus, string> = {
  open: 'Open',
  awaiting_support: 'With support',
  awaiting_user: 'Needs your reply',
  resolved: 'Resolved',
  closed: 'Closed',
}

export const STATUS_TONE: Record<TicketStatus, 'lime' | 'ok' | 'warn' | 'neutral'> = {
  open: 'lime',
  awaiting_support: 'neutral',
  awaiting_user: 'warn',
  resolved: 'ok',
  closed: 'neutral',
}

/** Staff queue shape — the owner's identity is only present on this path. */
export type StaffTicket = Ticket & {
  user: { id: string; name: string; email: string }
  unread_for_staff: number
}

function form(fields: Record<string, string>, files: File[]): FormData {
  const body = new FormData()
  Object.entries(fields).forEach(([key, value]) => body.append(key, value))
  files.forEach((file) => body.append('files', file))
  return body
}

export const support = {
  meta: () => authFetch<SupportMeta>('/support/meta'),

  list: (opts: { liveOnly?: boolean; status?: string; before?: string } = {}) => {
    const q = new URLSearchParams()
    if (opts.liveOnly) q.set('live_only', 'true')
    if (opts.status) q.set('status', opts.status)
    if (opts.before) q.set('before', opts.before)
    const qs = q.toString()
    return authFetch<{ items: Ticket[]; unread: number; next_cursor: string | null }>(
      `/support/tickets${qs ? `?${qs}` : ''}`,
    )
  },

  create: (
    fields: {
      subject: string
      body: string
      category: string
      priority: string
      context_page?: string
      context_ref?: string
    },
    files: File[] = [],
  ) =>
    authFetch<{ ticket: Ticket }>('/support/tickets', {
      method: 'POST',
      body: form(
        {
          subject: fields.subject,
          body: fields.body,
          category: fields.category,
          priority: fields.priority,
          context_page: fields.context_page ?? '',
          context_ref: fields.context_ref ?? '',
        },
        files,
      ),
    }),

  read: (id: string) =>
    authFetch<{ ticket: Ticket; messages: TicketMessage[] }>(`/support/tickets/${id}`),

  reply: (id: string, body: string, files: File[] = []) =>
    authFetch<{ message: TicketMessage; ticket: Ticket }>(`/support/tickets/${id}/reply`, {
      method: 'POST',
      body: form({ body }, files),
    }),

  setStatus: (id: string, status: 'resolved' | 'awaiting_support') =>
    authFetch<{ ticket: Ticket }>(`/support/tickets/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),

  /**
   * Staff queue. Every call here is gated by `AdminUser` on the backend —
   * the same control as `/admin/*`. Reused from the admin tickets page so
   * there is one queue, not a duplicate list that would drift.
   */
  queue: (opts: { status?: string; liveOnly?: boolean; before?: string } = {}) => {
    const q = new URLSearchParams()
    if (opts.status) q.set('status', opts.status)
    if (opts.liveOnly === false) q.set('live_only', 'false')
    if (opts.before) q.set('before', opts.before)
    const qs = q.toString()
    return authFetch<{ items: StaffTicket[]; counts: Record<string, number>; next_cursor: string | null }>(
      `/support/queue${qs ? `?${qs}` : ''}`,
    )
  },

  queueRead: (id: string) =>
    authFetch<{ ticket: StaffTicket; messages: TicketMessage[]; context: Record<string, string> }>(
      `/support/queue/${id}`,
    ),

  queueReply: (id: string, body: string, resolve = false) =>
    authFetch<{ ticket: StaffTicket }>(`/support/queue/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ body, resolve }),
    }),

  queueSetStatus: (id: string, status: TicketStatus) =>
    authFetch<{ ticket: StaffTicket }>(`/support/queue/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),

  /**
   * Attachments need the bearer token, so they cannot be a plain `<a href>`.
   * Fetched as a blob and handed to a temporary link instead.
   */
  download: async (ticketId: string, attachment: TicketAttachment) => {
    const blob = await authFetchBlob(
      `/support/tickets/${ticketId}/attachments/${attachment.id}`,
    ).catch(() => null)
    if (!blob) return false
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = attachment.name
    link.click()
    URL.revokeObjectURL(url)
    return true
  },
}
