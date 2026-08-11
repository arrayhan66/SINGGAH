import { useCallback, useMemo, useRef, useState } from "react"
import { Text } from "@react-three/drei"
import * as THREE from "three"
import { useQualityStore } from "../hooks/useQuality"
import { textures } from "../utils/textures"
import Pillar from "../components/Pillar"
import Painting from "../components/Painting"
import Portal from "../components/Portal"
import Centerpiece from "../components/Centerpiece"
import MuseumBarrier from "../components/MuseumBarrier"
import LoungeSeating from "../components/LoungeSeating"
import HallCeiling from "../components/HallCeiling"
import HaloPendant from "../components/HaloPendant"
import KaryaCeiling from "../components/KaryaCeiling"
import WallGuard from "../components/WallGuard"
import FeaturedWork from "../components/FeaturedWork"
import {
  Console,
  Bookcase,
  Armchair,
  FloorLamp,
  SideTable,
  WallClock,
  Ottoman,
  WindowCurtains,
  Television,
  HangingPlant,
  RectRug,
  RoundRug,
  LesehanTable,
  PresidentPortrait,
} from "../components/HomeDecor"
import prabowoImg from "../../assets/images/prabowo.png"
import gibranImg from "../../assets/images/gibran.png"
import {
  Plant,
  Chandelier,
  InfoKiosk,
  WallSconce,
  CCTV,
} from "../components/Props"
import {
  rooms,
  getWalls,
  archways,
  paintingWalls,
  roomRails,
  layoutPaintings,
  roomCategories,
  upperSlabPieces,
  MUSEUM,
  HALL_PILLARS,
  LAYOUT,
  RAIL_OFFSET,
  FLOOR2_Y,
  STAIR_WIDTH,
  STAIR_Z0,
  STAIR_Z1,
  STAIR_RISE,
  STAIR_TREAD,
  STAIR_STEPS_COUNT,
} from "./museumLayout"
import { karyaCategories, karyaProjects, normalizeProject } from "../../data/karyaData"
import { enrichProjects, getCategoryStats } from "../../utils/hallHelpers"

const H = MUSEUM.height
const HALL_H = MUSEUM.hallHeight
const HALL_Z0 = LAYOUT.hallZ[0]
const HALL_Z1 = LAYOUT.hallZ[1]

// Number of student works taken OFF the wall and moved onto the featured podium
// ("KARYA UNGGULAN") per category room. Kept at 2 so the works can render at
// full wall size on the 7.0m podium (3 full-size frames would need ~9.4m).
const FEATURED_ON_PODIUM = 2

function FloorMesh({ room, floorMap }) {
  const w = room.x[1] - room.x[0]
  const d = room.zFloor[1] - room.zFloor[0]
  const cx = (room.x[0] + room.x[1]) / 2
  const cz = (room.zFloor[0] + room.zFloor[1]) / 2
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[cx, 0, cz]}
      receiveShadow
      userData={{ action: { type: "floor" } }}
    >
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial
        map={floorMap}
        color="#dbe6f2"
        metalness={0}
        roughness={0.9}
      />
    </mesh>
  )
}

function WallBox({ wall, wallMap }) {
  const { axis, at, from, to, t, y0 = 0, y1 = H } = wall
  const len = to - from
  const hh = y1 - y0
  const cy = (y0 + y1) / 2
  const center = axis === "x" ? [at, cy, (from + to) / 2] : [(from + to) / 2, cy, at]
  const size = axis === "x" ? [t, hh, len] : [len, hh, t]
  const full = y0 <= 0.05
  const topMold = y1 >= H - 0.05

  const overlay = (thick, y, h, color) => {
    const o = t + thick
    const s = axis === "x" ? [o, h, len] : [len, h, o]
    const c = axis === "x" ? [at, y, (from + to) / 2] : [(from + to) / 2, y, at]
    return (
      <mesh position={c} castShadow={h < 1}>
        <boxGeometry args={s} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    )
  }

  return (
    <group>
      <mesh position={center} receiveShadow castShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial map={wallMap} color="#dfe9f4" roughness={0.9} />
      </mesh>
      {topMold && overlay(0.12, H - 0.11, 0.2, "#e4eef9")}
      {full && (
        <>
          {overlay(0.06, 0.08, 0.16, "#1e293b")}
          {overlay(0.1, 0.62, 1.25, "#7b93ad")}
          {overlay(0.12, 1.32, 0.06, "#38bdf8")}
        </>
      )}
    </group>
  )
}

