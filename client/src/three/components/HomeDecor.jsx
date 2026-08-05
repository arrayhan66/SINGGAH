import { useMemo } from "react"
import * as THREE from "three"
import { textures } from "../utils/textures"

const WOOD = "#2a3d5f"
const WOOD_DARK = "#1f2f4e"
const FABRIC = "#3f5a7f"
const FABRIC_DARK = "#1f2f4e"
const FABRIC_LIGHT = "#e9eef6"
const OFFWHITE = "#f1f5f9"
const BRASS = "#c9a35e"
const CYAN = "#7dd3fc"
const CREAM = "#f3ecd9"
const LEAF = "#3a6a5a"
const LEAF_DARK = "#2f5f4f"

const BOOK_COLORS = ["#3f6a9e", "#7fa4c9", "#a9c4e0", "#dbe7f5", "#eef3f9", "#c9a35e", "#7dd3fc", "#93b4d4", "#5a7f9e"]

function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a += 0x6d2b79f5
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function BookMesh({ x, y, w, h, c, tex }) {
  return (
    <group position={[x, y + h / 2, 0]}>
      <mesh castShadow>
        <boxGeometry args={[w, h, 0.2]} />
        <meshStandardMaterial color={c} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.104]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={tex} roughness={0.55} />
      </mesh>
    </group>
  )
}

function FlatStack({ x, y, z = -0.04, w = 0.24, rand }) {
  const n = 2 + ((rand() * 2) | 0)
  const pages = textures.bookPages()
  const boxes = []
  let yy = y
  for (let i = 0; i < n; i++) {
    const h = 0.05
    boxes.push({ x, y: yy + h / 2, w, h, c: BOOK_COLORS[(rand() * BOOK_COLORS.length) | 0] })
    yy += h
  }
  return boxes.map((b, i) => (
    <group key={i} position={[b.x, b.y, z]}>
      <mesh castShadow>
        <boxGeometry args={[b.w, b.h, 0.2]} />
        <meshStandardMaterial color={b.c} roughness={0.75} />
      </mesh>
      <mesh position={[0, 0, 0.104]}>
        <planeGeometry args={[b.w, b.h]} />
        <meshStandardMaterial map={pages} roughness={0.9} />
      </mesh>
    </group>
  ))
}

