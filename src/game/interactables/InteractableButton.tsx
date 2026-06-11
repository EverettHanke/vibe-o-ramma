import { CuboidCollider, RigidBody } from '@react-three/rapier'
import type { RapierCollider } from '@react-three/rapier'
import { useMemo, useRef } from 'react'
import type { Character } from '@/core/Character'
import type { IInteractable } from '@/core/Interaction'
import { useInteractableCollider } from './useInteractableCollider'

interface InteractableButtonProps {
  position?: [number, number, number]
  pressed: boolean
  onPress: () => void
}

export function InteractableButton({
  position = [-4, 1.1, -3],
  pressed,
  onPress,
}: InteractableButtonProps) {
  const colliderRef = useRef<RapierCollider>(null)

  const interactable = useMemo<IInteractable>(
    () => ({
      id: 'button',
      prompt: pressed ? 'Button active' : 'Press button [E]',
      onInteract: (_actor: Character) => onPress(),
      canInteract: () => !pressed,
    }),
    [pressed, onPress],
  )

  useInteractableCollider(colliderRef, interactable)

  return (
    <RigidBody type="fixed" position={position} colliders={false}>
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.2, 0.6]} />
        <meshStandardMaterial
          color={pressed ? '#22c55e' : '#ef4444'}
          emissive={pressed ? '#166534' : '#7f1d1d'}
          emissiveIntensity={pressed ? 0.8 : 0.3}
        />
      </mesh>
      <CuboidCollider ref={colliderRef} args={[0.3, 0.1, 0.3]} />
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.3, 0.15, 0.3]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
    </RigidBody>
  )
}
