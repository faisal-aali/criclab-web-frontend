const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init)
  if (!res.ok) {
    let detail = res.statusText
    try {
      const data = await res.json()
      detail = data.detail || data.message || detail
    } catch {
      /* ignore */
    }
    throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail))
  }
  return res.json() as Promise<T>
}

export type Job = {
  id: string
  video_id?: string
  session_id?: string
  status: 'queued' | 'processing' | 'analyzing' | 'completed' | 'failed' | string
  progress: number
  stage?: string
  message?: string
  delivery_id?: string
  result?: DeliveryResult
  error?: string
}

export type MetricValue = {
  value: number | null
  unit: string
  confidence: number
  estimated?: boolean
  status?: 'ok' | 'estimated' | 'unavailable' | string
  note?: string | null
  raw_computed?: number | null
}

export type Scores = {
  overall?: number | null
  arm_speed?: number | null
  ball_speed?: number | null
  sequencing?: number | null
  front_leg_brace?: number | null
  hip_shoulder_separation?: number | null
  label?: string
}

export type PlayerProfile = {
  player_name?: string
  first_name?: string
  last_name?: string
  age_years?: number
  height_m?: number
  weight_lbs?: number
  weight_kg?: number
  bowling_arm?: 'left' | 'right' | string
  bowling_style?: 'pace' | 'spin' | 'medium' | string
}

export type Metrics = {
  throwing_side?: string | null
  player_profile?: PlayerProfile
  release_frame?: number | null
  release_point?: { x: number; y: number } | null
  ball_speed_kmh?: MetricValue
  ball_speed_mps?: MetricValue
  ball_speed_px_per_frame?: MetricValue
  arm_speed_kmh?: MetricValue
  arm_speed_mps?: MetricValue
  hand_speed_px_per_frame?: MetricValue
  release_time_ms?: MetricValue
  arm_swing_speed_deg_s?: MetricValue
  hip_rotation_speed_deg_s?: MetricValue
  trunk_rotation_speed_deg_s?: MetricValue
  release_height_m?: MetricValue
  release_angle_deg?: MetricValue
  stride_length_pct_height?: MetricValue
  elbow_extension_deg?: MetricValue
  front_knee_flexion_deg?: MetricValue
  hip_shoulder_separation_deg?: MetricValue
  scores?: Scores
  sequencing_ok?: boolean | null
  trajectory_points?: { frame: number; x: number; y: number }[]
  scale?: { calibrated?: boolean; method?: string; note?: string }
  quality?: {
    pose_frames?: number
    detected_ratio?: number
    has_release?: boolean
    has_front_foot_contact?: boolean
    calibrated?: boolean
    tracking_ok?: boolean
    ball_points?: number
    camera_view?: string
    camera_view_note?: string
    speed_view_ok?: boolean
    shoulder_width_ratio?: number
  }
  kinematic_sequence?: {
    n?: number
    key?: string
    label?: string
    frame?: number | null
    estimated?: boolean
  }[]
  phases?: Record<string, number | null>
}

export function metricReady(m?: MetricValue | null): boolean {
  if (!m || m.value == null) return false
  return m.status === 'ok'
}

export type DrillRecommendation = {
  drill_id: string
  youtube_id: string
  title: string
  tags?: string[]
  reason?: string
  priority?: number
  source?: string
}

export type DrillCatalogItem = {
  id: string
  youtube_id: string
  title: string
  tags: string[]
}

export type Analysis = {
  summary?: string
  observations?: string
  strengths?: string
  improvements?: string
  confidence_note?: string
  recommendations?: DrillRecommendation[]
  comparison?: {
    current_speed_kmh?: number | null
    previous_avg_speed_kmh?: number | null
    delta_kmh?: number | null
    previous_count?: number
  }
}

export type Artifacts = {
  release_still_url?: string
  overlay_video_url?: string
  pdf_url?: string
  original_video_url?: string
  cloudinary_video_url?: string | null
  cloudinary_pdf_url?: string | null
}

export type DeliveryResult = {
  delivery_id: string
  metrics: Metrics
  analysis: Analysis
  artifacts: Artifacts
}

