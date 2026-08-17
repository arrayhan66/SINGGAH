import { useEffect, useState } from "react"
import { useWalkStore } from "../three/hooks/useWalk"
import { useQualityStore } from "../three/hooks/useQuality"
import api from "../services/api"
import DEFAULT_HALL_DATA from "../constants/hallDefaults"

export default function useHall() {
  const [area, setArea] = useState("Hall Utama")
  const [selectedProject, setSelectedProject] = useState(null)
  const [sceneReady, setSceneReady] = useState(false)
  const [hallData, setHallData] = useState(DEFAULT_HALL_DATA)
  const tier = useQualityStore((s) => s.tier)

  useEffect(() => {
    api.get("/hall")
      .then((res) => {
        const data = res.data.data
        if (data && data.categories && data.categories.length > 0) {
          setHallData(data)
        }
      })
      .catch((err) => {
        console.error("Failed to load hall data, using default:", err)
      })
  }, [])

  useEffect(() => {
    useWalkStore.getState().setLocked(Boolean(selectedProject))
    return () => useWalkStore.getState().setLocked(false)
  }, [selectedProject])

  function closeProject() {
    setSelectedProject(null)
  }

  return {
    area,
    setArea,
    selectedProject,
    setSelectedProject,
    sceneReady,
    setSceneReady,
    hallData,
    tier,
    closeProject,
  }
}
