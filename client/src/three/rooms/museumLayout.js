import { karyaCategories } from "../../data/karyaData"

const T = 0.25
const H = 6.5

// Door / portal sizes
const DOOR_W = 2.6
const DOOR_H = 4.2
const PORTAL_W = 2.8
const PORTAL_H = 5.2

const PAINT_W = 2.2
const PAINT_H = 1.5

// Every karya room is as big as the main hall (same width & depth).
const HALL_W = 27
const HALL_DEPTH = 54
const HALL_HALF_X = HALL_W / 2
const HALL_HALF_Z = HALL_DEPTH / 2

const ROOM_W = HALL_W
const ROOM_DEPTH = HALL_DEPTH
const ZONE_DEPTH = ROOM_DEPTH / 2 // dosen / mahasiswa

// ---- Dynamic sizing from the category list ----
const N = karyaCategories.length
const ROW_X0 = -(N * ROOM_W) / 2
const ROW_X1 = ROW_X0 + N * ROOM_W
// Rooms sit flush behind the hall's front wall (front wall at z = +HALL_HALF_Z).
const ROW_Z0 = HALL_HALF_Z + T
const PARTITION_Z = ROW_Z0 + ZONE_DEPTH
const ROW_Z1 = ROW_Z0 + ROOM_DEPTH

const roomCx = (i) => ROW_X0 + i * ROOM_W + ROOM_W / 2
const roomX = (i) => [ROW_X0 + i * ROOM_W, ROW_X0 + i * ROOM_W + ROOM_W]

