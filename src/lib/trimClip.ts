import {
  BoxParser,
  DataStream,
  createFile,
  MP4BoxBuffer,
  type Box,
  type IsoFileOptions,
  type Movie,
  type Sample,
  type Track,
} from 'mp4box'
import { MAX_BYTES, MAX_DURATION_S } from './clipSpec'

const TRIM_MS = 90_000

export const MSG_TRIM_UNREADABLE =
  'Could not read this clip to trim it. Use the original MP4 or MOV from the camera roll, not a re-export.'
export const MSG_TRIM_EMPTY = 'No frames in that range. Move the start a little and try again.'
export const MSG_TRIM_LOSSLESS = 'Trim in the browser. We copy the original frames — no re-encode.'
export const MSG_TRIM_4K =
  'Lossless trim reduces size with duration, not resolution. A short 4K 240 fps clip over 100 MB still fails — shoot 1080p 120 or 240 fps.'
export const MSG_TRIM_KEYFRAME =
  'Start snaps to the previous keyframe, so the cut may begin a fraction of a second earlier.'

export function shouldOfferActionTrim(durationS: number | null | undefined): boolean {
  return durationS != null && durationS > 0
}

export function clampTrimRange(
  startS: number,
  endS: number,
  durationS: number,
): { startS: number; endS: number; windowS: number } {
  const duration = Math.max(0, durationS)
  if (!(duration > 0)) return { startS: 0, endS: 0, windowS: 0 }
  let start = Number.isFinite(startS) ? startS : 0
  let end = Number.isFinite(endS) ? endS : duration
  start = Math.min(Math.max(0, start), duration)
  end = Math.min(Math.max(0, end), duration)
  if (end < start) {
    const swap = start
    start = end
    end = swap
  }
  if (end - start > MAX_DURATION_S) {
    end = start + MAX_DURATION_S
    if (end > duration) {
      end = duration
      start = Math.max(0, end - MAX_DURATION_S)
    }
  }
  return { startS: start, endS: end, windowS: end - start }
}

export function estimateTrimBytes(sourceBytes: number, durationS: number, windowS: number): number {
  if (!(durationS > 0) || !(windowS > 0)) return sourceBytes
  return Math.ceil(sourceBytes * Math.min(1, windowS / durationS))
}

export function trimFitsSize(sourceBytes: number, durationS: number, windowS: number): boolean {
  return estimateTrimBytes(sourceBytes, durationS, windowS) <= MAX_BYTES
}

type SampleBag = Map<number, Sample[]>

function sampleTimeS(sample: Sample): number {
  const timescale = sample.timescale || 1
  return sample.dts / timescale
}

function trimmedName(name: string): string {
  const base = (name || 'clip').replace(/\.[^.]+$/, '') || 'clip'
  return `${base}_trim.mp4`
}

function uniqueBrands(info: Movie): string[] {
  const out: string[] = []
  for (const brand of ['isom', 'iso2', 'mp41', ...(info.brands || [])]) {
    if (!brand || brand === 'iso4' || brand === 'iso5' || brand === 'iso6') continue
    if (!out.includes(brand)) out.push(brand)
  }
  if (out.length === 0) out.push('isom', 'mp41')
  return out
}

function makeBox(type: 'stss' | 'ctts' | 'mdat'): Box {
  const Ctor = BoxParser.box[type]
  if (!Ctor) throw new Error(MSG_TRIM_UNREADABLE)
  return new Ctor()
}

function runLength(values: number[]): { counts: number[]; values: number[] } {
  const counts: number[] = []
  const out: number[] = []
  for (const value of values) {
    if (out.length > 0 && out[out.length - 1] === value) {
      counts[counts.length - 1] += 1
    } else {
      counts.push(1)
      out.push(value)
    }
  }
  return { counts, values: out }
}

function mediaDuration(samples: Sample[]): number {
  const sum = samples.reduce((n, s) => n + Math.max(0, s.duration), 0)
  if (sum > 0) return sum
  const first = samples[0]
  const last = samples[samples.length - 1]
  return Math.max(1, last.dts - first.dts + Math.max(1, last.duration))
}

function concatSampleBytes(samples: Sample[]): Uint8Array {
  const total = samples.reduce((n, s) => n + (s.data?.byteLength || 0), 0)
  if (!(total > 0)) throw new Error(MSG_TRIM_UNREADABLE)
  const bytes = new Uint8Array(total)
  let offset = 0
  for (const sample of samples) {
    const data = sample.data
    if (!data || data.byteLength === 0) throw new Error(MSG_TRIM_UNREADABLE)
    bytes.set(data, offset)
    offset += data.byteLength
  }
  return bytes
}

type SampleTable = {
  stts: { sample_counts: number[]; sample_deltas: number[] }
  stsc: { first_chunk: number[]; samples_per_chunk: number[]; sample_description_index: number[] }
  stco: { chunk_offsets: number[] }
  stsz: { sample_sizes: number[]; sample_size: number }
  addBox: (box: Box) => unknown
}

