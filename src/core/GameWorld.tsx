import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { Suspense, type ReactNode } from 'react'
import { InputProvider } from '@/platform/input'
import { SceneLighting } from '@/rendering/SceneLighting'
import { CharacterController } from './CharacterController'

interface GameWorldProps {
  children?: ReactNode
}

function GameScene({ children }: GameWorldProps) {
  return (
    <InputProvider>
      <SceneLighting />
      <Physics gravity={[0, -15, 0]}>
        {children}
        <CharacterController />
      </Physics>
    </InputProvider>
  )
}

export function GameWorld({ children }: GameWorldProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 4, 8], fov: 60, near: 0.1, far: 200 }}
      style={{ width: '100%', height: '100%' }}
      onCreated={({ gl }) => {
        gl.setClearColor('#87ceeb')
      }}
    >
      <Suspense fallback={null}>
        <GameScene>{children}</GameScene>
      </Suspense>
    </Canvas>
  )
}
