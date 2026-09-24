import { WOOD_DARK, FABRIC, FABRIC_LIGHT, BRASS, CREAM } from "./shared.jsx"

function Armchair({ position, rotationY = 0 }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]} userData={{ action: { type: "sit" } }}>
      {[
        [-0.42, -0.4],
        [0.42, -0.4],
        [-0.42, 0.4],
        [0.42, 0.4],
      ].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.2, lz]} castShadow>
          <boxGeometry args={[0.08, 0.4, 0.08]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.55} />
        </mesh>
      ))}
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[0.95, 0.16, 0.9]} />
        <meshStandardMaterial color={FABRIC} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.54, 0.02]}>
        <boxGeometry args={[0.86, 0.08, 0.78]} />
        <meshStandardMaterial color={FABRIC_LIGHT} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.98, -0.42]} castShadow>
        <boxGeometry args={[0.95, 0.95, 0.16]} />
        <meshStandardMaterial color={FABRIC} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.02, -0.29]}>
        <boxGeometry args={[0.86, 0.75, 0.1]} />
        <meshStandardMaterial color={FABRIC_LIGHT} roughness={0.95} />
      </mesh>
      <mesh position={[-0.56, 0.78, 0]} castShadow>
        <boxGeometry args={[0.18, 0.5, 0.9]} />
        <meshStandardMaterial color={FABRIC} roughness={0.9} />
      </mesh>
      <mesh position={[0.56, 0.78, 0]} castShadow>
        <boxGeometry args={[0.18, 0.5, 0.9]} />
        <meshStandardMaterial color={FABRIC} roughness={0.9} />
      </mesh>
      <mesh position={[-0.56, 1.055, 0]}>
        <boxGeometry args={[0.18, 0.05, 0.9]} />
        <meshStandardMaterial color={FABRIC_LIGHT} roughness={0.95} />
      </mesh>
      <mesh position={[0.56, 1.055, 0]}>
        <boxGeometry args={[0.18, 0.05, 0.9]} />
        <meshStandardMaterial color={FABRIC_LIGHT} roughness={0.95} />
      </mesh>
    </group>
  )
}

function Ottoman({ position, rotationY = 0 }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {[
        [-0.2, -0.12],
        [0.2, -0.12],
        [-0.2, 0.12],
        [0.2, 0.12],
      ].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.16, lz]} castShadow>
          <boxGeometry args={[0.06, 0.32, 0.06]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.55} />
        </mesh>
      ))}
      <mesh position={[0, 0.34, 0]} castShadow>
        <boxGeometry args={[0.62, 0.24, 0.42]} />
        <meshStandardMaterial color={FABRIC} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.50, 0]}>
        <boxGeometry args={[0.54, 0.08, 0.36]} />
        <meshStandardMaterial color={FABRIC_LIGHT} roughness={0.95} />
      </mesh>
    </group>
  )
}

function FloorLamp({ position, rotationY = 0 }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.03, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.26, 0.05, 20]} />
        <meshStandardMaterial color={BRASS} metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.03, 1.85, 12]} />
        <meshStandardMaterial color={BRASS} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.72, 0]}>
        <cylinderGeometry args={[0.22, 0.3, 0.5, 16]} />
        <meshStandardMaterial color={CREAM} emissive="#ffd98a" emissiveIntensity={1.2} />
      </mesh>
    </group>
  )
}
export { Armchair, Ottoman, FloorLamp }
