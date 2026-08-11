import * as THREE from "three"
import { useLow } from "../hooks/useQuality"
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
const TRIM = "#7dd3fc"
const TRIM_EMISSIVE = "#38bdf8"
const INNER_INSET = 0.55

function TrimRings({ position, rings, y = 0, low }) {
  return (
    <group position={position}>
      {rings.map((r, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r.r, r.t, 12, low ? 32 : 48]} />
          <meshStandardMaterial
            color={TRIM}
            emissive={TRIM_EMISSIVE}
            emissiveIntensity={0.6}
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  )
}

function SoftGlow({ position, radius = 2.2, low }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={position}>
      <circleGeometry args={[radius, low ? 32 : 48]} />
      <meshBasicMaterial
        color="#bfe3ff"
        transparent
        opacity={0.14}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

// Roof of each two-storey building (seen from lantai 2): a dense coffered beam
// grid with a recessed plaster panel inside every coffer, a centre medallion
// with glow and rosettes above the chandeliers — the same refined language as
// the main hall so the whole museum reads as one place.
function TopCeiling({ room, height }) {
  const low = useLow()
  const x0 = room.x[0]
  const x1 = room.x[1]
  const z0 = room.z[0]
  const z1 = room.z[1]
  const cx = (x0 + x1) / 2
  const cz = (z0 + z1) / 2
  const w = x1 - x0
  const d = z1 - z0
  const H = height

  const nx = Math.max(2, Math.round(w / COFFER))
  const nz = Math.max(2, Math.round(d / COFFER))
  const xs = Array.from({ length: nx + 1 }, (_, i) => x0 + (w * i) / nx)
  const zs = Array.from({ length: nz + 1 }, (_, i) => z0 + (d * i) / nz)

  // Chandelier spots on lantai 2 (two lounge bays), matching the decor.
  const chandelierZ = [z0 + 18.75, z0 + 34.75]

  return (
    <group>
      {/* Plaster ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[cx, H, cz]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color={PLASTER} roughness={0.95} />
      </mesh>

      {/* Recessed plaster panel inside every coffer (stepped coffered look) */}
      {Array.from({ length: nz }).map((_, j) =>
        Array.from({ length: nx }).map((_, i) => {
          const p0 = [xs[i] + INNER_INSET, zs[j] + INNER_INSET]
          const p1 = [xs[i + 1] - INNER_INSET, zs[j + 1] - INNER_INSET]
          if (p1[0] - p0[0] <= 0 || p1[1] - p0[1] <= 0) return null
          return (
            <mesh
              key={`p-${i}-${j}`}
              rotation={[Math.PI / 2, 0, 0]}
              position={[(p0[0] + p1[0]) / 2, H - 0.1, (p0[1] + p1[1]) / 2]}
            >
              <planeGeometry args={[p1[0] - p0[0], p1[1] - p0[1]]} />
              <meshStandardMaterial color={PANEL} roughness={0.95} />
            </mesh>
          )
        }),
      )}

      {/* Coffered beams spanning X (at each z) */}
      {zs.map((z, i) => (
        <mesh key={`bx-${i}`} position={[cx, H - BEAM_H / 2, z]} castShadow>
          <boxGeometry args={[w, BEAM_H, BEAM_W]} />
          <meshStandardMaterial
            color={i === 0 || i === zs.length - 1 ? BEAM_DARK : BEAM}
            roughness={0.55}
          />
        </mesh>
      ))}

      {/* Coffered beams spanning Z (at each x) */}
      {xs.map((x, i) => (
        <mesh key={`bz-${i}`} position={[x, H - BEAM_H / 2, cz]} castShadow>
          <boxGeometry args={[BEAM_W, BEAM_H, d]} />
          <meshStandardMaterial
            color={i === 0 || i === xs.length - 1 ? BEAM_DARK : BEAM}
            roughness={0.55}
          />
        </mesh>
      ))}

      {/* Centre medallion + glow */}
      <SoftGlow position={[cx, H - 0.36, cz]} low={low} />
      <TrimRings
        position={[cx, H - 0.02, cz]}
        rings={[
          { r: 0.55, t: 0.05 },
          { r: 0.95, t: 0.08 },
          { r: 1.4, t: 0.1 },
          { r: 1.9, t: 0.06 },
        ]}
        low={low}
      />

      {/* Rosettes above the chandeliers */}
      {chandelierZ.map((z, i) => (
        <TrimRings
          key={`r-${i}`}
          position={[cx, H - 0.02, z]}
          rings={[
            { r: 0.35, t: 0.05 },
            { r: 0.55, t: 0.05 },
          ]}
          low={low}
        />
      ))}
    </group>
  )
}

// Ceiling of lantai 1 (the underside of the upper slab, carved around the open
// staircase): plaster planes plus a fine molding grid.
function GroundCeiling({ room }) {
  const x0 = room.x[0]
  const x1 = room.x[1]
  const z0 = room.z[0]
  const z1 = room.z[1]
  const w = x1 - x0
  const d = z1 - z0
  const y = FLOOR2_Y - 0.32
  const pieces = upperSlabPieces(room)

  // Grid mirrors the upper coffer grid so both storeys share one structure.
  const nx = Math.max(2, Math.round(w / COFFER))
  const nz = Math.max(2, Math.round(d / COFFER))
  const xs = Array.from({ length: nx + 1 }, (_, i) => x0 + (w * i) / nx)
  const zs = Array.from({ length: nz + 1 }, (_, i) => z0 + (d * i) / nz)

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
        >
          <planeGeometry args={[px1 - px0, pz1 - pz0]} />
          <meshStandardMaterial color={GROUND_PLASTER} roughness={0.9} />
        </mesh>
      ))}

      {/* Fine molding grid (inner lines only) */}
      {xs.slice(1, -1).map((xg, i) =>
        xRun(xg).map(([a, b], k) => (
          <mesh key={`vx-${i}-${k}`} position={[xg, y - 0.05, (a + b) / 2]}>
            <boxGeometry args={[0.16, 0.1, b - a]} />
            <meshStandardMaterial color={MOLD} roughness={0.9} />
          </mesh>
        )),
      )}
      {zs.slice(1, -1).map((zg, j) =>
        zRun(zg).map(([a, b], k) => (
          <mesh key={`hz-${j}-${k}`} position={[(a + b) / 2, y - 0.05, zg]}>
            <boxGeometry args={[b - a, 0.1, 0.16]} />
            <meshStandardMaterial color={MOLD} roughness={0.9} />
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