function ShelfObject({ type, x, y, z = -0.04, rand }) {
  switch (type) {
    case "globe":
      return (
        <group position={[x, y, z]} rotation={[0, (rand() - 0.5) * 0.5, 0]}>
          <mesh position={[0, 0.035, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 0.07, 16]} />
            <meshStandardMaterial color="#8ea9c9" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.105, 0]}>
            <cylinderGeometry args={[0.04, 0.055, 0.04, 12]} />
            <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
          </mesh>
          <group position={[0, 0.21, 0]} rotation={[0, 0, 0.41]}>
            <mesh>
              <torusGeometry args={[0.105, 0.005, 8, 48]} />
              <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0, 0]} castShadow>
              <sphereGeometry args={[0.085, 32, 32]} />
              <meshStandardMaterial map={textures.globe()} roughness={0.55} />
            </mesh>
            <mesh position={[0, 0.105, 0]}>
              <sphereGeometry args={[0.012, 8, 8]} />
              <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0, -0.105, 0]}>
              <sphereGeometry args={[0.012, 8, 8]} />
              <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        </group>
      )
    case "vase":
      return (
        <group position={[x, y, z]}>
          <mesh position={[0, 0.08, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, 0.16, 14]} />
            <meshStandardMaterial color={CYAN} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.17, 0]}>
            <cylinderGeometry args={[0.035, 0.06, 0.03, 14]} />
            <meshStandardMaterial color={CYAN} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.05, 0.035, 0.03, 14]} />
            <meshStandardMaterial color={BRASS} metalness={0.6} roughness={0.35} />
          </mesh>
          {[
            [0.04, 0.28, 0.01],
            [-0.03, 0.32, -0.02],
            [0.01, 0.26, 0.03],
          ].map((p, i) => (
            <mesh key={i} position={p} rotation={[0, 0, (i - 1) * 0.2]}>
              <cylinderGeometry args={[0.006, 0.006, 0.12, 6]} />
              <meshStandardMaterial color={LEAF} roughness={0.8} />
            </mesh>
          ))}
        </group>
      )
    case "photo":
      return (
        <group position={[x, y, z]} rotation={[0.14, 0, (rand() - 0.5) * 0.08]}>
          <mesh position={[0, 0.12, 0]} castShadow>
            <boxGeometry args={[0.13, 0.17, 0.025]} />
            <meshStandardMaterial color={BRASS} metalness={0.6} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.12, 0.013]}>
            <planeGeometry args={[0.1, 0.14]} />
            <meshStandardMaterial color="#93b4d4" roughness={0.45} />
          </mesh>
        </group>
      )
    case "plant":
      return (
        <group position={[x, y, z]}>
          <mesh position={[0, 0.045, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.06, 0.09, 12]} />
            <meshStandardMaterial color="#8ea9c9" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.014, 0.02, 0.11, 8]} />
            <meshStandardMaterial color={LEAF_DARK} roughness={0.85} />
          </mesh>
          {[
            [0, 0.2, 0],
            [0.05, 0.22, 0.02],
            [-0.05, 0.21, -0.02],
            [0.02, 0.24, 0.01],
            [-0.03, 0.23, 0.03],
          ].map((p, i) => (
            <mesh key={i} position={p} rotation={[0, i * 0.7, (rand() - 0.5) * 0.3]}>
              <sphereGeometry args={[0.055, 10, 10]} />
              <meshStandardMaterial color={i % 2 ? LEAF : LEAF_DARK} roughness={0.85} />
            </mesh>
          ))}
        </group>
      )
    default:
      return (
        <group position={[x, y, z]}>
          <mesh position={[0, 0.015, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.09, 0.03, 12]} />
            <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.36, 14]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.7} transparent opacity={0.85} />
          </mesh>
          <mesh position={[0, 0.07, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.13, 12]} />
            <meshStandardMaterial color={CYAN} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.29, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.13, 12]} />
            <meshStandardMaterial color={CYAN} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.18, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.012, 0.012, 0.08, 10]} />
            <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.37, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.02, 12]} />
            <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      )
  }
}

function ShelfContent({ y, seed, z = -0.04 }) {
  const items = useMemo(() => {
    const spines = textures.bookSpines()
    const rand = mulberry32(seed >>> 0)
    const arr = []
    const half = 0.75
    let x = -half
    let guard = 0
    while (x < half && guard < 48) {
      guard++
      const r = rand()
      if (r < 0.8) {
        const bw = 0.065 + rand() * 0.045
        if (x + bw > half) break
        const bh = 0.3 + rand() * 0.08
        const s = spines[(rand() * spines.length) | 0]
        arr.push({ t: "book", x: x + bw / 2, w: bw, h: bh, c: s.cloth, tex: s.tex })
        x += bw + 0.012
      } else if (r < 0.92) {
        const w = 0.24
        if (x + w > half) break
        arr.push({ t: "stack", x: x + w / 2, w })
        x += w + 0.05
      } else if (r < 0.98) {
        const w = 0.2
        if (x + w > half) break
        const ob = ["globe", "vase", "photo", "plant", "sculpture"][(rand() * 5) | 0]
        arr.push({ t: "obj", x: x + w / 2, ob })
        x += w + 0.06
      } else {
        x += 0.06
      }
    }
    return arr
  }, [seed])

  return (
    <group position={[0, 0, z]}>
      {items.map((it, i) => {
        if (it.t === "book")
          return <BookMesh key={i} x={it.x} y={y} w={it.w} h={it.h} c={it.c} tex={it.tex} />
        if (it.t === "stack")
          return <FlatStack key={i} x={it.x} y={y} w={it.w} rand={mulberry32((seed + i * 101) >>> 0)} />
        return <ShelfObject key={i} type={it.ob} x={it.x} y={y} rand={mulberry32((seed + i * 53) >>> 0)} />
      })}
    </group>
  )
}

