/** Wall segment in world space (center + full size). */
export interface WallSegment {
  position: [number, number, number]
  size: [number, number, number]
}

export interface ChorePlacement {
  questId: string
  position: [number, number, number]
}

export const WALL_H = 4
export const WALL_T = 0.4

export const SPAWN: [number, number, number] = [0, 2, 2.5]

/** East corridor gate — blocks boss wing until chores done. */
export const BOSS_GATE = {
  position: [6.5, 2, 0] as [number, number, number],
  size: [WALL_T, 3.5, 2.5] as [number, number, number],
}

const H = WALL_H
const T = WALL_T

/** Explicit wall segments for hub + 3 wing rooms + corridors. */
export const DUNGEON_WALLS: WallSegment[] = [
  // Outer boundary
  { position: [0, H / 2, -17], size: [34, H, T] },
  { position: [0, H / 2, 17], size: [34, H, T] },
  { position: [-17, H / 2, 0], size: [T, H, 34] },
  { position: [17, H / 2, 0], size: [T, H, 34] },

  // Start room (center) — south, east & west sides partial, north door frame
  { position: [0, H / 2, 3.2], size: [6, H, T] },
  { position: [-3.2, H / 2, 0], size: [T, H, 2.5] },
  { position: [-3.2, H / 2, 4], size: [T, H, 2] },
  { position: [3.2, H / 2, 0], size: [T, H, 2.5] },
  { position: [3.2, H / 2, 4], size: [T, H, 2] },
  { position: [-2.1, H / 2, 3.2], size: [1.8, H, T] },
  { position: [2.1, H / 2, 3.2], size: [1.8, H, T] },

  // North corridor (start → bone room)
  { position: [-1.45, H / 2, -6], size: [T, H, 6] },
  { position: [1.45, H / 2, -6], size: [T, H, 6] },

  // Bone room cap + sides
  { position: [0, H / 2, -15.2], size: [6, H, T] },
  { position: [-3.2, H / 2, -12], size: [T, H, 6] },
  { position: [3.2, H / 2, -12], size: [T, H, 6] },

  // West corridor (start → coin room)
  { position: [-6, H / 2, -1.45], size: [6, H, T] },
  { position: [-6, H / 2, 1.45], size: [6, H, T] },

  // Coin room cap + sides
  { position: [-15.2, H / 2, 0], size: [T, H, 6] },
  { position: [-12, H / 2, -3.2], size: [6, H, T] },
  { position: [-12, H / 2, 3.2], size: [6, H, T] },

  // East corridor (start → boss room)
  { position: [6, H / 2, -1.45], size: [5.5, H, T] },
  { position: [6, H / 2, 1.45], size: [5.5, H, T] },

  // Boss room cap + sides
  { position: [15.2, H / 2, 0], size: [T, H, 6] },
  { position: [12, H / 2, -3.2], size: [6, H, T] },
  { position: [12, H / 2, 3.2], size: [6, H, T] },

  // Block corner shortcuts
  { position: [-3.2, H / 2, -3.2], size: [T, H, T] },
  { position: [3.2, H / 2, -3.2], size: [T, H, T] },
  { position: [-3.2, H / 2, 3.2], size: [T, H, T] },
  { position: [3.2, H / 2, 3.2], size: [T, H, T] },
]

export const CHORES: ChorePlacement[] = [
  { questId: 'sweep-bones', position: [0, 0, -12] },
  { questId: 'count-coins', position: [-12, 0, 0] },
  { questId: 'feed-boss', position: [12, 0, 0] },
]

export const TORCHES: [number, number, number][] = [
  [0, 1.8, 2],
  [0, 1.8, -6],
  [0, 1.8, -13],
  [-6, 1.8, 0],
  [-13, 1.8, 0],
  [6, 1.8, 0],
  [13, 1.8, 0],
]

export const ROOM_LABELS: {
  position: [number, number, number]
  title: string
  rotationY?: number
}[] = [
  { position: [0, 2.6, 0.5], title: "Keeper's Station" },
  { position: [0, 2.6, -11.2], title: 'Bone Pantry' },
  { position: [-11.2, 2.6, 0], title: 'Treasury', rotationY: Math.PI / 2 },
  { position: [11.2, 2.6, 0], title: 'Boss Chamber', rotationY: -Math.PI / 2 },
]
