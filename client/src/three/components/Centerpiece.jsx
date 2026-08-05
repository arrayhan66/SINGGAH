import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Text, useTexture, Billboard } from "@react-three/drei"
import * as THREE from "three"
import logoPoliban from "../../assets/icons/Logo_Poliban.png"

const GOLD = "#c9a35e"
const MARBLE = "#eef3f9"
const MARBLE_DARK = "#dfe9f4"

function Centerpiece({ title = "HALL UTAMA" }) {
  const orb = useRef()
  const ringA = useRef()
  const ringB = useRef()
  const glow = useRef()
  const logoMap = useTexture(logoPoliban)

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    orb.current.position.y = 2.42 + Math.sin(t * 0.8) * 0.09
    orb.current.rotation.y += delta * 0.2
    ringA.current.rotation.x = 0.55 + Math.sin(t * 0.35) * 0.25
    ringA.current.rotation.y += delta * 0.45
    ringB.current.rotation.x = -0.6 + Math.cos(t * 0.3) * 0.2
    ringB.current.rotation.z = 0.35
    ringB.current.rotation.y -= delta * 0.35
    const s = 1 + Math.sin(t * 2.2) * 0.07
    glow.current.scale.setScalar(s)
  })

  return (
    <group>
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
          color="#38bdf8"
          transparent
          opacity={0.45}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ---- Floating orb (the sculpture) ---- */}
      <group ref={orb} position={[0, 2.42, 0]}>
        {/* Glass globe */}
        <mesh castShadow>
          <sphereGeometry args={[0.72, 64, 48]} />
          <meshStandardMaterial
            color="#1c3a5e"
            metalness={0.4}
            roughness={0.12}
            transparent
            opacity={0.35}
            depthWrite={false}
          />
        </mesh>

        {/* ---- Poliban logo hologram INSIDE the globe, full & never clipped ---- */}
        <Billboard>
          <mesh>
            <planeGeometry args={[0.92, 0.92]} />
            <meshStandardMaterial
              map={logoMap}
              transparent
              alphaTest={0.05}
              roughness={0.4}
              emissive="#ffffff"
              emissiveMap={logoMap}
              emissiveIntensity={0.9}
            />
          </mesh>
        </Billboard>
      </group>

      {/* ---- Orbital rings with satellites ---- */}
      <group ref={ringA} position={[0, 2.42, 0]}>
        <mesh>
          <torusGeometry args={[1.06, 0.02, 12, 96]} />
          <meshStandardMaterial
            color="#7dd3fc"
            emissive="#38bdf8"
            emissiveIntensity={1.6}
            metalness={0.4}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[1.06, 0, 0]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial
            color="#f8fafc"
            emissive="#7dd3fc"
            emissiveIntensity={0.6}
            metalness={0.9}
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
        <mesh position={[-1.3, 0, 0]}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial color="#e8f4ff" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* ---- Sparkles floating around the base ---- */}
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 1.6, 0.16, Math.sin(a) * 1.6]}>
            <sphereGeometry args={[0.022, 8, 8]} />
            <meshBasicMaterial color="#a5f3fc" />
          </mesh>
        )
      })}

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
        fontSize={0.16}
        letterSpacing={0.08}
        color="#7dd3fc"
        anchorX="center"
        anchorY="middle"
        raycast={() => null}
      >
        {title}
      </Text>

      <pointLight position={[0, 2.3, 0]} intensity={6} distance={14} color="#7dd3fc" />
    </group>
  )
}

export default Centerpiece
