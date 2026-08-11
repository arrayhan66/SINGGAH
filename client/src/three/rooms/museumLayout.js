import { karyaCategories } from "../../data/karyaData"

const T = 0.25
const H = 14

// The main hall keeps its own (original tall) ceiling height, while the
// category buildings behind it are taller (H) so each of their two storeys
// gets generous headroom.
const HALL_H = 10

// Door / portal sizes
const PORTAL_W = 2.8
const PORTAL_H = 4.8

const PAINT_W = 2.2
const PAINT_H = 1.5

// Every category building is as big as the main hall (same width & depth).
const HALL_W = 36
const HALL_DEPTH = 54
const HALL_HALF_X = HALL_W / 2
const HALL_HALF_Z = HALL_DEPTH / 2

const ROOM_W = HALL_W
const ROOM_DEPTH = HALL_DEPTH

// ---- Two-storey building geometry (house style) ----
// Floor 1 (ground): student works. Floor 2 (upper): lecturer works. The upper
// floor is a full slab covering the whole room footprint (minus the stair void),
// so floor 2 sits directly above floor 1 like a real house. The overall building
// height stays tall (H = 10), giving each storey generous headroom.
export const FLOOR2_Y = 7.0
const STAIR_DEPTH = 10
export const STAIR_WIDTH = 2.6
const STAIR_STEPS = 20

// Where a player spawns inside a category building after crossing a portal.
const ENTRY_DEPTH = 3

// ---- Dynamic sizing from the category list ----
const N = karyaCategories.length
const ROW_X0 = -(N * ROOM_W) / 2
const ROW_X1 = ROW_X0 + N * ROOM_W
// Buildings sit flush behind the hall's front wall (front wall at z = +HALL_HALF_Z).
const ROW_Z0 = HALL_HALF_Z + T
const ROW_Z1 = ROW_Z0 + ROOM_DEPTH

// Staircase along the LEFT wall (x0). Bottom step near the room front.
export const STAIR_Z0 = ROW_Z0 + 4
export const STAIR_Z1 = STAIR_Z0 + STAIR_DEPTH
export const STAIR_RISE = FLOOR2_Y / STAIR_STEPS
export const STAIR_TREAD = STAIR_DEPTH / STAIR_STEPS
export const STAIR_STEPS_COUNT = STAIR_STEPS
export const STAIR_HALF = STAIR_WIDTH / 2
// Height of the solid panel on the open side of the staircase.
const STAIR_PANEL_H = FLOOR2_Y + 1.2

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

function addWall(axis, at, from, to, openings = [], yRange = { y0: 0, y1: H }) {
  if (!openings.length) {
    walls.push({ axis, at, from, to, y0: yRange.y0, y1: yRange.y1, t: T })
    return
  }
  const cuts = openings.map((o) => ({ a: o.c - o.w / 2, b: o.c + o.w / 2 }))
  carve(from, to, cuts).forEach(([a, b]) =>
    walls.push({ axis, at, from: a, to: b, y0: yRange.y0, y1: yRange.y1, t: T }),
  )
  for (const o of openings) {
    if (o.h < yRange.y1) {
      walls.push({ axis, at, from: o.c - o.w / 2, to: o.c + o.w / 2, y0: o.h, y1: yRange.y1, t: T })
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
  { y0: 0, y1: HALL_H },
)
addWall(
  "x",
  HALL_HALF_X,
  -HALL_HALF_Z,
  HALL_HALF_Z,
  rightZ.map((z) => ({ c: z, w: PORTAL_W, h: PORTAL_H })),
  { y0: 0, y1: HALL_H },
)
// Back wall (solid, banner hangs here)
addWall("z", -HALL_HALF_Z, -HALL_HALF_X, HALL_HALF_X, [], { y0: 0, y1: HALL_H })
// Front wall (solid, no portals on the straight path)
addWall("z", HALL_HALF_Z, ROW_X0, ROW_X1, [], { y0: 0, y1: HALL_H })

// ---- Room row (behind the hall front wall) ----
addWall("x", ROW_X0, ROW_Z0, ROW_Z1)
addWall("x", ROW_X1, ROW_Z0, ROW_Z1)
for (let i = 1; i < N; i++) {
  addWall("x", ROW_X0 + i * ROOM_W, ROW_Z0, ROW_Z1)
}

for (let i = 0; i < N; i++) {
  const [x0, x1] = roomX(i)
  const cx = roomCx(i)
  // Return portal (front wall), solid back wall.
  addWall("z", ROW_Z0, x0, x1, [{ c: cx, w: PORTAL_W, h: PORTAL_H }])
  addWall("z", ROW_Z1, x0, x1)
  // Solid panel along the open side of the staircase (right of the stairs), moved forward slightly and widened to cover horizontal closing walls.
  addWall("x", x0 + STAIR_WIDTH + 0.04, STAIR_Z0 - T / 2, STAIR_Z1 + T / 2, [], { y0: 0, y1: STAIR_PANEL_H })
  // Guard railing on floor 2 in front of the stair void. Its +z face is placed
  // exactly flush with the stair panel's -z face, and its span is inset by T/2
  // on both ends to prevent intersecting the outer wall and stair panel.
  addWall("z", STAIR_Z0 - T / 2, x0 + T / 2, x0 + STAIR_WIDTH + 0.04 - T / 2, [], { y0: FLOOR2_Y, y1: FLOOR2_Y + 1.2 })
  // Wall sealing the back of the stair void at ground level (prevents ground
  // players approaching the top of the stairs from behind; floor-2 walkers at
  // feet y=FLOOR2_Y pass over it because its top is exactly at FLOOR2_Y). Its -z
  // face is flush with the stair panel's +z end face, and its span is inset by T/2
  // on both ends to form clean T-junctions without overlapping.
  addWall("z", STAIR_Z1 + T / 2, x0 + T / 2, x0 + STAIR_WIDTH + 0.04 - T / 2, [], { y0: 0, y1: FLOOR2_Y })
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
    id: cat.slug,
    x,
    z: [ROW_Z0, ROW_Z1],
    zFloor: [ROW_Z0, ROW_Z1],
    floor: "wood",
    label: cat.title,
  })
}

