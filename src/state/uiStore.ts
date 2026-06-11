import { useSyncExternalStore } from 'react'

let plannerOpen = false
const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): boolean {
  return plannerOpen
}

export function setPlannerOpen(open: boolean): void {
  if (plannerOpen === open) return
  plannerOpen = open
  emit()
}

export function togglePlannerOpen(): void {
  setPlannerOpen(!plannerOpen)
}

export function usePlannerOpen(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot)
}
