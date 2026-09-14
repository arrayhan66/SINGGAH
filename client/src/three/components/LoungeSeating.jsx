import * as THREE from "three"
import { Plant, PlantInfoIcon } from "./Props"
import {
  LOUNGE_LAYOUT,
  LOUNGE_RADIUS,
  LOUNGE_TOPIARIES,
  TOPIARY_RADIUS,
  CHAIR_LOCAL_OFFSETS,
  loungeWorldPos,
  loungeRotationY,
} from "../utils/loungeLayout"

const WOOD = "#5a4028"
const FABRIC = "#3f5a7f"

// --- Echeveria Succulent (Tanaman Pot Kecil Meja Lounge) --------------------------------
// Daun tebal, gemuk, membulat di ujung (spoon-like). Rosette berlapis dari luar ke dalam.
// Gradasi hijau segar ke pink/ungu tipis di tepi daun via canvas texture prosedural.
function succulentLeafShape() {
  const s = new THREE.Shape()
  const len = 0.16
  const hw = 0.058
  s.moveTo(0, 0)
  s.bezierCurveTo(hw * 1.3, len * 0.2, hw * 1.5, len * 0.6, hw * 0.45, len * 0.9)
  s.bezierCurveTo(hw * 0.2, len * 1.02, -hw * 0.2, len * 1.02, -hw * 0.45, len * 0.9)
  s.bezierCurveTo(-hw * 1.5, len * 0.6, -hw * 1.3, len * 0.2, 0, 0)
  return s
}

const SUCC_LEAF_GEO = new THREE.ShapeGeometry(succulentLeafShape(), 6)

const SUCC_LEAF_TEX = (() => {
  const w = 128
  const h = 256
  const c = document.createElement("canvas")
  c.width = w
  c.height = h
  const ctx = c.getContext("2d")

  const grad = ctx.createLinearGradient(0, h, 0, 0)
  grad.addColorStop(0, "#426b48")
  grad.addColorStop(0.4, "#699e6b")
  grad.addColorStop(0.75, "#a6cf98")
  grad.addColorStop(1, "#dfa4b4") // soft blush pink/purple rim
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  for (let i = 0; i < 90; i++) {
    const x = Math.random() * w
    const y = Math.random() * h
    const r = 2 + Math.random() * 8
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.08)" : "rgba(30,70,40,0.08)"
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  const vein = ctx.createLinearGradient(w * 0.5, h * 0.95, w * 0.5, h * 0.1)
  vein.addColorStop(0, "rgba(200,230,190,0.3)")
  vein.addColorStop(1, "rgba(255,255,255,0)")
  ctx.strokeStyle = vein
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(w * 0.5, h * 0.92)
  ctx.lineTo(w * 0.5, h * 0.2)
  ctx.stroke()

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 2
  return tex
})()

const SUCC_MAT = new THREE.MeshStandardMaterial({
  map: SUCC_LEAF_TEX,
  roughness: 0.6,
  metalness: 0.05,
  side: THREE.DoubleSide,
})

const SOIL_TEX = (() => {
  const s = 128
  const c = document.createElement("canvas")
  c.width = s
  c.height = s
  const ctx = c.getContext("2d")
  ctx.fillStyle = "#4a3524"
  ctx.fillRect(0, 0, s, s)

  for (let i = 0; i < 180; i++) {
    const x = Math.random() * s
    const y = Math.random() * s
    const r = 1 + Math.random() * 3
    ctx.fillStyle = Math.random() > 0.75 ? (Math.random() > 0.5 ? "#d1d5db" : "#9ca3af") : (Math.random() > 0.5 ? "#382516" : "#5c432d")
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
})()

const SOIL_MAT = new THREE.MeshStandardMaterial({
  map: SOIL_TEX,
  roughness: 0.85,
})

const ECHEVERIA_LEAVES = [
  { y: 0.01, rx: 1.35, ry: 0, s: 1.05 },
  { y: 0.01, rx: 1.35, ry: 1.26, s: 1.0 },
  { y: 0.01, rx: 1.35, ry: 2.51, s: 1.02 },
  { y: 0.01, rx: 1.35, ry: 3.77, s: 1.0 },
  { y: 0.01, rx: 1.35, ry: 5.03, s: 1.03 },
  { y: 0.03, rx: 0.95, ry: 0.63, s: 0.85 },
  { y: 0.03, rx: 0.95, ry: 1.88, s: 0.82 },
  { y: 0.03, rx: 0.95, ry: 3.14, s: 0.85 },
  { y: 0.03, rx: 0.95, ry: 4.40, s: 0.82 },
  { y: 0.05, rx: 0.45, ry: 1.0, s: 0.55 },
  { y: 0.05, rx: 0.45, ry: 3.09, s: 0.52 },
  { y: 0.05, rx: 0.45, ry: 5.18, s: 0.55 },
]

const ECHEVERIA_INFO = {
  title: "Succulent (Echeveria)",
  text: "Tanaman hias kecil dengan daun tebal menyerupai kelopak bunga, dikenal sangat tahan kekeringan. Melambangkan kesederhanaan, ketahanan, dan efisiensi — cocok sebagai simbol kerja cerdas yang tidak butuh banyak sumber daya untuk tetap bertumbuh.",
}

function TablePlant() {
  return (
    <group position={[0, 0.88, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.11, 0.07, 0.22, 16]} />
        <meshStandardMaterial color="#e8e4dc" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.115, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.02, 16]} />
        <primitive object={SOIL_MAT} attach="material" />
      </mesh>
      <group position={[0, 0.125, 0]}>
        {ECHEVERIA_LEAVES.map((l, i) => (
          <mesh
            key={i}
            geometry={SUCC_LEAF_GEO}
            material={SUCC_MAT}
            position={[0, l.y, 0]}
            rotation={[l.rx, l.ry, 0]}
            scale={l.s}
            castShadow
          />
        ))}
      </group>
      <PlantInfoIcon info={ECHEVERIA_INFO} position={[0, 0.35, 0]} />
    </group>
  )
}

