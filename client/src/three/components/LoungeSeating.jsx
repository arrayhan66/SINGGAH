import * as THREE from "three"
import { useLayoutEffect, useMemo, useRef } from "react"
import { Plant, PlantInfoIcon } from "./Props"
import { RealBook } from "./HomeDecor"
import { getRandomUniqueBookKeys } from "../utils/bookCovers"
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

// --- Pothos Mini (Epipremnum aureum) — Tanaman Pot Kecil Meja Lounge -------------------------
// STRUKTUR & PENDEKATAN SAMA PERSIS dengan Rubber Plant yang berhasil:
//   • tiap daun = 1 geometri plane low-poly dengan lipatan halus di sepanjang urat tengah
//     (base pinned y=0, tip di +Y = 1); dipasang lewat instancedMesh.
//   • tiap daun INDIVIDUAL menempel di SATU titik pada KETINGGIAN masing-masing di sepanjang
//     batang pendek (BUKAN radial/rosette mengelilingi 1 titik — beda dari succulent).
//   • tekstur daun di-bake di canvas: bentuk oval-HATI (panjang:lebar ≈ 1.2:1, hampir bulat),
//     ujung sedikit meruncing.
//   • mayoritas daun hijau segar #4A8C5C; 2-3 daun variegated bermotif kuning-hijau pucat.
//   • batang pendek & tipis, hijau kecoklatan, 5 titik tumbuh; daun pangkal lebih besar → pucuk
//     lebih kecil. Semua pangkal daun berada di atas rim pot (tidak menembus dinding pot).

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

// Helai daun pothos: oval-hati (panjang:lebar ≈ 1.2:1, hampir bulat), pangkal agak
// terbelah, ujung runcing halus. Digambar di canvas (alphaTest, seperti Rubber Plant).
// variegated = true → motif marmer kuning-hijau pucat, false → hijau solid #4A8C5C.
function drawPothosTile(variegated) {
  const W = 256
  const H = 300
  const c = document.createElement("canvas")
  c.width = W
  c.height = H
  const ctx = c.getContext("2d")
  const cx = 128

  // Siluet heart-ovate: ujung di atas (y kecil), pangkal terbelah lembut di bawah.
  const silhouette = () => {
    ctx.beginPath()
    ctx.moveTo(cx, 22)
    ctx.bezierCurveTo(cx + 66, 34, cx + 112, 114, cx + 106, 168)
    ctx.bezierCurveTo(cx + 100, 212, cx + 64, 244, cx + 48, 256)
    ctx.quadraticCurveTo(cx, 250, cx - 48, 256)
    ctx.bezierCurveTo(cx - 64, 244, cx - 100, 212, cx - 106, 168)
    ctx.bezierCurveTo(cx - 112, 114, cx - 66, 34, cx, 22)
    ctx.closePath()
  }

  silhouette()
  if (variegated) {
    const g = ctx.createLinearGradient(0, 22, 0, 262)
    g.addColorStop(0, "#4c945e")
    g.addColorStop(0.45, "#478a58")
    g.addColorStop(1, "#3f7d50")
    ctx.fillStyle = g
    ctx.fill()

    ctx.save()
    silhouette()
    ctx.clip()
    // Bercak marmer kuning-hijau pucat yang lembut; posisi deterministik (natural namun stabil).
    const blobs = [
      [44, 120, 55],
      [150, 96, 48],
      [126, 196, 66],
      [186, 150, 38],
      [30, 190, 34],
    ]
    for (let i = 0; i < blobs.length; i++) {
      const [bx, by, br] = blobs[i]
      const rg = ctx.createRadialGradient(bx, by, br * 0.1, bx, by, br)
      rg.addColorStop(0, "rgba(222,238,180,0.95)")
      rg.addColorStop(1, "rgba(214,232,168,0)")
      ctx.fillStyle = rg
      ctx.fillRect(0, 18, W, H - 18)
    }
    ctx.restore()
  } else {
    const g = ctx.createLinearGradient(0, 22, 0, 262)
    g.addColorStop(0, "#52a05f")
    g.addColorStop(0.45, "#4a8c5c")
    g.addColorStop(1, "#3e7d4f")
    ctx.fillStyle = g
    ctx.fill()
  }

  ctx.save()
  silhouette()
  ctx.clip()

  // Kilau lilin lembut di satu sisi.
  const gl = ctx.createLinearGradient(cx - 60, 0, cx + 44, 0)
  gl.addColorStop(0, "rgba(255,255,255,0)")
  gl.addColorStop(0.48, "rgba(255,255,255,0.14)")
  gl.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = gl
  ctx.fillRect(cx - 90, 20, 180, H - 40)

  // Urat tengah melengkung halus, hijau tua (bukan merah).
  ctx.strokeStyle = "rgba(46,105,66,0.5)"
  ctx.lineCap = "round"
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(cx, 256)
  ctx.quadraticCurveTo(cx + 4, 150, cx + 3, 50)
  ctx.quadraticCurveTo(cx - 4, 150, cx, 256)
  ctx.stroke()

  // Urat lateral sangat samar.
  ctx.strokeStyle = "rgba(46,105,66,0.22)"
  ctx.lineWidth = 2
  for (let i = 1; i <= 5; i++) {
    const vy = 70 + i * 38
    const len = 40 + (i % 2) * 12
    for (const sgn of [-1, 1]) {
      ctx.beginPath()
      ctx.moveTo(cx, vy)
      ctx.quadraticCurveTo(cx + sgn * len * 0.5, vy - 6, cx + sgn * len, vy + 12)
      ctx.stroke()
    }
  }

  ctx.restore()
  return c
}

