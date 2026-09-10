/**
 * Page-facing 3D components.
 *
 * Each pairs a model with the SVG that stands in for it while the renderer
 * loads, on low-end devices and if WebGL fails, so a page never has to know
 * about the fallback.
 *
 *  - `Ball3D`   — analytics and AI moments: the thing being measured.
 *  - `Player3D` — hero and workspace entry: the bowler as the product sees them.
 *  - `Bat3D`    — equipment and "how it works" moments.
 */
import { BatGlyph, BowlerSkeleton, SeamBall } from '../components/site/visuals'
import { Scene3D } from './Scene3D'

type Props = { className?: string; interactive?: boolean; scale?: number }

export function Ball3D({ className = '', interactive = true, scale = 1 }: Props) {
  return (
    <Scene3D
      model="ball"
      className={className}
      interactive={interactive}
      scale={scale}
      label="A cricket ball, rendered in 3D"
      fallback={
        <div className="grid h-full w-full place-items-center p-[12%]">
          <SeamBall size={160} className="h-auto w-full max-w-[220px]" />
        </div>
      }
    />
  )
}

export function Player3D({ className = '', interactive = true, scale = 1 }: Props) {
  return (
    <Scene3D
      model="player"
      className={className}
      interactive={interactive}
      scale={scale}
      label="A bowler in the delivery stride with pose keypoints, rendered in 3D"
      fallback={
        <div className="h-full w-full p-[8%]">
          <BowlerSkeleton />
        </div>
      }
    />
  )
}

export function Bat3D({ className = '', interactive = true, scale = 1 }: Props) {
  return (
    <Scene3D
      model="bat"
      className={className}
      interactive={interactive}
      scale={scale}
      label="A cricket bat, rendered in 3D"
      fallback={
        <div className="grid h-full w-full place-items-center p-[10%]">
          <BatGlyph className="h-full w-auto" />
        </div>
      }
    />
  )
}
