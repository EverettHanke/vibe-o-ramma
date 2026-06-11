import { useEffect, useState } from 'react'
import { useCharacter } from '@/core/CharacterContext'
import { useGroceryList } from '@/state/groceryStore'
import { useCartGrip } from '@/state/cartPhysicsStore'
import { useCartAtRegister, useCheckedOut } from '@/state/runStore'
import { ClickToPlay } from './ClickToPlay'
import { Crosshair } from './Crosshair'
import { InteractPrompt } from './InteractPrompt'
import { PlannerPanel } from './PlannerPanel'

export function HUD() {
  const character = useCharacter()
  const items = useGroceryList()
  const grip = useCartGrip()
  const cartAtRegister = useCartAtRegister()
  const checkedOut = useCheckedOut()
  const [prompt, setPrompt] = useState<string | null>(null)

  useEffect(() => {
    const id = setInterval(() => {
      setPrompt(character.getInteractPrompt())
    }, 50)
    return () => clearInterval(id)
  }, [character])

  const doneCount = items.filter((i) => i.done).length
  const total = items.length
  const onPuddle = grip < 0.9

  return (
    <>
      <ClickToPlay />
      <Crosshair />
      <InteractPrompt text={prompt} />
      <PlannerPanel />

      {/* Objective */}
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
          minWidth: 160,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Run goal</div>
        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 8 }}>
          Fill cart → push to checkout
        </div>
        <div style={{ fontWeight: 600 }}>In cart</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#22c55e' }}>
          {doneCount} / {total}
        </div>
        {cartAtRegister && !checkedOut && (
          <div style={{ fontSize: 12, color: '#fbbf24', marginTop: 6 }}>
            At register…
          </div>
        )}
        {onPuddle && (
          <div style={{ fontSize: 12, color: '#38bdf8', marginTop: 6 }}>
            Cart slipping!
          </div>
        )}
      </div>

      {checkedOut && (
        <div
          style={{
            position: 'absolute',
            top: '12%',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '16px 32px',
            background: 'rgba(22,163,74,0.92)',
            color: '#fff',
            borderRadius: 10,
            fontFamily: 'system-ui, sans-serif',
            fontSize: 18,
            fontWeight: 700,
            pointerEvents: 'none',
            zIndex: 10,
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
            textAlign: 'center',
          }}
        >
          <div>Checked out!</div>
          <div style={{ fontSize: 14, fontWeight: 500, marginTop: 6, opacity: 0.95 }}>
            {doneCount} of {total} items on your list
          </div>
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
        <div>Push the cart through the aisles</div>
        <div>Avoid puddles — cart gets slippery</div>
        <div>Tab — Shopping list</div>
        <div style={{ marginTop: 8, opacity: 0.7, fontSize: 11 }}>
          Click once to capture mouse (Esc to release)
        </div>
      </div>
    </>
  )
}