// ---- carving helpers ----
function carve(from, to, cuts) {
  const sorted = cuts
    .filter((c) => c.b > from && c.a < to)
    .sort((x, y) => x.a - y.a)
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

const walls = []

function addWall(axis, at, from, to, openings = []) {
  const cuts = openings.map((o) => ({ a: o.c - o.w / 2, b: o.c + o.w / 2 }))
  carve(from, to, cuts).forEach(([a, b]) =>
    walls.push({ axis, at, from: a, to: b, y0: 0, y1: H, t: T }),
  )
  for (const o of openings) {
    if (o.h < H) {
      walls.push({ axis, at, from: o.c - o.w / 2, to: o.c + o.w / 2, y0: o.h, y1: H, t: T })
    }
  }
}

// ---- Hall shell ----
// Distribute N categories exclusively across side walls (none on the straight front path)
const kLeft = Math.ceil(N / 2)
const kRight = Math.floor(N / 2)
const leftZ = kLeft === 1 ? [0] : Array.from({ length: kLeft }, (_, i) => -18 + (i * 36) / (kLeft - 1))
const rightZ = kRight === 1 ? [0] : Array.from({ length: kRight }, (_, i) => -18 + (i * 36) / (kRight - 1))

export const HALL_PORTAL_Z = leftZ

addWall(
  "x",
  -HALL_HALF_X,
  -HALL_HALF_Z,
  HALL_HALF_Z,
  leftZ.map((z) => ({ c: z, w: PORTAL_W, h: PORTAL_H })),
)
addWall(
  "x",
  HALL_HALF_X,
  -HALL_HALF_Z,
  HALL_HALF_Z,
  rightZ.map((z) => ({ c: z, w: PORTAL_W, h: PORTAL_H })),
)
// Back wall (solid, banner hangs here)
addWall("z", -HALL_HALF_Z, -HALL_HALF_X, HALL_HALF_X)
// Front wall (solid, no portals on the straight path)
addWall("z", HALL_HALF_Z, ROW_X0, ROW_X1)

// ---- Room row (behind the hall front wall) ----
addWall("x", ROW_X0, ROW_Z0, ROW_Z1)
addWall("x", ROW_X1, ROW_Z0, ROW_Z1)
for (let i = 1; i < N; i++) {
  addWall("x", ROW_X0 + i * ROOM_W, ROW_Z0, ROW_Z1)
}

for (let i = 0; i < N; i++) {
  const [x0, x1] = roomX(i)
  const cx = roomCx(i)
  addWall("z", ROW_Z0, x0, x1, [{ c: cx, w: PORTAL_W, h: PORTAL_H }]) // return portal
  addWall("z", PARTITION_Z, x0, x1, [{ c: cx, w: DOOR_W, h: DOOR_H }]) // flush door
  addWall("z", ROW_Z1, x0, x1)
}

export function getWalls() {
  return walls
}

// ---- Rooms (floors + ceilings + area labels) ----
export const rooms = [
  {
    id: "hall",
    x: [-HALL_HALF_X, HALL_HALF_X],
    z: [-HALL_HALF_Z, HALL_HALF_Z],
    zFloor: [-HALL_HALF_Z, HALL_HALF_Z],
    floor: "marble",
    label: "Hall Utama",
  },
]

for (let i = 0; i < N; i++) {
  const cat = karyaCategories[i]
  const x = roomX(i)
  rooms.push({
    id: `${cat.slug}-dosen`,
    x,
    z: [ROW_Z0, PARTITION_Z],
    zFloor: [HALL_HALF_Z, PARTITION_Z],
    floor: "wood",
    label: `${cat.title} — Ruang Dosen`,
  })
  rooms.push({
    id: `${cat.slug}-mhs`,
    x,
    z: [PARTITION_Z, ROW_Z1],
    zFloor: [PARTITION_Z, ROW_Z1],
    floor: "wood",
    label: `${cat.title} — Ruang Mahasiswa`,
  })
}

export function findRoom(x, z) {
  for (const r of rooms) {
    if (x >= r.x[0] && x <= r.x[1] && z >= r.z[0] && z <= r.z[1]) return r
  }
  return rooms[0]
}

export const roomCategories = Object.fromEntries(
  rooms
    .filter((r) => r.id !== "hall")
    .map((r) => [r.id, r.id.replace(/-(dosen|mhs)$/, "")]),
)

// ---- Portals (teleport rifts) ----
const hallPortals = []
for (let i = 0; i < kLeft; i++) {
  hallPortals.push({ axis: "x", at: -HALL_HALF_X, zc: leftZ[i] })
}
for (let i = 0; i < kRight; i++) {
  hallPortals.push({ axis: "x", at: HALL_HALF_X, zc: rightZ[i] })
}

// room -> hall (returns you to the portal you came in from)
function returnPoint(hp) {
  if (hp.at < 0) return { x: hp.at + 2.5, z: hp.zc, yaw: (Math.PI * 3) / 2 }
  return { x: hp.at - 2.5, z: hp.zc, yaw: Math.PI / 2 }
}

export const portals = []

for (let i = 0; i < hallPortals.length; i++) {
  const hp = hallPortals[i]
  const cx = roomCx(i)
  const roomZ = ROW_Z0 + 4

  portals.push({
    axis: hp.axis,
    at: hp.at,
    from: hp.zc - PORTAL_W / 2,
    to: hp.zc + PORTAL_W / 2,
    target: [cx, roomZ],
    yaw: Math.PI,
  })
  portals.push({
    axis: "z",
    at: ROW_Z0,
    from: cx - PORTAL_W / 2,
    to: cx + PORTAL_W / 2,
    target: [returnPoint(hp).x, returnPoint(hp).z],
    yaw: returnPoint(hp).yaw,
  })
}

// ---- Archways (for rendering) ----
export const archways = []

for (let i = 0; i < N; i++) {
  const hp = hallPortals[i]
  const cat = karyaCategories[i]
  const cx = roomCx(i)
  const rotY = hp.at < 0 ? Math.PI / 2 : -Math.PI / 2
  const pos = [hp.at, 0, hp.zc]
  const rp = returnPoint(hp)
  archways.push({
    kind: "portal",
    pos,
    rotY,
    width: PORTAL_W,
    title: cat.title,
    slug: cat.slug,
    target: [cx, ROW_Z0 + 4],
    yaw: Math.PI,
  })
  archways.push({
    kind: "portal",
    pos: [cx, 0, ROW_Z0],
    rotY: 0,
    width: PORTAL_W,
    title: null,
    slug: cat.slug,
    target: [rp.x, rp.z],
    yaw: rp.yaw,
  })
}

for (let i = 0; i < N; i++) {
  archways.push({
    kind: "door",
    pos: [roomCx(i), 0, PARTITION_Z],
    rotY: 0,
    width: DOOR_W,
  })
}

// ---- Painting walls per room id ----
function wallDef(axis, at, from, to, face) {
  return { axis, at, from, to, face }
}

function carveWallDefs(axis, at, from, to, face, centers, w) {
  return carve(from, to, centers.map((c) => ({ a: c - w / 2, b: c + w / 2 }))).map(([a, b]) =>
    wallDef(axis, at, a, b, face),
  )
}

export const paintingWalls = {}

for (let i = 0; i < N; i++) {
  const cat = karyaCategories[i]
  const [x0, x1] = roomX(i)
  const cx = roomCx(i)
  const dId = `${cat.slug}-dosen`
  const mId = `${cat.slug}-mhs`
  const dZ = [ROW_Z0, PARTITION_Z]
  const mZ = [PARTITION_Z, ROW_Z1]

  paintingWalls[dId] = [
    wallDef("x", x0, dZ[0], dZ[1], "+x"),
    wallDef("x", x1, dZ[0], dZ[1], "-x"),
    ...carveWallDefs("z", ROW_Z0, x0, x1, "+z", [cx], PORTAL_W),
    ...carveWallDefs("z", PARTITION_Z, x0, x1, "-z", [cx], DOOR_W),
  ]
  paintingWalls[mId] = [
    wallDef("x", x0, mZ[0], mZ[1], "+x"),
    wallDef("x", x1, mZ[0], mZ[1], "-x"),
    ...carveWallDefs("z", PARTITION_Z, x0, x1, "+z", [cx], DOOR_W),
    wallDef("z", ROW_Z1, x0, x1, "-z"),
  ]
}

function rotationYFor(face) {
  if (face === "+x") return Math.PI / 2
  if (face === "-x") return -Math.PI / 2
  if (face === "+z") return 0
  return Math.PI
}

function faceOffset(face) {
  return face === "+x" || face === "+z" ? T / 2 + 0.02 : -(T / 2 + 0.02)
}

export function layoutPaintings(roomId, projects) {
  const wallsDef = paintingWalls[roomId] || []
  const placed = []
  let pi = 0
  for (const wd of wallsDef) {
    const len = wd.to - wd.from
    const capacity = Math.max(0, Math.floor((len + 0.3) / (PAINT_W + 0.3)))
    const n = Math.min(capacity, projects.length - pi)
    for (let i = 0; i < n; i++) {
      const p = projects[pi + i]
      let fx, fz
      const t = 0.3 + ((len - 0.6) * (i + 0.5)) / n
      if (wd.axis === "x") {
        fx = wd.at + faceOffset(wd.face)
        fz = wd.from + t
      } else {
        fx = wd.from + t
        fz = wd.at + faceOffset(wd.face)
      }
      placed.push({
        project: p,
        position: [fx, 2.75, fz],
        rotationY: rotationYFor(wd.face),
        index: pi + i + 1,
        isDosen: p.authorType === "dosen",
      })
    }
    pi += n
  }
  return placed
}

export const PAINTING_SIZE = { w: PAINT_W, h: PAINT_H }

export const MUSEUM = {
  height: H,
  bounds: {
    minX: ROW_X0 - 4,
    maxX: ROW_X1 + 4,
    minZ: -HALL_HALF_Z - 4,
    maxZ: ROW_Z1 + 4,
  },
  spawn: { position: [0, 0, 4.5], yaw: 0 },
}

export const LAYOUT = {
  hallX: [-HALL_HALF_X, HALL_HALF_X],
  hallZ: [-HALL_HALF_Z, HALL_HALF_Z],
  rowX: [ROW_X0, ROW_X1],
  roomW: ROOM_W,
  roomDepth: ROOM_DEPTH,
  zoneDepth: ZONE_DEPTH,
  portalW: PORTAL_W,
  doorW: DOOR_W,
  partitionZ: PARTITION_Z,
  rowZ0: ROW_Z0,
  rowZ1: ROW_Z1,
}

export const HALL_PILLARS = (() => {
  const allZ = [-HALL_HALF_Z, ...leftZ, HALL_HALF_Z]
  const out = []
  for (let i = 0; i < allZ.length - 1; i++) {
    const zm = (allZ[i] + allZ[i + 1]) / 2
    out.push({ position: [-8, 0, zm] })
    out.push({ position: [8, 0, zm] })
  }
  return out
})()
