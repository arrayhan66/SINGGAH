import { useLayoutEffect, useMemo, useRef } from "react"
import { Billboard, Text } from "@react-three/drei"
import * as THREE from "three"
import { useQualityStore, isMobile } from "../hooks/useQuality"

// Mode ringan (HP/layar kecil atau device rendah): daun & potongan dedaunan
// memakai geometri dan sampling lebih hemat tapi tetap tajam, karena jumlah
// segmen serendah ini tak terlihat pada ukuran daun di layar.
const LITE = isMobile() || useQualityStore.getState().tier === "rendah"

function Bench({ position, rotationY }) {
  const wood = "#2a3d5f"
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.52, 0]}>
        <boxGeometry args={[2.6, 0.12, 0.75]} />
        <meshStandardMaterial color={wood} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.0, -0.3]}>
        <boxGeometry args={[2.6, 0.9, 0.1]} />
        <meshStandardMaterial color={wood} roughness={0.5} />
      </mesh>
      <mesh position={[-1.15, 0.26, 0]}>
        <boxGeometry args={[0.14, 0.52, 0.7]} />
        <meshStandardMaterial color={wood} roughness={0.5} />
      </mesh>
      <mesh position={[1.15, 0.26, 0]}>
        <boxGeometry args={[0.14, 0.52, 0.7]} />
        <meshStandardMaterial color={wood} roughness={0.5} />
      </mesh>
    </group>
  )
}

// ---- Shared plant materials (hoisted so every plant reuses them) ----
const SOIL_MAT = new THREE.MeshStandardMaterial({ color: "#3b2a1a", roughness: 1 })
const PLANT_STEM_MAT = new THREE.MeshStandardMaterial({ color: "#3a3322", roughness: 0.7 })
const PLANT_LEAF_MAT = new THREE.MeshStandardMaterial({ color: "#3a6a5a", roughness: 0.85 })
const PLANT_LEAF_DARK_MAT = new THREE.MeshStandardMaterial({ color: "#2f5f4f", roughness: 0.85 })

