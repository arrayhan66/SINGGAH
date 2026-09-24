import * as THREE from "three"

function Mug({ position }) {
  return (
    <group position={position}>
      {/* saucer */}
      <mesh position={[0, 0.006, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.048, 0.012, 20]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
      </mesh>
      {/* cup body */}
      <mesh position={[0, 0.052, 0]} castShadow>
        <cylinderGeometry args={[0.036, 0.028, 0.085, 20]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.35} />
      </mesh>
      {/* handle */}
      <mesh position={[0.034, 0.052, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.024, 0.007, 8, 24]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.35} />
      </mesh>
      {/* coffee surface */}
      <mesh position={[0, 0.096, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.01, 20]} />
        <meshStandardMaterial color="#4a2f1b" roughness={0.25} />
      </mesh>
      {/* steam */}
      <mesh position={[0, 0.135, 0]}>
        <sphereGeometry args={[0.009, 6, 6]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.4} />
      </mesh>
      <mesh position={[-0.012, 0.155, 0.012]}>
        <sphereGeometry args={[0.006, 6, 6]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.28} />
      </mesh>
    </group>
  )
}

function IcedTea({ position }) {
  return (
    <group position={position}>
      {/* Coaster */}
      <mesh position={[0, 0.005, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.055, 0.01, 20]} />
        <meshStandardMaterial color="#8a5a2b" roughness={0.5} />
      </mesh>
      {/* Tall glass */}
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.032, 0.026, 0.14, 20]} />
        <meshStandardMaterial color="#e0f2fe" transparent opacity={0.35} roughness={0.1} />
      </mesh>
      {/* Tea liquid */}
      <mesh position={[0, 0.075, 0]}>
        <cylinderGeometry args={[0.029, 0.024, 0.12, 16]} />
        <meshStandardMaterial color="#d97706" transparent opacity={0.85} roughness={0.2} />
      </mesh>
      {/* Ice cubes */}
      <mesh position={[0.01, 0.11, 0.01]} rotation={[0.3, 0.5, 0]}>
        <boxGeometry args={[0.018, 0.018, 0.018]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.65} roughness={0.2} />
      </mesh>
      <mesh position={[-0.008, 0.1, -0.01]} rotation={[-0.2, 0.4, 0.2]}>
        <boxGeometry args={[0.015, 0.015, 0.015]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.65} roughness={0.2} />
      </mesh>
      {/* Straw */}
      <mesh position={[0.012, 0.1, 0.012]} rotation={[0.2, 0, -0.15]}>
        <cylinderGeometry args={[0.003, 0.003, 0.19, 8]} />
        <meshStandardMaterial color="#ef4444" roughness={0.4} />
      </mesh>
    </group>
  )
}

function GreenTea({ position }) {
  return (
    <group position={position}>
      {/* Saucer */}
      <mesh position={[0, 0.006, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.048, 0.012, 20]} />
        <meshStandardMaterial color="#dbe7f5" roughness={0.4} />
      </mesh>
      {/* Tall glass */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.027, 0.09, 20]} />
        <meshStandardMaterial color="#e0f2fe" transparent opacity={0.4} roughness={0.1} />
      </mesh>
      {/* Green tea liquid */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.031, 0.024, 0.072, 16]} />
        <meshStandardMaterial color="#7fb069" transparent opacity={0.85} roughness={0.2} />
      </mesh>
      {/* Teabag string */}
      <mesh position={[-0.028, 0.1, 0.01]} rotation={[0, 0, 0.35]}>
        <cylinderGeometry args={[0.003, 0.003, 0.09, 6]} />
        <meshStandardMaterial color="#d9c9a3" roughness={0.6} />
      </mesh>
      {/* Teabag tag */}
      <mesh position={[-0.042, 0.125, 0.005]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.02, 0.026, 0.004]} />
        <meshStandardMaterial color="#f3ecd9" roughness={0.6} />
      </mesh>
      {/* Steam */}
      <mesh position={[0, 0.12, 0]}>
        <sphereGeometry args={[0.009, 6, 6]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.4} />
      </mesh>
      <mesh position={[-0.012, 0.14, 0.012]}>
        <sphereGeometry args={[0.006, 6, 6]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.28} />
      </mesh>
    </group>
  )
}

function Mixue({ position }) {
  return (
    <group position={position}>
      {/* Coaster */}
      <mesh position={[0, 0.005, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.055, 0.01, 20]} />
        <meshStandardMaterial color="#8a5a2b" roughness={0.5} />
      </mesh>
      {/* Clear cup */}
      <mesh position={[0, 0.07, 0]} castShadow>
        <cylinderGeometry args={[0.032, 0.024, 0.13, 20]} />
        <meshStandardMaterial color="#f8fafc" transparent opacity={0.6} roughness={0.15} />
      </mesh>
      {/* Milk tea liquid */}
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.03, 0.022, 0.112, 16]} />
        <meshStandardMaterial color="#d9b38c" transparent opacity={0.9} roughness={0.2} />
      </mesh>
      {/* Boba pearls at the bottom */}
      {[
        [0.012, 0.02, 0.006],
        [-0.011, 0.024, -0.008],
        [0, 0.016, 0.011],
        [0.009, 0.014, -0.012],
        [-0.004, 0.012, 0.006],
      ].map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.0055, 8, 8]} />
          <meshStandardMaterial color="#2b1810" roughness={0.6} />
        </mesh>
      ))}
      {/* Dome lid */}
      <mesh position={[0, 0.14, 0]} scale={[1, 0.45, 1]}>
        <sphereGeometry args={[0.032, 16, 8]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* Wide straw */}
      <mesh position={[0.015, 0.1, 0.015]} rotation={[0.15, 0, -0.1]}>
        <cylinderGeometry args={[0.006, 0.006, 0.17, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
    </group>
  )
}

const DRINK_RENDER = {
  coffee: Mug,
  icedTea: IcedTea,
  greenTea: GreenTea,
  mixue: Mixue,
}
export { DRINK_RENDER, IcedTea, GreenTea, Mixue, Mug }