export function findRoom(x, z) {
  for (const r of rooms) {
    if (x >= r.x[0] && x <= r.x[1] && z >= r.z[0] && z <= r.z[1]) return r
  }
  return rooms[0]
}

export const roomCategories = Object.fromEntries(
  rooms.filter((r) => r.id !== "hall").map((r) => [r.id, r.id]),
)

// ---- Stair footprint helpers (house stairs against the left wall) ----
function stairRange(room) {
  return { x0: room.x[0], x1: room.x[0] + STAIR_WIDTH, z0: STAIR_Z0, z1: STAIR_Z1 }
}

function onStairs(room, x, z) {
  const s = stairRange(room)
  return x >= s.x0 && x <= s.x1 && z >= s.z0 && z <= s.z1
}

function stairHeight(x, z) {
  const i = Math.min(STAIR_STEPS, Math.floor((z - STAIR_Z0) / STAIR_TREAD))
  return Math.min(FLOOR2_Y, (i + 1) * STAIR_RISE)
}

// ---- Height field: which floor the player stands on at (x, z) ----
// `level` is the player's current level (0 = ground, 1 = upper). Standing on the
// staircase lifts/lowers the camera step by step and flips the level at the top.
export function resolveHeight(x, z, level = 0) {
  const room = findRoom(x, z)
  if (!room || room.floor === "marble") return { height: 0, level: 0 }
  if (level === 1 && !onStairs(room, x, z)) return { height: FLOOR2_Y, level: 1 }
  if (onStairs(room, x, z)) {
    const height = stairHeight(x, z)
    return { height, level: height >= FLOOR2_Y - 0.05 ? 1 : 0 }
  }
  return { height: 0, level: 0 }
}

// Legacy single-value helper (ground-floor only) kept for callers that don't
// track a level.
export function floorHeightAt(x, z) {
  return resolveHeight(x, z, 0).height
}

// ---- Upper-floor slab: full footprint minus the stair void, split into pieces
// so the void (open staircase) stays clear. Returns [x0, z0, x1, z1] rects. ----
export function upperSlabPieces(room) {
  const x0 = room.x[0]
  const x1 = room.x[1]
  return [
    [x0, ROW_Z0, x1, STAIR_Z0],
    [x0 + STAIR_WIDTH, STAIR_Z0, x1, STAIR_Z1],
    [x0, STAIR_Z1, x1, ROW_Z1],
  ]
}

// ---- Portals (teleport rifts) ----
const hallPortals = []
for (let i = 0; i < kLeft; i++) {
  hallPortals.push({ axis: "x", at: -HALL_HALF_X, zc: leftZ[i] })
}
for (let i = 0; i < kRight; i++) {
  hallPortals.push({ axis: "x", at: HALL_HALF_X, zc: rightZ[i] })
}

// building -> hall (returns you to the portal you came in from)
function returnPoint(hp) {
  if (hp.at < 0) return { x: hp.at + 2.5, z: hp.zc, yaw: (Math.PI * 3) / 2 }
  return { x: hp.at - 2.5, z: hp.zc, yaw: Math.PI / 2 }
}

export const portals = []

