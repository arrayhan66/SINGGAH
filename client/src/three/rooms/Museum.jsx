import { useMemo } from "react"
import { Text } from "@react-three/drei"
import * as THREE from "three"
import { useQualityStore } from "../hooks/useQuality"
import { textures } from "../utils/textures"
import Pillar from "../components/Pillar"
import Centerpiece from "../components/Centerpiece"
import MuseumBarrier from "../components/MuseumBarrier"
import LoungeSeating from "../components/LoungeSeating"
import HallCeiling from "../components/HallCeiling"
import WallGuard from "../components/WallGuard"
import {
  Console,
  Bookcase,
  Armchair,
  FloorLamp,
  SideTable,
  WallClock,
  WindowCurtains,
  RectRug,
  RoundRug,
  PresidentPortrait,
  Television,
  HangingPlant,
} from "../components/HomeDecor"
import prabowoImg from "../../assets/images/prabowo.webp"
import gibranImg from "../../assets/images/gibran.webp"
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
  MUSEUM,
  HALL_PILLARS,
  LAYOUT,
} from "./museumLayout"
import { KaryaRooms } from "./KaryaRooms"
import { enrichProjects, getCategoryStats } from "../../utils/hallHelpers"

const H = MUSEUM.height
const HALL_H = MUSEUM.hallHeight
const HALL_Z0 = LAYOUT.hallZ[0]
const HALL_Z1 = LAYOUT.hallZ[1]

