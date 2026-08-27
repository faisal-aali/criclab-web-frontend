import { usePwaInstall } from '../../pwa/PwaInstall'

export function InstallAppButton({
  className = '',
  size = 'sm',
  compact = false,
}: {
  className?: string
  size?: 'sm' | 'lg'
  compact?: boolean
}) {
  const { installed, install } = usePwaInstall()
  if (installed) return null

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        aria-label="Download App"
        title="Download App"
        className={`grid h-10 w-10 place-items-center rounded-xl border border-lime/40 bg-lime/10 text-lime transition hover:border-lime/70 ${className}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-4.5 w-4.5" aria-hidden>
          <path d="M12 4v10m0 0 4-4m-4 4-4-4M5 19h14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    )
  }

  const pad = size === 'lg' ? 'px-5 py-3.5 text-base' : 'px-3.5 py-2 text-sm'

  return (
    <button
      type="button"
      onClick={() => void install()}
      className={`inline-flex items-center justify-center gap-2 rounded-full border border-lime/40 bg-lime/10 font-semibold text-lime transition hover:border-lime/70 hover:bg-lime/15 ${pad} ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-4 w-4" aria-hidden>
        <path d="M12 4v10m0 0 4-4m-4 4-4-4M5 19h14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Download App
    </button>
  )
}
