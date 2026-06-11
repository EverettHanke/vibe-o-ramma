import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { Text } from '@react-three/drei'
import { Ground } from '@/physics/colliders'
import { shelfBoards, BACK_WALL_Z, SIDE_WALL_X } from './layout'

const WALL_HEIGHT = 4
const WALL_THICKNESS = 0.4
const ROOM_HALF = 9.2

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
  const boards = shelfBoards()
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

export function StoreEnvironment() {
  const wy = WALL_HEIGHT / 2

  return (
    <>
      <Ground size={[40, 0.5, 40]} color="#d6d3d1" />

      {/* Perimeter walls */}
      <Wall
        position={[0, wy, -ROOM_HALF]}
        size={[ROOM_HALF * 2, WALL_HEIGHT, WALL_THICKNESS]}
      />
      <Wall
        position={[0, wy, ROOM_HALF]}
        size={[ROOM_HALF * 2, WALL_HEIGHT, WALL_THICKNESS]}
      />
      <Wall
        position={[-ROOM_HALF, wy, 0]}
        size={[WALL_THICKNESS, WALL_HEIGHT, ROOM_HALF * 2]}
      />
      <Wall
        position={[ROOM_HALF, wy, 0]}
        size={[WALL_THICKNESS, WALL_HEIGHT, ROOM_HALF * 2]}
      />

      <ShelfBoards />

      {/* Aisle signs */}
      <Text
        position={[0, 3.1, BACK_WALL_Z + 0.5]}
        fontSize={0.6}
        color="#16a34a"
        anchorX="center"
        anchorY="middle"
      >
        FRESH MARKET
      </Text>
      <Text
        position={[-SIDE_WALL_X + 0.5, 3.1, 0]}
        rotation={[0, Math.PI / 2, 0]}
        fontSize={0.5}
        color="#0ea5e9"
        anchorX="center"
        anchorY="middle"
      >
        AISLE 2
      </Text>
      <Text
        position={[SIDE_WALL_X - 0.5, 3.1, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        fontSize={0.5}
        color="#f59e0b"
        anchorX="center"
        anchorY="middle"
      >
        AISLE 3
      </Text>
    </>
  )
}
