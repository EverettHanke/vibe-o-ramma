import { Ground, Platform } from '@/physics/colliders'

export function Level() {
  return (
    <>
      <Ground />

      <Platform position={[0, 0.5, -6]} size={[6, 0.5, 3]} color="#78716c" />
      <Platform
        position={[5, 1, -4]}
        size={[4, 0.5, 4]}
        rotation={[0.3, 0, 0]}
        color="#78716c"
      />
      <Platform position={[-6, 1.5, 2]} size={[3, 0.5, 5]} color="#78716c" />

      <mesh position={[6, 3, 0]} castShadow>
        <boxGeometry args={[0.2, 6, 4]} />
        <meshStandardMaterial color="#57534e" />
      </mesh>
    </>
  )
}
