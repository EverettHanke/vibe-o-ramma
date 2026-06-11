import { Text } from '@react-three/drei'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { useLayout } from '@/game/dungeon/LayoutContext'
import { WALL_H } from '@/game/dungeon/dungeonLayout'
import { InteractableChore } from '../interactables/InteractableChore'
import { InteractableGate } from '../interactables/InteractableGate'
import { useQuests } from '@/game/quests/QuestContext'

function StoneWall({
  position,
  size,
}: {
  position: [number, number, number]
  size: [number, number, number]
}) {
  const [w, h, d] = size
  return (
    <RigidBody type="fixed" position={position} colliders={false}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#4b5563" roughness={0.9} />
      </mesh>
      <CuboidCollider args={[w / 2, h / 2, d / 2]} />
    </RigidBody>
  )
}

function Torch({ position, index }: { position: [number, number, number]; index: number }) {
  const { completedCount } = useQuests()
  const brightened = completedCount > index % 3
  const intensity = brightened ? 3.2 : 2.2

  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.12, 0.35, 0.12]} />
        <meshStandardMaterial color="#44403c" />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[0.18, 0.2, 0.18]} />
        <meshStandardMaterial
          color="#f97316"
          emissive="#ea580c"
          emissiveIntensity={brightened ? 1.8 : 1.2}
        />
      </mesh>
      <pointLight
        position={[0, 0.35, 0.15]}
        intensity={intensity}
        color="#fbbf24"
        distance={10}
        decay={2}
        castShadow
      />
    </group>
  )
}

function DutyBoard() {
  const { completedCount, quests } = useQuests()

  return (
    <group position={[0, 2, -2.8]}>
      <mesh>
        <boxGeometry args={[2.8, 1.6, 0.08]} />
        <meshStandardMaterial color="#3f3f46" roughness={0.9} />
      </mesh>
      <Text
        position={[0, 0.45, 0.05]}
        fontSize={0.13}
        color="#fbbf24"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.5}
      >
        DUNGEON KEEPER DUTIES
      </Text>
      <Text
        position={[0, 0.05, 0.05]}
        fontSize={0.1}
        color="#e5e7eb"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.5}
      >
        {completedCount}/{quests.length} chores done today
      </Text>
      <Text
        position={[0, -0.35, 0.05]}
        fontSize={0.09}
        color="#9ca3af"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.5}
      >
        The dungeon won&apos;t maintain itself. Probably.
      </Text>
    </group>
  )
}

export function SideQuestDungeon() {
  const { derived } = useLayout()
  const { quests } = useQuests()
  const { walls, chores, torches, gate, floorSize } = derived

  return (
    <>
      <RigidBody type="fixed" position={[0, -0.25, 0]} colliders={false}>
        <mesh receiveShadow>
          <boxGeometry args={[floorSize, 0.5, floorSize]} />
          <meshStandardMaterial color="#374151" roughness={0.95} />
        </mesh>
        <CuboidCollider args={[floorSize / 2, 0.25, floorSize / 2]} />
      </RigidBody>

      <RigidBody type="fixed" position={[0, WALL_H + 0.1, 0]} colliders={false}>
        <mesh receiveShadow>
          <boxGeometry args={[floorSize, 0.2, floorSize]} />
          <meshStandardMaterial color="#374151" roughness={0.95} />
        </mesh>
        <CuboidCollider args={[floorSize / 2, 0.1, floorSize / 2]} />
      </RigidBody>

      {walls.map((wall, i) => (
        <StoneWall key={i} position={wall.position} size={wall.size} />
      ))}

      {gate && (
        <InteractableGate
          position={gate.position}
          size={gate.size}
          requires={['sweep-bones', 'count-coins']}
        />
      )}

      {chores.map(({ questId, position }) => {
        const quest = quests.find((q) => q.id === questId)
        if (!quest) return null
        return (
          <InteractableChore
            key={questId}
            questId={questId}
            kind={quest.kind}
            position={position}
          />
        )
      })}

      {torches.map((pos, i) => (
        <Torch key={i} position={pos} index={i} />
      ))}

      <DutyBoard />
    </>
  )
}
