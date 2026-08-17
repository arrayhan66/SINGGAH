import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import VirtualExhibition from "../../three/scenes/VirtualExhibition"
import CanvasErrorBoundary from "./CanvasErrorBoundary"
import { DPR_FOR, isMobile } from "../../three/hooks/useQuality"

export default function HallCanvas({ tier, hallData, onArea, onSelectProject, onReady }) {
  return (
    <CanvasErrorBoundary>
      <Canvas
        shadows={tier === "tinggi"}
        dpr={DPR_FOR[tier]}
        gl={{ powerPreference: "high-performance", antialias: tier !== "rendah" && !isMobile() }}
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
