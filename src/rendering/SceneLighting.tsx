export function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.38} color="#78716c" />
      <hemisphereLight
        args={['#fef3c7', '#44403c', 0.35]}
        position={[0, 6, 0]}
      />
      <directionalLight
        position={[0, 8, 4]}
        intensity={0.55}
        color="#fde68a"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={30}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <fog attach="fog" args={['#292524', 18, 55]} />
    </>
  )
}
