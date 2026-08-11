import * as THREE from "three"
import { getAnisotropy } from "../hooks/useQuality"

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
  texture.anisotropy = getAnisotropy()
  return texture
}

const rand = (min, max) => min + Math.random() * (max - min)

function woodFloorTexture() {
  const size = 512
  const { ctx } = makeCanvas(size)
  const rows = 8
  const rowH = size / rows

  for (let row = 0; row < rows; row++) {
    const y = row * rowH
    const plankW = size / 3
    const offset = (row % 2) * (plankW / 2)

    for (let col = -1; col < 4; col++) {
      const x = col * plankW + offset
      
      const baseTone = rand(150, 195)
      const grad = ctx.createLinearGradient(x, y, x + plankW, y + rowH)
      grad.addColorStop(0, `rgb(${baseTone * 0.88}, ${baseTone * 0.70}, ${baseTone * 0.50})`)
      grad.addColorStop(1, `rgb(${baseTone * 0.78}, ${baseTone * 0.60}, ${baseTone * 0.40})`)
      ctx.fillStyle = grad
      ctx.fillRect(x, y, plankW, rowH)

      ctx.strokeStyle = `rgba(60, 35, 15, 0.25)`
      ctx.lineWidth = 1.5
      for (let g = 0; g < 4; g++) {
        const gx = x + rand(6, plankW - 6)
        ctx.beginPath()
        ctx.moveTo(gx, y)
        ctx.lineTo(gx + rand(-8, 8), y + rowH)
        ctx.stroke()
      }

      ctx.strokeStyle = `rgba(35, 20, 8, 0.8)`
      ctx.lineWidth = 2
      ctx.strokeRect(x, y, plankW, rowH)
    }
  }

  return toTexture(ctx.canvas, 4, 4)
}

function marbleFloorTexture() {
  const size = 512
  const { ctx } = makeCanvas(size)
  
  ctx.fillStyle = "#f2f5fb"
  ctx.fillRect(0, 0, size, size)

  const tileSize = size / 2
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 2; c++) {
      const x = c * tileSize
      const y = r * tileSize

      ctx.fillStyle = (r + c) % 2 === 0 ? "rgba(255,255,255,0.5)" : "rgba(225,235,248,0.4)"
      ctx.fillRect(x, y, tileSize, tileSize)

      ctx.save()
      ctx.beginPath()
      ctx.rect(x, y, tileSize, tileSize)
      ctx.clip()

      ctx.strokeStyle = "rgba(120, 145, 175, 0.3)"
      ctx.lineWidth = 3.5
      for (let i = 0; i < 3; i++) {
        const vx = x + rand(20, tileSize - 20)
        const vy = y + rand(20, tileSize - 20)
        ctx.beginPath()
        ctx.moveTo(vx, vy)
        ctx.bezierCurveTo(
          vx + rand(-90, 90), vy + rand(-90, 90),
          vx + rand(-130, 130), vy + rand(-130, 130),
          vx + rand(-180, 180), vy + rand(-180, 180)
        )
        ctx.stroke()
      }
      ctx.restore()
    }
  }

  ctx.strokeStyle = "rgba(35, 55, 85, 0.7)"
  ctx.lineWidth = 4
  ctx.strokeRect(2, 2, size - 4, size - 4)

  ctx.strokeStyle = "rgba(35, 55, 85, 0.55)"
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(size / 2, 0)
  ctx.lineTo(size / 2, size)
  ctx.moveTo(0, size / 2)
  ctx.lineTo(size, size / 2)
  ctx.stroke()

  return toTexture(ctx.canvas, 3, 3)
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
  texture.anisotropy = getAnisotropy()
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

