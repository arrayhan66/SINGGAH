import { useMemo } from "react"
import InstancedMeshes from "../../utils/InstancedMeshes"
import { textures } from "../../utils/textures"
import { useDownscaledTexture } from "../../utils/useDownscaledTexture"
import logo from "../../../assets/icons/logo.webp"
import { WOOD, WOOD_DARK, BRASS, FABRIC, LEAF, FABRIC_LIGHT, CREAM, CYAN, CUSHION_GEO, CUSHION_TOP_GEO, CUSHION_MAT } from "./shared.jsx"
import { DRINK_RENDER, Mug } from "./drinks.jsx"
import { RealBook } from "./tables.jsx"

// Low round table with floor cushions around it, for groups sitting lesehan.
function LesehanTable({
  position,
  rotationY = 0,
  radius = 1.15,
  cushionCount = 6,
  rug = true,
  rugRadius = 2.15,
  books = [],
  drink = null,
}) {
  const rugMap = useMemo(() => textures.roundRug(), [])
  const logoTex = useDownscaledTexture(logo, 512)
  const topH = 0.34
  const cushionColors = [FABRIC, BRASS, LEAF, FABRIC_LIGHT, CREAM, CYAN]
  const DrinkComp = drink ? DRINK_RENDER[drink.type] || Mug : null
  const cushionData = useMemo(() => {
    const base = []
    const top = []
    const colors = []
    for (let i = 0; i < cushionCount; i++) {
      const a = (i / cushionCount) * Math.PI * 2
      const x = Math.cos(a) * (radius + 0.5)
      const z = Math.sin(a) * (radius + 0.5)
      const rot = [0, -a, 0]
      base.push({ position: [x, 0.09, z], rotation: rot })
      top.push({ position: [x, 0.17, z], rotation: rot })
      colors.push(cushionColors[i % cushionColors.length])
    }
    return { base, top, colors }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cushionCount, radius])
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {rug && <RoundRug position={[0, 0.015, 0]} radius={rugRadius} map={rugMap} />}
      {/* Table base */}
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[radius * 0.45, radius * 0.55, 0.12, 24]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.6} />
      </mesh>
      {/* Table leg */}
      <mesh position={[0, topH / 2, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.12, topH - 0.12, 16]} />
        <meshStandardMaterial color={WOOD} roughness={0.55} />
      </mesh>
      {/* Low table top */}
      <mesh position={[0, topH, 0]} castShadow>
        <cylinderGeometry args={[radius, radius, 0.06, 32]} />
        <meshStandardMaterial color={WOOD} roughness={0.5} />
      </mesh>
      {/* Decorative warm inlay disc (not plain white) */}
      <mesh position={[0, topH + 0.03, 0]}>
        <cylinderGeometry args={[radius - 0.06, radius - 0.06, 0.012, 40]} />
        <meshStandardMaterial color="#e6d3a6" roughness={0.55} />
      </mesh>
      {/* Gold rim band around the inlay */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, topH + 0.037, 0]}>
        <ringGeometry args={[radius - 0.1, radius - 0.06, 48]} />
        <meshStandardMaterial color={BRASS} metalness={0.85} roughness={0.3} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-4} />
      </mesh>
      {/* SINGGAH logo in the centre */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, topH + 0.055, 0]}>
        <planeGeometry args={[radius * 0.5, radius * 0.5]} />
        <meshStandardMaterial
          map={logoTex}
          transparent
          toneMapped={false}
          emissive="#ffffff"
          emissiveMap={logoTex}
          emissiveIntensity={0.25}
          roughness={0.5}
        />
      </mesh>
      {/* Books laid on the tabletop */}
      {books.map((b, i) => (
        <RealBook
          key={i}
          coverKey={b.cover}
          x={b.x ?? 0}
          y={b.y ?? topH + 0.04}
          z={b.z ?? 0}
          rot={b.rot ?? i * 0.8}
          w={b.w ?? 0.16}
          h={b.h ?? 0.03}
        />
      ))}
      {/* Drink on the tabletop */}
      {DrinkComp && drink && <DrinkComp position={[drink.x ?? 0, topH + 0.04, drink.z ?? 0]} />}
      {/* Floor cushions for sitting lesehan */}
      <InstancedMeshes
        geometry={CUSHION_GEO}
        material={CUSHION_MAT}
        transforms={cushionData.base}
        colors={cushionData.colors}
        count={cushionData.base.length}
        castShadow
      />
      <InstancedMeshes
        geometry={CUSHION_TOP_GEO}
        material={CUSHION_MAT}
        transforms={cushionData.top}
        colors={cushionData.colors}
        count={cushionData.top.length}
      />
    </group>
  )
}

function RectRug({ position, rotationY = 0, w = 5.4, d = 1.9, map }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial map={map} roughness={0.95} />
      </mesh>
    </group>
  )
}

function RoundRug({ position, radius = 1.3, map }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={position} receiveShadow>
      <circleGeometry args={[radius, 48]} />
      <meshStandardMaterial map={map} roughness={0.95} />
    </mesh>
  )
}
export { LesehanTable, RectRug, RoundRug }
