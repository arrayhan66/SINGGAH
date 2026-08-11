import * as THREE from "three"
import { useLow } from "../hooks/useQuality"

function Lantern({ position, color = "#ffd98a", low = false }) {
  return (
    <group position={position}>
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.2, 6]} />
        <meshStandardMaterial color="#9aa7b8" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.28, 0]}>
        <sphereGeometry args={[0.13, low ? 10 : 16, low ? 10 : 16]} />
        <meshStandardMaterial color="#fff1d6" emissive={color} emissiveIntensity={1.8} />
      </mesh>
      <mesh position={[0, -0.42, 0]}>
        <cylinderGeometry args={[0.09, 0.11, 0.045, low ? 8 : 12]} />
        <meshStandardMaterial color="#c9a35e" metalness={0.6} roughness={0.35} />
      </mesh>
    </group>
  )
}

function HallCeiling({ room, height = 6.5 }) {
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

      {/* Soft glow above the central platform */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H - 0.36, 0]}>
        <circleGeometry args={[3.0, low ? 32 : 48]} />
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
          <torusGeometry args={[r.r, r.size, 12, low ? 48 : 80]} />
          <meshStandardMaterial color={TRIM} emissive="#38bdf8" emissiveIntensity={0.6} metalness={0.5} roughness={0.3} />
        </mesh>
      ))}

      {/* Rosettes above the chandeliers */}
      {chandelierZ.map((z, i) => (
        <group key={`rosette-${i}`} position={[0, H - 0.02, z]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.5, 0.06, 12, low ? 32 : 48]} />
            <meshStandardMaterial color={TRIM} emissive="#38bdf8" emissiveIntensity={0.6} metalness={0.5} roughness={0.3} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.85, 0.07, 12, low ? 32 : 48]} />
            <meshStandardMaterial color={TRIM} emissive="#38bdf8" emissiveIntensity={0.6} metalness={0.5} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Ceiling decorations */}
      {[
        [-9, 6.75],
        [9, -6.75],
        [9, 6.75],
        [-9, -6.75],
        [-9, 20.25],
        [9, -20.25],
        [9, 20.25],
        [-9, -20.25],
      ].map(([x, z], i) => (
        <Lantern key={`lan-${i}`} position={[x, H - 0.15, z]} low={low} />
      ))}
    </group>
  )
}

export default HallCeiling
