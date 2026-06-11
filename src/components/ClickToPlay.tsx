import { useEffect, useState } from 'react'

export function ClickToPlay() {
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    const onChange = () => {
      setLocked(document.pointerLockElement !== null)
    }
    document.addEventListener('pointerlockchange', onChange)
    return () => document.removeEventListener('pointerlockchange', onChange)
  }, [])

  if (locked) return null

  const requestLock = () => {
    const canvas = document.querySelector('canvas')
    canvas?.requestPointerLock()
  }

  return (
    <div
      onClick={requestLock}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.45)',
        cursor: 'pointer',
        zIndex: 20,
        fontFamily: 'system-ui, sans-serif',
        color: '#fff',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          padding: '24px 32px',
          background: 'rgba(0,0,0,0.6)',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>
          Click to play
        </div>
        <div style={{ fontSize: 14, opacity: 0.85 }}>
          Mouse look and WASD movement activate after one click
        </div>
        <div style={{ fontSize: 12, opacity: 0.6, marginTop: 8 }}>
          Press Esc to release the cursor
        </div>
      </div>
    </div>
  )
}