type WrittenTrak = {
  tkhd: { duration: number }
  mdia: {
    mdhd: { duration: number; timescale: number }
    minf: { stbl: SampleTable }
  }
}

function fillSampleTable(trak: WrittenTrak, samples: Sample[]): number {
  const origin = samples[0].dts
  const durations = samples.map((s) => Math.max(1, s.duration))
  const sizes = samples.map((s) => {
    if (!s.data || s.data.byteLength === 0) throw new Error(MSG_TRIM_UNREADABLE)
    return s.data.byteLength
  })
  const stbl = trak.mdia.minf.stbl
  const stts = runLength(durations)
  stbl.stts.sample_counts = stts.counts
  stbl.stts.sample_deltas = stts.values
  stbl.stsz.sample_size = 0
  stbl.stsz.sample_sizes = sizes
  stbl.stsc.first_chunk = [1]
  stbl.stsc.samples_per_chunk = [samples.length]
  stbl.stsc.sample_description_index = [1]
  stbl.stco.chunk_offsets = [0]

  const sync = samples
    .map((sample, i) => (sample.is_sync ? i + 1 : 0))
    .filter((n) => n > 0)
  if (sync.length > 0) {
    const stss = makeBox('stss') as Box & { sample_numbers: number[] }
    stss.sample_numbers = sync
    stbl.addBox(stss)
  }

  const offsets = samples.map((s) => s.cts - origin - (s.dts - origin))
  if (offsets.some((n) => n !== 0)) {
    const packed = runLength(offsets)
    const ctts = makeBox('ctts') as Box & { sample_counts: number[]; sample_offsets: number[] }
    ctts.sample_counts = packed.counts
    ctts.sample_offsets = packed.values
    stbl.addBox(ctts)
  }

  const duration = mediaDuration(samples)
  trak.mdia.mdhd.duration = duration
  trak.tkhd.duration = duration
  return sizes.reduce((n, s) => n + s, 0)
}

function videoTrack(info: Movie): Track | undefined {
  return info.videoTracks[0] || info.tracks.find((t) => t.type === 'video' || Boolean(t.video))
}

function trackOptions(track: Track, first: Sample): IsoFileOptions {
  const desc = first.description as {
    type?: string
    boxes?: IsoFileOptions['description_boxes']
    avcC?: NonNullable<IsoFileOptions['description_boxes']>[number]
    hvcC?: NonNullable<IsoFileOptions['description_boxes']>[number]
    av1C?: NonNullable<IsoFileOptions['description_boxes']>[number]
    width?: number
    height?: number
    channel_count?: number
    samplerate?: number
    samplesize?: number
  }
  const isAudio = track.type === 'audio' || Boolean(track.audio)
  const options: IsoFileOptions = {
    timescale: first.timescale || track.timescale,
    duration: 0,
    language: track.language,
    type: (desc.type || (isAudio ? 'mp4a' : 'avc1')) as IsoFileOptions['type'],
    hdlr: isAudio ? 'soun' : 'vide',
    name: track.name || (isAudio ? 'Audio' : 'Video'),
    width: Math.round(track.video?.width || track.track_width || desc.width || 1920),
    height: Math.round(track.video?.height || track.track_height || desc.height || 1080),
  }
  if (isAudio) {
    options.channel_count = track.audio?.channel_count || desc.channel_count || 2
    options.samplerate = track.audio?.sample_rate || desc.samplerate || 48_000
    options.samplesize = track.audio?.sample_size || desc.samplesize || 16
  }
  const boxes = desc.boxes?.length
    ? desc.boxes
    : ([desc.avcC, desc.hvcC, desc.av1C].filter(Boolean) as IsoFileOptions['description_boxes'])
  if (boxes && boxes.length > 0) options.description_boxes = boxes
  return options
}

/** Keep samples until `endS` (decode time), capped at 10 s from the first frame. */
function capSamples(samples: Sample[], endS: number): Sample[] {
  if (samples.length === 0) return []
  const origin = sampleTimeS(samples[0])
  const kept: Sample[] = []
  for (const sample of samples) {
    const t = sampleTimeS(sample)
    if (t >= endS - 1e-6) break
    if (t - origin >= MAX_DURATION_S - 1e-6) break
    if (!sample.data || sample.data.byteLength === 0) continue
    kept.push(sample)
  }
  return kept
}

