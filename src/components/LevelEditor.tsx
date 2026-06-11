import { useCallback, useRef, useState, type ReactNode } from 'react'
import { useLayout } from '@/game/dungeon/LayoutContext'
import {
  cellColor,
  EDITOR_TOOLS,
  gridToWorld,
  inBounds,
  TOOL_LABELS,
  type CellType,
  type EditorTool,
} from '@/game/dungeon/layoutSchema'

const CELL_PX = 14

export function LevelEditor() {
  const {
    layout,
    editorOpen,
    setEditorOpen,
    tool,
    setTool,
    paintCell,
    resetToDefault,
    exportLayout,
    importLayout,
  } = useLayout()

  const [hover, setHover] = useState<[number, number] | null>(null)
  const painting = useRef(false)

  const handlePaint = useCallback(
    (gx: number, gz: number) => {
      if (!inBounds(gx, gz, layout.gridSize)) return
      paintCell(gx, gz)
    },
    [layout.gridSize, paintCell],
  )

  const onImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        try {
          importLayout(reader.result)
        } catch (err) {
          alert(err instanceof Error ? err.message : 'Failed to import layout')
        }
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  if (!editorOpen) return null

  const gridPx = layout.gridSize * CELL_PX

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 30,
        display: 'flex',
        background: 'rgba(0,0,0,0.55)',
        fontFamily: 'system-ui, sans-serif',
        color: '#e5e7eb',
      }}
      onMouseUp={() => {
        painting.current = false
      }}
      onMouseLeave={() => {
        painting.current = false
        setHover(null)
      }}
    >
      <div
        style={{
          width: 280,
          padding: 16,
          background: 'rgba(20, 12, 8, 0.95)',
          borderRight: '1px solid rgba(251, 191, 36, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          overflowY: 'auto',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 16, color: '#fbbf24' }}>
          Level Editor
        </div>
        <div style={{ fontSize: 12, opacity: 0.75, lineHeight: 1.5 }}>
          Paint walls and markers on the grid. Changes save automatically.
          Press <strong>L</strong> to toggle this panel.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {EDITOR_TOOLS.map((t) => (
            <ToolButton key={t} active={tool === t} tool={t} onSelect={setTool} />
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          <ActionButton onClick={() => setEditorOpen(false)}>Play (L)</ActionButton>
          <ActionButton onClick={exportLayout}>Export JSON</ActionButton>
          <label style={{ fontSize: 12 }}>
            <span
              style={{
                display: 'block',
                padding: '8px 10px',
                background: '#374151',
                borderRadius: 6,
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              Import JSON
            </span>
            <input
              type="file"
              accept="application/json,.json"
              onChange={onImportFile}
              style={{ display: 'none' }}
            />
          </label>
          <ActionButton
            onClick={() => {
              if (confirm('Reset to the built-in default maze?')) resetToDefault()
            }}
            muted
          >
            Reset to default
          </ActionButton>
        </div>

        {hover && (
          <div style={{ fontSize: 11, opacity: 0.65, marginTop: 'auto' }}>
            Cell ({hover[0]}, {hover[1]}) → world (
            {gridToWorld(hover[0], hover[1], layout.gridSize)
              .map((n) => n.toFixed(1))
              .join(', ')}
            )
          </div>
        )}
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
          padding: 24,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${layout.gridSize}, ${CELL_PX}px)`,
            width: gridPx,
            height: gridPx,
            border: '1px solid #4b5563',
            userSelect: 'none',
          }}
          onMouseDown={() => {
            painting.current = true
          }}
        >
          {layout.cells.map((cell, i) => {
            const gx = i % layout.gridSize
            const gz = Math.floor(i / layout.gridSize)
            return (
              <div
                key={i}
                title={`${gx}, ${gz}: ${cell}`}
                style={{
                  width: CELL_PX,
                  height: CELL_PX,
                  background: cellColor(cell),
                  border: '1px solid rgba(0,0,0,0.25)',
                  boxSizing: 'border-box',
                  cursor: 'crosshair',
                }}
                onMouseEnter={() => {
                  setHover([gx, gz])
                  if (painting.current) handlePaint(gx, gz)
                }}
                onMouseDown={(e) => {
                  e.preventDefault()
                  painting.current = true
                  handlePaint(gx, gz)
                }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ToolButton({
  tool,
  active,
  onSelect,
}: {
  tool: EditorTool
  active: boolean
  onSelect: (tool: EditorTool) => void
}) {
  const preview = tool === 'eraser' ? 'empty' : tool
  return (
    <button
      type="button"
      onClick={() => onSelect(tool)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 10px',
        background: active ? '#78350f' : '#374151',
        border: active ? '1px solid #fbbf24' : '1px solid transparent',
        borderRadius: 6,
        color: '#f5e6c8',
        cursor: 'pointer',
        fontSize: 12,
        textAlign: 'left',
      }}
    >
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: 2,
          background: cellColor(preview as CellType),
          border: '1px solid rgba(255,255,255,0.2)',
          flexShrink: 0,
        }}
      />
      {TOOL_LABELS[tool]}
    </button>
  )
}

function ActionButton({
  children,
  onClick,
  muted,
}: {
  children: ReactNode
  onClick: () => void
  muted?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '8px 10px',
        background: muted ? '#1f2937' : '#4b5563',
        border: 'none',
        borderRadius: 6,
        color: '#e5e7eb',
        cursor: 'pointer',
        fontSize: 12,
      }}
    >
      {children}
    </button>
  )
}
