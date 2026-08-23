import { Suspense, useCallback, useMemo, useState, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Text } from "@react-three/drei"
import * as THREE from "three"
import { useWalkStore } from "../hooks/useWalk"
import InstancedMeshes from "../utils/InstancedMeshes"
import Painting from "../components/Painting"
import Portal from "../components/Portal"
import FeaturedWork from "../components/FeaturedWork"
import HaloPendant from "../components/HaloPendant"
import KaryaCeiling from "../components/KaryaCeiling"
import {
  Bookcase,
  FloorLamp,
  WallClock,
  WallFrames,
  PresidentPortrait,
  RoundRug,
  RoundTable,
  HangingPlant,
  RectRug,
} from "../components/HomeDecor"
import prabowoImg from "../../assets/images/prabowo.webp"
import gibranImg from "../../assets/images/gibran.webp"
import pkkmbImg from "../../assets/images/pkkmb.webp"
import { useDownscaledTexture } from "../utils/useDownscaledTexture"
import { Plant, WallSconce } from "../components/Props"
import { textures } from "../utils/textures"
import {
  rooms,
  paintingWalls,
  roomRails,
  layoutPaintings,
  roomCategories,
  upperSlabPieces,
  MUSEUM,
  RAIL_OFFSET,
  FLOOR2_Y,
  STAIR_WIDTH,
  STAIR_Z0,
  STAIR_Z1,
  STAIR_RISE,
  STAIR_TREAD,
  STAIR_STEPS_COUNT,
  ROW_Z0,
  PORTAL_W,
  ROOM_CENTER_Z,
  BOOKCASE_RING,
  PLANT_RING,
  PLANT_RING_JITTER,
  LAMP_ACCENT_ANGLES,
  LAMP_ACCENT_RADIUS,
  OTTOMAN_CIRCLE,
  ringAngle,
  ringPosition,
  ringRotationY,
} from "./museumLayout"

const H = MUSEUM.height
const FEATURED_ON_PODIUM = 2

// Pilih karya unggulan untuk podium: prioritas project yang ditandai admin
// lewat featured_slot (1 & 2). Kalau belum ada yang ditandai, fallback ke
// perilaku lama (2 project terakhir).
const pickFeatured = (list) => {
  const flagged = list
    .filter((p) => p.featured_slot === 1 || p.featured_slot === 2)
    .sort((a, b) => a.featured_slot - b.featured_slot)
  if (flagged.length > 0) return flagged.slice(0, FEATURED_ON_PODIUM)
  return list.slice(-FEATURED_ON_PODIUM)
}

// Project untuk dinding: buang yang sedang dipajang di podium.
const withoutFeatured = (list) => {
  const ids = new Set(pickFeatured(list).map((p) => p.id))
  return list.filter((p) => !ids.has(p.id))
}

// ---- Shared geometry & materials for the decorated staircase ----
const STAIR_RUNNER_W = STAIR_WIDTH - 0.14
const STAIR_RUNNER_D = STAIR_TREAD - 0.12

const STAIR_TREAD_GEO = new THREE.BoxGeometry(STAIR_WIDTH, STAIR_RISE + 0.02, STAIR_TREAD + 0.02)
const STAIR_RISER_GEO = new THREE.BoxGeometry(STAIR_WIDTH - 0.06, STAIR_RISE - 0.02, 0.035)
const STAIR_NOSING_GEO = new THREE.BoxGeometry(STAIR_WIDTH, 0.05, 0.02)
const STAIR_CARPET_GEO = new THREE.BoxGeometry(STAIR_RUNNER_W, 0.035, STAIR_RUNNER_D)
const STAIR_TRIM_GEO = new THREE.BoxGeometry(0.035, 0.045, STAIR_RUNNER_D + 0.04)

const STAIR_TREAD_MAT = new THREE.MeshStandardMaterial({ color: "#d9c8a8", roughness: 0.8 })
const STAIR_RISER_MAT = new THREE.MeshStandardMaterial({ color: "#1d2b42", roughness: 0.85 })
const STAIR_NOSING_MAT = new THREE.MeshStandardMaterial({ color: "#c9a35e", metalness: 0.75, roughness: 0.3 })
const STAIR_CARPET_MAT = new THREE.MeshStandardMaterial({ color: "#16304f", roughness: 0.95 })
const STAIR_TRIM_MAT = new THREE.MeshStandardMaterial({ color: "#c9a35e", metalness: 0.6, roughness: 0.35 })