function extractWindow(
  file: File,
  startS: number,
  endS: number,
): Promise<{ info: Movie; samples: SampleBag; actualStart: number; actualEnd: number }> {
  return new Promise((resolve, reject) => {
    const iso = createFile(true)
    const samples: SampleBag = new Map()
    let info: Movie | undefined
    let actualStart = startS
    let actualEnd = endS
    let settled = false

    const finish = (err?: Error) => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      try {
        iso.flush()
      } catch {
        /* ignore */
      }
      if (err) {
        reject(err)
        return
      }
      if (!info) {
        reject(new Error(MSG_TRIM_UNREADABLE))
        return
      }
      resolve({ info, samples, actualStart, actualEnd })
    }

    const timer = window.setTimeout(() => finish(new Error(MSG_TRIM_UNREADABLE)), TRIM_MS)

    iso.onError = () => finish(new Error(MSG_TRIM_UNREADABLE))

    iso.onReady = (movie) => {
      info = movie
      const video = videoTrack(movie)
      if (!video) {
        finish(new Error(MSG_TRIM_UNREADABLE))
        return
      }
      const tracks = [video]
      for (const track of tracks) {
        samples.set(track.id, [])
        iso.setExtractionOptions(track.id, undefined, { nbSamples: 48 })
      }
      try {
        iso.seek(startS, true)
      } catch {
        /* RAP seek is best-effort; sample DTS is the window clock, not seek.time. */
      }
      actualStart = startS
      actualEnd = Math.max(endS, startS) + 0.5
      iso.start()
    }

    iso.onSamples = (id, _user, batch) => {
      const list = samples.get(id)
      if (!list || settled) return
      let pastEnd = false
      for (const sample of batch) {
        const t = sampleTimeS(sample)
        if (t >= actualEnd - 1e-9) {
          pastEnd = true
          break
        }
        if (sample.data && sample.data.byteLength > 0) list.push(sample)
      }
      if (pastEnd) iso.unsetExtractionOptions(id)
    }

    void file.arrayBuffer().then(
      (raw) => {
        if (settled) return
        try {
          iso.appendBuffer(MP4BoxBuffer.fromArrayBuffer(raw, 0))
          iso.flush()
          if (!settled) finish()
        } catch {
          finish(new Error(MSG_TRIM_UNREADABLE))
        }
      },
      () => finish(new Error(MSG_TRIM_UNREADABLE)),
    )
  })
}

function remux(info: Movie, videoSamples: Sample[]): Blob {
  const video = videoTrack(info)
  if (!video || videoSamples.length === 0) {
    throw new Error(MSG_TRIM_EMPTY)
  }
  if (!videoSamples.some((s) => s.is_sync)) {
    throw new Error(MSG_TRIM_EMPTY)
  }

  const movieTimescale = videoSamples[0].timescale || video.timescale || 1000
  const output = createFile()
  output.init({
    timescale: movieTimescale,
    duration: 0,
    brands: uniqueBrands(info),
  })

  const videoId = output.addTrack(trackOptions(video, videoSamples[0]))
  if (!videoId) throw new Error(MSG_TRIM_UNREADABLE)
  const videoTrak = output.getTrackById(videoId) as unknown as WrittenTrak
  fillSampleTable(videoTrak, videoSamples)

  videoTrak.tkhd.duration = Math.round(
    (videoTrak.mdia.mdhd.duration * movieTimescale) / (videoTrak.mdia.mdhd.timescale || 1),
  )
  output.moov.mvhd.duration = videoTrak.tkhd.duration

  const moov = output.moov
  if (moov.mvex && moov.boxes) {
    const idx = moov.boxes.indexOf(moov.mvex)
    if (idx >= 0) moov.boxes.splice(idx, 1)
    moov.mvex = undefined
  }

  const scratch = new DataStream()
  output.ftyp.write(scratch)
  const ftypSize = output.ftyp.size
  moov.write(scratch)
  const moovSize = moov.size
  const chunkOffset = ftypSize + moovSize + 8
  videoTrak.mdia.minf.stbl.stco.chunk_offsets = [chunkOffset]

  const payload = concatSampleBytes(videoSamples)
  const mdat = makeBox('mdat') as Box & { data: Uint8Array }
  mdat.data = payload
  output.addBox(mdat)

  const stream = output.getBuffer()
  if (!(stream.byteLength > 32)) throw new Error(MSG_TRIM_UNREADABLE)
  const bytes = new Uint8Array(stream.byteLength)
  bytes.set(new Uint8Array(stream.buffer, 0, stream.byteLength))
  return new Blob([bytes], { type: 'video/mp4' })
}

/** Stream-copy `[start, end]` (capped at 10 s, start on the previous RAP) into a new MP4. */
export async function trimClip(file: File, startS: number, endS: number): Promise<File> {
  const durationHint = Number.POSITIVE_INFINITY
  const range = clampTrimRange(startS, endS, durationHint)
  if (!(range.windowS > 0)) {
    throw new Error(MSG_TRIM_EMPTY)
  }

  const extracted = await extractWindow(file, range.startS, range.endS)
  const video = videoTrack(extracted.info)
  if (!video) throw new Error(MSG_TRIM_UNREADABLE)

  const videoSamples = capSamples(extracted.samples.get(video.id) || [], range.endS)
  const blob = remux(extracted.info, videoSamples)
  return new File([blob], trimmedName(file.name), { type: 'video/mp4' })
}