// ---- Potted tropical leaf plant (textured, canvas-generated leaves) ----
// Instead of smooth primitive blobs we bake realistic foliage onto alpha-mapped
// planes: gradient green, mottling, midrib + side veins, gloss sheen and even
// lime colour-breaks (variegation). Three different textures drive variety.
function makeLeafCanvas({ base, tip, vein, variegate = false, variegateRGB = "216,234,158", boldVeins = false, seed = 7, lance = false, wavy = false, sheenRGB = "255,255,255" }) {
  const w = 256
  const h = 512
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")
  let rnd = seed
  const rndf = () => {
    rnd = (rnd * 16807) % 2147483647
    return rnd / 2147483647
  }

  // Soft ovate "houseplant" lamina: broad rounded ellipse with a gentle
  // point at the tip and a tapered junction at the base.
  const outline = () => {
    ctx.beginPath()
    if (!lance) {
      ctx.moveTo(w * 0.5, h * 0.98) // petiole junction (base)
      ctx.bezierCurveTo(w * 0.8, h * 0.9, w * 0.96, h * 0.55, w * 0.8, h * 0.13)
      ctx.bezierCurveTo(w * 0.7, h * 0.02, w * 0.3, h * 0.02, w * 0.2, h * 0.13)
      ctx.bezierCurveTo(w * 0.04, h * 0.55, w * 0.2, h * 0.9, w * 0.5, h * 0.98)
      ctx.closePath()
      return
    }
    // Lanceolate: elongated oval tapering to a pointed tip and a narrow
    // petiole junction, with a gentle waved margin when 'wavy'.
    const cx = w * 0.5
    const hm = 0.3 * w
    const n = wavy ? (LITE ? 22 : 30) : 12
    const left = []
    const right = []
    for (let k = 0; k <= n; k++) {
      const v = 0.02 + (k / n) * 0.96
      const bul = 4 * Math.pow(v, 0.7) * Math.pow(1 - v, 1.4) // 0 at tip/base, max near v≈1/3
      let hw = hm * Math.min(1, bul)
      if (wavy) hw *= 1 + 0.05 * Math.sin(k * 2.1 + 5.3)
      const y = h * (1 - v)
      left.push([cx - hw, y])
      right.push([cx + hw, y])
    }
    ctx.moveTo(left[0][0], left[0][1])
    for (let k = 1; k <= n; k++) ctx.lineTo(left[k][0], left[k][1])
    for (let k = n; k >= 0; k--) ctx.lineTo(right[k][0], right[k][1])
    ctx.closePath()
  }

  outline()
  const grad = ctx.createLinearGradient(0, h, 0, 0)
  grad.addColorStop(0, base)
  grad.addColorStop(1, tip)
  ctx.fillStyle = grad
  ctx.fill()

  ctx.save()
  outline()
  ctx.clip()

  // mottling / organic texture
  for (let i = 0; i < 260; i++) {
    const x = rndf() * w
    const y = rndf() * h
    const r = 5 + rndf() * 24
    const light = rndf() > 0.5
    ctx.fillStyle = light
      ? `rgba(255,255,255,${0.015 + rndf() * 0.05})`
      : `rgba(6,40,20,${0.02 + rndf() * 0.05})`
    ctx.beginPath()
    ctx.ellipse(x, y, r * (0.6 + rndf()), r * (0.4 + rndf() * 0.6), rndf() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }

  // wide lime colour-breaks (variegation)
  if (variegate) {
    for (let i = 0; i < 6; i++) {
      const py = h * (0.16 + rndf() * 0.62)
      const px = w * (0.28 + rndf() * 0.44)
      const pr = 24 + rndf() * 62
      const g = ctx.createRadialGradient(px, py, 2, px, py, pr)
      g.addColorStop(0, `rgba(${variegateRGB},${0.4 + rndf() * 0.3})`)
      g.addColorStop(1, "rgba(216,234,158,0)")
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.ellipse(px, py, pr, pr * (0.55 + rndf() * 0.4), rndf() * Math.PI, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // midrib, sweeping up the centre
  const mw = boldVeins ? 7.5 : 5
  const sw = boldVeins ? 4.4 : 2
  ctx.strokeStyle = vein
  ctx.lineWidth = mw
  ctx.lineCap = "round"
  ctx.beginPath()
  ctx.moveTo(w * 0.5, h * 0.95)
  ctx.quadraticCurveTo(w * 0.504, h * 0.5, w * 0.5, h * 0.05)
  ctx.stroke()
  ctx.lineWidth = mw * 0.6
  ctx.strokeStyle = vein
  ctx.beginPath()
  ctx.moveTo(w * 0.5, h * 0.14)
  ctx.quadraticCurveTo(w * 0.504, h * 0.5, w * 0.5, h * 0.05)
  ctx.stroke()

  // gentle curved side veins (fewer, softer — lush glossy houseplants)
  ctx.lineWidth = sw
  const pairs = boldVeins ? 6 : 5
  for (let i = 1; i <= pairs; i++) {
    const vy = h * (0.82 - i * (boldVeins ? 0.125 : 0.15))
    const len = (boldVeins ? 52 : 40) + (i % 2) * 12
    ctx.beginPath()
    ctx.moveTo(w * 0.5, vy)
    ctx.quadraticCurveTo(w * 0.5 - len * 0.5, vy - 6, w * 0.5 - len, vy + 14)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(w * 0.5, vy)
    ctx.quadraticCurveTo(w * 0.5 + len * 0.5, vy - 6, w * 0.5 + len, vy + 14)
    ctx.stroke()
  }

  // metallic sheen band (tintable — persian shield gets a silver-purple flash)
  const sheen = ctx.createLinearGradient(w * 0.04, 0, w * 0.56, 0)
  sheen.addColorStop(0, `rgba(${sheenRGB},0.4)`)
  sheen.addColorStop(0.4, `rgba(${sheenRGB},0.07)`)
  sheen.addColorStop(1, `rgba(${sheenRGB},0)`)
  ctx.fillStyle = sheen
  ctx.beginPath()
  ctx.ellipse(w * 0.22, h * 0.42, w * 0.26, h * 0.4, -0.2, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = LITE ? 2 : 4
  return tex
}

// ---- Rubber Plant (Ficus elastica) ----
// Satu texture atlas 512x512: kanan = daun dewasa hijau tua glossy, kiri =
// daun muda merah-bronze. Tiap tile menggambar PETIOLE + helai dalam SATU
// gambar, sehingga tiap daun instanced punya sambungan visual yang jelas ke
// batang tanpa mesh petiole terpisah. Detail urat & kilau lilin dibakar di
// tekstur; geometri tetap low-poly dan dipakai bersama (instanced).
function drawRubberTile(mode) {
  const W = 256
  const H = 512
  const c = document.createElement("canvas")
  c.width = W
  c.height = H
  const ctx = c.getContext("2d")
  const cx = 128

  const petTop = 430
  const petBot = 506
  const petHalf = 7

  // Helai oval-lonjong LEBAR (rasio panjang:lebar ±2:1): titik terlebar di
  // ±2/5 bawah, margin membulat, ujung meruncing halus. Bukan bilah memanjang.
  const silhouette = () => {
    ctx.beginPath()
    ctx.moveTo(cx, petBot)
    ctx.lineTo(cx - petHalf, petBot - 12)
    ctx.lineTo(cx - petHalf, petTop)
    ctx.bezierCurveTo(58, petTop - 16, 40, 340, 44, 258)
    ctx.bezierCurveTo(54, 175, 88, 92, 104, 56)
    ctx.quadraticCurveTo(116, 34, cx, 18)
    ctx.quadraticCurveTo(140, 34, 152, 56)
    ctx.bezierCurveTo(168, 92, 202, 175, 212, 258)
    ctx.bezierCurveTo(216, 340, 198, petTop - 16, cx + petHalf, petTop)
    ctx.lineTo(cx + petHalf, petBot - 12)
    ctx.closePath()
  }

  silhouette()
  const g = ctx.createLinearGradient(0, 18, 0, petBot)
  if (mode === "young") {
    g.addColorStop(0, "#b25a31")
    g.addColorStop(0.45, "#7d5730")
    g.addColorStop(1, "#41682f")
  } else {
    g.addColorStop(0, "#2c5f36")
    g.addColorStop(1, "#173b22")
  }
  ctx.fillStyle = g
  ctx.fill()

  ctx.save()
  silhouette()
  ctx.clip()

  // Kilau lilin tipis di sisi atas (specular ringan, bukan pantulan berat).
  const gl = ctx.createLinearGradient(cx - 44, 0, cx + 36, 0)
  gl.addColorStop(0, "rgba(255,255,255,0)")
  gl.addColorStop(0.5, "rgba(255,255,255,0.16)")
  gl.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = gl
  ctx.fillRect(cx - 70, 16, 140, petTop - 20)

  // Midrib menonjol, agak terang/kemerahan, mengecil ke ujung.
  const vc = mode === "young" ? "rgba(214,140,96,0.55)" : "rgba(150,72,50,0.5)"
  ctx.strokeStyle = vc
  ctx.lineCap = "round"
  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.moveTo(cx, petTop + 6)
  ctx.lineTo(cx, 46)
  ctx.stroke()
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(cx, 104)
  ctx.lineTo(cx, 42)
  ctx.stroke()

  // Urat lateral samar (di-bake, murah).
  ctx.strokeStyle = mode === "young" ? "rgba(74,30,14,0.22)" : "rgba(8,40,14,0.2)"
  ctx.lineWidth = 2.4
  for (let i = 1; i <= 6; i++) {
    const vy = 74 + i * 52
    const len = 40 + (i % 2) * 16
    ctx.beginPath()
    ctx.moveTo(cx, vy)
    ctx.quadraticCurveTo(cx - len * 0.5, vy - 6, cx - len, vy + 18)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx, vy)
    ctx.quadraticCurveTo(cx + len * 0.5, vy - 6, cx + len, vy + 18)
    ctx.stroke()
  }

  ctx.restore()
  return c
}

const RUBBER_ATLAS = (() => {
  const c = document.createElement("canvas")
  c.width = 512
  c.height = 512
  const ctx = c.getContext("2d")
  ctx.drawImage(drawRubberTile("mature"), 0, 0)
  ctx.drawImage(drawRubberTile("young"), 256, 0)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = LITE ? 2 : 4
  return tex
})()

const rubberTile = (ox) => {
  const t = RUBBER_ATLAS.clone()
  t.offset.set(ox, 0)
  t.repeat.set(0.5, 1)
  t.needsUpdate = true
  return t
}
const RUBBER_MATURE_TEX = rubberTile(0)
const RUBBER_YOUNG_TEX = rubberTile(0.5)

const MAT_RUBBER_MATURE = new THREE.MeshStandardMaterial({ map: RUBBER_MATURE_TEX, alphaTest: 0.5, roughness: 0.3, metalness: 0.12, side: THREE.DoubleSide, emissive: new THREE.Color("#0b1e0e"), emissiveIntensity: 0.14 })
const MAT_RUBBER_YOUNG = new THREE.MeshStandardMaterial({ map: RUBBER_YOUNG_TEX, alphaTest: 0.5, roughness: 0.34, metalness: 0.08, side: THREE.DoubleSide, emissive: new THREE.Color("#22140a"), emissiveIntensity: 0.18 })
const MAT_RUBBER_TRUNK = new THREE.MeshStandardMaterial({ color: "#46543a", roughness: 0.8 })
// Batang persian diberi warna lembayung tua (bukan hitam) supaya menyatu
// dengan kelopak ungu, tanpa bercak gelap di tengah rumpun.
const MAT_PERSIAN_STEM = new THREE.MeshStandardMaterial({ color: "#4a3449", roughness: 0.5 })
// ---- Persian Shield (Strobilanthes dyerianus) iridescent purple foliage ----
// Daun lanceolate bergelombang dengan urat HIJA Es tua yang halus/tipis
// (bukan hijau terang solid), permukaan atas ungu metalik-perak berkilau,
// didukung band sheen perak-ungu di tekstur.
const PERSIAN_TEX_A = makeLeafCanvas({ base: "#3c1f4e", tip: "#8c5ca4", vein: "rgba(58,96,74,0.72)", lance: true, wavy: true, sheenRGB: "224,206,255", seed: 101 })
const PERSIAN_TEX_B = makeLeafCanvas({ base: "#45264e", tip: "#a573b6", vein: "rgba(64,104,80,0.7)", lance: true, wavy: true, sheenRGB: "232,216,255", seed: 137 })
const PERSIAN_TEX_C = makeLeafCanvas({ base: "#583270", tip: "#be90ca", vein: "rgba(70,110,86,0.7)", lance: true, wavy: true, variegate: true, variegateRGB: "205,175,235", sheenRGB: "228,214,255", seed: 173 })

const MAT_PERSIAN_A = new THREE.MeshStandardMaterial({ map: PERSIAN_TEX_A, alphaTest: 0.5, roughness: 0.3, metalness: 0.3, side: THREE.DoubleSide, emissive: new THREE.Color("#250c33"), emissiveIntensity: 0.22 })
const MAT_PERSIAN_B = new THREE.MeshStandardMaterial({ map: PERSIAN_TEX_B, alphaTest: 0.5, roughness: 0.32, metalness: 0.3, side: THREE.DoubleSide, emissive: new THREE.Color("#2c0f3d"), emissiveIntensity: 0.22 })
const MAT_PERSIAN_C = new THREE.MeshStandardMaterial({ map: PERSIAN_TEX_C, alphaTest: 0.5, roughness: 0.34, metalness: 0.3, side: THREE.DoubleSide, emissive: new THREE.Color("#36144d"), emissiveIntensity: 0.22 })

// Rubber plant leaf plane: broad & flat with a gentle fold along the length.
// BASE pinned at y=0 (petiole junction), tip pointing +Y (y=1) — sama dengan
// konvensi atlas. Satu geometri dipakai semua daun via instancing.
const RUBBER_LEAF_GEO = (() => {
  const len = 1.0
  const geo = new THREE.PlaneGeometry(0.68, len, LITE ? 4 : 6, LITE ? 8 : 16)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    const t = (y + len / 2) / len // 0 at base .. 1 at tip (pre-shift)
    pos.setY(i, y + len / 2)
    pos.setZ(i, Math.sin(Math.PI * t) * -0.05) // soft trough (folded along midrib)
  }
  geo.computeVertexNormals()
  return geo
})()

// Persian Shield geometry: blade ramping (lanceolate) dengan cekungan pelan
// dan kerut halus mengikuti siluet tekstur bergelombang.
const PERSIAN_GEO = (() => {
  const len = 1.0
  const geo = new THREE.PlaneGeometry(0.66, len, LITE ? 4 : 6, LITE ? 12 : 20)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    const x = pos.getX(i)
    const t = (y + len / 2) / len // 0 at base .. 1 at tip (pre-shift)
    pos.setY(i, y + len / 2)
    const u = (x / 0.66) * 2 // -1 .. 1 across the blade
    const cup = Math.sin(Math.PI * t) * -0.11
    const crinkle = LITE ? 0 : Math.sin(t * 5.4 + 0.6) * Math.cos(u * 7.3) * 0.02
    pos.setZ(i, cup + crinkle)
  }
  geo.computeVertexNormals()
  return geo
})()

function leafQuat(leafDir, radial, spinJit) {
  const up = new THREE.Vector3(0, 1, 0)
  const q0 = new THREE.Quaternion().setFromUnitVectors(up, leafDir)
  const fn0 = new THREE.Vector3(0, 0, 1).applyQuaternion(q0)
  const faceTarget = radial.clone().multiplyScalar(0.92).add(up.clone().multiplyScalar(0.39)).normalize()
  const t = faceTarget.clone().addScaledVector(leafDir, -faceTarget.dot(leafDir))
  if (t.lengthSq() > 1e-6) t.normalize()
  const cross = new THREE.Vector3().crossVectors(fn0, t)
  const faceSpin = Math.atan2(cross.dot(leafDir), fn0.dot(t))
  return q0.multiply(new THREE.Quaternion().setFromAxisAngle(up, faceSpin + spinJit))
}

export const POT_STYLES = [
  "terracotta",
  "ceramic",
  "darkglaze",
  "basket",
  "hex",
  "concrete",
  "striped",
  "ridged",
  "copper",
  "modern",
  "matte",
  "vase",
]
export const FLOWER_TYPES = ["daisy", "tulip", "lavender", "sunflower", "orchid"]

const MAT_TERRACOTTA = new THREE.MeshStandardMaterial({ color: "#b45a38", roughness: 0.95 })
const MAT_TERRACOTTA_RIM = new THREE.MeshStandardMaterial({ color: "#a94f30", roughness: 0.95 })
const MAT_CERAMIC = new THREE.MeshStandardMaterial({ color: "#f4f6f8", roughness: 0.2, metalness: 0.05 })
const MAT_DARKGLAZE = new THREE.MeshStandardMaterial({ color: "#1b2431", roughness: 0.3 })
const MAT_DARKGLAZE_BAND = new THREE.MeshStandardMaterial({ color: "#38bdf8", roughness: 0.12, metalness: 0.15 })
const MAT_BASKET = new THREE.MeshStandardMaterial({ color: "#a07840", roughness: 1 })
const MAT_BASKET_WEAVE = new THREE.MeshStandardMaterial({ color: "#7d5a2e", roughness: 1 })
const MAT_HEX = new THREE.MeshStandardMaterial({ color: "#7d8f88", roughness: 0.8, flatShading: true })
const MAT_CONCRETE = new THREE.MeshStandardMaterial({ color: "#a3abb3", roughness: 1 })
const MAT_STRIPED_BASE = new THREE.MeshStandardMaterial({ color: "#f4f6f8", roughness: 0.35 })
const MAT_STRIPE_A = new THREE.MeshStandardMaterial({ color: "#c96f4a", roughness: 0.4 })
const MAT_STRIPE_B = new THREE.MeshStandardMaterial({ color: "#2f4a6e", roughness: 0.4 })
const MAT_RIDGED = new THREE.MeshStandardMaterial({ color: "#9c4a3c", roughness: 0.85 })
const MAT_COPPER = new THREE.MeshStandardMaterial({ color: "#b87333", metalness: 0.85, roughness: 0.28 })
const MAT_COPPER_DARK = new THREE.MeshStandardMaterial({ color: "#8a5a24", metalness: 0.85, roughness: 0.35 })
const MAT_MODERN = new THREE.MeshStandardMaterial({ color: "#14181f", roughness: 0.55, metalness: 0.1 })
const MAT_MODERN_LIP = new THREE.MeshStandardMaterial({ color: "#e5e7eb", roughness: 0.5 })

// Elegant matte stoneware planter (used for the centerpiece foliage plants)
const MAT_MATTE = new THREE.MeshStandardMaterial({ color: "#d6cdb8", roughness: 0.55 })
const MAT_MATTE_BASE = new THREE.MeshStandardMaterial({ color: "#b5ab93", roughness: 0.55 })
const MAT_MATTE_LIP = new THREE.MeshStandardMaterial({ color: "#e6dfcc", roughness: 0.5 })
const MAT_MATTE_ACCENT = new THREE.MeshStandardMaterial({ color: "#c9a35e", metalness: 0.7, roughness: 0.3 })

// Vase pot untuk tanaman Persian Shield: gradasi gelas hijau tua → ungu yang
// senada dengan kelopak. Tekstur canvas kecil (128x256) tetap tajam di layar
// retina tapi hemat GPU/memori, menggantikan pot "bola putih polos".
const PERSIAN_POT_MAP = (() => {
  const w = 128
  const h = 256
  const c = document.createElement("canvas")
  c.width = w
  c.height = h
  const ctx = c.getContext("2d")
  const g = ctx.createLinearGradient(0, h, 0, 0)
  g.addColorStop(0, "#16291d")
  g.addColorStop(0.5, "#3a2a4a")
  g.addColorStop(1, "#784a9e")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  const sh = ctx.createLinearGradient(0, 0, w, 0)
  sh.addColorStop(0, "rgba(255,255,255,0)")
  sh.addColorStop(0.35, "rgba(255,255,255,0.18)")
  sh.addColorStop(0.65, "rgba(255,255,255,0)")
  ctx.fillStyle = sh
  ctx.fillRect(0, 0, w, h)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 2
  return tex
})()
const MAT_PERSIAN_POT = new THREE.MeshStandardMaterial({ map: PERSIAN_POT_MAP, roughness: 0.4, metalness: 0.05 })
const MAT_PERSIAN_POT_DARK = new THREE.MeshStandardMaterial({ color: "#2c2040", roughness: 0.5 })

// Renders a shared material, or an inline tinted one when `color` is given
// (used for the legacy potColor prop override).
function PMat({ mat, color, roughness = 0.8, metalness = 0 }) {
  if (color) return <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
  return <primitive object={mat} attach="material" />
}

// 10 distinct pot designs. Each pot occupies roughly the same footprint
// (top opening ~0.42-0.46 high) so foliage offsets stay valid across styles.
function Pot({ style, colorOverride }) {
  switch (style) {
    case "terracotta":
      return (
        <group>
          <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.28, 0.2, 0.4, 20]} />
            <PMat mat={MAT_TERRACOTTA} color={colorOverride} roughness={0.95} />
          </mesh>
          <mesh position={[0, 0.425, 0]} castShadow>
            <cylinderGeometry args={[0.305, 0.285, 0.07, 20]} />
            <PMat mat={MAT_TERRACOTTA_RIM} color={colorOverride} roughness={0.95} />
          </mesh>
        </group>
      )
    case "ceramic":
      return (
        <group>
          <mesh position={[0, 0.018, 0]} castShadow>
            <cylinderGeometry args={[0.33, 0.35, 0.036, 24]} />
            <PMat mat={MAT_CERAMIC} color={colorOverride} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.17, 0]} scale={[1, 0.72, 1]} castShadow>
            <sphereGeometry args={[0.26, 24, 16]} />
            <PMat mat={MAT_CERAMIC} color={colorOverride} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.32, 0]} castShadow>
            <cylinderGeometry args={[0.25, 0.23, 0.16, 24]} />
            <PMat mat={MAT_CERAMIC} color={colorOverride} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.41, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.245, 0.02, 10, 28]} />
            <PMat mat={MAT_CERAMIC} color={colorOverride} roughness={0.25} />
          </mesh>
        </group>
      )
    case "darkglaze":
      return (
        <group>
          <mesh position={[0, 0.21, 0]} castShadow>
            <cylinderGeometry args={[0.23, 0.13, 0.42, 20]} />
            <PMat mat={MAT_DARKGLAZE} color={colorOverride} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.2, 0.012, 8, 24]} />
            <primitive object={MAT_DARKGLAZE_BAND} attach="material" />
          </mesh>
          <mesh position={[0, 0.445, 0]} castShadow>
            <cylinderGeometry args={[0.245, 0.225, 0.05, 20]} />
            <PMat mat={MAT_DARKGLAZE} color={colorOverride} roughness={0.3} />
          </mesh>
        </group>
      )
    case "basket": {
      const ribs = Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2
        return [Math.cos(a) * 0.283, 0.19, Math.sin(a) * 0.283]
      })
      return (
        <group>
          <mesh position={[0, 0.19, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.25, 0.38, 18]} />
            <PMat mat={MAT_BASKET} color={colorOverride} roughness={1} />
          </mesh>
          {[0.09, 0.19, 0.29].map((y, i) => (
            <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.283, 0.018, 8, 24]} />
              <primitive object={MAT_BASKET_WEAVE} attach="material" />
            </mesh>
          ))}
          {ribs.map((p, i) => (
            <mesh key={`r-${i}`} position={p}>
              <cylinderGeometry args={[0.014, 0.014, 0.38, 6]} />
              <primitive object={MAT_BASKET_WEAVE} attach="material" />
            </mesh>
          ))}
          <mesh position={[0, 0.395, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.3, 0.024, 8, 24]} />
            <primitive object={MAT_BASKET_WEAVE} attach="material" />
          </mesh>
        </group>
      )
    }
    case "hex":
      return (
        <group rotation={[0, Math.PI / 6, 0]}>
          <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.28, 0.22, 0.4, 6]} />
            <PMat mat={MAT_HEX} color={colorOverride} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.43, 0]} castShadow>
            <cylinderGeometry args={[0.315, 0.315, 0.06, 6]} />
            <PMat mat={MAT_HEX} color={colorOverride} roughness={0.8} />
          </mesh>
        </group>
      )
    case "concrete":
      return (
        <group>
          <mesh position={[0, 0.17, 0]} castShadow>
            <cylinderGeometry args={[0.33, 0.25, 0.34, 22]} />
            <PMat mat={MAT_CONCRETE} color={colorOverride} roughness={1} />
          </mesh>
          <mesh position={[0, 0.37, 0]} castShadow>
            <cylinderGeometry args={[0.35, 0.34, 0.06, 22]} />
            <PMat mat={MAT_CONCRETE} color={colorOverride} roughness={1} />
          </mesh>
        </group>
      )
    case "striped":
      return (
        <group>
          <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.27, 0.215, 0.4, 22]} />
            <PMat mat={MAT_STRIPED_BASE} color={colorOverride} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.11, 0]}>
            <cylinderGeometry args={[0.262, 0.256, 0.05, 22]} />
            <primitive object={MAT_STRIPE_A} attach="material" />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.255, 0.25, 0.05, 22]} />
            <primitive object={MAT_STRIPE_B} attach="material" />
          </mesh>
          <mesh position={[0, 0.29, 0]}>
            <cylinderGeometry args={[0.247, 0.243, 0.05, 22]} />
            <primitive object={MAT_STRIPE_A} attach="material" />
          </mesh>
          <mesh position={[0, 0.425, 0]} castShadow>
            <cylinderGeometry args={[0.285, 0.27, 0.05, 22]} />
            <PMat mat={MAT_STRIPED_BASE} color={colorOverride} roughness={0.35} />
          </mesh>
        </group>
      )
    case "ridged":
      return (
        <group>
          <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.235, 0.185, 0.4, 18]} />
            <PMat mat={MAT_RIDGED} color={colorOverride} roughness={0.85} />
          </mesh>
          {[0.07, 0.14, 0.21, 0.28, 0.35].map((y, i) => (
            <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.24, 0.016, 8, 22]} />
              <PMat mat={MAT_RIDGED} color={colorOverride} roughness={0.85} />
            </mesh>
          ))}
          <mesh position={[0, 0.425, 0]} castShadow>
            <cylinderGeometry args={[0.265, 0.25, 0.05, 18]} />
            <PMat mat={MAT_RIDGED} color={colorOverride} roughness={0.85} />
          </mesh>
        </group>
      )
    case "copper":
      return (
        <group>
          <mesh position={[0, 0.05, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.19, 0.1, 20]} />
            <PMat mat={MAT_COPPER} color={colorOverride} roughness={0.3} metalness={0.85} />
          </mesh>
          <mesh position={[0, 0.2, 0]} scale={[1, 0.78, 1]} castShadow>
            <sphereGeometry args={[0.25, 20, 14]} />
            <PMat mat={MAT_COPPER} color={colorOverride} roughness={0.3} metalness={0.85} />
          </mesh>
          <mesh position={[0, 0.34, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.23, 0.12, 20]} />
            <PMat mat={MAT_COPPER} color={colorOverride} roughness={0.3} metalness={0.85} />
          </mesh>
          <mesh position={[0, 0.395, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.212, 0.009, 8, 24]} />
            <primitive object={MAT_COPPER_DARK} attach="material" />
          </mesh>
          <mesh position={[0, 0.415, 0]} castShadow>
            <cylinderGeometry args={[0.225, 0.21, 0.05, 20]} />
            <PMat mat={MAT_COPPER} color={colorOverride} roughness={0.3} metalness={0.85} />
          </mesh>
        </group>
      )
    case "modern":
      return (
        <group>
          {[
            [-0.2, -0.2],
            [0.2, -0.2],
            [-0.2, 0.2],
            [0.2, 0.2],
          ].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.02, z]}>
              <boxGeometry args={[0.06, 0.04, 0.06]} />
              <primitive object={MAT_MODERN} attach="material" />
            </mesh>
          ))}
          <mesh position={[0, 0.22, 0]} castShadow>
            <boxGeometry args={[0.5, 0.4, 0.5]} />
            <PMat mat={MAT_MODERN} color={colorOverride} roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.445, 0]} castShadow>
            <boxGeometry args={[0.55, 0.05, 0.55]} />
            <primitive object={MAT_MODERN_LIP} attach="material" />
          </mesh>
        </group>
      )
    case "matte":
      return (
        <group>
          <mesh position={[0, 0.03, 0]} castShadow>
            <cylinderGeometry args={[0.165, 0.185, 0.05, 24]} />
            <primitive object={MAT_MATTE_BASE} attach="material" />
          </mesh>
          <mesh position={[0, 0.24, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.19, 0.42, 26]} />
            <PMat mat={MAT_MATTE} color={colorOverride} roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.44, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.27, 0.011, 8, 28]} />
            <primitive object={MAT_MATTE_ACCENT} attach="material" />
          </mesh>
          <mesh position={[0, 0.475, 0]} castShadow>
            <cylinderGeometry args={[0.305, 0.26, 0.05, 26]} />
            <primitive object={MAT_MATTE_LIP} attach="material" />
          </mesh>
        </group>
      )
    case "vase":
      return (
        <group>
          <mesh position={[0, 0.06, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.19, 0.07, 18]} />
            <primitive object={MAT_PERSIAN_POT_DARK} attach="material" />
          </mesh>
          <mesh position={[0, 0.28, 0]} castShadow>
            <cylinderGeometry args={[0.28, 0.12, 0.5, 20]} />
            <primitive object={MAT_PERSIAN_POT} attach="material" />
          </mesh>
          <mesh position={[0, 0.53, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.28, 0.022, 8, 24]} />
            <primitive object={MAT_PERSIAN_POT_DARK} attach="material" />
          </mesh>
        </group>
      )
    default:
      return null
  }
}