function WallBox({ wall, wallMap }) {
  const { axis, at, from, to, t, y0 = 0, y1 = H } = wall
  const len = to - from
  const hh = y1 - y0
  const cy = (y0 + y1) / 2
  const center = axis === "x" ? [at, cy, (from + to) / 2] : [(from + to) / 2, cy, at]
  const size = axis === "x" ? [t, hh, len] : [len, hh, t]
  const full = y0 <= 0.05
  const topMold = y1 >= H - 0.05
  const inset = wall.bandInset || 0
  const mitered = axis === "x" && (wall.miterFront || wall.miterBack)
  const miterShape = useMemo(() => {
    if (!mitered) return null
    const s = new THREE.Shape()
    s.moveTo(at + t / 2, -from)
    s.lineTo(at - t / 2, -(from + t / 2))
    s.lineTo(at - t / 2, -(to - t / 2))
    s.lineTo(at + t / 2, -to)
    s.closePath()
    return s
  }, [mitered, at, from, to, t])

  const overlay = (thick, y, h, color) => {
    const o = t + thick
    const ln = len - 2 * inset
    const s = axis === "x" ? [o, h, ln] : [ln, h, o]
    const c = axis === "x" ? [at, y, (from + to) / 2] : [(from + to) / 2, y, at]
    return (
      <mesh position={c} castShadow={h < 1}>
        <boxGeometry args={s} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    )
  }

  return (
    <group userData={wall.noCollide ? { noCollide: true } : {}}>
      {mitered ? (
        <mesh position={[0, y0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
          <extrudeGeometry args={[miterShape, { depth: hh, bevelEnabled: false }]} />
          <meshStandardMaterial map={wallMap} color="#dfe9f4" roughness={0.9} />
        </mesh>
      ) : (
        <mesh position={center} receiveShadow castShadow>
          <boxGeometry args={size} />
          <meshStandardMaterial map={wallMap} color="#dfe9f4" roughness={0.9} />
        </mesh>
      )}
      {topMold && overlay(0.12, H - 0.11, 0.2, "#e4eef9")}
      {full && !wall.noCover && (
        <>
          {wall.hall ? (
            <>
              {overlay(0.1, 1.1, 2.2, "#7b93ad")}
              {overlay(0.12, 2.275, 0.06, "#38bdf8")}
            </>
          ) : (
            <>
              {overlay(0.1, 0.62, 1.25, "#7b93ad")}
              {overlay(0.12, 1.32, 0.06, "#38bdf8")}
            </>
          )}
        </>
      )}
      {wall.bands &&
        wall.bands.map(([thick, y, h, color], i) => (
          <group key={`band-${i}`}>{overlay(thick, y0 + y, h, color)}</group>
        ))}
      {wall.upperBands &&
        wall.upperBands.map(([thick, y, h, color], i) => (
          <group key={`uband-${i}`}>{overlay(thick, y, h, color)}</group>
        ))}
    </group>
  )
}

function HallFloorMesh({ room, floorMap }) {
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

function Museum({ hallData }) {
  const wallMap = useMemo(() => textures.wallPlaster(), [])
  const marbleMap = useMemo(() => textures.marbleFloor(), [])
  const hallGradMap = useMemo(() => textures.hallGradient(), [])
  const rugMap = useMemo(() => textures.roundRug(), [])
  const rugRectMap = useMemo(() => textures.rugRect(), [])
  const tier = useQualityStore((s) => s.tier)
  const low = tier === "rendah"

  const categories = hallData?.categories || []
  const projects = hallData?.projects || []

  const stats = useMemo(() => getCategoryStats(projects, categories), [projects, categories])
  const groups = useMemo(() => {
    const enriched = enrichProjects(projects)
    const dosen = {}
    const mhs = {}
    for (const c of categories) {
      dosen[c.slug] = enriched.filter((p) => (p.category || p.Category?.slug) === c.slug && p.authorType === "dosen").slice(0, 4)
      mhs[c.slug] = enriched.filter((p) => (p.category || p.Category?.slug) === c.slug && p.authorType === "mahasiswa").slice(0, 12)
    }
    return { dosen, mhs }
  }, [categories, projects])

  marbleMap.repeat.set(9, 9)
  const walls = getWalls()

  return (
    <group>
      {/* Main Hall Floor & Ceiling */}
      {rooms.map((room) => {
        if (room.id !== "hall") return null
        return (
          <group key={room.id}>
            <HallFloorMesh room={room} floorMap={marbleMap} />
            <HallCeiling room={room} height={HALL_H} />
          </group>
        )
      })}

      {/* Walls */}
      {walls.map((wall, i) => (
        <WallBox key={i} wall={wall} wallMap={wallMap} />
      ))}

      {/* Category Rooms (separated in KaryaRooms.jsx) */}
      <KaryaRooms groups={groups} marbleMap={marbleMap} archways={archways} />

      {/* Hall decor */}
      <group>
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.03, 0]}
          receiveShadow
          userData={{ action: { type: "floor" } }}
        >
          <planeGeometry args={[LAYOUT.hallX[1] - LAYOUT.hallX[0], LAYOUT.hallZ[1] - LAYOUT.hallZ[0]]} />
          <meshBasicMaterial map={hallGradMap} transparent depthWrite={false} />
        </mesh>

        <mesh position={[0, 6.4, HALL_Z0 + 0.15]}>
          <planeGeometry args={[16, 2.4]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>
        <Text
          position={[0, 7.3, HALL_Z0 + 0.05]}
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
          position={[0, 6.3, HALL_Z0 + 0.05]}
          fontSize={0.36}
          color="#93c5fd"
          anchorX="center"
          anchorY="middle"
          raycast={() => null}
        >
          Pameran Karya Dosen & Mahasiswa Jurusan Teknologi Informasi
        </Text>

        <mesh position={[0, 0.135, 0]} receiveShadow>
          <cylinderGeometry args={[4.1, 4.1, 0.03, 48]} />
          <meshStandardMaterial color="#4b5a73" roughness={0.9} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[5.8, 5.86, 64]} />
          <meshStandardMaterial color="#a98f5e" metalness={0.5} roughness={0.4} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-4} />
        </mesh>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.141, 0]} receiveShadow>
          <circleGeometry args={[3.6, 64]} />
          <meshStandardMaterial map={rugMap} roughness={0.95} />
        </mesh>

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

        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * 3.84, 0.155, Math.sin(a) * 3.84]}>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshStandardMaterial color="#c9a35e" metalness={0.75} roughness={0.25} />
            </mesh>
          )
        })}

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

        <Plant position={[-2.6, 0, 0]} variant="topiary" scale={1} />
        <Plant position={[2.6, 0, 0]} variant="topiary" scale={1} />

        <MuseumBarrier />
        <LoungeSeating />

        <Chandelier position={[0, HALL_H - 1.4, HALL_Z0 + 13.5]} lit={1} drop={1.4} />
        <Chandelier position={[0, HALL_H - 1.4, HALL_Z1 - 13.5]} lit={0.9} drop={1.4} />

        {HALL_PILLARS.map((p, i) => (
          <Pillar key={i} position={p.position} />
        ))}

        <Plant position={[-17.4, 0, -12]} variant="flower" flowerColor="#60a5fa" scale={1.0} />
        <Plant position={[-17.4, 0, 0]} variant="flower" flowerColor="#f8fafc" scale={1.0} />
        <Plant position={[-17.4, 0, 12]} variant="flower" flowerColor="#60a5fa" scale={1.0} />

        <Plant position={[17.4, 0, -9]} variant="flower" flowerColor="#60a5fa" scale={1.0} />
        <Plant position={[17.4, 0, 9]} variant="flower" flowerColor="#f8fafc" scale={1.0} />

        <InfoKiosk position={[-4.5, 0, 6]} rotationY={0.35} stats={stats} categories={categories} />
        <InfoKiosk position={[4.5, 0, 6]} rotationY={-0.35} variant="guide" />

        {[-12, 12].map((zPos, i) => (
          <group key={i}>
            <WallSconce position={[-17.8, 2.8, zPos]} rotationY={Math.PI / 2} />
            <WallSconce position={[17.8, 2.8, zPos]} rotationY={-Math.PI / 2} />
          </group>
        ))}

        <CCTV position={[-17.75, HALL_H - 0.9, -26.75]} rotation={[0, Math.PI / 4, 0]} />
        <CCTV position={[17.75, HALL_H - 0.9, -26.75]} rotation={[0, -Math.PI / 4, 0]} />
        <CCTV position={[-17.75, HALL_H - 0.9, 26.75]} rotation={[0, (3 * Math.PI) / 4, 0]} />
        <CCTV position={[17.75, HALL_H - 0.9, 26.75]} rotation={[0, -(3 * Math.PI) / 4, 0]} />

        <RectRug position={[0, 0.015, 22.0]} w={7.2} d={2.5} map={rugRectMap} />
        <Console position={[0, 0, 26.6]} rotationY={Math.PI} scale={1.35} />
        <Television position={[0, 1.2, 26.55]} rotationY={Math.PI} />
        <WindowCurtains position={[-7, 2.4, 26.7]} rotationY={Math.PI} />
        <WindowCurtains position={[7, 2.4, 26.7]} rotationY={Math.PI} />
        <WallClock position={[0, 7.4, 26.55]} rotationY={Math.PI} scale={1.6} />
        <PresidentPortrait position={[2.2, 7.4, 26.55]} rotationY={Math.PI} image={prabowoImg} />
        <PresidentPortrait position={[-2.2, 7.4, 26.55]} rotationY={Math.PI} image={gibranImg} />

        {[-7.35, -5.25, -3.15, -1.05, 1.05, 3.15, 5.25, 7.35].map((x, i) => (
          <Bookcase key={`bc-${i}`} position={[x, 0, -26.55]} variant={i} />
        ))}

        <WindowCurtains position={[-12, 2.4, -26.55]} rotationY={0} />
        <WindowCurtains position={[12, 2.4, -26.55]} rotationY={0} />

        <RoundRug position={[15.2, 0.015, 9.2]} radius={1.35} map={rugMap} />
        <Armchair position={[15.0, 0, 9.4]} rotationY={-1.89} />
        <FloorLamp position={[16.35, 0, 9.0]} rotationY={-1.1} />
        <SideTable
          position={[13.4, 0, 9.0]}
          rotationY={1.9}
          book1="gahzi"
          book2="gadisjalanan"
        />

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

        <RoundRug position={[15.2, 0.015, -9.2]} radius={1.35} map={rugMap} />
        <Armchair position={[15.0, 0, -9.4]} rotationY={-1.25} />
        <FloorLamp position={[16.35, 0, -9.0]} rotationY={1.1} />
        <SideTable position={[13.4, 0, -9.0]} rotationY={-1.9} book1="makanyamikir" book2="khilafah" />

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

        <HangingPlant position={[0, HALL_H - 0.55, 6]} drop={0.85} />
        <HangingPlant position={[7.2, HALL_H - 0.55, -6]} drop={0.7} />
        <HangingPlant position={[-7.2, HALL_H - 0.55, 18]} drop={1.0} />

        <WallGuard />
      </group>

      <pointLight position={[0, HALL_H - 1.6, 0]} intensity={22} distance={20} color="#cfe9ff" />

      {rooms.map((room) => {
        if (room.floor === "marble") return null
        const cx = (room.x[0] + room.x[1]) / 2
        return (
          <group key={`light-${room.id}`}>
            <pointLight
              position={[cx, H - 1.6, 46]}
              intensity={14}
              distance={26}
              color="#cfe8ff"
            />
          </group>
        )
      })}
    </group>
  )
}

export default Museum
