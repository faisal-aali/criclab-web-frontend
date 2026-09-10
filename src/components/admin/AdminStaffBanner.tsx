import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'

/** Shown on the player workspace report when a staff member has opened it.
 *  Hidden inside `/admin/*` — that shell already is the admin chrome. */
export function AdminStaffBanner() {
  const { user } = useAuth()
  const location = useLocation()
  if (user?.role !== 'admin') return null
  if (location.pathname.startsWith('/admin')) return null
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warn/30 bg-warn/10 px-4 py-2.5">
      <p className="text-sm font-semibold text-warn">Viewing as staff — this is the same report the player sees.</p>
      <Link
        to="/admin"
        className="text-[11px] font-bold uppercase tracking-[0.14em] text-warn hover:text-chalk"
      >
        Back to admin
      </Link>
    </div>
  )
}

/** In-panel report chrome: stay in admin, never bounce to the player portal. */
export function AdminReportChrome() {
  const location = useLocation()
  if (!location.pathname.startsWith('/admin/reports')) return null
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-lime/25 bg-lime/8 px-4 py-2.5">
      <p className="text-sm font-semibold text-chalk/80">
        Staff view — same numbers the player sees, opened inside admin.
      </p>
      <Link
        to="/admin/analyses"
        className="text-[11px] font-bold uppercase tracking-[0.14em] text-lime hover:text-chalk"
      >
        ← Analyses
      </Link>
    </div>
  )
}
