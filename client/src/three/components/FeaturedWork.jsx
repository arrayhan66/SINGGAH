import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Text } from "@react-three/drei"
import * as THREE from "three"
import Painting from "./Painting"
import { useQualityStore } from "../hooks/useQuality"
import { PAINTING_SIZE } from "../rooms/museumLayout"
import { textures } from "../utils/textures"

const GOLD = "#c9a35e"
const GOLD_DEEP = "#8a6a2f"
const MARBLE = "#f4f7fb"
const NAVY = "#0f2036"
const NAVY_DARK = "#0a1526"
const VELVET = "#7f1d1d"
const CYAN = "#38bdf8"

// Full-size frames centered on the podium top. Raised so each frame's info
// plaque sits clear above the podium top slab. HALF_FRAME is half the full
// frame width (canvas + 0.34m gold rim); FRAME_GAP keeps the two works apart
// so their frames never touch each other.
const BOTTOM_Y = 3.35
const HALF_FRAME = (PAINTING_SIZE.w + 0.34) / 2
const FRAME_GAP = 0.45
const PLAQUE_FONT = 0.3
const PLAQUE_PAD_X = 0.55
const PLAQUE_PAD_Y = 0.25

// Classical pediment (triangle) capping the backboard.
const pedimentShape = () => {
  const s = new THREE.Shape()
  const w = 2.2
  s.moveTo(-w, 0)
  s.lineTo(w, 0)
  s.lineTo(0, 0.9)
  s.closePath()
  return s
}

function Stanchion({ x, z }) {
  return (
    <group position={[x, 0, z]}>
      {/* Base disc */}
      <mesh position={[0, 0.03, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.06, 16]} />
        <meshStandardMaterial color={GOLD_DEEP} metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Post */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.045, 0.92, 12]} />
        <meshStandardMaterial color={GOLD} metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Collar */}
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.055, 0.06, 0.05, 12]} />
        <meshStandardMaterial color={GOLD} metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Finial */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <sphereGeometry args={[0.065, 14, 14]} />
        <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Glow tip */}
      <mesh position={[0, 1.0, 0]}>
        <sphereGeometry args={[0.028, 10, 10]} />
        <meshStandardMaterial color="#fff6dd" emissive="#ffd98a" emissiveIntensity={1.4} />
      </mesh>
    </group>
  )
}