// Brass picture rail running along each painting wall (wires hang down to the
// paintings, giving a curated home-gallery feel).
function PaintingRail({ wall }) {
  const len = wall.to - wall.from
  const railY = wall.y + RAIL_OFFSET
  const off = wall.face === "+x" || wall.face === "+z" ? 0.15 : -0.15
  const pos =
    wall.axis === "x"
      ? [wall.at + off, railY, (wall.from + wall.to) / 2]
      : [(wall.from + wall.to) / 2, railY, wall.at + off]
  const size = wall.axis === "x" ? [0.06, 0.05, len] : [len, 0.05, 0.06]
  return (
    <mesh position={pos} userData={{ noCollide: true }}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#c9a35e" metalness={0.7} roughness={0.35} />
    </mesh>
  )
}

function FloorLabel({ position, text }) {
  return (
    <group position={position} userData={{ noCollide: true }}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
        <planeGeometry args={[10.4, 1.5]} />
        <meshStandardMaterial color="#0f2036" transparent opacity={0.85} roughness={0.55} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.014, 0]}>
        <planeGeometry args={[9.9, 1.05]} />
        <meshStandardMaterial color="#123a63" transparent opacity={0.9} roughness={0.6} />
      </mesh>
      <Text
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.022, 0]}
        fontSize={0.36}
        color="#7dd3fc"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.03}
        raycast={() => null}
      >
        {text}
      </Text>
    </group>
  )
}

function RoomTitlePlaque({ room, title }) {
  const cx = (room.x[0] + room.x[1]) / 2
  const y = FLOOR2_Y + 0.4
  return (
    <group>
      <mesh position={[cx, y, LAYOUT.rowZ0 + 0.13]} rotation={[0, 0, 0]}>
        <boxGeometry args={[7.2, 0.62, 0.09]} />
        <meshStandardMaterial color="#16283f" roughness={0.5} metalness={0.35} />
      </mesh>
      <mesh position={[cx, y + 0.28, LAYOUT.rowZ0 + 0.13]} rotation={[0, 0, 0]}>
        <boxGeometry args={[7.2, 0.05, 0.09]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.9} />
      </mesh>
      <Text
        position={[cx, y, LAYOUT.rowZ0 + 0.16]}
        rotation={[0, 0, 0]}
        fontSize={0.36}
        color="#bfe3ff"
        anchorX="center"
        anchorY="middle"
        maxWidth={6.6}
        raycast={() => null}
      >
        {title}
      </Text>
    </group>
  )
}

// Staircase along the left wall of each category building. The height-field
// resolver (resolveHeight) lifts the camera on the stairs, so the step boxes
// are purely visual (noCollide).
function Stairs({ room }) {
  const steps = []
  for (let i = 0; i < STAIR_STEPS_COUNT; i++) {
    steps.push({
      z: STAIR_Z0 + i * STAIR_TREAD + STAIR_TREAD / 2,
      y: i * STAIR_RISE + STAIR_RISE / 2,
    })
  }
  return (
    <group userData={{ noCollide: true }}>
      {steps.map((s, i) => (
        <mesh key={i} position={[room.x[0] + STAIR_WIDTH / 2, s.y, s.z]}>
          <boxGeometry args={[STAIR_WIDTH, STAIR_RISE + 0.02, STAIR_TREAD + 0.02]} />
          <meshStandardMaterial color="#c3cede" roughness={0.8} />
        </mesh>
      ))}
      <mesh
        position={[
          room.x[0] + STAIR_WIDTH + 0.04,
          FLOOR2_Y + 1.2 + 0.08,
          (STAIR_Z0 + STAIR_Z1) / 2,
        ]}
      >
        <boxGeometry args={[0.06, 0.06, STAIR_Z1 - STAIR_Z0]} />
        <meshStandardMaterial color="#c9a35e" metalness={0.7} roughness={0.35} />
      </mesh>
    </group>
  )
}

