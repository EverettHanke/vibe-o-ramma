import { GameWorld } from '@/core/GameWorld'
import { CharacterProvider } from '@/core/CharacterContext'
import { StoreScene } from '@/game/store/StoreScene'
import { HUD } from '@/components/HUD'

export function App() {
  return (
    <CharacterProvider>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <GameWorld>
          <StoreScene />
        </GameWorld>
        <HUD />
      </div>
    </CharacterProvider>
  )
}
