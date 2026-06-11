import type { Character } from './Character'

export interface IInteractable {
  id: string
  prompt: string
  onInteract(actor: Character): void
  canInteract?(actor: Character): boolean
}

export interface InteractableMeta {
  interactable: IInteractable
}

const interactableRegistry = new Map<number, IInteractable>()

export function registerInteractable(
  colliderHandle: number,
  interactable: IInteractable,
): void {
  interactableRegistry.set(colliderHandle, interactable)
}

export function unregisterInteractable(colliderHandle: number): void {
  interactableRegistry.delete(colliderHandle)
}

export function getInteractableForCollider(
  colliderHandle: number,
): InteractableMeta | null {
  const interactable = interactableRegistry.get(colliderHandle)
  if (!interactable) return null
  return { interactable }
}
