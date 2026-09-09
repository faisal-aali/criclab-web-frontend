import { authFetch } from './auth'

export type TrendPoint = {
  date: string
  value: number
}

export type TrendMetric = {
  series: TrendPoint[]
  status: 'ok' | 'insufficient_data'
  count: number
  latest: number | null
  best: number | null
  mean: number | null
  trend: {
    recent_mean: number
    prior_mean: number
    change: number
    percent_change: number | null
    direction: 'up' | 'down' | 'flat'
    window: number
  } | null
}

export type FocusArea = {
  tag: string
  count: number
  coverage_count: number
}

export type TrainingProfile = {
  player_profile: Record<string, unknown>
  sample_size: number
  date_range: { first: string | null; latest: string | null }
  min_sample_required: number
  overall_score: number | null
  metrics: Record<string, TrendMetric>
  scores: Record<string, TrendMetric>
  focus_areas: FocusArea[]
  focus_areas_status: 'ok' | 'insufficient_data'
}

export type DrillRecommendation = {
  drill_id: string
  youtube_id: string
  title: string
  tags: string[]
  reason?: string
  priority?: number
  source?: string
}

export type TrainingPlan = {
  status: 'ok' | 'llm_unavailable'
  summary?: string
  focus_areas?: string
  strengths?: string
  improvements?: string
  suggestions?: string
  recommendations?: DrillRecommendation[]
  error?: string
}

export type TrainingProfileResponse = TrainingProfile

export type TrainingPlanResponse = {
  profile: TrainingProfile
  plan: TrainingPlan | null
  generation_status: 'generating' | 'ready' | 'failed'
  generated_at?: string
  cached: boolean
  needs_refresh: boolean
}

export const training = {
  profile: () => authFetch<TrainingProfileResponse>('/training/profile'),
  plan: (opts: { refresh?: boolean } = {}) =>
    authFetch<TrainingPlanResponse>(`/training/plan${opts.refresh ? '?refresh=true' : ''}`),
}
