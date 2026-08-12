import { useMemo } from "react"
import * as THREE from "three"
import { useLow } from "../hooks/useQuality"
import InstancedMeshes from "../utils/InstancedMeshes"

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

// Shared immutable geometry/material so the barrier is a handful of draw calls.
const geoCache = new Map()
const cachedGeo = (key, factory) => {
  if (!geoCache.has(key)) geoCache.set(key, factory())
  return geoCache.get(key)
}

const BASE_MAT = new THREE.MeshStandardMaterial({ color: "#16283f", roughness: 0.4, metalness: 0.6 })
const COLLAR_MAT = new THREE.MeshStandardMaterial({ color: "#4a7fb5", metalness: 0.7, roughness: 0.3 })
const POLE_MAT = new THREE.MeshStandardMaterial({ color: "#3b7dd8", metalness: 0.75, roughness: 0.3 })
const EYELET_MAT = new THREE.MeshStandardMaterial({ color: "#e8f4ff", emissive: "#cfe9ff", emissiveIntensity: 1.6 })
const FINIAL_MAT = new THREE.MeshStandardMaterial({
  color: "#ffffff",
  emissive: "#e8f4ff",
  emissiveIntensity: 1.3,
  metalness: 0.6,
  roughness: 0.2,
})

function wrapAngle(a) {
  while (a > Math.PI) a -= Math.PI * 2
  while (a < -Math.PI) a += Math.PI * 2
  return a
}

function Rope({ p0, p1, low = false }) {
  const geometry = useMemo(() => {
    const a = new THREE.Vector3(p0[0], p0[1], p0[2])
    const b = new THREE.Vector3(p1[0], p1[1], p1[2])
    const mid = a.clone().add(b).multiplyScalar(0.5)
    mid.y -= SAG
    const curve = new THREE.CatmullRomCurve3([a, mid, b], false)
    return new THREE.TubeGeometry(curve, low ? 10 : 16, ROPE_RADIUS, low ? 5 : 6, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p0[0], p0[1], p0[2], p1[0], p1[1], p1[2], low])

  return (
    <mesh geometry={geometry} castShadow>
      <meshStandardMaterial color="#2f6fcf" roughness={0.85} />
    </mesh>
  )
}

function MuseumBarrier() {
  const low = useLow()
  const posts = useMemo(
    () =>
      Array.from({ length: POST_COUNT }, (_, i) => {
        const a = i * SEG
        if (Math.abs(wrapAngle(a - OPEN_CENTER)) < OPEN_HALF) return null
        return { x: Math.cos(a) * RADIUS, z: Math.sin(a) * RADIUS, angle: a }
      }).filter(Boolean),
    [],
  )

  const partT = useMemo(() => {
    const base = []
    const collar = []
    const pole = []
    const eyelet = []
    const finial = []
    for (const p of posts) {
      base.push({ position: [p.x, 0.03, p.z] })
      collar.push({ position: [p.x, 0.065, p.z] })
      pole.push({ position: [p.x, POST_H / 2 + 0.065, p.z] })
      eyelet.push({ position: [p.x, ROPE_Y, p.z] })
      finial.push({ position: [p.x, POST_H + 0.075, p.z] })
    }
    return { base, collar, pole, eyelet, finial }
  }, [posts])

  const gBase = cachedGeo(`base-${low}`, () => new THREE.CylinderGeometry(0.12, 0.15, 0.06, low ? 14 : 20))
  const gCollar = cachedGeo(`collar-${low}`, () => new THREE.CylinderGeometry(0.075, 0.085, 0.05, low ? 14 : 20))
  const gPole = cachedGeo(`pole-${low}`, () => new THREE.CylinderGeometry(0.035, 0.045, POST_H, low ? 12 : 16))
  const gEyelet = cachedGeo(`eyelet-${low}`, () => new THREE.TorusGeometry(0.05, 0.012, 8, low ? 14 : 20))
  const gFinial = cachedGeo(`finial-${low}`, () => new THREE.SphereGeometry(0.075, low ? 10 : 16, low ? 10 : 16))

  return (
    <group>
      <InstancedMeshes geometry={gBase} material={BASE_MAT} transforms={partT.base} count={partT.base.length} castShadow />
      <InstancedMeshes geometry={gCollar} material={COLLAR_MAT} transforms={partT.collar} count={partT.collar.length} />
      <InstancedMeshes geometry={gPole} material={POLE_MAT} transforms={partT.pole} count={partT.pole.length} castShadow />
      <InstancedMeshes geometry={gEyelet} material={EYELET_MAT} transforms={partT.eyelet} count={partT.eyelet.length} />
      <InstancedMeshes geometry={gFinial} material={FINIAL_MAT} transforms={partT.finial} count={partT.finial.length} />
      {posts.map((p, i) => {
        const q = posts[(i + 1) % posts.length]
        const span = Math.abs(wrapAngle(p.angle - q.angle))
        if (span > SEG * 1.5) return null
        return <Rope key={i} p0={[p.x, ROPE_Y, p.z]} p1={[q.x, ROPE_Y, q.z]} low={low} />
      })}
    </group>
  )
}

export default MuseumBarrier