// Round pouf ottoman for the reading circle. Clicking it sits the player on
// the pouf facing the centre table (sit action = snap to node + face local +z).
const POUF_FABRICS = ["#3f5a7f", "#c9a35e", "#3a6a5a", "#e9eef6", "#f3ecd9", "#7dd3fc"]

function PoufOttoman({ position, rotationY = 0, fabric = POUF_FABRICS[0] }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]} userData={{ action: { type: "sit" } }}>
      {/* Weighted base */}
      <mesh position={[0, 0.07, 0]} castShadow>
        <cylinderGeometry args={[0.36, 0.31, 0.14, 24]} />
        <meshStandardMaterial color="#1f2f4e" roughness={0.85} />
      </mesh>
      {/* Main cushion */}
      <mesh position={[0, 0.24, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.35, 0.22, 24]} />
        <meshStandardMaterial color={fabric} roughness={0.95} />
      </mesh>
      {/* Piping seam */}
      <mesh position={[0, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.385, 0.016, 10, 32]} />
        <meshStandardMaterial color="#f3ecd9" roughness={0.9} />
      </mesh>
      {/* Soft domed top */}
      <mesh position={[0, 0.35, 0]} scale={[1, 0.4, 1]} castShadow>
        <sphereGeometry args={[0.39, 24, 16]} />
        <meshStandardMaterial color={fabric} roughness={0.95} />
      </mesh>
      {/* Tufting button */}
      <mesh position={[0, 0.505, 0]}>
        <sphereGeometry args={[0.032, 10, 8]} />
        <meshStandardMaterial color="#c9a35e" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

// Central reading circle shared by both storeys: a ring of low bookcases
// facing radially outward around one grand round carpet, with a round table
// at the centre and sittable pouf ottomans gathered around it, plus a
// greenery ring outside the bookcases and warm floor-lamp accents beyond.
// Positions come from museumLayout so the collision circles in
// objectColliders.js always match the visuals.
function ReadingRing({ room, y = 0 }) {
  const cx = (room.x[0] + room.x[1]) / 2
  const rugMap = useMemo(() => textures.roundRug(), [])

  const bookcases = useMemo(
    () =>
      Array.from({ length: BOOKCASE_RING.count }, (_, i) => {
        const a = ringAngle(i, BOOKCASE_RING.count, BOOKCASE_RING.phase)
        const [x, z] = ringPosition(cx, BOOKCASE_RING.radius, a)
        return { key: i, x, z, rotY: ringRotationY(a), variant: i % 3 }
      }),
    [cx],
  )

  const plants = useMemo(
    () =>
      Array.from({ length: PLANT_RING.count }, (_, i) => {
        const a =
          ringAngle(i, PLANT_RING.count, PLANT_RING.phase) + PLANT_RING_JITTER.angle[i]
        const [x, z] = ringPosition(cx, PLANT_RING.radius + PLANT_RING_JITTER.radius[i], a)
        return { key: i, x, z, variant: ["tall", "topiary", "flower"][i % 3] }
      }),
    [cx],
  )

  const lamps = useMemo(
    () =>
      LAMP_ACCENT_ANGLES.map((a, i) => {
        const [x, z] = ringPosition(cx, LAMP_ACCENT_RADIUS, a)
        return { key: i, x, z }
      }),
    [cx],
  )

  const poufs = useMemo(() => {
    const items = []
    for (let i = 0; i < OTTOMAN_CIRCLE.count; i++) {
      const a = (i / OTTOMAN_CIRCLE.count) * Math.PI * 2 + Math.PI / OTTOMAN_CIRCLE.count
      items.push({
        key: i,
        x: cx + Math.cos(a) * OTTOMAN_CIRCLE.radius,
        z: ROOM_CENTER_Z + Math.sin(a) * OTTOMAN_CIRCLE.radius,
        rotY: -(a + Math.PI / 2),
        fabric: POUF_FABRICS[i % POUF_FABRICS.length],
      })
    }
    return items
  }, [cx])

  return (
    <group>
      {/* Grand circular carpet filling the bookcase ring */}
      <RoundRug position={[cx, y + 0.015, ROOM_CENTER_Z]} radius={6.9} map={rugMap} />

      {/* Circular wall of low bookcases */}
      {bookcases.map((b) => (
        <Bookcase key={b.key} position={[b.x, y, b.z]} rotationY={b.rotY} variant={b.variant} low />
      ))}

      {/* Greenery ring just outside the bookcases */}
      {plants.map((p) => (
        <Plant key={p.key} position={[p.x, y, p.z]} variant={p.variant} flowerColor="#7dd3fc" />
      ))}

      {/* Warm floor-lamp accents outside the plants */}
      {lamps.map((l) => (
        <FloorLamp key={l.key} position={[l.x, y, l.z]} rotationY={0.6} />
      ))}

      {/* Round table at the centre of the carpet */}
      <RoundTable position={[cx, y, ROOM_CENTER_Z]} rotationY={0.4} radius={1.5} height={0.42} />

      {/* Sittable poufs around the table, each facing the centre */}
      {poufs.map((p) => (
        <PoufOttoman key={p.key} position={[p.x, y, p.z]} rotationY={p.rotY} fabric={p.fabric} />
      ))}
    </group>
  )
}

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
        font="/fonts/Poppins-Medium.ttf"
      >
        {text}
      </Text>
    </group>
  )
}

