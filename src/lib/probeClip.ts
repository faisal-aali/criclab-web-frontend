import { createFile, MP4BoxBuffer, type Movie, type Track } from 'mp4box'
import {
  displaySize,
  evaluateClip,
  taggedFpsOk,
  type ClipProbe,
  type ClipVerdict,
} from './clipSpec'

const PROBE_MS = 20_000

function emptyProbe(file: File): ClipProbe {
  return {
    filename: file.name,
    sizeBytes: file.size,
    durationS: null,
    width: 0,
    height: 0,
    fps: null,
    fpsUnreadable: true,
    variableFrameRate: false,
    hasVideoTrack: false,
    rotationDeg: null,
  }
}

function rotationFromMatrix(matrix: ArrayLike<number> | undefined): number | null {
  if (!matrix || matrix.length < 4) return null
  const a = Number(matrix[0])
  const b = Number(matrix[1])
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null
  const scale = Math.abs(a) > 2 || Math.abs(b) > 2 ? 65536 : 1
  return (Math.atan2(b / scale, a / scale) * 180) / Math.PI
}

function uniqueDeltas(deltas: number[]): number[] {
  const seen = new Set<number>()
  const out: number[] = []
  for (const d of deltas) {
    if (!Number.isFinite(d) || d <= 0) continue
    if (seen.has(d)) continue
    seen.add(d)
    out.push(d)
  }
  return out
}

function fpsFromStts(timescale: number, deltas: number[]): { fps: number | null; vfr: boolean } {
  const uniq = uniqueDeltas(deltas)
  if (uniq.length === 0 || !(timescale > 0)) return { fps: null, vfr: false }
  const rates = uniq.map((d) => timescale / d).filter((n) => Number.isFinite(n) && n > 0)
  if (rates.length === 0) return { fps: null, vfr: false }
  const fps = rates.reduce((sum, n) => sum + n, 0) / rates.length
  // NTSC 119.94/239.76 often stores two integer deltas (e.g. 500 and 501). That is
  // not true VFR — every delta still maps to tagged 120 or 240.
  const vfr = rates.some((rate) => !taggedFpsOk(rate))
  return { fps, vfr }
}

function fpsFromSamples(track: Track): number | null {
  const duration = Number(track.duration)
  const timescale = Number(track.timescale)
  const samples = Number(track.nb_samples)
  if (!(duration > 0) || !(timescale > 0) || !(samples > 0)) return null
  return (samples * timescale) / duration
}

function movieDurationS(info: Movie, track: Track | undefined): number | null {
  if (track && track.duration > 0 && track.timescale > 0) {
    return track.duration / track.timescale
  }
  if (info.duration > 0 && info.timescale > 0) {
    return info.duration / info.timescale
  }
  return null
}

function parseMoov(file: File, info: Movie, iso: ReturnType<typeof createFile>): ClipProbe {
  const video = info.videoTracks[0] || info.tracks.find((t) => t.type === 'video' || Boolean(t.video))
  if (!video) {
    return { ...emptyProbe(file), fpsUnreadable: true, hasVideoTrack: false }
  }
  let fps: number | null = null
  let vfr = false
  try {
    const trak = iso.getTrackById(video.id)
    const deltas = trak?.mdia?.minf?.stbl?.stts?.sample_deltas
    if (deltas && deltas.length > 0) {
      const fromStts = fpsFromStts(video.timescale, deltas)
      fps = fromStts.fps
      vfr = fromStts.vfr
    }
  } catch {
    fps = null
  }
  if (fps == null || vfr) {
    const fromSamples = fpsFromSamples(video)
    if (fromSamples != null && taggedFpsOk(fromSamples)) {
      fps = fromSamples
      vfr = false
    } else if (fps == null) {
      fps = fromSamples
    }
  }
  const rotationDeg = rotationFromMatrix(video.matrix)
  const rawW = video.video?.width || video.track_width || 0
  const rawH = video.video?.height || video.track_height || 0
  const shown = displaySize(rawW, rawH, rotationDeg)
  return {
    filename: file.name,
    sizeBytes: file.size,
    durationS: movieDurationS(info, video),
    width: shown.width,
    height: shown.height,
    fps,
    fpsUnreadable: fps == null || !Number.isFinite(fps) || fps <= 0,
    variableFrameRate: vfr,
    hasVideoTrack: true,
    rotationDeg,
  }
}

function probeBoxes(file: File): Promise<ClipProbe | null> {
  return new Promise((resolve) => {
    const iso = createFile(false)
    let settled = false
    const finish = (probe: ClipProbe | null) => {
      if (settled) return
      settled = true
      try {
        iso.flush()
      } catch {
        /* ignore */
      }
      resolve(probe)
    }
    const timer = window.setTimeout(() => finish(null), PROBE_MS)
    iso.onError = () => {
      window.clearTimeout(timer)
      finish(null)
    }
    iso.onReady = (info) => {
      window.clearTimeout(timer)
      try {
        finish(parseMoov(file, info, iso))
      } catch {
        finish(null)
      }
    }
    void file.arrayBuffer().then(
      (raw) => {
        if (settled) return
        try {
          iso.appendBuffer(MP4BoxBuffer.fromArrayBuffer(raw, 0))
          iso.flush()
        } catch {
          window.clearTimeout(timer)
          finish(null)
        }
      },
      () => {
        window.clearTimeout(timer)
        finish(null)
      },
    )
  })
}

function probeHtmlVideo(
  file: File,
): Promise<{ width: number; height: number; durationS: number | null }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true
    const done = (width: number, height: number, durationS: number | null) => {
      URL.revokeObjectURL(url)
      video.removeAttribute('src')
      video.load()
      resolve({ width, height, durationS })
    }
    const timer = window.setTimeout(() => done(0, 0, null), 8000)
    video.onloadedmetadata = () => {
      window.clearTimeout(timer)
      const duration = video.duration
      const durationS = Number.isFinite(duration) && duration > 0 ? duration : null
      done(video.videoWidth || 0, video.videoHeight || 0, durationS)
    }
    video.onerror = () => {
      window.clearTimeout(timer)
      done(0, 0, null)
    }
    video.src = url
  })
}

/** Read container tags from an Action clip. Never invent fps. */
export async function probeClip(file: File): Promise<ClipProbe> {
  let probe = (await probeBoxes(file)) ?? emptyProbe(file)
  const needsDisplay =
    probe.width <= 0 || probe.height <= 0 || probe.durationS == null || !(probe.durationS > 0)
  if (needsDisplay) {
    const html = await probeHtmlVideo(file)
    if (probe.width <= 0 && html.width > 0) {
      probe = {
        ...probe,
        width: html.width,
        height: html.height,
        rotationDeg: probe.rotationDeg ?? 0,
        hasVideoTrack: probe.hasVideoTrack || html.width > 0,
      }
    }
    if ((probe.durationS == null || !(probe.durationS > 0)) && html.durationS != null) {
      probe = { ...probe, durationS: html.durationS }
    }
  }
  return probe
}

export async function inspectActionClip(file: File): Promise<{ probe: ClipProbe; verdict: ClipVerdict }> {
  const probe = await probeClip(file)
  return { probe, verdict: evaluateClip(probe) }
}
