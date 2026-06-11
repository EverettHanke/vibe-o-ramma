import { GameWorld } from '@/core/GameWorld'
import { CharacterProvider } from '@/core/CharacterContext'
import { DemoScene } from '@/game/DemoScene'
import { LayoutProvider } from '@/game/dungeon/LayoutContext'
import { QuestProvider } from '@/game/quests/QuestContext'
import { HUD } from '@/components/HUD'
import { LevelEditor } from '@/components/LevelEditor'

export function App() {
  return (
    <CharacterProvider>
      <LayoutProvider>
        <QuestProvider>
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <GameWorld>
              <DemoScene />
            </GameWorld>
            <HUD />
            <LevelEditor />
          </div>
        </QuestProvider>
      </LayoutProvider>
    </CharacterProvider>
  )
}