for (let i = 0; i < hallPortals.length; i++) {
  const hp = hallPortals[i]
  const cx = roomCx(i)
  const roomZ = ROW_Z0 + ENTRY_DEPTH

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

const NO_ANIMATED_SLUG = "game-development"

for (let i = 0; i < N; i++) {
  const hp = hallPortals[i]
  const cat = karyaCategories[i]
  const cx = roomCx(i)
  const rotY = hp.at < 0 ? Math.PI / 2 : -Math.PI / 2
  const pos = [hp.at, 0, hp.zc]
  const rp = returnPoint(hp)
  const animated = cat.slug !== NO_ANIMATED_SLUG
  archways.push({
    kind: "portal",
    pos,
    rotY,
    width: PORTAL_W,
    title: cat.title,
    slug: cat.slug,
    animated,
    target: [cx, ROW_Z0 + ENTRY_DEPTH],
    yaw: Math.PI,
  })
  archways.push({
    kind: "portal",
    pos: [cx, 0, ROW_Z0],
    rotY: 0,
    width: PORTAL_W,
    title: null,
    slug: cat.slug,
    animated,
    target: [rp.x, rp.z],
    yaw: rp.yaw,
  })
}

// ---- Painting walls per room id (ground = student, upper = lecturer) ----
// `dir` tells the packing direction along the wall (+1 = pack from `from` edge,
// -1 = pack from `to` edge). `endPad` reserves a bare margin at the far end of
// the packing run (used so frames never get flush against the exit portal).
function wallDef(axis, at, from, to, face, y = 2.75, dir = 1, endPad = 0) {
  return { axis, at, from, to, face, y, dir, endPad }
}

// Bare stretch left empty around the exit portal so frames don't hug the door.
const PORTAL_MARGIN = 1.8

// Carve the front wall around the portal into two segments that each pack from
// the room's outer corner toward the door, both reserving PORTAL_MARGIN beside
// the opening — so the row ends neatly aligned with, but not flush against,
// the exit portal.
function portalWallDefs(axis, at, from, to, face, center, w, y = 2.75) {
  const segs = carve(from, to, [{ a: center - w / 2, b: center + w / 2 }])
  return segs.map(([a, b], i) => wallDef(axis, at, a, b, face, y, i > 0 ? -1 : 1, PORTAL_MARGIN))
}

// Lower the whole painting row + picture rail together (frames, wires, info
// plaques and rail all drop by the same amount, so their relative layout stays
// correct). Tune this to move the rail up/down.
const PAINT_ROW_DROP = 0.4

// Centre heights of the painting rows on each storey (ground = student,
// upper = lecturer). Raised together with the building; the floor name boards
// stay on the floor.
export const GROUND_PAINT_Y = 3.5 - PAINT_ROW_DROP
export const UPPER_PAINT_OFFSET = 3.5 - PAINT_ROW_DROP

export const paintingWalls = {}

for (let i = 0; i < N; i++) {
  const cat = karyaCategories[i]
  const [x0, x1] = roomX(i)
  const cx = roomCx(i)
  const id = cat.slug
  const gZ = [ROW_Z0, STAIR_Z0]
  const uZ = [STAIR_Z1, ROW_Z1]
  const GROUND_Y = GROUND_PAINT_Y
  const UPPER_Y = FLOOR2_Y + UPPER_PAINT_OFFSET

  // Wall order = fill order: one wall is fully populated before the next
  // begins, starting with the most prominent back wall, then the front wall
  // beside the portal, and finally the two short side walls.
  paintingWalls[id] = {
    ground: [
      wallDef("z", ROW_Z1, x0, x1, "-z", GROUND_Y),
      ...portalWallDefs("z", ROW_Z0, x0, x1, "+z", cx, PORTAL_W, GROUND_Y),
      wallDef("x", x0, gZ[0], gZ[1], "+x", GROUND_Y),
      wallDef("x", x1, gZ[0], gZ[1], "-x", GROUND_Y),
    ],
    upper: [
      wallDef("z", ROW_Z1, x0, x1, "-z", UPPER_Y),
      ...portalWallDefs("z", ROW_Z0, x0, x1, "+z", cx, PORTAL_W, UPPER_Y),
      wallDef("x", x0, uZ[0], uZ[1], "+x", UPPER_Y),
      wallDef("x", x1, uZ[0], uZ[1], "-x", UPPER_Y),
    ],
  }
}

// ---- Extra gallery rails filling the wall stretches that carry no paintings,
// so every wall in a room gets a continuous rail ("jalur karya"). The rail is
// cut at the staircase band (STAIR_Z0..STAIR_Z1) on the stair-side wall only —
// the "KARYA DOSEN" area stays rail-free, while the wall across from it runs
// straight through. ----
export const roomRails = {}

for (let i = 0; i < N; i++) {
  const cat = karyaCategories[i]
  const [x0, x1] = roomX(i)
  const id = cat.slug
  const GROUND_Y = GROUND_PAINT_Y
  const UPPER_Y = FLOOR2_Y + UPPER_PAINT_OFFSET

  roomRails[id] = {
    ground: [
      // Stair-side wall (left) resumes behind the staircase, cut at the band;
      // the opposite wall (right) runs the full depth.
      wallDef("x", x0, STAIR_Z1, ROW_Z1, "+x", GROUND_Y),
      wallDef("x", x1, STAIR_Z0, ROW_Z1, "-x", GROUND_Y),
    ],
    upper: [
      // Stair-side wall (left) gets only the walkable front stretch; the
      // opposite wall (right) continues past the stair band.
      wallDef("x", x0, ROW_Z0, STAIR_Z0, "+x", UPPER_Y),
      wallDef("x", x1, ROW_Z0, STAIR_Z1, "-x", UPPER_Y),
    ],
  }
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

// Height of the picture rail above each painting wall row (wires hang down).
export const RAIL_OFFSET = 1.08

// Frames sit adjacent in a row ("berjejer") with a clear gap between works and
// a generous inset from each wall's start edge (the room corners). Each wall is
// populated to its full capacity before the next wall starts (no round-robin
// spreading), so a room always fills one complete wall first, then continues on
// the next one.
const FRAME_GAP = 0.9
const FRAME_EDGE_PAD = 1.0

export function layoutPaintings(roomId, projects, level = "ground") {
  const wallsDef = paintingWalls[roomId]?.[level] || []
  const list = projects || []
  const caps = wallsDef.map((wd) => {
    const len = wd.to - wd.from
    const usable = len - wd.endPad
    return Math.max(
      0,
      Math.floor((usable - FRAME_EDGE_PAD * 2 + FRAME_GAP) / (PAINT_W + FRAME_GAP)),
    )
  })
  const total = caps.reduce((s, c) => s + c, 0)

  // Pass 1: fill walls one after another (each to its full capacity) so the
  // frames gather on a single wall in a neat row before spilling to the next.
  const counts = caps.map(() => 0)
  let wi = 0
  for (let i = 0; i < list.length && i < total; i++) {
    while (wi < caps.length && counts[wi] >= caps[wi]) wi++
    if (wi >= caps.length) break
    counts[wi]++
  }

  // Pass 2: place each wall's works as a single row PACKED from the wall's
  // start edge (the room corner) toward the far end, so a partially-filled
  // wall begins at the corner instead of the middle. Adding a work just
  // appends the next frame flush beside the last one ("saling isi terus").
  // FRAME_EDGE_PAD stays at the start edge and endPad stays reserved at the
  // far end (the portal margin), so the row never overflows the wall.
  const placed = []
  let pi = 0
  for (let wi = 0; wi < caps.length; wi++) {
    const n = counts[wi]
    if (!n) continue
    const wd = wallsDef[wi]
    for (let k = 0; k < n; k++) {
      // dir=-1 walls pack from their `to` (corner) edge toward `from` (the
      // portal side); dir=1 walls pack from `from` toward `to`.
      const t =
        wd.dir === -1
          ? wd.to - FRAME_EDGE_PAD - PAINT_W / 2 - k * (PAINT_W + FRAME_GAP)
          : wd.from + FRAME_EDGE_PAD + PAINT_W / 2 + k * (PAINT_W + FRAME_GAP)
      const p = list[pi]
      let fx, fz
      if (wd.axis === "x") {
        fx = wd.at + faceOffset(wd.face)
        fz = t
      } else {
        fx = t
        fz = wd.at + faceOffset(wd.face)
      }
      placed.push({
        project: p,
        position: [fx, wd.y, fz],
        rotationY: rotationYFor(wd.face),
        index: pi + 1,
        isDosen: level === "upper",
        railY: wd.y + RAIL_OFFSET,
      })
      pi++
    }
  }
  return placed
}

export const PAINTING_SIZE = { w: PAINT_W, h: PAINT_H }

export const MUSEUM = {
  height: H,
  hallHeight: HALL_H,
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
  portalW: PORTAL_W,
  rowZ0: ROW_Z0,
  rowZ1: ROW_Z1,
}

export const HALL_PILLARS = (() => {
  const allZ = [-HALL_HALF_Z, ...leftZ, HALL_HALF_Z]
  const pillarX = HALL_HALF_X - 5.5
  const portalZ = [...leftZ, ...rightZ]
  const out = []
  for (let i = 0; i < allZ.length - 1; i++) {
    const zm = (allZ[i] + allZ[i + 1]) / 2
    const shifted = portalZ.some((z) => Math.abs(z - zm) < 0.1) ? zm + 2.5 : zm
    out.push({ position: [-pillarX, 0, shifted] })
    out.push({ position: [pillarX, 0, shifted] })
  }
  return out
})()
