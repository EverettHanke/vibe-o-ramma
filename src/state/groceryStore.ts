import { useSyncExternalStore } from 'react'

export interface GroceryItem {
  id: string
  name: string
  done: boolean
}

const STORAGE_KEY = 'vibe-grocery-list-v1'

const SEED_NAMES = ['Milk', 'Eggs', 'Bread', 'Apples', 'Coffee']

let items: GroceryItem[] = load()
const listeners = new Set<() => void>()

function makeId(): string {
  return `item-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function load(): GroceryItem[] {
  if (typeof localStorage === 'undefined') return seed()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seed()
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return seed()
    const valid = parsed.filter(
      (entry): entry is GroceryItem =>
        typeof entry === 'object' &&
        entry !== null &&
        typeof (entry as GroceryItem).id === 'string' &&
        typeof (entry as GroceryItem).name === 'string' &&
        typeof (entry as GroceryItem).done === 'boolean',
    )
    return valid.length > 0 ? valid : seed()
  } catch {
    return seed()
  }
}

function seed(): GroceryItem[] {
  return SEED_NAMES.map((name) => ({ id: makeId(), name, done: false }))
}

function persist(): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Ignore quota / serialization failures; in-memory state is still valid.
  }
}

function emit(): void {
  persist()
  for (const listener of listeners) listener()
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSnapshot(): GroceryItem[] {
  return items
}

export function addItem(name: string): void {
  const trimmed = name.trim()
  if (!trimmed) return
  items = [...items, { id: makeId(), name: trimmed, done: false }]
  emit()
}

export function renameItem(id: string, name: string): void {
  const trimmed = name.trim()
  if (!trimmed) return
  items = items.map((item) =>
    item.id === id ? { ...item, name: trimmed } : item,
  )
  emit()
}

export function removeItem(id: string): void {
  items = items.filter((item) => item.id !== id)
  emit()
}

export function toggleDone(id: string): void {
  items = items.map((item) =>
    item.id === id ? { ...item, done: !item.done } : item,
  )
  emit()
}

export function setDone(id: string, done: boolean): void {
  let changed = false
  items = items.map((item) => {
    if (item.id === id && item.done !== done) {
      changed = true
      return { ...item, done }
    }
    return item
  })
  if (changed) emit()
}

export function useGroceryList(): GroceryItem[] {
  return useSyncExternalStore(subscribe, getSnapshot)
}
