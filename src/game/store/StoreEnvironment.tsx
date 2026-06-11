import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { Text } from '@react-three/drei'
import { Ground } from '@/physics/colliders'
import {
  AISLES,
  ROOM_HALF_X,
  ROOM_HALF_Z,
  aisleEndCaps,
  aisleFloorStripes,
  shelfBoards,
} from './layout'

const WALL_HEIGHT = 4
const WALL_THICKNESS = 0.4

interface WallProps {
  position: [number, number, number]
  size: [number, number, number]
}

function Wall({ position, size }: WallProps) {
  const [w, h, d] = size
  return (
    <RigidBody type="fixed" colliders={false} position={position}>
      <mesh receiveShadow castShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#e7e5e4" />
      </mesh>
      <CuboidCollider args={[w / 2, h / 2, d / 2]} />
    </RigidBody>
  )
}

function ShelfBoards() {
  const boards = [...shelfBoards(), ...aisleEndCaps()]
  return (
    <>
      {boards.map((board, i) => (
        <RigidBody
          key={i}
          type="fixed"
          colliders={false}
          position={board.position}
          rotation={board.rotation}
        >
          <mesh receiveShadow castShadow>
            <boxGeometry args={board.size} />
            <meshStandardMaterial color="#a8a29e" />
          </mesh>
          <CuboidCollider
            args={[board.size[0] / 2, board.size[1] / 2, board.size[2] / 2]}
          />
        </RigidBody>
      ))}
    </>
  )
}

function AisleStripes() {
  return (
    <>
      {aisleFloorStripes().map((stripe, i) => (
        <mesh
          key={i}
          position={stripe.position}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[stripe.size[0], stripe.size[2]]} />
          <meshStandardMaterial
            color="#fafaf9"
            transparent
            opacity={0.35}
            roughness={0.95}
          />
        </mesh>
      ))}
    </>
  )
}

export function StoreEnvironment() {
  const wy = WALL_HEIGHT / 2
  const spanX = ROOM_HALF_X * 2
  const spanZ = ROOM_HALF_Z * 2

  return (
    <>
      <Ground size={[spanX + 4, 0.5, spanZ + 4]} color="#d6d3d1" />

      <Wall position={[0, wy, -ROOM_HALF_Z]} size={[spanX, WALL_HEIGHT, WALL_THICKNESS]} />
      <Wall position={[-ROOM_HALF_X, wy, 0]} size={[WALL_THICKNESS, WALL_HEIGHT, spanZ]} />
      <Wall position={[ROOM_HALF_X, wy, 0]} size={[WALL_THICKNESS, WALL_HEIGHT, spanZ]} />

      {/* Front wall with entrance gap */}
      <Wall
        position={[-ROOM_HALF_X / 2 - 1, wy, ROOM_HALF_Z]}
        size={[ROOM_HALF_X - 2, WALL_HEIGHT, WALL_THICKNESS]}
      />
      <Wall
        position={[ROOM_HALF_X / 2 + 1, wy, ROOM_HALF_Z]}
        size={[ROOM_HALF_X - 2, WALL_HEIGHT, WALL_THICKNESS]}
      />

      <AisleStripes />
      <ShelfBoards />

      <Text
        position={[0, 3.4, -ROOM_HALF_Z + 1.2]}
        fontSize={0.7}
        color="#16a34a"
        anchorX="center"
        anchorY="middle"
      >
        FRESH MARKET
      </Text>

      {AISLES.map((aisle) => (
        <Text
          key={aisle.id}
          position={[-9.5, 2.85, aisle.centerZ]}
          rotation={[0, Math.PI / 2, 0]}
          fontSize={0.38}
          color={aisle.signColor}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#1c1917"
        >
          {aisle.label}
        </Text>
      ))}

      <Text
        position={[0, 2.5, 7.2]}
        fontSize={0.28}
        color="#6b7280"
        anchorX="center"
        anchorY="middle"
      >
        ENTRANCE
      </Text>
    </>
  )
}
