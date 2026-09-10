/**
 * Route guards.
 *
 * `RequireAuth` wraps everything under /app. It records where the visitor was
 * heading so sign-in can return them there instead of dumping them on a
 * dashboard — the difference between a redirect that helps and one that annoys.
 *
 * Nothing here is a security control. The guard hides UI; the API is what
 * actually refuses unauthorised data, and it does so independently.
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { fallbackAdminPath, fallbackSiteHeaderPath, fallbackWorkspacePath, isAdminPathHidden, isSiteHeaderPathHidden, isWorkspacePathHidden, postAuthLandingPath } from '../config/nav'
import { useAuth } from './AuthProvider'

/** Full-screen hold while the stored session is being restored. */
export function SessionLoading({ label = 'Checking your session' }: { label?: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-night px-6">
      <div className="flex flex-col items-center gap-4">
        <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-lime to-lime-deep">
          <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
            <circle cx="12" cy="12" r="9" fill="#05090a" />
            <path d="M6 6.5 Q12 12 6 17.5" fill="none" stroke="#b6f24a" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M18 6.5 Q12 12 18 17.5" fill="none" stroke="#b6f24a" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </span>
        <span className="animate-pulse-bar text-xs font-semibold uppercase tracking-[0.2em] text-chalk/45">
          {label}
        </span>
      </div>
    </div>
  )
}

/** Signed in, or bounced to sign-in with a return path. */
export function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <SessionLoading />
  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  return <Outlet />
}

/**
 * Signed in AND email confirmed.
 * An unverified account is sent to finish verification rather than to sign-in —
 * they have valid credentials, just an unconfirmed address.
 */
export function RequireVerified() {
  const { status, user } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <SessionLoading />
  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  if (!user?.email_verified) {
    return <Navigate to="/verify-email" replace state={{ email: user?.email }} />
  }
  return <Outlet />
}

/** Staff-only areas. */
export function RequireAdmin() {
  const { status, user } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <SessionLoading />
  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  if (user?.role !== 'admin') return <Navigate to={fallbackWorkspacePath()} replace />
  return <Outlet />
}

/**
 * Sidebar `hidden: true` is also an access block. Routes stay registered;
 * this is what refuses the URL (and `childPrefixes` such as processing
 * screens). `/app/settings` is not a sidebar page — keep it outside this
 * wrapper in App.tsx.
 */
export function RequireVisibleWorkspacePage() {
  const { pathname } = useLocation()
  if (isWorkspacePathHidden(pathname)) {
    return <Navigate to={fallbackWorkspacePath()} replace />
  }
  return <Outlet />
}

export function RequireVisibleAdminPage() {
  const { pathname } = useLocation()
  if (isAdminPathHidden(pathname)) {
    return <Navigate to={fallbackAdminPath()} replace />
  }
  return <Outlet />
}

/**
 * Site header `hidden: true` is also an access block for pages listed in
 * `nav.site-header.json`. Careers, FAQ, legal pages, etc. are not in that
 * file and stay reachable.
 */
export function RequireVisibleSiteHeaderPage() {
  const { pathname } = useLocation()
  if (isSiteHeaderPathHidden(pathname)) {
    return <Navigate to={fallbackSiteHeaderPath()} replace />
  }
  return <Outlet />
}

/**
 * The inverse: keeps a signed-in visitor off the sign-in and sign-up screens.
 * Without it, "back" after signing in lands on a login form for a live session.
 */
export function RedirectIfAuthenticated({ to }: { to?: string }) {
  const { status, user } = useAuth()
  const location = useLocation() as { state?: { from?: string } }

  if (status === 'loading') return <SessionLoading />
  if (status === 'authenticated') {
    if (user && !user.email_verified) return <Navigate to="/verify-email" replace />
    return <Navigate to={postAuthLandingPath(user, location.state?.from || to)} replace />
  }
  return <Outlet />
}
