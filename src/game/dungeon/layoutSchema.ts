import type { ChorePlacement, WallSegment } from './dungeonLayout'
import {
  BOSS_GATE,
  CHORES,
  DUNGEON_WALLS,
  SPAWN,
  TORCHES,
  WALL_H,
  WALL_T,
} from './dungeonLayout'

export const LAYOUT_VERSION = 1 as const
export const GRID_SIZE = 36
export const STORAGE_KEY = 'vibe-o-ramma-dungeon-layout'

export type CellType =
  | 'empty'
  | 'wall'
  | 'spawn'
  | 'bones'
  | 'coins'
  | 'boss'
  | 'torch'
  | 'gate'

export type EditorTool = CellType | 'eraser'

export interface DungeonLayoutData {
  version: typeof LAYOUT_VERSION
  gridSize: number
  cells: CellType[]
}

export interface DerivedLayout {
  walls: WallSegment[]
  spawn: [number, number, number]
  chores: ChorePlacement[]
  torches: [number, number, number][]
  gate: {
    position: [number, number, number]
    size: [number, number, number]
  } | null
  floorSize: number
}

const MARKER_TO_QUEST: Record<'bones' | 'coins' | 'boss', string> = {
  bones: 'sweep-bones',
  coins: 'count-coins',
  boss: 'feed-boss',
}

const SINGLETON_MARKERS: CellType[] = [
  'spawn',
  'bones',
  'coins',
  'boss',
  'gate',
]

const CELL_COLORS: Record<CellType, string> = {
  empty: '#1f2937',
  wall: '#6b7280',
  spawn: '#22c55e',
  bones: '#e7e5e4',
  coins: '#fbbf24',
  boss: '#a855f7',
  torch: '#f97316',
  gate: '#ef4444',
}

export function cellColor(cell: CellType): string {
  return CELL_COLORS[cell]
}

export function cellIndex(gx: number, gz: number, gridSize: number): number {
  return gz * gridSize + gx
}

export function inBounds(gx: number, gz: number, gridSize: number): boolean {
  return gx >= 0 && gx < gridSize && gz >= 0 && gz < gridSize
}

export function gridCenter(gridSize: number): number {
  return Math.floor(gridSize / 2)
}

export function gridToWorld(
  gx: number,
  gz: number,
  gridSize: number,
): [number, number, number] {
  const c = gridCenter(gridSize)
  return [gx - c, 0, gz - c]
}

export function worldToGrid(
  x: number,
  z: number,
  gridSize: number,
): [number, number] {
  const c = gridCenter(gridSize)
  return [Math.round(x + c), Math.round(z + c)]
}

function emptyCells(gridSize: number): CellType[] {
  return Array.from({ length: gridSize * gridSize }, () => 'empty')
}

function rasterizeWallSegment(
  cells: CellType[],
  gridSize: number,
  wall: WallSegment,
): void {
  const [wx, , wz] = wall.position
  const [sx, , sz] = wall.size
  const minX = wx - sx / 2
  const maxX = wx + sx / 2
  const minZ = wz - sz / 2
  const maxZ = wz + sz / 2

  for (let x = Math.floor(minX - 0.5); x <= Math.ceil(maxX + 0.5); x++) {
    for (let z = Math.floor(minZ - 0.5); z <= Math.ceil(maxZ + 0.5); z++) {
      const [gx, gz] = worldToGrid(x, z, gridSize)
      if (!inBounds(gx, gz, gridSize)) continue
      cells[cellIndex(gx, gz, gridSize)] = 'wall'
    }
  }
}

function setMarkerAtWorld(
  cells: CellType[],
  gridSize: number,
  x: number,
  z: number,
  type: CellType,
): void {
  const [gx, gz] = worldToGrid(x, z, gridSize)
  if (!inBounds(gx, gz, gridSize)) return
  cells[cellIndex(gx, gz, gridSize)] = type
}

