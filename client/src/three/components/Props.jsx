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
              "Virtual Exhibition — pameran",
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