// ---- 5 flower types, each with its own silhouette ----

function DaisyHead() {
  const petals = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2
    return (
      <mesh key={i} position={[Math.cos(a) * 0.075, 0, Math.sin(a) * 0.075]} scale={[1, 0.35, 0.55]}>
        <sphereGeometry args={[0.06, 10, 8]} />
        <meshStandardMaterial color="#fdfdf8" roughness={0.45} />
      </mesh>
    )
  })
  return (
    <group>
      {petals}
      <mesh>
        <sphereGeometry args={[0.055, 12, 10]} />
        <meshStandardMaterial color="#facc15" roughness={0.4} />
      </mesh>
    </group>
  )
}

function TulipHead({ color }) {
  const petals = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2
    return (
      <mesh
        key={i}
        position={[Math.cos(a) * 0.048, 0.02, Math.sin(a) * 0.048]}
        rotation={[Math.sin(a) * 0.38, -a, Math.cos(a) * 0.38]}
        scale={[0.75, 1.15, 0.5]}
      >
        <sphereGeometry args={[0.07, 12, 10]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    )
  })
  return (
    <group>
      {petals}
      <mesh position={[0, 0.01, 0]}>
        <sphereGeometry args={[0.05, 10, 8]} />
        <meshStandardMaterial color="#8a3a52" roughness={0.5} />
      </mesh>
    </group>
  )
}

