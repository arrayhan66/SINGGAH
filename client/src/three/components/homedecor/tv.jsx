import { useEffect, useRef } from "react"
import { textures } from "../../utils/textures"
import { markTvReady, resetTvReady } from "../../hooks/useTvReady"
import { WOOD_DARK } from "./shared.jsx"

function Television({ position, rotationY = 0, scale = 1, width = 3.2, height = 1.85 }) {
  const w = width
  const h = height
  const t = 0.05
  const legH = 0.32
  const legW = 0.24
  const footD = 0.42
  const screenMatRef = useRef(null)

  useEffect(() => {
    const s = textures.tvScreenVideo({ onReady: markTvReady })
    let active = true

    const applyMap = (map, intensity) => {
      const mat = screenMatRef.current
      if (!mat) return
      mat.map = map
      mat.emissiveMap = map
      mat.emissiveIntensity = intensity
      mat.needsUpdate = true
    }

    // Show the static artwork immediately; swap to the video once it plays.
    applyMap(s.fallback, 0)
    const onPlaying = () => {
      if (!active) return
      applyMap(s.texture, 0.5)
    }
    s.video.addEventListener("playing", onPlaying)
    return () => {
      active = false
      s.video.removeEventListener("playing", onPlaying)
      s.dispose()
      applyMap(null, 0)
      resetTvReady()
    }
  }, [])
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
          ref={screenMatRef}
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0}
          roughness={0.2}
          metalness={0.15}
        />
      </mesh>
    </group>
  )
}
export { Television }