function TableLamp() {
  return (
    <group position={[0, 0.88, 0]}>
      <mesh>
        <cylinderGeometry args={[0.15, 0.17, 0.05, 16]} />
        <meshStandardMaterial color="#8a5a2b" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.46, 0]}>
        <cylinderGeometry args={[0.03, 0.05, 0.88, 12]} />
        <meshStandardMaterial color="#6b4f2f" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.63, 0]}>
        <cylinderGeometry args={[0.24, 0.3, 0.32, 16]} />
        <meshStandardMaterial color="#f5d488" emissive="#ffd98a" emissiveIntensity={1.6} />
      </mesh>
    </group>
  )
}

function Table({ lamp = false }) {
  return (
    <group>
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.85, 0.85, 0.09, 32]} />
        <meshStandardMaterial color={WOOD} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.12, 0.17, 0.78, 16]} />
        <meshStandardMaterial color={WOOD} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.045, 0]}>
        <cylinderGeometry args={[0.5, 0.55, 0.09, 24]} />
        <meshStandardMaterial color={WOOD} roughness={0.55} />
      </mesh>
      {lamp ? <TableLamp /> : <TablePlant />}
    </group>
  )
}

function Chair({ position, rotation }) {
  return (
    <group position={position} rotation={rotation} userData={{ action: { type: "sit" } }}>
      {[
        [-0.33, 0, -0.28],
        [0.33, 0, -0.28],
        [-0.33, 0, 0.28],
        [0.33, 0, 0.28],
      ].map((p, i) => (
        <mesh key={i} position={[p[0], 0.28, p[2]]} castShadow>
          <boxGeometry args={[0.11, 0.56, 0.11]} />
          <meshStandardMaterial color={WOOD} roughness={0.55} />
        </mesh>
      ))}
      <mesh position={[0, 0.56, 0]} castShadow>
        <boxGeometry args={[0.95, 0.12, 0.85]} />
        <meshStandardMaterial color={FABRIC} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.62, 0.03]}>
        <boxGeometry args={[0.86, 0.08, 0.72]} />
        <meshStandardMaterial color="#e9eef6" roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.0, -0.38]} castShadow>
        <boxGeometry args={[0.95, 0.9, 0.11]} />
        <meshStandardMaterial color={FABRIC} roughness={0.9} />
      </mesh>
      <mesh position={[-0.53, 0.8, 0]}>
        <boxGeometry args={[0.11, 0.36, 0.82]} />
        <meshStandardMaterial color={WOOD} roughness={0.55} />
      </mesh>
      <mesh position={[0.53, 0.8, 0]}>
        <boxGeometry args={[0.11, 0.36, 0.82]} />
        <meshStandardMaterial color={WOOD} roughness={0.55} />
      </mesh>
    </group>
  )
}

function LoungeSeating() {
  return (
    <group>
      {LOUNGE_LAYOUT.map((g, i) => {
        const pos = loungeWorldPos(g.angle, LOUNGE_RADIUS)
        const ry = loungeRotationY(g.angle)
        return (
          <group key={i} position={pos} rotation={[0, ry, 0]}>
            <Table lamp={g.lamp} />
            {CHAIR_LOCAL_OFFSETS.map(([cx, cz], j) => (
              <Chair
                key={j}
                position={[cx, 0, cz]}
                rotation={cx > 0 ? [0, -Math.PI / 2, 0] : [0, Math.PI / 2, 0]}
              />
            ))}
          </group>
        )
      })}

      {LOUNGE_TOPIARIES.map((a, i) => {
        const [x, , z] = loungeWorldPos(a, TOPIARY_RADIUS)
        return (
          <Plant
            key={`t-${i}`}
            position={[x, 0, z]}
            variant="persian"
            potStyle="vase"
            scale={0.9}
            info={{
              title: "Persian Shield (Strobilanthes dyerianus)",
              text: "Tanaman hias asal Asia Tenggara dengan daun ungu metalik ikonik. Melambangkan keanggunan, kreativitas, dan keunikan — sering digunakan untuk mempercantik ruang dengan sentuhan warna yang berani namun elegan.",
            }}
          />
        )
      })}
    </group>
  )
}

export default LoungeSeating
