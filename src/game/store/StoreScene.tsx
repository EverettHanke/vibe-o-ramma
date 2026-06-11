import { useGroceryList } from '@/state/groceryStore'
import { StoreEnvironment } from './StoreEnvironment'
import { GroceryProduct } from './GroceryProduct'
import { ShoppingCart } from './ShoppingCart'
import { slotForIndex } from './layout'

const CART_POSITION: [number, number, number] = [2, 0, 3]

/** Stagger done items above the cart so they drop in without overlapping. */
function cartDropPosition(order: number): [number, number, number] {
  const col = order % 2
  const row = Math.floor(order / 2) % 3
  return [
    CART_POSITION[0] - 0.18 + col * 0.36,
    1.3 + Math.floor(order / 6) * 0.45,
    CART_POSITION[2] - 0.35 + row * 0.35,
  ]
}

export function StoreScene() {
  const items = useGroceryList()
  const doneItems = items.filter((item) => item.done)

  let doneOrder = 0

  return (
    <>
      <StoreEnvironment />

      {items.map((item, index) => {
        let position: [number, number, number]
        if (item.done) {
          position = cartDropPosition(doneOrder++)
        } else {
          const [sx, sy, sz] = slotForIndex(index).position
          // Spawn just above the shelf board so the item settles instead of
          // popping out of an initial overlap.
          position = [sx, sy + 0.12, sz]
        }
        return (
          <GroceryProduct
            key={item.id}
            id={item.id}
            name={item.name}
            position={position}
          />
        )
      })}

      <ShoppingCart position={CART_POSITION} count={doneItems.length} />
    </>
  )
}
