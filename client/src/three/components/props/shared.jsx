import * as THREE from "three"
import { useQualityStore, isMobile, getAnisotropy } from "../../hooks/useQuality"

// Mode ringan (HP/layar kecil atau device rendah): daun & potongan dedaunan
// memakai geometri dan sampling lebih hemat tapi tetap tajam, karena jumlah
// segmen serendah ini tak terlihat pada ukuran daun di layar.
const LITE = isMobile() || useQualityStore.getState().tier === "rendah"

// ---- Shared plant materials (hoisted so every plant reuses them) ----
const SOIL_MAT = new THREE.MeshStandardMaterial({ color: "#3b2a1a", roughness: 1 })
const PLANT_STEM_MAT = new THREE.MeshStandardMaterial({ color: "#3a3322", roughness: 0.7 })
const PLANT_LEAF_MAT = new THREE.MeshStandardMaterial({ color: "#3a6a5a", roughness: 0.85 })
const PLANT_LEAF_DARK_MAT = new THREE.MeshStandardMaterial({ color: "#2f5f4f", roughness: 0.85 })

// ---- Potted tropical leaf plant (textured, canvas-generated leaves) ----
// Instead of smooth primitive blobs we bake realistic foliage onto alpha-mapped
// planes: gradient green, mottling, midrib + side veins, gloss sheen and even
// lime colour-breaks (variegation). Three different textures drive variety.
function makeLeafCanvas({ base, tip, vein, variegate = false, variegateRGB = "216,234,158", boldVeins = false, seed = 7, lance = false, lanceW = 0.3, wavy = false, sheenRGB = "255,255,255" }) {
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
    // petiole junction, with a gentle waved margin when 'wavy'. lanceW = rasio
    // lebar maksimum terhadap tinggi (0.3 ramping ~rumput, 0.5 lanset lebar).
    const cx = w * 0.5
    const hm = lanceW * w
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
  tex.anisotropy = getAnisotropy()
  return tex
}

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

const POT_STYLES = [
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
const FLOWER_TYPES = ["daisy", "tulip", "lavender", "sunflower", "orchid"]

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
  tex.anisotropy = getAnisotropy()
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
export { LITE, SOIL_MAT, PLANT_STEM_MAT, PLANT_LEAF_MAT, PLANT_LEAF_DARK_MAT, makeLeafCanvas, leafQuat, getAnisotropy, POT_STYLES, FLOWER_TYPES, PMat, Pot, posHash, resolveStyle, resolveFlower }
