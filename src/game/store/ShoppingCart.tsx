import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { Text } from '@react-three/drei'
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
  return (
    <RigidBody
      type="dynamic"
      colliders={false}
      position={position}
      userData={{ cart: true }}
      enabledRotations={[false, true, false]}
      linearDamping={0.7}
      angularDamping={1.2}
      canSleep={false}
    >
      {/* Wheels (visual) */}
      <Wheel position={[-0.34, 0.12, 0.5]} />
      <Wheel position={[0.34, 0.12, 0.5]} />
      <Wheel position={[-0.34, 0.12, -0.5]} />
      <Wheel position={[0.34, 0.12, -0.5]} />

      {/* Lower frame */}
      <mesh position={[0, 0.24, 0]} castShadow>
        <boxGeometry args={[0.78, 0.1, 1.08]} />
        <meshStandardMaterial color={FRAME} metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Basket floor */}
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

      {/* Basket walls */}
      <BasketWall position={[-0.4, 0.8, 0]} size={[0.04, 0.55, 1.08]} />
      <BasketWall position={[0.4, 0.8, 0]} size={[0.04, 0.55, 1.08]} />
      <BasketWall position={[0, 0.8, 0.54]} size={[0.84, 0.55, 0.04]} />
      <BasketWall position={[0, 0.8, -0.54]} size={[0.84, 0.55, 0.04]} />

      {/* Horizontal accent bars */}
      {[0.62, 0.78, 0.94].map((y) => (
        <mesh key={y} position={[0, y, 0.54]}>
          <boxGeometry args={[0.86, 0.03, 0.06]} />
          <meshStandardMaterial color={FRAME} metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {/* Handle */}
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

      {/* Count label */}
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

      {/* Physics colliders */}
      <CuboidCollider
        args={[0.4, 0.12, 0.56]}
        position={[0, 0.22, 0]}
        friction={0.4}
        density={1.4}
      />
      <CuboidCollider args={[0.4, 0.03, 0.54]} position={[0, 0.52, 0]} density={0.3} />
      <CuboidCollider args={[0.03, 0.27, 0.54]} position={[-0.4, 0.8, 0]} density={0.2} />
      <CuboidCollider args={[0.03, 0.27, 0.54]} position={[0.4, 0.8, 0]} density={0.2} />
      <CuboidCollider args={[0.4, 0.27, 0.03]} position={[0, 0.8, 0.54]} density={0.2} />
      <CuboidCollider args={[0.4, 0.27, 0.03]} position={[0, 0.8, -0.54]} density={0.2} />

      {/* Done-detection sensor (basket interior) */}
      <CuboidCollider
        args={[0.37, 0.25, 0.52]}
        position={[0, 0.8, 0]}
        sensor
        density={0}
        onIntersectionEnter={({ other }) => {
          const itemId = (other.rigidBody?.userData as { itemId?: string })
            ?.itemId
          if (typeof itemId === 'string') setDone(itemId, true)
        }}
        onIntersectionExit={({ other }) => {
          const itemId = (other.rigidBody?.userData as { itemId?: string })
            ?.itemId
          if (typeof itemId === 'string') setDone(itemId, false)
        }}
      />
    </RigidBody>
  )
}
