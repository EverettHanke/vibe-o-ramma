import * as RAPIER from '@dimforge/rapier3d-compat'
import * as THREE from 'three'
import type { InteractableMeta } from '@/core/Interaction'
import { getInteractableForCollider } from '@/core/Interaction'

export type PhysicsWorld = RAPIER.World

export interface LineTraceHit {
  point: THREE.Vector3
  normal: THREE.Vector3
  distance: number
  colliderHandle: number
  userData?: InteractableMeta
}

export interface LineTraceFilter {
  excludeColliderHandle?: number
  interactionOnly?: boolean
}

export function lineTrace(
  world: PhysicsWorld,
  origin: THREE.Vector3,
  direction: THREE.Vector3,
  maxDistance: number,
  filter?: LineTraceFilter,
): LineTraceHit | null {
  const dir = direction.clone().normalize()
  const ray = new RAPIER.Ray(
    { x: origin.x, y: origin.y, z: origin.z },
    { x: dir.x, y: dir.y, z: dir.z },
  )

  const hit = world.castRayAndGetNormal(
    ray,
    maxDistance,
    true,
    undefined,
    undefined,
    undefined,
    undefined,
    (collider) => {
      if (
        filter?.excludeColliderHandle !== undefined &&
        collider.handle === filter.excludeColliderHandle
      ) {
        return false
      }
      if (filter?.interactionOnly) {
        return getInteractableForCollider(collider.handle) !== null
      }
      return true
    },
  )

  if (!hit) return null

  const colliderHandle = hit.collider.handle
  const interactable = getInteractableForCollider(colliderHandle)
  const point = ray.pointAt(hit.timeOfImpact)

  return {
    point: new THREE.Vector3(point.x, point.y, point.z),
    normal: new THREE.Vector3(hit.normal.x, hit.normal.y, hit.normal.z),
    distance: hit.timeOfImpact,
    colliderHandle,
    userData: interactable ?? undefined,
  }
}

export function groundCheck(
  world: PhysicsWorld,
  origin: THREE.Vector3,
  maxDistance = 0.15,
  excludeColliderHandle?: number,
): boolean {
  const hit = lineTrace(
    world,
    origin,
    new THREE.Vector3(0, -1, 0),
    maxDistance,
    { excludeColliderHandle },
  )
  return hit !== null
}
