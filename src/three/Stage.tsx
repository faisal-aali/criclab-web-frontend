/**
 * The WebGL stage every model is placed on: one camera, one lighting rig,
 * one ground shadow. Loaded lazily by `Scene3D`; nothing above it imports
 * three.js directly.
 *
 * Lighting is the brand's floodlit night — a cool key from high right, a
 * lime rim from behind-left so silhouettes read on dark surfaces, and a
 * soft fill so the leather and willow keep their colour.
 */
import { ContactShadows } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import type { SceneQuality } from './capabilities'
import { CricketBall } from './models/CricketBall'
import { CricketBat } from './models/CricketBat'
import { CricketPlayer } from './models/CricketPlayer'
import type { SceneModel } from './types'

export default function Stage({
  model,
  quality,
  active,
  interactive,
  scale,
}: {
  model: SceneModel
  quality: SceneQuality
  active: boolean
  interactive: boolean
  scale: number
}) {
  const high = quality === 'high'
  const props = { active, interactive, quality, scale }
  return (
    <Canvas
      dpr={high ? [1, 1.75] : [1, 1.25]}
      frameloop={active ? 'always' : 'demand'}
      camera={{ position: [0, 0.35, 5.6], fov: 30, near: 0.1, far: 40 }}
      gl={{ antialias: high, alpha: true, powerPreference: 'low-power', preserveDrawingBuffer: false }}
      style={{ position: 'absolute', inset: 0 }}
      resize={{ scroll: false, debounce: { scroll: 50, resize: 100 } }}
    >
      <ambientLight intensity={0.55} color="#dfe8e2" />
      <directionalLight position={[3.5, 5, 4]} intensity={1.7} color="#f6f9f7" />
      <directionalLight position={[-4, 1.5, -3]} intensity={1.1} color="#b6f24a" />
      <pointLight position={[0, -2.5, 2.5]} intensity={0.5} color="#12513c" />
      <Suspense fallback={null}>
        {model === 'ball' ? <CricketBall {...props} /> : null}
        {model === 'bat' ? <CricketBat {...props} /> : null}
        {model === 'player' ? <CricketPlayer {...props} /> : null}
        {high ? (
          <ContactShadows
            position={[0, -1.75, 0]}
            opacity={0.5}
            scale={9}
            blur={2.6}
            far={3.5}
            color="#01120a"
            frames={active ? Infinity : 1}
          />
        ) : null}
      </Suspense>
    </Canvas>
  )
}
