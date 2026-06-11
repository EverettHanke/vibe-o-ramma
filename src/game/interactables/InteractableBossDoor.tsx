import { CuboidCollider, RigidBody } from '@react-three/rapier'
import type { RapierCollider } from '@react-three/rapier'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type * as THREE from 'three'
import type { Character } from '@/core/Character'
import type { IInteractable } from '@/core/Interaction'
import { useQuests } from '@/game/quests/QuestContext'
import { useInteractableCollider } from './useInteractableCollider'

interface InteractableBossDoorProps {
  position?: [number, number, number]
}

export function InteractableBossDoor({
  position = [0, 1.5, -4.85],
}: InteractableBossDoorProps) {
  const colliderRef = useRef<RapierCollider>(null)
  const doorRef = useRef<THREE.Group>(null)
  const { allComplete, bossDoorOpened, openBossDoor } = useQuests()

  const isOpen = allComplete && bossDoorOpened
  const openOffset = -2.2

  const interactable = useMemo<IInteractable>(
    () => ({
      id: 'boss-door',
      prompt: !allComplete
        ? 'The FINAL BOSS awaits… finish your side quests first'
        : isOpen
          ? '…it is the same dungeon. Of course it is.'
          : 'Enter FINAL BOSS chamber [E]',
      onInteract: (_actor: Character) => {
        if (!allComplete) return
        if (!bossDoorOpened) openBossDoor()
      },
      canInteract: () => allComplete && !bossDoorOpened,
    }),
    [allComplete, isOpen, bossDoorOpened, openBossDoor],
  )

  useInteractableCollider(colliderRef, interactable)

  useFrame((_, delta) => {
    if (!doorRef.current) return
    const targetZ = isOpen ? openOffset : 0
    const t = 1 - Math.exp(-8 * delta)
    doorRef.current.position.z += (targetZ - doorRef.current.position.z) * t
  })

  return (
    <group position={[position[0], 0, 0]}>
      <RigidBody type="fixed" position={[0, position[1], position[2]]} colliders={false}>
        <group ref={doorRef} position={[0, 0, 0]}>
          <mesh castShadow position={[0, 0, 0]}>
            <boxGeometry args={[2.2, 3, 0.25]} />
            <meshStandardMaterial
              color={allComplete ? '#4a3728' : '#2d2d2d'}
              emissive={allComplete ? '#78350f' : '#000000'}
              emissiveIntensity={allComplete ? 0.25 : 0}
            />
          </mesh>
          <Text
            position={[0, 0.5, 0.14]}
            fontSize={0.18}
            color={allComplete ? '#fbbf24' : '#6b7280'}
            anchorX="center"
            anchorY="middle"
            maxWidth={2}
          >
            FINAL BOSS
          </Text>
        </group>
        {!isOpen && (
          <CuboidCollider ref={colliderRef} args={[1.1, 1.5, 0.15]} />
        )}
      </RigidBody>
    </group>
  )
}
