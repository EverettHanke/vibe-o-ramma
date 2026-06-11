import * as THREE from 'three'

const cache = new Map<string, THREE.Texture>()

function makeCanvas(size: number): {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
} | null {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  return { canvas, ctx }
}

/** Glossy supermarket floor: large tiles with subtle speckle and grout lines. */
export function tiledFloorTexture(repeat = 16): THREE.Texture {
  const key = `floor-${repeat}`
  const cached = cache.get(key)
  if (cached) return cached

  const made = makeCanvas(256)
  const texture = made
    ? new THREE.CanvasTexture(made.canvas)
    : new THREE.Texture()

  if (made) {
    const { ctx } = made
    ctx.fillStyle = '#e7e5e4'
    ctx.fillRect(0, 0, 256, 256)
    // Speckle
    for (let i = 0; i < 1400; i++) {
      const shade = 200 + Math.floor(Math.random() * 45)
      ctx.fillStyle = `rgba(${shade},${shade},${shade - 8},0.5)`
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2)
    }
    // Grout lines (2x2 tiles)
    ctx.strokeStyle = '#b8b4b0'
    ctx.lineWidth = 4
    ctx.strokeRect(0, 0, 128, 128)
    ctx.strokeRect(128, 0, 128, 128)
    ctx.strokeRect(0, 128, 128, 128)
    ctx.strokeRect(128, 128, 128, 128)
  }

  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(repeat, repeat)
  texture.anisotropy = 4
  texture.needsUpdate = true
  cache.set(key, texture)
  return texture
}

/** Frosted blue gradient for refrigerator glass doors. */
export function fridgeFrostTexture(): THREE.Texture {
  const key = 'frost'
  const cached = cache.get(key)
  if (cached) return cached

  const made = makeCanvas(128)
  const texture = made
    ? new THREE.CanvasTexture(made.canvas)
    : new THREE.Texture()

  if (made) {
    const { ctx } = made
    const grad = ctx.createLinearGradient(0, 0, 128, 128)
    grad.addColorStop(0, 'rgba(230,245,255,0.85)')
    grad.addColorStop(0.5, 'rgba(190,225,245,0.55)')
    grad.addColorStop(1, 'rgba(225,242,255,0.8)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 128, 128)
    for (let i = 0; i < 500; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.4})`
      const r = Math.random() * 2
      ctx.beginPath()
      ctx.arc(Math.random() * 128, Math.random() * 128, r, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  texture.needsUpdate = true
  cache.set(key, texture)
  return texture
}
