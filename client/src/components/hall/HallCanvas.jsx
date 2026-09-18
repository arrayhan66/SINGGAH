import { Suspense, useState, useCallback, useRef } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { PerformanceMonitor, usePerformanceMonitor } from "@react-three/drei"
import VirtualExhibition from "../../three/scenes/VirtualExhibition"
import CanvasErrorBoundary from "./CanvasErrorBoundary"
import { DPR_FOR, useLiteMode, isMobile } from "../../three/hooks/useQuality"
import { attachWebGLContextGuard } from "../../three/utils/webglGuard"

// Turunkan pixel-ratio render secara adaptif saat FPS ambles (HP panas).
// Faktor dari PerformanceMonitor memangkas beban fill-rate tanpa menyentuh
// asset 3D. Floor dipatok tinggi (0.92) agar hasil tetap tajam/HD — turun
// hanya sedikit kalau device benar-benar kepayahan, tidak sampai buram.
function AutoDpr() {
  const gl = useThree((s) => s.gl)
  const setDpr = useThree((s) => s.setDpr)
  const base = useRef(0)
  usePerformanceMonitor({
    onChange: ({ factor }) => {
      if (!base.current) base.current = gl.getPixelRatio()
      const factorAt = Math.max(0.92, factor)
      if (Math.abs(gl.getPixelRatio() - base.current * factorAt) > 0.05) {
        setDpr(base.current * factorAt)
      }
    },
    onIncline: () => base.current && setDpr(base.current),
    onFallback: () => base.current && setDpr(Math.max(1.25, base.current * 0.9)),
  })
  return null
}

export default function HallCanvas({
  tier,
  hallData,
  onArea,
  onSelectProject,
  onReady,
  interactive = true,
}) {
  const [epoch, setEpoch] = useState(0)
  const remount = useCallback(() => setEpoch((n) => n + 1), [])
  const isLite = useLiteMode()
  const onMobile = isMobile()

  // HP TIDAK pernah render shadow: pass shadow map = dua kali render seluruh
  // scene per light, biang utama HP panas. Di HP flagship tier terdeteksi
  // "tinggi" sehingga tanpa gate ini shadow ikut aktif dan tersangka utama.
  const shadows = tier === "tinggi" && !onMobile

  // Render hanya saat interaktif (tidak ada modal detail proyek / transisi).
  // Menjeda loop render menghemat GPU sepenuhnya — sangat terasa di HP.
  const frameloop = interactive ? "always" : "never"

  return (
    <CanvasErrorBoundary>
      <Canvas
        key={epoch}
        onCreated={({ gl }) => attachWebGLContextGuard(gl, remount)}
        shadows={shadows}
        dpr={DPR_FOR[tier]}
        gl={{
          powerPreference: isLite ? "default" : "high-performance",
          antialias: tier === "tinggi",
        }}
        frameloop={frameloop}
        camera={{ position: [0, 1.7, 0], fov: 70, near: 0.1, far: 220 }}
        className="!absolute !inset-0 hall-canvas"
      >
        <color attach="background" args={["#0b1220"]} />
        <Suspense fallback={null}>
          <PerformanceMonitor flipflops={5} iterations={8} ms={360} threshold={0.6} step={0.12}>
            <AutoDpr />
            <VirtualExhibition
              hallData={hallData}
              onArea={onArea}
              onSelectProject={onSelectProject}
              onReady={onReady}
            />
          </PerformanceMonitor>
        </Suspense>
      </Canvas>
    </CanvasErrorBoundary>
  )
}
