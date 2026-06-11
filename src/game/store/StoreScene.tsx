import { useGroceryList } from '@/state/groceryStore'
import { StoreEnvironment } from './StoreEnvironment'
import { GroceryProduct } from './GroceryProduct'
import { ShoppingCart } from './ShoppingCart'
import { CheckoutRegister } from './CheckoutRegister'
import { Puddle } from './Puddle'
import { CART_SPAWN, PUDDLES, slotForIndex } from './layout'

/** Stagger done items above the cart so they drop in without overlapping. */
function cartDropPosition(
  cartPos: [number, number, number],
  order: number,
): [number, number, number] {
  const col = order % 2
  const row = Math.floor(order / 2) % 3
  return [
    cartPos[0] - 0.18 + col * 0.36,
    1.3 + Math.floor(order / 6) * 0.45,
    cartPos[2] - 0.35 + row * 0.35,
  ]
}

export function StoreScene() {
  const items = useGroceryList()
  const doneItems = items.filter((item) => item.done)

  let doneOrder = 0

  return (
    <>
      <StoreEnvironment />
      <CheckoutRegister />

      {PUDDLES.map((puddle) => (
        <Puddle
          key={puddle.id}
          position={puddle.position}
          size={puddle.size}
        />
      ))}

      {items.map((item, index) => {
        let position: [number, number, number]
        if (item.done) {
          position = cartDropPosition(CART_SPAWN, doneOrder++)
        } else {
          const [sx, sy, sz] = slotForIndex(index).position
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

      <ShoppingCart position={CART_SPAWN} count={doneItems.length} />
    </>
  )
}
