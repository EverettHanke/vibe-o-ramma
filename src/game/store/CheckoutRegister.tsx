import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { Text } from '@react-three/drei'
import { useMemo } from 'react'
import type { Character } from '@/core/Character'
import type { IInteractable } from '@/core/Interaction'
import { useInteractableCollider } from '@/game/interactables/useInteractableCollider'
import { useRef } from 'react'
import type { RapierCollider } from '@react-three/rapier'
import {
  completeCheckout,
  getCheckedOut,
  setCartAtRegister,
} from '@/state/runStore'
import { REGISTER_ZONE } from './layout'

function isCart(other: { rigidBody?: { userData?: unknown } | null }): boolean {
  return (other.rigidBody?.userData as { isCart?: boolean })?.isCart === true
}

export function CheckoutRegister() {
  const colliderRef = useRef<RapierCollider>(null)
  const [x, , z] = REGISTER_ZONE.position
  const [w, , d] = REGISTER_ZONE.size

  const interactable = useMemo<IInteractable>(
    () => ({
      id: 'checkout',
      prompt: getCheckedOut()
        ? 'Run complete — nice haul!'
        : 'Push cart here to checkout [auto]',
      onInteract: (_actor: Character) => {
        if (!getCheckedOut()) completeCheckout()
      },
      canInteract: () => false,
    }),
    [],
  )

  useInteractableCollider(colliderRef, interactable)

  return (
    <group>
      {/* Checkout counter */}
      <RigidBody type="fixed" colliders={false} position={[x, 0.55, z]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[w, 1.1, 0.7]} />
          <meshStandardMaterial color="#78716c" roughness={0.7} />
        </mesh>
        <CuboidCollider args={[w / 2, 0.55, 0.35]} />
      </RigidBody>

      {/* Belt / lane marker */}
      <mesh position={[x, 0.03, z - 0.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w - 0.5, d]} />
        <meshStandardMaterial
          color="#22c55e"
          transparent
          opacity={0.25}
          emissive="#16a34a"
          emissiveIntensity={0.2}
        />
      </mesh>

      <Text
        position={[x, 2.2, z]}
        fontSize={0.55}
        color="#16a34a"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#14532d"
      >
        CHECKOUT
      </Text>

      {/* Cart detection + optional interact zone */}
      <RigidBody type="fixed" colliders={false} position={[x, 0.4, z]}>
        <CuboidCollider
          ref={colliderRef}
          args={[w / 2 - 0.3, 0.5, d / 2]}
          sensor
          onIntersectionEnter={({ other }) => {
            if (!isCart(other)) return
            setCartAtRegister(true)
            if (!getCheckedOut()) completeCheckout()
          }}
          onIntersectionExit={({ other }) => {
            if (!isCart(other)) return
            setCartAtRegister(false)
          }}
        />
      </RigidBody>
    </group>
  )
}