export type Delivery = {
  id: string
  job_id?: string
  player_name?: string
  player_profile?: PlayerProfile
  created_at?: string
  metrics?: Metrics
  analysis?: Analysis
  analysis_summary?: string
  artifacts?: Artifacts
  cloudinary?: Record<string, unknown>
  meta?: Record<string, unknown>
  release?: Record<string, unknown>
}

export function assetUrl(path?: string | null) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${API_BASE}${path}`
}

export async function uploadVideo(input: {
  file: File
  playerName: string
  firstName: string
  lastName: string
  dateOfBirth: string
  heightFt: number
  heightIn: number
  weightLbs: number
  bowlingArm: 'left' | 'right'
  bowlingStyle: 'pace' | 'spin' | 'medium'
  metersPerPixel?: number
}) {
  const form = new FormData()
  form.append('file', input.file)
  form.append('player_name', input.playerName)
  form.append('first_name', input.firstName)
  form.append('last_name', input.lastName)
  form.append('date_of_birth', input.dateOfBirth)
  form.append('height_ft', String(input.heightFt))
  form.append('height_in', String(input.heightIn))
  form.append('weight_lbs', String(input.weightLbs))
  form.append('bowling_arm', input.bowlingArm)
  form.append('bowling_style', input.bowlingStyle)
  if (input.metersPerPixel != null && !Number.isNaN(input.metersPerPixel)) {
    form.append('meters_per_pixel', String(input.metersPerPixel))
  }
  return request<{ video_id: string; job_id: string; status: string }>('/videos', {
    method: 'POST',
    body: form,
  })
}

export function getJob(jobId: string) {
  return request<Job>(`/jobs/${jobId}`)
}

export function listDeliveries() {
  return request<{ items: Delivery[] }>('/deliveries')
}

export function getDelivery(id: string) {
  return request<Delivery>(`/deliveries/${id}`)
}

export function getHealth() {
  return request<{ ok: boolean }>('/health')
}

export type StumpBox = { x: number; y: number; w: number; h: number }

export type BalltrackDelivery = {
  id: string
  session_id?: string
  index?: number
  created_at?: string
  metrics?: {
    speed_kmh?: MetricValue
    line_m?: MetricValue
    length_m?: MetricValue
  }
  bounce?: { length_m?: number; width_m?: number; frame?: number }
  artifacts?: { clip_url?: string; cloudinary_clip_url?: string }
}

export type BalltrackSession = {
  id: string
  title?: string
  status?: string
  created_at?: string
  delivery_count?: number
  artifacts?: {
    overlay_url?: string
    pitch_map_url?: string
    cloudinary_overlay_url?: string
    cloudinary_pitch_map_url?: string
  }
  analysis?: Analysis
  deliveries?: BalltrackDelivery[]
  error?: string
}

export function detectStumps(file: Blob, hints?: { bowler?: StumpBox; batter?: StumpBox }) {
  const form = new FormData()
  form.append('file', file, 'frame.jpg')
  if (hints) form.append('hints', JSON.stringify(hints))
  return request<{
    bowler: StumpBox
    batter: StumpBox
    found: boolean
    confidence?: { bowler?: number; batter?: number }
  }>('/balltrack/detect-stumps', { method: 'POST', body: form })
}

export function createBalltrackSession(input: {
  file: File
  calibration: { bowler: StumpBox; batter: StumpBox; pitch_length_m?: number }
  title?: string
}) {
  const form = new FormData()
  form.append('file', input.file)
  form.append('calibration', JSON.stringify(input.calibration))
  form.append('title', input.title || 'Ball Track session')
  return request<{ session_id: string; job_id: string; status: string }>('/balltrack/sessions', {
    method: 'POST',
    body: form,
  })
}

export function getBalltrackJob(jobId: string) {
  return request<Job>(`/balltrack/jobs/${jobId}`)
}

export function getBalltrackSession(sessionId: string) {
  return request<BalltrackSession>(`/balltrack/sessions/${sessionId}`)
}

export function listDrills(tag?: string) {
  const q = tag ? `?tag=${encodeURIComponent(tag)}` : ''
  return request<{ items: DrillCatalogItem[]; tags: string[] }>(`/coaching/drills${q}`)
}
