import { useMemo } from "react"
import { Text } from "@react-three/drei"
import * as THREE from "three"
import { textures } from "../utils/textures"
import Pillar from "../components/Pillar"
import Painting from "../components/Painting"
import ArchDoor from "../components/ArchDoor"
import Portal from "../components/Portal"
import Hologram from "../components/Hologram"
import { Bench, Pedestal, Plant, Chandelier, InfoPanel, InfoKiosk, WallSconce } from "../components/Props"
import {
  rooms,
  getWalls,
  archways,
  layoutPaintings,
  roomCategories,
  MUSEUM,
  HALL_PILLARS,
  HALL_PORTAL_Z,
  LAYOUT,
} from "./museumLayout"
import { karyaCategories, karyaProjects } from "../../data/karyaData"
import { enrichProjects, getCategoryStats } from "../../utils/hallHelpers"

const H = MUSEUM.height
const HALL_Z0 = LAYOUT.hallZ[0]
const HALL_Z1 = LAYOUT.hallZ[1]
const PARTITION_Z = LAYOUT.partitionZ

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
          color="#ffffff"
          metalness={isMarble ? 0.15 : 0.05}
          roughness={isMarble ? 0.35 : 0.6}
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
      {full && (
        <>
          {overlay(0.06, 0.08, 0.16, "#1e293b")}
          {overlay(0.1, 0.62, 1.25, "#7b93ad")}
          {overlay(0.12, 1.32, 0.06, "#38bdf8")}
          {overlay(0.12, H - 0.11, 0.2, "#e4eef9")}
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
          <CeilingMesh room={room} />
        </group>
      ))}

      {/* Walls */}
      {walls.map((wall, i) => (
        <WallBox key={i} wall={wall} wallMap={wallMap} />
      ))}

      {/* Portals + flush doors */}
      {archways.map((a, i) => {
        if (a.kind === "portal") {
          const cat = a.slug ? karyaCategories.find((c) => c.slug === a.slug) : null
          return (
            <Portal
              key={i}
              position={a.pos}
              rotationY={a.rotY}
              width={a.width}
              title={a.title}
              subtitle={
                cat
                  ? `${stats[a.slug]?.total || 0} Karya · ${stats[a.slug]?.dosen || 0} Dosen · ${stats[a.slug]?.mahasiswa || 0} Mhs`
                  : undefined
              }
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
        {/* Back wall banner */}
        <mesh position={[0, 4.6, HALL_Z0 + 0.15]}>
          <planeGeometry args={[11, 2.4]} />
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
        <mesh position={[0, 0.06, 0]} receiveShadow>
          <cylinderGeometry args={[4.2, 4.4, 0.12, 48]} />
          <meshStandardMaterial color="#2d3748" roughness={0.4} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.14, 0]} receiveShadow>
          <cylinderGeometry args={[4.1, 4.1, 0.04, 48]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.1} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.17, 0]}>
          <ringGeometry args={[4.15, 4.22, 64]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.5} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[5.8, 5.86, 64]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
        </mesh>

        {/* Floor emblem */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.155, 0]}>
          <ringGeometry args={[1.2, 1.35, 48]} />
          <meshStandardMaterial color="#64748b" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.9, 0.9, 0.02, 32]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} />
        </mesh>
        <Text
          position={[0, 0.175, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.34}
          letterSpacing={0.1}
          color="#0b1220"
          anchorX="center"
          anchorY="middle"
          raycast={() => null}
        >
          SINGGAH
        </Text>

        {/* Focal piece + spotlight */}
        <Hologram title="HALL UTAMA" />
        <spotLight
          position={[0, H - 0.25, 0]}
          angle={0.55}
          penumbra={0.5}
          intensity={380}
          distance={28}
          color="#e6f4ff"
        />

        <Chandelier position={[0, H - 1.4, HALL_Z0 + 13.5]} lit={1} />
        <Chandelier position={[0, H - 1.4, HALL_Z1 - 13.5]} lit={0.9} />

        {HALL_PILLARS.map((p, i) => (
          <Pillar key={i} position={p.position} />
        ))}

        {/* Benches in the four corners, angled toward the hall centre */}
        <Bench position={[-11.8, 0, -25]} rotationY={0.45} />
        <Bench position={[11.8, 0, -25]} rotationY={-0.45} />
        <Bench position={[-11.8, 0, 25]} rotationY={Math.PI - 0.45} />
        <Bench position={[11.8, 0, 25]} rotationY={-Math.PI + 0.45} />

        {/* Plants flanking the front portal, the back banner and the side walls */}
        <Plant position={[-3.5, 0, 25]} />
        <Plant position={[3.5, 0, 25]} />
        <Plant position={[-6.5, 0, -25]} />
        <Plant position={[6.5, 0, -25]} />
        <Plant position={[-11.8, 0, -13]} />
        <Plant position={[11.8, 0, -13]} />
        <Plant position={[-11.8, 0, 13]} />
        <Plant position={[11.8, 0, 13]} />

        {/* Aesthetic digital info kiosks near the center platform */}
        <InfoKiosk position={[-4.5, 0, 6]} rotationY={0.35} />
        <InfoKiosk position={[4.5, 0, 6]} rotationY={-0.35} />

        {/* Decorative exhibit pedestals */}
        <Pedestal position={[-7, 0, 0]} radius={0.3} top="sphere" />
        <Pedestal position={[7, 0, 0]} radius={0.3} top="cone" />

        {/* Wall sconces for aesthetic ambient side lighting */}
        {[-18, -9, 0, 9, 18].map((zPos, i) => (
          <group key={i}>
            <WallSconce position={[-13.3, 2.8, zPos]} rotationY={Math.PI / 2} />
            <WallSconce position={[13.3, 2.8, zPos]} rotationY={-Math.PI / 2} />
          </group>
        ))}

        {/* Digital directory panels between side portals */}
        {[0, 1].map((gap) => {
          const zc = (HALL_PORTAL_Z[gap] + HALL_PORTAL_Z[gap + 1]) / 2
          const left = [karyaCategories[gap], karyaCategories[gap + 1]]
          const right = [karyaCategories[gap + 3], karyaCategories[gap + 4]]
          const entry = (c) => ({
            title: c.title,
            count: stats[c.slug]?.total || 0,
          })
          return (
            <group key={gap}>
              <InfoPanel
                position={[-12.9, 0, zc]}
                rotationY={-Math.PI / 2}
                entries={left.map(entry)}
              />
              <InfoPanel
                position={[12.9, 0, zc]}
                rotationY={Math.PI / 2}
                entries={right.map(entry)}
              />
            </group>
          )
        })}
      </group>

      {/* Room decor + zone signs + category titles */}
      {rooms.map((room) => {
        if (room.floor === "marble") return null
        const isDosen = room.id.endsWith("-dosen")
        const cat = roomCategories[room.id]
        const cx = (room.x[0] + room.x[1]) / 2
        const catTitle = karyaCategories.find((c) => c.slug === cat)
        return (
          <group key={`decor-${room.id}`}>
            <Pedestal
              position={[cx + (isDosen ? -10 : 10), 0, isDosen ? room.z[0] + 1.6 : room.z[1] - 1.6]}
            />
            <Text
              position={[cx, 5.3, isDosen ? PARTITION_Z - 0.22 : PARTITION_Z + 0.22]}
              rotation={[0, isDosen ? Math.PI : 0, 0]}
              fontSize={0.42}
              color={isDosen ? "#22d3ee" : "#60a5fa"}
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02}
              outlineColor="#0b1220"
              raycast={() => null}
            >
              {isDosen ? "KARYA DOSEN" : "KARYA MAHASISWA"}
            </Text>
            {isDosen && catTitle && (
              <Text
                position={[cx, 5.55, room.z[0] + 0.18]}
                fontSize={0.4}
                color="#7dd3fc"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#0b1220"
                raycast={() => null}
              >
                {catTitle.title.toUpperCase()}
              </Text>
            )}
          </group>
        )
      })}

      {/* Lights */}
      <pointLight position={[0, 5.6, HALL_Z0 + 9]} intensity={22} distance={26} color="#cfe9ff" />
      <pointLight position={[0, 5.6, 0]} intensity={22} distance={26} color="#cfe9ff" />
      <pointLight position={[0, 5.6, HALL_Z1 - 9]} intensity={22} distance={26} color="#cfe9ff" />

      {rooms.map((room) => {
        if (room.floor === "marble") return null
        const cx = (room.x[0] + room.x[1]) / 2
        const cz = (room.z[0] + room.z[1]) / 2
        return (
          <pointLight
            key={`light-${room.id}`}
            position={[cx, 5.4, cz]}
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
