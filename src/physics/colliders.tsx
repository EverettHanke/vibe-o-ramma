import { RigidBody, CuboidCollider } from '@react-three/rapier'
import type { ReactNode } from 'react'

interface GroundProps {
  size?: [number, number, number]
  position?: [number, number, number]
  color?: string
}

export function Ground({
  size = [40, 0.5, 40],
  position = [0, -0.25, 0],
  color = '#3d5a3d',
}: GroundProps) {
  const [w, h, d] = size
  return (
    <RigidBody type="fixed" friction={1} restitution={0}>
      <mesh position={position} receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} />
      </mesh>
      <CuboidCollider args={[w / 2, h / 2, d / 2]} position={position} />
    </RigidBody>
  )
}

interface PlatformProps {
  size?: [number, number, number]
  position?: [number, number, number]
  rotation?: [number, number, number]
  color?: string
  children?: ReactNode
}

export function Platform({
  size = [4, 0.5, 4],
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color = '#6b7280',
  children,
}: PlatformProps) {
  const [w, h, d] = size
  return (
    <RigidBody type="fixed" friction={1} restitution={0} position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} />
      </mesh>
      <CuboidCollider args={[w / 2, h / 2, d / 2]} />
      {children}
    </RigidBody>
  )
}
