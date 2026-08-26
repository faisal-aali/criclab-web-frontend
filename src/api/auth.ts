/**
 * Authenticated transport.
 *
 * Everything that needs a signed-in session goes through `authFetch`, which
 * owns three things the rest of the app should never re-implement:
 *
 * 1. **Token storage.** The access token lives in memory; only the refresh
 *    token is persisted. A short-lived token in `localStorage` is the thing an
 *    XSS actually wants, and keeping it out of storage limits that blast radius.
 * 2. **Silent renewal.** A 401 triggers one refresh and one retry. Concurrent
 *    calls share a single in-flight refresh rather than each starting their own
 *    — otherwise the first rotation invalidates the token the others are using.
 * 3. **Session end.** When refresh fails, listeners are told once so the app can
 *    route to sign-in without every caller writing that logic.
 */

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'
const REFRESH_KEY = 'criclab.refresh'

export type AuthUser = {
  id: string
  email: string
  name: string
  role: 'user' | 'admin' | string
  email_verified: boolean
  created_at?: string
  profile?: Record<string, unknown>
  avatar_color?: string
}

export type TokenBundle = {
  access_token: string
  refresh_token: string
  expires_at: string
  expires_in: number
  user: AuthUser
}

/** Thrown by every helper here so callers can show `.message` directly. */
export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

// --------------------------------------------------------------------------
// Token state
// --------------------------------------------------------------------------

let accessToken: string | null = null
let accessExpiry = 0
let refreshInFlight: Promise<string | null> | null = null
const sessionEndedListeners = new Set<() => void>()

export function onSessionEnded(fn: () => void): () => void {
  sessionEndedListeners.add(fn)
  return () => sessionEndedListeners.delete(fn)
}

function endSession() {
  clearTokens()
  sessionEndedListeners.forEach((fn) => fn())
}

export function setTokens(bundle: TokenBundle) {
  accessToken = bundle.access_token
  // Renew a little early so a request never rides an expiring token.
  accessExpiry = Date.now() + Math.max(0, bundle.expires_in - 45) * 1000
  try {
    localStorage.setItem(REFRESH_KEY, bundle.refresh_token)
  } catch {
    /* private mode — the session simply will not survive a reload */
  }
}

export function clearTokens() {
  accessToken = null
  accessExpiry = 0
  try {
    localStorage.removeItem(REFRESH_KEY)
  } catch {
    /* ignore */
  }
}

export function getStoredRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY)
  } catch {
    return null
  }
}

export function hasSession(): boolean {
  return Boolean(accessToken || getStoredRefreshToken())
}

// --------------------------------------------------------------------------
// Core request helpers
// --------------------------------------------------------------------------

async function parse<T>(res: Response): Promise<T> {
  if (res.status === 204) return {} as T
  const text = await res.text()
  let data: unknown = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }
  if (!res.ok) {
    throw new ApiError(extractMessage(data) || res.statusText || 'Something went wrong', res.status)
  }
  return (data ?? {}) as T
}

/** FastAPI reports validation errors as a list under `detail`. */
function extractMessage(data: unknown): string {
  if (!data || typeof data !== 'object') return ''
  const detail = (data as { detail?: unknown }).detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    const first = detail[0] as { msg?: string } | undefined
    if (first?.msg) return first.msg.replace(/^Value error,\s*/, '')
  }
  const message = (data as { message?: unknown }).message
  return typeof message === 'string' ? message : ''
}

/** Unauthenticated call — sign-up, sign-in, password recovery. */
export async function publicFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
  })
  return parse<T>(res)
}

/**
 * Exchange the stored refresh token for a new pair.
 * Concurrent callers await the same promise — see the note at the top.
 */
export async function refreshSession(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight
  const stored = getStoredRefreshToken()
  if (!stored) return null

  refreshInFlight = (async () => {
    try {
      const bundle = await publicFetch<TokenBundle>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: stored }),
      })
      setTokens(bundle)
      return bundle.access_token
    } catch {
      // Refresh token revoked, rotated away, or expired — the session is over.
      endSession()
      return null
    } finally {
      refreshInFlight = null
    }
  })()

  return refreshInFlight
}

/** Authenticated call. Renews the token when needed and retries a 401 once. */
export async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!accessToken || Date.now() >= accessExpiry) {
    await refreshSession()
  }

  const send = (token: string | null) =>
    fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        // FormData carries its own multipart content-type with a boundary the
        // browser generates; overriding it makes the body unparseable.
        ...(init?.body && !(init.body instanceof FormData)
          ? { 'content-type': 'application/json' }
          : {}),
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
    })

  let res = await send(accessToken)
  if (res.status === 401) {
    const renewed = await refreshSession()
    if (!renewed) {
      endSession()
      throw new ApiError('Your session has ended. Sign in again.', 401)
    }
    res = await send(renewed)
    if (res.status === 401) {
      endSession()
      throw new ApiError('Your session has ended. Sign in again.', 401)
    }
  }
  return parse<T>(res)
}

