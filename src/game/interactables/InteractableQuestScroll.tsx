import { CuboidCollider, RigidBody } from '@react-three/rapier'
import type { RapierCollider } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import type * as THREE from 'three'
import type { Character } from '@/core/Character'
import type { IInteractable } from '@/core/Interaction'
import { useQuests } from '@/game/quests/QuestContext'
import { useInteractableCollider } from './useInteractableCollider'

interface InteractableQuestScrollProps {
  questId: string
  epicTitle: string
  emissiveColor?: string
  scale?: number
  position: [number, number, number]
}

export function InteractableQuestScroll({
  questId,
  epicTitle,
  emissiveColor = '#d4a574',
  scale = 1,
  position,
}: InteractableQuestScrollProps) {
  const colliderRef = useRef<RapierCollider>(null)
  const groupRef = useRef<THREE.Group>(null)
  const { quests, completeQuest } = useQuests()
  const quest = quests.find((q) => q.id === questId)
  const completed = quest?.completed ?? false

  const [poofing, setPoofing] = useState(false)
  const [poofDone, setPoofDone] = useState(false)
  const poofProgress = useRef(0)

  const shortTitle =
    epicTitle.length > 28 ? `${epicTitle.slice(0, 25)}…` : epicTitle

  const interactable = useMemo<IInteractable>(
    () => ({
      id: questId,
      prompt: completed
        ? 'Quest complete ✓'
        : `Turn in: ${shortTitle} [E]`,
      onInteract: (_actor: Character) => {
        if (completed || poofing) return
        setPoofing(true)
        poofProgress.current = 0
        completeQuest(questId)
      },
      canInteract: () => !completed && !poofing,
    }),
    [questId, epicTitle, shortTitle, completed, poofing, completeQuest],
  )

  useInteractableCollider(colliderRef, interactable)

  useFrame((_, delta) => {
    if (!poofing || !groupRef.current) return
    poofProgress.current += delta * 2.5
    const t = Math.min(poofProgress.current, 1)
    groupRef.current.scale.setScalar(scale * (1 - t * 0.8))
    groupRef.current.position.y = position[1] + t * 0.5
    if (t >= 1) setPoofDone(true)
  })

  if (poofDone) return null

  const emissiveIntensity = poofing ? 1.2 : completed ? 0 : 0.35

  return (
    <RigidBody type="fixed" position={position} colliders={false}>
      <group ref={groupRef} scale={scale}>
        <mesh castShadow rotation={[0.3, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.35, 8]} />
          <meshStandardMaterial
            color="#f5e6c8"
            emissive={poofing ? '#fbbf24' : emissiveColor}
            emissiveIntensity={emissiveIntensity}
          />
        </mesh>
        <mesh position={[0, 0.22, 0]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.08, 0.12, 0.08]} />
          <meshStandardMaterial color="#e8d5b0" />
        </mesh>
      </group>
      <CuboidCollider ref={colliderRef} args={[0.15, 0.25, 0.15]} />
    </RigidBody>
  )
}
