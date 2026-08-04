const STONE = "#f1f5f9" // clean minimalist white/off-white plaster

function Pillar({ position }) {
  return (
    <group position={position}>
      {/* Simple minimalist base plinth */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[0.95, 0.2, 0.95]} />
        <meshStandardMaterial color={STONE} roughness={0.8} />
      </mesh>

      {/* Clean minimalist main shaft */}
      <mesh position={[0, 3.2, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.42, 5.8, 32]} />
        <meshStandardMaterial color={STONE} roughness={0.85} />
      </mesh>

      {/* Simple minimalist capital */}
      <mesh position={[0, 6.2, 0]} castShadow>
        <boxGeometry args={[0.95, 0.2, 0.95]} />
        <meshStandardMaterial color={STONE} roughness={0.8} />
      </mesh>
    </group>
  )
}

export default Pillar
