import { Text } from "@react-three/drei";

function Booth({ position, title, color }) {
  return (
    <group position={position}>

      {/* Platform */}

      <mesh receiveShadow position={[0,0.15,0]}>
        <boxGeometry args={[6,0.3,6]} />
        <meshStandardMaterial color="#13406b" />
      </mesh>

      {/* Back Wall */}

      <mesh
        castShadow
        position={[0,2,-2.8]}
      >
        <boxGeometry args={[6,4,0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Left */}

      <mesh
        castShadow
        position={[-2.85,2,0]}
      >
        <boxGeometry args={[0.3,4,6]} />
        <meshStandardMaterial color="#1e4978" />
      </mesh>

      {/* Right */}

      <mesh
        castShadow
        position={[2.85,2,0]}
      >
        <boxGeometry args={[0.3,4,6]} />
        <meshStandardMaterial color="#1e4978" />
      </mesh>

      {/* Screen */}

      <mesh
        position={[0,2,-2.6]}
      >
        <planeGeometry args={[3,1.7]} />
        <meshStandardMaterial color="white" />
      </mesh>

      <Text
        position={[0,4.6,-2.6]}
        fontSize={0.45}
        color="white"
        anchorX="center"
      >
        {title}
      </Text>

    </group>
  );
}

export default Booth;