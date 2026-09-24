import { useLayoutEffect, useMemo, useRef } from "react"
import { textures } from "../../utils/textures"
import { BOOK_COLORS, BOOK_BOX_GEO, BOOK_BOX_MAT, BOOK_SPINE_GEO, BOOK_SPINE_MAT_BY_TEX, BRASS, CYAN, LEAF, LEAF_DARK, BC_W, BOOKCASE_POST_TALL, BOOKCASE_POST_SHORT, BOOKCASE_FOOT, BOOKCASE_SHELF, BOOKCASE_SHELF_EDGE, BOOKCASE_TOP, BOOKCASE_FRAME_MAT, BOOKCASE_FRAME_DARK_MAT, BOOKCASE_SHELF_MAT, _iq, _im, _iv, _ip, _ic, mulberry32 } from "./shared.jsx"

// Rak low (lingkaran baca) diisi BUKU SAJA — tanpa tumpukan/ornamen (≈6-20
// mesh per rak). Rak-rak tinggi hall & ruang unggulan tetap penuh ornamen.
// Menghemat ribuan draw call dari ratusan bookcase ring tanpa mengubah wajah
// lingkaran baca (rak tetap penuh & rapi).

function BookShelfInstances({ books, y }) {
  const boxRef = useRef(null)
  const groups = useMemo(() => {
    const byTex = new Map()
    for (const b of books) {
      if (!byTex.has(b.tex)) byTex.set(b.tex, [])
      byTex.get(b.tex).push(b)
    }
    return [...byTex.entries()].map(([tex, bs]) => ({ tex, bs }))
  }, [books])
  const spineRefs = useRef([])

  useLayoutEffect(() => {
    if (boxRef.current) {
      const n = books.length
      for (let i = 0; i < n; i++) {
        const b = books[i]
        _im.compose(_ip.set(b.x, y + b.h / 2, 0), _iq, _iv.set(b.w, b.h, 0.2))
        boxRef.current.setMatrixAt(i, _im)
        boxRef.current.setColorAt(i, _ic.set(b.c))
      }
      boxRef.current.instanceMatrix.needsUpdate = true
      if (boxRef.current.instanceColor) boxRef.current.instanceColor.needsUpdate = true
    }
    groups.forEach((g, gi) => {
      const im = spineRefs.current[gi]
      if (!im) return
      im.count = g.bs.length
      g.bs.forEach((b, k) => {
        _im.compose(_ip.set(b.x, y + b.h / 2, 0.104), _iq, _iv.set(b.w, b.h, 1))
        im.setMatrixAt(k, _im)
      })
      im.instanceMatrix.needsUpdate = true
    })
  }, [books, groups, y])

  return (
    <group>
      <instancedMesh
        ref={boxRef}
        args={[BOOK_BOX_GEO, BOOK_BOX_MAT, books.length]}
        frustumCulled={false}
        castShadow
      />
      {groups.map((g, gi) => (
        <instancedMesh
          key={gi}
          ref={(el) => (spineRefs.current[gi] = el)}
          args={[BOOK_SPINE_GEO, BOOK_SPINE_MAT_BY_TEX.get(g.tex), g.bs.length]}
          frustumCulled={false}
        />
      ))}
    </group>
  )
}

function FlatStack({ x, y, z = -0.04, w = 0.24, rand }) {
  const pages = textures.bookPages()
  const n = 2 + ((rand() * 2) | 0)
  const books = []
  let yy = y
  for (let i = 0; i < n; i++) {
    const h = 0.07 + rand() * 0.03
    books.push({ y: yy, h, c: BOOK_COLORS[(rand() * BOOK_COLORS.length) | 0] })
    yy += h
  }
  return (
    <group position={[0, 0, z]}>
      {books.map((b, i) => (
        <group key={i} position={[x, b.y + b.h / 2, 0]}>
          <mesh castShadow>
            <boxGeometry args={[w, b.h, 0.2]} />
            <meshStandardMaterial color={b.c} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.101]}>
            <planeGeometry args={[w, b.h]} />
            <meshStandardMaterial map={pages} roughness={0.9} />
          </mesh>
          <mesh position={[0, b.h / 2 - 0.004, 0.102]}>
            <planeGeometry args={[w, 0.008]} />
            <meshStandardMaterial color={b.c} roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  )
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
        <group position={[x, y, z + 0.1]}>
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
            [0.04, 0.21, 0.01],
            [-0.03, 0.25, -0.02],
            [0.01, 0.19, 0.03],
          ].map((p, i) => (
            <group key={i} position={p} rotation={[0, 0, (i - 1) * 0.2]}>
              <mesh position={[0, 0.03, 0]}>
                <cylinderGeometry args={[0.005, 0.005, 0.06, 6]} />
                <meshStandardMaterial color={LEAF_DARK} roughness={0.8} />
              </mesh>
              <mesh position={[0, 0.06, 0]} castShadow>
                <sphereGeometry args={[0.045, 10, 10]} />
                <meshStandardMaterial color={LEAF} roughness={0.85} />
              </mesh>
              <mesh position={[0.022, 0.05, 0.01]} castShadow>
                <sphereGeometry args={[0.035, 10, 10]} />
                <meshStandardMaterial color={i % 2 ? LEAF_DARK : LEAF} roughness={0.85} />
              </mesh>
              <mesh position={[-0.02, 0.055, -0.012]} castShadow>
                <sphereGeometry args={[0.03, 10, 10]} />
                <meshStandardMaterial color={LEAF_DARK} roughness={0.85} />
              </mesh>
            </group>
          ))}
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

