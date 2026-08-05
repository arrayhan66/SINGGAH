import * as THREE from "three"

function HallCeiling({ room, height = 6.5 }) {
  const x0 = room.x[0]
  const x1 = room.x[1]
  const z0 = room.z[0]
  const z1 = room.z[1]
  const cx = (x0 + x1) / 2
  const cz = (z0 + z1) / 2
  const w = x1 - x0
  const d = z1 - z0
  const H = height

  // Odd panel counts so the centre panel stays centred on the hall centre.
  const NX = 5
  const NZ = 9
  const xs = Array.from({ length: NX + 1 }, (_, i) => x0 + (w * i) / NX)
  const zs = Array.from({ length: NZ + 1 }, (_, i) => z0 + (d * i) / NZ)

  const BEAM_W = 0.38
  const BEAM_H = 0.55
  const BEAM = "#8ea9c9"
  const BEAM_DARK = "#6e87a6"
  const TRIM = "#7dd3fc"

  // Recessed LED bands running just inside the perimeter beams
  const ledBands = [
    { pos: [cx, H - 0.02, z0 + 1.1], size: [w - 0.6, 0.34] },
    { pos: [cx, H - 0.02, z1 - 1.1], size: [w - 0.6, 0.34] },
    { pos: [x0 + 1.1, H - 0.02, cz], size: [0.34, d - 0.6] },
    { pos: [x1 - 1.1, H - 0.02, cz], size: [0.34, d - 0.6] },
  ]

  const medallionRings = [
    { r: 0.85, size: 0.06 },
    { r: 1.45, size: 0.09 },
    { r: 2.2, size: 0.11 },
    { r: 2.95, size: 0.06 },
  ]

  const chandelierZ = [z0 + 13.5, z1 - 13.5]

  return (
    <group>
      {/* Plaster ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[cx, H, cz]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#dce8f6" roughness={0.95} />
      </mesh>

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

      {/* Recessed LED bands around the ceiling perimeter */}
      {ledBands.map((b, i) => (
        <mesh key={`band-${i}`} rotation={[Math.PI / 2, 0, 0]} position={b.pos}>
          <planeGeometry args={b.size} />
          <meshBasicMaterial
            color="#7dd3fc"
            transparent
            opacity={0.5}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}

      {/* Soft glow above the central platform */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H - 0.36, 0]}>
        <circleGeometry args={[3.0, 48]} />
        <meshBasicMaterial
          color="#bfe3ff"
          transparent
          opacity={0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Central ceiling rosette / medallion */}
      {medallionRings.map((r, i) => (
        <mesh key={`ring-${i}`} position={[0, H - 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r.r, r.size, 12, 80]} />
          <meshStandardMaterial color={TRIM} emissive="#38bdf8" emissiveIntensity={0.6} metalness={0.5} roughness={0.3} />
        </mesh>
      ))}

      {/* Rosettes above the chandeliers */}
      {chandelierZ.map((z, i) => (
        <group key={`rosette-${i}`} position={[0, H - 0.02, z]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.5, 0.06, 12, 48]} />
            <meshStandardMaterial color={TRIM} emissive="#38bdf8" emissiveIntensity={0.6} metalness={0.5} roughness={0.3} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.85, 0.07, 12, 48]} />
            <meshStandardMaterial color={TRIM} emissive="#38bdf8" emissiveIntensity={0.6} metalness={0.5} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export default HallCeiling
