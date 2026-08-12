import { useCallback, useMemo, useState, useRef } from "react"
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
  LesehanTable,
  PresidentPortrait,
  RoundRug,
} from "../components/HomeDecor"
import prabowoImg from "../../assets/images/prabowo.png"
import gibranImg from "../../assets/images/gibran.png"
import { Plant } from "../components/Props"
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
      <Plant position={[x0 + 4.5, 0, 29]} variant="flower" flowerColor="#f8fafc" />
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

function RoomDecorUpper({ room, projects }) {
  const x0 = room.x[0]
  const x1 = room.x[1]
  const cx = (x0 + x1) / 2
  const Y = FLOOR2_Y
  const rugMap = useMemo(() => textures.roundRug(), [])

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
      {/* Solid wall cover over the middle portal space on floor 2 (from FLOOR2_Y to ceiling H) */}
      <mesh position={[cx, (Y + H) / 2, ROW_Z0]} castShadow receiveShadow>
        <boxGeometry args={[PORTAL_W + 1.2, H - Y, 0.6]} />
        <meshStandardMaterial color="#dbe6f2" roughness={0.9} />
      </mesh>

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

function RoomCuller({ rooms }) {
  useFrame(() => {
    const p = useWalkStore.getState().position
    for (const room of rooms) {
      if (room.id === "hall") continue
      const cx = (room.x[0] + room.x[1]) / 2
      const cz = (room.z[0] + room.z[1]) / 2
      const dist = Math.hypot(p.x - cx, p.z - cz)
      const visible = dist < 75
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
