import { useSyncExternalStore } from 'react'

/** 1 = full grip, 0 = ice. */
let grip = 1
const listeners = new Set<() => void>()

let puddleOverlap = 0

function emit(): void {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getCartGrip(): number {
  return grip
}

export function enterPuddle(): void {
  puddleOverlap++
  grip = Math.max(0.08, 1 - puddleOverlap * 0.45)
  emit()
}

export function exitPuddle(): void {
  puddleOverlap = Math.max(0, puddleOverlap - 1)
  grip = puddleOverlap === 0 ? 1 : Math.max(0.08, 1 - puddleOverlap * 0.45)
  emit()
}

export function useCartGrip(): number {
  return useSyncExternalStore(subscribe, getCartGrip)
}
