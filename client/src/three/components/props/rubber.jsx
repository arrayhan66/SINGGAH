import { useLayoutEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import { LITE, getAnisotropy, leafQuat } from "./shared.jsx"

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
  tex.anisotropy = getAnisotropy()
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
export { RubberPlant }
