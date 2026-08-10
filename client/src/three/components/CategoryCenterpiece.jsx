import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Text } from "@react-three/drei"
import * as THREE from "three"

const GOLD = "#c9a35e"
const MARBLE = "#eef3f9"
const MARBLE_DARK = "#dfe9f4"

function CategoryCenterpiece({ category, position = [0, 0, 0] }) {
  const orb = useRef()
  const ringA = useRef()
  const ringB = useRef()
  const glow = useRef()

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (orb.current) {
      orb.current.position.y = 2.42 + Math.sin(t * 0.8 + position[0]) * 0.09
      orb.current.rotation.y += delta * 0.25
    }
    if (ringA.current) {
      ringA.current.rotation.x = 0.55 + Math.sin(t * 0.35) * 0.25
      ringA.current.rotation.y += delta * 0.45
    }
    if (ringB.current) {
      ringB.current.rotation.x = -0.6 + Math.cos(t * 0.3) * 0.2
      ringB.current.rotation.y -= delta * 0.35
    }
    if (glow.current) {
      const s = 1 + Math.sin(t * 2.2) * 0.07
      glow.current.scale.setScalar(s)
    }
  })

  const title = category?.title || "KATEGORI"
  const slug = category?.slug || "general"

  const accentColor =
    slug === "website"
      ? "#38bdf8"
      : slug === "mobile-app"
      ? "#a855f7"
      : slug === "iot"
      ? "#10b981"
      : slug === "artificial-intelligence"
      ? "#f59e0b"
      : slug === "data-science"
      ? "#6366f1"
      : slug === "cyber-security"
      ? "#ef4444"
      : slug === "ui-ux-design"
      ? "#ec4899"
      : slug === "game-development"
      ? "#8b5cf6"
      : "#38bdf8"

  return (
    <group position={position}>
      {/* ---- Pedestal ---- */}
      <mesh position={[0, 0.21, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.15, 1.3, 0.12, 48]} />
        <meshStandardMaterial color={MARBLE} roughness={0.4} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[1.06, 1.09, 0.05, 48]} />
        <meshStandardMaterial color={GOLD} metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.85, 1.45, 40]} />
        <meshStandardMaterial color={MARBLE_DARK} roughness={0.35} metalness={0.1} />
      </mesh>
      {[0.32, 0.46].map((r) => (
        <mesh key={r} position={[0, 0.95, 0]}>
          <torusGeometry args={[r, 0.013, 8, 48]} />
          <meshStandardMaterial color="#b9c7d8" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 1.62, 0]}>
        <cylinderGeometry args={[0.62, 0.56, 0.1, 40]} />
        <meshStandardMaterial color={GOLD} metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0, 1.78, 0]} castShadow>
        <cylinderGeometry args={[0.74, 0.62, 0.14, 40]} />
        <meshStandardMaterial color={MARBLE} roughness={0.35} metalness={0.05} />
      </mesh>

      {/* ---- Pulsing glow disc above the plinth ---- */}
      <mesh ref={glow} position={[0, 1.86, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.44, 48]} />
        <meshBasicMaterial
          color={accentColor}
          transparent
          opacity={0.45}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ---- Floating sculpture / core ---- */}
      <group ref={orb} position={[0, 2.42, 0]}>
        <mesh castShadow>
          <icosahedronGeometry args={[0.65, 0]} />
          <meshStandardMaterial
            color={accentColor}
            metalness={0.6}
            roughness={0.2}
            wireframe={false}
            emissive={accentColor}
            emissiveIntensity={0.6}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial
            color="#ffffff"
            metalness={0.1}
            roughness={0.1}
            transparent
            opacity={0.7}
            emissive={accentColor}
            emissiveIntensity={0.8}
          />
        </mesh>
      </group>

      {/* ---- Orbital rings ---- */}
      <group ref={ringA} position={[0, 2.42, 0]}>
        <mesh>
          <torusGeometry args={[1.06, 0.02, 12, 96]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={1.6}
            metalness={0.4}
            roughness={0.2}
          />
        </mesh>
      </group>
      <group ref={ringB} position={[0, 2.42, 0]}>
        <mesh>
          <torusGeometry args={[1.3, 0.014, 12, 96]} />
          <meshStandardMaterial
            color={GOLD}
            emissive="#f5d488"
            emissiveIntensity={0.45}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* ---- Engraved title ring around the base ---- */}
      <mesh position={[0, 0.162, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.42, 1.6, 64]} />
        <meshStandardMaterial
          color="#223047"
          roughness={0.4}
          metalness={0.6}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-4}
        />
      </mesh>
      <Text
        position={[0, 0.168, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.15}
        letterSpacing={0.06}
        color={accentColor}
        anchorX="center"
        anchorY="middle"
        raycast={() => null}
      >
        {title.toUpperCase()}
      </Text>

      <pointLight position={[0, 2.3, 0]} intensity={5} distance={12} color={accentColor} />
    </group>
  )
}

export default CategoryCenterpiece
