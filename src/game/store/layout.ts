export interface Slot {
  position: [number, number, number]
  rotation: [number, number, number]
}

export type FixtureKind = 'shelf' | 'gondola' | 'fridge'

export interface Fixture {
  id: string
  kind: FixtureKind
  /** World-space center of the fixture footprint (y is floor level). */
  position: [number, number]
  /** Yaw rotation. Local +X runs along `length`, local +Z is the front face. */
  rotationY: number
  length: number
  depth: number
  /** Heights of each shelf level. */
  levels: number[]
  /** Number of product columns along the length. */
  columns: number
  /** 'single' = products on +Z face only; 'double' = both faces (gondola). */
  sides: 'single' | 'double'
  /** Overhead category sign. */
  sign?: string
  signColor?: string
}

export const ROOM_HALF = 13
const WALL = ROOM_HALF - 0.5

export const FIXTURES: Fixture[] = [
  // Center gondola aisles (double-sided), running north-south.
  {
    id: 'aisle-produce',
    kind: 'gondola',
    position: [-6, -1],
    rotationY: Math.PI / 2,
    length: 11,
    depth: 1.1,
    levels: [0.8, 1.5, 2.1],
    columns: 5,
    sides: 'double',
    sign: 'PRODUCE',
    signColor: '#22c55e',
  },
  {
    id: 'aisle-pantry',
    kind: 'gondola',
    position: [0, -1],
    rotationY: Math.PI / 2,
    length: 11,
    depth: 1.1,
    levels: [0.8, 1.5, 2.1],
    columns: 5,
    sides: 'double',
    sign: 'PANTRY',
    signColor: '#f59e0b',
  },
  {
    id: 'aisle-bakery',
    kind: 'gondola',
    position: [6, -1],
    rotationY: Math.PI / 2,
    length: 11,
    depth: 1.1,
    levels: [0.8, 1.5, 2.1],
    columns: 5,
    sides: 'double',
    sign: 'BAKERY',
    signColor: '#d97706',
  },
  // Refrigerator run along the right wall, facing into the room.
  {
    id: 'fridge-dairy',
    kind: 'fridge',
    position: [WALL, -2],
    rotationY: -Math.PI / 2,
    length: 14,
    depth: 0.9,
    levels: [0.8, 1.45, 2.1],
    columns: 6,
    sides: 'single',
    sign: 'DAIRY & FROZEN',
    signColor: '#38bdf8',
  },
  // Back wall shelving.
  {
    id: 'wall-back',
    kind: 'shelf',
    position: [0, -WALL],
    rotationY: 0,
    length: 18,
    depth: 0.6,
    levels: [1.0, 1.7],
    columns: 7,
    sides: 'single',
    sign: 'SNACKS',
    signColor: '#a855f7',
  },
  // Left wall shelving.
  {
    id: 'wall-left',
    kind: 'shelf',
    position: [-WALL, -2],
    rotationY: Math.PI / 2,
    length: 14,
    depth: 0.6,
    levels: [1.0, 1.7],
    columns: 6,
    sides: 'single',
    sign: 'HOUSEHOLD',
    signColor: '#ec4899',
  },
]

function toWorld(
  fixture: Fixture,
  lx: number,
  lz: number,
): [number, number] {
  const c = Math.cos(fixture.rotationY)
  const s = Math.sin(fixture.rotationY)
  const x = fixture.position[0] + lx * c + lz * s
  const z = fixture.position[1] - lx * s + lz * c
  return [x, z]
}

function columnOffsets(length: number, columns: number): number[] {
  const usable = length - 1.2
  if (columns <= 1) return [0]
  const step = usable / (columns - 1)
  const start = -usable / 2
  return Array.from({ length: columns }, (_, i) => start + i * step)
}

export function fixtureSlots(fixture: Fixture): Slot[] {
  const slots: Slot[] = []
  const cols = columnOffsets(fixture.length, fixture.columns)
  // Inset from the front edge so products rest on the board, not overhanging.
  const front = fixture.depth / 2 - 0.28
  const faces: Array<{ lz: number; rot: number }> =
    fixture.sides === 'double'
      ? [
          { lz: front, rot: fixture.rotationY },
          { lz: -front, rot: fixture.rotationY + Math.PI },
        ]
      : [{ lz: front, rot: fixture.rotationY }]

  for (const level of fixture.levels) {
    for (const face of faces) {
      for (const lx of cols) {
        const [x, z] = toWorld(fixture, lx, face.lz)
        slots.push({ position: [x, level, z], rotation: [0, face.rot, 0] })
      }
    }
  }
  return slots
}

const SLOTS: Slot[] = FIXTURES.flatMap(fixtureSlots)

export function slotCount(): number {
  return SLOTS.length
}

export function slotForIndex(index: number): Slot {
  const base = SLOTS[index % SLOTS.length]
  const wrap = Math.floor(index / SLOTS.length)
  if (wrap === 0) return base
  const [x, y, z] = base.position
  return { position: [x, y + wrap * 0.5, z], rotation: base.rotation }
}

export interface ShelfBoard {
  position: [number, number, number]
  size: [number, number, number]
  rotation: [number, number, number]
}

export function fixtureBoards(fixture: Fixture): ShelfBoard[] {
  return fixture.levels.map((level) => {
    const [x, z] = toWorld(fixture, 0, 0)
    return {
      position: [x, level - 0.18, z],
      size: [fixture.length, 0.1, fixture.depth],
      rotation: [0, fixture.rotationY, 0],
    }
  })
}
