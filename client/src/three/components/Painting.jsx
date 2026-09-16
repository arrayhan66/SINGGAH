import { Component, Suspense, useMemo } from "react"
import { Text } from "@react-three/drei"
import * as THREE from "three"
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js"
import { textures } from "../utils/textures"
import { getAnisotropy, useLiteMode } from "../hooks/useQuality"
import { useDownscaledTexture } from "../utils/useDownscaledTexture"
import { PAINTING_SIZE } from "../rooms/museumLayout"
import { CATEGORY_COLORS } from "../../utils/hallHelpers"

const W = PAINTING_SIZE.w
const H = PAINTING_SIZE.h

const FRAME_W = W + 0.34
const FRAME_H = H + 0.34
const BAR_T = 0.1

const GEO_CANVAS = new THREE.PlaneGeometry(W - 0.18, H - 0.18)
const GEO_FRAME = new THREE.PlaneGeometry(FRAME_W, FRAME_H)
const GEO_BAR_H = new THREE.BoxGeometry(FRAME_W, BAR_T, 0.08)
const GEO_BAR_V = new THREE.BoxGeometry(BAR_T, FRAME_H, 0.08)
const GEO_BEVEL = new THREE.PlaneGeometry(W + 0.16, H + 0.16)
const GEO_GOLD_LIST = new THREE.PlaneGeometry(W + 0.2, H + 0.2)
const GEO_MAT = new THREE.PlaneGeometry(W - 0.02, H - 0.02)
const GEO_GLOW = new THREE.PlaneGeometry(W + 0.56, H + 0.56)
const GEO_LIGHT_BOX = new THREE.BoxGeometry(FRAME_W + 0.06, 0.08, 0.22)
const GEO_LIGHT_PLANE = new THREE.PlaneGeometry(W + 0.2, 0.55)
const GEO_PLAQUE = new THREE.PlaneGeometry(FRAME_W - 0.04, 0.72)
// Thin steel rim behind the plaque (regular works only): understated elegance,
// clearly less ornate than the featured work's navy-gold plaque.
const GEO_PLAQUE_RIM = new THREE.PlaneGeometry(FRAME_W - 0.01, 0.76)
const GEO_WIRE = new THREE.CylinderGeometry(0.008, 0.008, 1, 6)

const BAR_Y = FRAME_H / 2 - BAR_T / 2
const BAR_X = FRAME_W / 2 - BAR_T / 2

// The four gold frame bars are identical across every painting, so they merge
// into a single mesh (positions baked in) -> 1 draw call instead of 4.
const GEO_GOLD_BARS = (() => {
  const at = (geo, x, y) => {
    const c = geo.clone()
    c.translate(x, y, 0)
    return c
  }
  return mergeGeometries(
    [at(GEO_BAR_H, 0, BAR_Y), at(GEO_BAR_H, 0, -BAR_Y), at(GEO_BAR_V, BAR_X, 0), at(GEO_BAR_V, -BAR_X, 0)],
    false,
  )
})()

// Hanging wires (both same length) merge into one unit-height geometry that is
// scaled per painting by the wire length.
const GEO_WIRE_PAIR = (() => {
  const w1 = GEO_WIRE.clone()
  w1.translate(-FRAME_W * 0.28, 0.5, 0)
  const w2 = GEO_WIRE.clone()
  w2.translate(FRAME_W * 0.28, 0.5, 0)
  return mergeGeometries([w1, w2], false)
})()

