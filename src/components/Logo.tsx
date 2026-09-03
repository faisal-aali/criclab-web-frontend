/**
 * Same CricLab mark as the PWA / store icon (lime tile, night ball, seam cutouts).
 */
export function LogoMark({ size = 36 }: { size?: number }) {
  const radius = Math.round(size * 0.28)
  return (
    <img
      src="/icons/icon-192.png"
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        display: 'block',
        objectFit: 'cover',
      }}
    />
  )
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5 text-chalk">
      <LogoMark size={34} />
      <span className="font-display text-[1.35rem] font-bold leading-none tracking-tight">
        Cric<span className="text-lime">Lab</span>
      </span>
    </span>
  )
}
