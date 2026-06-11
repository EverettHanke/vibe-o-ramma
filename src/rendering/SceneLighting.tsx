export function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.15} color="#4c1d95" />
      <directionalLight
        position={[0, 8, 4]}
        intensity={0.25}
        color="#c4b5fd"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={30}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <fog attach="fog" args={['#1c1917', 8, 22]} />
    </>
  )
}
