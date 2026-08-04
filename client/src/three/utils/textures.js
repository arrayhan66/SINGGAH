import * as THREE from "three"

function makeCanvas(size) {
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  return { canvas, ctx, size }
}

function toTexture(canvas, repeatX = 1, repeatY = 1) {
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(repeatX, repeatY)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

const rand = (min, max) => min + Math.random() * (max - min)

function woodFloorTexture() {
  const size = 512
  const { ctx } = makeCanvas(size)
  const plankW = size / 5
  for (let row = 0; row < 5; row++) {
    const y = row * plankW
    const offset = row % 2 === 0 ? 0 : plankW / 2
    for (let col = -1; col < 6; col++) {
      const x = col * plankW + offset
      const tone = rand(78, 118)
      const grad = ctx.createLinearGradient(x, y, x + plankW, y + plankW)
      grad.addColorStop(0, `rgb(${tone * 0.6}, ${tone * 0.72}, ${tone * 0.95})`)
      grad.addColorStop(1, `rgb(${tone * 0.5}, ${tone * 0.62}, ${tone * 0.82})`)
      ctx.fillStyle = grad
      ctx.fillRect(x, y, plankW, plankW)

      ctx.strokeStyle = `rgba(10,22,42,0.9)`
      ctx.lineWidth = 4
      ctx.strokeRect(x, y, plankW, plankW)

      for (let i = 0; i < 6; i++) {
        const gx = rand(x + 10, x + plankW - 10)
        const gy = rand(y + 10, y + plankW - 10)
        const glen = rand(20, 60)
        ctx.strokeStyle = `rgba(${tone * 0.28}, ${tone * 0.38}, ${tone * 0.6}, 0.5)`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(gx, gy)
        ctx.bezierCurveTo(gx + glen * 0.4, gy + rand(-6, 6), gx + glen * 0.6, gy + rand(-6, 6), gx + glen, gy)
        ctx.stroke()
      }

      ctx.fillStyle = "rgba(0,0,0,0.18)"
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.arc(rand(x, x + plankW), rand(y, y + plankW), rand(3, 8), 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }
  return toTexture(ctx.canvas, 2, 2)
}

function marbleFloorTexture() {
  const size = 512
  const { ctx } = makeCanvas(size)
  ctx.fillStyle = "#e7eef7"
  ctx.fillRect(0, 0, size, size)

  for (let i = 0; i < 26; i++) {
    ctx.strokeStyle = `rgba(110,135,165,${rand(0.14, 0.34)})`
    ctx.lineWidth = rand(1, 3)
    ctx.beginPath()
    const x = rand(0, size)
    const y = rand(0, size)
    ctx.moveTo(x, y)
    ctx.bezierCurveTo(
      x + rand(-60, 60),
      y + rand(-60, 60),
      x + rand(-60, 60),
      y + rand(-60, 60),
      x + rand(-140, 140),
      y + rand(-140, 140),
    )
    ctx.stroke()
  }

  ctx.strokeStyle = "rgba(125,155,190,0.4)"
  ctx.lineWidth = 3
  for (let i = 0; i <= size; i += size / 4) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, size)
    ctx.moveTo(0, i)
    ctx.lineTo(size, i)
    ctx.stroke()
  }
  return toTexture(ctx.canvas, 2, 2)
}

function wallPlasterTexture() {
  const size = 256
  const { ctx } = makeCanvas(size)
  ctx.fillStyle = "#dfe9f4"
  ctx.fillRect(0, 0, size, size)
  for (let i = 0; i < 900; i++) {
    const a = rand(0, 0.14)
    const t = rand(208, 244)
    ctx.fillStyle = `rgba(${t}, ${t}, ${t + 6}, ${a})`
    ctx.fillRect(rand(0, size), rand(0, size), rand(2, 5), rand(2, 5))
  }
  ctx.fillStyle = "rgba(140,165,195,0.12)"
  for (let i = 0; i < 40; i++) {
    ctx.fillRect(rand(0, size), rand(0, size), size, rand(1, 2))
  }
  return toTexture(ctx.canvas, 2, 2)
}

function ceilingTexture() {
  const size = 512
  const { ctx } = makeCanvas(size)
  ctx.fillStyle = "#dce7f3"
  ctx.fillRect(0, 0, size, size)
  const cell = size / 4
  ctx.strokeStyle = "rgba(120,150,185,0.85)"
  ctx.lineWidth = 6
  for (let i = 0; i <= 4; i++) {
    ctx.beginPath()
    ctx.moveTo(i * cell, 0)
    ctx.lineTo(i * cell, size)
    ctx.moveTo(0, i * cell)
    ctx.lineTo(size, i * cell)
    ctx.stroke()
  }
  ctx.fillStyle = "rgba(90,115,150,0.2)"
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      ctx.fillRect(c * cell + 6, r * cell + 6, cell - 12, cell - 12)
    }
  }
  return toTexture(ctx.canvas, 2, 2)
}

