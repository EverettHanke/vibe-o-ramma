import { Text } from '@react-three/drei'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { useQuests } from '@/game/quests/QuestContext'
import { InteractableBossDoor } from '../interactables/InteractableBossDoor'
import { InteractableQuestScroll } from '../interactables/InteractableQuestScroll'

const CHAMBER = 10
const WALL_H = 4
const HALF = CHAMBER / 2

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

function Pedestal({ position }: { position: [number, number, number] }) {
  return (
    <RigidBody type="fixed" position={position} colliders={false}>
      <mesh castShadow receiveShadow position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.35, 0.4, 0.5, 8]} />
        <meshStandardMaterial color="#57534e" roughness={0.85} />
      </mesh>
      <CuboidCollider args={[0.4, 0.25, 0.4]} position={[0, 0.25, 0]} />
    </RigidBody>
  )
}

function Torch({
  position,
  index,
}: {
  position: [number, number, number]
  index: number
}) {
  const { completedCount } = useQuests()
  const brightened = completedCount > index
  const intensity = brightened ? 2.2 : 1.2

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
          emissiveIntensity={brightened ? 1.4 : 0.8}
        />
      </mesh>
      <pointLight
        position={[0, 0.35, 0.15]}
        intensity={intensity}
        color="#fbbf24"
        distance={6}
        castShadow
      />
    </group>
  )
}

function QuestBoard() {
  return (
    <group position={[4.2, 2.2, 3.8]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh>
        <boxGeometry args={[2.4, 1.2, 0.08]} />
        <meshStandardMaterial color="#3f3f46" roughness={0.9} />
      </mesh>
      <Text
        position={[0, 0.25, 0.05]}
        fontSize={0.14}
        color="#fbbf24"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.2}
      >
        MAIN QUEST
      </Text>
      <Text
        position={[0, -0.05, 0.05]}
        fontSize={0.11}
        color="#e5e7eb"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.2}
      >
        Be a functional person
      </Text>
      <Text
        position={[-0.85, -0.35, 0.05]}
        fontSize={0.16}
        color="#6b7280"
        anchorX="center"
        anchorY="middle"
      >
        ☐
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
          <boxGeometry args={[CHAMBER, 0.5, CHAMBER]} />
          <meshStandardMaterial color="#374151" roughness={0.95} />
        </mesh>
        <CuboidCollider args={[HALF, 0.25, HALF]} />
      </RigidBody>

      <StoneWall position={[0, WALL_H / 2, -HALF]} size={[CHAMBER, WALL_H, 0.4]} />
      <StoneWall position={[0, WALL_H / 2, HALF]} size={[CHAMBER, WALL_H, 0.4]} />
      <StoneWall position={[-HALF, WALL_H / 2, 0]} size={[0.4, WALL_H, CHAMBER]} />
      <StoneWall position={[HALF, WALL_H / 2, 0]} size={[0.4, WALL_H, CHAMBER]} />

      <RigidBody type="fixed" position={[0, WALL_H + 0.1, 0]} colliders={false}>
        <mesh receiveShadow>
          <boxGeometry args={[CHAMBER, 0.2, CHAMBER]} />
          <meshStandardMaterial color="#374151" roughness={0.95} />
        </mesh>
        <CuboidCollider args={[HALF, 0.1, HALF]} />
      </RigidBody>

      {quests.map((quest) => (
        <group key={quest.id}>
          <Pedestal
            position={[
              quest.worldPosition[0],
              0,
              quest.worldPosition[2],
            ]}
          />
          <InteractableQuestScroll
            questId={quest.id}
            epicTitle={quest.epicTitle}
            emissiveColor={quest.emissiveColor}
            scale={quest.scale}
            position={quest.worldPosition}
          />
        </group>
      ))}

      <Torch position={[-4.5, 1.5, -1]} index={0} />
      <Torch position={[4.5, 1.5, -1]} index={1} />
      <Torch position={[-4.5, 1.5, 2]} index={2} />

      <QuestBoard />
      <InteractableBossDoor />
    </>
  )
}
