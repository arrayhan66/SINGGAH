import { useMemo } from "react"
import { Text } from "@react-three/drei"
import * as THREE from "three"
import { textures } from "../utils/textures"
import Pillar from "../components/Pillar"
import Painting from "../components/Painting"
import ArchDoor from "../components/ArchDoor"
import Portal from "../components/Portal"
import Centerpiece from "../components/Centerpiece"
import MuseumBarrier from "../components/MuseumBarrier"
import LoungeSeating from "../components/LoungeSeating"
import BenchNook from "../components/BenchNook"
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
  Television,
  HangingPlant,
  RectRug,
  RoundRug,
  PresidentPortrait,
} from "../components/HomeDecor"
import prabowoImg from "../../assets/images/prabowo.png"
import gibranImg from "../../assets/images/gibran.png"
import { Pedestal, Plant, Chandelier, InfoKiosk, WallSconce, CCTV } from "../components/Props"
import {
  rooms,
  getWalls,
  archways,
  layoutPaintings,
  roomCategories,
  MUSEUM,
  HALL_PILLARS,
  LAYOUT,
} from "./museumLayout"
import { karyaCategories, karyaProjects } from "../../data/karyaData"
import { enrichProjects, getCategoryStats } from "../../utils/hallHelpers"

const H = MUSEUM.height
const HALL_Z0 = LAYOUT.hallZ[0]
const HALL_Z1 = LAYOUT.hallZ[1]

function FloorMesh({ room, floorMap, carpetMap }) {
  const w = room.x[1] - room.x[0]
  const d = room.zFloor[1] - room.zFloor[0]
  const cx = (room.x[0] + room.x[1]) / 2
  const cz = (room.zFloor[0] + room.zFloor[1]) / 2
  const isMarble = room.floor === "marble"
  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[cx, 0, cz]}
        receiveShadow
        userData={{ action: { type: "floor" } }}
      >
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial
          map={floorMap}
          color={isMarble ? "#dbe6f2" : "#ffffff"}
          metalness={0}
          roughness={isMarble ? 0.9 : 0.6}
        />
      </mesh>
      {!isMarble && carpetMap && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[cx, 0.025, cz]}
          receiveShadow
          userData={{ action: { type: "floor" } }}
        >
          <planeGeometry args={[w - 3.2, d - 2.6]} />
          <meshStandardMaterial map={carpetMap} roughness={0.9} />
        </mesh>
      )}
    </>
  )
}

