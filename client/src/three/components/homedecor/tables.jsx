import { useMemo } from "react"
import { useDownscaledTexture } from "../../utils/useDownscaledTexture"
import { textures } from "../../utils/textures"
import { BOOK_COVER_FILES, DEFAULT_COVER_KEY, getRandomUniqueBookKeys } from "../../utils/bookCovers"
import { WOOD, WOOD_DARK, FABRIC_LIGHT } from "./shared.jsx"
import { DRINK_RENDER, IcedTea, Mug } from "./drinks.jsx"

function RealBook({ coverKey, x, y, z, rot = 0, w = 0.15, h = 0.03 }) {
  const pages = textures.bookPages()
  const cover = useDownscaledTexture(
    BOOK_COVER_FILES[coverKey] || BOOK_COVER_FILES[DEFAULT_COVER_KEY],
    256,
  )
  const img = cover.image
  const aspect = img && img.width ? img.width / img.height : 0.66
  const depth = w / aspect
  return (
    <group
      position={[x, y, z]}
      rotation={[0, rot, 0]}
      userData={{
        action: {
          type: "bookInfo",
          coverKey,
        },
      }}
    >
      <mesh castShadow>
        <boxGeometry args={[w, h, depth]} />
        <meshStandardMaterial map={pages} roughness={0.9} />
      </mesh>
      <mesh position={[0, h / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w - 0.012, depth - 0.012]} />
        <meshStandardMaterial map={cover} roughness={0.5} />
      </mesh>
    </group>
  )
}

function SideTable({ position, rotationY = 0, drink = "coffee", book1, book2, drinks }) {
  const [b1, b2] = useMemo(() => getRandomUniqueBookKeys(2), [])
  const finalB1 = book1 || b1
  const finalB2 = book2 || b2
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.03, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.34, 0.06, 20]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.33, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 0.55, 12]} />
        <meshStandardMaterial color={WOOD} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.58, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.42, 0.06, 24]} />
        <meshStandardMaterial color={WOOD} roughness={0.55} />
      </mesh>
      {drinks && drinks.length ? (
        <>
          {drinks.map((d, i) => {
            const Comp = DRINK_RENDER[d] || Mug
            return <Comp key={i} position={[i === 1 ? 0 : i === 0 ? -0.17 : 0.17, 0.61, -0.04]} />
          })}
          <RealBook coverKey={finalB1} w={0.16} x={0.2} y={0.624} z={-0.22} rot={0.15} />
          <RealBook coverKey={finalB2} w={0.14} x={-0.2} y={0.622} z={-0.22} rot={-0.15} />
        </>
      ) : (
        <>
          <RealBook coverKey={finalB1} w={0.16} x={0.14} y={0.626} z={0.08} rot={0.15} />
          <RealBook coverKey={finalB2} w={0.14} x={-0.14} y={0.624} z={-0.08} rot={-0.25} />
          {drink === "icedTea" ? <IcedTea position={[-0.22, 0.61, 0.14]} /> : <Mug position={[-0.22, 0.61, 0.14]} />}
        </>
      )}
    </group>
  )
}

function RoundTable({ position, rotationY = 0, radius = 0.9, height = 0.76, books = true }) {
  const top = height
  const topY = top + 0.03
  const [b1, b2] = useMemo(() => getRandomUniqueBookKeys(2), [])
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.045, 0]} castShadow>
        <cylinderGeometry args={[radius * 0.4, radius * 0.5, 0.09, 20]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.6} />
      </mesh>
      <mesh position={[0, top / 2, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.11, top - 0.09, 16]} />
        <meshStandardMaterial color={WOOD} roughness={0.55} />
      </mesh>
      <mesh position={[0, top, 0]} castShadow>
        <cylinderGeometry args={[radius, radius, 0.06, 32]} />
        <meshStandardMaterial color={WOOD} roughness={0.5} />
      </mesh>
      <mesh position={[0, topY, 0]}>
        <cylinderGeometry args={[radius - 0.06, radius - 0.06, 0.012, 32]} />
        <meshStandardMaterial color={FABRIC_LIGHT} roughness={0.6} />
      </mesh>
      {books && (
        <>
          <RealBook coverKey={b1} x={0.2} y={topY + 0.016} z={-0.18} rot={0.3} />
          <RealBook coverKey={b2} x={-0.18} y={topY + 0.015} z={0.16} rot={-0.25} />
          <Mug position={[-0.28, topY + 0.02, -0.1]} />
        </>
      )}
    </group>
  )
}
export { RealBook, SideTable, RoundTable }