/**
 * Authenticated download.
 *
 * Separate from `authFetch` because that one parses JSON. A file needs the
 * bearer header just as much, so it cannot be a plain `<a href>` either.
 */
export async function authFetchBlob(path: string): Promise<Blob> {
  if (!accessToken || Date.now() >= accessExpiry) {
    await refreshSession()
  }
  const send = (token: string | null) =>
    fetch(`${API_BASE}${path}`, {
      headers: token ? { authorization: `Bearer ${token}` } : {},
    })

  let res = await send(accessToken)
  if (res.status === 401) {
    const renewed = await refreshSession()
    if (!renewed) {
      endSession()
      throw new ApiError('Your session has ended. Sign in again.', 401)
    }
    res = await send(renewed)
  }
  if (!res.ok) throw new ApiError('That file could not be downloaded', res.status)
  return res.blob()
}

// --------------------------------------------------------------------------
// Endpoints
// --------------------------------------------------------------------------

export type PendingVerification = { status: 'pending_verification'; message: string; email: string }
export type SignInResult = ({ status: 'ok' } & TokenBundle) | PendingVerification

export const auth = {
  signUp: (name: string, email: string, password: string) =>
    publicFetch<PendingVerification>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  signIn: (email: string, password: string) =>
    publicFetch<SignInResult>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  verifyEmail: (email: string, code: string) =>
    publicFetch<{ status: string } & TokenBundle>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    }),

  resendOtp: (email: string, purpose: 'verify_email' | 'reset_password' = 'verify_email') =>
    publicFetch<{ status: string; message: string }>('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email, purpose }),
    }),

  forgotPassword: (email: string) =>
    publicFetch<{ status: string; message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (email: string, code: string, password: string) =>
    publicFetch<{ status: string; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, code, password }),
    }),

  changePassword: (current_password: string, new_password: string) =>
    authFetch<{ status: string; sessions_ended: number } & TokenBundle>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password }),
    }),

  me: () => authFetch<{ user: AuthUser }>('/auth/me'),

  updateMe: (patch: { name?: string; profile?: Record<string, unknown> }) =>
    authFetch<{ user: AuthUser }>('/auth/me', { method: 'PATCH', body: JSON.stringify(patch) }),

  sessions: () =>
    authFetch<{ items: { id: string; device: string; created_at: string; last_used_at: string }[] }>(
      '/auth/sessions',
    ),

  endSession: (id: string) => authFetch<{ status: string }>(`/auth/sessions/${id}`, { method: 'DELETE' }),

  signOut: async () => {
    const stored = getStoredRefreshToken()
    if (stored) {
      // Best effort: the local session ends regardless of what the server says.
      try {
        await publicFetch('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: stored }),
        })
      } catch {
        /* ignore */
      }
    }
    clearTokens()
  },

  signOutEverywhere: () => authFetch<{ status: string }>('/auth/logout-all', { method: 'POST' }),
}

// --------------------------------------------------------------------------
// Notifications
// --------------------------------------------------------------------------

export type Notification = {
  id: string
  kind: 'account' | 'security' | 'support' | 'coaching' | 'analysis' | 'system' | string
  title: string
  body: string
  link: string | null
  read: boolean
  created_at: string
}

export const notifications = {
  list: (opts: { limit?: number; before?: string; unreadOnly?: boolean } = {}) => {
    const q = new URLSearchParams()
    if (opts.limit) q.set('limit', String(opts.limit))
    if (opts.before) q.set('before', opts.before)
    if (opts.unreadOnly) q.set('unread_only', 'true')
    const qs = q.toString()
    return authFetch<{ items: Notification[]; unread: number; next_cursor: string | null }>(
      `/notifications${qs ? `?${qs}` : ''}`,
    )
  },
  unreadCount: () => authFetch<{ unread: number }>('/notifications/unread-count'),
  markRead: (id: string) => authFetch<{ unread: number }>(`/notifications/${id}/read`, { method: 'POST' }),
  markAllRead: () => authFetch<{ marked: number; unread: number }>('/notifications/read-all', { method: 'POST' }),
  remove: (id: string) => authFetch<{ unread: number }>(`/notifications/${id}`, { method: 'DELETE' }),
}