function LavenderHead() {
  const buds = Array.from({ length: 8 }, (_, i) => {
    const t = i / 7
    return (
      <mesh key={i} position={[0, t * 0.18, 0]} scale={[1 - t * 0.55, 1.25, 1 - t * 0.55]}>
        <sphereGeometry args={[0.034, 8, 8]} />
        <meshStandardMaterial color={i % 2 ? "#8b7cd8" : "#a78bfa"} roughness={0.55} />
      </mesh>
    )
  })
  return <group>{buds}</group>
}

function SunflowerHead() {
  const petals = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2
    return (
      <mesh
        key={i}
        position={[Math.cos(a) * 0.135, Math.sin(a) * 0.135, 0]}
        rotation={[0, 0, a + Math.PI / 2]}
        scale={[0.45, 1.5, 0.22]}
      >
        <sphereGeometry args={[0.06, 10, 8]} />
        <meshStandardMaterial color="#fbbf24" roughness={0.5} />
      </mesh>
    )
  })
  return (
    <group rotation={[Math.PI / 2 - 0.35, 0, 0]}>
      {petals}
      <mesh>
        <cylinderGeometry args={[0.095, 0.095, 0.035, 16]} />
        <meshStandardMaterial color="#4a2c17" roughness={0.9} />
      </mesh>
    </group>
  )
}

