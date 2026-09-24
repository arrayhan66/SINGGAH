import { useMemo } from "react"
import { mulberry32, CYAN, LEAF_DARK } from "./shared.jsx"

function Flower({ position = [0, 0, 0], rotation = [0, 0, 0], color = "#38bdf8", size = 1 }) {
  const petalLen = 0.15 * size
  const petals = Array.from({ length: 6 }).map((_, i) => {
    const a = (i / 6) * Math.PI * 2
    return (
      <group
        key={i}
        position={[Math.cos(a) * petalLen * 0.45, Math.sin(a) * petalLen * 0.45, 0]}
        rotation={[0, 0, a]}
      >
        <mesh scale={[1, 0.5, 0.3]} castShadow>
          <sphereGeometry args={[petalLen * 0.5, 10, 8]} />
          <meshStandardMaterial color={color} roughness={0.45} />
        </mesh>
      </group>
    )
  })
  return (
    <group position={position} rotation={rotation}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        {petals}
        <mesh position={[0, 0, 0.012]}>
          <sphereGeometry args={[0.055 * size, 12, 10]} />
          <meshStandardMaterial
            color="#fde047"
            emissive="#facc15"
            emissiveIntensity={0.45}
            roughness={0.4}
          />
        </mesh>
      </group>
    </group>
  )
}

function HangingPlant({ position, drop = 0.85, seed = 0 }) {
  const rand = useMemo(() => {
    const s =
      seed ||
      Math.round((position[0] + 3) * 31 + (position[2] + 3) * 17 + drop * 100) + 7
    return mulberry32(s >>> 0)
  }, [seed, position, drop])

  const potR = 0.18
  const potTop = -drop - 0.1

  const ropeStrands = [
    { p: [0.005, 0, 0], r: 0.1 },
    { p: [-0.005, 0, 0], r: -0.12 },
    { p: [0, 0, 0.005], r: 0.07 },
    { p: [0, 0, -0.005], r: -0.09 },
  ]

  // Big blue blossoms bursting out of the pot — the star of the hanging plant
  const flowerColors = ["#7dd3fc", "#38bdf8", "#0ea5e9", "#93c5fd"]
  const flowers = Array.from({ length: 12 }).map((_, i) => {
    const a = rand() * Math.PI * 2
    const r = potR * (0.1 + rand() * 0.75)
    const y = -drop - 0.05 + rand() * 0.34
    const col = flowerColors[(rand() * flowerColors.length) | 0]
    return (
      <Flower
        key={`f-${i}`}
        position={[Math.cos(a) * r, y, Math.sin(a) * r]}
        rotation={[(rand() - 0.5) * 0.9, rand() * Math.PI, (rand() - 0.5) * 0.9]}
        color={col}
        size={1.5 + rand() * 0.7}
      />
    )
  })

  // Trailing vines cascading below the pot with blossoms at the tips
  const vines = Array.from({ length: 5 }).map((_, vi) => {
    const a = rand() * Math.PI * 2
    const vlen = 0.45 + rand() * 0.55
    const baseX = Math.cos(a) * potR * 0.8
    const baseZ = Math.sin(a) * potR * 0.8
    return (
      <group key={`v-${vi}`}>
        <mesh
          position={[baseX, potTop - (vlen * 0.6) / 2, baseZ]}
          rotation={[vlen > 0.7 ? 0.4 : 0.25, a, 0]}
        >
          <cylinderGeometry args={[0.007, 0.013, vlen * 0.6, 6]} />
          <meshStandardMaterial color={LEAF_DARK} roughness={0.9} />
        </mesh>
        <Flower
          position={[
            baseX + Math.cos(a + 0.9) * 0.04,
            potTop - vlen * 0.58,
            baseZ + Math.sin(a + 0.9) * 0.04,
          ]}
          rotation={[0.8, a, 0.3]}
          color={flowerColors[(rand() * flowerColors.length) | 0]}
          size={0.9 + rand() * 0.4}
        />
      </group>
    )
  })

  return (
    <group position={position}>
      {/* Hook loop */}
      <mesh position={[0, 0.02, 0]}>
        <torusGeometry args={[0.032, 0.008, 8, 20]} />
        <meshStandardMaterial color="#9aa7b8" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Twisted rope */}
      {ropeStrands.map((s, i) => (
        <mesh key={i} position={[s.p[0], -drop / 2 + 0.03, s.p[2]]} rotation={[0, 0, s.r]}>
          <cylinderGeometry args={[0.005, 0.005, drop - 0.06, 6]} />
          <meshStandardMaterial color="#b9a98c" roughness={0.9} />
        </mesh>
      ))}

      {/* Ceramic pot with rim */}
      <mesh position={[0, potTop + 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 0.2, 16]} />
        <meshStandardMaterial color={CYAN} roughness={0.4} />
      </mesh>
      <mesh position={[0, potTop + 0.165, 0]}>
        <cylinderGeometry args={[0.175, 0.175, 0.03, 16]} />
        <meshStandardMaterial color={CYAN} roughness={0.35} />
      </mesh>
      <mesh position={[0, potTop + 0.02, 0]}>
        <cylinderGeometry args={[0.09, 0.12, 0.04, 14]} />
        <meshStandardMaterial color="#2f5a4a" roughness={0.6} />
      </mesh>

      {/* Soil */}
      <mesh position={[0, potTop + 0.15, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.015, 16]} />
        <meshStandardMaterial color="#3b2a1a" roughness={1} />
      </mesh>

      {flowers}
      {vines}
    </group>
  )
}
export { HangingPlant }