function Bookcase({ position, rotationY = 0, variant = 0 }) {
  const W = 1.86
  const H = 2.8
  const D = 0.32
  const SHELVES = [0.35, 0.85, 1.35, 1.85, 2.35]
  const FRAME = "#7fa0c4"
  const FRAME_DARK = "#6890b5"
  const SHELF = "#eef3f9"
  const topGlobe = useMemo(() => {
    if (variant === 0 || variant === 4) return 3.5
    if (variant === 2) return 2.7
    return 0
  }, [variant])

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[-W / 2 + 0.05, H / 2, -0.01]} castShadow>
        <boxGeometry args={[0.09, H, D]} />
        <meshStandardMaterial color={FRAME} roughness={0.55} />
      </mesh>
      <mesh position={[W / 2 - 0.05, H / 2, -0.01]} castShadow>
        <boxGeometry args={[0.09, H, D]} />
        <meshStandardMaterial color={FRAME} roughness={0.55} />
      </mesh>

      <mesh position={[-W / 2 + 0.16, 0.03, -0.01]} castShadow>
        <boxGeometry args={[0.12, 0.06, 0.24]} />
        <meshStandardMaterial color={FRAME_DARK} roughness={0.55} />
      </mesh>
      <mesh position={[W / 2 - 0.16, 0.03, -0.01]} castShadow>
        <boxGeometry args={[0.12, 0.06, 0.24]} />
        <meshStandardMaterial color={FRAME_DARK} roughness={0.55} />
      </mesh>

      {SHELVES.map((sy, i) => (
        <group key={i}>
          <mesh position={[0, sy, -0.01]}>
            <boxGeometry args={[W - 0.2, 0.045, D]} />
            <meshStandardMaterial color={SHELF} roughness={0.5} />
          </mesh>
          <mesh position={[0, sy - 0.03, -0.14]}>
            <boxGeometry args={[W - 0.24, 0.09, 0.02]} />
            <meshStandardMaterial color={FRAME_DARK} roughness={0.55} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, H - 0.025, -0.01]}>
        <boxGeometry args={[W, 0.05, D]} />
        <meshStandardMaterial color={FRAME_DARK} roughness={0.55} />
      </mesh>

      {SHELVES.map((sy, i) => (
        <ShelfContent key={i} y={sy + 0.0225} seed={(variant + 1) * 10007 + i + 1} />
      ))}

      {topGlobe > 0 && (
        <group position={[0, H, -0.02]} scale={topGlobe}>
          <ShelfObject type="globe" x={0} y={0} z={0} rand={mulberry32((variant + 1) * 271)} />
        </group>
      )}
    </group>
  )
}

function DeskLamp({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.16, 0.18, 0.04, 20]} />
        <meshStandardMaterial color={BRASS} metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.025, 0.04, 0.78, 12]} />
        <meshStandardMaterial color={BRASS} metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.62, 0]} rotation={[0.35, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.2, 0.24, 16]} />
        <meshStandardMaterial color={CREAM} emissive="#ffd98a" emissiveIntensity={0.9} />
      </mesh>
      <pointLight position={[0, 0.5, 0]} intensity={2.5} distance={7} color="#ffd9a0" />
    </group>
  )
}

function PhotoFrame({ position, tilt = 0.05 }) {
  return (
    <group position={position} rotation={[0, 0, tilt]}>
      <mesh castShadow>
        <boxGeometry args={[0.3, 0.4, 0.03]} />
        <meshStandardMaterial color={BRASS} metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[0.24, 0.34]} />
        <meshStandardMaterial color="#7dd3fc" roughness={0.45} />
      </mesh>
    </group>
  )
}

function Console({ position, rotationY = 0, scale = 1 }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <mesh position={[0, 0.06, 0]} castShadow>
        <boxGeometry args={[4.4, 0.12, 0.5]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.48, 0]} castShadow>
        <boxGeometry args={[4.2, 0.75, 0.42]} />
        <meshStandardMaterial color={WOOD} roughness={0.6} />
      </mesh>
      <mesh position={[-1.05, 0.48, 0.23]}>
        <boxGeometry args={[1.92, 0.6, 0.03]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.6} />
      </mesh>
      <mesh position={[1.05, 0.48, 0.23]}>
        <boxGeometry args={[1.92, 0.6, 0.03]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.6} />
      </mesh>
      <mesh position={[-0.12, 0.48, 0.25]}>
        <boxGeometry args={[0.02, 0.1, 0.02]} />
        <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.12, 0.48, 0.25]}>
        <boxGeometry args={[0.02, 0.1, 0.02]} />
        <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.87, 0]} castShadow>
        <boxGeometry args={[4.4, 0.07, 0.55]} />
        <meshStandardMaterial color={WOOD} roughness={0.5} />
      </mesh>
      <DeskLamp position={[-1.55, 0.9, 0]} />
      <PhotoFrame position={[1.6, 1.12, 0]} />
    </group>
  )
}

