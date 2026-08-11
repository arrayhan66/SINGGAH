import { Component, Suspense, useMemo, useState } from "react"
import { Text, useTexture } from "@react-three/drei"
import * as THREE from "three"
import { textures } from "../utils/textures"
import { getAnisotropy, useQualityStore } from "../hooks/useQuality"
import { PAINTING_SIZE } from "../rooms/museumLayout"
import { CATEGORY_COLORS } from "../../utils/hallHelpers"

const W = PAINTING_SIZE.w
const H = PAINTING_SIZE.h

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
  const tex = useTexture(url)
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
    <mesh position={[0, 0, 0.11]}>
      <planeGeometry args={[W - 0.18, H - 0.18]} />
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
    <mesh position={[0, 0, 0.11]}>
      <planeGeometry args={[W - 0.18, H - 0.18]} />
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
  const [hovered, setHovered] = useState(false)
  const steelMap = useMemo(() => textures.steelFrame(), [])
  const goldMap = useMemo(() => textures.goldFrame(), [])
  const low = useQualityStore((s) => s.tier) === "rendah"

  const accent = isDosen ? "#22d3ee" : getCategoryColor(project)
  const title = project.title || "Karya"
  const authorName = project.User?.name || project.author?.[0] || "Kreator"
  const thumbnail = project.thumbnail || project.image
  const hasImage = Boolean(thumbnail)

  const frameW = W + 0.34
  const frameH = H + 0.34
  const barT = 0.1
  const lipY = frameH / 2 - barT / 2
  const lipX = frameW / 2 - barT / 2

  return (
    <group
      position={position}
      rotation={[0, rotationY, 0]}
      scale={hovered ? 1.03 : 1}
      userData={{ action: { type: "project", project } }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Hanging wires to the picture rail (home gallery look) */}
      {!low && railY != null && (
        <>
          {[-frameW * 0.28, frameW * 0.28].map((wx, i) => {
            const topLocal = railY - position[1]
            const bottomLocal = frameH / 2 + 0.03
            const len = Math.max(0.05, topLocal - bottomLocal)
            return (
              <mesh key={i} position={[wx, bottomLocal + len / 2, 0.02]}>
                <cylinderGeometry args={[0.008, 0.008, len, 6]} />
                <meshStandardMaterial color="#2a3d5f" roughness={0.4} metalness={0.6} />
              </mesh>
            )
          })}
        </>
      )}

      {/* Soft glow behind (category tinted) */}
      {!low && (
        <mesh position={[0, 0, -0.012]}>
          <planeGeometry args={[W + 0.56, H + 0.56]} />
          <meshBasicMaterial
            color={accent}
            transparent
            opacity={hovered ? 0.5 : 0.24}
          />
        </mesh>
      )}

      {/* Steel backplate */}
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[frameW, frameH]} />
        <meshStandardMaterial map={steelMap} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Gold outer rim */}
      <mesh position={[0, 0, 0.07]}>
        <planeGeometry args={[frameW, frameH]} />
        <meshStandardMaterial map={goldMap} metalness={0.85} roughness={0.28} />
      </mesh>

      {/* Gold dimensional bars */}
      <mesh position={[0, lipY, 0.075]}>
        <boxGeometry args={[frameW, barT, 0.08]} />
        <meshStandardMaterial map={goldMap} metalness={0.85} roughness={0.28} />
      </mesh>
      <mesh position={[0, -lipY, 0.075]}>
        <boxGeometry args={[frameW, barT, 0.08]} />
        <meshStandardMaterial map={goldMap} metalness={0.85} roughness={0.28} />
      </mesh>
      <mesh position={[lipX, 0, 0.075]}>
        <boxGeometry args={[barT, frameH, 0.08]} />
        <meshStandardMaterial map={goldMap} metalness={0.85} roughness={0.28} />
      </mesh>
      <mesh position={[-lipX, 0, 0.075]}>
        <boxGeometry args={[barT, frameH, 0.08]} />
        <meshStandardMaterial map={goldMap} metalness={0.85} roughness={0.28} />
      </mesh>

      {/* Dark inner bevel */}
      <mesh position={[0, 0, 0.085]}>
        <planeGeometry args={[W + 0.16, H + 0.16]} />
        <meshStandardMaterial color="#232e3c" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Mat */}
      <mesh position={[0, 0, 0.095]}>
        <planeGeometry args={[W - 0.02, H - 0.02]} />
        <meshStandardMaterial color="#e9eff8" roughness={0.85} />
      </mesh>

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
      {!low && (
        <>
          <mesh position={[0, H / 2 + 0.24, 0.06]}>
            <boxGeometry args={[frameW + 0.06, 0.08, 0.22]} />
            <meshStandardMaterial
              color="#94a3b8"
              emissive="#bfe3ff"
              emissiveIntensity={hovered ? 2.8 : 1.7}
              metalness={0.6}
              roughness={0.3}
            />
          </mesh>
          <mesh position={[0, H / 2 - 0.14, 0.1]}>
            <planeGeometry args={[W + 0.2, 0.55]} />
            <meshBasicMaterial color="#cfe9ff" transparent opacity={hovered ? 0.5 : 0.26} />
          </mesh>
        </>
      )}

      {/* Light cone on hover */}
      {hovered && !low && (
        <mesh
          position={[0, H / 2 - 0.55, 0.2]}
          rotation={[Math.PI, 0, 0]}
        >
          <coneGeometry args={[W * 0.62, 1.5, 24, 1, true]} />
          <meshBasicMaterial
            color="#cfe9ff"
            transparent
            opacity={0.16}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Plaque (info board, no text) */}
      <mesh position={[0, -H / 2 - 0.58, 0.045]}>
        <planeGeometry args={[frameW - 0.04, 0.72]} />
        {goldPlaque ? (
          <meshStandardMaterial
            map={goldMap}
            metalness={0.4}
            roughness={0.3}
            emissive="#c9a35e"
            emissiveIntensity={0.25}
          />
        ) : (
          <meshStandardMaterial color="#16222f" roughness={0.45} metalness={0.35} />
        )}
      </mesh>
      {!goldPlaque && (
        <>
          <mesh position={[0, -H / 2 - 0.4, 0.06]}>
            <planeGeometry args={[frameW + 0.08, 0.035]} />
            <meshStandardMaterial map={goldMap} metalness={0.85} roughness={0.3} />
          </mesh>
          <mesh position={[0, -H / 2 - 0.8, 0.06]}>
            <planeGeometry args={[frameW + 0.08, 0.035]} />
            <meshStandardMaterial map={goldMap} metalness={0.85} roughness={0.3} />
          </mesh>
        </>
      )}

      <Text
        position={[0, -H / 2 - (goldPlaque ? 0.48 : 0.46), 0.08]}
        fontSize={0.115}
        color={goldPlaque ? "#123a63" : "#f1f5f9"}
        anchorX="center"
        anchorY="middle"
        maxWidth={frameW - 0.12}
        lineHeight={1.15}
        font="/fonts/PlusJakartaSans.ttf"
      >
        {title}
      </Text>
      <Text
        position={[0, -H / 2 - (goldPlaque ? 0.70 : 0.66), 0.08]}
        fontSize={0.09}
        color={goldPlaque ? "#1d4e79" : "#93c5fd"}
        anchorX="center"
        anchorY="middle"
        maxWidth={frameW - 0.12}
        font="/fonts/PlusJakartaSans.ttf"
      >
        {authorName}
      </Text>

      {hovered && (
        <Text
          position={[0, -H / 2 - 1.12, 0.09]}
          fontSize={0.12}
          color="#7dd3fc"
          anchorX="center"
          anchorY="middle"
          raycast={() => null}
          font="/fonts/PlusJakartaSans.ttf"
        >
          KLIK UNTUK LIHAT DETAIL
        </Text>
      )}
    </group>
  )
}

export default Painting
