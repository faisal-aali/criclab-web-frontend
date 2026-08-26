import { useTheme } from '../theme/ThemeProvider'

/**
 * Sun / moon control for the header.
 *
 * `onDark` is for chrome that always sits on a night surface (marketing header
 * over a floodlit hero). `adaptive` follows the page theme so it stays
 * readable on the light workspace header too.
 */
export function ThemeToggle({
  variant = 'adaptive',
}: {
  variant?: 'adaptive' | 'on-dark'
}) {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  const onDark = variant === 'on-dark' || dark

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={dark}
      title={dark ? 'Light mode' : 'Dark mode'}
      className={`grid h-10 w-10 place-items-center rounded-xl border transition ${
        onDark
          ? 'border-white/15 bg-white/5 text-chalk/80 hover:border-lime/40 hover:text-chalk'
          : 'border-pitch/15 bg-white text-ink/70 hover:border-pitch/40 hover:text-ink'
      }`}
    >
      {dark ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path
            strokeLinecap="round"
            d="M12 3v1.5M12 19.5V21M4.9 4.9l1.1 1.1M18 18l1.1 1.1M3 12h1.5M19.5 12H21M4.9 19.1 6 18M18 6l1.1-1.1"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 14.3A8.5 8.5 0 1 1 9.7 3 6.5 6.5 0 0 0 21 14.3Z"
          />
        </svg>
      )}
    </button>
  )
}
