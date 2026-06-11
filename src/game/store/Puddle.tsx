import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { enterPuddle, exitPuddle } from '@/state/cartPhysicsStore'

interface PuddleProps {
  position: [number, number, number]
  size: [number, number]
}

function isCart(other: { rigidBody?: { userData?: unknown } | null }): boolean {
  return (other.rigidBody?.userData as { isCart?: boolean })?.isCart === true
}

export function Puddle({ position, size }: PuddleProps) {
  const [w, d] = size
  const [x, y, z] = position

  return (
    <RigidBody type="fixed" position={[x, y, z]} colliders={false}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0.01, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial
          color="#38bdf8"
          transparent
          opacity={0.55}
          roughness={0.15}
          metalness={0.2}
          emissive="#0ea5e9"
          emissiveIntensity={0.15}
        />
      </mesh>
      <CuboidCollider
        args={[w / 2, 0.05, d / 2]}
        sensor
        onIntersectionEnter={({ other }) => {
          if (isCart(other)) enterPuddle()
        }}
        onIntersectionExit={({ other }) => {
          if (isCart(other)) exitPuddle()
        }}
      />
    </RigidBody>
  )
}
