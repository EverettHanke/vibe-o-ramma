import { useEffect, useState } from 'react'
import { useCharacter } from '@/core/CharacterContext'
import { ClickToPlay } from './ClickToPlay'
import { Crosshair } from './Crosshair'
import { InteractPrompt } from './InteractPrompt'

export function HUD() {
  const character = useCharacter()
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
          padding: '12px 16px',
          background: 'rgba(0,0,0,0.55)',
          color: '#e5e7eb',
          borderRadius: 8,
          fontFamily: 'system-ui, sans-serif',
          fontSize: 13,
          lineHeight: 1.6,
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Controls</div>
        <div>W / S — Move forward / back</div>
        <div>A / D — Strafe left / right</div>
        <div>Mouse — Look around (pill stays upright)</div>
        <div>Space — Jump</div>
        <div>Shift — Sprint</div>
        <div>E — Interact</div>
        <div style={{ marginTop: 8, opacity: 0.7, fontSize: 11 }}>
          Click once to capture mouse (Esc to release)
        </div>
      </div>
    </>
  )
}
