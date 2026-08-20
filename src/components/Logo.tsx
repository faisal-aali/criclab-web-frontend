export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cl-ball" x1="8" y1="6" x2="40" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E4572E" />
          <stop offset="1" stopColor="#A61B1B" />
        </linearGradient>
        <linearGradient id="cl-ring" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0B3D2E" />
          <stop offset="1" stopColor="#06261C" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="45" height="45" rx="13" fill="url(#cl-ring)" />
      <circle cx="24" cy="24" r="12.5" fill="url(#cl-ball)" />
      <path d="M15.5 18.5c5.4 2.2 11.6 2.2 17 0" stroke="#FBEFE7" strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
      <path d="M14.5 24c6 2.4 13 2.4 19 0" stroke="#FBEFE7" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M15.5 29.5c5.4 2.2 11.6 2.2 17 0" stroke="#FBEFE7" strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
      <path d="M32 12l4-4M36 16l4-4" stroke="#7BE3A6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark size={34} />
      <span className="font-display text-[1.35rem] font-bold leading-none tracking-normal">
        <span className="text-pitch">Cric</span>
        <span className="text-seam">Lab</span>
      </span>
    </span>
  )
}
