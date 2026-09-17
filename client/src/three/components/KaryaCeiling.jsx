import { useLayoutEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import { FLOOR2_Y, upperSlabPieces } from "../rooms/museumLayout"

const COFFER = 6
const BEAM_W = 0.34
const BEAM_H = 0.5
const BEAM = "#8ea9c9"
const BEAM_DARK = "#6e87a6"
const PLASTER = "#dce8f6"
const PANEL = "#c9d8ee"
const GROUND_PLASTER = "#dbe6f2"
const MOLD = "#c7d5ea"
const INNER_INSET = 0.55

// Satu instance material dipakai semua room (sebelumnya setiap mesh membuat
// material sendiri -> ratusan material unik + kompilasi shader per room).
const PLASTER_MAT = new THREE.MeshStandardMaterial({ color: PLASTER, roughness: 0.95 })
const PANEL_MAT = new THREE.MeshStandardMaterial({ color: PANEL, roughness: 0.95 })
const BEAM_MAT = new THREE.MeshStandardMaterial({ color: BEAM, roughness: 0.55 })
const BEAM_DARK_MAT = new THREE.MeshStandardMaterial({ color: BEAM_DARK, roughness: 0.55 })
const GROUND_PLASTER_MAT = new THREE.MeshStandardMaterial({ color: GROUND_PLASTER, roughness: 0.9 })
const MOLD_MAT = new THREE.MeshStandardMaterial({ color: MOLD, roughness: 0.9 })

// Grid coffer untuk satu room (panjang grid + garis pembagi). Digunakan lantai
// atas (panel cekung) dan lantai bawah (garis molding) sekaligus.
function cofferGrid(room) {
  const x0 = room.x[0]
  const x1 = room.x[1]
  const z0 = room.z[0]
  const z1 = room.z[1]
  const w = x1 - x0
  const d = z1 - z0
  const nx = Math.max(2, Math.round(w / COFFER))
  const nz = Math.max(2, Math.round(d / COFFER))
  const xs = Array.from({ length: nx + 1 }, (_, i) => x0 + (w * i) / nx)
  const zs = Array.from({ length: nz + 1 }, (_, i) => z0 + (d * i) / nz)
  return { xs, zs }
}

// Semua panel cekung dirender sebagai SATU InstancedMesh (1 draw call vs 54).
function InstancedPanels({ height, xs, zs }) {
  const ref = useRef()
  const n = (xs.length - 1) * (zs.length - 1)
  const geometry = useMemo(() => {
    const pw = xs[1] - xs[0] - INNER_INSET * 2
    const pd = zs[1] - zs[0] - INNER_INSET * 2
    return new THREE.PlaneGeometry(pw, pd)
  }, [xs, zs])
  const panels = useMemo(() => {
    const out = []
    for (let j = 0; j < zs.length - 1; j++) {
      for (let i = 0; i < xs.length - 1; i++) {
        const cx = (xs[i] + xs[i + 1]) / 2
        const cz = (zs[j] + zs[j + 1]) / 2
        out.push([cx, height - 0.1, cz])
      }
    }
    return out
  }, [xs, zs, height])

  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const dummy = new THREE.Object3D()
    panels.forEach(([x, y, z], i) => {
      dummy.position.set(x, y, z)
      dummy.rotation.set(Math.PI / 2, 0, 0)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
    mesh.count = panels.length
  }, [panels])

  return <instancedMesh ref={ref} args={[geometry, PANEL_MAT, n]} />
}

function TopCeiling({ room, height }) {
  const x0 = room.x[0]
  const x1 = room.x[1]
  const z0 = room.z[0]
  const z1 = room.z[1]
  const cx = (x0 + x1) / 2
  const cz = (z0 + z1) / 2
  const w = x1 - x0
  const d = z1 - z0
  const { xs, zs } = useMemo(() => cofferGrid(room), [room])

  return (
    <group>
      {/* Plaster ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[cx, height, cz]} material={PLASTER_MAT}>
        <planeGeometry args={[w, d]} />
      </mesh>

      {/* Recessed plaster panel inside every coffer (one instanced mesh) */}
      <InstancedPanels height={height} xs={xs} zs={zs} />

      {/* Coffered beams spanning X (at each z) */}
      {zs.map((z, i) => (
        <mesh
          key={`bx-${i}`}
          position={[cx, height - BEAM_H / 2, z]}
          castShadow
          material={i === 0 || i === zs.length - 1 ? BEAM_DARK_MAT : BEAM_MAT}
        >
          <boxGeometry args={[w, BEAM_H, BEAM_W]} />
        </mesh>
      ))}

      {/* Coffered beams spanning Z (at each x) */}
      {xs.map((x, i) => (
        <mesh
          key={`bz-${i}`}
          position={[x, height - BEAM_H / 2, cz]}
          castShadow
          material={i === 0 || i === xs.length - 1 ? BEAM_DARK_MAT : BEAM_MAT}
        >
          <boxGeometry args={[BEAM_W, BEAM_H, d]} />
        </mesh>
      ))}
    </group>
  )
}

// Ceiling of lantai 1 (the underside of the upper slab, carved around the open
// staircase): plaster planes plus a fine molding grid. Semua material dishare.
function GroundCeiling({ room }) {
  const x0 = room.x[0]
  const x1 = room.x[1]
  const z0 = room.z[0]
  const z1 = room.z[1]
  const y = FLOOR2_Y - 0.32
  const pieces = upperSlabPieces(room)
  const { xs, zs } = useMemo(() => cofferGrid(room), [room])

  // Clip a line against the slab pieces so nothing floats over the stair void.
  const xRun = (xg) => {
    const out = []
    for (const [px0, pz0, px1, pz1] of pieces) {
      if (xg < px0 || xg > px1) continue
      const a = Math.max(z0, pz0)
      const b = Math.min(z1, pz1)
      if (b - a > 0.01) out.push([a, b])
    }
    return out
  }
  const zRun = (zg) => {
    const out = []
    for (const [px0, pz0, px1, pz1] of pieces) {
      if (zg < pz0 || zg > pz1) continue
      const a = Math.max(x0, px0)
      const b = Math.min(x1, px1)
      if (b - a > 0.01) out.push([a, b])
    }
    return out
  }

  return (
    <group>
      {/* Plaster underside planes, carved around the stair void */}
      {pieces.map(([px0, pz0, px1, pz1], i) => (
        <mesh
          key={i}
          rotation={[Math.PI / 2, 0, 0]}
          position={[(px0 + px1) / 2, y, (pz0 + pz1) / 2]}
          material={GROUND_PLASTER_MAT}
        >
          <planeGeometry args={[px1 - px0, pz1 - pz0]} />
        </mesh>
      ))}

      {/* Fine molding grid (inner lines only) */}
      {xs.slice(1, -1).map((xg, i) =>
        xRun(xg).map(([a, b], k) => (
          <mesh key={`vx-${i}-${k}`} position={[xg, y - 0.05, (a + b) / 2]} material={MOLD_MAT}>
            <boxGeometry args={[0.16, 0.1, b - a]} />
          </mesh>
        )),
      )}
      {zs.slice(1, -1).map((zg, j) =>
        zRun(zg).map(([a, b], k) => (
          <mesh key={`hz-${j}-${k}`} position={[(a + b) / 2, y - 0.05, zg]} material={MOLD_MAT}>
            <boxGeometry args={[b - a, 0.1, 0.16]} />
          </mesh>
        )),
      )}
    </group>
  )
}

function KaryaCeiling({ room, height }) {
  return (
    <group>
      <TopCeiling room={room} height={height} />
      <GroundCeiling room={room} />
    </group>
  )
}

export default KaryaCeiling