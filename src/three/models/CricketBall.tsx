/**
 * A red-leather cricket ball, built from primitives: a sphere, two thread
 * rings either side of the seam's great circle, and instanced stitches
 * laid along them. Spins slowly on its seam axis and leans toward the pointer.
 */
import { Float, Instance, Instances } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { MathUtils, type Group } from 'three'
import type { ModelProps } from '../types'

const SEAM_TILT: [number, number, number] = [0.55, 0.15, 0.4]
const RING_OFFSET = 0.075
const STITCHES = 44

export function CricketBall({ active, interactive, scale }: ModelProps) {
  const group = useRef<Group>(null)
  const { pointer } = useThree()

  const stitches = useMemo(() => {
    const out: { position: [number, number, number]; rotation: [number, number, number] }[] = []
    const r = Math.sqrt(1 - RING_OFFSET * RING_OFFSET)
    for (const z of [-RING_OFFSET, RING_OFFSET]) {
      for (let k = 0; k < STITCHES; k++) {
        const a = (k / STITCHES) * Math.PI * 2 + (z > 0 ? Math.PI / STITCHES : 0)
        out.push({
          position: [r * Math.cos(a) * 1.004, r * Math.sin(a) * 1.004, z],
          // Tangent to the ring, then tilted across the seam so the two
          // rows read as a cross-stitch rather than a dashed line.
          rotation: [z > 0 ? 0.55 : -0.55, 0, a + Math.PI / 2],
        })
      }
    }
    return out
  }, [])

  useFrame((_, dt) => {
    const g = group.current
    if (!g || !active) return
    g.rotation.y += dt * 0.32
    const tx = interactive ? pointer.y * 0.35 + 0.15 : 0.15
    const tz = interactive ? -pointer.x * 0.25 : 0
    g.rotation.x = MathUtils.lerp(g.rotation.x, tx, 0.06)
    g.rotation.z = MathUtils.lerp(g.rotation.z, tz, 0.06)
  })

  return (
    <Float speed={active ? 1.3 : 0} rotationIntensity={0.25} floatIntensity={0.7}>
      <group ref={group} scale={1.32 * scale} rotation={[0.15, 0, 0]}>
        <mesh>
          <sphereGeometry args={[1, 72, 72]} />
          <meshStandardMaterial color="#a61e1e" roughness={0.48} metalness={0.06} />
        </mesh>
        {/* Gloss: a faint clear-coat sphere just above the leather. */}
        <mesh scale={1.003}>
          <sphereGeometry args={[1, 48, 48]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transparent
            opacity={0.08}
            roughness={0.18}
            clearcoat={1}
            clearcoatRoughness={0.25}
            depthWrite={false}
          />
        </mesh>
        <group rotation={SEAM_TILT}>
          {[-RING_OFFSET, RING_OFFSET].map((z) => (
            <mesh key={z} position={[0, 0, z]}>
              <torusGeometry args={[Math.sqrt(1 - z * z) * 1.002, 0.012, 10, 128]} />
              <meshStandardMaterial color="#f1e6cf" roughness={0.85} />
            </mesh>
          ))}
          <Instances limit={STITCHES * 2}>
            <boxGeometry args={[0.052, 0.014, 0.014]} />
            <meshStandardMaterial color="#f7efdc" roughness={0.9} />
            {stitches.map((s, i) => (
              <Instance key={i} position={s.position} rotation={s.rotation} />
            ))}
          </Instances>
        </group>
      </group>
    </Float>
  )
}
