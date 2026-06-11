import { CuboidCollider, RigidBody } from '@react-three/rapier'
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
const HOLD_DROP = 0.35
const CARRY_STIFFNESS = 12
const MAX_CARRY_SPEED = 14

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

function colorFor(key: string): string {
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0
  }
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

const _camPos = new THREE.Vector3()
const _camDir = new THREE.Vector3()
const _target = new THREE.Vector3()

export function GroceryProduct({ id, name, position }: GroceryProductProps) {
  const bodyRef = useRef<RapierRigidBody>(null)
  const colliderRef = useRef<RapierCollider>(null)
  const color = useMemo(() => colorFor(id + name), [id, name])
  const grabbedId = useGrabbedId()
  const isGrabbed = grabbedId === id
  // Freeze the spawn position; after mount the physics body owns its transform,
  // so toggling done (which changes the passed position) must not teleport it.
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

    body.setLinvel({ x: vx, y: vy, z: vz }, true)
    body.setAngvel({ x: 0, y: 0, z: 0 }, true)
  })

  return (
    <RigidBody
      ref={bodyRef}
      type="dynamic"
      colliders={false}
      position={spawnPosition}
      userData={{ itemId: id }}
      linearDamping={0.4}
      angularDamping={0.8}
      canSleep={false}
    >
      <mesh castShadow>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isGrabbed ? 0.5 : 0.15}
        />
      </mesh>
      <CuboidCollider ref={colliderRef} args={[0.2, 0.2, 0.2]} density={0.8} />
      <Billboard position={[0, 0.42, 0]}>
        <Text
          fontSize={0.16}
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
