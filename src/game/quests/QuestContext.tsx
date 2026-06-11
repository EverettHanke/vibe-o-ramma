import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export interface QuestItem {
  id: string
  epicTitle: string
  mundaneSubtitle: string
  completed: boolean
  worldPosition: [number, number, number]
  emissiveColor?: string
  scale?: number
}

const SEED_QUESTS: QuestItem[] = [
  {
    id: 'hydra-emails',
    epicTitle: 'SLAY THE HYDRA OF UNREAD EMAILS',
    mundaneSubtitle: '12 messages. You started a reply in March.',
    completed: false,
    worldPosition: [-3, 1.4, -2],
    emissiveColor: '#7f1d1d',
  },
  {
    id: 'lost-artifact',
    epicTitle: 'RETRIEVE THE LOST ARTIFACT',
    mundaneSubtitle:
      'Return the Amazon box on your porch. It has cobwebs.',
    completed: false,
    worldPosition: [0, 1.4, -3],
  },
  {
    id: 'ancient-dragon',
    epicTitle: 'FACE THE ANCIENT DRAGON',
    mundaneSubtitle: 'Reply to the dentist. Tab open since 2019.',
    completed: false,
    worldPosition: [3, 1.4, -2],
    scale: 1.15,
    emissiveColor: '#92400e',
  },
]

const COMPLETION_QUIPS = [
  '+0 XP — emotional growth not implemented yet',
  'The torch flickers with faint approval.',
  'Quest complete. The universe remains unimpressed.',
  'Achievement unlocked: Did One Thing.',
]

interface QuestContextValue {
  quests: QuestItem[]
  completedCount: number
  allComplete: boolean
  lastQuip: string | null
  bossDoorOpened: boolean
  completeQuest: (id: string) => void
  openBossDoor: () => void
}

const QuestContext = createContext<QuestContextValue | null>(null)

export function QuestProvider({ children }: { children: ReactNode }) {
  const [quests, setQuests] = useState<QuestItem[]>(SEED_QUESTS)
  const [lastQuip, setLastQuip] = useState<string | null>(null)
  const [bossDoorOpened, setBossDoorOpened] = useState(false)

  const completedCount = quests.filter((q) => q.completed).length
  const allComplete = completedCount === quests.length

  const completeQuest = useCallback((id: string) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === id ? { ...q, completed: true } : q)),
    )
    setLastQuip(
      COMPLETION_QUIPS[Math.floor(Math.random() * COMPLETION_QUIPS.length)],
    )
  }, [])

  const openBossDoor = useCallback(() => {
    setBossDoorOpened(true)
    setLastQuip('Congratulations. New daily quests available.')
  }, [])

  const value = useMemo(
    () => ({
      quests,
      completedCount,
      allComplete,
      lastQuip,
      bossDoorOpened,
      completeQuest,
      openBossDoor,
    }),
    [
      quests,
      completedCount,
      allComplete,
      lastQuip,
      bossDoorOpened,
      completeQuest,
      openBossDoor,
    ],
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
