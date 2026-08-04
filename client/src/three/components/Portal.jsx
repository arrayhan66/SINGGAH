import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Text } from "@react-three/drei"
import * as THREE from "three"

const RIFT_H = 5.2
const FRAME = "#223047"

function Portal({ position, rotationY, width, title, subtitle, action }) {
  const riftRef = useRef()
  const glowRef = useRef()
  const hw = width / 2

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (riftRef.current) riftRef.current.material.opacity = 0.82 + 0.14 * Math.sin(t * 2.4)
    if (glowRef.current) {
      const s = 1 + 0.045 * Math.sin(t * 1.9)
      glowRef.current.scale.set(s, s, 1)
      glowRef.current.material.opacity = 0.2 + 0.08 * Math.sin(t * 2.4)
    }
  })

  return (
    <group position={position} rotation={[0, rotationY, 0]} userData={action ? { action } : undefined}>
      {/* Protruding symmetric frame (lintel + jambs) */}
      <mesh position={[0, RIFT_H + 0.12, 0]} castShadow>
        <boxGeometry args={[width + 0.3, 0.24, 0.56]} />
        <meshStandardMaterial color={FRAME} roughness={0.35} metalness={0.7} />
      </mesh>
      <mesh position={[-hw - 0.12, RIFT_H / 2, 0]} castShadow>
        <boxGeometry args={[0.24, RIFT_H, 0.56]} />
        <meshStandardMaterial color={FRAME} roughness={0.35} metalness={0.7} />
      </mesh>
      <mesh position={[hw + 0.12, RIFT_H / 2, 0]} castShadow>
        <boxGeometry args={[0.24, RIFT_H, 0.56]} />
        <meshStandardMaterial color={FRAME} roughness={0.35} metalness={0.7} />
      </mesh>

      {/* Rift */}
      <mesh ref={riftRef} position={[0, RIFT_H / 2, 0]}>
        <planeGeometry args={[width, RIFT_H]} />
        <meshStandardMaterial
          color="#0a3a5c"
          emissive="#38bdf8"
          emissiveIntensity={0.8}
          roughness={0.5}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Soft outer glow */}
      <mesh ref={glowRef} position={[0, RIFT_H / 2, 0.02]}>
        <planeGeometry args={[width + 0.7, RIFT_H + 0.7]} />
        <meshBasicMaterial
          color="#7dd3fc"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Base LED strip */}
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[width + 0.5, 0.045, 0.3]} />
        <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={1.6} />
      </mesh>

      {/* Nameplate */}
      {title && (
        <>
          <mesh position={[0, RIFT_H + 0.62, 0.3]}>
            <boxGeometry args={[width + 0.42, 0.72, 0.06]} />
            <meshStandardMaterial color="#16283f" roughness={0.35} metalness={0.4} />
          </mesh>
          <mesh position={[0, RIFT_H + 0.26, 0.3]}>
            <boxGeometry args={[width + 0.42, 0.03, 0.06]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.4} />
          </mesh>
          <Text
            position={[0, RIFT_H + 0.66, 0.36]}
            fontSize={0.32}
            color="#7dd3fc"
            anchorX="center"
            anchorY="middle"
            maxWidth={width + 0.2}
            raycast={() => null}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              position={[0, RIFT_H + 0.24, 0.36]}
              fontSize={0.17}
              color="#93c5fd"
              anchorX="center"
              anchorY="middle"
              maxWidth={width + 0.2}
              raycast={() => null}
            >
              {subtitle}
            </Text>
          )}
        </>
      )}
    </group>
  )
}

export default Portal
