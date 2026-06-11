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
  /** Center line of the aisle (walk path). */
  centerX: number
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

export const AISLES: AisleConfig[] = [
  { id: 'dairy', label: 'DAIRY', centerX: -7, signColor: '#0ea5e9' },
  { id: 'produce', label: 'PRODUCE', centerX: 0, signColor: '#22c55e' },
  { id: 'snacks', label: 'SNACKS', centerX: 7, signColor: '#f59e0b' },
]

/** Shelf columns along each aisle (z positions). */
const SHELF_COLUMNS = [-10, -6.5, -3, 0.5, 4]

const SHELF_OFFSET = 1.55
const Z_BACK = -11.5
const Z_FRONT = 5.5

export const PUDDLES: PuddlePlacement[] = [
  { id: 'puddle-a1', position: [-7, 0.02, -4], size: [2.2, 2.8] },
  { id: 'puddle-a2', position: [0, 0.02, -7], size: [2.4, 3] },
  { id: 'puddle-a3', position: [7, 0.02, 1], size: [2.2, 2.6] },
]

interface ShelfRun {
  x: number
  rotationY: number
  aisleId: string
}

function shelfRuns(): ShelfRun[] {
  const runs: ShelfRun[] = []
  for (const aisle of AISLES) {
    runs.push(
      { x: aisle.centerX - SHELF_OFFSET, rotationY: Math.PI / 2, aisleId: aisle.id },
      { x: aisle.centerX + SHELF_OFFSET, rotationY: -Math.PI / 2, aisleId: aisle.id },
    )
  }
  return runs
}

function buildSlots(): Slot[] {
  const slots: Slot[] = []
  for (const level of PRODUCT_LEVELS) {
    for (const run of shelfRuns()) {
      for (const z of SHELF_COLUMNS) {
        if (z < Z_BACK || z > Z_FRONT) continue
        slots.push({
          position: [run.x, level, z],
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
  const spanZ = Z_FRONT - Z_BACK

  for (const run of shelfRuns()) {
    for (const level of PRODUCT_LEVELS) {
      boards.push({
        position: [run.x, level - 0.22, (Z_BACK + Z_FRONT) / 2],
        size: [SHELF_DEPTH, 0.12, spanZ],
        rotation: [0, run.rotationY, 0],
      })
    }
  }

  return boards
}

/** Low dividers at the front/back of each aisle for visual structure. */
export function aisleEndCaps(): ShelfBoard[] {
  const caps: ShelfBoard[] = []
  for (const aisle of AISLES) {
    for (const z of [Z_BACK, Z_FRONT]) {
      caps.push({
        position: [aisle.centerX, 0.5, z],
        size: [SHELF_OFFSET * 2 + SHELF_DEPTH, 1, 0.2],
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
    position: [aisle.centerX, 0.01, (Z_BACK + Z_FRONT) / 2],
    size: [2.4, 0.02, Z_FRONT - Z_BACK],
  }))
}
