/**
 * Session state for the whole app.
 *
 * One provider owns "who is signed in", so no screen has to decide for itself.
 * On mount it tries to restore a session from the stored refresh token, which
 * is what makes a reload keep you signed in without persisting an access token.
 *
 * `status` is deliberately three-valued. Guards must be able to tell
 * "still checking" from "definitely signed out", or every refresh would flash
 * the sign-in page before the session is restored.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  auth as authApi,
  clearTokens,
  getStoredRefreshToken,
  onSessionEnded,
  refreshSession,
  setTokens,
  type AuthUser,
  type TokenBundle,
} from '../api/auth'

type Status = 'loading' | 'authenticated' | 'anonymous'

type AuthContextValue = {
  status: Status
  user: AuthUser | null
  /** Signed in AND email confirmed — what protected features require. */
  isVerified: boolean
  adopt: (bundle: TokenBundle) => void
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  setUser: (user: AuthUser) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading')
  const [user, setUserState] = useState<AuthUser | null>(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  // Restore on first load.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!getStoredRefreshToken()) {
        if (!cancelled) setStatus('anonymous')
        return
      }
      const token = await refreshSession()
      if (cancelled) return
      if (!token) {
        setStatus('anonymous')
        return
      }
      try {
        const { user: me } = await authApi.me()
        if (cancelled) return
        setUserState(me)
        setStatus('authenticated')
      } catch {
        if (!cancelled) {
          clearTokens()
          setStatus('anonymous')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // The transport tells us when a refresh failed mid-session.
  useEffect(
    () =>
      onSessionEnded(() => {
        if (!mounted.current) return
        setUserState(null)
        setStatus('anonymous')
      }),
    [],
  )

  const adopt = useCallback((bundle: TokenBundle) => {
    setTokens(bundle)
    setUserState(bundle.user)
    setStatus('authenticated')
  }, [])

  const signOut = useCallback(async () => {
    await authApi.signOut()
    setUserState(null)
    setStatus('anonymous')
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const { user: me } = await authApi.me()
      setUserState(me)
    } catch {
      /* the transport handles an ended session */
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isVerified: Boolean(user?.email_verified),
      adopt,
      signOut,
      refreshUser,
      setUser: setUserState,
    }),
    [status, user, adopt, signOut, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
