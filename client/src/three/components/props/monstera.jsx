import { useLayoutEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import { LITE, getAnisotropy, leafQuat } from "./shared.jsx"

// ---- Monstera (Monstera deliciosa) "mini" ----
// Pendekatan STRUKTUR SAMA dengan Rubber Plant/Pothos yang sudah berhasil:
// tiap daun = 1 plane low-poly (base pinned y=0, tip +Y), dipasang INDIVIDUAL
// di titiknya masing-masing di sepanjang batang (BUKAN radial rosette), dan
// dipakai via instancedMesh. Ciri khas Swiss Cheese Plant adalah CELAH TEPI
// (marginal cleft) NYATA: siluet daun di-bake LANGSUNG dengan potongan dalam
// yang menuju tulang daun utama di TEPI-TENGAH helai (bukan bercak/lubang
// acak di tengah), sehingga area celah benar-benar kosong/transparan saat
// dirender. Daun tua (mature) ber-celah dalam 3 per sisi; pucuk muda kecil
// hanya berlekuk halus tanpa lubang. Warna hijau tua pekat #2D5F3F mengkilap
// dengan urat tengah lebih terang. Rasio texture 256x300 = rasio plane
// (0.85:1) sehingga bentuk daun tidak terdistorsi.
function drawMonsteraTile(mode) {
  const W = 256
  const H = 300
  const c = document.createElement("canvas")
  c.width = W
  c.height = H
  const ctx = c.getContext("2d")
  const cx = W / 2
  const baseY = H - 14
  const tipY = 14

  // Posisi celah tepi (fraksi dari pangkal ke ujung). Daun tua: 3 celah dalam
  // per sisi di TEPI-TENGAH (antara urat lateral). Pucuk muda: 1 tekukan halus.
  const notches = mode === "mature" ? [0.2, 0.38, 0.58] : [0.42]
  const notchK = mode === "mature" ? 0.3 : 0.6 // sisa lebar di dasar celah
  const hw = (t) => Math.pow(Math.sin(Math.min(1, Math.max(0, t)) * Math.PI), 0.6) * 102
  const dipAt = (t) =>
    notches.reduce((m, nt) => {
      const d = Math.abs(t - nt)
      if (d > 0.05) return m
      const k = 0.5 + 0.5 * Math.cos((d / 0.05) * Math.PI)
      return m * (1 - (1 - notchK) * k)
    }, 1)

  // Titik outline: naik sisi kiri (pangkal→ujung), turun sisi kanan.
  const pts = []
  for (let i = 0; i <= 72; i++) {
    const t = i / 72
    const y = baseY - t * (baseY - tipY)
    const w = hw(t) * dipAt(t)
    pts.push([cx - w, y])
  }
  for (let i = 72; i >= 0; i--) {
    const t = i / 72
    const y = baseY - t * (baseY - tipY)
    const w = hw(t) * dipAt(t)
    pts.push([cx + w, y])
  }

  ctx.beginPath()
  ctx.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1])
  ctx.closePath()

  const grad = ctx.createLinearGradient(0, 0, 0, H)
  if (mode === "young") {
    grad.addColorStop(0, "#4f8d5c")
    grad.addColorStop(1, "#245c36")
  } else {
    grad.addColorStop(0, "#3a7a4c")
    grad.addColorStop(0.5, "#2d5f3f")
    grad.addColorStop(1, "#163c24")
  }
  ctx.fillStyle = grad
  ctx.fill()

  // Takik pangkal kecil di dasar helai (tempat tangkai menempel).
  ctx.save()
  ctx.globalCompositeOperation = "destination-out"
  ctx.fillStyle = "rgba(0,0,0,1)"
  ctx.beginPath()
  ctx.moveTo(cx - 9, baseY)
  ctx.lineTo(cx, baseY - 12)
  ctx.lineTo(cx + 9, baseY)
  ctx.closePath()
  ctx.fill()
  ctx.restore()

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1])
  ctx.closePath()
  ctx.clip()

  // Kilau lilin sangat halus di satu sisi (tanpa puncak putih yang menyala).
  const gl = ctx.createLinearGradient(cx - 44, 0, cx + 34, 0)
  gl.addColorStop(0, "rgba(255,255,255,0)")
  gl.addColorStop(0.5, "rgba(255,255,255,0.07)")
  gl.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = gl
  ctx.fillRect(cx - 60, 10, 120, H - 24)

  // Urat tengah lebih terang, ramping, dari pangkal sampai dekat ujung.
  ctx.strokeStyle = "rgba(146,196,152,0.45)"
  ctx.lineCap = "round"
  ctx.lineWidth = 4.5
  ctx.beginPath()
  ctx.moveTo(cx, baseY - 5)
  ctx.lineTo(cx, 40)
  ctx.stroke()
  ctx.lineWidth = 1.8
  ctx.beginPath()
  ctx.moveTo(cx, 82)
  ctx.lineTo(cx, 34)
  ctx.stroke()

  // Urat lateral mengarah ke tiap celah tepi (menghubungkan celah ke tulang
  // utama) — ini yang membuat celah terbaca sebagai "di antara tulang daun".
  ctx.strokeStyle = "rgba(66,120,80,0.35)"
  ctx.lineWidth = 1.8
  const late = [
    [0.58, 0.66, 32],
    [0.58, -0.66, 32],
    [0.4, 0.62, 30],
    [0.4, -0.62, 30],
    [0.22, 0.55, 24],
    [0.22, -0.55, 24],
  ]
  for (const [ty, sgn, len] of late) {
    const vy = baseY - ty * (baseY - tipY)
    ctx.beginPath()
    ctx.moveTo(cx, vy)
    ctx.quadraticCurveTo(cx + sgn * len * 0.6, vy - 7, cx + sgn * len, vy + 12)
    ctx.stroke()
  }

  ctx.restore()

  // Tepi outline tipis lebih gelap agar kontur celah terbaca tajam & bersih.
  ctx.beginPath()
  ctx.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1])
  ctx.closePath()
  ctx.strokeStyle = "rgba(12,36,20,0.55)"
  ctx.lineWidth = 2.4
  ctx.lineJoin = "round"
  ctx.stroke()
  return c
}