const POTHOS_TEX = (() => {
  const tex = new THREE.CanvasTexture(drawPothosTile(false))
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
})()

const POTHOS_VAR_TEX = (() => {
  const tex = new THREE.CanvasTexture(drawPothosTile(true))
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
})()

const POTHOS_MAT = new THREE.MeshStandardMaterial({
  map: POTHOS_TEX,
  alphaTest: 0.5,
  roughness: 0.52,
  metalness: 0.03,
  side: THREE.DoubleSide,
  emissive: new THREE.Color("#113a1e"),
  emissiveIntensity: 0.15,
})

const POTHOS_VAR_MAT = new THREE.MeshStandardMaterial({
  map: POTHOS_VAR_TEX,
  alphaTest: 0.5,
  roughness: 0.5,
  metalness: 0.03,
  side: THREE.DoubleSide,
  emissive: new THREE.Color("#113a1e"),
  emissiveIntensity: 0.15,
})

const POTHOS_TRUNK_MAT = new THREE.MeshStandardMaterial({ color: "#6f7a4c", roughness: 0.85 })

const POTHOS_LEAF_GEO = (() => {
  const len = 1.0
  const geo = new THREE.PlaneGeometry(0.84, len, 6, 16)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    const t = (y + len / 2) / len // 0 at base .. 1 at tip
    pos.setY(i, y + len / 2)
    pos.setZ(i, Math.sin(Math.PI * t) * -0.045) // lembut trough/fold di urat tengah
  }
  geo.computeVertexNormals()
  return geo
})()

// Copy pendekatan leafQuat Rubber Plant: sejajarkan bidang helai ke arah daun,
// lalu putar tipis secara acak supaya tiap daun tidak seragam persis.
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

