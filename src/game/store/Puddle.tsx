interface PuddleProps {
  position: [number, number, number]
  /** Footprint as [width (x), depth (z)]. */
  size: [number, number]
}

/**
 * A slippery water puddle (visual only). The cart detects overlap by testing
 * its own position against the shared puddle zones, so no sensor is needed.
 */
export function Puddle({ position, size }: PuddleProps) {
  const [w, d] = size
  const [x, y, z] = position

  return (
    <group position={[x, y, z]}>
      {/* Main blob */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow>
        <circleGeometry args={[Math.max(w, d) / 2, 32]} />
        <meshStandardMaterial
          color="#38bdf8"
          transparent
          opacity={0.5}
          roughness={0.08}
          metalness={0.3}
          emissive="#0ea5e9"
          emissiveIntensity={0.18}
        />
      </mesh>
      {/* Organic offset lobes */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[w * 0.28, 0.011, d * 0.18]}
        receiveShadow
      >
        <circleGeometry args={[Math.min(w, d) / 2.6, 24]} />
        <meshStandardMaterial
          color="#38bdf8"
          transparent
          opacity={0.45}
          roughness={0.08}
          metalness={0.3}
        />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-w * 0.26, 0.011, -d * 0.2]}
        receiveShadow
      >
        <circleGeometry args={[Math.min(w, d) / 3, 24]} />
        <meshStandardMaterial
          color="#38bdf8"
          transparent
          opacity={0.45}
          roughness={0.08}
          metalness={0.3}
        />
      </mesh>
    </group>
  )
}
