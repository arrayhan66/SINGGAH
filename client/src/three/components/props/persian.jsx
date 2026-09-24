import * as THREE from "three"
import { LITE, makeLeafCanvas, leafQuat } from "./shared.jsx"

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
export { PersianFoliage }