// Layout daun pothos — struktur identik buildRubberLayout: tiap daun menempel di
// SATU titik pada ketinggiannya sendiri di sepanjang batang (BUKAN radial rosette).
// Batang pendek & tipis (variasi mini). 5 titik tumbuh → total 9 daun: pangkal lebih
// besar, pucuk lebih kecil; orientasi acak-natural (ada yang menghadap atas, ada
// menyamping). Semua pangkal daun di atas permukaan tanah (tidak menembus pot).
function buildPothosLayout(h) {
  const j = (seed) => {
    const x = Math.sin((h % 1000) * 0.31 + seed * 12.9898) * 43758.5453
    return x - Math.floor(x)
  }
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
  const up = new THREE.Vector3(0, 1, 0)
  const horizontal = (yaw) => new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)).normalize()

  // Batang pendek & tipis; pangkal telak di permukaan tanah kerikil (di atas rim pot).
  const trunkBase = new THREE.Vector3(0, 0.125, 0)
  const top = new THREE.Vector3((j(350) - 0.5) * 0.035, 0.3 + (j(351) - 0.5) * 0.03, (j(352) - 0.5) * 0.035)
  const trunkMid = trunkBase
    .clone()
    .lerp(top, 0.5)
    .add(new THREE.Vector3((j(353) - 0.5) * 0.02, 0, (j(354) - 0.5) * 0.02))
  const trunkCurve = new THREE.QuadraticBezierCurve3(trunkBase, trunkMid, top)
  const trunkR = 0.028

  // 5 titik tumbuh; jumlah daun per node 2,2,2,2,1 = 9 daun total.
  const nodeT = [0.14, 0.33, 0.5, 0.68, 0.87]
  const nodeCounts = [2, 2, 2, 2, 1]
  const solid = []
  const vareg = []
  const attachLeaf = (list, tNode, yawAt, openness, scale) => {
    const P = trunkCurve.getPoint(tNode)
    const radial = horizontal(yawAt)
    const baseP = P.clone().addScaledVector(radial, trunkR * 0.7)
    const dir = up.clone().multiplyScalar(Math.cos(openness)).addScaledVector(radial, Math.sin(openness)).normalize()
    const quat = leafQuat(dir, radial, (j(401 + list.length) - 0.5) * 0.55)
    list.push({ pos: baseP, quat, scale, wa: 0.97 + j(421 + list.length) * 0.06, cup: 1.0 })
  }

  let printed = 0
  for (let i = 0; i < nodeT.length; i++) {
    const tNode = clamp(nodeT[i] + (j(355 + i) - 0.5) * 0.04, 0.06, 0.96)
    const jitterYaw = (j(365 + i) - 0.5) * 0.4
    for (let k = 0; k < nodeCounts[i]; k++) {
      const yaw = jitterYaw + k * (Math.PI * (0.5 + 0.45 * j(375 + i))) + (j(385 + i) - 0.5) * 2.6
      const openness = clamp(1.28 - 0.62 * (i / (nodeT.length - 1)) + (j(395 + i * 3 + k) - 0.5) * 0.32, 0.48, 1.45)
      const scale = 0.3 - 0.13 * (i / (nodeT.length - 1)) + (j(405 + i * 3 + k) - 0.5) * 0.03
      const target = printed === 2 || printed === 5 || printed === 8 ? vareg : solid
      attachLeaf(target, tNode, yaw, openness, scale)
      printed++
    }
  }

  return { trunkCurve, trunkR, solid, vareg }
}

const POTHOS_INFO = {
  title: "Pothos (Epipremnum aureum)",
  text: "Tanaman hias populer yang sangat mudah dirawat dan tahan di berbagai kondisi cahaya. Melambangkan keberuntungan, pertumbuhan, dan daya tahan — sering disebut 'tanaman uang' karena dipercaya membawa kemakmuran bagi pemiliknya.",
}

function TablePlant() {
  const solidRef = useRef()
  const varRef = useRef()
  const layout = useMemo(() => buildPothosLayout(17), [])

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D()
    const apply = (list, ref) => {
      list.forEach((l, i) => {
        dummy.position.copy(l.pos)
        dummy.quaternion.copy(l.quat)
        dummy.scale.set(l.wa * l.scale, l.scale, l.cup)
        dummy.updateMatrix()
        ref.current.setMatrixAt(i, dummy.matrix)
      })
      ref.current.instanceMatrix.needsUpdate = true
    }
    apply(layout.solid, solidRef)
    apply(layout.vareg, varRef)
  }, [layout])

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
      {/* Batang pendek & tipis, hijau kecoklatan */}
      <mesh castShadow>
        <tubeGeometry args={[layout.trunkCurve, 5, layout.trunkR, 5, false]} />
        <primitive object={POTHOS_TRUNK_MAT} attach="material" />
      </mesh>
      {/* Daun individual menempel di 1 titik tiap ketinggian batang (bukan rosette) */}
      <instancedMesh ref={solidRef} args={[POTHOS_LEAF_GEO, POTHOS_MAT, layout.solid.length]} castShadow />
      <instancedMesh ref={varRef} args={[POTHOS_LEAF_GEO, POTHOS_VAR_MAT, layout.vareg.length]} castShadow />
      <PlantInfoIcon info={POTHOS_INFO} position={[0, 0.55, 0]} />
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
  const [b1, b2] = useMemo(() => getRandomUniqueBookKeys(2), [])
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
      <RealBook coverKey={b1} w={0.14} x={0.2} y={0.85} z={-0.16} rot={0.12} />
      <RealBook coverKey={b2} w={0.12} x={-0.2} y={0.852} z={0.12} rot={-0.18} />
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
