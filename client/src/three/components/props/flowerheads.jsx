// ---- 5 flower types, each with its own silhouette ----

function DaisyHead() {
  const petals = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2
    return (
      <mesh key={i} position={[Math.cos(a) * 0.075, 0, Math.sin(a) * 0.075]} scale={[1, 0.35, 0.55]}>
        <sphereGeometry args={[0.06, 10, 8]} />
        <meshStandardMaterial color="#fdfdf8" roughness={0.45} />
      </mesh>
    )
  })
  return (
    <group>
      {petals}
      <mesh>
        <sphereGeometry args={[0.055, 12, 10]} />
        <meshStandardMaterial color="#facc15" roughness={0.4} />
      </mesh>
    </group>
  )
}

function TulipHead({ color }) {
  const petals = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2
    return (
      <mesh
        key={i}
        position={[Math.cos(a) * 0.048, 0.02, Math.sin(a) * 0.048]}
        rotation={[Math.sin(a) * 0.38, -a, Math.cos(a) * 0.38]}
        scale={[0.75, 1.15, 0.5]}
      >
        <sphereGeometry args={[0.07, 12, 10]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    )
  })
  return (
    <group>
      {petals}
      <mesh position={[0, 0.01, 0]}>
        <sphereGeometry args={[0.05, 10, 8]} />
        <meshStandardMaterial color="#8a3a52" roughness={0.5} />
      </mesh>
    </group>
  )
}

function LavenderHead() {
  const buds = Array.from({ length: 8 }, (_, i) => {
    const t = i / 7
    return (
      <mesh key={i} position={[0, t * 0.18, 0]} scale={[1 - t * 0.55, 1.25, 1 - t * 0.55]}>
        <sphereGeometry args={[0.034, 8, 8]} />
        <meshStandardMaterial color={i % 2 ? "#8b7cd8" : "#a78bfa"} roughness={0.55} />
      </mesh>
    )
  })
  return <group>{buds}</group>
}



function OrchidHead({ color }) {
  return (
    <group>
      {/* two broad lateral petals */}
      {[-1, 1].map((s) => (
        <mesh key={`l-${s}`} position={[s * 0.095, 0.01, 0.01]} rotation={[0.15, 0, s * -0.5]} scale={[1.5, 1, 0.35]}>
          <sphereGeometry args={[0.085, 12, 10]} />
          <meshStandardMaterial color={color} roughness={0.45} />
        </mesh>
      ))}
      {/* two dorsal petals */}
      {[-1, 1].map((s) => (
        <mesh key={`d-${s}`} position={[s * 0.05, 0.085, -0.02]} rotation={[-0.5, 0, s * -0.9]} scale={[1, 1.2, 0.35]}>
          <sphereGeometry args={[0.07, 12, 10]} />
          <meshStandardMaterial color={color} roughness={0.45} />
        </mesh>
      ))}
      {/* contrasting lip */}
      <mesh position={[0, -0.045, 0.05]} rotation={[0.7, 0, 0]} scale={[1, 0.6, 0.8]}>
        <sphereGeometry args={[0.055, 12, 10]} />
        <meshStandardMaterial color="#c026d3" roughness={0.4} />
      </mesh>
      {/* column */}
      <mesh position={[0, 0.005, 0.035]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.35} />
      </mesh>
    </group>
  )
}

function FlowerHead({ type, color }) {
  if (type === "tulip") return <TulipHead color={color} />
  if (type === "lavender") return <LavenderHead />
  if (type === "orchid") return <OrchidHead color={color} />
  return <DaisyHead />
}
export { DaisyHead, TulipHead, LavenderHead, OrchidHead, FlowerHead }