function roundRugTexture() {
  const size = 512
  const { ctx } = makeCanvas(size)
  const c = size / 2
  const r = size / 2 - 8

  const grad = ctx.createRadialGradient(c, c, 0, c, c, r)
  grad.addColorStop(0, "#b8926a")
  grad.addColorStop(0.5, "#9a784f")
  grad.addColorStop(0.82, "#84653f")
  grad.addColorStop(1, "#775a38")
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(c, c, r, 0, Math.PI * 2)
  ctx.fill()

  for (let i = 0; i < 4200; i++) {
    const a = Math.random() * Math.PI * 2
    const rad = Math.sqrt(Math.random()) * (r - 8)
    const t = 30 + Math.random() * 35
    ctx.fillStyle = `rgba(${t}, ${t * 0.68}, ${t * 0.42}, ${Math.random() * 0.3})`
    ctx.beginPath()
    ctx.arc(c + Math.cos(a) * rad, c + Math.sin(a) * rad, 1 + Math.random() * 2.4, 0, Math.PI * 2)
    ctx.fill()
  }

  // Outer rope border
  ctx.strokeStyle = "rgba(46,30,16,0.6)"
  ctx.lineWidth = 10
  ctx.beginPath()
  ctx.arc(c, c, r - 12, 0, Math.PI * 2)
  ctx.stroke()

  // Gold band pair with dotted ring between
  ctx.strokeStyle = "rgba(230,196,130,0.85)"
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(c, c, r - 20, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(c, c, r - 34, 0, Math.PI * 2)
  ctx.stroke()

  ctx.fillStyle = "rgba(235,205,150,0.8)"
  const dotR = r - 27
  const dots = 36
  for (let i = 0; i < dots; i++) {
    const a = (i / dots) * Math.PI * 2
    ctx.beginPath()
    ctx.arc(c + Math.cos(a) * dotR, c + Math.sin(a) * dotR, 2.6, 0, Math.PI * 2)
    ctx.fill()
  }

  // Inner medallion
  ctx.strokeStyle = "rgba(46,30,16,0.5)"
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.arc(c, c, r * 0.46, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = "rgba(235,205,150,0.6)"
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.arc(c, c, r * 0.4, 0, Math.PI * 2)
  ctx.stroke()

  // Center floral medallion (petal ring + core)
  ctx.strokeStyle = "rgba(230,196,130,0.5)"
  ctx.lineWidth = 2.5
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2
    ctx.beginPath()
    ctx.arc(c + Math.cos(a) * r * 0.32, c + Math.sin(a) * r * 0.32, 5, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.arc(c, c, r * 0.32, 0, Math.PI * 2)
  ctx.stroke()

  // Radial accents between medallion bands
  ctx.strokeStyle = "rgba(60,40,20,0.35)"
  ctx.lineWidth = 3
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(c + Math.cos(a) * (r * 0.32), c + Math.sin(a) * (r * 0.32))
    ctx.lineTo(c + Math.cos(a) * (r * 0.44), c + Math.sin(a) * (r * 0.44))
    ctx.stroke()
  }

  const texture = new THREE.CanvasTexture(ctx.canvas)
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = getAnisotropy()
  return texture
}

function rugRectTexture() {
  const w = 512
  const h = 1024
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")

  // Base navy field
  ctx.fillStyle = "#12263f"
  ctx.fillRect(0, 0, w, h)

  // Border bands (warm brass + light blue)
  ctx.strokeStyle = "rgba(201,163,94,0.85)"
  ctx.lineWidth = 14
  ctx.strokeRect(18, 18, w - 36, h - 36)
  ctx.strokeStyle = "rgba(125,211,252,0.55)"
  ctx.lineWidth = 4
  ctx.strokeRect(36, 36, w - 72, h - 72)

  // Inner field slightly lighter
  ctx.fillStyle = "rgba(40,72,112,0.55)"
  ctx.fillRect(48, 48, w - 96, h - 96)

  // Hand-drawn wavy vines (imperfect, not AI-straight)
  ctx.strokeStyle = "rgba(186,200,224,0.5)"
  ctx.lineWidth = 5
  for (let row = 0; row < 4; row++) {
    ctx.beginPath()
    const base = 90 + row * (h - 180) / 3
    ctx.moveTo(70, base)
    for (let x = 70; x < w - 70; x += 24) {
      ctx.lineTo(x, base + Math.sin(row * 1.7 + x * 0.05) * 14)
    }
    ctx.stroke()
  }

  // Small scattered motif dots (drawn with slight hand jitter)
  ctx.fillStyle = "rgba(125,211,252,0.5)"
  const rows = [0.18, 0.32, 0.5, 0.68, 0.82]
  for (const r of rows) {
    for (let i = 0; i < 6; i++) {
      const x = 90 + i * ((w - 180) / 5) + Math.sin(i * 5) * 7
      const y = h * r + Math.cos(i * 3) * 8
      ctx.beginPath()
      ctx.arc(x, y, 5 + (i % 3), 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Frayed edge speckle
  for (let i = 0; i < 900; i++) {
    const t = Math.random()
    ctx.fillStyle = `rgba(${30 + t * 40}, ${52 + t * 30}, ${86 + t * 30}, 0.25)`
    ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = getAnisotropy()
  return texture
}

function frameArtTexture(index = 0) {
  const size = 256
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")

  const palettes = [
    ["#1e3a5f", "#7dd3fc", "#f8fafc", "#c9a35e"],
    ["#0f2a4a", "#93c5fd", "#e0f2fe", "#3f5a7f"],
    ["#16283f", "#38bdf8", "#f1f5f9", "#64748b"],
  ]
  const cols = palettes[index % palettes.length]

  ctx.fillStyle = cols[0]
  ctx.fillRect(0, 0, size, size)

  // Broad imperfect brush strokes
  for (let i = 0; i < 7; i++) {
    ctx.strokeStyle = cols[1 + (i % 3)]
    ctx.globalAlpha = 0.5 + Math.random() * 0.4
    ctx.lineWidth = 8 + Math.random() * 18
    ctx.beginPath()
    ctx.moveTo(Math.random() * size, Math.random() * size)
    const ex = Math.random() * size
    const ey = Math.random() * size
    ctx.bezierCurveTo(
      Math.random() * size,
      Math.random() * size,
      Math.random() * size,
      Math.random() * size,
      ex,
      ey,
    )
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  // Denser accent blob
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(248,250,252,${0.05 + Math.random() * 0.12})`
    ctx.beginPath()
    ctx.arc(Math.random() * size, Math.random() * size, 2 + Math.random() * 6, 0, Math.PI * 2)
    ctx.fill()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = getAnisotropy()
  return texture
}

let _steelFrame = null

function steelFrameTexture() {
  if (_steelFrame) return _steelFrame
  const size = 64
  const { ctx } = makeCanvas(size)
  const grad = ctx.createLinearGradient(0, 0, size, size)
  grad.addColorStop(0, "#c6d6e8")
  grad.addColorStop(0.5, "#7f97b5")
  grad.addColorStop(1, "#45597a")
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  _steelFrame = toTexture(ctx.canvas, 1, 1)
  return _steelFrame
}

let _goldFrame = null

function goldFrameTexture() {
  if (_goldFrame) return _goldFrame
  const size = 128
  const { ctx } = makeCanvas(size)
  const grad = ctx.createLinearGradient(0, 0, size, size)
  grad.addColorStop(0, "#f6e6b4")
  grad.addColorStop(0.35, "#d4ab62")
  grad.addColorStop(0.65, "#9c7433")
  grad.addColorStop(1, "#5f4718")
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = "rgba(255,250,220,0.09)"
  for (let i = 0; i < 36; i++) {
    ctx.fillRect(rand(0, size), rand(0, size), size, rand(1, 2))
  }
  _goldFrame = toTexture(ctx.canvas, 1, 1)
  return _goldFrame
}

let _bookSpines = null

function bookSpineSet() {
  if (_bookSpines) return _bookSpines
  const w = 64
  const h = 160

  const styles = [
    { cloth: "#1e3a5f", text: "#e9d8a6", title: "Jejak Karya", serif: true, classic: true },
    { cloth: "#274b63", text: "#f1f5f9", title: "Arsip Nusantara", serif: true, classic: false },
    { cloth: "#dbe7f5", text: "#274b63", title: "Long Voyage", serif: false, classic: false },
    { cloth: "#2f4a6b", text: "#e9d8a6", title: "Sejarah Rakyat", serif: true, classic: true },
    { cloth: "#eef3f9", text: "#1e3a5f", title: "Malam Museum", serif: false, classic: false },
    { cloth: "#35506f", text: "#f3ecd9", title: "Catatan Timur", serif: true, classic: true },
    { cloth: "#5a7f9e", text: "#f8fafc", title: "Rumah Hati", serif: false, classic: false },
    { cloth: "#93b4d4", text: "#1e3a5f", title: "Kumpulan Sajak", serif: true, classic: false },
    { cloth: "#c9a35e", text: "#1e3a5f", title: "Atlas Dunia", serif: true, classic: true },
    { cloth: "#274b63", text: "#7dd3fc", title: "Peta Jejak", serif: false, classic: false },
    { cloth: "#3f5a7f", text: "#f3ecd9", title: "Warisan Leluhur", serif: true, classic: true },
    { cloth: "#6f87a6", text: "#f8fafc", title: "Jalan Terang", serif: false, classic: true },
  ]

  const gold = "#e9d8a6"
  _bookSpines = styles.map((s) => {
    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")

    ctx.fillStyle = s.cloth
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 700; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255 | 0}, ${Math.random() * 255 | 0}, ${Math.random() * 255 | 0}, ${Math.random() * 0.06})`
      ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1)
    }

    const lg = ctx.createLinearGradient(0, 0, w, 0)
    lg.addColorStop(0, "rgba(0,0,0,0.35)")
    lg.addColorStop(0.15, "rgba(255,255,255,0.06)")
    lg.addColorStop(0.85, "rgba(255,255,255,0.12)")
    lg.addColorStop(1, "rgba(0,0,0,0.4)")
    ctx.fillStyle = lg
    ctx.fillRect(0, 0, w, h)

    if (s.classic) {
      ctx.strokeStyle = gold
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(w / 2 - 13, 10)
      ctx.lineTo(w / 2 + 13, 10)
      ctx.stroke()
    }

    ctx.save()
    ctx.translate(w / 2, h / 2)
    ctx.rotate(Math.PI / 2)
    const face = s.serif
      ? "Georgia, 'Times New Roman', serif"
      : "'Arial Black', Arial, sans-serif"
    let titleSize = s.serif ? 12 : 11
    ctx.font = `bold ${titleSize}px ${face}`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    while (ctx.measureText(s.title).width > 84 && titleSize > 6) {
      titleSize -= 0.5
      ctx.font = `bold ${titleSize}px ${face}`
    }
    ctx.fillStyle = s.text
    ctx.fillText(s.title, 0, 0)
    ctx.restore()

    if (s.classic) {
      ctx.strokeStyle = gold
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(w / 2, 24, 4, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fillStyle = gold
      ctx.beginPath()
      ctx.arc(w / 2, 24, 1.2, 0, Math.PI * 2)
      ctx.fill()
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.ClampToEdgeWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 4
    return { tex: texture, cloth: s.cloth }
  })
  return _bookSpines
}

let _bookPages = null

function bookPagesTexture() {
  if (_bookPages) return _bookPages
  const w = 128
  const h = 128
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")
  ctx.fillStyle = "#ece4cf"
  ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = "rgba(180,168,138,0.6)"
  ctx.lineWidth = 1
  for (let y = 0; y < h; y += 7) {
    ctx.beginPath()
    ctx.moveTo(0, y + 3)
    ctx.lineTo(w, y + 3)
    ctx.stroke()
  }
  for (let i = 0; i < 500; i++) {
    ctx.fillStyle = `rgba(${130 + (Math.random() * 60) | 0}, ${120 + (Math.random() * 50) | 0}, ${95 + (Math.random() * 40) | 0}, ${Math.random() * 0.12})`
    ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  _bookPages = texture
  return texture
}

const _bookCovers = {}

function drawAtomicHabitsCover(ctx, w, h) {
  // Real Atomic Habits cover look: white base, red accents, huge outlined "habits"
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, w, h)

  // left spine accent
  ctx.fillStyle = "#d92b2b"
  ctx.fillRect(0, 0, w * 0.1, h)

  // subtle paper grain
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = `rgba(${(Math.random() * 40) | 0}, ${(Math.random() * 30) | 0}, ${(Math.random() * 30) | 0}, ${Math.random() * 0.05})`
    ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1)
  }

  ctx.textAlign = "left"
  ctx.fillStyle = "#111111"
  ctx.font = `bold ${h * 0.06}px Georgia, serif`
  ctx.fillText("JAMES CLEAR", w * 0.12, h * 0.1)

  ctx.fillStyle = "#d92b2b"
  ctx.font = `italic bold ${h * 0.04}px Georgia, serif`
  ctx.fillText("TINY CHANGES. REMARKABLE RESULTS.", w * 0.12, h * 0.17)

  ctx.fillStyle = "#111111"
  ctx.font = `bold ${h * 0.13}px Arial, sans-serif`
  ctx.fillText("atomic", w * 0.12, h * 0.47)

  ctx.save()
  ctx.fillStyle = "#ffffff"
  ctx.strokeStyle = "#d92b2b"
  ctx.lineWidth = h * 0.028
  ctx.font = `900 ${h * 0.3}px Arial, sans-serif`
  ctx.lineJoin = "round"
  ctx.strokeText("habits", w * 0.12, h * 0.78)
  ctx.fillText("habits", w * 0.12, h * 0.78)
  ctx.restore()

  ctx.fillStyle = "#666666"
  ctx.font = `italic ${h * 0.037}px Georgia, serif`
  ctx.fillText("An Easy & Proven Way to Build Good", w * 0.12, h * 0.91)
  ctx.fillText("Habits & Break Bad Ones", w * 0.12, h * 0.96)
}

function drawFilosofiTerasCover(ctx, w, h) {
  // Filosofi Teras look: soft teal background, terracotta bust, white serif title
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, "#6fb0b3")
  grad.addColorStop(1, "#4f8f94")
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // light circular halo behind the bust
  ctx.fillStyle = "rgba(255,255,255,0.12)"
  ctx.beginPath()
  ctx.arc(w * 0.5, h * 0.34, h * 0.28, 0, Math.PI * 2)
  ctx.fill()

  // terracotta stoic bust
  const bx = w * 0.5
  const by = h * 0.36
  ctx.fillStyle = "#d68a5c"
  ctx.beginPath()
  ctx.arc(bx, by - h * 0.17, h * 0.105, 0, Math.PI * 2) // head
  ctx.fill()
  ctx.beginPath() // neck
  ctx.moveTo(bx - h * 0.03, by - h * 0.08)
  ctx.lineTo(bx + h * 0.03, by - h * 0.08)
  ctx.lineTo(bx + h * 0.05, by + h * 0.01)
  ctx.lineTo(bx - h * 0.05, by + h * 0.01)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath() // shoulders
  ctx.moveTo(bx - h * 0.19, by + h * 0.02)
  ctx.lineTo(bx - h * 0.08, by - h * 0.02)
  ctx.lineTo(bx + h * 0.08, by - h * 0.02)
  ctx.lineTo(bx + h * 0.19, by + h * 0.02)
  ctx.lineTo(bx + h * 0.17, by + h * 0.09)
  ctx.lineTo(bx - h * 0.17, by + h * 0.09)
  ctx.closePath()
  ctx.fill()
  // pedestal
  ctx.fillStyle = "#3f6f74"
  ctx.fillRect(bx - h * 0.2, by + h * 0.09, h * 0.4, h * 0.02)

  ctx.textAlign = "center"
  ctx.fillStyle = "#f7f2ea"
  ctx.font = `bold ${h * 0.13}px Georgia, serif`
  ctx.fillText("FILOSOFI", w * 0.5, h * 0.6)
  ctx.fillText("TERAS", w * 0.5, h * 0.74)

  ctx.fillStyle = "#2f4f52"
  ctx.font = `bold ${h * 0.042}px Georgia, serif`
  ctx.fillText("HENRY MANAMPIRING", w * 0.5, h * 0.84)

  ctx.fillStyle = "#eef6f6"
  ctx.font = `italic ${h * 0.034}px Georgia, serif`
  ctx.fillText("Filsafat Yunani-Romawi Kuno untuk", w * 0.5, h * 0.91)
  ctx.fillText("Mental Tangguh Masa Kini", w * 0.5, h * 0.96)
}

function drawGolangCover(ctx, w, h) {
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, "#007d9c")
  grad.addColorStop(1, "#00acd7")
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  ctx.fillStyle = "rgba(255,255,255,0.15)"
  ctx.beginPath()
  ctx.arc(w * 0.75, h * 0.35, h * 0.22, 0, Math.PI * 2)
  ctx.fill()

  ctx.textAlign = "left"
  ctx.fillStyle = "#ffffff"
  ctx.font = `bold ${h * 0.08}px Arial, sans-serif`
  ctx.fillText("PEMROGRAMAN", w * 0.1, h * 0.22)

  ctx.fillStyle = "#fce94f"
  ctx.font = `900 ${h * 0.22}px Arial, sans-serif`
  ctx.fillText("Golang", w * 0.1, h * 0.48)

  ctx.fillStyle = "#ffffff"
  ctx.font = `bold ${h * 0.09}px Arial, sans-serif`
  ctx.fillText("DASAR", w * 0.1, h * 0.65)

  ctx.fillStyle = "rgba(255,255,255,0.85)"
  ctx.font = `italic ${h * 0.045}px Georgia, serif`
  ctx.fillText("Panduan Praktis Menguasai Bahasa Go", w * 0.1, h * 0.82)

  ctx.fillStyle = "#fce94f"
  ctx.font = `bold ${h * 0.045}px Arial, sans-serif`
  ctx.fillText("Rian Hidayat", w * 0.1, h * 0.93)
}

function drawFullstackCover(ctx, w, h) {
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, "#1e293b")
  grad.addColorStop(1, "#0f172a")
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  ctx.fillStyle = "#f7df1e"
  ctx.fillRect(w * 0.1, h * 0.12, w * 0.28, h * 0.14)
  ctx.fillStyle = "#000000"
  ctx.font = `bold ${h * 0.08}px Arial, sans-serif`
  ctx.fillText("JS", w * 0.16, h * 0.22)

  ctx.textAlign = "left"
  ctx.fillStyle = "#38bdf8"
  ctx.font = `bold ${h * 0.065}px Arial, sans-serif`
  ctx.fillText("FULL STACK", w * 0.1, h * 0.42)

  ctx.fillStyle = "#f8fafc"
  ctx.font = `900 ${h * 0.12}px Arial, sans-serif`
  ctx.fillText("JavaScript", w * 0.1, h * 0.6)

  ctx.fillStyle = "#94a3b8"
  ctx.font = `italic ${h * 0.042}px Georgia, serif`
  ctx.fillText("React, Node.js, Express & Database", w * 0.1, h * 0.77)

  ctx.fillStyle = "#38bdf8"
  ctx.font = `bold ${h * 0.045}px Arial, sans-serif`
  ctx.fillText("Web Development", w * 0.1, h * 0.91)
}