function CeilingMesh({ room }) {
  const w = room.x[1] - room.x[0]
  const d = room.z[1] - room.z[0]
  const cx = (room.x[0] + room.x[1]) / 2
  const cz = (room.z[0] + room.z[1]) / 2
  const x0 = room.x[0]
  const x1 = room.x[1]
  const z0 = room.z[0]
  const z1 = room.z[1]
  const coveMat = <meshBasicMaterial color="#9cc2e6" />

  const strips = [
    { pos: [x0 + 0.03, H - 0.4, cz], rotY: Math.PI / 2, size: [0.32, d - 0.2] },
    { pos: [x1 - 0.03, H - 0.4, cz], rotY: -Math.PI / 2, size: [0.32, d - 0.2] },
    { pos: [cx, H - 0.4, z0 + 0.03], rotY: 0, size: [w - 0.2, 0.32] },
    { pos: [cx, H - 0.4, z1 - 0.03], rotY: Math.PI, size: [w - 0.2, 0.32] },
  ]

  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[cx, H, cz]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#dbe7f5" roughness={0.9} />
      </mesh>
      {strips.map((s, i) => (
        <mesh key={i} rotation={[0, s.rotY, 0]} position={s.pos}>
          <planeGeometry args={s.size} />
          {coveMat}
        </mesh>
      ))}
    </group>
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

function Museum() {
  const wallMap = useMemo(() => textures.wallPlaster(), [])
  const marbleMap = useMemo(() => textures.marbleFloor(), [])
  const woodMap = useMemo(() => textures.woodFloor(), [])
  const carpetMap = useMemo(() => textures.carpet(), [])
  const hallGradMap = useMemo(() => textures.hallGradient(), [])
  const rugMap = useMemo(() => textures.roundRug(), [])
  const rugRectMap = useMemo(() => textures.rugRect(), [])
  const stats = useMemo(() => getCategoryStats(karyaProjects), [])
  const groups = useMemo(() => {
    const enriched = enrichProjects(karyaProjects)
    const dosen = {}
    const mhs = {}
    for (const c of karyaCategories) {
      dosen[c.slug] = enriched.filter((p) => p.category === c.slug && p.authorType === "dosen")
      mhs[c.slug] = enriched.filter((p) => p.category === c.slug && p.authorType === "mahasiswa")
    }
    return { dosen, mhs }
  }, [])

  marbleMap.repeat.set(9, 9)
  woodMap.repeat.set(3.5, 3.5)

  const walls = getWalls()

  return (
    <group>
      {/* Floors + ceilings */}
      {rooms.map((room) => (
        <group key={room.id}>
          <FloorMesh
            room={room}
            floorMap={room.floor === "marble" ? marbleMap : woodMap}
            carpetMap={room.floor === "marble" ? null : carpetMap}
          />
          {room.id === "hall" ? (
            <HallCeiling room={room} height={H} />
          ) : (
            <CeilingMesh room={room} />
          )}
        </group>
      ))}

      {/* Walls */}
      {walls.map((wall, i) => (
        <WallBox key={i} wall={wall} wallMap={wallMap} />
      ))}

      {/* Portals + flush doors */}
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
        return <ArchDoor key={i} position={a.pos} rotationY={a.rotY} width={a.width} />
      })}

      {/* Paintings */}
      {rooms.map((room) => {
        const cat = roomCategories[room.id]
        const isDosen = room.id.endsWith("-dosen")
        const projects = isDosen ? groups.dosen[cat] : groups.mhs[cat]
        const placed = layoutPaintings(room.id, projects || [])
        return placed.map((p) => (
          <Painting
            key={`${room.id}-${p.project.id}`}
            project={p.project}
            position={p.position}
            rotationY={p.rotationY}
            index={p.index}
            isDosen={p.isDosen}
          />
        ))
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
        <spotLight
          position={[0, H - 0.25, 0]}
          angle={0.55}
          penumbra={0.5}
          intensity={380}
          distance={28}
          color="#e6f4ff"
        />

        {/* Cozy topiary flanking the centre */}
        <Plant position={[-2.6, 0, 0]} variant="topiary" scale={1} />
        <Plant position={[2.6, 0, 0]} variant="topiary" scale={1} />

        {/* Museum stanchion barrier around the big circle */}
        <MuseumBarrier />

        {/* Cozy lounge seating around the circle, facing outward */}
        <LoungeSeating />

        <Chandelier position={[0, H - 1.4, HALL_Z0 + 13.5]} lit={1} drop={1.4} />
        <Chandelier position={[0, H - 1.4, HALL_Z1 - 13.5]} lit={0.9} drop={1.4} />

        {HALL_PILLARS.map((p, i) => (
          <Pillar key={i} position={p.position} />
        ))}

        {/* Corner benches — all four corners get the cozy + holo reading nook */}
        <BenchNook position={[-12, 0, -25]} rotationY={0.45} side="left" set="A" />
        <BenchNook position={[12, 0, -25]} rotationY={-0.45} side="right" set="B" />
        <BenchNook position={[-12, 0, 25]} rotationY={Math.PI - 0.45} side="left" set="C" />
        <BenchNook position={[12, 0, 25]} rotationY={-Math.PI + 0.45} side="right" set="D" />

        {/* Struktur pot: dinding samping bunga saja, samping tiang pot daun tinggi */}
        {/* Dinding kiri (x=-17.4) — bunga saja */}
        <Plant position={[-17.4, 0, -22.5]} variant="flower" flowerColor="#60a5fa" scale={1.0} />
        <Plant position={[-17.4, 0, -12]} variant="flower" flowerColor="#f8fafc" scale={1.0} />
        <Plant position={[-17.4, 0, 0]} variant="flower" flowerColor="#60a5fa" scale={1.0} />
        <Plant position={[-17.4, 0, 12]} variant="flower" flowerColor="#f8fafc" scale={1.0} />
        <Plant position={[-17.4, 0, 22.5]} variant="flower" flowerColor="#60a5fa" scale={1.0} />

        {/* Dinding kanan (x=17.4) — bunga saja */}
        <Plant position={[17.4, 0, -22.5]} variant="flower" flowerColor="#f8fafc" scale={1.0} />
        <Plant position={[17.4, 0, -9]} variant="flower" flowerColor="#60a5fa" scale={1.0} />
        <Plant position={[17.4, 0, 9]} variant="flower" flowerColor="#f8fafc" scale={1.0} />
        <Plant position={[17.4, 0, 22.5]} variant="flower" flowerColor="#60a5fa" scale={1.0} />

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
        <CCTV position={[-17.75, H - 0.9, -26.75]} rotation={[0, Math.PI / 4, 0]} />
        <CCTV position={[17.75, H - 0.9, -26.75]} rotation={[0, -Math.PI / 4, 0]} />
        <CCTV position={[-17.75, H - 0.9, 26.75]} rotation={[0, (3 * Math.PI) / 4, 0]} />
        <CCTV position={[17.75, H - 0.9, 26.75]} rotation={[0, -(3 * Math.PI) / 4, 0]} />

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
        <HangingPlant position={[0, H - 0.55, 6]} drop={0.85} />
        <HangingPlant position={[7.2, H - 0.55, -6]} drop={0.7} />
        <HangingPlant position={[-7.2, H - 0.55, 18]} drop={1.0} />

        {/* Hanging plants in the four hall corners */}
        <HangingPlant position={[14.5, H - 0.55, 22.5]} drop={0.8} />
        <HangingPlant position={[-14.5, H - 0.55, 22.5]} drop={0.7} />
        <HangingPlant position={[14.5, H - 0.55, -22.5]} drop={0.9} />
        <HangingPlant position={[-14.5, H - 0.55, -22.5]} drop={0.75} />

        {/* Transparent guard tracing the hall walls (visual boundary, no collision) */}
        <WallGuard />
      </group>

      {/* Room decor + zone signs + category titles */}
      {rooms.map((room) => {
        if (room.floor === "marble") return null
        const isDosen = room.id.endsWith("-dosen")
        const cx = (room.x[0] + room.x[1]) / 2
        return (
          <group key={`decor-${room.id}`}>
            <Pedestal
              position={[cx + (isDosen ? -10 : 10), 0, isDosen ? room.z[0] + 1.6 : room.z[1] - 1.6]}
            />
          </group>
        )
      })}

      {/* Lights */}
      <pointLight position={[0, H - 1.6, HALL_Z0 + 9]} intensity={22} distance={26} color="#cfe9ff" />
      <pointLight position={[0, H - 1.6, 0]} intensity={22} distance={26} color="#cfe9ff" />
      <pointLight position={[0, H - 1.6, HALL_Z1 - 9]} intensity={22} distance={26} color="#cfe9ff" />

      {rooms.map((room) => {
        if (room.floor === "marble") return null
        const cx = (room.x[0] + room.x[1]) / 2
        const cz = (room.z[0] + room.z[1]) / 2
        return (
          <pointLight
            key={`light-${room.id}`}
            position={[cx, H - 1.2, cz]}
            intensity={16}
            distance={26}
            color="#cfe8ff"
          />
        )
      })}
    </group>
  )
}

export default Museum
