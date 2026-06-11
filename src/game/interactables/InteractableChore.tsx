import { CuboidCollider, RigidBody } from '@react-three/rapier'
import type { RapierCollider } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import type * as THREE from 'three'
import type { Character } from '@/core/Character'
import type { IInteractable } from '@/core/Interaction'
import { useQuests, type ChoreKind } from '@/game/quests/QuestContext'
import { useInteractableCollider } from './useInteractableCollider'

interface InteractableChoreProps {
  questId: string
  kind: ChoreKind
  position: [number, number, number]
}

function BonePile() {
  return (
    <group>
      {[
        [0, 0.08, 0],
        [0.25, 0.06, 0.15],
        [-0.2, 0.07, 0.1],
        [0.1, 0.05, -0.22],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, i * 0.8, Math.PI / 2]} castShadow>
          <capsuleGeometry args={[0.04, 0.18, 4, 8]} />
          <meshStandardMaterial color="#e7e5e4" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0.45, 0.15, -0.05]} rotation={[0.3, 0.5, -0.4]} castShadow>
        <boxGeometry args={[0.08, 0.5, 0.06]} />
        <meshStandardMaterial color="#78716c" />
      </mesh>
    </group>
  )
}

function CoinPile() {
  return (
    <group>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh
          key={i}
          position={[(i % 3) * 0.14 - 0.14, 0.04 + Math.floor(i / 3) * 0.07, (i % 2) * 0.12]}
          castShadow
        >
          <cylinderGeometry args={[0.16, 0.16, 0.06, 12]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#b45309"
            emissiveIntensity={0.25}
            metalness={0.6}
            roughness={0.35}
          />
        </mesh>
      ))}
    </group>
  )
}

function BossMonster({ fed }: { fed: boolean }) {
  return (
    <group>
      <mesh position={[0, 0.55, 0]} castShadow>
        <sphereGeometry args={[0.55, 12, 12]} />
        <meshStandardMaterial
          color={fed ? '#6b7280' : '#7c3aed'}
          emissive={fed ? '#374151' : '#5b21b6'}
          emissiveIntensity={fed ? 0.1 : 0.35}
        />
      </mesh>
      <mesh position={[-0.18, 0.72, 0.42]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.18, 0.72, 0.42]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.75, 0.12, 0.35]} castShadow>
        <cylinderGeometry args={[0.22, 0.26, 0.18, 8]} />
        <meshStandardMaterial color="#57534e" />
      </mesh>
      {!fed && (
        <mesh position={[0.75, 0.28, 0.35]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#854d0e" emissive="#713f12" emissiveIntensity={0.3} />
        </mesh>
      )}
    </group>
  )
}

function ChoreProp({ kind, fed }: { kind: ChoreKind; fed: boolean }) {
  switch (kind) {
    case 'bones':
      return <BonePile />
    case 'coins':
      return <CoinPile />
    case 'boss':
      return <BossMonster fed={fed} />
  }
}

export function InteractableChore({ questId, kind, position }: InteractableChoreProps) {
  const colliderRef = useRef<RapierCollider>(null)
  const groupRef = useRef<THREE.Group>(null)
  const { quests, completeQuest, canStartChore } = useQuests()
  const quest = quests.find((q) => q.id === questId)
  const completed = quest?.completed ?? false
  const locked = !canStartChore(questId)

  const [poofing, setPoofing] = useState(false)
  const poofProgress = useRef(0)

  const actionLabel =
    kind === 'bones'
      ? 'Sweep the bones'
      : kind === 'coins'
        ? 'Count the coins'
        : 'Feed the boss monster'

  const interactable = useMemo<IInteractable>(
    () => ({
      id: questId,
      prompt: completed
        ? `${actionLabel} — done ✓`
        : locked
          ? `${actionLabel} — finish the other chores first`
          : `${actionLabel} [E]`,
      onInteract: (_actor: Character) => {
        if (completed || poofing || locked) return
        if (kind === 'boss') {
          completeQuest(questId)
          return
        }
        setPoofing(true)
        poofProgress.current = 0
        completeQuest(questId)
      },
      canInteract: () => !completed && !poofing && !locked,
    }),
    [questId, actionLabel, completed, poofing, locked, kind, completeQuest],
  )

  useInteractableCollider(colliderRef, interactable)

  useFrame((_, delta) => {
    if (!poofing || !groupRef.current) return
    poofProgress.current += delta * 2.5
    const t = Math.min(poofProgress.current, 1)
    groupRef.current.scale.setScalar(1 - t * 0.35)
  })

  const colliderSize: [number, number, number] =
    kind === 'boss' ? [1.2, 1.2, 1.2] : [0.8, 0.6, 0.8]

  return (
    <RigidBody type="fixed" position={position} colliders={false}>
      <group ref={groupRef} position={[0, kind === 'boss' ? 0 : 0.15, 0]}>
        <ChoreProp kind={kind} fed={completed} />
      </group>
      <CuboidCollider ref={colliderRef} args={colliderSize} position={[0, 0.4, 0]} />
    </RigidBody>
  )
}