// Sign on the stair-closing panel: guides visitors to the lecturer-works
// storey with a "KARYA DOSEN" plaque and a right-pointing arrow, facing the
// room interior (the panel's +x face).
function DosenStairSign({ room }) {
  const x = room.x[0] + STAIR_WIDTH + 0.10 + 0.17
  const cz = (STAIR_Z0 + STAIR_Z1) / 2
  const textRef = useRef(null)
  const [textW, setTextW] = useState(0)

  const handleSync = useCallback((mesh) => {
    const bounds = mesh.textRenderInfo?.blockBounds
    if (bounds) setTextW(bounds[2] - bounds[0])
  }, [])

  const arrowLeft = -0.01
  const arrowRight = 0.49
  const arrowW = arrowRight - arrowLeft
  const gap = 0.22
  const textX = -(arrowW + gap) / 2
  const arrowX = textX + textW / 2 + gap - arrowLeft

  return (
    <group position={[x, 3.2, cz]} rotation={[0, Math.PI / 2, 0]} userData={{ noCollide: true }}>
      {/* Brass frame */}
      <mesh>
        <boxGeometry args={[4.35, 1.3, 0.06]} />
        <meshStandardMaterial color="#c9a35e" metalness={0.85} roughness={0.3} />
      </mesh>
      {/* Navy plaque */}
      <mesh position={[0, 0, 0.035]}>
        <boxGeometry args={[4.05, 1.0, 0.05]} />
        <meshStandardMaterial color="#16283f" roughness={0.5} metalness={0.35} />
      </mesh>
      {/* Cyan accent line */}
      <mesh position={[0, 0.44, 0.065]}>
        <boxGeometry args={[3.7, 0.03, 0.01]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.9} />
      </mesh>
      {/* Title + arrow, centered together */}
      <Text
        ref={textRef}
        onSync={handleSync}
        position={[textX, -0.02, 0.065]}
        fontSize={0.42}
        color="#bfe3ff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#0b1220"
        raycast={() => null}
      >
        KARYA DOSEN
      </Text>
      {/* Right-pointing arrow */}
      <group position={[arrowX, -0.02, 0.065]}>
        <mesh position={[0.16, 0, 0]}>
          <boxGeometry args={[0.3, 0.07, 0.04]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0.38, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.08, 0.22, 12]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.8} />
        </mesh>
      </group>
    </group>
  )
}