function OrchidHead({ color }) {
  return (
    <group>
      {/* two broad lateral petals */}
      {[-1, 1].map((s) => (
        <mesh key={`l-${s}`} position={[s * 0.095, 0.01, 0.01]} rotation={[0.15, 0, s * -0.5]} scale={[1.5, 1, 0.35]}>
          <sphereGeometry args={[0.085, 12, 10]} />
          <meshStandardMaterial color={color} roughness={0.45} />
        </mesh>
      ))}
      {/* two dorsal petals */}
      {[-1, 1].map((s) => (
        <mesh key={`d-${s}`} position={[s * 0.05, 0.085, -0.02]} rotation={[-0.5, 0, s * -0.9]} scale={[1, 1.2, 0.35]}>
          <sphereGeometry args={[0.07, 12, 10]} />
          <meshStandardMaterial color={color} roughness={0.45} />
        </mesh>
      ))}
      {/* contrasting lip */}
      <mesh position={[0, -0.045, 0.05]} rotation={[0.7, 0, 0]} scale={[1, 0.6, 0.8]}>
        <sphereGeometry args={[0.055, 12, 10]} />
        <meshStandardMaterial color="#c026d3" roughness={0.4} />
      </mesh>
      {/* column */}
      <mesh position={[0, 0.005, 0.035]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.35} />
      </mesh>
    </group>
  )
}

function FlowerHead({ type, color }) {
  if (type === "tulip") return <TulipHead color={color} />
  if (type === "lavender") return <LavenderHead />
  if (type === "sunflower") return <SunflowerHead />
  if (type === "orchid") return <OrchidHead color={color} />
  return <DaisyHead />
}

// Deterministic hash from a world position, so pot/flower variety is stable
// across renders without any stored state.
function posHash(position) {
  const x = Math.round(((position && position[0]) || 0) * 97)
  const y = Math.round(((position && position[1]) || 0) * 53)
  const z = Math.round(((position && position[2]) || 0) * 89)
  let h = (x * 73856093) ^ (z * 19349663) ^ (y * 83492791)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return (h ^ (h >>> 16)) >>> 0
}

function resolveStyle(potStyle, h) {
  if (typeof potStyle === "string" && POT_STYLES.includes(potStyle)) return potStyle
  if (typeof potStyle === "number") return POT_STYLES[((potStyle % 10) + 10) % 10]
  return POT_STYLES[(h >>> 3) % 10]
}

function resolveFlower(flowerType, h) {
  if (typeof flowerType === "string" && FLOWER_TYPES.includes(flowerType)) return flowerType
  if (typeof flowerType === "number") return FLOWER_TYPES[((flowerType % 5) + 5) % 5]
  return FLOWER_TYPES[(h >>> 11) % 5]
}

// ---- Rubber Plant (Ficus elastica) ----
// Satu batang tegak organik (coklat-kehijauan, cukup tebal) dengan daun
// tersusun SPIRAL rapat dari bawah ke atas mengelilingi batang — bukan fan
// dari satu titik. Semua daun memakai SATU geometri low-poly yang di-instance
// (per daun hanya beda posisi/rotasi/skala); petiole menyatu di tekstur atlas
// sehingga tidak ada daun mengambang tanpa sambungan. Pucuk muda atas
// berwarna merah-bronze. LOD: mobile ~8-9 daun besar, desktop detail penuh.
function buildRubberLayout(h) {
  const j = (seed) => {
    const x = Math.sin((h % 1000) * 0.31 + seed * 12.9898) * 43758.5453
    return x - Math.floor(x)
  }
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
  const up = new THREE.Vector3(0, 1, 0)
  const horizontal = (yaw) => new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)).normalize()

  // Batang organik PENDEK & tebal: daun karet rimbun menumpuk di pucuk,
  // bukan tersebar sepanjang batang panjang.
  const trunkBase = new THREE.Vector3(0, 0.02, 0)
  const top = new THREE.Vector3(0, (LITE ? 0.48 : 0.56) + j(301) * 0.04, 0)
  const trunkMid = trunkBase
    .clone()
    .lerp(top, 0.5)
    .add(new THREE.Vector3((j(302) - 0.5) * 0.02, 0, (j(303) - 0.5) * 0.02))
  const trunkCurve = new THREE.QuadraticBezierCurve3(trunkBase, trunkMid, top)
  const trunkR = 0.05

  const mature = []
  const young = []
  const attachLeaf = (list, tNode, yawAt, openness, scale, wa) => {
    const P = trunkCurve.getPoint(tNode)
    const radial = horizontal(yawAt)
    const baseP = P.clone().addScaledVector(radial, trunkR * 0.7)
    const dir = up.clone().multiplyScalar(Math.cos(openness)).addScaledVector(radial, Math.sin(openness)).normalize()
    const quat = leafQuat(dir, radial, (j(310 + list.length) - 0.5) * 0.5)
    list.push({ pos: baseP, quat, scale, wa: wa * (0.97 + j(311 + list.length) * 0.06), cup: 1.0 })
  }

  // Daun dewasa 6-8: spiral golden-angle, semua BESAR & rapat menumpuk di
  // bagian atas batang (u dipangkatkan supaya titik tumbuh mengerucut ke
  // pucuk). Daun di tepi arahkan keluar-landai, yang atas makin tegak.
  const n = LITE ? 6 : 7
  const GOLDEN = 2.39996
  const bias = (j(304) - 0.5) * 0.7
  for (let i = 0; i < n; i++) {
    const t = i / Math.max(1, n - 1)
    const u = clamp(0.36 + 0.62 * Math.pow(t, 1.7), 0.32, 0.97)
    const yaw = i * GOLDEN + bias + (j(305 + i) - 0.5) * 0.34
    const openness = clamp(1.22 - 0.58 * Math.pow(t, 0.9) + (j(306 + i) - 0.5) * 0.1, 0.4, 1.5)
    const scale = 0.8 + 0.3 * Math.pow(Math.sin(Math.PI * t), 0.6) + (j(307 + i) - 0.5) * 0.05
    attachLeaf(mature, u, yaw, openness, scale, 1.0)
  }

  // Pucuk muda merah-bronze di puncak: bentuk tetap oval lebar, ukuran kecil.
  if (!LITE) {
    for (let i = 0; i < 2; i++) {
      const u = clamp(0.95 + i * 0.03, 0.9, 0.99)
      const yaw = 2.8 + i * 2.3 + (j(330 + i) - 0.5) * 0.5
      const openness = 0.3 + (j(331 + i) - 0.5) * 0.16
      attachLeaf(young, u, yaw, openness, 0.5 + i * 0.04, 0.94)
    }
  } else {
    attachLeaf(young, 0.97, 1.2 + (j(340) - 0.5) * 0.5, 0.28 + j(341) * 0.1, 0.46, 0.94)
  }

  return { trunkCurve, trunkR, mature, young }
}