function Stairs({ room }) {
  const x0 = room.x[0]
  const xc = x0 + STAIR_WIDTH / 2
  const n = STAIR_STEPS_COUNT
  const rugRectMap = useMemo(() => textures.rugRect(), [])

  const treads = []
  const risers = []
  const nosings = []
  const carpets = []
  const trimL = []
  const trimR = []
  const treadTint = []
  const riserTint = []

  for (let i = 0; i < n; i++) {
    const z = STAIR_Z0 + i * STAIR_TREAD + STAIR_TREAD / 2
    const y = i * STAIR_RISE + STAIR_RISE / 2
    const top = y + (STAIR_RISE + 0.02) / 2
    treads.push({ position: [xc, y, z] })
    risers.push({ position: [xc, y - STAIR_RISE / 2, z + STAIR_TREAD / 2] })
    nosings.push({ position: [xc, top + 0.02, z + STAIR_TREAD / 2 + 0.014] })
    carpets.push({ position: [xc, top + 0.012, z] })
    trimL.push({ position: [xc - STAIR_RUNNER_W / 2 + 0.03, top + 0.016, z] })
    trimR.push({ position: [xc + STAIR_RUNNER_W / 2 - 0.03, top + 0.016, z] })
    treadTint.push(i % 2 ? "#cbb691" : "#d9c8a8")
    riserTint.push(i % 2 ? "#16283f" : "#1d2b42")
  }

  return (
    <group userData={{ noCollide: true }}>
      {/* Steps: wood treads, dark risers, brass nosings, navy runner + gold trim */}
      <InstancedMeshes geometry={STAIR_TREAD_GEO} material={STAIR_TREAD_MAT} transforms={treads} colors={treadTint} count={n} castShadow />
      <InstancedMeshes geometry={STAIR_RISER_GEO} material={STAIR_RISER_MAT} transforms={risers} colors={riserTint} count={n} />
      <InstancedMeshes geometry={STAIR_NOSING_GEO} material={STAIR_NOSING_MAT} transforms={nosings} count={n} />
      <InstancedMeshes geometry={STAIR_CARPET_GEO} material={STAIR_CARPET_MAT} transforms={carpets} count={n} />
      <InstancedMeshes geometry={STAIR_TRIM_GEO} material={STAIR_TRIM_MAT} transforms={trimL} count={n} />
      <InstancedMeshes geometry={STAIR_TRIM_GEO} material={STAIR_TRIM_MAT} transforms={trimR} count={n} />

      {/* Brass cap rail on top of the stair panel */}
      <mesh
        position={[
          x0 + STAIR_WIDTH + 0.04,
          FLOOR2_Y + 1.2 + 0.08,
          (STAIR_Z0 + STAIR_Z1) / 2,
        ]}
      >
        <boxGeometry args={[0.06, 0.06, STAIR_Z1 - STAIR_Z0]} />
        <meshStandardMaterial color="#c9a35e" metalness={0.7} roughness={0.35} />
      </mesh>

      {/* Glowing wall sconces climbing the panel side */}
      {[
        [STAIR_Z0 + 1.6, 3.0],
        [STAIR_Z0 + 4.8, 4.8],
        [STAIR_Z0 + 8.0, 6.6],
      ].map(([z, y], i) => (
        <WallSconce key={`sconce-${i}`} position={[x0 + STAIR_WIDTH - 0.12, y, z]} rotationY={-Math.PI / 2} />
      ))}

      {/* Framed art climbing the left wall alongside the stairs, each at eye height for its step */}
      <WallFrames
        position={[x0 + 0.16, 0, STAIR_Z0]}
        rotationY={Math.PI / 2}
        variants={[
          { pos: [-2.25, 3.7, 0], size: [0.62, 0.85], tilt: 0.02 },
          { pos: [-4.25, 5.1, 0], size: [0.7, 0.95], tilt: -0.02 },
          { pos: [-6.25, 6.4, 0], size: [0.62, 0.85], tilt: 0.02 },
          { pos: [-8.25, 7.5, 0], size: [0.7, 0.95], tilt: -0.02 },
        ]}
      />

      {/* Welcome mat at the bottom of the stairs */}
      <RectRug position={[xc, 0.015, STAIR_Z0 - 0.55]} rotationY={0} w={2.0} d={0.8} map={rugRectMap} />

      {/* White potted flowers at the entrance before the left turn, right of the KARYA DOSEN wall (rear) */}
      <Plant position={[x0 + STAIR_WIDTH + 1.2, 0, STAIR_Z0 - 0.6]} variant="flower" flowerColor="#f8fafc" />

      {/* Hanging plant above the top of the stairs */}
      <HangingPlant position={[xc, H - 0.2, STAIR_Z1 - 0.6]} drop={1.1} />
    </group>
  )
}

