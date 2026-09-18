import { Text, useTexture } from "@react-three/drei"
import { Suspense, useCallback, useMemo, useState } from "react"
import * as THREE from "three"
import { useDownscaledTexture } from "../utils/useDownscaledTexture"
import logo from "../../assets/icons/logo.webp"
import exitImg from "../../assets/images/exit.jpg"

const RIFT_H = 4.8
const FRAME_T = 0.3
const DEPTH = 0.5

// The frame rails sit at the bottom (0..FRAME_T) and top (RIFT_H..RIFT_H+FRAME_T),
// so the visible opening is y = FRAME_T .. RIFT_H. Center the logo + caption as
// one unit on that opening (caption hangs one step below the plate).
const OPENING_MID = (FRAME_T + RIFT_H) / 2
const LOGO_Y = OPENING_MID + 0.25
const TEXT_Y = OPENING_MID - 0.75

const NAVY = "#123a63"
const NAVY_EDGE = "#1a4a7f"
const TEXT = "#e8f3ff"
const GLOW = "#ffffff"
const GLOW_LIGHT = "#dbeafe"
const EXIT_RED = "#dc2626"
const EXIT_RED_DARK = "#7f1d1d"

function LogoPlate({ position, width }) {
  const tex = useDownscaledTexture(logo, 256)
  const t = useMemo(() => {
    const clone = tex.clone()
    clone.colorSpace = THREE.SRGBColorSpace
    clone.needsUpdate = true
    return clone
  }, [tex])
  const img = t.image
  const aspect = img && img.width && img.height ? img.width / img.height : 3.2
  return (
    <mesh position={position}>
      <planeGeometry args={[width, width / aspect]} />
      <meshBasicMaterial map={t} transparent toneMapped={false} />
    </mesh>
  )
}

function ExitIcon() {
  const tex = useTexture(exitImg)
  const t = useMemo(() => {
    const clone = tex.clone()
    clone.colorSpace = THREE.SRGBColorSpace
    clone.needsUpdate = true
    return clone
  }, [tex])
  const img = t.image
  const aspect = img && img.width && img.height ? img.width / img.height : 1
  return (
    <group position={[0, OPENING_MID, 0]}>
      <mesh position={[0, 0.38, 0.06]}>
        <planeGeometry args={[1.25, 1.25 / aspect]} />
        <meshBasicMaterial map={t} transparent toneMapped={false} />
      </mesh>
      <Text
        position={[0, -0.5, 0.08]}
        fontSize={0.28}
        color="#b91c1c"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.12}
        outlineWidth={0.01}
        outlineColor="#b91c1c"
        raycast={() => null}
        font="/fonts/Poppins-SemiBold.ttf"
      >
        KELUAR
      </Text>
    </group>
  )
}

