import { useLow } from "../hooks/useQuality"

const BRASS = "#c9a35e"
const CHARCOAL = "#223047"

// Minimalist halo pendant: slim cable, brass canopy, two thin concentric rings
// framing a frosted glass disc with a warm glow. Modern-museum look that
// replaces the old chandeliers without feeling tacky.
function HaloPendant({ position, drop = 2.2, glow = 0.8 }) {
  const low = useLow()
  const ringSeg = low ? 32 : 64
  const discSeg = low ? 20 : 32
  const bottom = -drop

  return (
    <group position={position}>
      {/* Brass canopy rosette pinned under the ceiling rosette */}
      <mesh position={[0, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.16, 0.025, 10, ringSeg]} />
        <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.07, 0]}>
        <cylinderGeometry args={[0.02, 0.028, 0.1, 12]} />
        <meshStandardMaterial color={CHARCOAL} metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Slim cable */}
      <mesh position={[0, bottom / 2, 0]}>
        <cylinderGeometry args={[0.012, 0.012, -bottom, 8]} />
        <meshStandardMaterial color={CHARCOAL} metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Halo rings: brass outer, charcoal inner */}
      <mesh position={[0, bottom, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.44, 0.026, 12, ringSeg]} />
        <meshStandardMaterial color={BRASS} metalness={0.75} roughness={0.28} />
      </mesh>
      <mesh position={[0, bottom - 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.32, 0.02, 12, ringSeg]} />
        <meshStandardMaterial color={CHARCOAL} metalness={0.5} roughness={0.35} />
      </mesh>

      {/* Frosted glass disc + warm core */}
      <mesh position={[0, bottom - 0.03, 0]}>
        <cylinderGeometry args={[0.29, 0.29, 0.045, discSeg]} />
        <meshStandardMaterial
          color="#fff3dc"
          emissive="#ffd98a"
          emissiveIntensity={glow * 2.0}
          transparent
          opacity={0.96}
        />
      </mesh>
      <mesh position={[0, bottom + 0.03, 0]}>
        <sphereGeometry args={[0.09, low ? 12 : 16, low ? 12 : 16]} />
        <meshStandardMaterial
          color="#fff8e8"
          emissive="#ffd98a"
          emissiveIntensity={glow * 2.6}
        />
      </mesh>
    </group>
  )
}

export default HaloPendant