function ShelfContent({ y, seed, z = -0.04, simple = false }) {
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
      // Mode ringkas (rak low lingkaran baca): isi buku saja agar draw call
      // turun drastis; tumpukan & ornamen hanya di rak tinggi/full.
      if (simple) {
        const bw = 0.065 + rand() * 0.045
        if (x + bw > half) break
        const bh = 0.3 + rand() * 0.08
        const s = spines[(rand() * spines.length) | 0]
        arr.push({ t: "book", x: x + bw / 2, w: bw, h: bh, c: s.cloth, tex: s.tex })
        x += bw + 0.012
        continue
      }
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
        const ob = ["globe", "vase", "plant", "sculpture"][(rand() * 4) | 0]
        arr.push({ t: "obj", x: x + w / 2, ob })
        x += w + 0.06
      } else {
        x += 0.06
      }
    }
    return arr
  }, [seed, simple])

  const books = useMemo(() => items.filter((it) => it.t === "book"), [items])

  return (
    <group position={[0, 0, z]}>
      <BookShelfInstances books={books} y={y} />
      {items.map((it, i) => {
        if (it.t === "stack")
          return <FlatStack key={i} x={it.x} y={y} w={it.w} rand={mulberry32((seed + i * 101) >>> 0)} />
        if (it.t === "obj")
          return <ShelfObject key={i} type={it.ob} x={it.x} y={y} rand={mulberry32((seed + i * 53) >>> 0)} />
        return null
      })}
    </group>
  )
}

function Bookcase({ position, rotationY = 0, variant = 0, low = false }) {
  const W = BC_W
  const H = low ? 1.05 : 2.8
  const SHELVES = low ? [0.32, 0.68] : [0.35, 0.85, 1.35, 1.85, 2.35]
  const postGeo = low ? BOOKCASE_POST_SHORT : BOOKCASE_POST_TALL
  const topGlobe = useMemo(() => {
    if (low) return 0
    if (variant === 0 || variant === 4) return 3.5
    if (variant === 2) return 2.7
    return 0
  }, [variant, low])

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh geometry={postGeo} material={BOOKCASE_FRAME_MAT} position={[-W / 2 + 0.05, H / 2, -0.01]} castShadow />
      <mesh geometry={postGeo} material={BOOKCASE_FRAME_MAT} position={[W / 2 - 0.05, H / 2, -0.01]} castShadow />

      <mesh geometry={BOOKCASE_FOOT} material={BOOKCASE_FRAME_DARK_MAT} position={[-W / 2 + 0.16, 0.03, -0.01]} castShadow />
      <mesh geometry={BOOKCASE_FOOT} material={BOOKCASE_FRAME_DARK_MAT} position={[W / 2 - 0.16, 0.03, -0.01]} castShadow />

      {SHELVES.map((sy, i) => (
        <group key={i}>
          <mesh geometry={BOOKCASE_SHELF} material={BOOKCASE_SHELF_MAT} position={[0, sy, -0.01]} />
          <mesh geometry={BOOKCASE_SHELF_EDGE} material={BOOKCASE_FRAME_DARK_MAT} position={[0, sy - 0.03, -0.14]} />
        </group>
      ))}

      {/* Top horizontal cover, lifted clear of the vertical posts so it never
      overlaps them (sits right on top of the posts instead) */}
      <mesh geometry={BOOKCASE_TOP} material={BOOKCASE_FRAME_DARK_MAT} position={[0, H + 0.025, -0.01]} />

      {SHELVES.map((sy, i) => (
        <ShelfContent
          key={i}
          y={sy + 0.0225}
          seed={(variant + 1) * 10007 + i + 1}
          simple={low}
        />
      ))}

      {topGlobe > 0 && (
        <group position={[0, H, -0.02]} scale={topGlobe}>
          <ShelfObject type="globe" x={0} y={0} z={0} rand={mulberry32((variant + 1) * 271)} />
        </group>
      )}
    </group>
  )
}
export { Bookcase }
