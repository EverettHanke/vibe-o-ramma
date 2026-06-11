import { useSyncExternalStore } from 'react'

export interface ReceiptData {
  number: string
  register: number
  cashier: string
  timestamp: number
  items: string[]
  total: number
  barcode: string
  quote: string
}

const CASHIERS = [
  'Sunny',
  'Marlowe',
  'Pixel',
  'Juniper',
  'Cosmo',
  'Wren',
  'Bodhi',
]

const QUOTES = [
  'You shopped, you conquered.',
  'Every list completed is a small victory.',
  'Fresh choices, fresher you.',
  'Adulting level: groceries acquired.',
  'The fridge thanks you.',
  'Snack responsibly, dream big.',
  'Cart goals: achieved.',
]

let receipt: ReceiptData | null = null
const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): ReceiptData | null {
  return receipt
}

function randomBarcode(): string {
  let s = ''
  for (let i = 0; i < 28; i++) s += Math.random() > 0.5 ? '1' : '0'
  return s
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function openReceipt(items: string[]): void {
  receipt = {
    number: String(Math.floor(100000 + Math.random() * 899999)),
    register: 1 + Math.floor(Math.random() * 8),
    cashier: pick(CASHIERS),
    timestamp: Date.now(),
    items,
    total: items.length,
    barcode: randomBarcode(),
    quote: pick(QUOTES),
  }
  emit()
}

export function clearReceipt(): void {
  if (receipt === null) return
  receipt = null
  emit()
}

export function useReceipt(): ReceiptData | null {
  return useSyncExternalStore(subscribe, getSnapshot)
}