function Armchair({ position, rotationY = 0 }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {[
        [-0.42, -0.4],
        [0.42, -0.4],
        [-0.42, 0.4],
        [0.42, 0.4],
      ].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.2, lz]} castShadow>
          <boxGeometry args={[0.08, 0.4, 0.08]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.55} />
        </mesh>
      ))}
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[0.95, 0.16, 0.9]} />
        <meshStandardMaterial color={FABRIC} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.54, 0.02]}>
        <boxGeometry args={[0.86, 0.08, 0.78]} />
        <meshStandardMaterial color={FABRIC_LIGHT} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.98, -0.42]} castShadow>
        <boxGeometry args={[0.95, 0.95, 0.16]} />
        <meshStandardMaterial color={FABRIC} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.02, -0.29]}>
        <boxGeometry args={[0.86, 0.75, 0.1]} />
        <meshStandardMaterial color={FABRIC_LIGHT} roughness={0.95} />
      </mesh>
      <mesh position={[-0.56, 0.78, 0]} castShadow>
        <boxGeometry args={[0.18, 0.5, 0.9]} />
        <meshStandardMaterial color={FABRIC} roughness={0.9} />
      </mesh>
      <mesh position={[0.56, 0.78, 0]} castShadow>
        <boxGeometry args={[0.18, 0.5, 0.9]} />
        <meshStandardMaterial color={FABRIC} roughness={0.9} />
      </mesh>
      <mesh position={[-0.56, 1.055, 0]}>
        <boxGeometry args={[0.18, 0.05, 0.9]} />
        <meshStandardMaterial color={FABRIC_LIGHT} roughness={0.95} />
      </mesh>
      <mesh position={[0.56, 1.055, 0]}>
        <boxGeometry args={[0.18, 0.05, 0.9]} />
        <meshStandardMaterial color={FABRIC_LIGHT} roughness={0.95} />
      </mesh>
    </group>
  )
}

function Ottoman({ position, rotationY = 0 }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {[
        [-0.2, -0.12],
        [0.2, -0.12],
        [-0.2, 0.12],
        [0.2, 0.12],
      ].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.16, lz]} castShadow>
          <boxGeometry args={[0.06, 0.32, 0.06]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.55} />
        </mesh>
      ))}
      <mesh position={[0, 0.34, 0]} castShadow>
        <boxGeometry args={[0.62, 0.24, 0.42]} />
        <meshStandardMaterial color={FABRIC} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.50, 0]}>
        <boxGeometry args={[0.54, 0.08, 0.36]} />
        <meshStandardMaterial color={FABRIC_LIGHT} roughness={0.95} />
      </mesh>
    </group>
  )
}

function FloorLamp({ position, rotationY = 0 }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.03, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.26, 0.05, 20]} />
        <meshStandardMaterial color={BRASS} metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.03, 1.85, 12]} />
        <meshStandardMaterial color={BRASS} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.72, 0]}>
        <cylinderGeometry args={[0.22, 0.3, 0.5, 16]} />
        <meshStandardMaterial color={CREAM} emissive="#ffd98a" emissiveIntensity={1.2} />
      </mesh>
      <pointLight position={[0, 1.45, 0]} intensity={2.2} distance={8} color="#ffd9a0" />
    </group>
  )
}

function RealBook({ coverKey, w, d, h = 0.035, x, y, z, rot = 0 }) {
  const pages = textures.bookPages()
  const cover = textures.bookCover(coverKey)
  return (
    <group position={[x, y, z]} rotation={[0, rot, 0]}>
      <mesh castShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial map={pages} roughness={0.9} />
      </mesh>
      <mesh position={[0, h / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w - 0.015, d - 0.015]} />
        <meshStandardMaterial map={cover} roughness={0.5} />
      </mesh>
    </group>
  )
}

