const STONE = "#f1f5f9" // clean minimalist white/off-white plaster

function Pillar({ position }) {
  return (
    <group position={position}>
      {/* Simple minimalist base plinth */}
      <mesh position={[0, 0.12, 0]} castShadow>
        <boxGeometry args={[1.4, 0.24, 1.4]} />
        <meshStandardMaterial color={STONE} roughness={0.8} />
      </mesh>

      {/* Clean minimalist main shaft, running all the way up to the ceiling */}
      <mesh position={[0, 4.845, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.62, 9.21, 32]} />
        <meshStandardMaterial color={STONE} roughness={0.85} />
      </mesh>

      {/* Simple minimalist capital */}
      <mesh position={[0, 9.6, 0]} castShadow>
        <boxGeometry args={[1.5, 0.3, 1.5]} />
        <meshStandardMaterial color={STONE} roughness={0.8} />
      </mesh>

      {/* Crown plate merged flush into the ceiling */}
      <mesh position={[0, 9.885, 0]}>
        <boxGeometry args={[1.6, 0.27, 1.6]} />
        <meshStandardMaterial color={STONE} roughness={0.8} />
      </mesh>
    </group>
  )
}

export default Pillar
