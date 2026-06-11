import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type ChoreKind = 'bones' | 'coins' | 'boss'

export interface QuestItem {
  id: string
  epicTitle: string
  mundaneSubtitle: string
  kind: ChoreKind
  completed: boolean
  worldPosition: [number, number, number]
}

const SEED_QUESTS: QuestItem[] = [
  {
    id: 'sweep-bones',
    epicTitle: 'SWEEP THE BONES',
    mundaneSubtitle: 'Adventurers never clean up after themselves.',
    kind: 'bones',
    completed: false,
    worldPosition: [0, 0, -12],
  },
  {
    id: 'count-coins',
    epicTitle: 'COUNT THE COINS',
    mundaneSubtitle: 'Treasury audit due before the goblins wake up.',
    kind: 'coins',
    completed: false,
    worldPosition: [-12, 0, 0],
  },
  {
    id: 'feed-boss',
    epicTitle: 'FEED THE BOSS MONSTER',
    mundaneSubtitle: 'Third breakfast or we all hear about it.',
    kind: 'boss',
    completed: false,
    worldPosition: [12, 0, 0],
  },
]

const COMPLETION_QUIPS: Record<string, string[]> = {
  'sweep-bones': [
    'Bones: relocated to the bone zone.',
    'Spotless. For now.',
    'The skeletons appreciate your service.',
  ],
  'count-coins': [
    'Treasury balanced. Lost 3 coins. Classic.',
    'Count complete. Do not spend any.',
    'The coins jingle in approval.',
  ],
  'feed-boss': [
    'Boss fed. It belched. Shift complete.',
    'Monster satisfied. You may leave. (You may not leave.)',
    'Third breakfast served. Peace returns to the dungeon.',
  ],
}

interface QuestContextValue {
  quests: QuestItem[]
  completedCount: number
  allComplete: boolean
  lastQuip: string | null
  completeQuest: (id: string) => void
  canStartChore: (id: string) => boolean
}

const QuestContext = createContext<QuestContextValue | null>(null)

export function QuestProvider({ children }: { children: ReactNode }) {
  const [quests, setQuests] = useState<QuestItem[]>(SEED_QUESTS)
  const [lastQuip, setLastQuip] = useState<string | null>(null)

  const completedCount = quests.filter((q) => q.completed).length
  const allComplete = completedCount === quests.length

  const canStartChore = useCallback(
    (id: string) => {
      if (id !== 'feed-boss') return true
      return quests
        .filter((q) => q.id !== 'feed-boss')
        .every((q) => q.completed)
    },
    [quests],
  )

  const completeQuest = useCallback((id: string) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === id ? { ...q, completed: true } : q)),
    )
    const quips = COMPLETION_QUIPS[id] ?? ['Chore complete.']
    setLastQuip(quips[Math.floor(Math.random() * quips.length)])
  }, [])

  const value = useMemo(
    () => ({
      quests,
      completedCount,
      allComplete,
      lastQuip,
      completeQuest,
      canStartChore,
    }),
    [quests, completedCount, allComplete, lastQuip, completeQuest, canStartChore],
  )

  return (
    <QuestContext.Provider value={value}>{children}</QuestContext.Provider>
  )
}

export function useQuests(): QuestContextValue {
  const ctx = useContext(QuestContext)
  if (!ctx) throw new Error('useQuests must be used within QuestProvider')
  return ctx
}
