function Wall({ position, scale }) {
  return (
    <mesh
      position={position}
      scale={scale}
      castShadow
      receiveShadow
    >
      <boxGeometry />
      <meshStandardMaterial color="#183b63" />
    </mesh>
  );
}

function Walls() {
  return (
    <>
      <Wall position={[0,2,-25]} scale={[50,4,1]} />
      <Wall position={[0,2,25]} scale={[50,4,1]} />
      <Wall position={[-25,2,0]} scale={[1,4,50]} />
      <Wall position={[25,2,0]} scale={[1,4,50]} />
    </>
  );
}

export default Walls;