function Mug({ position }) {
  return (
    <group position={position}>
      {/* saucer */}
      <mesh position={[0, 0.006, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.048, 0.012, 20]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
      </mesh>
      {/* cup body */}
      <mesh position={[0, 0.052, 0]} castShadow>
        <cylinderGeometry args={[0.036, 0.028, 0.085, 20]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.35} />
      </mesh>
      {/* handle */}
      <mesh position={[0.034, 0.052, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.024, 0.007, 8, 24]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.35} />
      </mesh>
      {/* coffee surface */}
      <mesh position={[0, 0.096, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.01, 20]} />
        <meshStandardMaterial color="#4a2f1b" roughness={0.25} />
      </mesh>
      {/* steam */}
      <mesh position={[0, 0.135, 0]}>
        <sphereGeometry args={[0.009, 6, 6]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.4} />
      </mesh>
      <mesh position={[-0.012, 0.155, 0.012]}>
        <sphereGeometry args={[0.006, 6, 6]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.28} />
      </mesh>
    </group>
  )
}

function IcedTea({ position }) {
  return (
    <group position={position}>
      {/* Coaster */}
      <mesh position={[0, 0.005, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.055, 0.01, 20]} />
        <meshStandardMaterial color="#8a5a2b" roughness={0.5} />
      </mesh>
      {/* Tall glass */}
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.032, 0.026, 0.14, 20]} />
        <meshStandardMaterial color="#e0f2fe" transparent opacity={0.35} roughness={0.1} />
      </mesh>
      {/* Tea liquid */}
      <mesh position={[0, 0.075, 0]}>
        <cylinderGeometry args={[0.029, 0.024, 0.12, 16]} />
        <meshStandardMaterial color="#d97706" transparent opacity={0.85} roughness={0.2} />
      </mesh>
      {/* Ice cubes */}
      <mesh position={[0.01, 0.11, 0.01]} rotation={[0.3, 0.5, 0]}>
        <boxGeometry args={[0.018, 0.018, 0.018]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.65} roughness={0.2} />
      </mesh>
      <mesh position={[-0.008, 0.1, -0.01]} rotation={[-0.2, 0.4, 0.2]}>
        <boxGeometry args={[0.015, 0.015, 0.015]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.65} roughness={0.2} />
      </mesh>
      {/* Straw */}
      <mesh position={[0.012, 0.1, 0.012]} rotation={[0.2, 0, -0.15]}>
        <cylinderGeometry args={[0.003, 0.003, 0.19, 8]} />
        <meshStandardMaterial color="#ef4444" roughness={0.4} />
      </mesh>
    </group>
  )
}

function SideTable({ position, rotationY = 0, drink = "coffee", book1 = "atomic", book2 = "teras" }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.03, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.34, 0.06, 20]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.33, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 0.55, 12]} />
        <meshStandardMaterial color={WOOD} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.58, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.42, 0.06, 24]} />
        <meshStandardMaterial color={WOOD} roughness={0.55} />
      </mesh>
      <RealBook coverKey={book1} w={0.25} d={0.18} h={0.032} x={0.14} y={0.626} z={0.08} rot={0.15} />
      <RealBook coverKey={book2} w={0.22} d={0.15} h={0.028} x={-0.14} y={0.624} z={-0.08} rot={-0.25} />
      {drink === "icedTea" ? <IcedTea position={[-0.22, 0.61, 0.14]} /> : <Mug position={[-0.22, 0.61, 0.14]} />}
    </group>
  )
}

function WallClock({ position, rotationY = 0, scale = 1 }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <mesh position={[0, 0, -0.03]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.06, 32]} />
        <meshStandardMaterial color={OFFWHITE} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, -0.015]}>
        <ringGeometry args={[0.45, 0.56, 48]} />
        <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
      </mesh>
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.sin(a) * 0.47, Math.cos(a) * 0.47, 0]}>
            <sphereGeometry args={[0.022, 8, 8]} />
            <meshStandardMaterial color={WOOD_DARK} roughness={0.5} />
          </mesh>
        )
      })}
      <mesh position={[0, 0.12, 0.005]} rotation={[0, 0, -0.9]}>
        <boxGeometry args={[0.035, 0.26, 0.02]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.5} />
      </mesh>
      <mesh position={[0.13, 0.03, 0.008]} rotation={[0, 0, -1.2]}>
        <boxGeometry args={[0.025, 0.3, 0.02]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.015]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