const MONSTERA_MATURE_TEX = (() => {
  const t = new THREE.CanvasTexture(drawMonsteraTile("mature"))
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = getAnisotropy()
  return t
})()
const MONSTERA_YOUNG_TEX = (() => {
  const t = new THREE.CanvasTexture(drawMonsteraTile("young"))
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = getAnisotropy()
  return t
})()
const MAT_MONSTERA_MATURE = new THREE.MeshStandardMaterial({ map: MONSTERA_MATURE_TEX, alphaTest: 0.5, roughness: 0.28, metalness: 0.08, side: THREE.DoubleSide, emissive: new THREE.Color("#0d2414"), emissiveIntensity: 0.16 })
const MAT_MONSTERA_YOUNG = new THREE.MeshStandardMaterial({ map: MONSTERA_YOUNG_TEX, alphaTest: 0.5, roughness: 0.34, metalness: 0.08, side: THREE.DoubleSide, emissive: new THREE.Color("#0f2b18"), emissiveIntensity: 0.16 })
const MAT_MONSTERA_TRUNK = new THREE.MeshStandardMaterial({ color: "#4d5c36", roughness: 0.85 })

// Geomerti daun: rasio sama dengan texture 256x300 (0.85:1), lipatan halus di
// sepanjang urat tengah; base pinned di y=0, tip di +Y.
const MONSTERA_MATURE_GEO = (() => {
  const len = 1.0
  const geo = new THREE.PlaneGeometry(0.85, len, LITE ? 4 : 6, LITE ? 8 : 16)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    const t = (y + len / 2) / len
    pos.setY(i, y + len / 2)
    pos.setZ(i, Math.sin(Math.PI * t) * -0.055)
  }
  geo.computeVertexNormals()
  return geo
})()
const MONSTERA_YOUNG_GEO = (() => {
  const len = 1.0
  const geo = new THREE.PlaneGeometry(0.68, len, LITE ? 4 : 6, LITE ? 8 : 14)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    const t = (y + len / 2) / len
    pos.setY(i, y + len / 2)
    pos.setZ(i, Math.sin(Math.PI * t) * -0.045)
  }
  geo.computeVertexNormals()
  return geo
})()

