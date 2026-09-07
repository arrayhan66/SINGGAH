import { Suspense, useState, useCallback } from "react"
import { Canvas } from "@react-three/fiber"
import VirtualExhibition from "../../three/scenes/VirtualExhibition"
import CanvasErrorBoundary from "./CanvasErrorBoundary"
import { DPR_FOR } from "../../three/hooks/useQuality"
import { attachWebGLContextGuard } from "../../three/utils/webglGuard"

export default function HallCanvas({ tier, hallData, onArea, onSelectProject, onReady }) {
  const [epoch, setEpoch] = useState(0)
  const remount = useCallback(() => setEpoch((n) => n + 1), [])

  return (
    <CanvasErrorBoundary>
      <Canvas
        key={epoch}
        onCreated={({ gl }) => attachWebGLContextGuard(gl, remount)}
        shadows={tier === "tinggi"}
        dpr={DPR_FOR[tier]}
        gl={{ powerPreference: "high-performance", antialias: tier !== "rendah" }}
        camera={{ position: [0, 1.7, 0], fov: 70, near: 0.1, far: 220 }}
        className="!absolute !inset-0 hall-canvas"
      >
        <color attach="background" args={["#0b1220"]} />
        <Suspense fallback={null}>
          <VirtualExhibition
            hallData={hallData}
            onArea={onArea}
            onSelectProject={onSelectProject}
            onReady={onReady}
          />
        </Suspense>
      </Canvas>
    </CanvasErrorBoundary>
  )
}