function FrameArt({ artMap, size, tilt = 0.03, frameColor = BRASS }) {
  const [fw, fh] = size
  return (
    <group rotation={[0, 0, tilt]}>
      <mesh position={[0, 0, -0.01]} castShadow>
        <boxGeometry args={[fw + 0.08, fh + 0.08, 0.04]} />
        <meshStandardMaterial color={frameColor} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[fw, fh]} />
        <meshStandardMaterial map={artMap} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.005]}>
        <planeGeometry args={[fw, fh]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.12} roughness={0.1} />
      </mesh>
    </group>
  )
}

function WallFrames({ position, rotationY = 0, variants = [] }) {
  const arts = useMemo(() => variants.map((_, i) => textures.frameArt(i)), [variants])
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {variants.map((v, i) => (
        <group key={i} position={v.pos}>
          <FrameArt artMap={arts[i]} size={v.size} tilt={v.tilt} frameColor={v.frameColor} />
        </group>
      ))}
    </group>
  )
}

function CurtainPanel({ x, w, h, z }) {
  const strips = 4
  return (
    <group position={[x, 0, z]}>
      {Array.from({ length: strips }).map((_, i) => {
        const sw = w / strips
        const sx = -w / 2 + sw * (i + 0.5)
        const tilt = i % 2 === 0 ? 0.06 : -0.06
        return (
          <mesh key={i} position={[sx, h / 2, 0]} rotation={[0, tilt, 0]} castShadow>
            <planeGeometry args={[sw, h]} />
            <meshStandardMaterial
              color={i % 2 ? FABRIC : FABRIC_DARK}
              roughness={0.9}
              side={THREE.DoubleSide}
            />
          </mesh>
        )
      })}
    </group>
  )
}

function WindowCurtains({ position, rotationY = 0, width = 3.0, height = 2.6 }) {
  const w = width
  const h = height
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, h + 0.06, 0]} castShadow>
        <boxGeometry args={[w + 0.3, 0.18, 0.14]} />
        <meshStandardMaterial color={OFFWHITE} roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.03, 0]} castShadow>
        <boxGeometry args={[w + 0.3, 0.18, 0.14]} />
        <meshStandardMaterial color={OFFWHITE} roughness={0.6} />
      </mesh>
      <mesh position={[-w / 2 - 0.06, h / 2, 0]} castShadow>
        <boxGeometry args={[0.18, h + 0.36, 0.14]} />
        <meshStandardMaterial color={OFFWHITE} roughness={0.6} />
      </mesh>
      <mesh position={[w / 2 + 0.06, h / 2, 0]} castShadow>
        <boxGeometry args={[0.18, h + 0.36, 0.14]} />
        <meshStandardMaterial color={OFFWHITE} roughness={0.6} />
      </mesh>
      <mesh position={[0, h / 2, 0.02]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color="#16283f" roughness={0.6} />
      </mesh>
      <mesh position={[0, h / 2, 0.03]}>
        <planeGeometry args={[w * 0.94, h * 0.94]} />
        <meshStandardMaterial color="#ffe9c9" emissive="#ffd98a" emissiveIntensity={1.1} />
      </mesh>
      <mesh position={[0, h / 2, 0.045]}>
        <boxGeometry args={[w * 0.94, 0.05, 0.02]} />
        <meshStandardMaterial color={OFFWHITE} roughness={0.5} />
      </mesh>
      <mesh position={[0, h / 2, 0.045]}>
        <boxGeometry args={[0.05, h * 0.94, 0.02]} />
        <meshStandardMaterial color={OFFWHITE} roughness={0.5} />
      </mesh>
      <CurtainPanel x={-w / 2 + 0.18} w={w * 0.42} h={h} z={0.06} />
      <CurtainPanel x={w / 2 - 0.18} w={w * 0.42} h={h} z={0.06} />
      <mesh position={[0, h + 0.02, 0.08]}>
        <boxGeometry args={[w * 0.9, 0.18, 0.1]} />
        <meshStandardMaterial color={FABRIC} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.02, 0.1]} castShadow>
        <boxGeometry args={[w + 0.5, 0.06, 0.25]} />
        <meshStandardMaterial color={OFFWHITE} roughness={0.6} />
      </mesh>
    </group>
  )
}

