import * as THREE from "three"
import { Billboard } from "@react-three/drei"
import { getAnisotropy } from "./shared.jsx"

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
  tex.anisotropy = getAnisotropy()
  return tex
})()

function PlantInfoIcon({ info, position = [0, 1.9, 0] }) {
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
export { PlantInfoIcon }
