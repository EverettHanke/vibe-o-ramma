import { useCallback, useEffect, useMemo } from 'react'
import { useReceipt, clearReceipt, type ReceiptData } from '@/state/checkoutStore'
import { advanceLevel } from '@/state/levelStore'

function toothClipPath(teeth = 24, tooth = 7): string {
  const top: string[] = []
  const bottom: string[] = []
  for (let i = 0; i <= teeth; i++) {
    const x = ((i / teeth) * 100).toFixed(2)
    top.push(`${x}% ${i % 2 === 0 ? 0 : tooth}px`)
    const j = teeth - i
    bottom.push(`${((j / teeth) * 100).toFixed(2)}% calc(100% - ${j % 2 === 0 ? 0 : tooth}px)`)
  }
  return `polygon(${[...top, ...bottom].join(', ')})`
}

function Barcode({ bits }: { bits: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 1,
        height: 46,
        margin: '6px 0',
      }}
    >
      {bits.split('').map((b, i) => (
        <div
          key={i}
          style={{
            width: b === '1' ? 3 : 1.5,
            height: b === '1' ? 46 : 38,
            background: '#111',
          }}
        />
      ))}
    </div>
  )
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ReceiptCard({ receipt }: { receipt: ReceiptData }) {
  const clip = useMemo(() => toothClipPath(), [])
  const divider = '· · · · · · · · · · · · · · · · · · · · · · · ·'

  return (
    <div
      style={{
        width: 340,
        maxHeight: '88vh',
        overflowY: 'auto',
        background: '#fdfdf8',
        color: '#1a1a1a',
        fontFamily: '"Courier New", ui-monospace, monospace',
        fontSize: 13,
        lineHeight: 1.55,
        padding: '26px 26px 30px',
        clipPath: clip,
        boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
        transform: 'rotate(-1.2deg)',
        animation: 'receiptPrint 600ms cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <div style={{ textAlign: 'center', letterSpacing: 2 }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>FRESH MART</div>
        <div style={{ fontSize: 11, opacity: 0.7 }}>~ open 25 hours a day ~</div>
        <div style={{ fontSize: 11, opacity: 0.7 }}>123 Vibe Avenue, Aisle City</div>
      </div>

      <div style={{ textAlign: 'center', margin: '8px 0', opacity: 0.6 }}>
        {divider}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
        <span>RECEIPT #{receipt.number}</span>
        <span>REG {receipt.register}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
        <span>Cashier: {receipt.cashier}</span>
        <span>{formatTime(receipt.timestamp)}</span>
      </div>

      <div style={{ textAlign: 'center', margin: '8px 0', opacity: 0.6 }}>
        {divider}
      </div>

      <div style={{ fontWeight: 700, textAlign: 'center', marginBottom: 6 }}>
        ★ YOUR GROCERY LIST ★
      </div>

      {receipt.items.length === 0 ? (
        <div style={{ textAlign: 'center', fontStyle: 'italic', opacity: 0.6 }}>
          (your cart was empty)
        </div>
      ) : (
        receipt.items.map((name, i) => (
          <div
            key={`${name}-${i}`}
            style={{ display: 'flex', justifyContent: 'space-between' }}
          >
            <span>
              [x] {name.toUpperCase()}
            </span>
            <span style={{ opacity: 0.5 }}>
              {String(i + 1).padStart(2, '0')}
            </span>
          </div>
        ))
      )}

      <div style={{ textAlign: 'center', margin: '8px 0', opacity: 0.6 }}>
        {divider}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
        <span>ITEMS COLLECTED</span>
        <span>{receipt.total}</span>
      </div>

      <Barcode bits={receipt.barcode} />
      <div style={{ textAlign: 'center', fontSize: 10, letterSpacing: 3, opacity: 0.7 }}>
        {receipt.number} {receipt.register}00{receipt.total}
      </div>

      <div
        style={{
          textAlign: 'center',
          marginTop: 12,
          fontStyle: 'italic',
          fontSize: 12,
        }}
      >
        “{receipt.quote}”
      </div>
      <div style={{ textAlign: 'center', marginTop: 6, fontSize: 11, opacity: 0.7 }}>
        ❤ THANK YOU FOR SHOPPING ❤
      </div>
    </div>
  )
}

export function ReceiptOverlay() {
  const receipt = useReceipt()

  // Dismissing the receipt ends the mission and starts the next level with a
  // fresh randomized list.
  const finishMission = useCallback(() => {
    clearReceipt()
    advanceLevel()
  }, [])

  useEffect(() => {
    if (!receipt) return
    document.exitPointerLock()
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') finishMission()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [receipt, finishMission])

  if (!receipt) return null

  return (
    <div
      onClick={finishMission}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 40,
      }}
    >
      <style>{`@keyframes receiptPrint {
        from { transform: translateY(-60px) rotate(-1.2deg); opacity: 0; }
        to { transform: translateY(0) rotate(-1.2deg); opacity: 1; }
      }`}</style>
      <div onClick={(e) => e.stopPropagation()}>
        <ReceiptCard receipt={receipt} />
      </div>
      <button
        onClick={finishMission}
        style={{
          marginTop: 20,
          background: '#16a34a',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '10px 22px',
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        Next trip (Esc)
      </button>
    </div>
  )
}