const GOLD_MAT = new THREE.MeshStandardMaterial({
  map: textures.goldFrame(),
  metalness: 0.85,
  roughness: 0.28,
})
const PLAQUE_RIM_MAT = new THREE.MeshStandardMaterial({
  color: "#9fb0c8",
  metalness: 0.85,
  roughness: 0.25,
})
const BEVEL_MAT = new THREE.MeshStandardMaterial({
  color: "#232e3c",
  metalness: 0.3,
  roughness: 0.5,
})
const MAT_MAT = new THREE.MeshStandardMaterial({
  color: "#e9eff8",
  roughness: 0.85,
})
// Featured-work info plaque: navy-gold surface (same board size/position as
// the old gold plaque, re-styled to match the booth's navy-gold palette).
const PLAQUE_GOLD_MAT = new THREE.MeshStandardMaterial({
  map: textures.featuredInfoPlaque(),
  roughness: 0.55,
  metalness: 0.2,
})
const PLAQUE_DARK_MAT = new THREE.MeshStandardMaterial({
  color: "#1a2a3c",
  roughness: 0.4,
  metalness: 0.3,
})
const WIRE_MAT = new THREE.MeshStandardMaterial({
  color: "#2a3d5f",
  roughness: 0.4,
  metalness: 0.6,
})

function isPlaceholderUrl(url) {
  return /placehold\.co/i.test(url || "")
}

function coverParams(tex) {
  const img = tex.image
  const iw = img.width || img.naturalWidth || 1
  const ih = img.height || img.naturalHeight || 1
  const ta = W / H
  const ia = iw / ih
  const repeat = { x: 1, y: 1 }
  const offset = { x: 0, y: 0 }
  if (ia > ta) {
    repeat.x = ta / ia
    offset.x = (1 - repeat.x) / 2
  } else {
    repeat.y = ia / ta
    offset.y = (1 - repeat.y) / 2
  }
  return { repeat, offset }
}

function PaintingImage({ url }) {
  // Downscale ke 1024px saat decode: tetap tajam untuk close-up (HD)
  // tapi VRAM jauh lebih kecil daripada foto asli yang bisa 3000-4000px.
  // Tanpa ini, puluhan lukisan memakan ratusan MB VRAM di HP -> lag.
  const tex = useDownscaledTexture(url, 1024)
  const img = useMemo(() => {
    const t = tex.clone()
    const p = coverParams(tex)
    t.repeat.set(p.repeat.x, p.repeat.y)
    t.offset.set(p.offset.x, p.offset.y)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = getAnisotropy()
    return t
  }, [tex])
  return (
    <mesh geometry={GEO_CANVAS} position={[0, 0, 0.11]}>
      <meshStandardMaterial map={img} color="#eaf3fc" roughness={0.85} />
    </mesh>
  )
}

const PALETTES = [
  ["#0ea5e9", "#1d4ed8", "#7dd3fc", "#0f172a"],
  ["#22d3ee", "#0891b2", "#a5f3fc", "#083344"],
  ["#6366f1", "#4338ca", "#a5b4fc", "#1e1b4b"],
  ["#3b82f6", "#2563eb", "#93c5fd", "#1e3a8a"],
  ["#38bdf8", "#0284c7", "#bae6fd", "#0c4a6e"],
  ["#818cf8", "#4f46e5", "#c7d2fe", "#312e81"],
]

