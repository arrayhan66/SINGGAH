import { Text } from "@react-three/drei"
import * as THREE from "three"

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
function makeLeafCanvas({ base, tip, vein, variegate = false, variegateRGB = "216,234,158", boldVeins = false, seed = 7 }) {
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
    ctx.moveTo(w * 0.5, h * 0.98) // petiole junction (base)
    ctx.bezierCurveTo(w * 0.8, h * 0.9, w * 0.96, h * 0.55, w * 0.8, h * 0.13)
    ctx.bezierCurveTo(w * 0.7, h * 0.02, w * 0.3, h * 0.02, w * 0.2, h * 0.13)
    ctx.bezierCurveTo(w * 0.04, h * 0.55, w * 0.2, h * 0.9, w * 0.5, h * 0.98)
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

  // glossy sheen band (stronger, for a polished 3D-render finish)
  const sheen = ctx.createLinearGradient(w * 0.04, 0, w * 0.56, 0)
  sheen.addColorStop(0, "rgba(255,255,255,0.4)")
  sheen.addColorStop(0.4, "rgba(255,255,255,0.07)")
  sheen.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = sheen
  ctx.beginPath()
  ctx.ellipse(w * 0.22, h * 0.42, w * 0.26, h * 0.4, -0.2, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

const LEAF_TEX_A = makeLeafCanvas({ base: "#1a4a2e", tip: "#4f9a5e", vein: "rgba(10,44,24,0.4)", seed: 11 })
const LEAF_TEX_B = makeLeafCanvas({ base: "#1f5c38", tip: "#63ac6d", vein: "rgba(14,52,28,0.35)", seed: 37 })
const LEAF_TEX_C = makeLeafCanvas({ base: "#2c7a44", tip: "#8cc66f", vein: "rgba(20,60,34,0.3)", variegate: true, seed: 73 })

const MAT_LEAF_A = new THREE.MeshStandardMaterial({ map: LEAF_TEX_A, alphaTest: 0.5, roughness: 0.26, metalness: 0.04, side: THREE.DoubleSide, emissive: new THREE.Color("#0d1f13"), emissiveIntensity: 0.18 })
const MAT_LEAF_B = new THREE.MeshStandardMaterial({ map: LEAF_TEX_B, alphaTest: 0.5, roughness: 0.3, metalness: 0.04, side: THREE.DoubleSide, emissive: new THREE.Color("#11260f"), emissiveIntensity: 0.18 })
const MAT_LEAF_C = new THREE.MeshStandardMaterial({ map: LEAF_TEX_C, alphaTest: 0.5, roughness: 0.32, metalness: 0.04, side: THREE.DoubleSide, emissive: new THREE.Color("#173011"), emissiveIntensity: 0.18 })
const MAT_TRUNK = new THREE.MeshStandardMaterial({ color: "#2f2a22", roughness: 0.7 })
const MAT_TRUNK_DS = new THREE.MeshStandardMaterial({ color: "#2f2a22", roughness: 0.7, side: THREE.DoubleSide })
// ---- Persian Shield (Strobilanthes dyerianus) iridescent purple foliage ----
const PERSIAN_TEX_A = makeLeafCanvas({ base: "#3c1f4e", tip: "#7c4f98", vein: "rgba(140,225,110,0.85)", boldVeins: true, seed: 101 })
const PERSIAN_TEX_B = makeLeafCanvas({ base: "#45264e", tip: "#9a6fae", vein: "rgba(150,230,120,0.85)", boldVeins: true, seed: 137 })
const PERSIAN_TEX_C = makeLeafCanvas({ base: "#583270", tip: "#b48cc4", vein: "rgba(160,235,130,0.85)", boldVeins: true, variegate: true, variegateRGB: "190,160,220", seed: 173 })

const MAT_PERSIAN_A = new THREE.MeshStandardMaterial({ map: PERSIAN_TEX_A, alphaTest: 0.5, roughness: 0.22, metalness: 0.36, side: THREE.DoubleSide, emissive: new THREE.Color("#250c33"), emissiveIntensity: 0.2 })
const MAT_PERSIAN_B = new THREE.MeshStandardMaterial({ map: PERSIAN_TEX_B, alphaTest: 0.5, roughness: 0.24, metalness: 0.36, side: THREE.DoubleSide, emissive: new THREE.Color("#2c0f3d"), emissiveIntensity: 0.2 })
const MAT_PERSIAN_C = new THREE.MeshStandardMaterial({ map: PERSIAN_TEX_C, alphaTest: 0.5, roughness: 0.26, metalness: 0.36, side: THREE.DoubleSide, emissive: new THREE.Color("#36144d"), emissiveIntensity: 0.2 })

// Leaf plane, bowed along its length so blades cup naturally (alpha map gives
// the silhouette). BASE is pinned to the ORIGIN (y = 0) and the tip points at
// +Y (y = 1) — so placing the mesh at a position pins the leaf's ATTACHMENT
// POINT there, not the sheet's middle. The texture's base (v = 0) matches the
// plane's bottom edge, tip (v = 1) matches +Y, so mapping stays correct.
const LEAF_GEO = (() => {
  const len = 1.0
  const geo = new THREE.PlaneGeometry(0.86, len, 6, 20)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    const t = (y + len / 2) / len // 0 at base .. 1 at tip (pre-shift)
    pos.setY(i, y + len / 2) // shift so base lands on y = 0, tip on y = 1
    pos.setZ(i, Math.sin(Math.PI * t) * -0.12) // soft cup for a fleshy blade
  }
  geo.computeVertexNormals()
  return geo
})()

// Persian Shield geometry (slightly narrower lanceolate/ovate blade)
const PERSIAN_GEO = (() => {
  const len = 1.0
  const geo = new THREE.PlaneGeometry(0.66, len, 6, 20)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    const t = (y + len / 2) / len
    pos.setY(i, y + len / 2)
    pos.setZ(i, Math.sin(Math.PI * t) * -0.14)
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

// THREE.Vector3 tidak memiliki method .slerp (hanya Quaternion yang punya).
// Fungsi ini memberikan interpolasi spherical antar dua vektor satuan arah
// dengan mengubah rotasi a→b menjadi quaternion lalu slerp dari identitas.
function slerpUnitVectors(a, b, t) {
  const id = new THREE.Quaternion()
  const q = new THREE.Quaternion().setFromUnitVectors(a.normalize(), b.normalize())
  id.slerp(q, t)
  return a.clone().applyQuaternion(id)
}

// Transitional collar between the round petiole and the leaf base. The bottom
// ring is the petiole's own circle (radius = stemR, placed just before the
// tube's end so the round cut is hidden); the top ring is a flattened ellipse
// sized from the leaf's REAL base width (halfW * 0.8 along the blade width,
// paper-thin along the blade face), tucked just behind the blade plane so the
// sheet appears to grow out of it. The loft morphs circle → flat ellipse with a
// smoothstep flare, producing petiole bulat → mengecil → melebar/pipih → base
// daun, all in one continuous piece.
function makeLeafCollar({ bC, tangDir, shankTop, bladeX, bladeZ, stemR, halfW, slotDepth }) {
  const rings = 7
  const sides = 16
  const n0 = tangDir.clone().normalize()
  const n1 = bladeZ
  let U0 = new THREE.Vector3().crossVectors(n0, new THREE.Vector3(0, 1, 0))
  if (U0.lengthSq() < 1e-6) U0 = new THREE.Vector3().crossVectors(n0, new THREE.Vector3(1, 0, 0))
  U0.normalize()
  const U1 = bladeX
  const a0 = stemR
  const a1 = Math.max(halfW * 0.68, stemR * 1.5)
  const b0 = stemR
  const b1 = slotDepth

  const pos = []
  const idx = []
  for (let r = 0; r <= rings; r++) {
    const t = r / rings
    const C = new THREE.Vector3().lerpVectors(bC, shankTop, t)
    const n = slerpUnitVectors(n0, n1, t).normalize()
    const U = slerpUnitVectors(U0, U1, t).normalize()
    const V = new THREE.Vector3().crossVectors(n, U).normalize()
    U.crossVectors(V, n).normalize()
    const e = t * t * (3 - 2 * t) // smoothstep: stay slim, flare at the very top
    const a = a0 + (a1 - a0) * e
    const b = b0 + (b1 - b0) * t
    for (let s = 0; s <= sides; s++) {
      const th = (s / sides) * Math.PI * 2
      pos.push(
        C.x + Math.cos(th) * U.x * a + Math.sin(th) * V.x * b,
        C.y + Math.cos(th) * U.y * a + Math.sin(th) * V.y * b,
        C.z + Math.cos(th) * U.z * a + Math.sin(th) * V.z * b,
      )
    }
  }
  const row = sides + 1
  for (let r = 0; r < rings; r++) {
    for (let s = 0; s < sides; s++) {
      const a = r * row + s
      const c = (r + 1) * row + s + 1
      idx.push(a, a + 1, c, a, c, c - 1)
    }
  }
  // Caps: bottom vanishes inside the petiole area, top tucks behind the blade.
  const bt = (rings + 1) * row
  const tp = bt + 1
  pos.push(bC.x, bC.y, bC.z, shankTop.x, shankTop.y, shankTop.z)
  for (let s = 0; s < sides; s++) {
    idx.push(bt, s, s + 1)
    idx.push(rings * row + s, rings * row + s + 1, tp)
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3))
  geo.setIndex(idx)
  geo.computeVertexNormals()
  return geo
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

// A potted tropical broad-leaf plant grown from a single clump. Instead of a
// perfect radial fan, every leaf carries an explicit, hand-placed pose from an
// intentionally asymmetric set: outer leaves lean far outward (some nearly
// horizontal, some nodding under their weight), middle leaves fill the crown
// more upright, and young leaves shoot almost vertically from the crown's top
// centre. Petiole length/bend, blade panel, cup depth and face orientation all
// vary per leaf; only a small seed-based jitter separates one plant from the
// next, so the pair flanking the hologram reads organic but related. Every
// blade's broad face is spun to face outward from the clump, so no leaf shows
// its back dead-black to the hall lights.
function Foliage({ h }) {
  const leafMats = [MAT_LEAF_A, MAT_LEAF_B, MAT_LEAF_C]
  const j = (seed) => {
    const x = Math.sin((h % 1000) * 0.31 + seed * 12.9898) * 43758.5453
    return x - Math.floor(x)
  }
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

  // yaw (world azimuth), reach (horizontal throw), height (petiole tip Y),
  // bend (arc push-out), open (blade angle from vertical, rad — bigger = more
  // horizontal), scale, wa (width ratio), cup (deep). Hand-placed, asymmetric,
  // and dense: a rounded lush dome like a 3D-rendered houseplant, with low
  // spread blades low-down, taller upright blades filling the centre, and a
  // few young ones on top.
  const LEAVES = [
    // --- lower spread (widest part of the dome) ---
    { yaw: -2.75, reach: 0.5, height: 0.6, bend: 0.26, open: 1.12, scale: 1.0, wa: 1.04, cup: 1.0 },
    { yaw: -1.5, reach: 0.52, height: 0.56, bend: 0.32, open: 1.22, scale: 1.06, wa: 1.1, cup: 1.12 },
    { yaw: -0.25, reach: 0.48, height: 0.66, bend: 0.28, open: 1.0, scale: 0.92, wa: 0.96, cup: 0.9 },
    { yaw: 0.95, reach: 0.54, height: 0.58, bend: 0.34, open: 1.25, scale: 1.08, wa: 1.12, cup: 1.18 },
    { yaw: 2.2, reach: 0.46, height: 0.68, bend: 0.24, open: 0.95, scale: 0.9, wa: 0.98, cup: 0.95 },
    { yaw: 3.4, reach: 0.5, height: 0.62, bend: 0.3, open: 1.15, scale: 1.0, wa: 1.02, cup: 1.06 },
    { yaw: 4.2, reach: 0.42, height: 0.74, bend: 0.2, open: 0.85, scale: 0.8, wa: 0.9, cup: 0.88 },
    // --- upright fillers (dome's body) ---
    { yaw: -1.95, reach: 0.3, height: 0.98, bend: 0.16, open: 0.62, scale: 0.8, wa: 0.96, cup: 0.95 },
    { yaw: -0.35, reach: 0.34, height: 0.92, bend: 0.2, open: 0.72, scale: 0.86, wa: 1.02, cup: 1.0 },
    { yaw: 1.6, reach: 0.28, height: 1.05, bend: 0.14, open: 0.55, scale: 0.74, wa: 0.92, cup: 0.9 },
    { yaw: 3.15, reach: 0.32, height: 0.98, bend: 0.18, open: 0.66, scale: 0.82, wa: 0.98, cup: 0.98 },
    // --- young crown (top centre) ---
    { yaw: 0.45, reach: 0.15, height: 1.24, bend: 0.08, open: 0.3, scale: 0.56, wa: 0.92, cup: 0.8 },
    { yaw: 2.3, reach: 0.13, height: 1.32, bend: 0.07, open: 0.22, scale: 0.5, wa: 0.85, cup: 0.74 },
    { yaw: 4.0, reach: 0.16, height: 1.18, bend: 0.1, open: 0.38, scale: 0.6, wa: 0.95, cup: 0.84 },
  ]

  const up = new THREE.Vector3(0, 1, 0)

  return (
    <group position={[0, 0.32, 0]}>
      {LEAVES.map((base, idx) => {
        // Deterministic micro-jitter so the two flanking plants differ subtly.
        const yaw = base.yaw + (j(idx + 61) - 0.5) * 0.28
        const openness = clamp(base.open + (j(idx + 62) - 0.5) * 0.12, 0.08, 1.52)
        const scale = base.scale * (0.96 + j(idx + 63) * 0.08)
        const height = base.height + (j(idx + 64) - 0.5) * 0.08
        const reach = base.reach * (0.96 + j(idx + 65) * 0.08)
        const bend = base.bend * (0.9 + j(idx + 66) * 0.2)
        const spinJit = (j(idx + 67) - 0.5) * 1.2
        const wa = base.wa * (0.97 + j(idx + 68) * 0.06)
        const cup = base.cup
        const stemR = 0.014 + scale * 0.007

        // Petiole bases come from a slightly scattered crown point, not one
        // clean centre — one more reason it reads as a real clump.
        const ox = (j(idx + 69) - 0.5) * 0.05
        const oz = (j(idx + 70) - 0.5) * 0.05
        const oy = 0.04 + j(idx + 71) * 0.03
        const p0 = new THREE.Vector3(ox, oy, oz)
        const O = Math.sin(yaw)
        const A = Math.cos(yaw)
        const radial = new THREE.Vector3(O, 0, A).normalize()
        const tip = new THREE.Vector3(ox + O * reach, height, oz + A * reach)
        const mid = p0.clone().lerp(tip, 0.5).add(radial.clone().multiplyScalar(bend)).add(new THREE.Vector3(0, 0.12, 0))
        const curve = new THREE.QuadraticBezierCurve3(p0, mid, tip)

        const tang = curve.getTangent(1)
        const attach = new THREE.Vector3(tip.x - tang.x * 0.03, tip.y - tang.y * 0.03, tip.z - tang.z * 0.03)

        // Blade attitude, role-driven: lean from vertical along this leaf's
        // azimuth; a couple of leaves also nod in/out of that plane slightly.
        const leafDir = up.clone().multiplyScalar(Math.cos(openness)).add(radial.clone().multiplyScalar(Math.sin(openness)))
        leafDir.add(new THREE.Vector3((j(idx + 72) - 0.5) * 0.16, 0, (j(idx + 73) - 0.5) * 0.16))
        leafDir.normalize()

        // Orient the blade's length axis (+Y) onto leafDir via a quaternion.
        const q0 = new THREE.Quaternion().setFromUnitVectors(up, leafDir)
        // Then spin the broad FACE to aim outward (radial, slight up bias) so
        // every leaf presents its lit face to the room; the jitter only fans it
        // a little, never exposing a dead-black reverse side.
        const fn0 = new THREE.Vector3(0, 0, 1).applyQuaternion(q0)
        const faceTarget = radial.clone().multiplyScalar(0.92).add(up.clone().multiplyScalar(0.39)).normalize()
        const t = faceTarget.clone().addScaledVector(leafDir, -faceTarget.dot(leafDir))
        if (t.lengthSq() > 1e-6) t.normalize()
        const cross = new THREE.Vector3().crossVectors(fn0, t)
        const faceSpin = Math.atan2(cross.dot(leafDir), fn0.dot(t))
        const q = q0.multiply(new THREE.Quaternion().setFromAxisAngle(up, faceSpin + spinJit))

        const mat = leafMats[(idx + (h >>> 5)) % 3]

        // Collar sized from the ACTUAL leaf base width, always landing on the
        // joint (kept from the previous attachment fix).
        const halfW = 0.43 * wa * scale
        const slotDepth = Math.max(stemR * 1.1, 0.014)
        const bladeX = new THREE.Vector3(1, 0, 0).applyQuaternion(q)
        const bladeZ = new THREE.Vector3(0, 0, 1).applyQuaternion(q)
        const bC = curve.getPoint(0.97)
        const shankTop = attach.clone().addScaledVector(bladeZ, -0.015)
        const collarGeo = makeLeafCollar({
          bC,
          tangDir: tang,
          shankTop,
          bladeX,
          bladeZ,
          stemR,
          halfW,
          slotDepth,
        })

        return (
          <group key={idx}>
            {/* Petiole */}
            <mesh castShadow>
              <tubeGeometry args={[curve, 9, stemR, 6, false]} />
              <primitive object={MAT_TRUNK} attach="material" />
            </mesh>
            {/* Petiole → leaf transition (round end flares into the leaf base) */}
            <mesh geometry={collarGeo} material={MAT_TRUNK_DS} castShadow />
            {/* Textured blade, base pinned at the petiole tip */}
            <group position={[attach.x, attach.y, attach.z]} quaternion={q}>
              <mesh geometry={LEAF_GEO} material={mat} scale={[wa * scale, scale, cup]} castShadow />
            </group>
          </group>
        )
      })}
    </group>
  )
}

// Persian Shield (Strobilanthes dyerianus) houseplant variant: short robust
// stems with clustered iridescent purple/silver-green veined leaves.
function PersianFoliage({ h }) {
  const leafMats = [MAT_PERSIAN_A, MAT_PERSIAN_B, MAT_PERSIAN_C]
  const j = (seed) => {
    const x = Math.sin((h % 1000) * 0.31 + seed * 12.9898) * 43758.5453
    return x - Math.floor(x)
  }
  const clamp = (v, a, b) => Math.min(b, Math.max(a, b))

  const stems = [
    { yaw: -2.6, reach: 0.2, height: 0.64, bend: 0.14 },
    { yaw: -1.0, reach: 0.24, height: 0.54, bend: 0.2 },
    { yaw: 0.4, reach: 0.16, height: 0.68, bend: 0.1 },
    { yaw: 1.9, reach: 0.22, height: 0.58, bend: 0.17 },
    { yaw: 3.5, reach: 0.26, height: 0.48, bend: 0.22 },
  ]

  const up = new THREE.Vector3(0, 1, 0)

  return (
    <group position={[0, 0.32, 0]}>
      {stems.map((s, si) => {
        const yaw = s.yaw + (j(si + 11) - 0.5) * 0.35
        const reach = s.reach * (0.9 + j(si + 12) * 0.2)
        const height = s.height + (j(si + 13) - 0.5) * 0.1
        const bend = s.bend * (0.8 + j(si + 14) * 0.4)
        const O = Math.sin(yaw)
        const A = Math.cos(yaw)
        const ox = (j(si + 15) - 0.5) * 0.04
        const oz = (j(si + 16) - 0.5) * 0.04
        const p0 = new THREE.Vector3(ox, 0.04, oz)
        const tip = new THREE.Vector3(ox + O * reach, height, oz + A * reach)
        const radial = new THREE.Vector3(O, 0, A).normalize()
        const mid = p0.clone().lerp(tip, 0.5).add(radial.clone().multiplyScalar(bend)).add(new THREE.Vector3(0, 0.08, 0))
        const curve = new THREE.QuadraticBezierCurve3(p0, mid, tip)
        const stemR = 0.013 + j(si + 17) * 0.005

        // Each stem carries 3 leaves: two opposite side leaves lower down, and one terminal at tip
        const leafDefs = [
          { t: 0.62, azOffset: 0.85, openness: 0.72, scale: 0.72, wa: 0.95 },
          { t: 0.62, azOffset: -0.85, openness: 0.78, scale: 0.68, wa: 0.9 },
          { t: 0.985, azOffset: 0, openness: 0.38, scale: 0.82, wa: 1.02 },
        ]

        return (
          <group key={si}>
            {/* Stem tube */}
            <mesh castShadow>
              <tubeGeometry args={[curve, 8, stemR, 6, false]} />
              <primitive object={MAT_TRUNK} attach="material" />
            </mesh>

            {leafDefs.map((ld, li) => {
              const lId = si * 3 + li
              const leafYaw = yaw + ld.azOffset + (j(lId + 30) - 0.5) * 0.2
              const lO = Math.sin(leafYaw), lA = Math.cos(leafYaw)
              const lRadial = new THREE.Vector3(lO, 0, lA).normalize()
              const pt = curve.getPoint(ld.t)
              const tang = curve.getTangent(ld.t)
              const attach = new THREE.Vector3(pt.x - tang.x * 0.02, pt.y - tang.y * 0.02, pt.z - tang.z * 0.02)

              const openness = clamp(ld.openness + (j(lId + 40) - 0.5) * 0.15, 0.15, 1.25)
              const leafDir = up.clone().multiplyScalar(Math.cos(openness)).add(lRadial.clone().multiplyScalar(Math.sin(openness))).normalize()

              const spinJit = (j(lId + 50) - 0.5) * 0.9
              const q = leafQuat(leafDir, lRadial, spinJit)

              const scale = ld.scale * (0.94 + j(lId + 60) * 0.12)
              const wa = ld.wa * (0.95 + j(lId + 70) * 0.1)
              const cup = 0.9 + j(lId + 80) * 0.3
              const mat = leafMats[(lId + (h >>> 4)) % 3]

              const halfW = 0.33 * wa * scale
              const slotDepth = Math.max(stemR * 1.1, 0.014)
              const bladeX = new THREE.Vector3(1, 0, 0).applyQuaternion(q)
              const bladeZ = new THREE.Vector3(0, 0, 1).applyQuaternion(q)
              const bC = curve.getPoint(Math.max(0, ld.t - 0.04))
              const shankTop = attach.clone().addScaledVector(bladeZ, -0.012)
              const collarGeo = makeLeafCollar({
                bC,
                tangDir: tang,
                shankTop,
                bladeX,
                bladeZ,
                stemR,
                halfW,
                slotDepth,
              })

              return (
                <group key={li}>
                  <mesh geometry={collarGeo} material={MAT_TRUNK_DS} castShadow />
                  <group position={[attach.x, attach.y, attach.z]} quaternion={q}>
                    <mesh geometry={PERSIAN_GEO} material={mat} scale={[wa * scale, scale, cup]} castShadow />
                  </group>
                </group>
              )
            })}
          </group>
        )
      })}
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
        <Foliage h={h} />
      )}

      {variant === "persian" && (
        <PersianFoliage h={h} />
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
