export interface Slot {
  position: [number, number, number]
  rotation: [number, number, number]
}

/**
 * Product label/front faces the direction given by rotation.y. drei <Text>
 * and our box fronts default to facing +z, so a rotation of 0 faces +z.
 */
interface ShelfWall {
  /** Fixed coordinate of the wall the shelf sits against. */
  fixed: number
  /** Which axis the shelf runs along ('x' for back wall, 'z' for side walls). */
  axis: 'x' | 'z'
  /** Positions along `axis` for each column. */
  columns: number[]
  /** Heights for each product row. */
  levels: number[]
  /** Yaw so the product front faces the aisle. */
  rotationY: number
}

export const PRODUCT_LEVELS = [1.0, 1.65]
export const SHELF_DEPTH = 0.6

const COLUMNS_BACK = [-6, -3.6, -1.2, 1.2, 3.6, 6]
const COLUMNS_SIDE = [-6, -3.6, -1.2, 1.2, 3.6, 6]

export const BACK_WALL_Z = -8.4
export const SIDE_WALL_X = 8.4

const WALLS: ShelfWall[] = [
  // Back wall: runs along x, products face +z (toward spawn).
  {
    fixed: BACK_WALL_Z,
    axis: 'x',
    columns: COLUMNS_BACK,
    levels: PRODUCT_LEVELS,
    rotationY: 0,
  },
  // Left wall: runs along z, products face +x.
  {
    fixed: -SIDE_WALL_X,
    axis: 'z',
    columns: COLUMNS_SIDE,
    levels: PRODUCT_LEVELS,
    rotationY: Math.PI / 2,
  },
  // Right wall: runs along z, products face -x.
  {
    fixed: SIDE_WALL_X,
    axis: 'z',
    columns: COLUMNS_SIDE,
    levels: PRODUCT_LEVELS,
    rotationY: -Math.PI / 2,
  },
]

function buildSlots(): Slot[] {
  const slots: Slot[] = []
  // Front-most row first so the earliest items are the most visible.
  for (const level of PRODUCT_LEVELS) {
    for (const wall of WALLS) {
      for (const column of wall.columns) {
        if (wall.levels.indexOf(level) === -1) continue
        if (wall.axis === 'x') {
          slots.push({
            position: [column, level, wall.fixed + SHELF_DEPTH * 0.5],
            rotation: [0, wall.rotationY, 0],
          })
        } else {
          const sign = wall.fixed < 0 ? 1 : -1
          slots.push({
            position: [wall.fixed + sign * SHELF_DEPTH * 0.5, level, column],
            rotation: [0, wall.rotationY, 0],
          })
        }
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
  // If we wrap around (more items than slots), nudge up a row so items
  // never occupy the exact same point.
  const wrap = Math.floor(index / SLOTS.length)
  if (wrap === 0) return base
  const [x, y, z] = base.position
  return {
    position: [x, y + wrap * 0.5, z],
    rotation: base.rotation,
  }
}

export interface ShelfBoard {
  position: [number, number, number]
  size: [number, number, number]
  rotation: [number, number, number]
}

/** Shelf board geometry, derived from the same wall config the slots use. */
export function shelfBoards(): ShelfBoard[] {
  const boards: ShelfBoard[] = []
  const span = 14
  for (const wall of WALLS) {
    for (const level of wall.levels) {
      const boardY = level - 0.22
      if (wall.axis === 'x') {
        boards.push({
          position: [0, boardY, wall.fixed + SHELF_DEPTH * 0.5],
          size: [span, 0.12, SHELF_DEPTH],
          rotation: [0, 0, 0],
        })
      } else {
        const sign = wall.fixed < 0 ? 1 : -1
        boards.push({
          position: [wall.fixed + sign * SHELF_DEPTH * 0.5, boardY, 0],
          size: [SHELF_DEPTH, 0.12, span],
          rotation: [0, 0, 0],
        })
      }
    }
  }
  return boards
}
