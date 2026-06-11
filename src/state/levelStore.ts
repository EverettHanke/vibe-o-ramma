import { useSyncExternalStore } from 'react'
import { regenerateList } from './groceryStore'
import { release } from './grabStore'

const STORAGE_KEY = 'vibe-level-v1'

let level = load()
const listeners = new Set<() => void>()

function load(): number {
  if (typeof localStorage === 'undefined') return 1
  const raw = localStorage.getItem(STORAGE_KEY)
  const parsed = raw ? Number.parseInt(raw, 10) : NaN
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

function persist(): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, String(level))
  } catch {
    // Ignore persistence failures; in-memory level is still valid.
  }
}

function emit(): void {
  persist()
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): number {
  return level
}

/** Items required scale up gently with level, capped at the slot budget. */
export function itemsForLevel(lvl: number): number {
  return Math.min(5 + (lvl - 1), 10)
}

/** Finish the current mission and start the next level with a fresh list. */
export function advanceLevel(): void {
  level += 1
  release()
  regenerateList(itemsForLevel(level))
  emit()
}

export function useLevel(): number {
  return useSyncExternalStore(subscribe, getSnapshot)
}
