const STONE = "#e2e8f0"
const STEEL = "#1e3a5f"
const ACCENT = "#38bdf8"

function Pillar({ position }) {
  return (
    <group position={position}>
      {/* Base plinth */}
      <mesh position={[0, 0.08, 0]} castShadow>
        <boxGeometry args={[1.1, 0.16, 1.1]} />
        <meshStandardMaterial color={STEEL} roughness={0.5} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[0.9, 0.12, 0.9]} />
        <meshStandardMaterial color={STONE} roughness={0.7} />
      </mesh>

      {/* Base glowing blue LED ring */}
      <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.48, 0.025, 12, 48]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={2.2} />
      </mesh>

      {/* Thicker Main shaft */}
      <mesh position={[0, 3.2, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.45, 5.6, 32]} />
        <meshStandardMaterial color={STONE} roughness={0.75} />
      </mesh>

      {/* Blue architectural steel band & glowing ring at mid-shaft */}
      <mesh position={[0, 3.2, 0]}>
        <cylinderGeometry args={[0.435, 0.435, 0.15, 32]} />
        <meshStandardMaterial color={STEEL} roughness={0.4} metalness={0.8} />
      </mesh>
      <mesh position={[0, 3.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.445, 0.02, 12, 48]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={2} />
      </mesh>

      {/* Capital */}
      <mesh position={[0, 6.08, 0]} castShadow>
        <boxGeometry args={[0.9, 0.12, 0.9]} />
        <meshStandardMaterial color={STONE} roughness={0.7} />
      </mesh>
      <mesh position={[0, 6.22, 0]} castShadow>
        <boxGeometry args={[1.05, 0.16, 1.05]} />
        <meshStandardMaterial color={STEEL} roughness={0.5} metalness={0.6} />
      </mesh>

      {/* Capital glowing blue LED ring */}
      <mesh position={[0, 6.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.47, 0.025, 12, 48]} />
        <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={2} />
      </mesh>
    </group>
  )
}

export default Pillar
