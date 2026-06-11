import { useSyncExternalStore } from 'react'

let grabbedId: string | null = null
const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getGrabbedId(): string | null {
  return grabbedId
}

export function grab(id: string): void {
  if (grabbedId === id) return
  grabbedId = id
  emit()
}

export function release(): void {
  if (grabbedId === null) return
  grabbedId = null
  emit()
}

export function toggleGrab(id: string): void {
  grabbedId = grabbedId === id ? null : id
  emit()
}

export function useGrabbedId(): string | null {
  return useSyncExternalStore(subscribe, getGrabbedId)
}
