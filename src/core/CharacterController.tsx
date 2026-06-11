import Ecctrl, { type CustomEcctrlRigidBody } from 'ecctrl'
import { useRapier } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useInputGetter } from '@/platform/input'
import { useCharacter } from './CharacterContext'

const CAPSULE_RADIUS = 0.35
const CAPSULE_HALF_HEIGHT = 0.55

const _eyePos = new THREE.Vector3()
const _lookDir = new THREE.Vector3()

export function CharacterController() {
  const ecctrlRef = useRef<CustomEcctrlRigidBody>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const getInput = useInputGetter()
  const character = useCharacter()
  const { world } = useRapier()
  const interactPressed = useRef(false)

  useEffect(() => {
    let frame = 0
    const trySetHandle = () => {
      const body = ecctrlRef.current?.group
      if (body) {
        const collider = body.collider(0)
        if (collider) {
          character.setColliderHandle(collider.handle)
          return
        }
      }
      frame = requestAnimationFrame(trySetHandle)
    }
    trySetHandle()
    return () => cancelAnimationFrame(frame)
  }, [character])

  useFrame((state) => {
    const body = ecctrlRef.current?.group
    if (!body) return

    // Aim from camera view (includes pitch); pill stays yaw-only via ecctrl pivot.
    state.camera.getWorldPosition(_eyePos)
    state.camera.getWorldDirection(_lookDir)

    character.updateLineTrace(world, _eyePos, _lookDir)

    const input = getInput()
    if (input.interact && !interactPressed.current) {
      character.interact()
    }
    interactPressed.current = input.interact
  })

  return (
    <Ecctrl
      ref={ecctrlRef}
      position={[0, 2, 0]}
      mode="CameraBasedMovement"
      autoBalance={false}
      capsuleHalfHeight={CAPSULE_HALF_HEIGHT}
      capsuleRadius={CAPSULE_RADIUS}
      maxVelLimit={4}
      camCollision={false}
      camInitDis={-0.01}
      camMinDis={-0.01}
      camMaxDis={-0.01}
      camInitDir={{ x: 0, y: 0 }}
      camUpLimit={1.2}
      camLowLimit={-0.8}
      camTargetPos={{ x: 0, y: 0, z: 0 }}
      camFollowMult={1000}
      camLerpMult={1000}
      turnVelMultiplier={1}
      turnSpeed={100}
      debug={false}
    >
      <mesh ref={meshRef} visible={false} castShadow userData={{ camExcludeCollision: true }}>
        <capsuleGeometry
          args={[CAPSULE_RADIUS, CAPSULE_HALF_HEIGHT * 2, 8, 16]}
        />
        <meshStandardMaterial color="#4a90d9" />
      </mesh>
    </Ecctrl>
  )
}
