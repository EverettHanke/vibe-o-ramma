export interface PuddleZone {
  /** World position; y is floor level. */
  position: [number, number, number]
  /** Footprint as [width (x), depth (z)]. */
  size: [number, number]
}

/** Slippery puddles in the aisle walking lanes. */
export const PUDDLES: PuddleZone[] = [
  { position: [-3, 0, -2], size: [2.8, 3.4] },
  { position: [3, 0, 1], size: [3, 3.2] },
  { position: [0, 0, 6], size: [2.6, 2.6] },
]

/** True when the given XZ point lies within any puddle footprint. */
export function isPointOnPuddle(x: number, z: number): boolean {
  for (const p of PUDDLES) {
    const [px, , pz] = p.position
    const [w, d] = p.size
    if (Math.abs(x - px) <= w / 2 && Math.abs(z - pz) <= d / 2) return true
  }
  return false
}
