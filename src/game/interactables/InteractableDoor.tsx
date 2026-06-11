import { CuboidCollider, RigidBody } from '@react-three/rapier'
import type { RapierCollider } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type * as THREE from 'three'
import type { Character } from '@/core/Character'
import type { IInteractable } from '@/core/Interaction'
import { useInteractableCollider } from './useInteractableCollider'

interface InteractableDoorProps {
  position?: [number, number, number]
  isOpen: boolean
  onToggle: () => void
}

export function InteractableDoor({
  position = [6, 1.5, 0],
  isOpen,
  onToggle,
}: InteractableDoorProps) {
  const colliderRef = useRef<RapierCollider>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const closedX = position[0]
  const openX = closedX + 2.5
  const targetX = isOpen ? openX : closedX

  const interactable = useMemo<IInteractable>(
    () => ({
      id: 'door',
      prompt: isOpen ? 'Close door [E]' : 'Open door [E]',
      onInteract: (_actor: Character) => onToggle(),
    }),
    [isOpen, onToggle],
  )

  useInteractableCollider(colliderRef, interactable)

  useFrame((_, delta) => {
    if (!meshRef.current) return
    const t = 1 - Math.exp(-10 * delta)
    meshRef.current.position.x += (targetX - meshRef.current.position.x) * t
  })

  return (
    <RigidBody type="fixed" position={position} colliders={false}>
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[0.2, 3, 2]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <CuboidCollider ref={colliderRef} args={[0.1, 1.5, 1]} />
    </RigidBody>
  )
}
