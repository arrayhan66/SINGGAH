import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useWalkStore } from "../hooks/useWalk"

// Ring kursor lantai: menggantikan "panah pointer" di area yang bisa diklik.
// Putih-cyan additive tipis yang berputar + bernapas mengikuti posisi mouse.
// Geometri/material dibagi statis (tanpa alokasi tiap frame) dan hanya
// mengupdate 2-3 mesh saat kursor benar-benar di atas lantai.

const RING_HOVER_GEO = new THREE.RingGeometry(0.42, 0.56, 32)
const CORE_HOVER_GEO = new THREE.CircleGeometry(0.15, 24)

// Clearance above the FLOOR. Floor overlays (navy "LANTAI .." strips + ihre
// glyph Text) top out at ~+0.107 above the slab on BOTH storeys (label group
// at +0.06/+7.06, text depth +0.047). The ring is parked at +0.14 so it clears
// the tallest glyph with a real margin — never sinks under labels/rugs/marks.
const HOVER_MARKER_Y = 0.14

const RING_HOVER_MAT = new THREE.MeshBasicMaterial({
  color: "#4cd3ff",
  transparent: true,
  opacity: 0.5,
  blending: THREE.AdditiveBlending,
  side: THREE.DoubleSide,
  depthWrite: false,
  polygonOffset: true,
  polygonOffsetFactor: -2,
  polygonOffsetUnits: -2,
  renderOrder: 100,
  toneMapped: false,
})

const CORE_HOVER_MAT = new THREE.MeshBasicMaterial({
  color: "#e6f7ff",
  transparent: true,
  opacity: 0.65,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  polygonOffset: true,
  polygonOffsetFactor: -2,
  polygonOffsetUnits: -2,
  renderOrder: 100,
  toneMapped: false,
})

function FloorHoverMarker() {
  const gRef = useRef(null)
  const spinRef = useRef(null)
  const t = useRef(0)

  useFrame((_, delta) => {
    const s = useWalkStore.getState()
    const g = gRef.current
    if (!g) return
    const on = Boolean(s.hoverFloor && s.pointerPosition)
    g.visible = on
    if (!on) return

    t.current += delta
    const p = s.pointerPosition
    g.position.set(p.x, p.y + HOVER_MARKER_Y, p.z)
    const pulse = 1 + Math.sin(t.current * 4.2) * 0.07
    g.scale.setScalar(pulse)
    spinRef.current.rotation.y = t.current * 0.5
    RING_HOVER_MAT.opacity = 0.5 + Math.sin(t.current * 4.2) * 0.18
    CORE_HOVER_MAT.opacity = 0.65 + Math.sin(t.current * 4.2 + 1) * 0.2
  })

  return (
    <group ref={gRef} raycast={() => null} visible={false}>
      <group ref={spinRef} raycast={() => null}>
        <mesh
          geometry={RING_HOVER_GEO}
          material={RING_HOVER_MAT}
          rotation={[-Math.PI / 2, 0, 0]}
          raycast={() => null}
        />
        <mesh
          geometry={CORE_HOVER_GEO}
          material={CORE_HOVER_MAT}
          rotation={[-Math.PI / 2, 0, 0]}
          raycast={() => null}
        />
      </group>
    </group>
  )
}

export default FloorHoverMarker