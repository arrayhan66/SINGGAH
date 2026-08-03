import * as THREE from "three"

function CeilingRing({ position, radius = 1.8, light = true }) {
  return (
    <group position={position}>
      <mesh position={[0, -0.06, 0]}>
        <torusGeometry args={[radius, 0.045, 12, 64]} />
        <meshStandardMaterial color="#e3f2ff" emissive="#9cc6f0" emissiveIntensity={2.4} />
      </mesh>
      <mesh position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius * 0.84, 48]} />
        <meshBasicMaterial
          color="#bfe3ff"
          transparent
          opacity={0.1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh position={[0, -0.13, 0]}>
        <cylinderGeometry args={[0.09, 0.12, 0.14, 16]} />
        <meshStandardMaterial color="#e3f2ff" emissive="#9cc6f0" emissiveIntensity={2.6} />
      </mesh>
      {light && <pointLight position={[0, -0.45, 0]} intensity={22} distance={26} color="#cfe9ff" />}
    </group>
  )
}

export default CeilingRing
