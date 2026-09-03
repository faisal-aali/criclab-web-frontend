import type { ClipUploadProgress } from '../../api/client'

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

export function formatStageDetail(detail?: { current: number; total: number; unit?: string } | null) {
  if (!detail || !(detail.total > 0)) return null
  const total = Math.max(1, Math.floor(Number(detail.total)))
  const current = Math.max(0, Math.min(Math.floor(Number(detail.current) || 0), total))
  const { unit } = detail
  if (unit === 'bytes') return `${formatBytes(current)} of ${formatBytes(total)}`
  if (unit === 'frames') return `Frame ${current} of ${total}`
  if (unit === 'paths') return `Path ${current} of ${total}`
  return `${current} of ${total}`
}

export function stageFraction(detail?: { current: number; total: number } | null) {
  if (!detail || !(detail.total > 0)) return null
  const total = Math.max(1, Number(detail.total))
  const current = Math.max(0, Math.min(Number(detail.current) || 0, total))
  return current / total
}

export function ClipUploadOverlay({
  progress,
  label = 'Sending your clip',
}: {
  progress: ClipUploadProgress | null
  label?: string
}) {
  if (!progress) return null
  const uploading = progress.phase === 'upload'
  const pct = uploading && progress.total > 0 ? Math.round((progress.loaded / progress.total) * 100) : null
  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-night/70 p-4 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="w-full max-w-sm rounded-2xl border border-white/12 bg-charcoal p-6 text-chalk shadow-2xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-lime">{label}</p>
        <p className="font-display mt-2 text-xl font-bold">
          {uploading ? 'Uploading your video' : 'Handing off to analysis'}
        </p>
        <p className="mt-1.5 text-sm text-chalk/60">
          {uploading && pct != null
            ? `${formatBytes(progress.loaded)} of ${formatBytes(progress.total)}`
            : 'The lab is picking up the clip. You will see every step next.'}
        </p>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/8">
          <div
            className={`h-full rounded-full bg-lime ${pct == null ? 'w-1/3 animate-pulse' : 'transition-[width] duration-200'}`}
            style={pct != null ? { width: `${pct}%` } : undefined}
          />
        </div>
        <p className="mt-2 text-right font-mono text-sm font-bold text-lime">
          {pct != null ? `${pct}%` : '…'}
        </p>
      </div>
    </div>
  )
}