function DosenStairSign({ room, y = 3.2 }) {
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
    <group position={[x, y, cz]} rotation={[0, Math.PI / 2, 0]} scale={1.5} userData={{ noCollide: true }}>
      <mesh>
        <boxGeometry args={[4.35, 1.3, 0.06]} />
        <meshStandardMaterial color="#c9a35e" metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.035]}>
        <boxGeometry args={[4.05, 1.0, 0.05]} />
        <meshStandardMaterial color="#16283f" roughness={0.5} metalness={0.35} />
      </mesh>
      <mesh position={[0, 0.44, 0.065]}>
        <boxGeometry args={[3.7, 0.03, 0.01]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.9} />
      </mesh>
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
        font="/fonts/Poppins-SemiBold.ttf"
      >
        KARYA DOSEN
      </Text>
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

function UpperSlab({ room, floorMap }) {
  const pieces = useMemo(() => upperSlabPieces(room), [room])
  const maps = useMemo(
    () =>
      pieces.map(([x0, z0, x1, z1]) => {
        const m = floorMap.clone()
        m.repeat.set((x1 - x0) / 4, (z1 - z0) / 6)
        m.needsUpdate = true
        return m
      }),
    [pieces, floorMap],
  )
  return (
    <group userData={{ noCollide: true }}>
      {pieces.map(([x0, z0, x1, z1], i) => (
        <group key={i}>
          <mesh
            position={[(x0 + x1) / 2, FLOOR2_Y - 0.13, (z0 + z1) / 2]}
            receiveShadow
          >
            <boxGeometry args={[x1 - x0, 0.26, z1 - z0]} />
            <meshStandardMaterial color="#dbe6f2" roughness={0.9} />
          </mesh>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[(x0 + x1) / 2, FLOOR2_Y + 0.01, (z0 + z1) / 2]}
            receiveShadow
          >
            <planeGeometry args={[x1 - x0, z1 - z0]} />
            <meshStandardMaterial
              map={maps[i]}
              color="#dbe6f2"
              metalness={0}
              roughness={0.9}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function RoomDecorGround({ room, projects }) {
  const x0 = room.x[0]
  const x1 = room.x[1]
  const cx = (x0 + x1) / 2

  return (
    <group key={`decor-ground-${room.id}`}>
      <FloorLabel position={[cx + 1.3, 0.06, 36]} text="LANTAI 1 · KARYA MAHASISWA" />

      <Plant position={[x1 - 2.5, 0, 36]} variant="flower" flowerColor="#60a5fa" />
      <Plant position={[x0 + STAIR_WIDTH + 1.2, 0, STAIR_Z0 - 3.4]} variant="flower" flowerColor="#f8fafc" />

      <ReadingRing room={room} y={0} />

      <FeaturedWork position={[cx + 9.5, 0, 32]} rotationY={-0.46} projects={pickFeatured(projects)} />

      <WallClock position={[cx, 5.6, room.z[1] - 0.45]} rotationY={Math.PI} scale={1.3} />
      <PresidentPortrait position={[cx + 2.0, 5.5, room.z[1] - 0.45]} rotationY={Math.PI} image={prabowoImg} />
      <PresidentPortrait position={[cx - 2.0, 5.5, room.z[1] - 0.45]} rotationY={Math.PI} image={gibranImg} />
    </group>
  )
}

// Framed PKKMB poster hung on the solid wall cover that closes off the
// upper-floor portal opening (only the ground-floor portal should exist).
function PKKMPoster({ position, rotationY = 0 }) {
  const tex = useDownscaledTexture(pkkmbImg, 1024)
  const img = useMemo(() => {
    const t = tex.clone()
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    return t
  }, [tex])
  const iw = tex.image?.width || 1
  const ih = tex.image?.height || 1
  const posterH = 5.0
  const posterW = posterH * (iw / ih)
  const frameT = 0.1

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[posterW + frameT * 2, posterH + frameT * 2, 0.06]} />
        <meshStandardMaterial color="#c9a35e" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.032]}>
        <planeGeometry args={[posterW, posterH]} />
        <meshStandardMaterial map={img} color="#eaf3fc" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0, 0.058]}>
        <planeGeometry args={[posterW, posterH]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.08} roughness={0.1} />
      </mesh>
    </group>
  )
}

