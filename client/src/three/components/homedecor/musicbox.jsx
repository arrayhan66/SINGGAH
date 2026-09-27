import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import useHallMusicStore from "../../hooks/useHallMusic"
import { BRASS, WOOD_DARK, CREAM } from "./shared.jsx"

// Interactive music box that lives on the console beside the TV and owns the
// hall soundtrack. Clicking it toggles the music (see the "music" action in
// LookControls); the drum spins, the grille glows and the LED pulses only
// while it is playing, so its state is readable from across the room.
//
// Sized in console-local units — Museum.jsx renders the console at scale 1.35.
const W = 0.52
const D = 0.36
const BODY_H = 0.3
const DRUM_R = 0.085
const DRUM_H = 0.15
const GLOW = "#7dd3fc"
const LED = "#a7f3d0"
const OFF = "#22304a"

const GLOW_COLOR = new THREE.Color(GLOW)
const LED_COLOR = new THREE.Color(LED)
const OFF_COLOR = new THREE.Color(OFF)

function MusicBox({ position, rotationY = 0, scale = 1 }) {
  const playing = useHallMusicStore((s) => s.playing)
  const glowRef = useRef(null)
  const drumRef = useRef(null)
  const ledRef = useRef(null)
  const lightRef = useRef(null)
  // `level` is the eased 0→1 playback level. Everything visual is driven from
  // it so the box fades in/out with the audio instead of snapping.
  const level = useRef(playing ? 1 : 0)
  const phase = useRef(0)

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const target = playing ? 1 : 0
    // Snap up, ease down: the box should light the instant the visitor clicks
    // it, but settle gently when it goes dark.
    const speed = target > level.current ? 18 : 5
    level.current = THREE.MathUtils.damp(level.current, target, speed, dt)
    const lv = level.current
    phase.current += dt * (2.4 + lv * 5.5)

    const glow = glowRef.current
    if (glow) {
      const pulse = 0.72 + 0.28 * Math.sin(phase.current * 2.2)
      glow.color.copy(OFF_COLOR).lerp(GLOW_COLOR, lv)
      glow.emissiveIntensity = 0.15 + lv * 1.5 * pulse
    }
    const led = ledRef.current
    if (led) {
      led.color.copy(OFF_COLOR).lerp(LED_COLOR, lv)
      led.emissiveIntensity = 0.1 + lv * 3.4 * (0.55 + 0.45 * Math.sin(phase.current * 3.4))
    }
    if (drumRef.current) {
      drumRef.current.rotation.y += dt * (0.6 + lv * 7)
    }
    if (lightRef.current) {
      lightRef.current.intensity = lv * (1.6 + 0.5 * Math.sin(phase.current * 2.2))
    }
  })

  return (
    <group
      position={position}
      rotation={[0, rotationY, 0]}
      scale={scale}
      userData={{ action: { type: "music" } }}
    >
      {/* Cabinet */}
      <mesh position={[0, BODY_H / 2, 0]} castShadow>
        <boxGeometry args={[W, BODY_H, D]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.6} />
      </mesh>
      {/* Brass lid plate the drum sits on */}
      <mesh position={[0, BODY_H + 0.022, 0]} castShadow>
        <boxGeometry args={[W + 0.03, 0.045, D + 0.03]} />
        <meshStandardMaterial color={BRASS} metalness={0.65} roughness={0.32} />
      </mesh>
      {/* Feet */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
        <mesh key={i} position={[sx * (W / 2 - 0.06), 0.015, sz * (D / 2 - 0.06)]}>
          <cylinderGeometry args={[0.028, 0.032, 0.03, 12]} />
          <meshStandardMaterial color={BRASS} metalness={0.65} roughness={0.35} />
        </mesh>
      ))}

      {/* Pinned drum — the part that visibly turns while the music plays */}
      <group ref={drumRef} position={[0, BODY_H + 0.045 + DRUM_H / 2, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[DRUM_R, DRUM_R, DRUM_H, 20]} />
          <meshStandardMaterial color={BRASS} metalness={0.8} roughness={0.25} />
        </mesh>
        {/* Pin rows, offset around the drum so the turn is legible */}
        {[0, 1, 2].map((row) => {
          const a = (row / 3) * Math.PI * 2
          return (
            <group key={row} rotation={[0, a, 0]}>
              {[0, 1, 2].map((col) => {
                const b = (col / 3) * Math.PI * 2
                return (
                  <mesh
                    key={col}
                    position={[
                      Math.sin(b) * (DRUM_R + 0.004),
                      DRUM_H / 2 - 0.03 - col * 0.02,
                      Math.cos(b) * (DRUM_R + 0.004),
                    ]}
                    rotation={[0, b, 0]}
                  >
                    <boxGeometry args={[0.012, 0.016, 0.012]} />
                    <meshStandardMaterial color={CREAM} metalness={0.9} roughness={0.2} />
                  </mesh>
                )
              })}
            </group>
          )
        })}
      </group>
      {/* Two combs the drum plays against */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (DRUM_R + 0.035), BODY_H + 0.045 + 0.02, 0]}>
          <boxGeometry args={[0.05, 0.02, 0.16]} />
          <meshStandardMaterial color="#9aa7b8" metalness={0.85} roughness={0.28} />
        </mesh>
      ))}

      {/* Front grille: emissive backing panel + brass bars */}
      <mesh position={[0, 0.15, D / 2 + 0.002]}>
        <planeGeometry args={[W - 0.1, 0.16]} />
        <meshStandardMaterial
          ref={glowRef}
          color={OFF}
          emissive={GLOW}
          emissiveIntensity={0.15}
          roughness={0.5}
        />
      </mesh>
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={i} position={[(i / 8 - 0.5) * (W - 0.14), 0.15, D / 2 + 0.008]}>
          <boxGeometry args={[0.014, 0.17, 0.012]} />
          <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* Power LED: the clearest on/off tell on the front face */}
      <mesh position={[W / 2 - 0.05, 0.25, D / 2 + 0.006]}>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshStandardMaterial ref={ledRef} color={OFF} emissive={LED} emissiveIntensity={0.1} />
      </mesh>

      {/* A real light so the box visibly spills onto the console and wall when
          it is playing — the box itself carries no glow geometry on top. */}
      <pointLight
        ref={lightRef}
        position={[0, BODY_H + 0.16, 0.12]}
        color={GLOW}
        intensity={0}
        distance={3.2}
        decay={2}
      />
    </group>
  )
}

export { MusicBox }
export default MusicBox