function RubberPlant({ h }) {
  const matureRef = useRef()
  const youngRef = useRef()
  const layout = useMemo(() => buildRubberLayout(h), [h])

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D()
    layout.mature.forEach((l, i) => {
      dummy.position.copy(l.pos)
      dummy.quaternion.copy(l.quat)
      dummy.scale.set(l.wa * l.scale, l.scale, l.cup)
      dummy.updateMatrix()
      matureRef.current.setMatrixAt(i, dummy.matrix)
    })
    matureRef.current.instanceMatrix.needsUpdate = true
    if (layout.young.length && youngRef.current) {
      layout.young.forEach((l, i) => {
        dummy.position.copy(l.pos)
        dummy.quaternion.copy(l.quat)
        dummy.scale.set(l.wa * l.scale, l.scale, l.cup)
        dummy.updateMatrix()
        youngRef.current.setMatrixAt(i, dummy.matrix)
      })
      youngRef.current.instanceMatrix.needsUpdate = true
    }
  }, [layout])

  return (
    <group position={[0, 0.32, 0]}>
      {/* Batang organik tegak & tebal (tersembunyi rapi di balik daun) */}
      <mesh castShadow>
        <tubeGeometry args={[layout.trunkCurve, LITE ? 5 : 6, layout.trunkR, LITE ? 5 : 6, false]} />
        <primitive object={MAT_RUBBER_TRUNK} attach="material" />
      </mesh>
      {/* Semua daun dewasa: 1 geometri, di-instance */}
      <instancedMesh ref={matureRef} args={[RUBBER_LEAF_GEO, MAT_RUBBER_MATURE, layout.mature.length]} castShadow />
      {/* Pucuk muda merah-bronze (desktop) */}
      {layout.young.length > 0 && (
        <instancedMesh ref={youngRef} args={[RUBBER_LEAF_GEO, MAT_RUBBER_YOUNG, layout.young.length]} castShadow />
      )}
    </group>
  )
}

// ---- Persian (Strobilanthes) — semak berdaun, bukan mahkota bunga ----
// Meniru Persian Shield asli: batang ramping keunguan bercabang 2-3, daun
// lanceolate tersusun BERLAWANAN berpasangan (opposite/decussate) di setiap
// buku batang — bukan mengumpul di satu pucuk. Daun bawah lebih besar dan
// lebar, semakin ke pucuk semakin kecil dan tegak. Tanpa bunga/putik; pucuk
// muda kecil menutup ujung batang.
function PersianFoliage({ h }) {
  const leafMats = [MAT_PERSIAN_A, MAT_PERSIAN_B, MAT_PERSIAN_C]
  const up = new THREE.Vector3(0, 1, 0)
  const j = (seed) => {
    const x = Math.sin((h % 1000) * 0.31 + seed * 12.9898) * 43758.5453
    return x - Math.floor(x)
  }
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
  const horizontal = (yaw) => new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)).normalize()

  // Batang utama: ramping, sedikit melengkung, muncul dari dalam vas.
  const trunkBase = new THREE.Vector3(0, 0.02, 0)
  const top = new THREE.Vector3(0, 0.6 + j(201) * 0.04, 0)
  const trunkMid = trunkBase
    .clone()
    .lerp(top, 0.5)
    .add(new THREE.Vector3((j(202) - 0.5) * 0.02, 0, (j(203) - 0.5) * 0.02))
  const trunkCurve = new THREE.QuadraticBezierCurve3(trunkBase, trunkMid, top)
  const trunkR = 0.02

  // Tinggi buku batang tempat cabang keluar. Rim vas berada di y ≈ 0.21
  // (ruang local), jadi semua buku dinaikkan JAUH di atas rim untuk memberi
  // clearance aman: tidak ada titik tumbuh yang masuk ke dalam pot.
  const nodes = [0.28 + j(207) * 0.02, 0.44 + j(208) * 0.02, 0.58 + j(209) * 0.03]

  // 2-3 percabangan kecil; setiap cabang membawa pasangan daun berhadapan.
  const branchDefs = LITE
    ? [
        { yaw: 0.9, len: 0.27, rise: 0.18, pairs: 2, baseScale: 0.6, node: 0 },
        { yaw: 4.1, len: 0.25, rise: 0.2, pairs: 2, baseScale: 0.58, node: 2 },
      ]
    : [
        { yaw: 0.7 + (j(204) - 0.5) * 0.3, len: 0.32, rise: 0.22, pairs: 3, baseScale: 0.68, node: 1 },
        { yaw: 2.5 + (j(205) - 0.5) * 0.3, len: 0.29, rise: 0.18, pairs: 2, baseScale: 0.62, node: 0 },
        { yaw: 4.4 + (j(206) - 0.5) * 0.3, len: 0.31, rise: 0.2, pairs: 2, baseScale: 0.64, node: 2 },
      ]

  const branches = branchDefs.map((def) => {
    const start = new THREE.Vector3(0, nodes[def.node], 0)
    const hd = horizontal(def.yaw)
    const end = start
      .clone()
      .addScaledVector(hd, def.len * Math.cos(def.rise))
      .addScaledVector(up, def.len * Math.sin(def.rise))
    const mid = start.clone().lerp(end, 0.5).addScaledVector(hd, 0.05).add(new THREE.Vector3(0, 0.06, 0))
    return { def, curve: new THREE.QuadraticBezierCurve3(start, mid, end) }
  })

  // Kumpulkan semua daun: { baseP, quaternion, scale, wa, cup, mat }
  const leaves = []
  let li = 0
  const nextMat = () => leafMats[(li++ + (h >>> 4)) % 3]
  const addLeaf = (baseP, yawAtt, openness, scale, wa, cup, mat) => {
    // Kunci sudut daun dalam rentang yang hampir selalu ke ATAS (maks ~71°),
    // sehingga tepi lebar helai tidak pernah turun melewati rim pot ketika
    // pangkal daun menjulur keluar dari dalam.
    const o = clamp(openness, 0.3, 1.25)
    const radial = horizontal(yawAtt)
    const dir = up.clone().multiplyScalar(Math.cos(o)).addScaledVector(radial, Math.sin(o)).normalize()
    const q = leafQuat(dir, radial, (j(280 + (leaves.length % 40)) - 0.5) * 0.5)
    leaves.push({ baseP: baseP.clone(), q, scale, wa, cup, mat })
  }

  // Pasangan basal di bawah: besar, melebar, agak landai (gagah/rimbun).
  // Diangkat di atas rim vas (0.21) supaya tidak ada helai menembus dinding.
  if (!LITE) {
    const basal = [
      { y: 0.24 + j(221) * 0.02, axis: 1.6, scale: 0.68, open: 1.22 },
      { y: 0.32 + j(222) * 0.02, axis: 0.5, scale: 0.6, open: 1.12 },
    ]
    basal.forEach((b) => {
      addLeaf(new THREE.Vector3(0, b.y, 0), b.axis, b.open, b.scale, 1.05, 0.95 + j(225) * 0.1, nextMat())
      addLeaf(new THREE.Vector3(0, b.y, 0), b.axis + Math.PI, b.open, b.scale, 1.05, 0.95 + j(226) * 0.1, nextMat())
    })
  }

  // Daun per cabang: berpasangan berlawanan, sumbu pasangan berotasi tiap buku
  // (decussate) supaya rimbun dari segala sisi; ukuran mengecil ke ujung.
  branches.forEach((b, bi) => {
    const ts = Array.from({ length: b.def.pairs }, (_, i) =>
      b.def.pairs === 1 ? 0.7 : 0.22 + (i * 0.66) / (b.def.pairs - 1),
    )
    ts.forEach((t, i) => {
      const P = b.curve.getPoint(t)
      const axis = b.def.yaw + (i % 2) * 1.9 + (j(230 + bi * 7 + i) - 0.5) * 0.25
      const scale = b.def.baseScale - i * 0.12 + (j(240 + i) - 0.5) * 0.04
      const openness = clamp(1.18 - i * 0.24 + (j(250 + i) - 0.5) * 0.14, 0.5, 1.5)
      const wa = 1.0 + (j(260 + i) - 0.5) * 0.08
      const cup = 0.95 + j(270 + i) * 0.1
      const mat = nextMat()
      addLeaf(P, axis, openness, scale, wa, cup, mat)
      addLeaf(P, axis + Math.PI, openness, scale, wa, cup, mat)
    })
  })

  // Pucuk muda: dua daun kecil tegak di ujung batang.
  addLeaf(top, 0.9, 0.38, 0.32, 0.9, 0.85, leafMats[(li + h) % 3])
  addLeaf(top, 4.0, 0.42, 0.3, 0.9, 0.85, leafMats[(li + h + 1) % 3])

  return (
    <group position={[0, 0.32, 0]}>
      {/* Batang utama */}
      <mesh castShadow>
        <tubeGeometry args={[trunkCurve, LITE ? 5 : 6, trunkR, LITE ? 5 : 6, false]} />
        <primitive object={MAT_PERSIAN_STEM} attach="material" />
      </mesh>
      {/* Cabang kecil */}
      {branches.map((b, bi) => (
        <mesh key={bi} castShadow>
          <tubeGeometry args={[b.curve, LITE ? 4 : 5, 0.012, LITE ? 4 : 6, false]} />
          <primitive object={MAT_PERSIAN_STEM} attach="material" />
        </mesh>
      ))}
      {/* Daun */}
      {leaves.map((l, i) => (
        <mesh
          key={i}
          geometry={PERSIAN_GEO}
          position={l.baseP}
          quaternion={l.q}
          scale={[l.wa * l.scale, l.scale, l.cup]}
          material={l.mat}
          castShadow
        />
      ))}
    </group>
  )
}

