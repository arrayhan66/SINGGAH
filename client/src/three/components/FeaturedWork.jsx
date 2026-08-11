import { useCallback, useEffect, useRef, useState } from "react"
import { Text } from "@react-three/drei"
import Painting from "./Painting"
import { useQualityStore } from "../hooks/useQuality"
import { PAINTING_SIZE } from "../rooms/museumLayout"

const GOLD = "#c9a35e"
const MARBLE = "#eef3f9"
const PANEL = "#dfe9f4"

// Full-size frames centered on the 7.0m podium top. Raised so each frame's
// info plaque sits clear above the podium top slab. HALF_FRAME is half the
// full frame width (canvas + 0.34m gold rim); FRAME_GAP keeps the two works
// apart so their frames never touch each other.
const BOTTOM_Y = 3.35
const HALF_FRAME = (PAINTING_SIZE.w + 0.34) / 2
const FRAME_GAP = 0.45
const PLAQUE_FONT = 0.3
const PLAQUE_PAD_X = 0.55
const PLAQUE_PAD_Y = 0.25

function FeaturedWork({ position = [0, 0, 0], rotationY = 0, projects = [] }) {
  const tier = useQualityStore((s) => s.tier)
  const group = useRef()
  const spot = useRef()
  const list = (projects || []).slice(0, 2)
  const slots = list.length === 2 ? [-(HALF_FRAME + FRAME_GAP), HALF_FRAME + FRAME_GAP] : [0]

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
      {/* ---- Podium base + column ---- */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[7.0, 0.16, 1.2]} />
        <meshStandardMaterial color="#223047" roughness={0.5} metalness={0.35} />
      </mesh>
      <mesh position={[0, 0.77, 0]}>
        <boxGeometry args={[6.8, 1.0, 1.0]} />
        <meshStandardMaterial color={MARBLE} roughness={0.4} metalness={0.05} />
      </mesh>

      {/* ---- Gold bands + top slab ---- */}
      <mesh position={[0, 0.19, 0]}>
        <boxGeometry args={[6.9, 0.06, 1.12]} />
        <meshStandardMaterial color={GOLD} metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0, 1.22, 0]}>
        <boxGeometry args={[6.9, 0.06, 1.12]} />
        <meshStandardMaterial color={GOLD} metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0, 1.36, 0]}>
        <boxGeometry args={[7.0, 0.14, 1.2]} />
        <meshStandardMaterial color="#dfe9f4" roughness={0.35} metalness={0.1} />
      </mesh>

      {/* ---- Backboard panel the frames rest against ---- */}
      <mesh position={[0, 3.4, -0.08]}>
        <boxGeometry args={[6.6, 3.9, 0.1]} />
        <meshStandardMaterial color={PANEL} roughness={0.6} metalness={0.3} />
      </mesh>

      {/* ---- Info plaque on the podium face: gold frame + navy board,
      sized to hug the text (bigger font, taller & wider board) ---- */}
      <group position={[0, 0.72, 0.51]}>
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
          <meshStandardMaterial color="#0f2036" roughness={0.5} metalness={0.3} />
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

      {/* ---- Works at full wall size with their info plaques ---- */}
      {list.map((project, i) => (
        <group key={project.id} position={[slots[i], BOTTOM_Y, 0.05]}>
          <Painting project={project} position={[0, 0, 0]} rotationY={0} railY={null} goldPlaque={true} />
        </group>
      ))}

      {/* ---- Floor label in front ---- */}
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

      {/* ---- Spotlight: only on high quality to keep the light count low ---- */}
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
