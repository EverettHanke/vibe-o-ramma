export interface Slot {
  position: [number, number, number]
  rotation: [number, number, number]
}

export interface ShelfBoard {
  position: [number, number, number]
  size: [number, number, number]
  rotation: [number, number, number]
}

export interface AisleConfig {
  id: string
  label: string
  /** Center line of the aisle (walk path along X). */
  centerZ: number
  signColor: string
}

export interface PuddlePlacement {
  id: string
  position: [number, number, number]
  size: [number, number]
}

export const PRODUCT_LEVELS = [1.0, 1.65]
export const SHELF_DEPTH = 0.55
export const ROOM_HALF_X = 12
export const ROOM_HALF_Z = 14

export const PLAYER_SPAWN: [number, number, number] = [0, 2, 9.5]
export const CART_SPAWN: [number, number, number] = [-1.5, 0, 8.2]

/** Checkout lane at the front of the store. */
export const REGISTER_ZONE = {
  position: [0, 0.05, 10.8] as [number, number, number],
  size: [8, 0.1, 2.8] as [number, number, number],
}

/** Aisles run east–west; walk paths at these Z coordinates. */
export const AISLES: AisleConfig[] = [
  { id: 'dairy', label: 'DAIRY', centerZ: -7, signColor: '#0ea5e9' },
  { id: 'produce', label: 'PRODUCE', centerZ: 0, signColor: '#22c55e' },
  { id: 'snacks', label: 'SNACKS', centerZ: 7, signColor: '#f59e0b' },
]

/** Product columns along each shelf run (x positions). */
const SHELF_COLUMNS = [-10, -6.5, -3, 0.5, 4]

const SHELF_OFFSET = 1.55
const X_BACK = -11.5
const X_FRONT = 5.5

export const PUDDLES: PuddlePlacement[] = [
  { id: 'puddle-a1', position: [-4, 0.02, -7], size: [2.8, 2.2] },
  { id: 'puddle-a2', position: [-7, 0.02, 0], size: [3, 2.4] },
  { id: 'puddle-a3', position: [1, 0.02, 7], size: [2.6, 2.2] },
]

interface ShelfRun {
  z: number
  rotationY: number
  aisleId: string
}

function shelfRuns(): ShelfRun[] {
  const runs: ShelfRun[] = []
  for (const aisle of AISLES) {
    runs.push(
      { z: aisle.centerZ - SHELF_OFFSET, rotationY: 0, aisleId: aisle.id },
      { z: aisle.centerZ + SHELF_OFFSET, rotationY: Math.PI, aisleId: aisle.id },
    )
  }
  return runs
}

function buildSlots(): Slot[] {
  const slots: Slot[] = []
  for (const level of PRODUCT_LEVELS) {
    for (const run of shelfRuns()) {
      for (const x of SHELF_COLUMNS) {
        if (x < X_BACK || x > X_FRONT) continue
        slots.push({
          position: [x, level, run.z],
          rotation: [0, run.rotationY, 0],
        })
      }
    }
  }
  return slots
}

const SLOTS = buildSlots()

export function slotCount(): number {
  return SLOTS.length
}

export function slotForIndex(index: number): Slot {
  const base = SLOTS[index % SLOTS.length]
  const wrap = Math.floor(index / SLOTS.length)
  if (wrap === 0) return base
  const [x, y, z] = base.position
  return {
    position: [x, y + wrap * 0.45, z],
    rotation: base.rotation,
  }
}

export function shelfBoards(): ShelfBoard[] {
  const boards: ShelfBoard[] = []
  const spanX = X_FRONT - X_BACK

  for (const run of shelfRuns()) {
    for (const level of PRODUCT_LEVELS) {
      boards.push({
        position: [(X_BACK + X_FRONT) / 2, level - 0.22, run.z],
        size: [spanX, 0.12, SHELF_DEPTH],
        rotation: [0, run.rotationY, 0],
      })
    }
  }

  return boards
}

/** End caps closing each aisle at the left/right walls. */
export function aisleEndCaps(): ShelfBoard[] {
  const caps: ShelfBoard[] = []
  for (const aisle of AISLES) {
    for (const x of [X_BACK, X_FRONT]) {
      caps.push({
        position: [x, 0.5, aisle.centerZ],
        size: [0.2, 1, SHELF_OFFSET * 2 + SHELF_DEPTH],
        rotation: [0, 0, 0],
      })
    }
  }
  return caps
}

export function aisleFloorStripes(): {
  position: [number, number, number]
  size: [number, number, number]
}[] {
  return AISLES.map((aisle) => ({
    position: [(X_BACK + X_FRONT) / 2, 0.01, aisle.centerZ],
    size: [X_FRONT - X_BACK, 0.02, 2.4],
  }))
}