function hashString(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

function drawArtwork(ctx, w, h, palette, style) {
  const [c1, c2, c3, c4] = palette
  const cx = w / 2
  const cy = h / 2

  if (style === 0) {
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, c1)
    grad.addColorStop(0.6, c2)
    grad.addColorStop(1, c3)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
    const sunY = h * 0.62
    const rg = ctx.createRadialGradient(cx, sunY, 4, cx, sunY, w * 0.22)
    rg.addColorStop(0, "rgba(214,240,255,0.95)")
    rg.addColorStop(1, "rgba(200,230,255,0)")
    ctx.fillStyle = rg
    ctx.beginPath()
    ctx.arc(cx, sunY, w * 0.22, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = c4
    ctx.fillRect(0, h * 0.78, w, h * 0.22)
    ctx.fillStyle = "rgba(10,25,50,0.5)"
    ctx.fillRect(0, h * 0.78, w, 3)
  } else if (style === 1) {
    ctx.fillStyle = c4
    ctx.fillRect(0, 0, w, h)
    const layers = [
      { base: h * 0.8, color: c1 },
      { base: h * 0.55, color: c2 },
      { base: h * 0.35, color: c3 },
    ]
    for (const layer of layers) {
      ctx.fillStyle = layer.color
      ctx.beginPath()
      ctx.moveTo(0, layer.base)
      for (let i = 0; i <= 5; i++) {
        const px = (i / 5) * w
        const py = layer.base - (Math.sin(i * 1.7 + style) * 0.3 + 0.35) * h * 0.2
        ctx.lineTo(px, py)
      }
      ctx.lineTo(w, layer.base + 1)
      ctx.closePath()
      ctx.fill()
    }
    ctx.fillStyle = "rgba(210,235,255,0.85)"
    ctx.beginPath()
    ctx.arc(w * 0.74, h * 0.2, w * 0.06, 0, Math.PI * 2)
    ctx.fill()
  } else if (style === 2) {
    ctx.fillStyle = c4
    ctx.fillRect(0, 0, w, h)
    const colors = [c1, c2, c3, "rgba(190,225,255,0.7)"]
    for (let i = 0; i < 12; i++) {
      ctx.strokeStyle = colors[i % colors.length]
      ctx.lineWidth = w * 0.045
      const ang = Math.PI + (i / 11) * Math.PI
      ctx.beginPath()
      ctx.moveTo(cx, h * 0.9)
      ctx.lineTo(cx + Math.cos(ang) * w * 1.3, h * 0.9 + Math.sin(ang) * w * 1.3)
      ctx.stroke()
    }
    ctx.fillStyle = c2
    ctx.beginPath()
    ctx.arc(cx, h * 0.9, w * 0.08, 0, Math.PI * 2)
    ctx.fill()
  } else if (style === 3) {
    ctx.fillStyle = c4
    ctx.fillRect(0, 0, w, h)
    const blocks = [
      [0.08, 0.1, 0.55, 0.5, c1],
      [0.7, 0.06, 0.24, 0.34, c3],
      [0.12, 0.66, 0.36, 0.28, c2],
      [0.52, 0.64, 0.42, 0.3, c3],
      [0.05, 0.28, 0.1, 0.66, c2],
    ]
    for (const [fx, fy, fw, fh, col] of blocks) {
      ctx.fillStyle = col
      ctx.fillRect(fx * w, fy * h, fw * w, fh * h)
    }
    ctx.strokeStyle = "rgba(150,205,255,0.9)"
    ctx.lineWidth = 4
    ctx.strokeRect(0.05 * w, 0.05 * h, 0.9 * w, 0.9 * h)
  } else if (style === 4) {
    ctx.fillStyle = c1
    ctx.fillRect(0, 0, w, h)
    ;[0.14, 0.3, 0.46, 0.62].forEach((r, i) => {
      ctx.strokeStyle = i % 2 ? c3 : c4
      ctx.lineWidth = i % 2 ? 8 : 14
      ctx.beginPath()
      ctx.arc(cx, cy, r * w, 0, Math.PI * 2)
      ctx.stroke()
    })
    ctx.fillStyle = c3
    ctx.beginPath()
    ctx.arc(cx, cy, w * 0.08, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = c4
    ctx.beginPath()
    ctx.arc(cx + w * 0.18, cy - w * 0.14, w * 0.03, 0, Math.PI * 2)
    ctx.fill()
  } else {
    ctx.fillStyle = c4
    ctx.fillRect(0, 0, w, h)
    const bands = [c1, c2, c3, "rgba(190,220,255,0.8)"]
    for (let b = 0; b < bands.length; b++) {
      ctx.fillStyle = bands[b]
      ctx.beginPath()
      const y0 = (b / bands.length) * h
      ctx.moveTo(0, y0)
      for (let x = 0; x <= w; x += 8) {
        ctx.lineTo(x, y0 + Math.sin(x * 0.015 + b * 1.4) * h * 0.035 + h * 0.06)
      }
      ctx.lineTo(w, y0 + h / bands.length)
      ctx.lineTo(0, y0 + h / bands.length)
      ctx.closePath()
      ctx.fill()
    }
  }

  const vg = ctx.createRadialGradient(cx, cy, w * 0.3, cx, cy, w * 0.75)
  vg.addColorStop(0, "rgba(0,0,0,0)")
  vg.addColorStop(1, "rgba(5,15,35,0.45)")
  ctx.fillStyle = vg
  ctx.fillRect(0, 0, w, h)

  ctx.strokeStyle = "rgba(127,151,181,0.85)"
  ctx.lineWidth = Math.max(4, w * 0.012)
  ctx.strokeRect(w * 0.025, h * 0.025, w * 0.95, h * 0.95)
  ctx.strokeStyle = "rgba(198,214,232,0.55)"
  ctx.lineWidth = 2
  ctx.strokeRect(w * 0.045, h * 0.045, w * 0.91, w * 0.91)
}

const placeholderCache = new Map()

function getPlaceholderTexture(project) {
  const key = String(project.id) + "|" + (project.title || "")
  if (placeholderCache.has(key)) return placeholderCache.get(key)
  const seed = hashString(key)
  const palette = PALETTES[seed % PALETTES.length]
  const style = seed % 6
  const c = document.createElement("canvas")
  c.width = 512
  c.height = Math.round((512 * H) / W)
  const ctx = c.getContext("2d")
  drawArtwork(ctx, c.width, c.height, palette, style)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = getAnisotropy()
  placeholderCache.set(key, t)
  return t
}

function Placeholder({ project }) {
  const map = useMemo(() => getPlaceholderTexture(project), [project])

  return (
    <mesh geometry={GEO_CANVAS} position={[0, 0, 0.11]}>
      <meshStandardMaterial map={map} roughness={0.9} />
    </mesh>
  )
}

class ImageBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed) return <Placeholder project={this.props.project} />
    return this.props.children
  }
}

