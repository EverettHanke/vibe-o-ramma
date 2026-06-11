import { useEffect, useState } from 'react'
import {
  useGroceryList,
  addItem,
  renameItem,
  removeItem,
  toggleDone,
} from '@/state/groceryStore'
import { usePlannerOpen, setPlannerOpen } from '@/state/uiStore'
import type { GroceryItem } from '@/state/groceryStore'

function ItemRow({ item }: { item: GroceryItem }) {
  const [name, setName] = useState(item.name)

  useEffect(() => {
    setName(item.name)
  }, [item.name])

  const commit = () => {
    const trimmed = name.trim()
    if (trimmed && trimmed !== item.name) {
      renameItem(item.id, trimmed)
    } else {
      setName(item.name)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 0',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <input
        type="checkbox"
        checked={item.done}
        onChange={() => toggleDone(item.id)}
        style={{ width: 18, height: 18, cursor: 'pointer', flexShrink: 0 }}
      />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            commit()
            ;(e.target as HTMLInputElement).blur()
          }
        }}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          color: item.done ? '#9ca3af' : '#f3f4f6',
          textDecoration: item.done ? 'line-through' : 'none',
          fontSize: 15,
          padding: '4px 6px',
          borderRadius: 4,
          outline: 'none',
        }}
      />
      <button
        onClick={() => removeItem(item.id)}
        style={{
          background: 'rgba(239,68,68,0.15)',
          color: '#fca5a5',
          border: '1px solid rgba(239,68,68,0.35)',
          borderRadius: 6,
          padding: '4px 10px',
          cursor: 'pointer',
          fontSize: 13,
          flexShrink: 0,
        }}
      >
        Delete
      </button>
    </div>
  )
}

export function PlannerPanel() {
  const open = usePlannerOpen()
  const items = useGroceryList()
  const [draft, setDraft] = useState('')

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Tab') {
        e.preventDefault()
        setPlannerOpen(!open)
        if (!open) document.exitPointerLock()
      } else if (e.code === 'Escape' && open) {
        setPlannerOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  if (!open) return null

  const doneCount = items.filter((i) => i.done).length

  const submitDraft = () => {
    addItem(draft)
    setDraft('')
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 30,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          width: 'min(480px, 92vw)',
          maxHeight: '82vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(17,24,39,0.97)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 14,
          padding: 20,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 14,
          }}
        >
          <h2 style={{ color: '#f9fafb', fontSize: 20, fontWeight: 700 }}>
            Shopping List
          </h2>
          <span style={{ color: '#9ca3af', fontSize: 13 }}>
            {doneCount} / {items.length} in cart
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                submitDraft()
              }
            }}
            placeholder="Add an item..."
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 8,
              color: '#f3f4f6',
              fontSize: 15,
              padding: '10px 12px',
              outline: 'none',
            }}
          />
          <button
            onClick={submitDraft}
            style={{
              background: '#16a34a',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 18px',
              cursor: 'pointer',
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            Add
          </button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, paddingRight: 4 }}>
          {items.length === 0 ? (
            <div
              style={{
                color: '#6b7280',
                fontSize: 14,
                textAlign: 'center',
                padding: '24px 0',
              }}
            >
              No items yet. Add your first grocery item above.
            </div>
          ) : (
            items.map((item) => <ItemRow key={item.id} item={item} />)
          )}
        </div>

        <div
          style={{
            marginTop: 14,
            color: '#6b7280',
            fontSize: 12,
            textAlign: 'center',
          }}
        >
          Press Tab or Esc to close and return to the store
        </div>
      </div>
    </div>
  )
}
