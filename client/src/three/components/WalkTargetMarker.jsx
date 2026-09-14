import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useWalkStore } from "../hooks/useWalk"

// Penanda titik jalan (klik/tap di lantai, tanpa WASD): garis tipis dari pemain
// ke tujuan + marker ringan di titik tujunya. Didesain hemat render —
// geometri/material dipakai bersama antar portal, tidak ada alokasi per-frame,
// dan seluruh marker dilepas (unmount) dari scene saat tidak ada tujuan, jadi
// perangkat ringan tidak membayar apa pun saat berjalan tanpa klik.

const UP = new THREE.Vector3(0, 1, 0)
const BEAM_H = 0.9

// Segmen rendah sudah cukup: objek kecil & semi-transparan, tak terlihat burik.
const LINE_GEO = new THREE.CylinderGeometry(0.04, 0.04, 1, 6, 1, true)
const BEAM_GEO = new THREE.CylinderGeometry(0.05, 0.09, 1, 6, 1, true)
const RING_GEO = new THREE.RingGeometry(0.5, 0.6, 24)
const CORE_GEO = new THREE.CircleGeometry(0.3, 24)

const LINE_MAT = new THREE.MeshBasicMaterial({
  color: "#7dd3fc",
  transparent: true,
  opacity: 0.4,
  depthWrite: false,
})
const BEAM_MAT = new THREE.MeshBasicMaterial({
  color: "#38bdf8",
  transparent: true,
  opacity: 0.2,
  blending: THREE.AdditiveBlending,
  side: THREE.DoubleSide,
  depthWrite: false,
  toneMapped: false,
})
const RING_MAT = new THREE.MeshBasicMaterial({
  color: "#a5d8ff",
  transparent: true,
  opacity: 0.85,
  side: THREE.DoubleSide,
  depthWrite: false,
  toneMapped: false,
})
const CORE_MAT = new THREE.MeshBasicMaterial({
  color: "#e0f2fe",
  transparent: true,
  opacity: 0.9,
  depthWrite: false,
  toneMapped: false,
})

// Temp per-frame (module scope) — tidak satu pun alokasi Vector saat berjalan.
const start = new THREE.Vector3()
const end = new THREE.Vector3()
const dir = new THREE.Vector3()
const mid = new THREE.Vector3()
const quat = new THREE.Quaternion()

function MarkerInner() {
  const lineRef = useRef(null)
  const markerRef = useRef(null)

  useFrame(() => {
    const s = useWalkStore.getState()
    const t = s.target
    if (!t || s.isSitting || s.locked) {
      lineRef.current.visible = false
      markerRef.current.visible = false
      return
    }

    // Titik di level kaki pemain/tujuan (target.y = ketinggian lantai tujuan).
    // Garis direndahkan dekat lantai (0.035) supaya tidak melayang terlalu
    // tinggi di depan mata.
    start.set(s.position.x, s.position.y + 0.035, s.position.z)
    end.set(t.x, t.y + 0.035, t.z)
    dir.subVectors(end, start)
    const len = dir.length()
    if (len < 0.15) {
      // Sudah tiba: sorot marker saja, garis menyusut ikut pemain.
      lineRef.current.visible = false
      markerRef.current.visible = true
      markerRef.current.position.set(t.x, t.y + 0.045, t.z)
      return
    }

    dir.multiplyScalar(1 / len)
    mid.addVectors(start, end).multiplyScalar(0.5)
    quat.setFromUnitVectors(UP, dir)

    const line = lineRef.current
    line.visible = true
    line.position.copy(mid)
    line.quaternion.copy(quat)
    line.scale.set(1, len, 1)

    markerRef.current.visible = true
    markerRef.current.position.set(t.x, t.y + 0.045, t.z)
  })

  return (
    <group raycast={() => null}>
      <mesh ref={lineRef} geometry={LINE_GEO} material={LINE_MAT} raycast={() => null} />
      <group ref={markerRef} raycast={() => null}>
        {/* Titik pusat + cincin + pilar cahaya pendek di titik tujuan */}
        <mesh
          geometry={CORE_GEO}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.02, 0]}
          material={CORE_MAT}
          raycast={() => null}
        />
        <mesh
          geometry={RING_GEO}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.055, 0]}
          material={RING_MAT}
          raycast={() => null}
        />
        <mesh
          geometry={BEAM_GEO}
          scale={[1, BEAM_H, 1]}
          position={[0, BEAM_H / 2, 0]}
          material={BEAM_MAT}
          raycast={() => null}
        />
      </group>
    </group>
  )
}

export default function WalkTargetMarker() {
  // Subscribe hanya pada hal yang jarang berubah: target/sitting/locked.
  // Posisi jalan dibaca via getState() di useFrame, jadi tidak ada re-render
  // React selama berjalan — transform di-update langsung di GPU-side object.
  const active = useWalkStore((s) => Boolean(s.target) && !s.isSitting && !s.locked)
  if (!active) return null
  return <MarkerInner />
}