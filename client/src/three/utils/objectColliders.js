import { HALL_PILLARS, rooms } from "../rooms/museumLayout"
import {
  LOUNGE_LAYOUT,
  LOUNGE_RADIUS,
  LOUNGE_TOPIARIES,
  TOPIARY_RADIUS,
  CHAIR_LOCAL_OFFSETS,
  loungeWorldPos,
  loungeRotationY,
} from "./loungeLayout"

// Positions must stay in sync with the decor rendered in Museum.jsx.
const PLATFORM_RADIUS = 4.0

// Category-room furniture (must stay in sync with RoomDecorGround/RoomDecorUpper).
// The thin tabletops of LesehanTable/SideTable are filtered out of the AABB
// pass (FLAT_THRESHOLD), so they need explicit circular colliders. Each has a
// level so the mezzanine furniture only blocks mezzanine players.
const LESEHAN_RADIUS = 1.15
const LESEHAN_BIG_RADIUS = 1.8
const SIDE_TABLE_RADIUS = 0.5

// Barrier geometry must stay in sync with MuseumBarrier.jsx (posts + entrance gap).
const BARRIER_RADIUS = 6.05
const BARRIER_POSTS = 24
const BARRIER_SEG = (Math.PI * 2) / BARRIER_POSTS
const BARRIER_OPEN_CENTER = Math.PI / 2
const BARRIER_OPEN_HALF = BARRIER_SEG * 0.55

const HALL_PLANTS = [
  [-17.4, -12],
  [-17.4, 0],
  [-17.4, 12],
  [17.4, -9],
  [17.4, 9],
]

const KIOSKS = [
  { x: -4.5, z: 6 },
  { x: 4.5, z: 6 },
]

// Homey furniture (must stay in sync with Museum.jsx homey decor)
const HOME_DECOR = [
  { x: -1.8, z: 26.6, radius: 0.6 },
  { x: 0, z: 26.6, radius: 0.6 },
  { x: 1.8, z: 26.6, radius: 0.6 },
  { x: -7.35, z: -26.55, radius: 0.85 },
  { x: -5.25, z: -26.55, radius: 0.85 },
  { x: -3.15, z: -26.55, radius: 0.85 },
  { x: -1.05, z: -26.55, radius: 0.85 },
  { x: 1.05, z: -26.55, radius: 0.85 },
  { x: 3.15, z: -26.55, radius: 0.85 },
  { x: 5.25, z: -26.55, radius: 0.85 },
  { x: 7.35, z: -26.55, radius: 0.85 },
  { x: 15.0, z: 9.4, radius: 0.75 },
  { x: 13.4, z: 9.0, radius: 0.55 },
  { x: 16.35, z: 9.0, radius: 0.35 },
  { x: -15.0, z: 9.4, radius: 0.75 },
  { x: -13.4, z: 9.0, radius: 0.55 },
  { x: -16.35, z: 9.0, radius: 0.35 },
  { x: 15.0, z: -9.4, radius: 0.75 },
  { x: 13.4, z: -9.0, radius: 0.55 },
  { x: 16.35, z: -9.0, radius: 0.35 },
  { x: -15.0, z: -9.4, radius: 0.75 },
  { x: -13.4, z: -9.0, radius: 0.55 },
  { x: -16.35, z: -9.0, radius: 0.35 },
]

function wrapAngle(a) {
  while (a > Math.PI) a -= Math.PI * 2
  while (a < -Math.PI) a += Math.PI * 2
  return a
}

function barrierPoints() {
  const out = []
  for (let i = 0; i < BARRIER_POSTS; i++) {
    const a = i * BARRIER_SEG
    if (Math.abs(wrapAngle(a - BARRIER_OPEN_CENTER)) < BARRIER_OPEN_HALF) continue
    out.push({ x: Math.cos(a) * BARRIER_RADIUS, z: Math.sin(a) * BARRIER_RADIUS, angle: a })
  }
  return out
}

function barrierCircles() {
  const points = barrierPoints()
  const out = points.map((p) => ({ x: p.x, z: p.z, radius: 0.24 }))
  for (let i = 0; i < points.length; i++) {
    const p = points[i]
    const q = points[(i + 1) % points.length]
    const span = Math.abs(wrapAngle(p.angle - q.angle))
    if (span > BARRIER_SEG * 1.5) continue
    for (const t of [0.15, 0.3, 0.45, 0.55, 0.7, 0.85]) {
      out.push({ x: p.x + (q.x - p.x) * t, z: p.z + (q.z - p.z) * t, radius: 0.2 })
    }
  }
  return out
}

function loungeCircles() {
  const out = []
  for (const g of LOUNGE_LAYOUT) {
    const [x, , z] = loungeWorldPos(g.angle, LOUNGE_RADIUS)
    const ry = loungeRotationY(g.angle)
    out.push({ x, z, radius: 0.9 })
    for (const [lx, lz] of CHAIR_LOCAL_OFFSETS) {
      out.push({
        x: x + lx * Math.cos(ry) + lz * Math.sin(ry),
        z: z - lx * Math.sin(ry) + lz * Math.cos(ry),
        radius: 0.5,
      })
    }
  }
  for (const a of LOUNGE_TOPIARIES) {
    const [x, , z] = loungeWorldPos(a, TOPIARY_RADIUS)
    out.push({ x, z, radius: 0.45 })
  }
  return out
}

function roomFurnitureColliders() {
  const out = []
  for (const room of rooms) {
    if (room.id === "hall") continue
    const cx = (room.x[0] + room.x[1]) / 2
    for (const [x, z] of [
      [cx, 45],
      [cx + 3.5, 56],
      [cx - 3.5, 67],
      [cx, 78],
    ]) {
      out.push({ x, z, radius: LESEHAN_RADIUS, level: 0 })
    }
    out.push({ x: cx, z: 68, radius: LESEHAN_BIG_RADIUS, level: 1 })
    out.push({ x: room.x[1] - 8, z: 45.2, radius: SIDE_TABLE_RADIUS, level: 1 })
    out.push({ x: room.x[0] + 8, z: 45.2, radius: SIDE_TABLE_RADIUS, level: 1 })
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
    ...HALL_PLANTS.map(([x, z]) => ({ x, z, radius: 0.45 })),
    ...KIOSKS.map((k) => ({ x: k.x, z: k.z, radius: 0.75 })),
    ...HOME_DECOR,
    ...barrierCircles(),
    ...loungeCircles(),
    ...roomFurnitureColliders(),
  ]
}
