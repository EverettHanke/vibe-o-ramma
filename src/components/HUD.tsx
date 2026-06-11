import { useEffect, useState } from 'react'
import { useCharacter } from '@/core/CharacterContext'
import { useQuests } from '@/game/quests/QuestContext'
import { ClickToPlay } from './ClickToPlay'
import { Crosshair } from './Crosshair'
import { InteractPrompt } from './InteractPrompt'

export function HUD() {
  const character = useCharacter()
  const { quests, completedCount, allComplete, lastQuip } = useQuests()
  const [prompt, setPrompt] = useState<string | null>(null)

  useEffect(() => {
    const id = setInterval(() => {
      setPrompt(character.getInteractPrompt())
    }, 50)
    return () => clearInterval(id)
  }, [character])

  return (
    <>
      <ClickToPlay />
      <Crosshair />
      <InteractPrompt text={prompt} />

      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          padding: '14px 18px',
          background: 'rgba(20, 12, 8, 0.82)',
          color: '#f5e6c8',
          borderRadius: 8,
          border: '1px solid rgba(251, 191, 36, 0.35)',
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: 13,
          lineHeight: 1.55,
          pointerEvents: 'none',
          zIndex: 10,
          maxWidth: 320,
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: '#fbbf24',
            marginBottom: 6,
            letterSpacing: '0.04em',
          }}
        >
          Dungeon Keeper&apos;s Log
        </div>
        <div style={{ opacity: 0.85, marginBottom: 10 }}>
          Rank: Junior Custodian
        </div>
        <div style={{ marginBottom: 8, color: '#fcd34d' }}>
          Shift duties: {completedCount}/{quests.length}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {quests.map((quest) => (
            <div key={quest.id}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 12,
                  textDecoration: quest.completed ? 'line-through' : 'none',
                  opacity: quest.completed ? 0.5 : 1,
                  color: quest.completed ? '#9ca3af' : '#fef3c7',
                }}
              >
                {quest.epicTitle}
              </div>
              {!quest.completed && (
                <div
                  style={{
                    fontSize: 11,
                    opacity: 0.65,
                    fontStyle: 'italic',
                    marginTop: 2,
                    fontFamily: 'system-ui, sans-serif',
                  }}
                >
                  {quest.mundaneSubtitle}
                </div>
              )}
            </div>
          ))}
        </div>

        {lastQuip && (
          <div
            style={{
              marginTop: 12,
              paddingTop: 10,
              borderTop: '1px solid rgba(251, 191, 36, 0.2)',
              fontSize: 12,
              color: '#fbbf24',
              fontStyle: 'italic',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            {lastQuip}
          </div>
        )}

        {allComplete && (
          <div
            style={{
              marginTop: 8,
              fontSize: 11,
              opacity: 0.75,
              fontFamily: 'system-ui, sans-serif',
              color: '#86efac',
            }}
          >
            Shift complete. The dungeon will mess itself up again by morning.
          </div>
        )}
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          padding: '10px 14px',
          background: 'rgba(0,0,0,0.45)',
          color: '#9ca3af',
          borderRadius: 8,
          fontFamily: 'system-ui, sans-serif',
          fontSize: 11,
          lineHeight: 1.5,
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        <div>WASD · Mouse · Space · Shift · E</div>
      </div>
    </>
  )
}
