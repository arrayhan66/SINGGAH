import { useMemo } from "react"
import { textures } from "../utils/textures"
import { MUSEUM } from "../rooms/museumLayout"
import { Bench } from "./Props"
import { FloorLamp, SideTable, RoundRug, HangingPlant, RealBook } from "./HomeDecor"

// Each bench uses its own set of 4 covers so no two benches repeat a book.
const BENCH_BOOK_SETS = {
  A: { table: ["atomic", "teras"], seat: ["bintang", "eragon"] },
  B: { table: ["golang", "fullstack"], seat: ["sherlock", "demon"] },
  C: { table: ["python", "cpp"], seat: ["einstein", "gus"] },
  D: { table: ["atta", "aku"], seat: ["stephenking", "samuel"] },
}

function BenchNook({ position, rotationY = 0.45, side = "left", set = "A" }) {
  const rugMap = useMemo(() => textures.roundRug(), [])
  const sideX = side === "left" ? 1 : -1
  const H = MUSEUM.height
  const books = BENCH_BOOK_SETS[set] || BENCH_BOOK_SETS.A

  return (
    <group>
      {/* Furniture cluster in the bench's local frame (mirrors cleanly) */}
      <group position={position} rotation={[0, rotationY, 0]}>
        <Bench position={[0, 0, 0]} rotationY={0} />
        <RoundRug position={[0, 0.015, 0.6]} radius={1.7} map={rugMap} />
        <SideTable
          position={[0, 0, 1.35]}
          rotationY={Math.PI}
          drinks={side === "left" ? ["coffee", "greenTea", "mixue"] : ["icedTea", "greenTea", "mixue"]}
          book1={books.table[0]}
          book2={books.table[1]}
        />
        <FloorLamp position={[-1.8 * sideX, 0, 0.35]} rotationY={0.4 * sideX} />
        {/* Books lying flat on the seat, portrait covers face up */}
        <RealBook
          coverKey={books.seat[0]}
          w={0.16}
          x={-0.62 * sideX}
          y={0.595}
          z={-0.12}
          rot={0.15 * sideX}
        />
        <RealBook
          coverKey={books.seat[1]}
          w={0.14}
          x={-0.42 * sideX}
          y={0.595}
          z={-0.16}
          rot={-0.1 * sideX}
        />
        <HangingPlant position={[0, H - 0.55, -0.2]} drop={1.1} />
      </group>
    </group>
  )
}

export default BenchNook
