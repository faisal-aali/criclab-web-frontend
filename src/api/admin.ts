/**
 * Admin panel API client.
 *
 * Every call here hits an endpoint gated by `AdminUser` on the backend — see
 * `app/api/admin.py`. Nothing here is a security boundary of its own; if a
 * non-admin somehow reaches one of these calls, the backend refuses it the
 * same way it would refuse a hand-crafted request from outside the app.
 */
import { authFetch } from './auth'

export type DashboardRange = 'today' | '7d' | '30d' | '90d' | 'custom'

export type TrendPoint = { date: string; count: number }

export type DashboardSummary = {
  range: { from: string; to: string }
  users: { total: number; new: number; active: number; inactive: number; disabled: number }
  videos: {
    total: number
    range: number
    today: number
    week: number
    month: number
    failed_range: number
    by_pipeline: { action: number; ball_flight: number }
  }
  coaching: { total: number; upcoming: number; completed: number; cancelled: number }
  support: { open: number; resolved: number }
  signups_trend: TrendPoint[]
  analyses_trend: TrendPoint[]
}

export type AdminUserRow = {
  id: string
  name: string
  email: string
  role: string
  email_verified: boolean
  disabled: boolean
  created_at: string
  last_login_at: string | null
  analysis_count: number
  booking_count: number
  ticket_count: number
}

export type AdminUserDetail = AdminUserRow & {
  recent_analyses: { id: string; pipeline: string; status: string; player_name: string | null; created_at: string }[]
  recent_bookings: { id: string; coach_name: string; status: string; starts_at: string }[]
  recent_tickets: { id: string; subject: string; status: string; updated_at: string }[]
}

export type AdminAnalysisRow = {
  id: string
  pipeline: 'action' | 'ball_flight'
  user_id: string | null
  user: { name: string; email: string } | null
  player_name: string | null
  status: string
  stage: string | null
  progress: number | null
  message: string | null
  created_at: string
  updated_at: string
}

export type AdminBookingRow = {
  id: string
  user_name: string
  user_email: string
  coach_name: string
  session_label: string
  starts_at: string
  status: string
  created_at: string
}

export type Paged<T> = { items: T[]; total: number; page: number; page_size: number }

export type TicketMetrics = {
  counts: Record<string, number>
  avg_resolution_hours: number | null
}

export type Broadcast = {
  id: string
  title: string
  body: string
  audience: 'all' | 'selected'
  recipient_count: number
  created_at: string
}

function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') q.set(k, String(v))
  }
  const s = q.toString()
  return s ? `?${s}` : ''
}

export const admin = {
  dashboard: (range: DashboardRange, dateFrom?: string, dateTo?: string) =>
    authFetch<DashboardSummary>(`/admin/dashboard${qs({ range, date_from: dateFrom, date_to: dateTo })}`),

  users: (opts: { search?: string; status?: string; page?: number; pageSize?: number } = {}) =>
    authFetch<Paged<AdminUserRow>>(
      `/admin/users${qs({ search: opts.search, status: opts.status, page: opts.page, page_size: opts.pageSize })}`,
    ),

  userDetail: (id: string) => authFetch<AdminUserDetail>(`/admin/users/${id}`),

  setUserDisabled: (id: string, disabled: boolean) =>
    authFetch<{ user: AdminUserRow }>(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ disabled }),
    }),

  analyses: (opts: { pipeline?: string; status?: string; search?: string; page?: number; pageSize?: number } = {}) =>
    authFetch<Paged<AdminAnalysisRow>>(
      `/admin/analyses${qs({
        pipeline: opts.pipeline,
        status: opts.status,
        search: opts.search,
        page: opts.page,
        page_size: opts.pageSize,
      })}`,
    ),

  bookings: (opts: { status?: string; page?: number; pageSize?: number } = {}) =>
    authFetch<Paged<AdminBookingRow>>(
      `/admin/bookings${qs({ status: opts.status, page: opts.page, page_size: opts.pageSize })}`,
    ),

  ticketMetrics: () => authFetch<TicketMetrics>('/admin/tickets/metrics'),

  broadcast: (title: string, body: string, userIds?: string[]) =>
    authFetch<{ sent: number; id: string }>('/admin/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify({ title, body, user_ids: userIds ?? null }),
    }),

  broadcastHistory: () => authFetch<{ items: Broadcast[] }>('/admin/notifications/history'),
}
