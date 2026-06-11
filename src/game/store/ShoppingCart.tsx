import { CuboidCollider, RigidBody } from '@react-three/rapier'
import type { RapierRigidBody } from '@react-three/rapier'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { getCartGrip } from '@/state/cartPhysicsStore'
import { setDone } from '@/state/groceryStore'

interface ShoppingCartProps {
  position?: [number, number, number]
  count?: number
}

const METAL = '#9ca3af'
const FRAME = '#3f3f46'
const WHEEL = '#18181b'

function Wheel({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
      <meshStandardMaterial color={WHEEL} />
    </mesh>
  )
}

function BasketWall(props: {
  position: [number, number, number]
  size: [number, number, number]
}) {
  return (
    <mesh position={props.position} castShadow>
      <boxGeometry args={props.size} />
      <meshStandardMaterial
        color={METAL}
        metalness={0.6}
        roughness={0.4}
        transparent
        opacity={0.55}
      />
    </mesh>
  )
}

export function ShoppingCart({
  position = [2, 0, 3],
  count = 0,
}: ShoppingCartProps) {
  const bodyRef = useRef<RapierRigidBody>(null)

  useFrame(() => {
    const body = bodyRef.current
    if (!body) return

    const grip = getCartGrip()
    if (grip >= 0.98) return

    const slip = 1 - grip
    const vel = body.linvel()
    const drift = slip * 2.2

    body.setLinvel(
      {
        x: vel.x * (1 + slip * 0.12) + (Math.random() - 0.5) * drift,
        y: vel.y,
        z: vel.z * (1 + slip * 0.12) + (Math.random() - 0.5) * drift,
      },
      true,
    )

    const ang = body.angvel()
    body.setAngvel(
      {
        x: ang.x,
        y: ang.y + (Math.random() - 0.5) * slip * 1.8,
        z: ang.z,
      },
      true,
    )
  })

  return (
    <RigidBody
      ref={bodyRef}
      type="dynamic"
      colliders={false}
      position={position}
      enabledRotations={[false, true, false]}
      linearDamping={0.55}
      angularDamping={0.9}
      canSleep={false}
      userData={{ isCart: true }}
    >
      <Wheel position={[-0.34, 0.12, 0.5]} />
      <Wheel position={[0.34, 0.12, 0.5]} />
      <Wheel position={[-0.34, 0.12, -0.5]} />
      <Wheel position={[0.34, 0.12, -0.5]} />

      <mesh position={[0, 0.24, 0]} castShadow>
        <boxGeometry args={[0.78, 0.1, 1.08]} />
        <meshStandardMaterial color={FRAME} metalness={0.5} roughness={0.5} />
      </mesh>

      <mesh position={[0, 0.52, 0]} castShadow>
        <boxGeometry args={[0.82, 0.06, 1.08]} />
        <meshStandardMaterial
          color={METAL}
          metalness={0.6}
          roughness={0.4}
          transparent
          opacity={0.6}
        />
      </mesh>

      <BasketWall position={[-0.4, 0.8, 0]} size={[0.04, 0.55, 1.08]} />
      <BasketWall position={[0.4, 0.8, 0]} size={[0.04, 0.55, 1.08]} />
      <BasketWall position={[0, 0.8, 0.54]} size={[0.84, 0.55, 0.04]} />
      <BasketWall position={[0, 0.8, -0.54]} size={[0.84, 0.55, 0.04]} />

      {[0.62, 0.78, 0.94].map((y) => (
        <mesh key={y} position={[0, y, 0.54]}>
          <boxGeometry args={[0.86, 0.03, 0.06]} />
          <meshStandardMaterial color={FRAME} metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      <mesh position={[-0.38, 1.2, -0.56]} castShadow>
        <boxGeometry args={[0.05, 0.32, 0.05]} />
        <meshStandardMaterial color={FRAME} />
      </mesh>
      <mesh position={[0.38, 1.2, -0.56]} castShadow>
        <boxGeometry args={[0.05, 0.32, 0.05]} />
        <meshStandardMaterial color={FRAME} />
      </mesh>
      <mesh position={[0, 1.36, -0.56]} castShadow>
        <boxGeometry args={[0.86, 0.05, 0.05]} />
        <meshStandardMaterial color="#ef4444" metalness={0.3} roughness={0.6} />
      </mesh>

      <Text
        position={[0, 1.55, -0.56]}
        fontSize={0.18}
        color="#1c1917"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#ffffff"
      >
        {`Cart (${count})`}
      </Text>

      <CuboidCollider
        args={[0.4, 0.12, 0.56]}
        position={[0, 0.22, 0]}
        friction={0.35}
        density={1.4}
      />
      <CuboidCollider args={[0.4, 0.03, 0.54]} position={[0, 0.52, 0]} density={0.3} />
      <CuboidCollider args={[0.03, 0.27, 0.54]} position={[-0.4, 0.8, 0]} density={0.2} />
      <CuboidCollider args={[0.03, 0.27, 0.54]} position={[0.4, 0.8, 0]} density={0.2} />
      <CuboidCollider args={[0.4, 0.27, 0.03]} position={[0, 0.8, 0.54]} density={0.2} />
      <CuboidCollider args={[0.4, 0.27, 0.03]} position={[0, 0.8, -0.54]} density={0.2} />

      <CuboidCollider
        args={[0.37, 0.25, 0.52]}
        position={[0, 0.8, 0]}
        sensor
        density={0}
        onIntersectionEnter={({ other }) => {
          const itemId = (other.rigidBody?.userData as { itemId?: string })?.itemId
          if (typeof itemId === 'string') setDone(itemId, true)
        }}
        onIntersectionExit={({ other }) => {
          const itemId = (other.rigidBody?.userData as { itemId?: string })?.itemId
          if (typeof itemId === 'string') setDone(itemId, false)
        }}
      />
    </RigidBody>
  )
}
