import { useCallback, useState } from 'react'
import { Level } from './Level'
import { InteractableDoor } from './interactables/InteractableDoor'
import { InteractableButton } from './interactables/InteractableButton'

export function DemoScene() {
  const [doorOpen, setDoorOpen] = useState(false)
  const [buttonPressed, setButtonPressed] = useState(false)

  const toggleDoor = useCallback(() => setDoorOpen((o) => !o), [])
  const pressButton = useCallback(() => {
    setButtonPressed(true)
    setDoorOpen(true)
  }, [])

  return (
    <>
      <Level />
      <InteractableDoor isOpen={doorOpen} onToggle={toggleDoor} />
      <InteractableButton pressed={buttonPressed} onPress={pressButton} />
    </>
  )
}