// Layout daun monstera — struktur IDENTIK untuk kedua varian supaya terlook
// sebagai TANAMAN YANG SAMA (hanya beda skala): tiap daun INDIVIDUAL menempel
// di titiknya masing-masing di sepanjang batang (bukan rosette). Batang
// TEGAK-RAMPING hijau kecoklatan; daun menyebar dari bawah ke atas.
// VARIAN BESAR: 4 titik tumbuh x 2 = 8 daun (mature ber-celah + pucuk muda)
// dengan skala penuh. VARIAN KECIL: struktur sama persis, hanya skala batang
// & daun ±62% dan 6 daun (3 titik x 2) — tekstur/bentuk daun identik dengan
// besar. Semua pangkal daun di atas rim pot.
function buildMonsteraLayout(h, variant) {
  const factor = variant === "kecil" ? 0.62 : 1
  const nNodes = variant === "kecil" ? 3 : 4
  const j = (seed) => {
    const x = Math.sin((h % 1000) * 0.31 + seed * 12.9898) * 43758.5453
    return x - Math.floor(x)
  }
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
  const up = new THREE.Vector3(0, 1, 0)
  const horizontal = (yaw) => new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)).normalize()

  // Batang TEGAK, RAMPING. Tinggi seimbang dengan daun: besar lebih tinggi
  // supaya 8 daun punya ruang menyebar; kecil lebih pendek sesuai skala.
  const trunkBase = new THREE.Vector3(0, 0.03, 0)
  const topY = factor * (0.86 + j(502) * 0.05)
  const top = new THREE.Vector3((j(501) - 0.5) * 0.04, topY, (j(503) - 0.5) * 0.04)
  const trunkMid = trunkBase
    .clone()
    .lerp(top, 0.5)
    .add(new THREE.Vector3((j(504) - 0.5) * 0.05, 0, (j(505) - 0.5) * 0.05))
  const trunkCurve = new THREE.QuadraticBezierCurve3(trunkBase, trunkMid, top)
  // Ramping: diameter jauh lebih kecil dari lebar daun (bukan monokok tebal).
  const trunkR = factor < 1 ? 0.011 : 0.017

  const mature = []
  const young = []
  const attachLeaf = (isMature, tNode, yawAt, openness, scale) => {
    const P = trunkCurve.getPoint(tNode)
    const radial = horizontal(yawAt)
    const baseP = P.clone().addScaledVector(radial, trunkR * 0.8)
    const dir = up.clone().multiplyScalar(Math.cos(openness)).addScaledVector(radial, Math.sin(openness)).normalize()
    const quat = leafQuat(dir, radial, (j(610 + (isMature ? mature.length : young.length)) - 0.5) * 0.5)
    const record = { pos: baseP, quat, scale, wa: 1.0 + (j(620 + (isMature ? mature.length : young.length)) - 0.5) * 0.1, cup: 0.9 + j(630 + (isMature ? mature.length : young.length)) * 0.2 }
    ;(isMature ? mature : young).push(record)
  }

  // Titik tumbuh tersebar merata sepanjang batang. Pasangan daun berhadapan
  // (opposite) dengan yaw berotasi tiap buku (decussate) supaya rimbun.
  const nodeT = variant === "kecil" ? [0.2, 0.5, 0.8] : [0.16, 0.42, 0.68, 0.92]
  const matureNodes = variant === "kecil" ? [true, true, false] : [true, true, false, false]

  for (let i = 0; i < nNodes; i++) {
    const tNode = clamp(nodeT[i] + (j(521 + i) - 0.5) * 0.02, 0.08, 0.98)
    const yaw0 = (j(531 + i) - 0.5) * 1.4
    for (let k = 0; k < 2; k++) {
      const yaw = yaw0 + k * Math.PI * (0.98 + (j(541 + i) - 0.5) * 0.04) + (j(551 + i * 2 + k) - 0.5) * 0.3
      // Daun bawah lebih landai/gagah, atas lebih tegak — semua di atas rim.
      const openness = clamp(1.18 - 0.3 * (i / Math.max(1, nNodes - 1)) + (j(561 + i * 2 + k) - 0.5) * 0.16, 0.5, 1.5)
      // Ukuran besar: daun dewasa (bawah) ~0.55, menyusut ke pucuk ~0.4.
      const scale = factor * (0.55 - 0.14 * (i / Math.max(1, nNodes - 1))) + (j(571 + i * 2 + k) - 0.5) * 0.03
      attachLeaf(matureNodes[i], tNode, yaw, openness, scale)
    }
  }

  return { trunkCurve, trunkR, mature, young }
}

function MonsteraMini({ h, variant = "besar" }) {
  const matureRef = useRef()
  const youngRef = useRef()
  const layout = useMemo(() => buildMonsteraLayout(h, variant), [h, variant])

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D()
    const apply = (list, ref) => {
      if (!list.length || !ref.current) return
      list.forEach((l, i) => {
        dummy.position.copy(l.pos)
        dummy.quaternion.copy(l.quat)
        dummy.scale.set(l.wa * l.scale, l.scale, l.cup)
        dummy.updateMatrix()
        ref.current.setMatrixAt(i, dummy.matrix)
      })
      ref.current.instanceMatrix.needsUpdate = true
    }
    apply(layout.mature, matureRef)
    apply(layout.young, youngRef)
  }, [layout])

  return (
    <group position={[0, 0.47, 0]}>
      <mesh castShadow>
        <tubeGeometry args={[layout.trunkCurve, LITE ? 5 : 6, layout.trunkR, LITE ? 5 : 6, false]} />
        <primitive object={MAT_MONSTERA_TRUNK} attach="material" />
      </mesh>
      {layout.mature.length > 0 && (
        <instancedMesh ref={matureRef} args={[MONSTERA_MATURE_GEO, MAT_MONSTERA_MATURE, layout.mature.length]} castShadow />
      )}
      {layout.young.length > 0 && (
        <instancedMesh ref={youngRef} args={[MONSTERA_YOUNG_GEO, MAT_MONSTERA_YOUNG, layout.young.length]} castShadow />
      )}
    </group>
  )
}
export { MonsteraMini }
