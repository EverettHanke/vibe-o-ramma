import { createContext, useContext, useRef, type ReactNode } from 'react'
import { Character } from './Character'

interface CharacterContextValue {
  character: Character
}

const CharacterContext = createContext<CharacterContextValue | null>(null)

export function CharacterProvider({ children }: { children: ReactNode }) {
  const characterRef = useRef(new Character())
  return (
    <CharacterContext.Provider value={{ character: characterRef.current }}>
      {children}
    </CharacterContext.Provider>
  )
}

export function useCharacter(): Character {
  const ctx = useContext(CharacterContext)
  if (!ctx) throw new Error('useCharacter must be used within CharacterProvider')
  return ctx.character
}
