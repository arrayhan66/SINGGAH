import useHall from "../../hooks/useHall"
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
