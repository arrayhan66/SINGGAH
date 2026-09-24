import { Component, Suspense, useMemo } from "react"
import * as THREE from "three"
import { useDownscaledTexture } from "../../utils/useDownscaledTexture"
import { BRASS } from "./shared.jsx"

const PORTRAIT_W = 1.3
const PORTRAIT_H = 1.7

function PortraitFallback() {
  const map = useMemo(() => {
    const c = document.createElement("canvas")
    c.width = 512
    c.height = Math.round((512 * PORTRAIT_H) / PORTRAIT_W)
    const ctx = c.getContext("2d")
    ctx.fillStyle = "#0f2239"
    ctx.fillRect(0, 0, c.width, c.height)
    ctx.fillStyle = "#1e3a5f"
    ctx.beginPath()
    ctx.arc(c.width / 2, c.height * 0.34, c.width * 0.16, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(c.width / 2, c.height * 0.72, c.width * 0.28, c.height * 0.14, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = "rgba(186,230,253,0.6)"
    ctx.font = `bold ${Math.round(c.width * 0.055)}px Georgia, serif`
    ctx.textAlign = "center"
    ctx.fillText("FOTO RESMI", c.width / 2, c.height * 0.94)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 16
    return t
  }, [])
  return (
    <mesh position={[0, 0, 0.055]}>
      <planeGeometry args={[PORTRAIT_W - 0.12, PORTRAIT_H - 0.12]} />
      <meshStandardMaterial map={map} roughness={0.9} />
    </mesh>
  )
}

class PortraitImageBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed) return <PortraitFallback />
    return this.props.children
  }
}

function PortraitPhoto({ image }) {
  const tex = useDownscaledTexture(image, 512)
  const img = useMemo(() => {
    const t = tex.clone()
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 16
    return t
  }, [tex])
  return (
    <mesh position={[0, 0, 0.055]}>
      <planeGeometry args={[PORTRAIT_W - 0.12, PORTRAIT_H - 0.12]} />
      <meshStandardMaterial map={img} color="#eaf3fc" roughness={0.85} />
    </mesh>
  )
}

function PresidentPortrait({ position, rotationY = 0, image }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Brass frame */}
      <mesh position={[0, 0, -0.02]} castShadow>
        <boxGeometry args={[PORTRAIT_W + 0.16, PORTRAIT_H + 0.16, 0.04]} />
        <meshStandardMaterial color={BRASS} metalness={0.6} roughness={0.35} />
      </mesh>
      {/* White mat */}
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[PORTRAIT_W + 0.02, PORTRAIT_H + 0.02]} />
        <meshStandardMaterial color="#eef3f9" roughness={0.85} />
      </mesh>
      {/* Photo */}
      <Suspense fallback={<PortraitFallback />}>
        <PortraitImageBoundary>
          <PortraitPhoto image={image} />
        </PortraitImageBoundary>
      </Suspense>
      {/* Glass gloss */}
      <mesh position={[0, 0, 0.08]}>
        <planeGeometry args={[PORTRAIT_W - 0.12, PORTRAIT_H - 0.12]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.08} roughness={0.1} />
      </mesh>
    </group>
  )
}
export { PresidentPortrait }