/** Build editable grid from the hand-authored dungeonLayout defaults. */
export function createDefaultLayout(): DungeonLayoutData {
  const gridSize = GRID_SIZE
  const cells = emptyCells(gridSize)

  for (const wall of DUNGEON_WALLS) {
    rasterizeWallSegment(cells, gridSize, wall)
  }

  setMarkerAtWorld(cells, gridSize, SPAWN[0], SPAWN[2], 'spawn')
  for (const chore of CHORES) {
    const type =
      chore.questId === 'sweep-bones'
        ? 'bones'
        : chore.questId === 'count-coins'
          ? 'coins'
          : 'boss'
    setMarkerAtWorld(cells, gridSize, chore.position[0], chore.position[2], type)
  }
  for (const torch of TORCHES) {
    setMarkerAtWorld(cells, gridSize, torch[0], torch[2], 'torch')
  }
  setMarkerAtWorld(cells, gridSize, BOSS_GATE.position[0], BOSS_GATE.position[2], 'gate')

  return { version: LAYOUT_VERSION, gridSize, cells }
}

export function deriveLayout(data: DungeonLayoutData): DerivedLayout {
  const { gridSize, cells } = data
  const walls: WallSegment[] = []
  const chores: ChorePlacement[] = []
  const torches: [number, number, number][] = []
  let spawn: [number, number, number] = [0, 2, 2.5]
  let gate: DerivedLayout['gate'] = null

  for (let gz = 0; gz < gridSize; gz++) {
    for (let gx = 0; gx < gridSize; gx++) {
      const cell = cells[cellIndex(gx, gz, gridSize)]
      const [x, , z] = gridToWorld(gx, gz, gridSize)

      switch (cell) {
        case 'wall':
          walls.push({
            position: [x, WALL_H / 2, z],
            size: [1, WALL_H, 1],
          })
          break
        case 'spawn':
          spawn = [x, 2, z]
          break
        case 'bones':
        case 'coins':
        case 'boss':
          chores.push({
            questId: MARKER_TO_QUEST[cell],
            position: [x, 0, z],
          })
          break
        case 'torch':
          torches.push([x, 1.8, z])
          break
        case 'gate':
          gate = {
            position: [x, 2, z],
            size: [WALL_T, 3.5, 2.5],
          }
          break
      }
    }
  }

  return {
    walls,
    spawn,
    chores,
    torches,
    gate,
    floorSize: gridSize,
  }
}

export function parseLayoutJson(raw: string): DungeonLayoutData {
  const parsed = JSON.parse(raw) as DungeonLayoutData
  if (parsed.version !== LAYOUT_VERSION) {
    throw new Error(`Unsupported layout version: ${parsed.version}`)
  }
  if (parsed.cells.length !== parsed.gridSize * parsed.gridSize) {
    throw new Error('Invalid layout: cell count does not match grid size')
  }
  return parsed
}

export function applyTool(
  cells: CellType[],
  gridSize: number,
  gx: number,
  gz: number,
  tool: EditorTool,
): CellType[] {
  if (!inBounds(gx, gz, gridSize)) return cells

  const next = cells.slice()
  const idx = cellIndex(gx, gz, gridSize)
  const paint = tool === 'eraser' ? 'empty' : tool

  if (SINGLETON_MARKERS.includes(paint)) {
    for (let i = 0; i < next.length; i++) {
      if (next[i] === paint) next[i] = 'empty'
    }
  }

  next[idx] = paint
  return next
}

export const TOOL_LABELS: Record<EditorTool, string> = {
  wall: 'Wall',
  eraser: 'Eraser',
  spawn: 'Spawn',
  bones: 'Sweep bones',
  coins: 'Count coins',
  boss: 'Feed boss',
  torch: 'Torch',
  gate: 'Boss gate',
  empty: 'Empty',
}

export const EDITOR_TOOLS: EditorTool[] = [
  'wall',
  'eraser',
  'spawn',
  'bones',
  'coins',
  'boss',
  'torch',
  'gate',
]