function RoomDecorUpper({ room, projects }) {
  const x0 = room.x[0]
  const x1 = room.x[1]
  const cx = (x0 + x1) / 2
  const Y = FLOOR2_Y
  const wallPlaster = useMemo(() => textures.wallPlaster(), [])

  return (
    <group key={`decor-upper-${room.id}`}>
      {/* Decorative wall panel closing off the upper-floor portal opening.
          Reads as a real wall (plaster + pilasters + cornice + wainscot bands),
          not a leftover portal bug. */}
      <group>
        {/* Backing panel, same plaster texture as the other walls */}
        <mesh position={[cx, Y + 3, ROW_Z0]} castShadow receiveShadow>
          <boxGeometry args={[PORTAL_W + 1.2, 6, 0.6]} />
          <meshStandardMaterial map={wallPlaster} color="#dbe6f2" roughness={0.9} />
        </mesh>

        {/* Side pilasters framing the panel */}
        {[-1, 1].map((s) => (
          <group key={s}>
            <mesh position={[cx + s * 1.72, Y + 3, ROW_Z0 + 0.26]} castShadow>
              <boxGeometry args={[0.26, 6, 0.34]} />
              <meshStandardMaterial color="#eef3f9" roughness={0.6} />
            </mesh>
            <mesh position={[cx + s * 1.72, Y + 5.9, ROW_Z0 + 0.26]} castShadow>
              <boxGeometry args={[0.36, 0.22, 0.42]} />
              <meshStandardMaterial color="#dfe9f4" roughness={0.6} />
            </mesh>
            <mesh position={[cx + s * 1.72, Y + 0.12, ROW_Z0 + 0.26]} castShadow>
              <boxGeometry args={[0.36, 0.24, 0.42]} />
              <meshStandardMaterial color="#1e293b" roughness={0.6} />
            </mesh>
          </group>
        ))}

        {/* Top cornice + cyan accent line */}
        <mesh position={[cx, Y + 5.9, ROW_Z0 + 0.32]} castShadow>
          <boxGeometry args={[4.3, 0.24, 0.42]} />
          <meshStandardMaterial color="#e4eef9" roughness={0.6} />
        </mesh>
        <mesh position={[cx, Y + 5.72, ROW_Z0 + 0.34]}>
          <boxGeometry args={[4.2, 0.06, 0.3]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.5} />
        </mesh>

        {/* Floor bands continuing the upper-storey wainscot, tucked behind the poster */}
        <mesh position={[cx, Y + 0.08, ROW_Z0 + 0.34]} castShadow>
          <boxGeometry args={[3.96, 0.16, 0.12]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>
        <mesh position={[cx, Y + 0.62, ROW_Z0 + 0.33]} castShadow>
          <boxGeometry args={[3.96, 1.25, 0.12]} />
          <meshStandardMaterial color="#7b93ad" roughness={0.6} />
        </mesh>
        <mesh position={[cx, Y + 1.32, ROW_Z0 + 0.36]}>
          <boxGeometry args={[3.96, 0.06, 0.14]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.5} />
        </mesh>
      </group>
      <Suspense fallback={null}>
        <PKKMPoster position={[cx, Y + 3, ROW_Z0 + 0.42]} rotationY={0} />
      </Suspense>

      <FloorLabel position={[cx + 1.3, Y + 0.06, 42]} text="LANTAI 2 · KARYA DOSEN" />

      <Plant position={[x1 - 2.5, Y, 42]} variant="flower" flowerColor="#60a5fa" />
      <Plant position={[x0 + 4.5, Y, 42]} variant="flower" flowerColor="#f8fafc" />

      <ReadingRing room={room} y={Y} />

      {projects.length > 0 && (
        <FeaturedWork position={[cx + 9.5, Y, 32]} rotationY={-0.46} projects={pickFeatured(projects)} />
      )}

      <WallClock position={[cx, Y + 5.6, room.z[1] - 0.45]} rotationY={Math.PI} scale={1.3} />
      <PresidentPortrait position={[cx + 2.0, Y + 5.5, room.z[1] - 0.45]} rotationY={Math.PI} image={prabowoImg} />
      <PresidentPortrait position={[cx - 2.0, Y + 5.5, room.z[1] - 0.45]} rotationY={Math.PI} image={gibranImg} />

      <HaloPendant position={[cx - 7, H - 0.1, 58]} drop={2.2} glow={0.7} />
      <HaloPendant position={[cx + 7, H - 0.1, 58]} drop={2.2} glow={0.7} />
      <HaloPendant position={[cx - 7, H - 0.1, 76]} drop={2.2} glow={0.7} />
      <HaloPendant position={[cx + 7, H - 0.1, 76]} drop={2.2} glow={0.7} />
    </group>
  )
}

const CULL_REGISTRY = {}
const CULL_SHOW_DIST = 45
const CULL_HIDE_DIST = 60

function RoomCuller({ rooms }) {
  const visibleRef = useRef({})
  useFrame(() => {
    const p = useWalkStore.getState().position
    for (const room of rooms) {
      if (room.id === "hall") continue
      const cx = (room.x[0] + room.x[1]) / 2
      const cz = (room.z[0] + room.z[1]) / 2
      const dist = Math.hypot(p.x - cx, p.z - cz)
      const prev = visibleRef.current[room.id]
      const visible = prev ? dist < CULL_HIDE_DIST : dist < CULL_SHOW_DIST
      visibleRef.current[room.id] = visible
      for (const type of ["storey", "paint", "room-title"]) {
        const g = CULL_REGISTRY[`${type}-${room.id}`]
        if (g) g.visible = visible
      }
    }
  })
  return null
}

export function KaryaRooms({ groups, marbleMap, archways }) {
  const bindCull = useCallback(
    (key) => (el) => {
      if (el) CULL_REGISTRY[key] = el
    },
    [],
  )

  return (
    <group>
      <RoomCuller rooms={rooms} />

      {/* Floors + ceilings */}
      {rooms.map((room) => {
        if (room.id === "hall") return null
        return (
          <group key={room.id}>
            <FloorMesh room={room} floorMap={marbleMap} />
            <KaryaCeiling room={room} height={H} />
          </group>
        )
      })}

      {/* Stairs + upper slabs */}
      {rooms.map((room) => {
        if (room.id === "hall") return null
        return (
          <group key={`storey-${room.id}`} ref={bindCull(`storey-${room.id}`)}>
            <Stairs room={room} />
            <UpperSlab room={room} floorMap={marbleMap} />
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

      {/* Paintings */}
      {rooms.map((room) => {
        const cat = roomCategories[room.id]
        if (!cat) return null
        return (
          <group key={`paint-${room.id}`} ref={bindCull(`paint-${room.id}`)}>
            {["ground", "upper"].map((level) => {
              const mhsAll = groups.mhs[cat] || []
              const dosenAll = groups.dosen[cat] || []
              const list =
                level === "ground"
                  ? withoutFeatured(mhsAll)
                  : withoutFeatured(dosenAll)
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
                      key={`${room.id}-${level}-${p.key}`}
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

      {/* Room titles + decor */}
      {rooms.map((room) => {
        const cat = roomCategories[room.id]
        if (!cat) return null
        return (
          <group key={`room-title-${room.id}`} ref={bindCull(`room-title-${room.id}`)}>
            <RoomDecorGround room={room} projects={groups.mhs[cat] || []} />
            <RoomDecorUpper room={room} projects={groups.dosen[cat] || []} />
          </group>
        )
      })}
    </group>
  )
}
