import { useEffect, useState } from 'react'
import { useCharacter } from '@/core/CharacterContext'
import { useGroceryList } from '@/state/groceryStore'
import { ClickToPlay } from './ClickToPlay'
import { Crosshair } from './Crosshair'
import { InteractPrompt } from './InteractPrompt'
import { PlannerPanel } from './PlannerPanel'

export function HUD() {
  const character = useCharacter()
  const items = useGroceryList()
  const [prompt, setPrompt] = useState<string | null>(null)

  useEffect(() => {
    const id = setInterval(() => {
      setPrompt(character.getInteractPrompt())
    }, 50)
    return () => clearInterval(id)
  }, [character])

  const doneCount = items.filter((i) => i.done).length
  const total = items.length
  const allDone = total > 0 && doneCount === total

  return (
    <>
      <ClickToPlay />
      <Crosshair />
      <InteractPrompt text={prompt} />
      <PlannerPanel />

      {/* Cart progress */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          padding: '12px 16px',
          background: 'rgba(0,0,0,0.55)',
          color: '#e5e7eb',
          borderRadius: 8,
          fontFamily: 'system-ui, sans-serif',
          fontSize: 14,
          pointerEvents: 'none',
          zIndex: 10,
          textAlign: 'right',
        }}
      >
        <div style={{ fontWeight: 600 }}>Cart</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#22c55e' }}>
          {doneCount} / {total}
        </div>
      </div>

      {allDone && (
        <div
          style={{
            position: 'absolute',
            top: '12%',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '14px 28px',
            background: 'rgba(22,163,74,0.92)',
            color: '#fff',
            borderRadius: 10,
            fontFamily: 'system-ui, sans-serif',
            fontSize: 18,
            fontWeight: 700,
            pointerEvents: 'none',
            zIndex: 10,
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
          }}
        >
          Shopping complete!
        </div>
      )}

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
        <div>Mouse — Look around</div>
        <div>Space — Jump</div>
        <div>Shift — Sprint</div>
        <div>E — Grab / drop item</div>
        <div>Walk into the cart to push it</div>
        <div>Tab — Shopping list</div>
        <div style={{ marginTop: 8, opacity: 0.7, fontSize: 11 }}>
          Click once to capture mouse (Esc to release)
        </div>
      </div>
    </>
  )
}
