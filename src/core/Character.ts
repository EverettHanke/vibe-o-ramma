import * as THREE from 'three'
import {
  lineTrace,
  type LineTraceHit,
  type PhysicsWorld,
} from '@/physics/raycast'

const INTERACT_DISTANCE = 4

export class Character {
  lastTraceHit: LineTraceHit | null = null
  private colliderHandle: number | null = null

  setColliderHandle(handle: number): void {
    this.colliderHandle = handle
  }

  updateLineTrace(
    world: PhysicsWorld,
    eyePosition: THREE.Vector3,
    lookDirection: THREE.Vector3,
    maxDistance = INTERACT_DISTANCE,
  ): LineTraceHit | null {
    this.lastTraceHit = lineTrace(world, eyePosition, lookDirection, maxDistance, {
      excludeColliderHandle: this.colliderHandle ?? undefined,
      interactionOnly: true,
    })
    return this.lastTraceHit
  }

  interact(): boolean {
    const meta = this.lastTraceHit?.userData
    if (!meta?.interactable) return false

    const { interactable } = meta
    if (interactable.canInteract && !interactable.canInteract(this)) {
      return false
    }

    interactable.onInteract(this)
    return true
  }

  getInteractPrompt(): string | null {
    const meta = this.lastTraceHit?.userData
    if (!meta?.interactable) return null
    if (
      meta.interactable.canInteract &&
      !meta.interactable.canInteract(this)
    ) {
      return null
    }
    return meta.interactable.prompt
  }
}

export type { LineTraceHit }
