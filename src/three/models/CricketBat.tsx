/**
 * A willow bat: an extruded, bevelled blade with a spine on the back, a
 * cane splice, a rubber-gripped handle with lime bindings and a CricLab
 * sticker on the face. Hangs at a natural lean and floats.
 */
import { Float } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { MathUtils, Shape, type Group } from 'three'
import type { ModelProps } from '../types'

const BLADE_W = 0.86
const BLADE_H = 2.15

function bladeShape() {
  const w = BLADE_W / 2
  const h = BLADE_H / 2
  const toe = 0.26
  const s = new Shape()
  // Start at the splice (top centre-left), run down the left edge to the
  // rounded toe, back up the right edge and across the shoulders.
  s.moveTo(-w * 0.72, h)
  s.lineTo(-w, h - 0.34)
  s.lineTo(-w, -h + toe)
  s.quadraticCurveTo(-w, -h, -w + toe, -h)
  s.lineTo(w - toe, -h)
  s.quadraticCurveTo(w, -h, w, -h + toe)
  s.lineTo(w, h - 0.34)
  s.lineTo(w * 0.72, h)
  s.closePath()
  return s
}

export function CricketBat({ active, interactive, scale }: ModelProps) {
  const group = useRef<Group>(null)
  const { pointer } = useThree()
  const shape = useMemo(bladeShape, [])
  const extrude = useMemo(
    () => ({ depth: 0.2, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.045, bevelSegments: 5, curveSegments: 24 }),
    [],
  )

  useFrame((_, dt) => {
    const g = group.current
    if (!g || !active) return
    g.rotation.y = MathUtils.lerp(g.rotation.y, (interactive ? pointer.x * 0.45 : 0) - 0.55, 0.05)
    g.rotation.x = MathUtils.lerp(g.rotation.x, (interactive ? -pointer.y * 0.2 : 0) + 0.12, 0.05)
    g.rotation.z += Math.sin(performance.now() * 0.0006) * dt * 0.02
  })

  return (
    <Float speed={active ? 1.1 : 0} rotationIntensity={0.2} floatIntensity={0.6}>
      <group ref={group} rotation={[0.12, -0.55, -0.42]} scale={0.98 * scale} position={[0.05, -0.15, 0]}>
        {/* Blade */}
        <mesh position={[0, -0.55, -0.1]}>
          <extrudeGeometry args={[shape, extrude]} />
          <meshStandardMaterial color="#e2c58c" roughness={0.72} metalness={0.02} />
        </mesh>
        {/* Spine on the back of the blade */}
        <mesh position={[0, -0.5, -0.22]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.28, 1.55, 0.14]} />
          <meshStandardMaterial color="#d3b57b" roughness={0.78} />
        </mesh>
        {/* Face sticker */}
        <mesh position={[0, -0.05, 0.161]}>
          <planeGeometry args={[0.56, 0.42]} />
          <meshStandardMaterial color="#b6f24a" roughness={0.5} emissive="#4b7a12" emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[0, -0.05, 0.163]}>
          <planeGeometry args={[0.5, 0.06]} />
          <meshStandardMaterial color="#05090a" roughness={0.6} />
        </mesh>
        {/* Splice */}
        <mesh position={[0, 0.6, -0.02]}>
          <cylinderGeometry args={[0.09, 0.2, 0.32, 24]} />
          <meshStandardMaterial color="#c9a469" roughness={0.8} />
        </mesh>
        {/* Handle with grip */}
        <mesh position={[0, 1.28, -0.02]}>
          <cylinderGeometry args={[0.078, 0.086, 1.05, 28]} />
          <meshStandardMaterial color="#182620" roughness={0.95} />
        </mesh>
        {[1.0, 1.28, 1.56].map((y) => (
          <mesh key={y} position={[0, y, -0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.084, 0.012, 8, 40]} />
            <meshStandardMaterial color="#b6f24a" roughness={0.6} emissive="#3f6a0e" emissiveIntensity={0.3} />
          </mesh>
        ))}
        <mesh position={[0, 1.82, -0.02]}>
          <sphereGeometry args={[0.09, 20, 20]} />
          <meshStandardMaterial color="#182620" roughness={0.95} />
        </mesh>
      </group>
    </Float>
  )
}
