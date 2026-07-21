function Ground() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial
          color="#0b2f52"
          metalness={0.2}
          roughness={0.8}
        />
      </mesh>

      {/* Tengah */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
      >
        <circleGeometry args={[8, 64]} />
        <meshStandardMaterial
          color="#1d4ed8"
          emissive="#2563eb"
          emissiveIntensity={1}
        />
      </mesh>

      {/* Jalur */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
      >
        <ringGeometry args={[8.5, 9, 64]} />
        <meshStandardMaterial color="#38bdf8" />
      </mesh>
    </group>
  );
}

export default Ground;