function FeaturedWork({ position = [0, 0, 0], rotationY = 0, projects = [] }) {
  const tier = useQualityStore((s) => s.tier)
  const group = useRef()
  const spot = useRef()
  const list = (projects || []).slice(0, 2)
  const slots = list.length === 2 ? [-(HALF_FRAME + FRAME_GAP), HALF_FRAME + FRAME_GAP] : [0]

  const marbleMap = useMemo(() => textures.premiumMarble(), [])
  const pediment = useMemo(() => pedimentShape(), [])

  const [plaqueW, setPlaqueW] = useState(3.6)
  const [plaqueH, setPlaqueH] = useState(0.5)

  // Measure the actual title text so the plaque board (navy) and its gold
  // frame grow/shrink to hug the text ("mengikuti teks") every re-render.
  const handlePlaqueSync = useCallback((mesh) => {
    const b = mesh.textRenderInfo?.blockBounds
    if (b) {
      setPlaqueW(b[2] - b[0] + PLAQUE_PAD_X * 2)
      setPlaqueH(b[3] - b[1] + PLAQUE_PAD_Y * 2)
    }
  }, [])

  useEffect(() => {
    if (spot.current && group.current) {
      spot.current.target = group.current
      spot.current.target.updateMatrixWorld()
    }
  }, [tier])

  return (
    <group ref={group} position={position} rotation={[0, rotationY, 0]}>
      {/* ==== Podium: stepped marble base + gold trim + polished top ==== */}
      <mesh position={[0, 0.11, 0]} castShadow>
        <boxGeometry args={[7.0, 0.22, 1.4]} />
        <meshStandardMaterial color="#1a2740" roughness={0.35} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.24, 0]}>
        <boxGeometry args={[7.1, 0.05, 1.5]} />
        <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.34, 0]} castShadow>
        <boxGeometry args={[6.5, 0.14, 1.25]} />
        <meshStandardMaterial color="#263552" roughness={0.35} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.44, 0]}>
        <boxGeometry args={[6.6, 0.05, 1.35]} />
        <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Column */}
      <mesh position={[0, 0.92, 0]} castShadow>
        <boxGeometry args={[6.2, 0.9, 1.0]} />
        <meshStandardMaterial map={marbleMap} color={MARBLE} roughness={0.15} metalness={0.25} />
      </mesh>
      {/* Column top band + polished top slab */}
      <mesh position={[0, 1.4, 0]}>
        <boxGeometry args={[6.3, 0.06, 1.1]} />
        <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.52, 0]} castShadow>
        <boxGeometry args={[6.5, 0.16, 1.25]} />
        <meshStandardMaterial map={marbleMap} color={MARBLE} roughness={0.1} metalness={0.35} />
      </mesh>

      {/* ==== Backboard: marble panel framed by gold pilasters ==== */}
      <mesh position={[0, 3.4, -0.08]} castShadow>
        <boxGeometry args={[6.6, 3.9, 0.14]} />
        <meshStandardMaterial map={marbleMap} color={MARBLE} roughness={0.2} metalness={0.2} />
      </mesh>
      {/* Recessed navy niche the works hang in front of */}
      <mesh position={[0, 3.4, -0.05]}>
        <boxGeometry args={[5.9, 3.2, 0.02]} />
        <meshStandardMaterial color={NAVY_DARK} roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Recessed glow strip at the top of the niche */}
      <mesh position={[0, 5.05, -0.01]}>
        <boxGeometry args={[5.6, 0.07, 0.02]} />
        <meshStandardMaterial
          color="#bfe3ff"
          emissive={CYAN}
          emissiveIntensity={1.6}
          roughness={0.4}
        />
      </mesh>
      {/* Gold pilasters on the sides */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 3.24, 3.4, -0.05]} castShadow>
            <boxGeometry args={[0.14, 3.9, 0.16]} />
            <meshStandardMaterial color={GOLD} metalness={0.85} roughness={0.25} />
          </mesh>
          <mesh position={[s * 3.24, 1.62, -0.05]}>
            <boxGeometry args={[0.2, 0.12, 0.18]} />
            <meshStandardMaterial color={GOLD} metalness={0.85} roughness={0.25} />
          </mesh>
          <mesh position={[s * 3.24, 5.26, -0.05]}>
            <boxGeometry args={[0.2, 0.12, 0.18]} />
            <meshStandardMaterial color={GOLD} metalness={0.85} roughness={0.25} />
          </mesh>
        </group>
      ))}

      {/* ==== Entablature + classical pediment ==== */}
      <mesh position={[0, 5.45, -0.08]} castShadow>
        <boxGeometry args={[6.8, 0.18, 0.24]} />
        <meshStandardMaterial color={GOLD} metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0, 5.56, -0.08]}>
        <boxGeometry args={[6.6, 0.06, 0.2]} />
        <meshStandardMaterial color={GOLD_DEEP} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 5.62, -0.08]}>
        <extrudeGeometry args={[pediment, { depth: 0.18, bevelEnabled: false }]} />
        <meshStandardMaterial color={GOLD} metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0, 6.62, -0.08]} castShadow>
        <sphereGeometry args={[0.09, 14, 14]} />
        <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.2} />
      </mesh>

      {/* ==== Info plaque on the podium face ==== */}
      <group position={[0, 0.82, 0.55]}>
        {/* Gold outer frame */}
        <mesh>
          <boxGeometry args={[plaqueW + 0.12, plaqueH + 0.12, 0.045]} />
          <meshStandardMaterial
            color={GOLD}
            metalness={0.2}
            roughness={0.3}
            emissive={GOLD}
            emissiveIntensity={0.35}
          />
        </mesh>
        {/* Navy board */}
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[plaqueW, plaqueH, 0.03]} />
          <meshStandardMaterial color={NAVY} roughness={0.5} metalness={0.3} />
        </mesh>
        {/* Inner bevel */}
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[plaqueW - 0.06, plaqueH - 0.06]} />
          <meshStandardMaterial color="#16283f" roughness={0.6} />
        </mesh>
        {/* Gold corner studs */}
        {[
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1],
        ].map(([sx, sy], i) => (
          <mesh key={i} position={[sx * (plaqueW / 2), sy * (plaqueH / 2), 0.05]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshStandardMaterial color={GOLD} metalness={0.85} roughness={0.25} />
          </mesh>
        ))}
        {/* Title */}
        <Text
          onSync={handlePlaqueSync}
          position={[0, 0, 0.055]}
          fontSize={PLAQUE_FONT}
          letterSpacing={0.04}
          color={GOLD}
          anchorX="center"
          anchorY="middle"
          raycast={() => null}
          font="/fonts/PlusJakartaSans.ttf"
        >
          KARYA UNGGULAN
        </Text>
      </group>

      {/* ==== Works at full wall size with their info plaques ==== */}
      {list.map((project, i) => (
        <group key={project.id} position={[slots[i], BOTTOM_Y, -0.045]}>
          <Painting project={project} position={[0, 0, 0]} rotationY={0} railY={null} goldPlaque={true} />
        </group>
      ))}

      {/* ==== Velvet rope barrier for the exclusive feel ==== */}
      <Stanchion x={-2.75} z={1.45} />
      <Stanchion x={2.75} z={1.45} />
      <mesh position={[0, 0.72, 1.45]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.042, 0.042, 5.35, 12]} />
        <meshStandardMaterial color={VELVET} roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.7, 1.46]}>
        <boxGeometry args={[5.4, 0.06, 0.05]} />
        <meshStandardMaterial color={GOLD} metalness={0.85} roughness={0.25} />
      </mesh>

      {/* ==== Floor label in front ==== */}
      <Text
        position={[0, 0.05, -1.2]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.12}
        letterSpacing={0.05}
        color="#7dd3fc"
        anchorX="center"
        anchorY="middle"
        raycast={() => null}
      >
        KARYA UNGGULAN
      </Text>

      {/* ==== Spotlight: only on high quality to keep the light count low ==== */}
      {tier === "tinggi" && (
        <spotLight
          ref={spot}
          position={[0, 6.5, 0]}
          angle={0.65}
          penumbra={0.6}
          intensity={340}
          distance={16}
          color="#e6f4ff"
        />
      )}
    </group>
  )
}

export default FeaturedWork
