import {
  BallCollider,
  CuboidCollider,
  CylinderCollider,
  RigidBody,
} from '@react-three/rapier'
import type { RapierCollider, RapierRigidBody } from '@react-three/rapier'
import { Billboard, Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { Character } from '@/core/Character'
import type { IInteractable } from '@/core/Interaction'
import { useInteractableCollider } from '@/game/interactables/useInteractableCollider'
import { getGrabbedId, toggleGrab, useGrabbedId } from '@/state/grabStore'

interface GroceryProductProps {
  id: string
  name: string
  position: [number, number, number]
}

const HOLD_DISTANCE = 1.5
const HOLD_DROP = 0.3
const CARRY_STIFFNESS = 9
const MAX_CARRY_SPEED = 13

const PALETTE = [
  '#ef4444',
  '#f59e0b',
  '#22c55e',
  '#0ea5e9',
  '#a855f7',
  '#ec4899',
  '#14b8a6',
  '#eab308',
]

type Shape = 'box' | 'carton' | 'can' | 'bottle' | 'fruit'
const SHAPES: Shape[] = ['box', 'carton', 'can', 'bottle', 'fruit']

function hash(key: string): number {
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0
  return Math.abs(h)
}

interface ShapeConfig {
  shape: Shape
  density: number
  labelY: number
}

function shapeFor(key: string): ShapeConfig {
  const shape = SHAPES[hash(key) % SHAPES.length]
  switch (shape) {
    case 'carton':
      return { shape, density: 0.7, labelY: 0.5 }
    case 'can':
      return { shape, density: 1.4, labelY: 0.4 }
    case 'bottle':
      return { shape, density: 1.0, labelY: 0.55 }
    case 'fruit':
      return { shape, density: 0.6, labelY: 0.36 }
    default:
      return { shape, density: 0.8, labelY: 0.42 }
  }
}

const _camPos = new THREE.Vector3()
const _camDir = new THREE.Vector3()
const _target = new THREE.Vector3()

export function GroceryProduct({ id, name, position }: GroceryProductProps) {
  const bodyRef = useRef<RapierRigidBody>(null)
  const colliderRef = useRef<RapierCollider>(null)
  const color = useMemo(() => PALETTE[hash(id + name) % PALETTE.length], [id, name])
  const cfg = useMemo(() => shapeFor(id + name), [id, name])
  const grabbedId = useGrabbedId()
  const isGrabbed = grabbedId === id
  const spawnPosition = useRef(position).current

  const interactable = useMemo<IInteractable>(
    () => ({
      id: `product-${id}`,
      prompt: isGrabbed ? `Drop ${name} [E]` : `Grab ${name} [E]`,
      onInteract: (_actor: Character) => toggleGrab(id),
    }),
    [id, name, isGrabbed],
  )

  useInteractableCollider(colliderRef, interactable)

  useFrame((state) => {
    if (getGrabbedId() !== id) return
    const body = bodyRef.current
    if (!body) return

    state.camera.getWorldPosition(_camPos)
    state.camera.getWorldDirection(_camDir)
    _target
      .copy(_camPos)
      .addScaledVector(_camDir, HOLD_DISTANCE)
      .setY(_camPos.y - HOLD_DROP)

    const pos = body.translation()
    let vx = (_target.x - pos.x) * CARRY_STIFFNESS
    let vy = (_target.y - pos.y) * CARRY_STIFFNESS
    let vz = (_target.z - pos.z) * CARRY_STIFFNESS

    const speed = Math.hypot(vx, vy, vz)
    if (speed > MAX_CARRY_SPEED) {
      const scale = MAX_CARRY_SPEED / speed
      vx *= scale
      vy *= scale
      vz *= scale
    }

    // Pull toward the hold point but leave rotation free so the item swings
    // and tumbles in hand for a physical feel.
    body.setLinvel({ x: vx, y: vy, z: vz }, true)
  })

  const emissive = isGrabbed ? 0.5 : 0.12
  const material = (
    <meshStandardMaterial
      color={color}
      emissive={color}
      emissiveIntensity={emissive}
      roughness={0.6}
    />
  )

  return (
    <RigidBody
      ref={bodyRef}
      type="dynamic"
      colliders={false}
      position={spawnPosition}
      userData={{ itemId: id }}
      linearDamping={0.3}
      angularDamping={0.6}
      canSleep={false}
    >
      {cfg.shape === 'box' && (
        <>
          <mesh castShadow>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            {material}
          </mesh>
          <CuboidCollider ref={colliderRef} args={[0.2, 0.2, 0.2]} density={cfg.density} />
        </>
      )}
      {cfg.shape === 'carton' && (
        <>
          <mesh castShadow>
            <boxGeometry args={[0.32, 0.52, 0.18]} />
            {material}
          </mesh>
          <CuboidCollider ref={colliderRef} args={[0.16, 0.26, 0.09]} density={cfg.density} />
        </>
      )}
      {cfg.shape === 'can' && (
        <>
          <mesh castShadow>
            <cylinderGeometry args={[0.16, 0.16, 0.34, 18]} />
            {material}
          </mesh>
          <CylinderCollider ref={colliderRef} args={[0.17, 0.16]} density={cfg.density} />
        </>
      )}
      {cfg.shape === 'bottle' && (
        <>
          <mesh castShadow>
            <cylinderGeometry args={[0.11, 0.13, 0.5, 18]} />
            {material}
          </mesh>
          <mesh castShadow position={[0, 0.32, 0]}>
            <cylinderGeometry args={[0.05, 0.09, 0.16, 12]} />
            {material}
          </mesh>
          <CylinderCollider ref={colliderRef} args={[0.25, 0.13]} density={cfg.density} />
        </>
      )}
      {cfg.shape === 'fruit' && (
        <>
          <mesh castShadow>
            <sphereGeometry args={[0.22, 20, 20]} />
            {material}
          </mesh>
          <BallCollider ref={colliderRef} args={[0.22]} density={cfg.density} />
        </>
      )}

      <Billboard position={[0, cfg.labelY, 0]}>
        <Text
          fontSize={0.15}
          maxWidth={1.4}
          color="#1c1917"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.008}
          outlineColor="#ffffff"
        >
          {name}
        </Text>
      </Billboard>
    </RigidBody>
  )
}
