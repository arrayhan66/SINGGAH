import { Text, useTexture } from "@react-three/drei"
import { useMemo } from "react"
import * as THREE from "three"
import logo from "../../assets/icons/logo.png"

const RIFT_H = 4.8
const FRAME_T = 0.3
const DEPTH = 0.5

const NAVY = "#123a63"
const NAVY_EDGE = "#1a4a7f"
const TEXT = "#e8f3ff"
const GLOW = "#ffffff"
const GLOW_LIGHT = "#dbeafe"

function LogoPlate({ position, width }) {
  const tex = useTexture(logo)
  const t = useMemo(() => {
    const clone = tex.clone()
    clone.colorSpace = THREE.SRGBColorSpace
    clone.needsUpdate = true
    return clone
  }, [tex])
  const img = t.image
  const aspect = img && img.width && img.height ? img.width / img.height : 3.2
  return (
    <mesh position={position}>
      <planeGeometry args={[width, width / aspect]} />
      <meshBasicMaterial map={t} transparent toneMapped={false} />
    </mesh>
  )
}

function Portal({ position, rotationY, width, title, action }) {
  const hw = width / 2
  const frameW = width + FRAME_T * 2

  const navyMat = (edge = false) => (
    <meshStandardMaterial color={edge ? NAVY_EDGE : NAVY} roughness={0.75} metalness={0.15} />
  )
  const glowMat = (intensity = 1.1) => (
    <meshStandardMaterial color={GLOW_LIGHT} emissive={GLOW} emissiveIntensity={intensity} />
  )

  return (
    <group position={position} rotation={[0, rotationY, 0]} userData={action ? { action } : undefined}>
      {/* ==== Bingkai seragam: kiri / kanan / atas / bawah (sama tebal) ==== */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (hw + FRAME_T / 2), RIFT_H / 2, 0]} castShadow>
          <boxGeometry args={[FRAME_T, RIFT_H, DEPTH]} />
          {navyMat()}
        </mesh>
      ))}
      <mesh position={[0, RIFT_H + FRAME_T / 2, 0]} castShadow>
        <boxGeometry args={[frameW, FRAME_T, DEPTH]} />
        {navyMat()}
      </mesh>
      <mesh position={[0, FRAME_T / 2, 0]} castShadow>
        <boxGeometry args={[frameW, FRAME_T, DEPTH]} />
        {navyMat()}
      </mesh>

      {/* ==== Logo SINGGAH di tengah rift portal (background putih) ==== */}
      <LogoPlate position={[0, RIFT_H / 2, 0.02]} width={1.25} />
      <Text
        position={[0, RIFT_H / 2 - 1.0, 0.03]}
        fontSize={0.24}
        color={NAVY}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.08}
        raycast={() => null}
      >
        SINGGAH DISINI
      </Text>

      {/* Trim tepi dalam (putih + glow) supaya simetris dan rapi */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (hw - 0.02), RIFT_H / 2, 0.08]}>
          <boxGeometry args={[0.05, RIFT_H - 0.1, 0.1]} />
          {navyMat(true)}
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (hw - 0.02), RIFT_H / 2, 0.16]}>
          <boxGeometry args={[0.04, RIFT_H - 0.12, 0.05]} />
          {glowMat()}
        </mesh>
      ))}
      <mesh position={[0, RIFT_H - 0.02, 0.08]}>
        <boxGeometry args={[width + 0.08, 0.05, 0.1]} />
        {navyMat(true)}
      </mesh>
      <mesh position={[0, RIFT_H - 0.02, 0.16]}>
        <boxGeometry args={[width + 0.04, 0.04, 0.05]} />
        {glowMat()}
      </mesh>
      <mesh position={[0, FRAME_T + 0.03, 0.08]}>
        <boxGeometry args={[width + 0.08, 0.05, 0.1]} />
        {navyMat(true)}
      </mesh>
      <mesh position={[0, FRAME_T + 0.03, 0.16]}>
        <boxGeometry args={[width + 0.04, 0.04, 0.05]} />
        {glowMat()}
      </mesh>

      {/* ==== Rift ==== */}
      <mesh position={[0, RIFT_H / 2, 0]}>
        <planeGeometry args={[width, RIFT_H]} />
        <meshStandardMaterial
          color="#1a4a7f"
          emissive="#ffffff"
          emissiveIntensity={0.9}
          roughness={0.5}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ==== Papan nama, menempel di atas lintel, di depan muka dinding ==== */}
      {title && (
        <>
          <mesh position={[0, RIFT_H + FRAME_T + 0.29, 0.16]} castShadow>
            <boxGeometry args={[width + 0.4, 0.5, 0.06]} />
            {navyMat()}
          </mesh>
          <mesh position={[0, RIFT_H + FRAME_T + 0.54, 0.16]}>
            <boxGeometry args={[width + 0.4, 0.05, 0.06]} />
            {navyMat(true)}
          </mesh>
          <mesh position={[0, RIFT_H + FRAME_T + 0.29, 0.22]}>
            <boxGeometry args={[width + 0.2, 0.34, 0.05]} />
            {navyMat()}
          </mesh>
          <mesh position={[0, RIFT_H + FRAME_T + 0.12, 0.22]}>
            <boxGeometry args={[width + 0.2, 0.03, 0.04]} />
            {glowMat(1.2)}
          </mesh>
          <Text
            position={[0, RIFT_H + FRAME_T + 0.31, 0.25]}
            fontSize={0.3}
            color={TEXT}
            anchorX="center"
            anchorY="middle"
            maxWidth={width + 0.1}
            raycast={() => null}
          >
            {title}
          </Text>
        </>
      )}
    </group>
  )
}

export default Portal
