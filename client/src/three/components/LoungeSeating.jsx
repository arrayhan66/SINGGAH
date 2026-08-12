import { Plant } from "./Props"
import {
  LOUNGE_LAYOUT,
  LOUNGE_RADIUS,
  LOUNGE_TOPIARIES,
  TOPIARY_RADIUS,
  CHAIR_LOCAL_OFFSETS,
  loungeWorldPos,
  loungeRotationY,
} from "../utils/loungeLayout"

const WOOD = "#5a4028"
const FABRIC = "#3f5a7f"

function TableVase() {
  return (
    <group position={[0, 0.88, 0]}>
      <mesh>
        <cylinderGeometry args={[0.11, 0.07, 0.22, 12]} />
        <meshStandardMaterial color="#e8e4dc" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.02, 0.025, 0.17, 6]} />
        <meshStandardMaterial color="#3a3322" roughness={0.7} />
      </mesh>
      {[
        [0, 0, 0],
        [-0.06, 0.01, 0.04],
        [0.06, 0.015, -0.04],
        [-0.02, 0, -0.06],
        [0.04, 0, 0.06],
      ].map((s, i) => (
        <mesh key={i} position={[s[0], 0.26, s[2]]}>
          <sphereGeometry args={[0.075, 10, 10]} />
          <meshStandardMaterial color={i % 2 ? "#60a5fa" : "#f8fafc"} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

function TableLamp() {
  return (
    <group position={[0, 0.88, 0]}>
      <mesh>
        <cylinderGeometry args={[0.15, 0.17, 0.05, 16]} />
        <meshStandardMaterial color="#8a5a2b" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.46, 0]}>
        <cylinderGeometry args={[0.03, 0.05, 0.88, 12]} />
        <meshStandardMaterial color="#6b4f2f" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.63, 0]}>
        <cylinderGeometry args={[0.24, 0.3, 0.32, 16]} />
        <meshStandardMaterial color="#f5d488" emissive="#ffd98a" emissiveIntensity={1.6} />
      </mesh>
    </group>
  )
}

function Table({ lamp = false }) {
  return (
    <group>
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.85, 0.85, 0.09, 32]} />
        <meshStandardMaterial color={WOOD} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.12, 0.17, 0.78, 16]} />
        <meshStandardMaterial color={WOOD} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.045, 0]}>
        <cylinderGeometry args={[0.5, 0.55, 0.09, 24]} />
        <meshStandardMaterial color={WOOD} roughness={0.55} />
      </mesh>
      {lamp ? <TableLamp /> : <TableVase />}
    </group>
  )
}

function Chair({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      {[
        [-0.33, 0, -0.28],
        [0.33, 0, -0.28],
        [-0.33, 0, 0.28],
        [0.33, 0, 0.28],
      ].map((p, i) => (
        <mesh key={i} position={[p[0], 0.28, p[2]]} castShadow>
          <boxGeometry args={[0.11, 0.56, 0.11]} />
          <meshStandardMaterial color={WOOD} roughness={0.55} />
        </mesh>
      ))}
      <mesh position={[0, 0.56, 0]} castShadow>
        <boxGeometry args={[0.95, 0.12, 0.85]} />
        <meshStandardMaterial color={FABRIC} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.62, 0.03]}>
        <boxGeometry args={[0.86, 0.08, 0.72]} />
        <meshStandardMaterial color="#e9eef6" roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.0, -0.38]} castShadow>
        <boxGeometry args={[0.95, 0.9, 0.11]} />
        <meshStandardMaterial color={FABRIC} roughness={0.9} />
      </mesh>
      <mesh position={[-0.53, 0.8, 0]}>
        <boxGeometry args={[0.11, 0.36, 0.82]} />
        <meshStandardMaterial color={WOOD} roughness={0.55} />
      </mesh>
      <mesh position={[0.53, 0.8, 0]}>
        <boxGeometry args={[0.11, 0.36, 0.82]} />
        <meshStandardMaterial color={WOOD} roughness={0.55} />
      </mesh>
    </group>
  )
}

function LoungeSeating() {
  return (
    <group>
      {LOUNGE_LAYOUT.map((g, i) => {
        const pos = loungeWorldPos(g.angle, LOUNGE_RADIUS)
        const ry = loungeRotationY(g.angle)
        return (
          <group key={i} position={pos} rotation={[0, ry, 0]}>
            <Table lamp={g.lamp} />
            {CHAIR_LOCAL_OFFSETS.map(([cx, cz], j) => (
              <Chair
                key={j}
                position={[cx, 0, cz]}
                rotation={cx > 0 ? [0, -Math.PI / 2, 0] : [0, Math.PI / 2, 0]}
              />
            ))}
          </group>
        )
      })}

      {LOUNGE_TOPIARIES.map((a, i) => {
        const [x, , z] = loungeWorldPos(a, TOPIARY_RADIUS)
        return <Plant key={`t-${i}`} position={[x, 0, z]} variant="topiary" scale={0.9} />
      })}
    </group>
  )
}

export default LoungeSeating
