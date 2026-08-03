import { Text } from "@react-three/drei"

function Bench({ position, rotationY }) {
  const wood = "#2a3d5f"
  const cushion = "#4a6382"
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.52, 0]}>
        <boxGeometry args={[2.6, 0.12, 0.75]} />
        <meshStandardMaterial color={wood} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.56, 0]}>
        <boxGeometry args={[2.6, 0.1, 0.72]} />
        <meshStandardMaterial color={cushion} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.0, -0.3]}>
        <boxGeometry args={[2.6, 0.9, 0.1]} />
        <meshStandardMaterial color={wood} roughness={0.5} />
      </mesh>
      <mesh position={[-1.15, 0.26, 0]}>
        <boxGeometry args={[0.14, 0.52, 0.7]} />
        <meshStandardMaterial color={wood} roughness={0.5} />
      </mesh>
      <mesh position={[1.15, 0.26, 0]}>
        <boxGeometry args={[0.14, 0.52, 0.7]} />
        <meshStandardMaterial color={wood} roughness={0.5} />
      </mesh>
    </group>
  )
}

function Pedestal({ position, radius = 0.35, top = "sphere" }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[radius + 0.06, radius + 0.12, 0.12, 24]} />
        <meshStandardMaterial color="#93b4d4" roughness={0.4} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[radius * 0.82, radius, 0.9, 24]} />
        <meshStandardMaterial color="#7f97b5" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <cylinderGeometry args={[radius + 0.02, radius * 0.8, 0.1, 24]} />
        <meshStandardMaterial color="#93b4d4" roughness={0.4} metalness={0.15} />
      </mesh>
      {top === "sphere" ? (
        <mesh position={[0, 1.22, 0]}>
          <sphereGeometry args={[0.14, 20, 20]} />
          <meshStandardMaterial color="#7dd3fc" metalness={0.9} roughness={0.2} />
        </mesh>
      ) : (
        <mesh position={[0, 1.28, 0]}>
          <coneGeometry args={[0.12, 0.3, 16]} />
          <meshStandardMaterial color="#7dd3fc" metalness={0.9} roughness={0.2} />
        </mesh>
      )}
    </group>
  )
}

function Plant({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.3, 0.24, 0.44, 20]} />
        <meshStandardMaterial color="#5a4a2b" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.05, 0.09, 0.6, 10]} />
        <meshStandardMaterial color="#3a3322" roughness={0.7} />
      </mesh>
      {[[0.3, 0.5, 0.1], [-0.25, 0.6, 0.2], [0.05, 0.75, -0.2], [-0.15, 0.5, -0.25], [0.2, 0.7, 0.22]].map(
        (p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.3, 12, 12]} />
            <meshStandardMaterial color="#3a6a5a" roughness={0.85} />
          </mesh>
        ),
      )}
    </group>
  )
}

function Chandelier({ position, lit = 0.8 }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.8, 10]} />
        <meshStandardMaterial color="#223047" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[0.9, 0.06, 10, 40]} />
        <meshStandardMaterial color="#7f97b5" metalness={0.85} roughness={0.25} />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 0.9, -0.12, Math.sin(a) * 0.9]}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshStandardMaterial
              color="#dff0ff"
              emissive="#9cc6f0"
              emissiveIntensity={lit * 2.2}
            />
          </mesh>
        )
      })}
      <mesh position={[0, -0.28, 0]}>
        <cylinderGeometry args={[0.16, 0.2, 0.14, 16]} />
        <meshStandardMaterial
          color="#dff0ff"
          emissive="#9cc6f0"
          emissiveIntensity={lit * 1.8}
        />
      </mesh>
    </group>
  )
}

function InfoPanel({ position, rotationY, entries = [] }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 1.0, -0.62]}>
        <boxGeometry args={[0.4, 0.12, 0.66]} />
        <meshStandardMaterial color="#223047" roughness={0.45} metalness={0.6} />
      </mesh>
      <mesh position={[0, 1.02, 0]}>
        <boxGeometry args={[1.75, 1.52, 0.07]} />
        <meshStandardMaterial color="#16283f" roughness={0.35} metalness={0.5} />
      </mesh>
      <mesh position={[0, 1.9, 0]}>
        <boxGeometry args={[1.75, 0.05, 0.07]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.2} />
      </mesh>
      <Text
        position={[0, 1.64, 0.04]}
        fontSize={0.2}
        color="#7dd3fc"
        anchorX="center"
        anchorY="middle"
        raycast={() => null}
      >
        RUANG KARYA
      </Text>
      {entries.map((e, i) => (
        <group key={i} position={[0, 1.12 - i * 0.42, 0.04]}>
          <mesh position={[-0.72, 0, 0]}>
            <boxGeometry args={[0.07, 0.07, 0.02]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.3} />
          </mesh>
          <Text
            position={[-0.62, 0, 0]}
            fontSize={0.17}
            color="#e2e8f0"
            anchorX="left"
            anchorY="middle"
            maxWidth={1.15}
            raycast={() => null}
          >
            {e.title}
          </Text>
          <Text
            position={[0.76, 0, 0]}
            fontSize={0.17}
            color="#93c5fd"
            anchorX="right"
            anchorY="middle"
            raycast={() => null}
          >
            {e.count}
          </Text>
        </group>
      ))}
    </group>
  )
}

function InfoKiosk({ position, rotationY }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[0.6, 0.1, 0.5]} />
        <meshStandardMaterial color="#223047" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[0.15, 1.3, 0.1]} />
        <meshStandardMaterial color="#16283f" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0, 1.45, 0.05]} rotation={[-0.2, 0, 0]} castShadow>
        <boxGeometry args={[0.75, 0.5, 0.06]} />
        <meshStandardMaterial color="#0b1220" roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0, 1.45, 0.085]} rotation={[-0.2, 0, 0]}>
        <planeGeometry args={[0.68, 0.42]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
      <mesh position={[0, 1.45, 0.078]} rotation={[-0.2, 0, 0]}>
        <ringGeometry args={[0.35, 0.38, 32]} />
        <meshBasicMaterial color="#7dd3fc" transparent opacity={0.4} />
      </mesh>
    </group>
  )
}

function WallSconce({ position, rotationY }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[0.16, 0.8, 0.04]} />
        <meshStandardMaterial color="#223047" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[0.08, 0.7, 0.05]} />
        <meshStandardMaterial color="#dff2ff" emissive="#38bdf8" emissiveIntensity={2.5} />
      </mesh>
    </group>
  )
}

export { Bench, Pedestal, Plant, Chandelier, InfoPanel, InfoKiosk, WallSconce }
