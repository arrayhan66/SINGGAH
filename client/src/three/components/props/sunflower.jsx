import { useLayoutEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import { LITE, getAnisotropy, makeLeafCanvas, leafQuat } from "./shared.jsx"

// ---- Sunflower (bunga matahari) ----
// Kepala bunga = PIRINGAN DATAR besar (bukan gumpalan 3D): kelopak kuning
// pipih memanjang menjulur radial 360° seperti sinar matahari mengelilingi
// piringan tengah coklat tua. Struktur: DUA plane kelopak bersilang (rotY
// beda 90°) supaya kelopak terbaca dari depan maupun samping — kelopak
// digambar SATU tile canvas (pusat TRANSPARAN), dan piringan coklat =
// TEPAT SATU disc lingkaran solid di atas plane utama. Tidak pernah dobel.
const SUNFLO_LEAF_TEX = makeLeafCanvas({ base: "#2e6b26", tip: "#5f9e3a", vein: "rgba(20,56,12,0.75)", boldVeins: true, seed: 23 })
const MAT_SUNFLO_LEAF = new THREE.MeshStandardMaterial({ map: SUNFLO_LEAF_TEX, alphaTest: 0.5, roughness: 0.55, side: THREE.DoubleSide, emissive: new THREE.Color("#14300a"), emissiveIntensity: 0.12 })
const MAT_SUNFLO_STEM = new THREE.MeshStandardMaterial({ color: "#5b8a3c", roughness: 0.78 })

// Kelopak: tile canvas — kipas/sinar pipih memanjang runcing penuh 360°,
// pusat dibiarkan transparan (diisi disc lingkaran coklat terpisah).
function drawSunflowerHeadTile() {
  const S = 512
  const c = document.createElement("canvas")
  c.width = S
  c.height = S
  const ctx = c.getContext("2d")
  const cx = S / 2
  const cy = S / 2
  const P = LITE ? 18 : 24
  for (let i = 0; i < P; i++) {
    const a = (i / P) * Math.PI * 2
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(a)
    const g = ctx.createLinearGradient(54, 0, 246, 0)
    g.addColorStop(0, "#f59e0b")
    g.addColorStop(0.45, "#fbbf24")
    g.addColorStop(0.85, "#fcd34d")
    g.addColorStop(1, "#fde68a")
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.moveTo(52, -14)
    ctx.quadraticCurveTo(150, -26, 252, 2)
    ctx.quadraticCurveTo(150, 26, 52, 14)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }
  return c
}

const SUNFLO_HEAD_TEX = (() => {
  const t = new THREE.CanvasTexture(drawSunflowerHeadTile())
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = getAnisotropy()
  return t
})()
const MAT_SUNFLO_HEAD = new THREE.MeshStandardMaterial({ map: SUNFLO_HEAD_TEX, alphaTest: 0.5, roughness: 0.45, side: THREE.DoubleSide, emissive: new THREE.Color("#6b4200"), emissiveIntensity: LITE ? 0.35 : 0.5 })
// Plane kelopak flat (siluet rays oleh alphaTest tile).
const SUNFLO_HEAD_GEO = new THREE.PlaneGeometry(1.0, 1.0)
// Piringan tengah coklat: TEPAT SATU lingkaran solid — lingkaran sempurna,
// dipasang di atas plane utama sehingga terlihat satu bulatan rapi di tengah.
const MAT_SUNFLO_DISC = new THREE.MeshStandardMaterial({ color: "#3b2010", roughness: 0.85, emissive: new THREE.Color("#5a3012"), emissiveIntensity: LITE ? 0.35 : 0.45 })
const SUNFLO_DISC_GEO = new THREE.CircleGeometry(0.165, LITE ? 28 : 48)
// Helai daun bunga matahari: LEBAR (0.8) untuk siluet hati/ovale, cekungan
// pelan sepanjang tulang tengah. BASE di-pin di y=0, ujung di y=1 (konvensi
// atlas yang sama dengan Rubber).
const SUNFLO_LEAF_GEO = (() => {
  const len = 1.0
  const geo = new THREE.PlaneGeometry(0.8, len, LITE ? 4 : 6, LITE ? 10 : 18)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    const t = (y + len / 2) / len
    pos.setY(i, y + len / 2)
    pos.setZ(i, Math.sin(Math.PI * t) * -0.06)
  }
  geo.computeVertexNormals()
  return geo
})()

