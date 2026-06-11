import { Text } from '@react-three/drei'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { useQuests } from '@/game/quests/QuestContext'
import {
  BOSS_GATE,
  CHORES,
  DUNGEON_WALLS,
  ROOM_LABELS,
  SPAWN,
  TORCHES,
  WALL_H,
} from '@/game/dungeon/dungeonLayout'
import { InteractableChore } from '../interactables/InteractableChore'
import { InteractableGate } from '../interactables/InteractableGate'

const FLOOR_SIZE = 36

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

function RoomLabel({
  position,
  title,
  rotationY = 0,
}: {
  position: [number, number, number]
  title: string
  rotationY?: number
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <Text
        fontSize={0.22}
        color="#fbbf24"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#1c1917"
      >
        {title}
      </Text>
    </group>
  )
}

function DutyBoard() {
  const { completedCount, quests } = useQuests()

  return (
    <group position={[0, 2, -2.8]} rotation={[0, 0, 0]}>
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
        The dungeon won't maintain itself. Probably.
      </Text>
    </group>
  )
}

export function SideQuestDungeon() {
  const { quests } = useQuests()

  return (
    <>
      <RigidBody type="fixed" position={[0, -0.25, 0]} colliders={false}>
        <mesh receiveShadow>
          <boxGeometry args={[FLOOR_SIZE, 0.5, FLOOR_SIZE]} />
          <meshStandardMaterial color="#374151" roughness={0.95} />
        </mesh>
        <CuboidCollider args={[FLOOR_SIZE / 2, 0.25, FLOOR_SIZE / 2]} />
      </RigidBody>

      <RigidBody type="fixed" position={[0, WALL_H + 0.1, 0]} colliders={false}>
        <mesh receiveShadow>
          <boxGeometry args={[FLOOR_SIZE, 0.2, FLOOR_SIZE]} />
          <meshStandardMaterial color="#374151" roughness={0.95} />
        </mesh>
        <CuboidCollider args={[FLOOR_SIZE / 2, 0.1, FLOOR_SIZE / 2]} />
      </RigidBody>

      {DUNGEON_WALLS.map((wall, i) => (
        <StoneWall key={i} position={wall.position} size={wall.size} />
      ))}

      <InteractableGate
        position={BOSS_GATE.position}
        size={BOSS_GATE.size}
        requires={['sweep-bones', 'count-coins']}
      />

      {CHORES.map(({ questId, position }) => {
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

      {TORCHES.map((pos, i) => (
        <Torch key={i} position={pos} index={i} />
      ))}

      {ROOM_LABELS.map((label) => (
        <RoomLabel key={label.title} {...label} />
      ))}

      <DutyBoard />
    </>
  )
}

export { SPAWN as DUNGEON_SPAWN }
