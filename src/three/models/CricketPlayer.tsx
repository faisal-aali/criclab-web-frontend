/**
 * A bowler at the top of the delivery stride, drawn the way the product sees
 * one: limbs as dark capsules between the pose landmarks, and the landmarks
 * themselves as lime keypoints that pulse in kinematic order — hips, then
 * shoulders, elbow, wrist — with the ball leaving the hand.
 *
 * The joint layout is the same skeleton the 2D `BowlerSkeleton` fallback
 * draws, lifted into three dimensions with the front and back limbs offset
 * in depth, so the fallback and the model tell one story.
 */
import { Float } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { MathUtils, Quaternion, Vector3, type Group, type Mesh } from 'three'
import type { ModelProps } from '../types'

type V3 = [number, number, number]

// [x, y, z]; y up; roughly 1 unit = 0.6 m.
const J = {
  head: [-0.07, 2.02, 0] as V3,
  neck: [0.08, 1.66, 0] as V3,
  shoulderF: [-0.16, 1.55, 0.14] as V3,
  shoulderB: [0.33, 1.62, -0.14] as V3,
  bowlElbow: [-0.6, 1.86, 0.17] as V3,
  bowlWrist: [-0.74, 2.3, 0.2] as V3,
  leadElbow: [0.7, 1.2, -0.16] as V3,
  leadWrist: [0.86, 0.7, -0.16] as V3,
  hipF: [-0.34, 0.76, 0.13] as V3,
  hipB: [0.24, 0.82, -0.13] as V3,
  frontKnee: [-0.7, -0.02, 0.16] as V3,
  frontAnkle: [-1.0, -0.76, 0.18] as V3,
  backKnee: [0.5, 0.0, -0.16] as V3,
  backAnkle: [0.95, -0.7, -0.18] as V3,
}

const BONES: [keyof typeof J, keyof typeof J, number][] = [
  ['neck', 'shoulderF', 0.075],
  ['neck', 'shoulderB', 0.075],
  ['shoulderF', 'shoulderB', 0.09],
  ['shoulderF', 'bowlElbow', 0.07],
  ['bowlElbow', 'bowlWrist', 0.06],
  ['shoulderB', 'leadElbow', 0.07],
  ['leadElbow', 'leadWrist', 0.06],
  ['shoulderF', 'hipF', 0.1],
  ['shoulderB', 'hipB', 0.1],
  ['hipF', 'hipB', 0.09],
  ['hipF', 'frontKnee', 0.085],
  ['frontKnee', 'frontAnkle', 0.07],
  ['hipB', 'backKnee', 0.085],
  ['backKnee', 'backAnkle', 0.07],
]

/** Kinematic order for the keypoint pulse — ground up, ending at the wrist. */
const PULSE_ORDER: (keyof typeof J)[] = [
  'backAnkle',
  'frontAnkle',
  'backKnee',
  'frontKnee',
  'hipB',
  'hipF',
  'shoulderB',
  'shoulderF',
  'bowlElbow',
  'bowlWrist',
]

const UP = new Vector3(0, 1, 0)

function Bone({ a, b, r }: { a: V3; b: V3; r: number }) {
  const { position, quaternion, length } = useMemo(() => {
    const va = new Vector3(...a)
    const vb = new Vector3(...b)
    const dir = vb.clone().sub(va)
    const length = dir.length()
    const quaternion = new Quaternion().setFromUnitVectors(UP, dir.clone().normalize())
    return { position: va.clone().add(vb).multiplyScalar(0.5), quaternion, length }
  }, [a, b])
  return (
    <mesh position={position} quaternion={quaternion}>
      <capsuleGeometry args={[r, Math.max(0.01, length - r * 2), 6, 16]} />
      <meshStandardMaterial color="#0f3a2c" roughness={0.45} metalness={0.15} />
    </mesh>
  )
}

function Keypoint({ p, index, active }: { p: V3; index: number; active: boolean }) {
  const ref = useRef<Mesh>(null)
  useFrame(({ clock }) => {
    const m = ref.current
    if (!m) return
    if (!active) {
      m.scale.setScalar(1)
      return
    }
    const t = clock.getElapsedTime() * 0.55 - index * 0.09
    const phase = t - Math.floor(t)
    const pulse = Math.pow(Math.max(0, Math.sin(phase * Math.PI)), 3)
    m.scale.setScalar(1 + pulse * 0.75)
  })
  return (
    <mesh ref={ref} position={p}>
      <sphereGeometry args={[0.07, 18, 18]} />
      <meshStandardMaterial color="#b6f24a" emissive="#b6f24a" emissiveIntensity={1.3} roughness={0.35} />
    </mesh>
  )
}

export function CricketPlayer({ active, interactive, scale }: ModelProps) {
  const group = useRef<Group>(null)
  const ball = useRef<Mesh>(null)
  const { pointer } = useThree()

  useFrame(({ clock }) => {
    const g = group.current
    if (!g || !active) return
    const t = clock.getElapsedTime()
    const target = (interactive ? pointer.x * 0.5 : 0) + Math.sin(t * 0.35) * 0.28 + 0.25
    g.rotation.y = MathUtils.lerp(g.rotation.y, target, 0.04)
    const b = ball.current
    if (b) {
      // The ball leaves the hand and is reset each loop, in time with the
      // keypoint pulse reaching the wrist.
      const loop = t * 0.55 - PULSE_ORDER.length * 0.09
      const phase = loop - Math.floor(loop)
      const fly = Math.max(0, phase - 0.25) / 0.75
      b.position.set(J.bowlWrist[0] - fly * 1.9, J.bowlWrist[1] + 0.12 - fly * 0.9 - fly * fly * 0.6, J.bowlWrist[2] + 0.08)
      const vis = 1 - Math.pow(fly, 4)
      b.scale.setScalar(0.08 * vis + 0.001)
    }
  })

  return (
    <Float speed={active ? 0.9 : 0} rotationIntensity={0.08} floatIntensity={0.25}>
      <group ref={group} position={[0.05, -0.62, 0]} scale={0.98 * scale} rotation={[0, 0.25, 0]}>
        {/* Head */}
        <mesh position={J.head}>
          <sphereGeometry args={[0.2, 28, 28]} />
          <meshStandardMaterial color="#0f3a2c" roughness={0.45} metalness={0.15} />
        </mesh>
        <Bone a={J.head} b={J.neck} r={0.055} />
        {BONES.map(([a, b, r]) => (
          <Bone key={`${a}-${b}`} a={J[a]} b={J[b]} r={r} />
        ))}
        {PULSE_ORDER.map((k, i) => (
          <Keypoint key={k} p={J[k]} index={i} active={active} />
        ))}
        <Keypoint p={J.leadElbow} index={6} active={active} />
        <Keypoint p={J.leadWrist} index={7} active={active} />
        {/* Ball */}
        <mesh ref={ball} position={[J.bowlWrist[0], J.bowlWrist[1] + 0.12, J.bowlWrist[2] + 0.08]} scale={0.08}>
          <sphereGeometry args={[1, 20, 20]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.5} />
        </mesh>
        {/* Crease ring */}
        <mesh position={[0, -0.82, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.25, 1.3, 96]} />
          <meshBasicMaterial color="#b6f24a" transparent opacity={0.45} />
        </mesh>
        <mesh position={[0, -0.825, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.02, 1.25, 96]} />
          <meshBasicMaterial color="#12513c" transparent opacity={0.22} />
        </mesh>
      </group>
    </Float>
  )
}
