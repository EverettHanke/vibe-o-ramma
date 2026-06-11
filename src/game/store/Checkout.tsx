import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { Text } from '@react-three/drei'
import { useRef } from 'react'
import { getSnapshot } from '@/state/groceryStore'
import { openReceipt } from '@/state/checkoutStore'

interface CheckoutProps {
  position?: [number, number, number]
}

export function Checkout({ position = [2.4, 0, 9] }: CheckoutProps) {
  const insideRef = useRef(false)

  return (
    <group position={position}>
      {/* Counter stand */}
      <RigidBody type="fixed" colliders={false}>
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.3, 1.0, 2.6]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        {/* Conveyor belt top */}
        <mesh position={[0, 1.02, 0]}>
          <boxGeometry args={[1.0, 0.06, 2.4]} />
          <meshStandardMaterial color="#1f2937" roughness={0.8} />
        </mesh>
        {/* Register */}
        <mesh position={[0, 1.25, -0.9]} castShadow>
          <boxGeometry args={[0.6, 0.4, 0.5]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh position={[0, 1.45, -0.7]} rotation={[-0.4, 0, 0]}>
          <boxGeometry args={[0.5, 0.3, 0.04]} />
          <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.6} />
        </mesh>
        <CuboidCollider args={[0.65, 0.5, 1.3]} position={[0, 0.5, 0]} />
      </RigidBody>

      {/* Checkout sign */}
      <mesh position={[-1.0, 2.6, 0]}>
        <boxGeometry args={[0.1, 0.7, 2.2]} />
        <meshStandardMaterial color="#16a34a" emissive="#16a34a" emissiveIntensity={0.4} />
      </mesh>
      <Text
        position={[-1.06, 2.6, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        CHECKOUT
      </Text>

      {/* Lane pole markers */}
      <mesh position={[-1.6, 0.5, 1.3]}>
        <cylinderGeometry args={[0.05, 0.05, 1.0, 8]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      <mesh position={[-1.6, 0.5, -1.3]}>
        <cylinderGeometry args={[0.05, 0.05, 1.0, 8]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>

      {/* Cart detection zone in the lane */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[0.7, 0.8, 1.2]}
          position={[-1.05, 0.8, 0]}
          sensor
          onIntersectionEnter={({ other }) => {
            const data = other.rigidBody?.userData as { cart?: boolean }
            if (!data?.cart || insideRef.current) return
            insideRef.current = true
            const items = getSnapshot()
              .filter((item) => item.done)
              .map((item) => item.name)
            openReceipt(items)
          }}
          onIntersectionExit={({ other }) => {
            const data = other.rigidBody?.userData as { cart?: boolean }
            if (data?.cart) insideRef.current = false
          }}
        />
      </RigidBody>
    </group>
  )
}