function bookCoverTexture(key) {
  if (_bookCovers[key]) return _bookCovers[key]
  const w = 512
  const h = 384
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")
  if (key === "atomic") drawAtomicHabitsCover(ctx, w, h)
  else if (key === "teras") drawFilosofiTerasCover(ctx, w, h)
  else if (key === "golang") drawGolangCover(ctx, w, h)
  else if (key === "fullstack") drawFullstackCover(ctx, w, h)
  else {
    ctx.fillStyle = "#3f6a9e"
    ctx.fillRect(0, 0, w, h)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = getAnisotropy()
  _bookCovers[key] = texture
  return texture
}

let _globeMap = null

function globeTexture() {
  if (_globeMap) return _globeMap
  const w = 512
  const h = 256
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")

  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, "#3d6ea5")
  grad.addColorStop(0.5, "#2b568b")
  grad.addColorStop(1, "#3d6ea5")
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  for (let i = 0; i < 1400; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`
    ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2)
    ctx.fillStyle = `rgba(6,18,40,${Math.random() * 0.07})`
    ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2)
  }

  ctx.strokeStyle = "rgba(255,255,255,0.18)"
  ctx.lineWidth = 1
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = ((90 - lat) / 180) * h
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }
  for (let lon = -150; lon <= 150; lon += 30) {
    const x = ((lon + 180) / 360) * w
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, h)
    ctx.stroke()
  }

  const blob = (cx, cy, rx, ry, tone) => {
    ctx.fillStyle = tone
    ctx.beginPath()
    const n = 22
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2
      const px = cx + Math.cos(a) * rx + (Math.random() - 0.5) * rx * 0.12
      const py = cy + Math.sin(a) * ry + (Math.random() - 0.5) * ry * 0.12
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.closePath()
    ctx.fill()
  }

  const LAND = "#7fae6a"
  const LAND2 = "#6d9a5c"
  const DESERT = "#c9b27a"
  const ICE = "#eef3f9"

  const land = [
    [85, 65, 78, 36, LAND],
    [55, 26, 20, 13, LAND],
    [155, 100, 30, 17, LAND2],
    [40, 60, 22, 14, LAND],
    [125, 95, 22, 14, LAND2],
    [140, 25, 16, 11, ICE],
    [152, 32, 14, 10, LAND2],
    [160, 128, 25, 22, LAND],
    [168, 152, 20, 28, LAND],
    [172, 186, 12, 20, LAND2],
    [215, 44, 30, 17, LAND],
    [236, 30, 16, 10, LAND],
    [226, 22, 11, 10, LAND],
    [246, 74, 36, 20, LAND],
    [240, 102, 30, 24, LAND],
    [242, 138, 22, 26, LAND],
    [222, 52, 12, 12, DESERT],
    [280, 34, 55, 16, LAND],
    [302, 54, 44, 20, LAND],
    [340, 60, 34, 18, LAND2],
    [282, 84, 30, 17, LAND],
    [296, 98, 19, 20, LAND],
    [305, 55, 26, 14, DESERT],
    [356, 102, 13, 8, LAND],
    [374, 106, 12, 8, LAND],
    [390, 100, 8, 6, LAND],
    [400, 112, 9, 7, LAND2],
    [392, 146, 40, 21, LAND2],
    [416, 134, 17, 12, DESERT],
    [432, 166, 8, 13, LAND],
    [398, 46, 6, 14, LAND],
  ]
  for (const l of land) blob(l[0], l[1], l[2], l[3], l[4])

  const deserts = [
    [250, 115, 18, 12],
    [350, 78, 18, 10],
    [398, 150, 16, 9],
    [300, 60, 12, 7],
  ]
  for (const d of deserts) blob(d[0], d[1], d[2], d[3], DESERT)

  ctx.strokeStyle = "rgba(30,52,90,0.55)"
  ctx.lineWidth = 2
  for (const l of land) {
    ctx.beginPath()
    const n = 22
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2
      const px = l[0] + Math.cos(a) * l[2]
      const py = l[1] + Math.sin(a) * l[3]
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.closePath()
    ctx.stroke()
  }

  ctx.fillStyle = "rgba(238,243,249,0.95)"
  ctx.fillRect(0, 0, w, 10)
  ctx.fillRect(0, h - 10, w, 10)
  for (let x = 0; x < w; x += 6) {
    ctx.fillStyle = `rgba(238,243,249,${0.4 + Math.random() * 0.3})`
    ctx.fillRect(x, 10, 4, 4)
    ctx.fillRect(x, h - 14, 4, 4)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = getAnisotropy()
  _globeMap = texture
  return texture
}

function tvScreenTexture() {
  const w = 640
  const h = 360
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")

  const sky = ctx.createLinearGradient(0, 0, 0, h)
  sky.addColorStop(0, "#08162e")
  sky.addColorStop(0.55, "#1d4a7c")
  sky.addColorStop(0.8, "#4f86b8")
  sky.addColorStop(1, "#a8cbe2")
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, h)

  const sun = ctx.createRadialGradient(w * 0.5, h * 0.6, 0, w * 0.5, h * 0.6, w * 0.24)
  sun.addColorStop(0, "rgba(255,244,200,1)")
  sun.addColorStop(0.3, "rgba(255,214,140,0.85)")
  sun.addColorStop(1, "rgba(255,214,140,0)")
  ctx.fillStyle = sun
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = "#fff3cf"
  ctx.beginPath()
  ctx.arc(w * 0.5, h * 0.6, h * 0.085, 0, Math.PI * 2)
  ctx.fill()

  const mountains = (color, base, amp1, amp2, phase) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(0, h)
    for (let x = 0; x <= w; x += 12) {
      const y =
        h * base -
        Math.sin(x * 0.02 + phase) * h * amp1 -
        Math.sin(x * 0.011 + phase * 2) * h * amp2
      ctx.lineTo(x, y)
    }
    ctx.lineTo(w, h)
    ctx.closePath()
    ctx.fill()
  }
  mountains("#16324f", 0.72, 0.16, 0.06, 0)
  mountains("#0d2036", 0.85, 0.1, 0.05, 1.2)

  const refl = ctx.createLinearGradient(0, 0, w, h)
  refl.addColorStop(0, "rgba(255,255,255,0)")
  refl.addColorStop(0.44, "rgba(255,255,255,0)")
  refl.addColorStop(0.5, "rgba(255,255,255,0.2)")
  refl.addColorStop(0.56, "rgba(255,255,255,0)")
  refl.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = refl
  ctx.fillRect(0, 0, w, h)

  const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.82)
  vig.addColorStop(0, "rgba(0,0,0,0)")
  vig.addColorStop(1, "rgba(0,0,0,0.45)")
  ctx.fillStyle = vig
  ctx.fillRect(0, 0, w, h)

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = getAnisotropy()
  return texture
}

export const textures = {
  woodFloor: woodFloorTexture,
  marbleFloor: marbleFloorTexture,
  wallPlaster: wallPlasterTexture,
  ceiling: ceilingTexture,
  carpet: carpetTexture,
  steel: steelTexture,
  steelFrame: steelFrameTexture,
  goldFrame: goldFrameTexture,
  hallGradient: hallGradientTexture,
  roundRug: roundRugTexture,
  rugRect: rugRectTexture,
  frameArt: frameArtTexture,
  globe: globeTexture,
  tvScreen: tvScreenTexture,
  bookSpines: bookSpineSet,
  bookPages: bookPagesTexture,
  bookCover: bookCoverTexture,
}