function Television({ position, rotationY = 0, scale = 1, width = 3.2, height = 1.85 }) {
  const w = width
  const h = height
  const t = 0.05
  const legH = 0.32
  const legW = 0.24
  const footD = 0.42
  const tvMap = useMemo(() => textures.tvScreen(), [])
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      {[-w / 2 + 0.55, w / 2 - 0.55].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <mesh position={[0, legH / 2, 0]} castShadow>
            <boxGeometry args={[legW * 0.45, legH, 0.16]} />
            <meshStandardMaterial color={WOOD_DARK} metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[0, legH - 0.035, 0]} castShadow>
            <boxGeometry args={[legW, 0.07, footD]} />
            <meshStandardMaterial color={WOOD_DARK} metalness={0.5} roughness={0.4} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, legH + h / 2, 0]} castShadow>
        <boxGeometry args={[w, h, t]} />
        <meshStandardMaterial color="#05070d" roughness={0.25} metalness={0.4} />
      </mesh>
      <mesh position={[0, legH + h / 2, t / 2 + 0.004]}>
        <planeGeometry args={[w - 0.12, h - 0.09]} />
        <meshStandardMaterial
          map={tvMap}
          emissive="#ffffff"
          emissiveIntensity={0.5}
          emissiveMap={tvMap}
          roughness={0.2}
          metalness={0.15}
        />
      </mesh>
    </group>
  )
}

function HangingPlant({ position, drop = 0.85 }) {
  return (
    <group position={position}>
      <mesh position={[0, -drop / 2, 0]}>
        <cylinderGeometry args={[0.014, 0.014, drop, 8]} />
        <meshStandardMaterial color="#9aa7b8" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, -drop - 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.17, 0.12, 0.22, 14]} />
        <meshStandardMaterial color={CYAN} roughness={0.5} />
      </mesh>
      {[
        [0, -drop - 0.16, 0],
        [0.1, -drop - 0.22, 0.05],
        [-0.09, -drop - 0.2, -0.04],
        [0.02, -drop - 0.26, 0.06],
      ].map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.13, 10, 10]} />
          <meshStandardMaterial color={i === 1 ? LEAF_DARK : LEAF} roughness={0.85} />
        </mesh>
      ))}
      {[
        [-0.12, 0.3],
        [0.1, 0.2],
        [-0.02, 0.5],
      ].map(([vx, vlen], i) => (
        <group
          key={i}
          position={[vx, 0, i === 2 ? 0.06 : -0.02]}
          rotation={[0.25 + i * 0.1, 0, i % 2 ? 0.2 : -0.25]}
        >
          <mesh position={[0, -vlen / 2, 0]}>
            <cylinderGeometry args={[0.012, 0.012, vlen, 6]} />
            <meshStandardMaterial color={LEAF_DARK} roughness={0.8} />
          </mesh>
          {[0.35, 0.65].map((t, j) => (
            <mesh key={j} position={[t > 0.5 ? 0.03 : -0.03, -vlen * t, 0]}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshStandardMaterial color={LEAF} roughness={0.85} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

function RectRug({ position, rotationY = 0, w = 5.4, d = 1.9, map }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial map={map} roughness={0.95} />
      </mesh>
    </group>
  )
}

function RoundRug({ position, radius = 1.3, map }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={position} receiveShadow>
      <circleGeometry args={[radius, 48]} />
      <meshStandardMaterial map={map} roughness={0.95} />
    </mesh>
  )
}

export {
  Console,
  Bookcase,
  Armchair,
  Ottoman,
  FloorLamp,
  SideTable,
  WallClock,
  WallFrames,
  WindowCurtains,
  Television,
  HangingPlant,
  RectRug,
  RoundRug,
}
