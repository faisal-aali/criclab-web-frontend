/**
 * The one way a page puts a 3D model on screen.
 *
 * - three.js, React Three Fiber and the models are a separate chunk that is
 *   only requested once the container is within 200px of the viewport, so a
 *   visitor who never scrolls to a model never downloads the renderer.
 * - The render loop only runs while the container is on screen and the tab
 *   is visible; off screen it holds the last frame.
 * - Under `prefers-reduced-motion` the model renders one still frame.
 * - Devices graded `off` by `sceneQuality`, a WebGL context loss, or any
 *   render error fall back to the SVG passed as `fallback`, which is also what
 *   shows while the chunk loads — so the layout never shifts.
 */
import { useReducedMotion } from 'framer-motion'
import { Component, Suspense, lazy, useEffect, useRef, useState, type ReactNode } from 'react'
import { sceneQuality } from './capabilities'
import type { SceneModel } from './types'

const Stage = lazy(() => import('./Stage'))

class SceneBoundary extends Component<
  { fallback: ReactNode; children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onError()
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export function Scene3D({
  model,
  className = '',
  fallback,
  label,
  interactive = true,
  scale = 1,
}: {
  model: SceneModel
  className?: string
  /** SVG shown while loading, on low-end devices, and if rendering fails. */
  fallback: ReactNode
  /** Accessible name for the scene. */
  label: string
  /** Follow the pointer. Off for purely decorative placements. */
  interactive?: boolean
  scale?: number
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [near, setNear] = useState(false)
  const [onScreen, setOnScreen] = useState(false)
  const [tabVisible, setTabVisible] = useState(() => typeof document === 'undefined' || !document.hidden)
  const [failed, setFailed] = useState(false)
  const reduced = useReducedMotion()
  const quality = sceneQuality()

  useEffect(() => {
    const el = ref.current
    if (!el || quality === 'off' || typeof IntersectionObserver === 'undefined') return
    const nearIo = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true)
          nearIo.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    const viewIo = new IntersectionObserver((entries) => setOnScreen(entries.some((e) => e.isIntersecting)), {
      threshold: 0,
    })
    nearIo.observe(el)
    viewIo.observe(el)
    return () => {
      nearIo.disconnect()
      viewIo.disconnect()
    }
  }, [quality])

  useEffect(() => {
    const onVisibility = () => setTabVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  const showCanvas = quality !== 'off' && !failed && near
  const active = showCanvas && onScreen && tabVisible && !reduced

  return (
    <div ref={ref} className={`scene-3d ${className}`} role="img" aria-label={label}>
      {showCanvas ? (
        <SceneBoundary fallback={fallback} onError={() => setFailed(true)}>
          <Suspense fallback={fallback}>
            <Stage model={model} quality={quality} active={active} interactive={interactive} scale={scale} />
          </Suspense>
        </SceneBoundary>
      ) : (
        fallback
      )}
    </div>
  )
}
