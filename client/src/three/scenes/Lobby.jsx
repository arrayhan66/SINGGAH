import { Text } from "@react-three/drei";

function Lobby() {
  return (
    <group>

      {/* Platform */}

      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[5, 5, 0.8, 64]} />
        <meshStandardMaterial
          color="#1e40af"
          emissive="#2563eb"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Logo */}

      <Text
        position={[0, 2.5, 0]}
        fontSize={1}
        color="white"
        anchorX="center"
      >
        PAMERIT
      </Text>

      <Text
        position={[0, 1.5, 0]}
        fontSize={0.35}
        color="#7dd3fc"
        anchorX="center"
      >
        TECHNOLOGY EXHIBITION
      </Text>

    </group>
  );
}

export default Lobby;