/**
 * Decides how much 3D a device should get.
 *
 * `off`  — no WebGL, a very low-end device, or the visitor asked for data
 *          saving: the SVG fallback renders instead and three.js never loads.
 * `low`  — phones and modest laptops: capped pixel ratio, no antialias, no
 *          contact shadow.
 * `high` — everything else.
 *
 * Evaluated once per session; a window resize does not re-grade a device.
 */
export type SceneQuality = 'off' | 'low' | 'high'

let cached: SceneQuality | null = null

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export function sceneQuality(): SceneQuality {
  if (cached) return cached
  if (typeof window === 'undefined') return 'off'
  const nav = navigator as Navigator & {
    deviceMemory?: number
    connection?: { saveData?: boolean }
  }
  const cores = nav.hardwareConcurrency ?? 4
  const memory = nav.deviceMemory ?? 4
  if (nav.connection?.saveData || cores <= 2 || memory <= 2 || !hasWebGL()) {
    cached = 'off'
    return cached
  }
  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false
  const small = window.innerWidth < 768
  cached = coarse || small || cores <= 4 ? 'low' : 'high'
  return cached
}