function ExitSign({ width }) {
  return (
    <>
      <mesh position={[0, RIFT_H + FRAME_T + 0.29, 0.16]} castShadow material={EXIT_RED_MAT}>
        <boxGeometry args={[width + 0.4, 0.5, 0.06]} />
      </mesh>
      <mesh position={[0, RIFT_H + FRAME_T + 0.54, 0.16]} material={EXIT_RED_DARK_MAT}>
        <boxGeometry args={[width + 0.4, 0.05, 0.06]} />
      </mesh>
      <mesh position={[0, RIFT_H + FRAME_T + 0.29, 0.22]} material={EXIT_SIGN_DEEP_MAT}>
        <boxGeometry args={[width + 0.2, 0.34, 0.05]} />
      </mesh>
      <mesh position={[0, RIFT_H + FRAME_T + 0.12, 0.22]} material={GLOW_MAT_HI}>
        <boxGeometry args={[width + 0.2, 0.03, 0.04]} />
      </mesh>
      <Text
        position={[0, RIFT_H + FRAME_T + 0.31, 0.25]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={width + 0.1}
        raycast={() => null}
        font="/fonts/Poppins-SemiBold.ttf"
      >
        EXIT
      </Text>
    </>
  )
}

// Material instance BERSAMA (sebelumnya dibuat baru per portal → puluhan
// material unik). Semua portal berbagi set kecil ini sehingga shader/program
// dikompilasi sekali dan state penggantian material jauh lebih sedikit.
// Semua material bingkai diberi emissive kecil supaya portal tetap terlihat
// berjejer rapi (bukan tampak hitam) ketika lampu ruangan dipangkas di mode
// ringan HP/device lemah.
const NAVY_MAT = new THREE.MeshStandardMaterial({ color: NAVY, emissive: NAVY, emissiveIntensity: 0.45, roughness: 0.75, metalness: 0.15 })
const NAVY_EDGE_MAT = new THREE.MeshStandardMaterial({ color: NAVY_EDGE, emissive: NAVY_EDGE, emissiveIntensity: 0.5, roughness: 0.75, metalness: 0.15 })
const EXIT_RED_MAT = new THREE.MeshStandardMaterial({ color: EXIT_RED, emissive: EXIT_RED, emissiveIntensity: 0.45, roughness: 0.6, metalness: 0.15 })
const EXIT_RED_DARK_MAT = new THREE.MeshStandardMaterial({ color: EXIT_RED_DARK, emissive: EXIT_RED_DARK, emissiveIntensity: 0.45, roughness: 0.6, metalness: 0.15 })
const EXIT_SIGN_DEEP_MAT = new THREE.MeshStandardMaterial({ color: "#991b1b", emissive: "#991b1b", emissiveIntensity: 0.4, roughness: 0.6 })
const GLOW_MAT = new THREE.MeshStandardMaterial({ color: GLOW_LIGHT, emissive: GLOW, emissiveIntensity: 1.1 })
const GLOW_MAT_MED = new THREE.MeshStandardMaterial({ color: GLOW_LIGHT, emissive: GLOW, emissiveIntensity: 1.2 })
const GLOW_MAT_HI = new THREE.MeshStandardMaterial({ color: GLOW_LIGHT, emissive: GLOW, emissiveIntensity: 1.4 })
const EXIT_GLOW_MAT = new THREE.MeshStandardMaterial({ color: EXIT_RED, emissive: EXIT_RED, emissiveIntensity: 1.1 })
const RIFT_NAVY_MAT = new THREE.MeshStandardMaterial({
  color: "#1a4a7f",
  emissive: "#ffffff",
  emissiveIntensity: 0.9,
  roughness: 0.5,
  metalness: 0.1,
  side: THREE.DoubleSide,
})
const RIFT_EXIT_MAT = new THREE.MeshStandardMaterial({
  color: EXIT_RED_DARK,
  emissive: "#ffffff",
  emissiveIntensity: 0.9,
  roughness: 0.5,
  metalness: 0.1,
  side: THREE.DoubleSide,
})

// Poppins is wider than the previous default font, so long category names
// wrapped onto two lines on the nameplate. Measure the laid-out text and
// shrink the font until the title fits the plate on a single line — short
// names keep the full size, long ones shrink just enough.
function BoardTitle({ position, width, children }) {
  const [size, setSize] = useState(0.3)
  const handleSync = useCallback(
    (mesh) => {
      const b = mesh.textRenderInfo?.blockBounds
      if (!b) return
      const w = b[2] - b[0]
      if (w > width && size > 0.14) setSize(size * (width / w) * 0.97)
    },
    [width, size],
  )
  return (
    <Text
      position={position}
      fontSize={size}
      color={TEXT}
      anchorX="center"
      anchorY="middle"
      raycast={() => null}
      font="/fonts/Poppins-SemiBold.ttf"
      onSync={handleSync}
    >
      {children}
    </Text>
  )
}

function Portal({ position, rotationY, width, title, action }) {
  const hw = width / 2
  const frameW = width + FRAME_T * 2
  const frameMat = title ? NAVY_MAT : EXIT_RED_MAT

  return (
    <group
      position={position}
      rotation={[0, rotationY, 0]}
      userData={{ action: action ? action : undefined, noCollide: true }}
    >
      {/* ==== Bingkai seragam: kiri / kanan / atas / bawah (sama tebal) ==== */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (hw + FRAME_T / 2), RIFT_H / 2, 0]} castShadow material={frameMat}>
          <boxGeometry args={[FRAME_T, RIFT_H, DEPTH]} />
        </mesh>
      ))}
      <mesh position={[0, RIFT_H + FRAME_T / 2, 0]} castShadow material={frameMat}>
        <boxGeometry args={[frameW, FRAME_T, DEPTH]} />
      </mesh>
      <mesh position={[0, FRAME_T / 2, 0]} castShadow material={frameMat}>
        <boxGeometry args={[frameW, FRAME_T, DEPTH]} />
      </mesh>

      {/* ==== Tengah portal: logo SINGGAH (masuk) / icon EXIT merah (keluar) ==== */}
      {title ? (
        <>
          {/* Logo plate textures decode asynchronously — wrap them so the
              frame + rift always render and the logo pops in when ready
              (otherwise a slow mobile fetch would blank the whole scene). */}
          <Suspense fallback={null}>
            <LogoPlate position={[0, LOGO_Y, 0.02]} width={1.25} />
          </Suspense>
          <Text
            position={[0, TEXT_Y, 0.03]}
            fontSize={0.24}
            color={GLOW_LIGHT}
            outlineWidth={0.02}
            outlineColor="#0b1220"
            outlineOpacity={0.9}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.08}
            raycast={() => null}
            font="/fonts/Poppins-SemiBold.ttf"
          >
            SINGGAH DISINI
          </Text>
        </>
      ) : (
        <Suspense fallback={null}>
          <ExitIcon />
        </Suspense>
      )}

      {/* Trim tepi dalam (merah untuk exit) supaya simetris dan rapi */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (hw - 0.02), RIFT_H / 2, 0.08]}>
          <boxGeometry args={[0.05, RIFT_H - 0.1, 0.1]} />
          <primitive object={title ? NAVY_EDGE_MAT : EXIT_RED_DARK_MAT} attach="material" />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (hw - 0.02), RIFT_H / 2, 0.16]}>
          <boxGeometry args={[0.04, RIFT_H - 0.12, 0.05]} />
          <primitive object={title ? GLOW_MAT : EXIT_GLOW_MAT} attach="material" />
        </mesh>
      ))}
      <mesh position={[0, RIFT_H - 0.02, 0.08]}>
        <boxGeometry args={[width + 0.08, 0.05, 0.1]} />
        <primitive object={title ? NAVY_EDGE_MAT : EXIT_RED_DARK_MAT} attach="material" />
      </mesh>
      <mesh position={[0, RIFT_H - 0.02, 0.16]}>
        <boxGeometry args={[width + 0.04, 0.04, 0.05]} />
        <primitive object={title ? GLOW_MAT : EXIT_GLOW_MAT} attach="material" />
      </mesh>
      <mesh position={[0, FRAME_T + 0.03, 0.08]}>
        <boxGeometry args={[width + 0.08, 0.05, 0.1]} />
        <primitive object={title ? NAVY_EDGE_MAT : EXIT_RED_DARK_MAT} attach="material" />
      </mesh>
      <mesh position={[0, FRAME_T + 0.03, 0.16]}>
        <boxGeometry args={[width + 0.04, 0.04, 0.05]} />
        <primitive object={title ? GLOW_MAT : EXIT_GLOW_MAT} attach="material" />
      </mesh>

      {/* ==== Rift ==== */}
      <mesh position={[0, RIFT_H / 2, 0]} material={title ? RIFT_NAVY_MAT : RIFT_EXIT_MAT}>
        <planeGeometry args={[width, RIFT_H]} />
      </mesh>

      {/* ==== Papan nama di atas lintel: judul kategori (masuk) / EXIT (keluar) ==== */}
      {title ? (
        <>
          <mesh position={[0, RIFT_H + FRAME_T + 0.29, 0.16]} castShadow material={NAVY_MAT}>
            <boxGeometry args={[width + 0.4, 0.5, 0.06]} />
          </mesh>
          <mesh position={[0, RIFT_H + FRAME_T + 0.54, 0.16]} material={NAVY_EDGE_MAT}>
            <boxGeometry args={[width + 0.4, 0.05, 0.06]} />
          </mesh>
          <mesh position={[0, RIFT_H + FRAME_T + 0.29, 0.22]} material={NAVY_MAT}>
            <boxGeometry args={[width + 0.2, 0.34, 0.05]} />
          </mesh>
          <mesh position={[0, RIFT_H + FRAME_T + 0.12, 0.22]} material={GLOW_MAT_MED}>
            <boxGeometry args={[width + 0.2, 0.03, 0.04]} />
          </mesh>
          <BoardTitle position={[0, RIFT_H + FRAME_T + 0.31, 0.25]} width={width + 0.1}>
            {title}
          </BoardTitle>
        </>
      ) : (
        <ExitSign width={width} />
      )}
    </group>
  )
}

export default Portal
