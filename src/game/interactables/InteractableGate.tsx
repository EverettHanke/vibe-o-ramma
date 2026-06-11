import { CuboidCollider, RigidBody } from '@react-three/rapier'
import type { RapierCollider } from '@react-three/rapier'
import { useMemo, useRef } from 'react'
import type { Character } from '@/core/Character'
import type { IInteractable } from '@/core/Interaction'
import { useQuests } from '@/game/quests/QuestContext'
import { useInteractableCollider } from './useInteractableCollider'

interface InteractableGateProps {
  position: [number, number, number]
  size: [number, number, number]
  /** Quest ids that must be complete before the gate opens. */
  requires: string[]
}

export function InteractableGate({ position, size, requires }: InteractableGateProps) {
  const colliderRef = useRef<RapierCollider>(null)
  const { quests } = useQuests()

  const unlocked = requires.every((id) => quests.find((q) => q.id === id)?.completed)

  const interactable = useMemo<IInteractable>(
    () => ({
      id: 'boss-gate',
      prompt: unlocked
        ? 'Gate open — the boss awaits'
        : 'Locked — sweep bones & count coins first',
      onInteract: (_actor: Character) => {},
      canInteract: () => false,
    }),
    [unlocked],
  )

  useInteractableCollider(colliderRef, interactable)

  if (unlocked) return null

  const [w, h, d] = size
  return (
    <RigidBody type="fixed" position={position} colliders={false}>
      <mesh castShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color="#44403c"
          emissive="#7f1d1d"
          emissiveIntensity={0.2}
        />
      </mesh>
      <CuboidCollider ref={colliderRef} args={[w / 2, h / 2, d / 2]} />
    </RigidBody>
  )
}
