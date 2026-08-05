import { useMemo } from "react"
import * as THREE from "three"

const POST_COUNT = 24
const RADIUS = 6.05
const POST_H = 1.05
const ROPE_Y = POST_H * 0.58
const SAG = 0.09
const ROPE_RADIUS = 0.018

// Narrow entrance centered at +z (the respawn spot), one post removed
const SEG = (Math.PI * 2) / POST_COUNT
const OPEN_CENTER = Math.PI / 2
const OPEN_HALF = SEG * 0.55

function wrapAngle(a) {
  while (a > Math.PI) a -= Math.PI * 2
  while (a < -Math.PI) a += Math.PI * 2
  return a
}

function Post({ position }) {
  return (
    <group position={position}>
      {/* Weighted base */}
      <mesh position={[0, 0.03, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 0.06, 20]} />
        <meshStandardMaterial color="#16283f" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.065, 0]}>
        <cylinderGeometry args={[0.075, 0.085, 0.05, 20]} />
        <meshStandardMaterial color="#4a7fb5" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Steel-blue pole */}
      <mesh position={[0, POST_H / 2 + 0.065, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.045, POST_H, 16]} />
        <meshStandardMaterial color="#3b7dd8" metalness={0.75} roughness={0.3} />
      </mesh>
      {/* Rope eyelet (soft white glow) */}
      <mesh position={[0, ROPE_Y, 0]}>
        <torusGeometry args={[0.05, 0.012, 8, 20]} />
        <meshStandardMaterial color="#e8f4ff" emissive="#cfe9ff" emissiveIntensity={1.6} />
      </mesh>
      {/* Glowing finial cap */}
      <mesh position={[0, POST_H + 0.075, 0]}>
        <sphereGeometry args={[0.075, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#e8f4ff" emissiveIntensity={1.3} metalness={0.6} roughness={0.2} />
      </mesh>
    </group>
  )
}

function Rope({ p0, p1 }) {
  const geometry = useMemo(() => {
    const a = new THREE.Vector3(p0[0], p0[1], p0[2])
    const b = new THREE.Vector3(p1[0], p1[1], p1[2])
    const mid = a.clone().add(b).multiplyScalar(0.5)
    mid.y -= SAG
    const curve = new THREE.CatmullRomCurve3([a, mid, b], false)
    return new THREE.TubeGeometry(curve, 16, ROPE_RADIUS, 6, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p0[0], p0[1], p0[2], p1[0], p1[1], p1[2]])

  return (
    <mesh geometry={geometry} castShadow>
      <meshStandardMaterial color="#2f6fcf" roughness={0.85} />
    </mesh>
  )
}

function MuseumBarrier() {
  const posts = useMemo(
    () =>
      Array.from({ length: POST_COUNT }, (_, i) => {
        const a = i * SEG
        if (Math.abs(wrapAngle(a - OPEN_CENTER)) < OPEN_HALF) return null
        return { x: Math.cos(a) * RADIUS, z: Math.sin(a) * RADIUS, angle: a }
      }).filter(Boolean),
    [],
  )

  return (
    <group>
      {posts.map((p, i) => (
        <Post key={i} position={[p.x, 0, p.z]} />
      ))}
      {posts.map((p, i) => {
        const q = posts[(i + 1) % posts.length]
        const span = Math.abs(wrapAngle(p.angle - q.angle))
        if (span > SEG * 1.5) return null
        return <Rope key={i} p0={[p.x, ROPE_Y, p.z]} p1={[q.x, ROPE_Y, q.z]} />
      })}
    </group>
  )
}

export default MuseumBarrier
