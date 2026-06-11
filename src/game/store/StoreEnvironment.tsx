import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { Text } from '@react-three/drei'
import { useMemo } from 'react'
import { tiledFloorTexture } from '@/utils/textures'
import { StoreFixtures } from './StoreFixtures'
import { Obstacles } from './Obstacles'
import { ROOM_HALF } from './layout'

const WALL_HEIGHT = 5
const WALL_THICKNESS = 0.4
const CEILING_Y = 5

function Wall({
  position,
  size,
}: {
  position: [number, number, number]
  size: [number, number, number]
}) {
  const [w, h, d] = size
  return (
    <RigidBody type="fixed" colliders={false} position={position}>
      <mesh receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#f1f5f9" />
      </mesh>
      <CuboidCollider args={[w / 2, h / 2, d / 2]} />
    </RigidBody>
  )
}

function CeilingLight({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.6, 4]} />
      <meshStandardMaterial
        color="#ffffff"
        emissive="#fefce8"
        emissiveIntensity={1.4}
      />
    </mesh>
  )
}

function Floor() {
  const tex = useMemo(() => tiledFloorTexture(20), [])
  return (
    <RigidBody type="fixed" colliders={false}>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_HALF * 2, ROOM_HALF * 2]} />
        <meshStandardMaterial map={tex} color="#ffffff" roughness={0.5} />
      </mesh>
      <CuboidCollider
        args={[ROOM_HALF, 0.25, ROOM_HALF]}
        position={[0, -0.25, 0]}
        friction={0.9}
      />
    </RigidBody>
  )
}

export function StoreEnvironment() {
  const wy = WALL_HEIGHT / 2
  const lightRows = [-8, -4, 0, 4, 8]
  const lightCols = [-8, 0, 8]

  return (
    <>
      <Floor />

      {/* Walls */}
      <Wall position={[0, wy, -ROOM_HALF]} size={[ROOM_HALF * 2, WALL_HEIGHT, WALL_THICKNESS]} />
      <Wall position={[0, wy, ROOM_HALF]} size={[ROOM_HALF * 2, WALL_HEIGHT, WALL_THICKNESS]} />
      <Wall position={[-ROOM_HALF, wy, 0]} size={[WALL_THICKNESS, WALL_HEIGHT, ROOM_HALF * 2]} />
      <Wall position={[ROOM_HALF, wy, 0]} size={[WALL_THICKNESS, WALL_HEIGHT, ROOM_HALF * 2]} />

      {/* Ceiling */}
      <mesh position={[0, CEILING_Y, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROOM_HALF * 2, ROOM_HALF * 2]} />
        <meshStandardMaterial color="#e2e8f0" side={2} />
      </mesh>
      {lightRows.map((z) =>
        lightCols.map((x) => (
          <CeilingLight key={`${x}-${z}`} position={[x, CEILING_Y - 0.05, z]} />
        )),
      )}

      {/* Entrance banner */}
      <Text
        position={[0, 4, ROOM_HALF - 0.3]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.9}
        color="#16a34a"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#ffffff"
      >
        FRESH MART
      </Text>

      <StoreFixtures />
      <Obstacles />
    </>
  )
}
