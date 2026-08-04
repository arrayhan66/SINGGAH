import { HALL_PILLARS, rooms } from "../rooms/museumLayout"

// Positions must stay in sync with the decor rendered in Museum.jsx.
const PLATFORM_RADIUS = 4.0

const BENCHES = [
  { x: -12, z: -25, ry: 0.45 },
  { x: 12, z: -25, ry: -0.45 },
  { x: -12, z: 25, ry: Math.PI - 0.45 },
  { x: 12, z: 25, ry: -Math.PI + 0.45 },
]

const HALL_PLANTS = [
  [-17.4, -22.5],
  [-17.4, -12],
  [-17.4, 0],
  [-17.4, 12],
  [-17.4, 22.5],
  [17.4, -22.5],
  [17.4, -9],
  [17.4, 9],
  [17.4, 22.5],
]

const KIOSKS = [
  { x: -4.5, z: 6 },
  { x: 4.5, z: 6 },
]

function benchCircles() {
  const out = []
  for (const b of BENCHES) {
    for (const off of [-0.85, 0, 0.85]) {
      out.push({
        x: b.x + Math.cos(b.ry) * off,
        z: b.z - Math.sin(b.ry) * off,
        radius: 0.5,
      })
    }
  }
  return out
}

function pedestalCircles() {
  const out = []
  for (const room of rooms) {
    if (room.floor === "marble") continue
    const isDosen = room.id.endsWith("-dosen")
    const cx = (room.x[0] + room.x[1]) / 2
    out.push({
      x: cx + (isDosen ? -10 : 10),
      z: isDosen ? room.z[0] + 1.6 : room.z[1] - 1.6,
      radius: 0.6,
    })
  }
  return out
}

export function getObjectColliders() {
  return [
    { x: 0, z: 0, radius: PLATFORM_RADIUS },
    ...HALL_PILLARS.map((p) => ({ x: p.position[0], z: p.position[2], radius: 0.7 })),
    ...HALL_PILLARS.map((p) => ({
      x: p.position[0] - Math.sign(p.position[0]) * 1.5,
      z: p.position[2],
      radius: 0.45,
    })),
    ...benchCircles(),
    ...HALL_PLANTS.map(([x, z]) => ({ x, z, radius: 0.45 })),
    ...KIOSKS.map((k) => ({ x: k.x, z: k.z, radius: 0.75 })),
    ...pedestalCircles(),
  ]
}
