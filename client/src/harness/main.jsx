import { createRoot } from "react-dom/client"
import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import FeaturedWork from "../three/components/FeaturedWork"
import { useQualityStore } from "../three/hooks/useQuality"

// Force the "tinggi" tier so the booth's warm spotlights render in the preview.
useQualityStore.setState({ tier: "tinggi" })

// Deterministic fake projects: no remote thumbnails, so Painting falls back to
// its built-in generated placeholder art (nothing external can hang the load).
const PROJECTS = [
  {
    id: 1,
    title: "Rekacipta Nusantara",
    author: ["Kelompok 4 TI"],
    Category: { slug: "it" },
  },
  {
    id: 2,
    title: "Sistem Cerdas Museum",
    author: ["Kelompok 7 TI"],
    Category: { slug: "it" },
  },
]

function Scene() {
  return (
    <>
      <color attach="background" args={["#0b1220"]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#dbeafe", "#1e293b", 0.5]} />
      <directionalLight position={[6, 10, 6]} intensity={1.1} />
      <Suspense fallback={null}>
        <FeaturedWork position={[0, 0, 0]} rotationY={0} projects={PROJECTS} />
      </Suspense>
    </>
  )
}

createRoot(document.getElementById("root")).render(
  <Canvas
    onCreated={(state) => {
      window.__harness = state
    }}
    camera={{ position: [6.4, 3.2, 7.6], fov: 50, near: 0.1, far: 120 }}
    dpr={2}
    gl={{ antialias: true, powerPreference: "high-performance" }}
  >
    <Scene />
  </Canvas>,
)