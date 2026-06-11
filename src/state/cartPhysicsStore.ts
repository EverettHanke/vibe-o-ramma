import { useSyncExternalStore } from 'react'

/**
 * Whether the cart is currently over a puddle. The ShoppingCart tests its own
 * position against the puddle zones each frame and sets this, so the flag is
 * always in sync and clears the instant the cart leaves a puddle.
 */
let onPuddle = false
const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function setOnPuddle(value: boolean): void {
  if (value === onPuddle) return
  onPuddle = value
  emit()
}

export function isOnPuddle(): boolean {
  return onPuddle
}

/** 1 = full grip (dry floor), low = slippery (ice-like). */
export function getCartGrip(): number {
  return onPuddle ? 0.12 : 1
}

export function useOnPuddle(): boolean {
  return useSyncExternalStore(subscribe, isOnPuddle)
}