function getCategoryColor(project) {
  const slug = project.Category?.slug || project.category
  return CATEGORY_COLORS[slug] || "#60a5fa"
}

function Painting({
  project,
  position = [0, 0, 0],
  rotationY = 0,
  isDosen = false,
  railY = null,
  goldPlaque = false,
}) {
  const lite = useLiteMode()

  const accent = isDosen ? "#22d3ee" : getCategoryColor(project)
  const title = project.title || "Karya"
  const authorName = project.User?.name || project.author?.[0] || "Kreator"
  const thumbnail = project.thumbnail || project.image
  const hasImage = Boolean(thumbnail)

  const railLen =
    railY != null ? Math.max(0.05, railY - position[1] - FRAME_H / 2 - 0.03) : 0

  return (
    <group
      position={position}
      rotation={[0, rotationY, 0]}
      scale={1}
      userData={{ action: { type: "project", project } }}
    >
{/* Wires tetap menempel ke rel (tidak ikut terangkat saat hover) */}
      {!lite && railY != null && (
        <mesh
          geometry={GEO_WIRE_PAIR}
          material={WIRE_MAT}
          position={[0, FRAME_H / 2 + 0.03 + railLen / 2, 0.02]}
          scale={[1, railLen, 1]}
        />
      )}

      {/* Group dalam: identik dengan frame luar; event & aksi tetap di group luar
          supaya posisi klik stabil. */}
      <group raycast={() => null}>
        {/* Soft glow behind (category tinted) */}
      {!lite && (
        <mesh geometry={GEO_GLOW} position={[0, 0, -0.012]}>
          <meshBasicMaterial
            color={goldPlaque ? "#f3cf82" : accent}
            transparent
            opacity={goldPlaque ? 0.3 : 0.24}
          />
        </mesh>
      )}

      {/* Gold outer rim */}
      <mesh geometry={GEO_FRAME} material={GOLD_MAT} position={[0, 0, 0.07]} />

      {/* Gold dimensional bars (single merged mesh) */}
      <mesh geometry={GEO_GOLD_BARS} material={GOLD_MAT} position={[0, 0, 0.075]} />

      {/* Dark inner bevel */}
      <mesh geometry={GEO_BEVEL} material={BEVEL_MAT} position={[0, 0, 0.085]} />

      {/* Featured (goldPlaque) mode: thin bright gold gallery list riding just
          inside the gold rim, plus gilded rosettes at the four corners — so the
          frame reads as an art-gallery frame, not an office TV bezel. */}
      {goldPlaque && (
        <>
          <mesh geometry={GEO_GOLD_LIST} material={GOLD_MAT} position={[0, 0, 0.088]} />
          {[
            [-1, -1],
            [1, -1],
            [-1, 1],
            [1, 1],
          ].map(([sx, sy], i) => (
            <mesh
              key={i}
              position={[sx * (FRAME_W / 2 + 0.07), sy * (FRAME_H / 2 + 0.07), 0.09]}
              rotation={[0, 0, Math.PI / 4]}
            >
              <boxGeometry args={[0.14, 0.14, 0.02]} />
              <meshStandardMaterial
                map={textures.goldFrame()}
                metalness={0.85}
                roughness={0.28}
              />
            </mesh>
          ))}
        </>
      )}

      {/* Mat */}
      <mesh geometry={GEO_MAT} material={MAT_MAT} position={[0, 0, 0.095]} />

      {/* Canvas */}
      <Suspense fallback={<Placeholder project={project} />}>
        <ImageBoundary project={project}>
          {hasImage && !isPlaceholderUrl(thumbnail) ? (
            <PaintingImage url={thumbnail} />
          ) : (
            <Placeholder project={project} />
          )}
        </ImageBoundary>
      </Suspense>

      {/* Picture light */}
      {!lite && (
        <>
          <mesh geometry={GEO_LIGHT_BOX} position={[0, H / 2 + 0.24, 0.06]}>
            <meshStandardMaterial
              color="#94a3b8"
              emissive="#bfe3ff"
              emissiveIntensity={1.7}
              metalness={0.6}
              roughness={0.3}
            />
          </mesh>
          <mesh geometry={GEO_LIGHT_PLANE} position={[0, H / 2 - 0.14, 0.1]}>
            <meshBasicMaterial color="#cfe9ff" transparent opacity={0.26} />
          </mesh>
        </>
      )}

      {/* Plaque (info board). Karya unggulan: papan navy-gold ornamen. Karya biasa:
        papan gelap lebih kaya + rim baja tipis, tanpa garis di atas/bawah judul. */}
      {!goldPlaque && (
        <mesh geometry={GEO_PLAQUE_RIM} material={PLAQUE_RIM_MAT} position={[0, -H / 2 - 0.58, 0.04]} />
      )}
      <mesh
        geometry={GEO_PLAQUE}
        material={goldPlaque ? PLAQUE_GOLD_MAT : PLAQUE_DARK_MAT}
        position={[0, -H / 2 - 0.58, 0.045]}
      />

      <Text
        position={[0, -H / 2 - (goldPlaque ? 0.48 : 0.46), 0.08]}
        fontSize={0.115}
        color={goldPlaque ? "#f2d492" : "#f8fafc"}
        anchorX="center"
        anchorY="middle"
        maxWidth={FRAME_W - 0.12}
        lineHeight={1.15}
        letterSpacing={goldPlaque ? 0.02 : 0.012}
        raycast={() => null}
        font="/fonts/Poppins-SemiBold.ttf"
      >
        {title}
      </Text>
      <Text
        position={[0, -H / 2 - (goldPlaque ? 0.70 : 0.66), 0.08]}
        fontSize={0.09}
        color={goldPlaque ? "#cdb072" : accent}
        anchorX="center"
        anchorY="middle"
        maxWidth={FRAME_W - 0.12}
        letterSpacing={goldPlaque ? 0.015 : 0.008}
        raycast={() => null}
        font="/fonts/Poppins-Medium.ttf"
      >
        {authorName}
      </Text>

      </group>
    </group>
  )
}

export default Painting