// ---- Plant info icon ----
// Ikon "i" kecil (sprite 2D di-bake, bukan geometry 3D) yang mengambang tipis
// di dekat/atas pot. Dipakai sebagai target aksi "info" dari LookControls:
// hover → kursor pointer, klik → membuka popup info tanaman (modal DOM).
const INFO_ICON_TEX = (() => {
  const s = 128
  const c = document.createElement("canvas")
  c.width = s
  c.height = s
  const ctx = c.getContext("2d")
  const r = s / 2
  const g = ctx.createLinearGradient(0, 0, 0, s)
  g.addColorStop(0, "#38bdf8")
  g.addColorStop(1, "#0e7490")
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(r, r, s * 0.34, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = "rgba(255,255,255,0.9)"
  ctx.lineWidth = 7
  ctx.beginPath()
  ctx.arc(r, r, s * 0.34, 0, Math.PI * 2)
  ctx.stroke()
  // Halo tipis supaya "mengambang" & terlihat jelas.
  ctx.strokeStyle = "rgba(56,189,248,0.35)"
  ctx.lineWidth = 10
  ctx.beginPath()
  ctx.arc(r, r, s * 0.48, 0, Math.PI * 2)
  ctx.stroke()
  // Huruf "i".
  ctx.fillStyle = "#ffffff"
  ctx.beginPath()
  ctx.arc(r, r - s * 0.13, s * 0.085, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillRect(r - s * 0.045, r - s * 0.03, s * 0.09, s * 0.28)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 2
  return tex
})()

export function PlantInfoIcon({ info, position = [0, 1.9, 0] }) {
  return (
    <group userData={{ action: { type: "info", info } }}>
      <Billboard position={position}>
        <mesh>
          <planeGeometry args={[0.2, 0.2]} />
          <meshBasicMaterial map={INFO_ICON_TEX} transparent depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      </Billboard>
    </group>
  )
}

function Plant({
  position,
  scale = 1,
  variant = "bush",
  flowerColor = "#38bdf8",
  potColor,
  potStyle,
  flowerType,
  info,
}) {
  const h = posHash(position)
  const style = resolveStyle(potStyle, h)
  const ftype = variant === "flower" ? resolveFlower(flowerType, h) : null
  // Per-stem head orientations (deterministic, varied per stem)
  const headTurns = [
    [0.25, h % 6.28, 0.15],
    [-0.2, ((h >>> 5) % 6.28), -0.12],
    [0.15, ((h >>> 9) % 6.28), 0.2],
  ]

  return (
    <group position={position} scale={scale}>
      {/* Soil disc shared by every pot style */}
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.23, 0.23, 0.03, 18]} />
        <primitive object={SOIL_MAT} attach="material" />
      </mesh>
      <Pot style={style} colorOverride={potColor} />

      {variant === "bush" && (
        <>
          <mesh position={[0, 0.55, 0]}>
            <cylinderGeometry args={[0.05, 0.09, 0.6, 10]} />
            <primitive object={PLANT_STEM_MAT} attach="material" />
          </mesh>
          {[[0.3, 0.5, 0.1], [-0.25, 0.6, 0.2], [0.05, 0.75, -0.2], [-0.15, 0.5, -0.25], [0.2, 0.7, 0.22]].map(
            (p, i) => (
              <mesh key={i} position={p}>
                <sphereGeometry args={[0.3, 12, 12]} />
                <primitive object={PLANT_LEAF_MAT} attach="material" />
              </mesh>
            ),
          )}
        </>
      )}

      {variant === "flower" && (
        <>
          {[[-0.18, 0, -0.05], [0.18, 0, 0.05], [0, 0, 0.12]].map((s, i) => (
            <mesh
              key={i}
              position={[s[0], 0.75, s[2]]}
              rotation={[s[2] * 0.6, 0, s[0] * 0.6]}
            >
              <cylinderGeometry args={[0.02, 0.035, 0.9, 6]} />
              <primitive object={PLANT_STEM_MAT} attach="material" />
            </mesh>
          ))}
          {ftype === "sunflower" ? (
            <>
              {/* one big bloom on the tallest stem, buds on the sides */}
              <group position={[0, 1.28, 0.12]} rotation={[0.2, headTurns[2][1], 0.1]} scale={1.15}>
                <FlowerHead type={ftype} color={flowerColor} />
              </group>
              {[[-0.2, 1.14, -0.1], [0.2, 1.1, 0.08]].map((p, i) => (
                <mesh key={i} position={p}>
                  <sphereGeometry args={[0.055, 10, 10]} />
                  <primitive object={PLANT_LEAF_DARK_MAT} attach="material" />
                </mesh>
              ))}
            </>
          ) : (
            headTurns.map((t, i) => (
              <group
                key={i}
                position={[[-0.2, 1.22, -0.1], [0.2, 1.18, 0.08], [0, 1.26, 0.15]][i]}
                rotation={[t[0], t[1], t[2]]}
                scale={ftype === "lavender" ? 0.95 : 1}
              >
                <FlowerHead type={ftype} color={flowerColor} />
              </group>
            ))
          )}
          {[[-0.28, 1.05, 0.02], [0.3, 1.0, 0.12]].map((p, i) => (
            <mesh key={i} position={p}>
              <sphereGeometry args={[0.07, 10, 10]} />
              <primitive object={PLANT_LEAF_MAT} attach="material" />
            </mesh>
          ))}
          {[[-0.16, 0.9, -0.02], [0.16, 0.86, 0.1]].map((p, i) => (
            <mesh key={i} position={p}>
              <sphereGeometry args={[0.09, 8, 8]} />
              <primitive object={PLANT_LEAF_MAT} attach="material" />
            </mesh>
          ))}
        </>
      )}

      {variant === "tall" && (
        <>
          <mesh position={[0, 1.1, 0]}>
            <cylinderGeometry args={[0.05, 0.09, 1.7, 10]} />
            <primitive object={PLANT_STEM_MAT} attach="material" />
          </mesh>
          {[[0, 1.35, 0], [0.12, 1.1, 0.1], [-0.12, 1.5, -0.1], [0.08, 1.7, 0.15]].map((p, i) => (
            <mesh key={i} position={p}>
              <sphereGeometry args={[0.34, 12, 12]} />
              <primitive object={PLANT_LEAF_MAT} attach="material" />
            </mesh>
          ))}
          <mesh position={[0, 2.0, 0]}>
            <sphereGeometry args={[0.3, 12, 12]} />
            <primitive object={PLANT_LEAF_DARK_MAT} attach="material" />
          </mesh>
        </>
      )}

      {variant === "topiary" && (
        <>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.04, 0.08, 0.55, 10]} />
            <primitive object={PLANT_STEM_MAT} attach="material" />
          </mesh>
          <mesh position={[0, 0.92, 0]}>
            <sphereGeometry args={[0.36, 16, 16]} />
            <primitive object={PLANT_LEAF_MAT} attach="material" />
          </mesh>
          <mesh position={[0, 1.18, 0]}>
            <sphereGeometry args={[0.26, 16, 16]} />
            <primitive object={PLANT_LEAF_DARK_MAT} attach="material" />
          </mesh>
        </>
      )}

      {variant === "leafy" && (
        <RubberPlant h={h} />
      )}

      {variant === "leafy" && info && (
        <PlantInfoIcon info={info} position={[0, 2.05, 0]} />
      )}

      {variant === "persian" && (
        <PersianFoliage h={h} />
      )}

      {variant === "persian" && info && (
        <PlantInfoIcon info={info} position={[0, 1.45, 0]} />
      )}
    </group>
  )
}

function Chandelier({ position, lit = 0.8, drop = 1.2 }) {
  return (
    <group position={position}>
      <mesh position={[0, drop / 2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, drop, 8]} />
        <meshStandardMaterial color="#223047" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.05, 0]} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[0.34, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#f3ecdf" roughness={0.85} />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <torusGeometry args={[0.34, 0.025, 8, 32]} />
        <meshStandardMaterial color="#d8cdb8" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.02, 0]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial
          color="#fff6e0"
          emissive="#ffd98a"
          emissiveIntensity={lit * 2.5}
        />
      </mesh>
    </group>
  )
}

