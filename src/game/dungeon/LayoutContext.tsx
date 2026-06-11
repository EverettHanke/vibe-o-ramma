import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  applyTool,
  createDefaultLayout,
  deriveLayout,
  parseLayoutJson,
  STORAGE_KEY,
  type DerivedLayout,
  type DungeonLayoutData,
  type EditorTool,
} from './layoutSchema'

interface LayoutContextValue {
  layout: DungeonLayoutData
  derived: DerivedLayout
  editorOpen: boolean
  setEditorOpen: (open: boolean) => void
  toggleEditor: () => void
  tool: EditorTool
  setTool: (tool: EditorTool) => void
  paintCell: (gx: number, gz: number) => void
  resetToDefault: () => void
  exportLayout: () => void
  importLayout: (json: string) => void
}

const LayoutContext = createContext<LayoutContextValue | null>(null)

function loadStoredLayout(): DungeonLayoutData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return parseLayoutJson(raw)
  } catch {
    return null
  }
}

function persistLayout(layout: DungeonLayoutData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(layout))
}

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [layout, setLayout] = useState<DungeonLayoutData>(
    () => loadStoredLayout() ?? createDefaultLayout(),
  )
  const [editorOpen, setEditorOpen] = useState(false)
  const [tool, setTool] = useState<EditorTool>('wall')

  const derived = useMemo(() => deriveLayout(layout), [layout])

  const paintCell = useCallback(
    (gx: number, gz: number) => {
      setLayout((prev) => ({
        ...prev,
        cells: applyTool(prev.cells, prev.gridSize, gx, gz, tool),
      }))
    },
    [tool],
  )

  const resetToDefault = useCallback(() => {
    const defaults = createDefaultLayout()
    setLayout(defaults)
    persistLayout(defaults)
  }, [])

  const exportLayout = useCallback(() => {
    const blob = new Blob([JSON.stringify(layout, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'dungeon-layout.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }, [layout])

  const importLayout = useCallback((json: string) => {
    const parsed = parseLayoutJson(json)
    setLayout(parsed)
    persistLayout(parsed)
  }, [])

  const toggleEditor = useCallback(() => {
    setEditorOpen((open) => {
      const next = !open
      if (next) document.exitPointerLock()
      return next
    })
  }, [])

  useEffect(() => {
    persistLayout(layout)
  }, [layout])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'l' || e.key === 'L') {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          return
        }
        toggleEditor()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [toggleEditor])

  const value = useMemo(
    () => ({
      layout,
      derived,
      editorOpen,
      setEditorOpen,
      toggleEditor,
      tool,
      setTool,
      paintCell,
      resetToDefault,
      exportLayout,
      importLayout,
    }),
    [
      layout,
      derived,
      editorOpen,
      toggleEditor,
      tool,
      paintCell,
      resetToDefault,
      exportLayout,
      importLayout,
    ],
  )

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  )
}

export function useLayout(): LayoutContextValue {
  const ctx = useContext(LayoutContext)
  if (!ctx) throw new Error('useLayout must be used within LayoutProvider')
  return ctx
}
