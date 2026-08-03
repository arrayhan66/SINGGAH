import { useMemo } from "react"
import { textures } from "../utils/textures"

const DOOR_H = 4.2
const DOOR_T = 0.06
const FACE_Z = 0.16 // flush panel proud of the +z wall face (wall half-thickness 0.125)

function ArchDoor({ position, rotationY, width }) {
  const steelMap = useMemo(() => textures.steel(), [])
  const hw = width / 2

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Flush door panel */}
      <mesh position={[0, DOOR_H / 2, FACE_Z]} castShadow>
        <boxGeometry args={[width - 0.08, DOOR_H - 0.08, DOOR_T]} />
        <meshStandardMaterial color="#15263f" metalness={0.5} roughness={0.35} />
      </mesh>

      {/* Thin flush trim around the door */}
      <mesh position={[0, DOOR_H + 0.03, FACE_Z]}>
        <boxGeometry args={[width + 0.2, 0.06, 0.1]} />
        <meshStandardMaterial map={steelMap} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[-hw - 0.03, DOOR_H / 2, FACE_Z]}>
        <boxGeometry args={[0.06, DOOR_H + 0.06, 0.1]} />
        <meshStandardMaterial map={steelMap} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[hw + 0.03, DOOR_H / 2, FACE_Z]}>
        <boxGeometry args={[0.06, DOOR_H + 0.06, 0.1]} />
        <meshStandardMaterial map={steelMap} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Threshold glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0.55]}>
        <planeGeometry args={[width + 0.4, 1.4]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#38bdf8"
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  )
}

export default ArchDoor
