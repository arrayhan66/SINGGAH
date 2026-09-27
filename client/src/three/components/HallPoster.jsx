import { useMemo } from "react"
import * as THREE from "three"
import { textures } from "../utils/textures"
import { BRASS } from "./homedecor/shared.jsx"

const FRAME_W = 16
const FRAME_H = 2.8
const FRAME_D = 0.14
const POSTER_W = 15.2
const POSTER_H = POSTER_W / (1600 / 240)
const MAT = 0.06

const INNER_X = POSTER_W / 2 + MAT
const INNER_Y = POSTER_H / 2 + MAT
const SIDE_BAR = FRAME_W / 2 - INNER_X
const CAP_BAR = FRAME_H / 2 - INNER_Y

function HallPoster({ position = [0, 0, 0], map }) {
  const trimMap = useMemo(() => {
    const t = textures.posterFrame()
    t.wrapS = THREE.RepeatWrapping
    t.wrapT = THREE.ClampToEdgeWrapping
    t.repeat.set(1, 1)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    return t
  }, [])

  const trim = <meshStandardMaterial map={trimMap} metalness={0.7} roughness={0.32} />
  const barZ = FRAME_D * 0.4

  return (
    <group position={position}>
      <mesh position={[0, 0, -FRAME_D / 2]} castShadow receiveShadow>
        <boxGeometry args={[FRAME_W, FRAME_H, FRAME_D]} />
        <meshStandardMaterial color="#131c2b" roughness={0.7} metalness={0.1} />
      </mesh>

      <mesh position={[0, 0, 0.006]}>
        <planeGeometry args={[POSTER_W + MAT * 2, POSTER_H + MAT * 2]} />
        <meshStandardMaterial color="#0b1220" roughness={0.85} />
      </mesh>

      <mesh position={[0, INNER_Y + CAP_BAR / 2, barZ]}>
        <boxGeometry args={[FRAME_W, CAP_BAR, FRAME_D * 0.8]} />
        {trim}
      </mesh>
      <mesh position={[0, -(INNER_Y + CAP_BAR / 2), barZ]}>
        <boxGeometry args={[FRAME_W, CAP_BAR, FRAME_D * 0.8]} />
        {trim}
      </mesh>
      <mesh position={[-(INNER_X + SIDE_BAR / 2), 0, barZ]}>
        <boxGeometry args={[SIDE_BAR, POSTER_H + MAT * 2, FRAME_D * 0.8]} />
        {trim}
      </mesh>
      <mesh position={[INNER_X + SIDE_BAR / 2, 0, barZ]}>
        <boxGeometry args={[SIDE_BAR, POSTER_H + MAT * 2, FRAME_D * 0.8]} />
        {trim}
      </mesh>

      {[
        [0, INNER_Y + CAP_BAR / 2],
        [0, -(INNER_Y + CAP_BAR / 2)],
        [-(INNER_X + SIDE_BAR / 2), 0],
        [INNER_X + SIDE_BAR / 2, 0],
      ].map(([x, y], i) => (
        <mesh
          key={i}
          position={[x, y, FRAME_D * 0.4 + 0.04]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.07, 0.07, 0.05, 16]} />
          <meshStandardMaterial color={BRASS} metalness={0.8} roughness={0.25} />
        </mesh>
      ))}

      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[POSTER_W, POSTER_H]} />
        <meshStandardMaterial map={map} roughness={0.6} />
      </mesh>

      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[POSTER_W, POSTER_H]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.06} roughness={0.1} />
      </mesh>
    </group>
  )
}

export { HallPoster, FRAME_W, FRAME_H, POSTER_W, POSTER_H }
export default HallPoster
