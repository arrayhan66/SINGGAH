import { useMemo } from "react"
import * as THREE from "three"
import { LAYOUT, portals } from "../rooms/museumLayout"

const GUARD_H = 1.15
const GUARD_T = 0.045
const RAIL_H = 0.05
const POST_INTERVAL = 2.6
const WALL_T = 0.25

function carveGaps(from, to, cuts) {
  const sorted = cuts.filter((c) => c.b > from && c.a < to).sort((x, y) => x.a - y.a)
  const segs = []
  let cur = from
  for (const c of sorted) {
    if (c.a > cur) segs.push([cur, Math.min(c.a, to)])
    cur = Math.max(cur, c.b)
    if (cur >= to) break
  }
  if (cur < to) segs.push([cur, to])
  return segs
}

// Transparent guard-rail tracing the main hall walls. Purely visual: the wall
// collision already keeps the player out, this just makes the boundary visible.
// Openings are carved around the hall side portals so teleports stay clear.
function WallGuard() {
  const segments = useMemo(() => {
    const [hx0, hx1] = LAYOUT.hallX
    const [hz0, hz1] = LAYOUT.hallZ
    const sidePortals = portals.filter((p) => p.axis === "x" && Math.abs(p.at) <= hx1 + 0.1)
    const cutsFor = (at) =>
      sidePortals
        .filter((p) => Math.sign(p.at) === Math.sign(at))
        .map((p) => ({ a: p.from, b: p.to }))

    const out = []
    for (const [axis, at, from, to] of [
      ["x", hx0, hz0, hz1],
      ["x", hx1, hz0, hz1],
      ["z", hz0, hx0, hx1],
      ["z", hz1, hx0, hx1],
    ]) {
      const open = axis === "x" ? cutsFor(at) : []
      for (const [a, b] of carveGaps(from, to, open)) {
        out.push({ axis, at, from: a, to: b })
      }
    }
    return out
  }, [])

  return (
    <group userData={{ noCollide: true }}>
      {segments.map((s, i) => {
        const len = s.to - s.from
        const mid = (s.from + s.to) / 2
        const side = s.at < 0 ? 1 : -1
        const pos = s.at + (side * WALL_T) / 2 + side * 0.02
        const rotY = s.axis === "x" ? Math.PI / 2 : 0
        const x = s.axis === "x" ? pos : mid
        const z = s.axis === "x" ? mid : pos
        const nPosts = Math.max(2, Math.round(len / POST_INTERVAL) + 1)

        return (
          <group key={i} position={[x, 0, z]} rotation={[0, rotY, 0]}>
            <mesh position={[0, GUARD_H / 2, 0]}>
              <boxGeometry args={[len, GUARD_H, GUARD_T]} />
              <meshStandardMaterial
                color="#9fd4ff"
                transparent
                opacity={0.12}
                roughness={0.15}
                metalness={0.2}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh position={[0, GUARD_H, 0]}>
              <boxGeometry args={[len, RAIL_H, GUARD_T + 0.03]} />
              <meshStandardMaterial
                color="#7dd3fc"
                transparent
                opacity={0.55}
                emissive="#38bdf8"
                emissiveIntensity={0.7}
                roughness={0.3}
              />
            </mesh>
            {Array.from({ length: nPosts }).map((_, j) => {
              const px = -len / 2 + (len * j) / (nPosts - 1)
              return (
                <mesh key={j} position={[px, GUARD_H / 2 - 0.03, 0]}>
                  <boxGeometry args={[0.07, GUARD_H - 0.06, 0.07]} />
                  <meshStandardMaterial color="#bfe3ff" transparent opacity={0.3} roughness={0.35} />
                </mesh>
              )
            })}
          </group>
        )
      })}
    </group>
  )
}

export default WallGuard
