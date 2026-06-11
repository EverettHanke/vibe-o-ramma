import type { RapierCollider } from '@react-three/rapier'
import { useEffect, type RefObject } from 'react'
import type { IInteractable } from '@/core/Interaction'
import {
  registerInteractable,
  unregisterInteractable,
} from '@/core/Interaction'

export function useInteractableCollider(
  colliderRef: RefObject<RapierCollider | null>,
  interactable: IInteractable,
): void {
  useEffect(() => {
    let frame = 0
    let registeredHandle: number | null = null

    const tryRegister = () => {
      const collider = colliderRef.current
      if (collider) {
        registeredHandle = collider.handle
        registerInteractable(collider.handle, interactable)
        return
      }
      frame = requestAnimationFrame(tryRegister)
    }

    tryRegister()

    return () => {
      cancelAnimationFrame(frame)
      if (registeredHandle !== null) {
        unregisterInteractable(registeredHandle)
      }
    }
  }, [colliderRef, interactable])
}
