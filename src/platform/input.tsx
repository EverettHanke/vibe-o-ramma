import { KeyboardControls, useKeyboardControls } from '@react-three/drei'
import type { ReactNode } from 'react'

/** Names match ecctrl's KeyboardControls expectations. */
export type InputAction =
  | 'forward'
  | 'backward'
  | 'leftward'
  | 'rightward'
  | 'jump'
  | 'run'
  | 'interact'

export const keyboardMap: { name: InputAction; keys: string[] }[] = [
  { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
  { name: 'backward', keys: ['KeyS', 'ArrowDown'] },
  { name: 'leftward', keys: ['KeyA', 'ArrowLeft'] },
  { name: 'rightward', keys: ['KeyD', 'ArrowRight'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'run', keys: ['ShiftLeft', 'ShiftRight'] },
  { name: 'interact', keys: ['KeyE'] },
]

export interface InputState {
  forward: boolean
  backward: boolean
  leftward: boolean
  rightward: boolean
  jump: boolean
  run: boolean
  interact: boolean
}

export function InputProvider({ children }: { children: ReactNode }) {
  return (
    <KeyboardControls map={keyboardMap}>{children}</KeyboardControls>
  )
}

/** Read keyboard state once per render. Prefer getInputState() inside useFrame. */
export function useInput(): InputState {
  const [, getKeys] = useKeyboardControls<InputAction>()
  return readInputState(getKeys)
}

/** Returns a getter so input can be polled every frame in useFrame. */
export function useInputGetter(): () => InputState {
  const [, getKeys] = useKeyboardControls<InputAction>()
  return () => readInputState(getKeys)
}

function readInputState(
  getKeys: () => Record<InputAction, boolean>,
): InputState {
  const keys = getKeys()
  return {
    forward: keys.forward,
    backward: keys.backward,
    leftward: keys.leftward,
    rightward: keys.rightward,
    jump: keys.jump,
    run: keys.run,
    interact: keys.interact,
  }
}
