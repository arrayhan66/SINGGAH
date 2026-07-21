function Lights() {
  return (
    <>
      <ambientLight intensity={1.5} />

      <directionalLight
        position={[8, 15, 8]}
        intensity={3}
        castShadow
      />

      <pointLight
        position={[0, 6, 0]}
        intensity={40}
        color="#38bdf8"
      />

      <pointLight
        position={[0, 4, -20]}
        intensity={20}
        color="#2563eb"
      />
    </>
  );
}

export default Lights;