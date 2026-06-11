import { useSyncExternalStore } from 'react'

let cartAtRegister = false
let checkedOut = false
const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getCartAtRegister(): boolean {
  return cartAtRegister
}

export function getCheckedOut(): boolean {
  return checkedOut
}

export function setCartAtRegister(atRegister: boolean): void {
  if (cartAtRegister === atRegister) return
  cartAtRegister = atRegister
  emit()
}

export function completeCheckout(): void {
  if (checkedOut) return
  checkedOut = true
  emit()
}

export function resetRun(): void {
  cartAtRegister = false
  checkedOut = false
  emit()
}

export function useCartAtRegister(): boolean {
  return useSyncExternalStore(subscribe, getCartAtRegister)
}

export function useCheckedOut(): boolean {
  return useSyncExternalStore(subscribe, getCheckedOut)
}
