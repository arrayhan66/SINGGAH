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
  LesehanTable,
  PresidentPortrait,
  RoundRug,
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
} from "./museumLayout"

const H = MUSEUM.height
const FEATURED_ON_PODIUM = 2

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

// Shared geometry/material for the ring of reading ottomans, instanced per room.
const OTTOMAN_LEG_GEO = new THREE.BoxGeometry(0.06, 0.32, 0.06)
const OTTOMAN_SEAT_GEO = new THREE.BoxGeometry(0.62, 0.24, 0.42)
const OTTOMAN_TOP_GEO = new THREE.BoxGeometry(0.54, 0.08, 0.36)
const OTTOMAN_LEG_MAT = new THREE.MeshStandardMaterial({ color: "#1f2f4e", roughness: 0.55 })
const OTTOMAN_SEAT_MAT = new THREE.MeshStandardMaterial({ color: "#3f5a7f", roughness: 0.9 })
const OTTOMAN_TOP_MAT = new THREE.MeshStandardMaterial({ color: "#e9eef6", roughness: 0.95 })
const OTTOMAN_LEG_OFFSETS = [
  [-0.2, -0.12],
  [0.2, -0.12],
  [-0.2, 0.12],
  [0.2, 0.12],
]

function InstancedOttoman({ items }) {
  const data = useMemo(() => {
    const legs = []
    const seats = []
    const tops = []
    for (const o of items) {
      const c = Math.cos(o.rotY)
      const s = Math.sin(o.rotY)
      for (const [lx, lz] of OTTOMAN_LEG_OFFSETS) {
        legs.push({
          position: [o.x + c * lx - s * lz, 0.16, o.z + s * lx + c * lz],
          rotation: [0, o.rotY, 0],
        })
      }
      seats.push({ position: [o.x, 0.34, o.z], rotation: [0, o.rotY, 0] })
      tops.push({ position: [o.x, 0.5, o.z], rotation: [0, o.rotY, 0] })
    }
    return { legs, seats, tops }
  }, [items])
  return (
    <group userData={{ noCollide: true }}>
      <InstancedMeshes geometry={OTTOMAN_LEG_GEO} material={OTTOMAN_LEG_MAT} transforms={data.legs} count={data.legs.length} castShadow />
      <InstancedMeshes geometry={OTTOMAN_SEAT_GEO} material={OTTOMAN_SEAT_MAT} transforms={data.seats} count={data.seats.length} castShadow />
      <InstancedMeshes geometry={OTTOMAN_TOP_GEO} material={OTTOMAN_TOP_MAT} transforms={data.tops} count={data.tops.length} />
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
  const rugMap = useMemo(() => textures.roundRug(), [])

  const ottLeft = useMemo(
    () =>
      [44, 56, 68].flatMap((z) => [
        { x: x0 + 3.2, z: z - 0.4, rotY: 0.3 },
        { x: x0 + 4.6, z: z - 0.2, rotY: -0.3 },
        { x: x0 + 4.0, z: z + 0.5, rotY: Math.PI },
      ]),
    [x0],
  )
  const ottRight = useMemo(
    () =>
      [44, 56, 68].flatMap((z) => [
        { x: x1 - 3.2, z: z - 0.4, rotY: -0.3 },
        { x: x1 - 4.6, z: z - 0.2, rotY: 0.3 },
        { x: x1 - 4.0, z: z + 0.5, rotY: Math.PI },
      ]),
    [x1],
  )

  return (
    <group key={`decor-ground-${room.id}`}>
      <FloorLabel position={[cx, 0.06, 29]} text="LANTAI 1 · KARYA MAHASISWA" />

      <Plant position={[x1 - 2.5, 0, 29]} variant="flower" flowerColor="#60a5fa" />
      <Plant position={[x0 + STAIR_WIDTH + 1.2, 0, STAIR_Z0 - 3.4]} variant="flower" flowerColor="#f8fafc" />
      <Plant position={[cx - 6.6, 0, 29]} variant="tall" />
      <Plant position={[cx + 6.6, 0, 29]} variant="tall" />

      <InstancedOttoman items={ottLeft} />
      <InstancedOttoman items={ottRight} />
      {[44, 56, 68].map((z, i) => (
        <group key={`ott-l-${i}`}>
          <FloorLamp position={[x0 + 4.0, 0, z + 1.6]} rotationY={0.8} />
          <RoundRug position={[x0 + 4.0, 0.015, z]} radius={1.6} map={rugMap} />
          <Bookcase position={[x0 + 5.8, 0, z]} rotationY={-Math.PI / 2} variant={i % 3} low />
          <LesehanTable
            position={[x0 + 11.0, 0, z]}
            rotationY={i * 0.3}
            radius={1.0}
            cushionCount={4}
            rugRadius={1.5}
            books={[
              { cover: i === 0 ? "laskar" : i === 1 ? "sherlock" : "python", x: -0.35, z: 0.4, rot: 0.2, w: 0.15 },
              { cover: i === 0 ? "gahzi" : i === 1 ? "eragon" : "bintang", x: 0.15, z: 0.5, rot: 0.5, w: 0.15 },
              { cover: i === 0 ? "atomic" : i === 1 ? "python" : "gadisjalanan", x: 0.5, z: 0.15, rot: 0.8, w: 0.15 },
            ]}
            drink={{ type: i === 0 ? "greenTea" : i === 1 ? "mixue" : "icedTea", x: 0.4, z: -0.3 }}
          />
          <Bookcase position={[x0 + 13.5, 0, z]} rotationY={-Math.PI / 2} variant={i % 3} />
        </group>
      ))}

      {[44, 56, 68].map((z, i) => (
        <group key={`ott-r-${i}`}>
          <FloorLamp position={[x1 - 4.0, 0, z + 1.6]} rotationY={-0.8} />
          <RoundRug position={[x1 - 4.0, 0.015, z]} radius={1.6} map={rugMap} />
          <Bookcase position={[x1 - 5.8, 0, z]} rotationY={Math.PI / 2} variant={i % 3} low />
          <LesehanTable
            position={[x1 - 11.0, 0, z]}
            rotationY={i * 0.3}
            radius={1.0}
            cushionCount={4}
            rugRadius={1.5}
            books={[
              { cover: i === 0 ? "eragon" : i === 1 ? "bintang" : "gahzi", x: -0.35, z: 0.4, rot: -0.2, w: 0.15 },
              { cover: i === 0 ? "tanahjawa" : i === 1 ? "laskar" : "putusin", x: 0.15, z: 0.5, rot: -0.5, w: 0.15 },
              { cover: i === 0 ? "teras" : i === 1 ? "makanyamikir" : "ananda", x: 0.5, z: 0.15, rot: -0.8, w: 0.15 },
            ]}
            drink={{ type: i === 0 ? "coffee" : i === 1 ? "mixue" : "icedTea", x: 0.4, z: 0.3 }}
          />
          <Bookcase position={[x1 - 13.5, 0, z]} rotationY={Math.PI / 2} variant={i % 3} />
        </group>
      ))}

      <LesehanTable
        position={[cx, 0, 52]}
        rotationY={0.2}
        radius={1.6}
        cushionCount={8}
        rugRadius={2.4}
        books={[
          { cover: "laskar", x: -0.5, z: 0.45, rot: 0.2, w: 0.18 },
          { cover: "gahzi", x: -0.18, z: 0.55, rot: 0.65, w: 0.15 },
          { cover: "einstein", x: 0.35, z: 0.6, rot: 1.1, w: 0.18 },
          { cover: "teras", x: 0.6, z: 0.1, rot: 1.4, w: 0.15 },
        ]}
        drink={{ type: "coffee", x: 0.55, z: -0.4 }}
      />
      <LesehanTable
        position={[cx, 0, 62]}
        rotationY={-0.2}
        radius={1.6}
        cushionCount={8}
        rugRadius={2.4}
        books={[
          { cover: "eragon", x: -0.5, z: 0.45, rot: -0.2, w: 0.18 },
          { cover: "bintang", x: -0.18, z: 0.55, rot: -0.65, w: 0.15 },
          { cover: "sherlock", x: 0.35, z: 0.6, rot: -1.1, w: 0.18 },
          { cover: "python", x: 0.6, z: 0.1, rot: -1.4, w: 0.15 },
        ]}
        drink={{ type: "mixue", x: 0.55, z: 0.4 }}
      />
      <Text
        position={[cx, 0.05, 57]}
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

      <Plant position={[cx - 8.0, 0, 52]} variant="topiary" />
      <Plant position={[cx + 8.0, 0, 52]} variant="topiary" />
      <Plant position={[cx - 9.5, 0, 48]} variant="tall" scale={1.5} potColor="#f1f5f9" />
      <Plant position={[cx + 9.5, 0, 48]} variant="tall" scale={1.5} potColor="#f1f5f9" />

      <FeaturedWork position={[cx + 9.5, 0, 32]} rotationY={-0.46} projects={projects.slice(-FEATURED_ON_PODIUM)} />

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
  const rugMap = useMemo(() => textures.roundRug(), [])
  const wallPlaster = useMemo(() => textures.wallPlaster(), [])

  const ottLeft = useMemo(
    () =>
      [54, 66, 78].flatMap((z) => [
        { x: x0 + 3.2, z: z - 0.4, rotY: 0.3 },
        { x: x0 + 4.6, z: z - 0.2, rotY: -0.3 },
        { x: x0 + 4.0, z: z + 0.5, rotY: Math.PI },
      ]),
    [x0],
  )
  const ottRight = useMemo(
    () =>
      [54, 66, 78].flatMap((z) => [
        { x: x1 - 3.2, z: z - 0.4, rotY: -0.3 },
        { x: x1 - 4.6, z: z - 0.2, rotY: 0.3 },
        { x: x1 - 4.0, z: z + 0.5, rotY: Math.PI },
      ]),
    [x1],
  )

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

      <FloorLabel position={[cx, Y + 0.06, 30]} text="LANTAI 2 · KARYA DOSEN" />

      <Plant position={[x1 - 2.5, Y, 30]} variant="flower" flowerColor="#60a5fa" />
      <Plant position={[x0 + 4.5, Y, 30]} variant="flower" flowerColor="#f8fafc" />
      <Plant position={[cx - 6.6, Y, 30]} variant="tall" />
      <Plant position={[cx + 6.6, Y, 30]} variant="tall" />

      <group position={[0, Y, 0]}>
        <InstancedOttoman items={ottLeft} />
        <InstancedOttoman items={ottRight} />
      </group>
      {[54, 66, 78].map((z, i) => (
        <group key={`ott-l-${i}`}>
          <FloorLamp position={[x0 + 4.0, Y, z + 1.6]} rotationY={0.8} />
          <RoundRug position={[x0 + 4.0, Y + 0.015, z]} radius={1.6} map={rugMap} />
          <Bookcase position={[x0 + 5.8, Y, z]} rotationY={-Math.PI / 2} variant={i % 3} low />
          <LesehanTable
            position={[x0 + 11.0, Y, z]}
            rotationY={i * 0.3}
            radius={1.0}
            cushionCount={4}
            rugRadius={1.5}
            books={[
              { cover: i === 0 ? "laskar" : i === 1 ? "sherlock" : "python", x: -0.4, z: 0.35, rot: 0.2, w: 0.15 },
            ]}
            drink={{ type: i === 0 ? "greenTea" : i === 1 ? "mixue" : "icedTea", x: 0.4, z: -0.3 }}
          />
          <Bookcase position={[x0 + 13.5, Y, z]} rotationY={-Math.PI / 2} variant={i % 3} />
        </group>
      ))}

      {[54, 66, 78].map((z, i) => (
        <group key={`ott-r-${i}`}>
          <FloorLamp position={[x1 - 4.0, Y, z + 1.6]} rotationY={-0.8} />
          <RoundRug position={[x1 - 4.0, Y + 0.015, z]} radius={1.6} map={rugMap} />
          <Bookcase position={[x1 - 5.8, Y, z]} rotationY={Math.PI / 2} variant={i % 3} low />
          <LesehanTable
            position={[x1 - 11.0, Y, z]}
            rotationY={i * 0.3}
            radius={1.0}
            cushionCount={4}
            rugRadius={1.5}
            books={[
              { cover: i === 0 ? "eragon" : i === 1 ? "bintang" : "gahzi", x: -0.4, z: 0.35, rot: -0.2, w: 0.15 },
            ]}
            drink={{ type: i === 0 ? "coffee" : "greenTea", x: 0.4, z: 0.3 }}
          />
          <Bookcase position={[x1 - 13.5, Y, z]} rotationY={Math.PI / 2} variant={i % 3} />
        </group>
      ))}

      <LesehanTable
        position={[cx, Y, 60]}
        rotationY={0.2}
        radius={1.8}
        cushionCount={8}
        rugRadius={2.4}
        books={[
          { cover: "laskar", x: -0.5, z: 0.45, rot: 0.2, w: 0.18 },
          { cover: "gahzi", x: -0.18, z: 0.55, rot: 0.65, w: 0.15 },
          { cover: "einstein", x: 0.35, z: 0.6, rot: 1.1, w: 0.18 },
          { cover: "teras", x: 0.6, z: 0.1, rot: 1.4, w: 0.15 },
        ]}
        drink={{ type: "coffee", x: 0.55, z: -0.4 }}
      />
      <LesehanTable
        position={[cx, Y, 72]}
        rotationY={-0.2}
        radius={1.6}
        cushionCount={8}
        rugRadius={2.4}
        books={[
          { cover: "eragon", x: -0.5, z: 0.45, rot: -0.2, w: 0.18 },
          { cover: "bintang", x: -0.18, z: 0.55, rot: -0.65, w: 0.15 },
          { cover: "sherlock", x: 0.35, z: 0.6, rot: -1.1, w: 0.18 },
          { cover: "python", x: 0.6, z: 0.1, rot: -1.4, w: 0.15 },
        ]}
        drink={{ type: "mixue", x: 0.55, z: 0.4 }}
      />
      <Text
        position={[cx, Y + 0.05, 66]}
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

      <Plant position={[cx - 8.0, Y, 60]} variant="topiary" />
      <Plant position={[cx + 8.0, Y, 60]} variant="topiary" />
      <Plant position={[cx - 9.5, Y, 60]} variant="tall" scale={1.5} potColor="#f1f5f9" />
      <Plant position={[cx + 9.5, Y, 60]} variant="tall" scale={1.5} potColor="#f1f5f9" />

      {projects.length > 0 && (
        <FeaturedWork position={[cx + 9.5, Y, 32]} rotationY={-0.46} projects={projects.slice(-FEATURED_ON_PODIUM)} />
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
                  ? mhsAll.slice(0, mhsAll.length - FEATURED_ON_PODIUM)
                  : dosenAll.slice(0, dosenAll.length - FEATURED_ON_PODIUM)
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
