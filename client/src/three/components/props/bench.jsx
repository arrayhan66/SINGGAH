function Bench({ position, rotationY }) {
  const wood = "#2a3d5f"
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.52, 0]}>
        <boxGeometry args={[2.6, 0.12, 0.75]} />
        <meshStandardMaterial color={wood} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.0, -0.3]}>
        <boxGeometry args={[2.6, 0.9, 0.1]} />
        <meshStandardMaterial color={wood} roughness={0.5} />
      </mesh>
      <mesh position={[-1.15, 0.26, 0]}>
        <boxGeometry args={[0.14, 0.52, 0.7]} />
        <meshStandardMaterial color={wood} roughness={0.5} />
      </mesh>
      <mesh position={[1.15, 0.26, 0]}>
        <boxGeometry args={[0.14, 0.52, 0.7]} />
        <meshStandardMaterial color={wood} roughness={0.5} />
      </mesh>
    </group>
  )
}
export { Bench }
