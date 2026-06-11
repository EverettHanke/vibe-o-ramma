import {
  CuboidCollider,
  CylinderCollider,
  RigidBody,
} from '@react-three/rapier'
import { Puddle } from './Puddle'
import { PUDDLES } from './puddles'

function CardboardBox({
  position,
  size = 0.5,
}: {
  position: [number, number, number]
  size?: number
}) {
  const h = size / 2
  return (
    <RigidBody
      type="dynamic"
      colliders={false}
      position={position}
      linearDamping={0.3}
      angularDamping={0.4}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color="#b08968" roughness={0.9} />
      </mesh>
      {/* Tape stripe */}
      <mesh position={[0, h + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[size, size * 0.18]} />
        <meshStandardMaterial color="#d6c2a8" />
      </mesh>
      <CuboidCollider args={[h, h, h]} density={0.5} />
    </RigidBody>
  )
}

function BoxStack({ position }: { position: [number, number, number] }) {
  const [x, , z] = position
  return (
    <>
      <CardboardBox position={[x, 0.3, z]} size={0.6} />
      <CardboardBox position={[x + 0.05, 0.85, z - 0.04]} size={0.5} />
      <CardboardBox position={[x - 0.08, 1.3, z + 0.05]} size={0.42} />
    </>
  )
}

function Pallet({ position }: { position: [number, number, number] }) {
  return (
    <>
      <RigidBody type="fixed" colliders={false} position={position}>
        <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
          <boxGeometry args={[1.3, 0.16, 1.0]} />
          <meshStandardMaterial color="#9c6b3f" roughness={1} />
        </mesh>
        <CuboidCollider args={[0.65, 0.08, 0.5]} position={[0, 0.08, 0]} />
      </RigidBody>
      <CardboardBox position={[position[0] - 0.3, 0.5, position[2]]} size={0.55} />
      <CardboardBox position={[position[0] + 0.3, 0.5, position[2] + 0.1]} size={0.55} />
      <CardboardBox position={[position[0], 1.0, position[2]]} size={0.5} />
    </>
  )
}

function WetFloorCone({ position }: { position: [number, number, number] }) {
  return (
    <RigidBody
      type="dynamic"
      colliders={false}
      position={position}
      linearDamping={0.5}
      angularDamping={0.6}
    >
      <mesh castShadow position={[0, 0.35, 0]}>
        <coneGeometry args={[0.22, 0.7, 16]} />
        <meshStandardMaterial color="#f59e0b" emissive="#b45309" emissiveIntensity={0.2} />
      </mesh>
      <mesh castShadow position={[0, 0.04, 0]}>
        <boxGeometry args={[0.5, 0.08, 0.5]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>
      <CylinderCollider args={[0.35, 0.24]} position={[0, 0.35, 0]} density={0.4} />
    </RigidBody>
  )
}

function Can({
  position,
  color,
}: {
  position: [number, number, number]
  color: string
}) {
  return (
    <RigidBody
      type="dynamic"
      colliders={false}
      position={position}
      linearDamping={0.2}
      angularDamping={0.3}
    >
      <mesh castShadow>
        <cylinderGeometry args={[0.13, 0.13, 0.3, 16]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </mesh>
      <CylinderCollider args={[0.15, 0.13]} density={0.7} />
    </RigidBody>
  )
}

function CanPyramid({ position }: { position: [number, number, number] }) {
  const [x, , z] = position
  const colors = ['#dc2626', '#16a34a', '#2563eb', '#d97706']
  const rows: [number, number, number][] = []
  // bottom row of 3, middle of 2, top of 1
  for (let i = 0; i < 3; i++) rows.push([x - 0.28 + i * 0.28, 0.18, z])
  for (let i = 0; i < 2; i++) rows.push([x - 0.14 + i * 0.28, 0.48, z])
  rows.push([x, 0.78, z])
  return (
    <>
      {rows.map((p, i) => (
        <Can key={i} position={p} color={colors[i % colors.length]} />
      ))}
    </>
  )
}

export function Obstacles() {
  return (
    <>
      <BoxStack position={[-3, 0, 2]} />
      <BoxStack position={[3, 0, -5]} />
      <Pallet position={[3, 0, 7]} />
      <CanPyramid position={[-9, 0, -1]} />
      <CanPyramid position={[9, 0, 2]} />

      {/* Slippery puddles in the walking lanes — cart loses grip on these. */}
      {PUDDLES.map((p, i) => (
        <Puddle key={i} position={p.position} size={p.size} />
      ))}

      {/* Wet-floor cones marking the puddles. */}
      <WetFloorCone position={[-3, 0, 0]} />
      <WetFloorCone position={[3.4, 0, 3]} />
      <WetFloorCone position={[1.2, 0, 6.6]} />
    </>
  )
}