function carpetTexture() {
  const size = 512
  const { ctx } = makeCanvas(size)
  ctx.fillStyle = "#0f2a4a"
  ctx.fillRect(0, 0, size, size)

  for (let i = 0; i < 2600; i++) {
    const t = rand(60, 130)
    ctx.fillStyle = `rgba(${t * 0.42}, ${t * 0.58}, ${t * 0.95}, ${rand(0.3, 0.7)})`
    ctx.fillRect(rand(0, size), rand(0, size), rand(1, 3), rand(1, 3))
  }

  ctx.strokeStyle = "#38bdf8"
  ctx.lineWidth = 12
  ctx.strokeRect(8, 8, size - 16, size - 16)
  ctx.strokeStyle = "#7dd3fc"
  ctx.lineWidth = 3
  ctx.strokeRect(22, 22, size - 44, size - 44)

  ctx.fillStyle = "#38bdf8"
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 4; c++) {
      ctx.fillRect(28 + (c * (size - 56)) / 3, 40 + r * (size - 80), 10, 10)
    }
  }
  return toTexture(ctx.canvas, 1, 1)
}

function steelTexture() {
  const size = 128
  const { ctx } = makeCanvas(size)
  const grad = ctx.createLinearGradient(0, 0, size, size)
  grad.addColorStop(0, "#a9c0d9")
  grad.addColorStop(0.5, "#6f87a6")
  grad.addColorStop(1, "#3d4f68")
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = "rgba(15,28,50,0.25)"
  for (let i = 0; i < 40; i++) {
    ctx.fillRect(rand(0, size), rand(0, size), size, rand(1, 2))
  }
  return toTexture(ctx.canvas, 1, 1)
}

function radialTexture(w, h, stops) {
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")
  const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, h / 2)
  for (const [pos, color] of stops) grad.addColorStop(pos, color)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

function hallGradientTexture() {
  return radialTexture(512, 1024, [
    [0, "rgba(10,16,32,0)"],
    [0.5, "rgba(10,16,32,0.08)"],
    [0.85, "rgba(9,15,31,0.28)"],
    [1, "rgba(8,13,27,0.5)"],
  ])
}

function steelFrameTexture() {
  const size = 64
  const { ctx } = makeCanvas(size)
  const grad = ctx.createLinearGradient(0, 0, size, size)
  grad.addColorStop(0, "#c6d6e8")
  grad.addColorStop(0.5, "#7f97b5")
  grad.addColorStop(1, "#45597a")
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  return toTexture(ctx.canvas, 1, 1)
}

export const textures = {
  woodFloor: woodFloorTexture,
  marbleFloor: marbleFloorTexture,
  wallPlaster: wallPlasterTexture,
  ceiling: ceilingTexture,
  carpet: carpetTexture,
  steel: steelTexture,
  steelFrame: steelFrameTexture,
  hallGradient: hallGradientTexture,
}
