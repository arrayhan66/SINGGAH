import { Text, useTexture } from "@react-three/drei"
import { useMemo } from "react"
import * as THREE from "three"
import logo from "../../assets/icons/logo.png"
import exitImg from "../../assets/images/exit.jpg"

const RIFT_H = 4.8
const FRAME_T = 0.3
const DEPTH = 0.5

const NAVY = "#123a63"
const NAVY_EDGE = "#1a4a7f"
const TEXT = "#e8f3ff"
const GLOW = "#ffffff"
const GLOW_LIGHT = "#dbeafe"
const EXIT_RED = "#dc2626"
const EXIT_RED_DARK = "#7f1d1d"

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

function ExitIcon() {
  const tex = useTexture(exitImg)
  const t = useMemo(() => {
    const clone = tex.clone()
    clone.colorSpace = THREE.SRGBColorSpace
    clone.needsUpdate = true
    return clone
  }, [tex])
  const img = t.image
  const aspect = img && img.width && img.height ? img.width / img.height : 1
  return (
    <mesh position={[0, RIFT_H / 2, 0.06]}>
      <planeGeometry args={[1.25, 1.25 / aspect]} />
      <meshBasicMaterial map={t} transparent toneMapped={false} />
    </mesh>
  )
}

function ExitSign({ width }) {
  return (
    <>
      <mesh position={[0, RIFT_H + FRAME_T + 0.29, 0.16]} castShadow>
        <boxGeometry args={[width + 0.4, 0.5, 0.06]} />
        <meshStandardMaterial color={EXIT_RED} roughness={0.6} metalness={0.15} />
      </mesh>
      <mesh position={[0, RIFT_H + FRAME_T + 0.54, 0.16]}>
        <boxGeometry args={[width + 0.4, 0.05, 0.06]} />
        <meshStandardMaterial color={EXIT_RED_DARK} roughness={0.6} />
      </mesh>
      <mesh position={[0, RIFT_H + FRAME_T + 0.29, 0.22]}>
        <boxGeometry args={[width + 0.2, 0.34, 0.05]} />
        <meshStandardMaterial color="#991b1b" roughness={0.6} />
      </mesh>
      <mesh position={[0, RIFT_H + FRAME_T + 0.12, 0.22]}>
        <boxGeometry args={[width + 0.2, 0.03, 0.04]} />
        {glowMat(1.4)}
      </mesh>
      <Text
        position={[0, RIFT_H + FRAME_T + 0.31, 0.25]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={width + 0.1}
        raycast={() => null}
      >
        EXIT
      </Text>
    </>
  )
}

const navyMat = (edge = false) => (
  <meshStandardMaterial color={edge ? NAVY_EDGE : NAVY} roughness={0.75} metalness={0.15} />
)
const exitMat = (dark = false) => (
  <meshStandardMaterial color={dark ? EXIT_RED_DARK : EXIT_RED} roughness={0.6} metalness={0.15} />
)
const glowMat = (intensity = 1.1) => (
  <meshStandardMaterial color={GLOW_LIGHT} emissive={GLOW} emissiveIntensity={intensity} />
)
const exitGlowMat = (intensity = 1.1) => (
  <meshStandardMaterial color={EXIT_RED} emissive={EXIT_RED} emissiveIntensity={intensity} />
)

function Portal({ position, rotationY, width, title, action }) {
  const hw = width / 2
  const frameW = width + FRAME_T * 2
  const frameMat = title ? navyMat() : exitMat()

  return (
    <group
      position={position}
      rotation={[0, rotationY, 0]}
      userData={{ action: action ? action : undefined, noCollide: true }}
    >
      {/* ==== Bingkai seragam: kiri / kanan / atas / bawah (sama tebal) ==== */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (hw + FRAME_T / 2), RIFT_H / 2, 0]} castShadow>
          <boxGeometry args={[FRAME_T, RIFT_H, DEPTH]} />
          {frameMat}
        </mesh>
      ))}
      <mesh position={[0, RIFT_H + FRAME_T / 2, 0]} castShadow>
        <boxGeometry args={[frameW, FRAME_T, DEPTH]} />
        {frameMat}
      </mesh>
      <mesh position={[0, FRAME_T / 2, 0]} castShadow>
        <boxGeometry args={[frameW, FRAME_T, DEPTH]} />
        {frameMat}
      </mesh>

      {/* ==== Tengah portal: logo SINGGAH (masuk) / icon EXIT merah (keluar) ==== */}
      {title ? (
        <>
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
        </>
      ) : (
        <ExitIcon />
      )}

      {/* Trim tepi dalam (merah untuk exit) supaya simetris dan rapi */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (hw - 0.02), RIFT_H / 2, 0.08]}>
          <boxGeometry args={[0.05, RIFT_H - 0.1, 0.1]} />
          {title ? navyMat(true) : exitMat(true)}
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (hw - 0.02), RIFT_H / 2, 0.16]}>
          <boxGeometry args={[0.04, RIFT_H - 0.12, 0.05]} />
          {title ? glowMat() : exitGlowMat()}
        </mesh>
      ))}
      <mesh position={[0, RIFT_H - 0.02, 0.08]}>
        <boxGeometry args={[width + 0.08, 0.05, 0.1]} />
        {title ? navyMat(true) : exitMat(true)}
      </mesh>
      <mesh position={[0, RIFT_H - 0.02, 0.16]}>
        <boxGeometry args={[width + 0.04, 0.04, 0.05]} />
        {title ? glowMat() : exitGlowMat()}
      </mesh>
      <mesh position={[0, FRAME_T + 0.03, 0.08]}>
        <boxGeometry args={[width + 0.08, 0.05, 0.1]} />
        {title ? navyMat(true) : exitMat(true)}
      </mesh>
      <mesh position={[0, FRAME_T + 0.03, 0.16]}>
        <boxGeometry args={[width + 0.04, 0.04, 0.05]} />
        {title ? glowMat() : exitGlowMat()}
      </mesh>

      {/* ==== Rift ==== */}
      <mesh position={[0, RIFT_H / 2, 0]}>
        <planeGeometry args={[width, RIFT_H]} />
        <meshStandardMaterial
          color={title ? "#1a4a7f" : EXIT_RED_DARK}
          emissive="#ffffff"
          emissiveIntensity={0.9}
          roughness={0.5}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ==== Papan nama di atas lintel: judul kategori (masuk) / EXIT (keluar) ==== */}
      {title ? (
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
      ) : (
        <ExitSign width={width} />
      )}
    </group>
  )
}

export default Portal