function buildSunflowerLayout(h) {
  const j = (seed) => {
    const x = Math.sin((h % 1000) * 0.31 + seed * 12.9898) * 43758.5453
    return x - Math.floor(x)
  }
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
  const up = new THREE.Vector3(0, 1, 0)
  const horizontal = (yaw) => new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)).normalize()

  // Batang utama TEGAK, cukup tebal: kepala besar butuh tumpuan kokoh.
  const trunkBase = new THREE.Vector3(0, 0.5, 0)
  const top = new THREE.Vector3((j(701) - 0.5) * 0.04, 1.32 + j(702) * 0.1, (j(703) - 0.5) * 0.04)
  const trunkMid = trunkBase.clone().lerp(top, 0.5).add(new THREE.Vector3((j(704) - 0.5) * 0.05, 0, (j(705) - 0.5) * 0.05))
  const trunkCurve = new THREE.QuadraticBezierCurve3(trunkBase, trunkMid, top)
  const trunkR = 0.045

  // TEPAT 3 daun, tersebar di 1/3 bawah, tengah, dan dekat pucuk batang.
  // Tiap daun arah radial BERBEDA (berjarak ~120°) sehingga terlihat seimbang
  // dari segala sudut — tidak menumpuk di satu sisi. Bentuk & tekstur tetap
  // ovale lebar (makeLeafCanvas). Semua hampir mendatar agar tidak menutupi
  // kepala.
  const leaves = []
  const nodes = [0.28, 0.52, 0.74]
  const leafScales = [0.58, 0.52, 0.46]
  const leafOpen = [1.3, 1.22, 1.34]
  const attach = (list, tNode, yawAt, openness, scale, wa) => {
    const P = trunkCurve.getPoint(tNode)
    const radial = horizontal(yawAt)
    const baseP = P.clone().addScaledVector(radial, trunkR * 0.8)
    const dir = up.clone().multiplyScalar(Math.cos(openness)).addScaledVector(radial, Math.sin(openness)).normalize()
    const quat = leafQuat(dir, radial, (j(710 + list.length) - 0.5) * 0.5)
    list.push({ pos: baseP, quat, scale, wa: wa * (0.97 + j(711 + list.length) * 0.06), cup: 1.0 })
  }
  for (let i = 0; i < 3; i++) {
    const yaw = (i / 3) * Math.PI * 2 + (j(720 + i) - 0.5) * 0.4
    const openness = clamp(leafOpen[i] + (j(721 + i) - 0.5) * 0.12, 0.95, 1.5)
    attach(leaves, nodes[i], yaw, openness, leafScales[i], 1.0)
  }

  // SATU kepala besar di puncak batang utama (paling mirip sunflower asli),
  // miring pelan menghadap penonton.
  const mainHead = {
    pos: top.clone().addScaledVector(horizontal((j(730) - 0.5) * 0.5), 0.06),
    yaw: (j(731) - 0.5) * 0.7,
    tilt: -0.1 - j(732) * 0.18,
    scale: 0.66,
  }

  return { trunkCurve, trunkR, leaves, mainHead }
}

// Kepala bunga = PIRINGAN DATAR: dua plane kelopak bersilang (rotY beda 90°)
// supaya kelopak kuning berbentuk sinar/rays terbaca dari depan maupun samping.
// Pusat kelopak TRANSPARAN; piringan coklat = TEPAT SATU disc lingkaran solid
// di atas plane utama → selalu satu lingkaran rapi di tengah, tidak dobel.
function HeadDisc({ head }) {
  return (
    <group position={head.pos} scale={head.scale}>
      <mesh geometry={SUNFLO_HEAD_GEO} rotation={[head.tilt, head.yaw, 0]}>
        <primitive object={MAT_SUNFLO_HEAD} attach="material" />
      </mesh>
      <mesh geometry={SUNFLO_HEAD_GEO} rotation={[head.tilt, head.yaw + Math.PI / 2, 0]}>
        <primitive object={MAT_SUNFLO_HEAD} attach="material" />
      </mesh>
      <mesh geometry={SUNFLO_DISC_GEO} rotation={[head.tilt, head.yaw, 0]} position={[0, 0, 0.012]} renderOrder={2}>
        <primitive object={MAT_SUNFLO_DISC} attach="material" />
      </mesh>
    </group>
  )
}

function SunflowerPlant({ h }) {
  const leafRef = useRef()
  const layout = useMemo(() => buildSunflowerLayout(h), [h])

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D()
    layout.leaves.forEach((l, i) => {
      dummy.position.copy(l.pos)
      dummy.quaternion.copy(l.quat)
      dummy.scale.set(l.wa * l.scale, l.scale, l.cup)
      dummy.updateMatrix()
      leafRef.current.setMatrixAt(i, dummy.matrix)
    })
    leafRef.current.instanceMatrix.needsUpdate = true
  }, [layout])

  return (
    <group>
      {/* Batang utama tebal, hijau, tegak */}
      <mesh castShadow>
        <tubeGeometry args={[layout.trunkCurve, LITE ? 5 : 6, layout.trunkR, LITE ? 5 : 6, false]} />
        <primitive object={MAT_SUNFLO_STEM} attach="material" />
      </mesh>
      {/* Daun ovale lebar (hati kasar) di-instance: satu geometri */}
      <instancedMesh ref={leafRef} args={[SUNFLO_LEAF_GEO, MAT_SUNFLO_LEAF, layout.leaves.length]} castShadow />
      {/* Satu kepala besar di puncak: piringan floret coklat tunggal di tengah
          kelopak kuning 360° (volume 3D), lihat dari arah mana pun. */}
      <HeadDisc head={layout.mainHead} />
    </group>
  )
}
export { SunflowerPlant }
