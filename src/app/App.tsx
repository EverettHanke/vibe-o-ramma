import { GameWorld } from '@/core/GameWorld'
import { CharacterProvider } from '@/core/CharacterContext'
import { DemoScene } from '@/game/DemoScene'
import { QuestProvider } from '@/game/quests/QuestContext'
import { HUD } from '@/components/HUD'

export function App() {
  return (
    <CharacterProvider>
      <QuestProvider>
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <GameWorld>
            <DemoScene />
          </GameWorld>
          <HUD />
        </div>
      </QuestProvider>
    </CharacterProvider>
  )
}
