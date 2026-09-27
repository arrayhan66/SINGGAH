import { useDownscaledTexture } from "../../utils/useDownscaledTexture"
import bajupraktek from "../../../assets/images/bajupraktekelktro.jpg"
import { BRASS, WOOD, WOOD_DARK } from "./shared.jsx"
import MusicBox from "./musicbox.jsx"

function PhotoFrame({ position, tilt = 0.05, image }) {
  const tex = useDownscaledTexture(image, 256)
  const img = tex.image
  const aspect = img && img.width ? img.width / img.height : 0.7
  const maxW = 0.24
  const maxH = 0.34
  let fw = maxW
  let fh = maxW / aspect
  if (fh > maxH) {
    fh = maxH
    fw = maxH * aspect
  }
  return (
    <group position={position} rotation={[0, 0, tilt]}>
      <mesh castShadow>
        <boxGeometry args={[0.3, 0.4, 0.03]} />
        <meshStandardMaterial color={BRASS} metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[maxW, maxH]} />
        <meshStandardMaterial color="#ffffff" roughness={0.45} />
      </mesh>
      <mesh position={[0, 0, 0.021]}>
        <planeGeometry args={[fw, fh]} />
        <meshStandardMaterial map={tex} roughness={0.45} />
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
      {/* The lamp that used to sit here became the interactive music box that
          drives the hall soundtrack (click to toggle). Nudged forward of centre:
          clears the wall at the back while still leaving room at the front edge. */}
      <MusicBox position={[-1.55, 0.9, 0.05]} />
      <PhotoFrame position={[1.6, 1.12, 0]} image={bajupraktek} />
    </group>
  )
}
export { Console }
