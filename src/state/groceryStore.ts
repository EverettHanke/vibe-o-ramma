import { useSyncExternalStore } from 'react'

export interface GroceryItem {
  id: string
  name: string
  done: boolean
}

const STORAGE_KEY = 'vibe-grocery-list-v2'

/** Pool of grocery names grouped loosely by the store's aisles. */
const GROCERY_POOL = [
  // Produce
  'Apples', 'Bananas', 'Carrots', 'Tomatoes', 'Lettuce', 'Avocados', 'Lemons',
  // Pantry
  'Pasta', 'Rice', 'Cereal', 'Beans', 'Olive Oil', 'Peanut Butter', 'Soup',
  // Bakery
  'Bread', 'Bagels', 'Muffins', 'Croissants', 'Donuts',
  // Dairy & frozen
  'Milk', 'Eggs', 'Butter', 'Cheese', 'Yogurt', 'Ice Cream',
  // Snacks
  'Chips', 'Cookies', 'Crackers', 'Popcorn', 'Pretzels',
  // Household
  'Soap', 'Napkins', 'Detergent', 'Sponges', 'Foil',
]

export const DEFAULT_LIST_SIZE = 5

let items: GroceryItem[] = load()
const listeners = new Set<() => void>()

function makeId(): string {
  return `item-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

/** Pick `count` unique names from the pool at random. */
export function randomNames(count: number): string[] {
  const pool = [...GROCERY_POOL]
  const picked: string[] = []
  const n = Math.min(count, pool.length)
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * pool.length)
    picked.push(pool.splice(idx, 1)[0])
  }
  return picked
}

function randomList(count: number): GroceryItem[] {
  return randomNames(count).map((name) => ({ id: makeId(), name, done: false }))
}

function load(): GroceryItem[] {
  if (typeof localStorage === 'undefined') return randomList(DEFAULT_LIST_SIZE)
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return randomList(DEFAULT_LIST_SIZE)
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return randomList(DEFAULT_LIST_SIZE)
    const valid = parsed.filter(
      (entry): entry is GroceryItem =>
        typeof entry === 'object' &&
        entry !== null &&
        typeof (entry as GroceryItem).id === 'string' &&
        typeof (entry as GroceryItem).name === 'string' &&
        typeof (entry as GroceryItem).done === 'boolean',
    )
    return valid.length > 0 ? valid : randomList(DEFAULT_LIST_SIZE)
  } catch {
    return randomList(DEFAULT_LIST_SIZE)
  }
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

/** Replace the whole list with a fresh random selection (used per level). */
export function regenerateList(count: number = DEFAULT_LIST_SIZE): void {
  items = randomList(count)
  emit()
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
