import { Text } from "@react-three/drei"
import * as THREE from "three"

function Hologram({ title = "SINGGAH" }) {
  return (
    <group>
      {/* Light beam */}
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.85, 0.95, 2.5, 32, 1, true]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.05}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.95, 48]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Orbiting sparks */}
      <group position={[0, 2.3, 0]}>
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * 1.7, Math.sin(a * 3) * 0.45, Math.sin(a) * 1.7]}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshBasicMaterial color="#a5f3fc" />
            </mesh>
          )
        })}
      </group>

      {/* Holo-rings */}
      <mesh position={[0, 2.3, 0]}>
        <torusGeometry args={[1.35, 0.035, 12, 64]} />
        <meshStandardMaterial
          color="#7dd3fc"
          emissive="#38bdf8"
          emissiveIntensity={1.4}
          transparent
          opacity={0.9}
        />
      </mesh>
      <mesh position={[0, 2.3, 0]}>
        <torusGeometry args={[1.05, 0.025, 12, 64]} />
        <meshStandardMaterial
          color="#7dd3fc"
          emissive="#38bdf8"
          emissiveIntensity={1.3}
          transparent
          opacity={0.85}
        />
      </mesh>
      <mesh position={[0, 2.3, 0]}>
        <torusGeometry args={[0.72, 0.02, 12, 64]} />
        <meshStandardMaterial
          color="#e0f2fe"
          emissive="#7dd3fc"
          emissiveIntensity={1.6}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Core sculpture */}
      <mesh position={[0, 2.3, 0]}>
        <icosahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.8} roughness={0.2} metalness={0.4} />
      </mesh>
      <mesh position={[0, 2.3, 0]}>
        <icosahedronGeometry args={[0.72, 1]} />
        <meshStandardMaterial
          color="#7dd3fc"
          emissive="#7dd3fc"
          emissiveIntensity={1}
          wireframe
          transparent
          opacity={0.45}
        />
      </mesh>

      {/* Floating title under the sculpture */}
      <Text
        position={[0, 1.15, 0]}
        rotation={[0, 0, 0]}
        fontSize={0.32}
        letterSpacing={0.12}
        color="#a5f3fc"
        anchorX="center"
        anchorY="middle"
        raycast={() => null}
      >
        {title}
      </Text>

      <pointLight position={[0, 2.3, 0]} intensity={5} distance={16} color="#7dd3fc" />
    </group>
  )
}

export default Hologram