// Upper storey slab: full room footprint minus the stair void, split into
// pieces so the open staircase stays clear.
function UpperSlab({ room }) {  const pieces = upperSlabPieces(room)
  return (
    <group userData={{ noCollide: true }}>
      {pieces.map(([x0, z0, x1, z1], i) => (
        <mesh
          key={i}
          position={[(x0 + x1) / 2, FLOOR2_Y - 0.13, (z0 + z1) / 2]}
          receiveShadow
        >
          <boxGeometry args={[x1 - x0, 0.26, z1 - z0]} />
          <meshStandardMaterial color="#dbe6f2" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[room.x[0] + STAIR_WIDTH + 0.10, FLOOR2_Y - 0.1, (STAIR_Z0 + STAIR_Z1) / 2]}>
        <boxGeometry args={[0.08, 0.3, STAIR_Z1 - STAIR_Z0]} />
        <meshStandardMaterial color="#7b93ad" roughness={0.6} />
      </mesh>
    </group>
  )
}

// Ground storey (lantai 1): entrance gallery of student works in the front
// strip (open to the tall ceiling), beneath the staircase foot.
function RoomDecorGround({ room, projects }) {
  const x0 = room.x[0]
  const x1 = room.x[1]
  const cx = (x0 + x1) / 2

  return (
    <group key={`decor-ground-${room.id}`}>
      <FloorLabel position={[cx, 0.06, 29]} text="LANTAI 1 · KARYA MAHASISWA" />

      <Plant position={[x1 - 2.5, 0, 29]} variant="flower" flowerColor="#60a5fa" />
      <Plant position={[x0 + 4.5, 0, 29]} variant="flower" flowerColor="#f8fafc" />
      <Plant position={[cx - 6.6, 0, 29]} variant="tall" />
      <Plant position={[cx + 6.6, 0, 29]} variant="tall" />

      {/* 1. Tempat Duduk Ottoman (3 di kiri, 3 di kanan = seberang-seberangan, masing-masing 3 kursi + tiang lampu + rak kecil) */}
      {[46, 60, 74].map((z, i) => (
        <group key={`ott-l-${i}`}>
          <Ottoman position={[x0 + 3.2, 0, z - 0.4]} rotationY={0.3} />
          <Ottoman position={[x0 + 4.6, 0, z - 0.2]} rotationY={-0.3} />
          <Ottoman position={[x0 + 4.0, 0, z + 0.5]} rotationY={Math.PI} />
          <FloorLamp position={[x0 + 2.0, 0, z]} rotationY={0.8} />
          <Bookcase position={[x0 + 6.0, 0, z]} rotationY={-Math.PI / 2} variant={i % 3} low />
        </group>
      ))}

      {[46, 60, 74].map((z, i) => (
        <group key={`ott-r-${i}`}>
          <Ottoman position={[x1 - 3.2, 0, z - 0.4]} rotationY={-0.3} />
          <Ottoman position={[x1 - 4.6, 0, z - 0.2]} rotationY={0.3} />
          <Ottoman position={[x1 - 4.0, 0, z + 0.5]} rotationY={Math.PI} />
          <FloorLamp position={[x1 - 2.0, 0, z]} rotationY={-0.8} />
          <Bookcase position={[x1 - 6.0, 0, z]} rotationY={Math.PI / 2} variant={i % 3} low />
        </group>
      ))}

      {/* 2. Meja Bundar Kecil (3 di kiri, 3 di kanan = total 6 meja bundar kecil, seberang-seberangan) */}
      {[40, 53, 66].map((z, i) => (
        <LesehanTable
          key={`small-table-l-${i}`}
          position={[x0 + 4.0, 0, z]}
          rotationY={i * 0.3}
          radius={1.1}
          cushionCount={4}
          rugRadius={1.6}
          books={[
            { cover: i === 0 ? "laskar" : i === 1 ? "sherlock" : "python", x: -0.4, z: 0.35, rot: 0.2, w: 0.15 },
          ]}
          drink={{ type: i === 0 ? "greenTea" : i === 1 ? "mixue" : "icedTea", x: 0.4, z: -0.3 }}
        />
      ))}

      {[40, 53, 66].map((z, i) => (
        <LesehanTable
          key={`small-table-r-${i}`}
          position={[x1 - 4.0, 0, z]}
          rotationY={i * 0.3}
          radius={1.1}
          cushionCount={4}
          rugRadius={1.6}
          books={[
            { cover: i === 0 ? "eragon" : i === 1 ? "bintang" : "gahzi", x: -0.4, z: 0.35, rot: -0.2, w: 0.15 },
          ]}
          drink={{ type: i === 0 ? "coffee" : "greenTea", x: 0.4, z: 0.3 }}
        />
      ))}

      {/* 3. Meja Bundar Besar (2 buah tepat di tengah) */}
      <LesehanTable
        position={[cx - 3.5, 0, 54]}
        rotationY={0.2}
        radius={1.6}
        cushionCount={8}
        rugRadius={2.4}
        books={[
          { cover: "laskar", x: -0.5, z: 0.45, rot: 0.2, w: 0.18 },
          { cover: "gahzi", x: -0.18, z: 0.55, rot: 0.65, w: 0.15 },
        ]}
        drink={{ type: "coffee", x: 0.55, z: -0.4 }}
      />
      <LesehanTable
        position={[cx + 3.5, 0, 54]}
        rotationY={-0.2}
        radius={1.6}
        cushionCount={8}
        rugRadius={2.4}
        books={[
          { cover: "eragon", x: -0.5, z: 0.45, rot: -0.2, w: 0.18 },
          { cover: "bintang", x: -0.18, z: 0.55, rot: -0.65, w: 0.15 },
        ]}
        drink={{ type: "greenTea", x: 0.55, z: 0.4 }}
      />
      <Text
        position={[cx, 0.05, 52]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.14}
        letterSpacing={0.05}
        color="#7dd3fc"
        anchorX="center"
        anchorY="middle"
        raycast={() => null}
      >
        KARYA ROOM
      </Text>

      {/* Symmetric plants flanking the center table - moved further away from seating */}
      <Plant position={[cx - 8.0, 0, 52]} variant="topiary" />
      <Plant position={[cx + 8.0, 0, 52]} variant="topiary" />
      <Plant position={[cx - 9.5, 0, 48]} variant="tall" scale={1.5} potColor="#f1f5f9" />
      <Plant position={[cx + 9.5, 0, 48]} variant="tall" scale={1.5} potColor="#f1f5f9" />

      {/* Featured works on the right side near the entrance: the wall works
      moved here are no longer shown on the wall */}
      <FeaturedWork position={[cx + 9.5, 0, 32]} rotationY={-0.46} projects={projects.slice(-FEATURED_ON_PODIUM)} />

      {/* Back-wall clock + president portraits above the student works */}
      <WallClock position={[cx, 5.6, room.z[1] - 0.45]} rotationY={Math.PI} scale={1.3} />
      <PresidentPortrait position={[cx + 2.0, 5.5, room.z[1] - 0.45]} rotationY={Math.PI} image={prabowoImg} />
      <PresidentPortrait position={[cx - 2.0, 5.5, room.z[1] - 0.45]} rotationY={Math.PI} image={gibranImg} />
    </group>
  )
}

// Upper storey (lantai 2): cozy lesehan library lounge of lecturer works, with a
// big round floor-seating reading table in the middle, reading corners and study
// zones. No chairs — everything is lesehan (sitting on floor cushions).
function RoomDecorUpper({ room }) {
  const x0 = room.x[0]
  const x1 = room.x[1]
  const cx = (x0 + x1) / 2
  const Y = FLOOR2_Y

  return (
    <group key={`decor-upper-${room.id}`}>
      <FloorLabel position={[cx, Y + 0.06, 44]} text="LANTAI 2 · KARYA DOSEN" />

      {/* Big round lesehan reading table with floor cushions */}
      <LesehanTable
        position={[cx, Y, 68]}
        rotationY={0.5}
        radius={1.8}
        cushionCount={8}
        rugRadius={2.6}
      />

      {/* Study / console zone */}
      <Console position={[x1 - 1.55, Y, 60]} rotationY={-Math.PI / 2} />
      <Bookcase position={[x1 - 1.6, Y, 50]} rotationY={-Math.PI / 2} variant={0} />
      <Bookcase position={[x1 - 1.6, Y, 66]} rotationY={-Math.PI / 2} variant={1} />
      <Bookcase position={[x0 + 1.6, Y, 54]} rotationY={Math.PI / 2} variant={2} />

      {/* Plants */}
      <Plant position={[x1 - 2.5, Y, 68]} variant="tall" />
      <Plant position={[x0 + 4.5, Y, 44]} variant="flower" flowerColor="#f8fafc" />
      <Plant position={[cx - 6.6, Y, 44]} variant="tall" />
      <Plant position={[cx + 6.6, Y, 44]} variant="tall" />
      <Plant position={[cx - 4, Y, 74]} variant="topiary" />
      <Plant position={[cx + 4, Y, 74]} variant="topiary" />

      {/* Wall sconces above the paintings */}
      <WallSconce position={[x1 - 0.22, Y + 4.8, 46]} rotationY={-Math.PI / 2} />
      <WallSconce position={[x1 - 0.22, Y + 4.8, 66]} rotationY={-Math.PI / 2} />
      <WallSconce position={[x0 + 0.22, Y + 4.8, 50]} rotationY={Math.PI / 2} />
      <WallSconce position={[x0 + 0.22, Y + 4.8, 64]} rotationY={Math.PI / 2} />

      <HaloPendant position={[cx, H - 1.4, 46]} drop={2.2} glow={0.85} />
      <HaloPendant position={[cx, H - 1.4, 62]} drop={2.2} glow={0.7} />

      {/* Cozy lesehan reading corners: low side tables + lamps, no chairs */}
      <SideTable position={[x1 - 8, Y, 45.2]} rotationY={1.5} book1="gahzi" book2="gadisjalanan" />
      <FloorLamp position={[x1 - 6.2, Y, 44]} rotationY={-1.1} />

      <SideTable
        position={[x0 + 8, Y, 45.2]}
        rotationY={-1.5}
        drink="coffee"
        book1="teras"
        book2="khilafah"
      />
      <FloorLamp position={[x0 + 6.2, Y, 44]} rotationY={1.1} />
    </group>
  )
}

function Museum() {
  const wallMap = useMemo(() => textures.wallPlaster(), [])
  const marbleMap = useMemo(() => textures.marbleFloor(), [])
  const hallGradMap = useMemo(() => textures.hallGradient(), [])
  const rugMap = useMemo(() => textures.roundRug(), [])
  const rugRectMap = useMemo(() => textures.rugRect(), [])
  const tier = useQualityStore((s) => s.tier)
  const low = tier === "rendah"
  const stats = useMemo(() => getCategoryStats(karyaProjects), [])
  const groups = useMemo(() => {
    const enriched = enrichProjects(karyaProjects.map(normalizeProject))
    const dosen = {}
    const mhs = {}
    for (const c of karyaCategories) {
      dosen[c.slug] = enriched.filter((p) => p.category === c.slug && p.authorType === "dosen")
      mhs[c.slug] = enriched.filter((p) => p.category === c.slug && p.authorType === "mahasiswa")
    }
    return { dosen, mhs }
  }, [])

  marbleMap.repeat.set(9, 9)

  const walls = getWalls()

  return (
    <group>
      {/* Floors + ceilings */}
      {rooms.map((room) => (
        <group key={room.id}>
          <FloorMesh room={room} floorMap={marbleMap} />
          {room.id === "hall" ? (
            <HallCeiling room={room} height={HALL_H} />
          ) : (
            <KaryaCeiling room={room} height={H} />
          )}
        </group>
      ))}

      {/* Walls */}
      {walls.map((wall, i) => (
        <WallBox key={i} wall={wall} wallMap={wallMap} />
      ))}

      {/* Stairs + upper storey slabs for each category building */}
      {rooms.map((room) => {
        if (room.id === "hall") return null
        return (
          <group key={`storey-${room.id}`}>
            <Stairs room={room} />
            <UpperSlab room={room} />
            <DosenStairSign room={room} />
          </group>
        )
      })}

      {/* Portals */}
      {archways.map((a, i) => {
        if (a.kind === "portal") {
          return (
            <Portal
              key={i}
              position={a.pos}
              rotationY={a.rotY}
              width={a.width}
              title={a.title}
              animated={a.animated}
              action={{
                type: "teleport",
                point: new THREE.Vector3(a.target[0], 0, a.target[1]),
                yaw: a.yaw,
              }}
            />
          )
        }
        return null
      })}

      {/* Paintings + picture rails: ground floor = student works, upper floor =
      lecturer works (each level on its own storey's walls). */}
      {rooms.map((room) => {
        const cat = roomCategories[room.id]
        if (!cat) return null
        return (
          <group key={`paint-${room.id}`}>
            {["ground", "upper"].map((level) => {
              const mhsAll = groups.mhs[cat] || []
              const list =
                level === "ground"
                  ? mhsAll.slice(0, mhsAll.length - FEATURED_ON_PODIUM)
                  : groups.dosen[cat] || []
              const wallDefs = paintingWalls[room.id]?.[level] || []
              const extraRails = roomRails[room.id]?.[level] || []
              const placed = layoutPaintings(room.id, list, level)
              return (
                <group key={level}>
                  {wallDefs.map((wd, i) => (
                    <PaintingRail key={`r-${level}-${i}`} wall={wd} />
                  ))}
                  {extraRails.map((wd, i) => (
                    <PaintingRail key={`xr-${level}-${i}`} wall={wd} />
                  ))}
                  {placed.map((p) => (
                    <Painting
                      key={`${room.id}-${level}-${p.project.id}`}
                      project={p.project}
                      position={p.position}
                      rotationY={p.rotationY}
                      index={p.index}
                      isDosen={p.isDosen}
                      railY={p.railY}
                    />
                  ))}
                </group>
              )
            })}
          </group>
        )
      })}

      {/* Room titles + decor (both storeys) */}
      {rooms.map((room) => {
        const cat = roomCategories[room.id]
        if (!cat) return null
        return (
          <group key={`room-title-${room.id}`}>
            <RoomTitlePlaque room={room} title={cat} />
            <RoomDecorGround room={room} projects={groups.mhs[cat] || []} />
            <RoomDecorUpper room={room} />
          </group>
        )
      })}

      {/* Hall decor */}
      <group>
        {/* Hall floor gradient vignette (darkens toward the edges) */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.03, 0]}
          receiveShadow
          userData={{ action: { type: "floor" } }}
        >
          <planeGeometry args={[LAYOUT.hallX[1] - LAYOUT.hallX[0], LAYOUT.hallZ[1] - LAYOUT.hallZ[0]]} />
          <meshBasicMaterial map={hallGradMap} transparent depthWrite={false} />
        </mesh>

        {/* Back wall banner */}
        <mesh position={[0, 4.6, HALL_Z0 + 0.15]}>
          <planeGeometry args={[16, 2.4]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>
        <Text
          position={[0, 5.5, HALL_Z0 + 0.05]}
          fontSize={1.05}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.04}
          outlineColor="#0b1220"
          raycast={() => null}
        >
          SINGGAH — VIRTUAL EXHIBITION
        </Text>
        <Text
          position={[0, 4.5, HALL_Z0 + 0.05]}
          fontSize={0.36}
          color="#93c5fd"
          anchorX="center"
          anchorY="middle"
          raycast={() => null}
        >
          Pameran Karya Dosen & Mahasiswa Jurusan Teknologi Informasi
        </Text>

        {/* Central platform */}
        <mesh position={[0, 0.135, 0]} receiveShadow>
          <cylinderGeometry args={[4.1, 4.1, 0.03, 48]} />
          <meshStandardMaterial color="#4b5a73" roughness={0.9} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[5.8, 5.86, 64]} />
          <meshStandardMaterial color="#a98f5e" metalness={0.5} roughness={0.4} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-4} />
        </mesh>

        {/* Round foyer rug */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.141, 0]} receiveShadow>
          <circleGeometry args={[3.6, 64]} />
          <meshStandardMaterial map={rugMap} roughness={0.95} />
        </mesh>

        {/* Decorative concentric bands around the rug */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.154, 0]}>
          <ringGeometry args={[3.98, 4.08, 80]} />
          <meshStandardMaterial color="#a98f5e" metalness={0.55} roughness={0.35} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-4} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.156, 0]}>
          <ringGeometry args={[3.9, 3.93, 80]} />
          <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={1.5} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-4} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.154, 0]}>
          <ringGeometry args={[3.7, 3.78, 80]} />
          <meshStandardMaterial color="#6b7c96" roughness={0.7} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-4} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.156, 0]}>
          <ringGeometry args={[3.63, 3.67, 80]} />
          <meshStandardMaterial color="#c9a35e" metalness={0.7} roughness={0.3} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-4} />
        </mesh>

        {/* Brass studs ringing the rug */}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * 3.84, 0.155, Math.sin(a) * 3.84]}>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshStandardMaterial color="#c9a35e" metalness={0.75} roughness={0.25} />
            </mesh>
          )
        })}

        {/* Focal 3D centerpiece + spotlight */}
        <Centerpiece title="HALL UTAMA" />
        {tier === "tinggi" && (
          <spotLight
            position={[0, HALL_H - 0.25, 0]}
            angle={0.55}
            penumbra={0.5}
            intensity={380}
            distance={28}
            color="#e6f4ff"
          />
        )}

        {/* Cozy topiary flanking the centre */}
        <Plant position={[-2.6, 0, 0]} variant="topiary" scale={1} />
        <Plant position={[2.6, 0, 0]} variant="topiary" scale={1} />

        {/* Museum stanchion barrier around the big circle */}
        <MuseumBarrier />

        {/* Cozy lounge seating around the circle, facing outward */}
        <LoungeSeating />

        <Chandelier position={[0, HALL_H - 1.4, HALL_Z0 + 13.5]} lit={1} drop={1.4} />
        <Chandelier position={[0, HALL_H - 1.4, HALL_Z1 - 13.5]} lit={0.9} drop={1.4} />

        {HALL_PILLARS.map((p, i) => (
          <Pillar key={i} position={p.position} />
        ))}

        {/* Side walls: flower pots */}
        <Plant position={[-17.4, 0, -12]} variant="flower" flowerColor="#60a5fa" scale={1.0} />
        <Plant position={[-17.4, 0, 0]} variant="flower" flowerColor="#f8fafc" scale={1.0} />
        <Plant position={[-17.4, 0, 12]} variant="flower" flowerColor="#60a5fa" scale={1.0} />

        <Plant position={[17.4, 0, -9]} variant="flower" flowerColor="#60a5fa" scale={1.0} />
        <Plant position={[17.4, 0, 9]} variant="flower" flowerColor="#f8fafc" scale={1.0} />

        {/* Aesthetic digital info kiosks near the center platform */}
        <InfoKiosk position={[-4.5, 0, 6]} rotationY={0.35} stats={stats} categories={karyaCategories} />
        <InfoKiosk position={[4.5, 0, 6]} rotationY={-0.35} variant="guide" />

        {/* Wall sconces for aesthetic ambient side lighting (kept clear of portals) */}
        {[-12, 12].map((zPos, i) => (
          <group key={i}>
            <WallSconce position={[-17.8, 2.8, zPos]} rotationY={Math.PI / 2} />
            <WallSconce position={[17.8, 2.8, zPos]} rotationY={-Math.PI / 2} />
          </group>
        ))}

        {/* CCTV cameras in every corner of the main hall */}
        <CCTV position={[-17.75, HALL_H - 0.9, -26.75]} rotation={[0, Math.PI / 4, 0]} />
        <CCTV position={[17.75, HALL_H - 0.9, -26.75]} rotation={[0, -Math.PI / 4, 0]} />
        <CCTV position={[-17.75, HALL_H - 0.9, 26.75]} rotation={[0, (3 * Math.PI) / 4, 0]} />
        <CCTV position={[17.75, HALL_H - 0.9, 26.75]} rotation={[0, -(3 * Math.PI) / 4, 0]} />

        {/* ==== Homey decor ==== */}
        {/* Front wall: runner rug + console + windows + clock + gallery */}
        <RectRug position={[0, 0.015, 22.0]} w={7.2} d={2.5} map={rugRectMap} />
        <Console position={[0, 0, 26.6]} rotationY={Math.PI} scale={1.35} />
        <Television position={[0, 1.2, 26.55]} rotationY={Math.PI} />
        <WindowCurtains position={[-7, 2.4, 26.7]} rotationY={Math.PI} />
        <WindowCurtains position={[7, 2.4, 26.7]} rotationY={Math.PI} />
        <WallClock position={[0, 5.6, 26.55]} rotationY={Math.PI} scale={1.6} />
        {/* Potret presiden & wapres di samping jam (kiri = prabowo, kanan = gibran) */}
        <PresidentPortrait position={[2.2, 5.6, 26.55]} rotationY={Math.PI} image={prabowoImg} />
        <PresidentPortrait position={[-2.2, 5.6, 26.55]} rotationY={Math.PI} image={gibranImg} />

        {/* Back wall: a row of 8 bookcases centered under the banner */}
        {[-7.35, -5.25, -3.15, -1.05, 1.05, 3.15, 5.25, 7.35].map((x, i) => (
          <Bookcase key={`bc-${i}`} position={[x, 0, -26.55]} variant={i} />
        ))}

        {/* Back wall: windows beside the bookcases, above the benches */}
        <WindowCurtains position={[-12, 2.4, -26.55]} rotationY={0} />
        <WindowCurtains position={[12, 2.4, -26.55]} rotationY={0} />

        {/* Reading nook (right, between pillar and wall) */}
        <RoundRug position={[15.2, 0.015, 9.2]} radius={1.35} map={rugMap} />
        <Armchair position={[15.0, 0, 9.4]} rotationY={-1.89} />
        <FloorLamp position={[16.35, 0, 9.0]} rotationY={-1.1} />
        <SideTable
          position={[13.4, 0, 9.0]}
          rotationY={1.9}
          book1="gahzi"
          book2="gadisjalanan"
        />

        {/* Reading nook (left, mirror of right with Es Teh & Tech books) */}
        <RoundRug position={[-15.2, 0.015, 9.2]} radius={1.35} map={rugMap} />
        <Armchair position={[-15.0, 0, 9.4]} rotationY={1.89} />
        <FloorLamp position={[-16.35, 0, 9.0]} rotationY={1.1} />
        <SideTable
          position={[-13.4, 0, 9.0]}
          rotationY={-1.9}
          drink="icedTea"
          book1="laskar"
          book2="tanahjawa"
        />

        {/* Reading nook (right, near pillar z=-12) */}
        <RoundRug position={[15.2, 0.015, -9.2]} radius={1.35} map={rugMap} />
        <Armchair position={[15.0, 0, -9.4]} rotationY={-1.25} />
        <FloorLamp position={[16.35, 0, -9.0]} rotationY={1.1} />
        <SideTable position={[13.4, 0, -9.0]} rotationY={-1.9} book1="makanyamikir" book2="khilafah" />

        {/* Reading nook (left, mirror with Es Teh & Tech books) */}
        <RoundRug position={[-15.2, 0.015, -9.2]} radius={1.35} map={rugMap} />
        <Armchair position={[-15.0, 0, -9.4]} rotationY={1.25} />
        <FloorLamp position={[-16.35, 0, -9.0]} rotationY={-1.1} />
        <SideTable
          position={[-13.4, 0, -9.0]}
          rotationY={1.9}
          drink="icedTea"
          book1="ananda"
          book2="putusin"
        />

        {/* Hanging plants from the ceiling beams */}
        <HangingPlant position={[0, HALL_H - 0.55, 6]} drop={0.85} />
        <HangingPlant position={[7.2, HALL_H - 0.55, -6]} drop={0.7} />
        <HangingPlant position={[-7.2, HALL_H - 0.55, 18]} drop={1.0} />

        {/* Transparent guard tracing the hall walls (visual boundary, no collision) */}
        <WallGuard />
      </group>

      {/* Lights: one warm point light per room keeps the look while keeping the
      per-fragment light count low — many point lights are the #1 GPU killer. */}
      <pointLight position={[0, HALL_H - 1.6, 0]} intensity={22} distance={26} color="#cfe9ff" />

      {rooms.map((room) => {
        if (room.floor === "marble") return null
        const cx = (room.x[0] + room.x[1]) / 2
        const zs = low ? [46] : [46]
        return (
          <group key={`light-${room.id}`}>
            {zs.map((z, i) => (
              <pointLight
                key={i}
                position={[cx, H - 1.6, z]}
                intensity={z === 29 ? 16 : 14}
                distance={26}
                color="#cfe8ff"
              />
            ))}
          </group>
        )
      })}
    </group>
  )
}

export default Museum
