import type { SceneQuality } from './capabilities'

export type SceneModel = 'ball' | 'bat' | 'player'

export type ModelProps = {
  /** Whether the render loop is running (on screen, tab visible, motion allowed). */
  active: boolean
  /** Lean toward the pointer. */
  interactive: boolean
  quality: SceneQuality
  scale: number
}
