import useHall from "../../hooks/useHall"
import { useWalkStore } from "../../three/hooks/useWalk"
import HallCanvas from "./HallCanvas"
import HallHUDHeader from "./HallHUDHeader"
import HallHUDFooter from "./HallHUDFooter"
import LoadingOverlay from "./LoadingOverlay"
import PortalTransitionOverlay from "./PortalTransitionOverlay"
import ProjectDetailModal from "./ProjectDetailModal"

export default function HallSection() {
  const {
    area,
    setArea,
    selectedProject,
    setSelectedProject,
    sceneReady,
    setSceneReady,
    hallData,
    tier,
    closeProject,
  } = useHall()
  const isSitting = useWalkStore((s) => s.isSitting)

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0b1220] text-white select-none">
      <LoadingOverlay ready={sceneReady} />

      <HallCanvas
        tier={tier}
        hallData={hallData}
        onArea={setArea}
        onSelectProject={setSelectedProject}
        onReady={() => setSceneReady(true)}
      />

      <HallHUDHeader area={area} />
      <HallHUDFooter />

      {isSitting && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 rounded-2xl border border-[#38bdf8]/40 bg-[#0f2036]/90 px-6 py-3 shadow-2xl backdrop-blur-md animate-bounce">
          <span className="text-sm font-medium text-[#7dd3fc]">Anda sedang duduk</span>
          <button
            onClick={() => useWalkStore.getState().setSitting(false)}
            className="rounded-xl bg-gradient-to-r from-[#38bdf8] to-[#0284c7] px-5 py-2 text-sm font-bold text-slate-950 shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            Bangun
          </button>
        </div>
      )}

      <PortalTransitionOverlay />

      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          categoryTitle={area.split(" — ")[0]}
          onClose={closeProject}
        />
      )}
    </div>
  )
}
