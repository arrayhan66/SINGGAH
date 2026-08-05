const STONE = "#f1f5f9" // clean minimalist white/off-white plaster

function Pillar({ position }) {
  return (
    <group position={position}>
      {/* Simple minimalist base plinth */}
      <mesh position={[0, 0.12, 0]} castShadow>
        <boxGeometry args={[1.4, 0.24, 1.4]} />
        <meshStandardMaterial color={STONE} roughness={0.8} />
      </mesh>

      {/* Clean minimalist main shaft, running up to the ceiling */}
      <mesh position={[0, 3.87, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.62, 7.26, 32]} />
        <meshStandardMaterial color={STONE} roughness={0.85} />
      </mesh>

      {/* Simple minimalist capital */}
      <mesh position={[0, 7.62, 0]} castShadow>
        <boxGeometry args={[1.4, 0.24, 1.4]} />
        <meshStandardMaterial color={STONE} roughness={0.8} />
      </mesh>
    </group>
  )
}

export default Pillar
