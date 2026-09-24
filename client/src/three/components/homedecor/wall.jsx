import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { textures } from "../../utils/textures"
import { OFFWHITE, BRASS, WOOD_DARK, FABRIC, FABRIC_DARK } from "./shared.jsx"

function createClockFaceTexture() {  const size = 512
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  const cx = size / 2
  const cy = size / 2

  const grad = ctx.createRadialGradient(cx, cy, 40, cx, cy, 235)
  grad.addColorStop(0, "#fffdf6")
  grad.addColorStop(0.7, "#f6efdd")
  grad.addColorStop(1, "#e8dcbf")
  ctx.beginPath()
  ctx.arc(cx, cy, 235, 0, Math.PI * 2)
  ctx.fillStyle = grad
  ctx.fill()

  ctx.lineCap = "round"
  ctx.beginPath()
  ctx.arc(cx, cy, 233, 0, Math.PI * 2)
  ctx.lineWidth = 10
  ctx.strokeStyle = "#c9a35e"
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(cx, cy, 218, 0, Math.PI * 2)
  ctx.lineWidth = 3
  ctx.strokeStyle = "rgba(31,47,78,0.35)"
  ctx.stroke()

  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2
    const major = i % 5 === 0
    ctx.beginPath()
    ctx.moveTo(cx + Math.sin(a) * (major ? 184 : 196), cy - Math.cos(a) * (major ? 184 : 196))
    ctx.lineTo(cx + Math.sin(a) * (major ? 204 : 205), cy - Math.cos(a) * (major ? 204 : 205))
    ctx.strokeStyle = major ? "#1f2f4e" : "rgba(31,47,78,0.45)"
    ctx.lineWidth = major ? 5 : 2
    ctx.stroke()
  }

  ctx.fillStyle = "#1f2f4e"
  ctx.font = "700 54px Georgia, 'Times New Roman', serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  for (let i = 1; i <= 12; i++) {
    const a = (i / 12) * Math.PI * 2
    const r = 158
    ctx.fillText(String(i), cx + Math.sin(a) * r, cy - Math.cos(a) * r)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 16
  return texture
}

function WallClock({ position, rotationY = 0, scale = 1 }) {
  const hourRef = useRef()
  const minuteRef = useRef()
  const secondRef = useRef()
  const faceTex = useMemo(() => createClockFaceTexture(), [])

  useFrame(() => {
    const now = new Date()
    const s = now.getSeconds() + now.getMilliseconds() / 1000
    const m = now.getMinutes() + s / 60
    const h = (now.getHours() % 12) + m / 60
    if (secondRef.current) secondRef.current.rotation.z = -(s / 60) * Math.PI * 2
    if (minuteRef.current) minuteRef.current.rotation.z = -(m / 60) * Math.PI * 2
    if (hourRef.current) hourRef.current.rotation.z = -(h / 12) * Math.PI * 2
  })

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <mesh position={[0, 0, -0.03]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.06, 32]} />
        <meshStandardMaterial color={OFFWHITE} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, -0.02]}>
        <ringGeometry args={[0.42, 0.56, 48]} />
        <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.012]} castShadow>
        <circleGeometry args={[0.415, 48]} />
        <meshStandardMaterial map={faceTex} roughness={0.55} />
      </mesh>

      <group ref={hourRef}>
        <mesh position={[0, 0.115, 0.022]}>
          <boxGeometry args={[0.045, 0.27, 0.02]} />
          <meshStandardMaterial color={WOOD_DARK} metalness={0.4} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.115, 0.02]}>
          <cylinderGeometry args={[0.0225, 0.0225, 0.27, 8]} />
          <meshStandardMaterial color={WOOD_DARK} metalness={0.4} roughness={0.4} />
        </mesh>
      </group>
      <group ref={minuteRef}>
        <mesh position={[0, 0.155, 0.025]}>
          <boxGeometry args={[0.032, 0.35, 0.015]} />
          <meshStandardMaterial color={WOOD_DARK} metalness={0.4} roughness={0.4} />
        </mesh>
      </group>
      <group ref={secondRef}>
        <mesh position={[0, 0.19, 0.03]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.014, 0.42, 0.01]} />
          <meshStandardMaterial color={BRASS} metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
      <mesh position={[0, 0, 0.035]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial color={BRASS} metalness={0.8} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <sphereGeometry args={[0.016, 10, 10]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.4} />
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
export { WallClock, WallFrames, WindowCurtains }
