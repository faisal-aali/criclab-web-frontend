/**
 * Compact "Open" action for analysis rows.
 *
 * Far-right of a table or card, large enough to tap, never just a text link.
 */
import { Link } from 'react-router-dom'

export function OpenReportButton({
  to,
  label = 'Open',
}: {
  to: string
  label?: string
}) {
  return (
    <Link
      to={to}
      aria-label={`${label} report`}
      className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-full bg-lime px-3.5 py-2 text-xs font-bold text-night shadow-[0_8px_20px_-10px_rgba(182,242,74,0.7)] transition hover:bg-[#c6ff62] active:scale-[0.97]"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-3.5 w-3.5" aria-hidden>
        <path d="M5 12h12m0 0-4.5-4.5M17 12l-4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </Link>
  )
}
