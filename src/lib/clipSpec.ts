/**
 * Action upload gates. KEEP IN SYNC with:
 *
 * - criclab-web-backend/app/pipeline/clip_spec.py
 * - criclab-video-service/app/pipeline/clip_spec.py
 *
 * Ball flight does not use this spec.
 */

export const MAX_BYTES = 100 * 1024 * 1024
export const MIN_BYTES = 1024
export const MAX_DURATION_S = 10
export const MIN_SHORT_SIDE = 1080
export const ALLOWED_SUFFIXES = ['.mp4', '.mov'] as const
export const FPS_TARGETS = [120, 240] as const
export const FPS_TOLERANCE = 3

export const MSG_EMPTY = 'This file is empty or too small to be a video.'
export const MSG_EXTENSION = 'Use a .mp4 or .mov clip.'
export const MSG_SIZE =
  'Clip must be under 100 MB. Shoot 1080p 120 or 240 fps rather than 4K if the file is too large.'
export const MSG_NO_VIDEO = 'This file has no video track.'
export const MSG_FPS_UNREADABLE =
  "Could not read frame rate — use the phone's slow-mo 120 or 240 fps file, not a 30 fps export."
export const MSG_VFR =
  'Variable frame rate is not supported. Export a 120 or 240 fps slow-mo clip.'
export const MSG_FPS =
  "Need slow-motion 120 or 240 fps. Standard 30/60 fps videos are not accepted. Use the phone's slow-mo mode and don't re-export as 30 fps."
export const MSG_DURATION = 'Trim to one delivery, 10 seconds or less.'
export const MSG_LANDSCAPE = 'Film in landscape.'
export const MSG_RESOLUTION = 'Need 1080p or higher (1920×1080 or 4K).'

export const RULES = [
  { id: 'extension', label: 'MP4 or MOV' },
  { id: 'size', label: 'Under 100 MB' },
  { id: 'duration', label: '10 seconds or less' },
  { id: 'landscape', label: 'Landscape' },
  { id: 'resolution', label: '1080p or higher' },
  { id: 'fps', label: '120 or 240 fps' },
] as const

export type ClipRuleId = (typeof RULES)[number]['id']

export type ClipProbe = {
  filename: string
  sizeBytes: number
  durationS: number | null
  width: number
  height: number
  fps: number | null
  fpsUnreadable: boolean
  variableFrameRate: boolean
  hasVideoTrack: boolean
  rotationDeg: number | null
}

export type ClipVerdict = {
  ok: boolean
  errors: string[]
  failed: Set<ClipRuleId>
}

export function lastSuffix(name: string | null | undefined): string {
  const base = (name || '').split(/[/\\]/).pop() || ''
  const dot = base.lastIndexOf('.')
  if (dot < 0) return ''
  return base.slice(dot).toLowerCase()
}

export function suffixOk(name: string | null | undefined): boolean {
  return (ALLOWED_SUFFIXES as readonly string[]).includes(lastSuffix(name))
}

export function taggedFpsOk(fps: number): boolean {
  if (!Number.isFinite(fps) || fps <= 0) return false
  return FPS_TARGETS.some((target) => Math.abs(fps - target) <= FPS_TOLERANCE)
}

export function displaySize(
  width: number,
  height: number,
  rotationDeg: number | null | undefined,
): { width: number; height: number } {
  const w = Math.round(width || 0)
  const h = Math.round(height || 0)
  if (w <= 0 || h <= 0) return { width: w, height: h }
  const rot = Math.abs(rotationDeg || 0) % 360
  if ((rot >= 45 && rot <= 135) || (rot >= 225 && rot <= 315)) {
    return { width: h, height: w }
  }
  return { width: w, height: h }
}

function finitePositive(value: number | null | undefined): boolean {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

export function evaluateClip(probe: ClipProbe): ClipVerdict {
  const errors: string[] = []
  const failed = new Set<ClipRuleId>()
  const size = probe.sizeBytes || 0

  if (size < MIN_BYTES) {
    errors.push(MSG_EMPTY)
    failed.add('size')
  }
  if (!suffixOk(probe.filename)) {
    errors.push(MSG_EXTENSION)
    failed.add('extension')
  }
  if (size > MAX_BYTES) {
    errors.push(MSG_SIZE)
    failed.add('size')
  }
  if (!probe.hasVideoTrack) {
    errors.push(MSG_NO_VIDEO)
    failed.add('fps')
    return { ok: false, errors, failed }
  }
  if (probe.fpsUnreadable || probe.fps == null) {
    errors.push(MSG_FPS_UNREADABLE)
    failed.add('fps')
  } else if (probe.variableFrameRate) {
    errors.push(MSG_VFR)
    failed.add('fps')
  } else if (!taggedFpsOk(probe.fps)) {
    errors.push(MSG_FPS)
    failed.add('fps')
  }
  if (probe.durationS == null || !finitePositive(probe.durationS) || probe.durationS > MAX_DURATION_S) {
    errors.push(MSG_DURATION)
    failed.add('duration')
  }
  const { width, height } = displaySize(probe.width, probe.height, probe.rotationDeg)
  if (width <= 0 || height <= 0) {
    errors.push(MSG_RESOLUTION)
    failed.add('resolution')
  } else {
    if (width <= height) {
      errors.push(MSG_LANDSCAPE)
      failed.add('landscape')
    }
    if (Math.min(width, height) < MIN_SHORT_SIDE) {
      errors.push(MSG_RESOLUTION)
      failed.add('resolution')
    }
  }
  return { ok: errors.length === 0, errors, failed }
}