function InfoPanel({ position, rotationY, entries = [] }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 1.0, -0.62]}>
        <boxGeometry args={[0.4, 0.12, 0.66]} />
        <meshStandardMaterial color="#223047" roughness={0.45} metalness={0.6} />
      </mesh>
      <mesh position={[0, 1.02, 0]}>
        <boxGeometry args={[1.75, 1.52, 0.07]} />
        <meshStandardMaterial color="#16283f" roughness={0.35} metalness={0.5} />
      </mesh>
      <mesh position={[0, 1.9, 0]}>
        <boxGeometry args={[1.75, 0.05, 0.07]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.2} />
      </mesh>
      <Text
        position={[0, 1.64, 0.04]}
        fontSize={0.2}
        color="#7dd3fc"
        anchorX="center"
        anchorY="middle"
        raycast={() => null}
        font="/fonts/Poppins-SemiBold.ttf"
      >
        RUANG KARYA
      </Text>
      {entries.map((e, i) => (
        <group key={i} position={[0, 1.12 - i * 0.42, 0.04]}>
          <mesh position={[-0.72, 0, 0]}>
            <boxGeometry args={[0.07, 0.07, 0.02]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.3} />
          </mesh>
          <Text
            position={[-0.62, 0, 0]}
            fontSize={0.17}
            color="#e2e8f0"
            anchorX="left"
            anchorY="middle"
            maxWidth={1.15}
            raycast={() => null}
            font="/fonts/Poppins-Medium.ttf"
          >
            {e.title}
          </Text>
          <Text
            position={[0.76, 0, 0]}
            fontSize={0.17}
            color="#93c5fd"
            anchorX="right"
            anchorY="middle"
            raycast={() => null}
            font="/fonts/Poppins-Medium.ttf"
          >
            {e.count}
          </Text>
        </group>
      ))}
    </group>
  )
}

function InfoKiosk({ position, rotationY, stats, categories = [], variant = "info" }) {
  const total = categories.reduce((s, c) => s + (stats?.[c.slug]?.total || 0), 0) || 49
  const catCount = categories.length || 7

  const cementColor = "#cbd5e1"
  const postColor = "#94a3b8"

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Cement Base */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[0.75, 0.1, 0.5]} />
        <meshStandardMaterial color={cementColor} roughness={0.75} />
      </mesh>
      {/* Cement Post */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <boxGeometry args={[0.14, 2.1, 0.1]} />
        <meshStandardMaterial color={postColor} roughness={0.8} />
      </mesh>
      {/* Cement Board Frame */}
      <mesh position={[0, 2.3, 0.03]} rotation={[-0.15, 0, 0]} castShadow>
        <boxGeometry args={[1.75, 2.1, 0.05]} />
        <meshStandardMaterial color={cementColor} roughness={0.75} />
      </mesh>

      {/* Board Panel + content (White background, Dark Navy text, Accent blue) */}
      <group position={[0, 2.3, 0.06]} rotation={[-0.15, 0, 0]}>
        <mesh>
          <planeGeometry args={[1.65, 2.0]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {variant === "guide" ? (
          <>
            {/* Guide Header */}
            <Text
              position={[0, 0.74, 0.01]}
              fontSize={0.2}
              color="#1F2A44"
              anchorX="center"
              anchorY="middle"
              maxWidth={1.5}
              raycast={() => null}
              font="/fonts/Poppins-SemiBold.ttf"
            >
              PANDUAN
            </Text>
            <Text
              position={[0, 0.58, 0.01]}
              fontSize={0.1}
              color="#3B82F6"
              anchorX="center"
              anchorY="middle"
              maxWidth={1.5}
              raycast={() => null}
              font="/fonts/Poppins-Medium.ttf"
            >
              Cara Menjelajah Museum
            </Text>

            <mesh position={[0, 0.42, 0.01]}>
              <planeGeometry args={[1.3, 0.015]} />
              <meshBasicMaterial color="#e2e8f0" />
            </mesh>

            <Text
              position={[-0.72, 0.34, 0.01]}
              fontSize={0.1}
              lineHeight={1.35}
              color="#1F2A44"
              anchorX="left"
              anchorY="top"
              maxWidth={1.5}
              raycast={() => null}
              font="/fonts/Poppins-Medium.ttf"
            >
              {[
                "Drag untuk melihat-lihat",
                "Tekan WASD / klik lantai untuk berjalan",
                "Klik lukisan untuk detail karya",
                "Lewati portal biru untuk pindah kategori",
              ]
                .map((item) => `•  ${item}`)
                .join("\n")}
            </Text>

            <Text
              position={[0, -0.7, 0.01]}
              fontSize={0.14}
              color="#3B82F6"
              anchorX="center"
              anchorY="middle"
              maxWidth={1.5}
              raycast={() => null}
              font="/fonts/Poppins-Medium.ttf"
            >
              Selamat menjelajah!
            </Text>
          </>
        ) : (
          <>
            {/* Info Header */}
            <Text
              position={[0, 0.74, 0.01]}
              fontSize={0.2}
              color="#1F2A44"
              anchorX="center"
              anchorY="middle"
              maxWidth={1.5}
              raycast={() => null}
              font="/fonts/Poppins-SemiBold.ttf"
            >
              SINGGAH
            </Text>
            <Text
              position={[0, 0.58, 0.01]}
              fontSize={0.1}
              color="#3B82F6"
              anchorX="center"
              anchorY="middle"
              maxWidth={1.5}
              raycast={() => null}
              font="/fonts/Poppins-Medium.ttf"
            >
              Virtual Exhibition
            </Text>

            <mesh position={[0, 0.42, 0.01]}>
              <planeGeometry args={[1.3, 0.015]} />
              <meshBasicMaterial color="#e2e8f0" />
            </mesh>

            <Text
              position={[0, 0.26, 0.01]}
              fontSize={0.12}
              color="#1F2A44"
              anchorX="center"
              anchorY="middle"
              maxWidth={1.5}
              raycast={() => null}
              font="/fonts/Poppins-Medium.ttf"
            >
              {`${total} Karya  ·  ${catCount} Kategori`}
            </Text>

            <mesh position={[0, 0.1, 0.01]}>
              <planeGeometry args={[1.3, 0.015]} />
              <meshBasicMaterial color="#e2e8f0" />
            </mesh>

            {[
              "Selamat datang di SINGGAH",
              "Virtual Exhibition",
              "karya Dosen & Mahasiswa.",
              "Masuki portal biru untuk",
              "menjelajahi setiap kategori.",
            ].map((line, i) => (
              <Text
                key={i}
                position={[0, -0.1 - i * 0.15, 0.01]}
                fontSize={0.1}
                lineHeight={1.35}
                color="#1F2A44"
                anchorX="center"
                anchorY="middle"
                maxWidth={1.45}
                raycast={() => null}
                font="/fonts/Poppins-Medium.ttf"
              >
                {line}
              </Text>
            ))}
          </>
        )}
      </group>
    </group>
  )
}

function WallSconce({ position, rotationY }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[0.16, 0.8, 0.04]} />
        <meshStandardMaterial color="#223047" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[0.08, 0.7, 0.05]} />
        <meshStandardMaterial color="#dff2ff" emissive="#38bdf8" emissiveIntensity={2.5} />
      </mesh>
    </group>
  )
}

function CCTV({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation} scale={1.6}>
      {/* Wall corner mounting bracket (sits in the corner) */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.1, 20]} />
        <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.75} />
      </mesh>
      {/* Short joint / neck */}
      <mesh position={[0, 0, 0.16]}>
        <sphereGeometry args={[0.055, 14, 14]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.85} />
      </mesh>
      {/* Bullet camera main body (tilted down into the room) */}
      <mesh position={[0, -0.16, 0.2]} rotation={[0.85, 0, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.13, 0.46, 24]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.25} metalness={0.15} />
      </mesh>
      {/* Camera sunshield hood */}
      <mesh position={[0, -0.06, 0.17]} rotation={[0.85, 0, 0]}>
        <boxGeometry args={[0.26, 0.035, 0.4]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.4} metalness={0.4} />
      </mesh>
      {/* Camera lens bezel front */}
      <mesh position={[0, -0.36, 0.38]} rotation={[0.85, 0, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.06, 20]} />
        <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.9} />
      </mesh>
      {/* Glass camera lens */}
      <mesh position={[0, -0.4, 0.4]} rotation={[0.85, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.03, 16]} />
        <meshStandardMaterial color="#0284c7" emissive="#38bdf8" emissiveIntensity={1.8} roughness={0.05} />
      </mesh>
      {/* Bright blinking recording LED */}
      <mesh position={[0.075, -0.2, 0.26]}>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={5} />
      </mesh>
    </group>
  )
}

export { Bench, Plant, Chandelier, InfoPanel, InfoKiosk, WallSconce, CCTV }
