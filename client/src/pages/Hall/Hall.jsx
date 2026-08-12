import { Suspense, useEffect, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { ArrowLeft, MousePointerClick, DoorOpen, Frame, Eye, MapPin } from "lucide-react"
import { useNavigate } from "react-router-dom"
import VirtualExhibition from "../../three/scenes/VirtualExhibition"
import ProjectDetailModal from "../../components/hall/ProjectDetailModal"
import LoadingOverlay from "../../components/hall/LoadingOverlay"
import PortalTransitionOverlay from "../../components/hall/PortalTransitionOverlay"
import CanvasErrorBoundary from "../../components/hall/CanvasErrorBoundary"
import { useQualityStore, DPR_FOR } from "../../three/hooks/useQuality"
import { useWalkStore } from "../../three/hooks/useWalk"

function Hall() {
  const navigate = useNavigate()
  const [area, setArea] = useState("Hall Utama")
  const [selectedProject, setSelectedProject] = useState(null)
  const [sceneReady, setSceneReady] = useState(false)
  const tier = useQualityStore((s) => s.tier)

  // While the project popup is open, freeze the player (WASD / walk).
  useEffect(() => {
    useWalkStore.getState().setLocked(Boolean(selectedProject))
    return () => useWalkStore.getState().setLocked(false)
  }, [selectedProject])

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0b1220] text-white select-none">
      {/* Loading Overlay: rendered first so it always covers the canvas on mount */}
      <LoadingOverlay ready={sceneReady} />

      {/* 3D Scene */}
      <CanvasErrorBoundary>
        <Canvas
          shadows={tier === "tinggi"}
          dpr={DPR_FOR[tier]}
          gl={{ powerPreference: "high-performance", antialias: tier !== "rendah" }}
          camera={{ position: [0, 1.7, 0], fov: 70, near: 0.1, far: 220 }}
          className="!absolute !inset-0 hall-canvas"
        >
          <color attach="background" args={["#0b1220"]} />
          <Suspense fallback={null}>
            <VirtualExhibition
              onArea={setArea}
              onSelectProject={setSelectedProject}
              onReady={() => setSceneReady(true)}
            />
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>

      {/* HUD Top Bar */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-start justify-between pl-4 py-4 pr-4 md:pr-6 pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-start gap-2">
          <div className="flex items-center space-x-3 rounded-2xl border border-[#223047] bg-black/50 px-4 py-2.5 backdrop-blur-md shadow-xl">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1d4ed8] to-[#38bdf8] flex items-center justify-center shadow-lg shadow-blue-900/40">
              <Frame className="w-5 h-5 text-[#eaf2fc]" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight text-[#7dd3fc]">
                SINGGAH Virtual Hall 3D
              </h1>
              <p className="flex items-center space-x-1 text-[10px] leading-tight text-[#93b4d4]">
                <MapPin className="w-3 h-3 text-[#38bdf8]" />
                <span>{area}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-2.5 rounded-2xl border border-[#223047] bg-black/50 px-4 py-2.5 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-white/25 hover:bg-white/[0.06] hover:shadow-[0_8px_25px_-8px_rgba(255,255,255,0.25)] hover:scale-[1.03] active:scale-95 cursor-pointer"
            aria-label="Kembali ke Beranda"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] transition-colors duration-300 group-hover:bg-white/15">
              <ArrowLeft className="w-4 h-4 text-[#93b4d4] transition-all duration-300 group-hover:-translate-x-1 group-hover:text-white" />
            </span>
            <span className="text-xs font-semibold text-[#93b4d4] transition-colors duration-300 group-hover:text-white">
              Kembali
            </span>
          </button>
        </div>
      </header>

      {/* HUD Bottom Hint */}
      <footer className="absolute bottom-4 left-0 right-0 z-20 flex justify-center px-4 pointer-events-none">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-2xl border border-[#223047] bg-black/50 px-5 py-2.5 text-[11px] md:text-xs text-[#93b4d4] backdrop-blur-md shadow-xl">
          <span className="flex items-center space-x-1.5">
            <Eye className="w-4 h-4 text-[#38bdf8]" />
            <span>Drag untuk melihat-lihat</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <MousePointerClick className="w-4 h-4 text-[#38bdf8]" />
            <span>WASD / klik lantai untuk berjalan</span>
          </span>
          <span className="hidden sm:flex items-center space-x-1.5">
            <DoorOpen className="w-4 h-4 text-[#38bdf8]" />
            <span>Jalan lewat portal biru untuk pindah ruang</span>
          </span>
          <span className="hidden md:flex items-center space-x-1.5">
            <Frame className="w-4 h-4 text-[#38bdf8]" />
            <span>Klik lukisan untuk detail karya</span>
          </span>
        </div>
      </footer>

      {/* Portal transition overlay */}
      <PortalTransitionOverlay />

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          categoryTitle={area.split(" — ")[0]}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  )
}

export default Hall
