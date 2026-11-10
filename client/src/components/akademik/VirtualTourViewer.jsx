import { useEffect, useRef, useState } from "react"
import Marzipano from "marzipano"
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  HelpCircle,
  Info,
  Loader2,
  Maximize2,
  Minimize2,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  X,
} from "lucide-react"

const DEFAULT_FOV = 1.35
const MIN_FOV = 0.65
const MAX_FOV = 1.95

function buildLinkHotspot(scene, onSelect) {
  const button = document.createElement("button")
  button.type = "button"
  button.className = "ak-hotspot ak-hotspot--link"
  button.innerHTML = `
    <span class="ak-hotspot__pulse" aria-hidden="true"></span>
    <span class="ak-hotspot__arrow" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    </span>
    <span class="ak-hotspot__label">${scene.label}</span>
  `
  button.setAttribute("aria-label", `Masuk ke ${scene.label}`)
  button.addEventListener("click", (event) => {
    event.stopPropagation()
    onSelect(scene.to)
  })
  return button
}

function buildInfoHotspot(point, onOpen) {
  const button = document.createElement("button")
  button.type = "button"
  button.className = "ak-hotspot ak-hotspot--info"
  button.innerHTML = `
    <span class="ak-hotspot__dot">i</span>
    <span class="ak-hotspot__label">${point.label}</span>
  `
  button.setAttribute("aria-label", `Buka informasi ${point.label}`)
  button.addEventListener("click", (event) => {
    event.stopPropagation()
    onOpen(point)
  })
  return button
}

export default function VirtualTourViewer({
  scenes,
  sceneMap,
  activeSceneId,
  onSceneChange,
}) {
  const stageRef = useRef(null)
  const viewerRef = useRef(null)
  const sceneRefs = useRef({})
  const onSceneChangeRef = useRef(onSceneChange)
  const initialSceneRef = useRef(activeSceneId)
  const autorotateRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [switching, setSwitching] = useState(false)
  const [error, setError] = useState("")
  const [activePoint, setActivePoint] = useState(null)
  const [showHelp, setShowHelp] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isRotating, setIsRotating] = useState(false)

  const activeScene = sceneMap[activeSceneId] || scenes[0]

  useEffect(() => {
    onSceneChangeRef.current = onSceneChange
  }, [onSceneChange])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return undefined

    let viewer
    let resizeObserver
    let isDestroyed = false

    try {
      viewer = new Marzipano.Viewer(stage, {
        controls: { mouseViewMode: "drag" },
      })
    } catch {
      setError("Peramban ini belum mendukung tampilan panorama 360°.")
      setLoading(false)
      return undefined
    }

    viewerRef.current = viewer

    scenes.forEach((sceneData) => {
      const source = Marzipano.ImageUrlSource.fromString(sceneData.panorama)
      const geometry = new Marzipano.EquirectGeometry([{ width: 2400 }])
      const limiter = Marzipano.RectilinearView.limit.traditional(
        2400,
        (100 * Math.PI) / 180,
      )
      const view = new Marzipano.RectilinearView(
        sceneData.initialView,
        limiter,
      )

      source.addEventListener("networkError", () => {
        if (!isDestroyed) {
          setError(
            "Panorama ruangan gagal dimuat. Periksa koneksi atau berkas panorama.",
          )
          setLoading(false)
        }
      })

      const scene = viewer.createScene({
        source,
        geometry,
        view,
        pinFirstLevel: true,
      })

      const container = scene.hotspotContainer()

      sceneData.hotspots.forEach((hotspot) => {
        container.createHotspot(
          buildLinkHotspot(hotspot, (to) => {
            viewer.breakIdleMovement()
            onSceneChangeRef.current?.(to)
          }),
          { yaw: hotspot.yaw, pitch: hotspot.pitch },
        )
      })

      sceneData.points.forEach((point) => {
        container.createHotspot(
          buildInfoHotspot(point, (selected) => {
            viewer.breakIdleMovement()
            setActivePoint(selected)
          }),
          { yaw: point.yaw, pitch: point.pitch },
        )
      })

      sceneRefs.current[sceneData.id] = { scene, view }
    })

    const startScene = sceneRefs.current[initialSceneRef.current]
    if (startScene) {
      startScene.scene.switchTo({ transitionDuration: 0 })
    }

    const startTimer = window.setTimeout(() => setLoading(false), 700)
    const idle = Marzipano.autorotate({
      yawSpeed: 0.035,
      targetPitch: 0,
      targetFov: DEFAULT_FOV,
    })
    autorotateRef.current = idle
    viewer.setIdleMovement(6000, idle)

    resizeObserver = new ResizeObserver(() => {
      if (!isDestroyed) viewer.updateSize()
    })
    resizeObserver.observe(stage)

    const handleFullscreen = () => {
      setIsFullscreen(document.fullscreenElement === stage)
      window.setTimeout(() => viewer.updateSize(), 120)
    }
    document.addEventListener("fullscreenchange", handleFullscreen)

    return () => {
      isDestroyed = true
      window.clearTimeout(startTimer)
      resizeObserver?.disconnect()
      document.removeEventListener("fullscreenchange", handleFullscreen)
      viewer.destroy()
      viewerRef.current = null
      sceneRefs.current = {}
    }
  }, [scenes])

  useEffect(() => {
    const entry = sceneRefs.current[activeSceneId]
    if (!entry) return

    setSwitching(true)
    setActivePoint(null)
    entry.view.setParameters(sceneMap[activeSceneId].initialView)
    entry.scene.switchTo({ transitionDuration: 620 })
    const timer = window.setTimeout(() => setSwitching(false), 660)
    return () => window.clearTimeout(timer)
  }, [activeSceneId, sceneMap])

  const toggleFullscreen = async () => {
    const stage = stageRef.current
    if (!stage) return
    if (!document.fullscreenElement) {
      try {
        await stage.requestFullscreen()
      } catch {
        setIsFullscreen(false)
      }
    } else {
      await document.exitFullscreen()
    }
  }

  const resetView = () => {
    const entry = sceneRefs.current[activeSceneId]
    if (!entry) return
    entry.view.setParameters(sceneMap[activeSceneId].initialView)
  }

  const zoom = (direction) => {
    const entry = sceneRefs.current[activeSceneId]
    if (!entry) return
    const next = Math.min(
      MAX_FOV,
      Math.max(MIN_FOV, entry.view.fov() + direction * 0.12),
    )
    entry.view.setFov(next)
  }

  const toggleRotate = () => {
    const viewer = viewerRef.current
    if (!viewer) return
    const next = !isRotating
    setIsRotating(next)
    viewer.setIdleMovement(next ? 1000 : 0, next ? autorotateRef.current : null)
    viewer.stopMovement()
    if (next) viewer.breakIdleMovement()
  }

  const goToScene = (direction) => {
    const index = scenes.findIndex((scene) => scene.id === activeSceneId)
    const nextIndex = (index + direction + scenes.length) % scenes.length
    onSceneChangeRef.current?.(scenes[nextIndex].id)
  }

  return (
    <div
      ref={stageRef}
      className={`ak-viewer ${isFullscreen ? "is-fullscreen" : ""}`}
    >
      <div className="ak-viewer__badge">
        <Compass size={15} />
        <span>360°</span>
        <span className="ak-viewer__badge-sep" />
        <span>{activeScene.floor}</span>
      </div>

      <div className="ak-viewer__top-actions">
        <button
          type="button"
          onClick={() => setShowHelp(true)}
          className="ak-viewer__icon-btn"
          aria-label="Bantuan navigasi"
        >
          <HelpCircle size={18} />
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="ak-viewer__icon-btn"
          aria-label={isFullscreen ? "Keluar layar penuh" : "Layar penuh"}
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>

      {activePoint && (
        <div className="ak-viewer__info-card">
          <button
            type="button"
            className="ak-viewer__info-close"
            onClick={() => setActivePoint(null)}
            aria-label="Tutup informasi"
          >
            <X size={15} />
          </button>
          <span className="ak-viewer__info-eyebrow">
            <Info size={13} /> Detail ruangan
          </span>
          <h4>{activePoint.label}</h4>
          <p>{activePoint.description}</p>
        </div>
      )}

      <div className="ak-viewer__controls">
        <button
          type="button"
          onClick={() => goToScene(-1)}
          className="ak-viewer__icon-btn"
          aria-label="Ruangan sebelumnya"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={toggleRotate}
          className={`ak-viewer__icon-btn ${isRotating ? "is-on" : ""}`}
          aria-label={isRotating ? "Hentikan rotasi" : "Mulai rotasi otomatis"}
          aria-pressed={isRotating}
        >
          {isRotating ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <span className="ak-viewer__controls-sep" />
        <button
          type="button"
          onClick={() => zoom(-1)}
          className="ak-viewer__icon-btn"
          aria-label="Perbesar"
        >
          <Plus size={18} />
        </button>
        <button
          type="button"
          onClick={() => zoom(1)}
          className="ak-viewer__icon-btn"
          aria-label="Perkecil"
        >
          <Minus size={18} />
        </button>
        <span className="ak-viewer__controls-sep" />
        <button
          type="button"
          onClick={resetView}
          className="ak-viewer__icon-btn"
          aria-label="Kembalikan pandangan awal"
        >
          <RotateCcw size={17} />
        </button>
        <button
          type="button"
          onClick={() => goToScene(1)}
          className="ak-viewer__icon-btn"
          aria-label="Ruangan berikutnya"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {(loading || switching) && (
        <div className={`ak-viewer__loading ${loading ? "is-solid" : ""}`}>
          <Loader2 size={22} className="ak-spin" />
          <span>{loading ? "Menyiapkan panorama" : `Menuju ${activeScene.label}`}</span>
        </div>
      )}

      {error && (
        <div className="ak-viewer__error">
          <Info size={18} />
          <p>{error}</p>
          <button type="button" onClick={() => setError("")}>
            Tutup
          </button>
        </div>
      )}

      <div className="ak-viewer__hint">
        <span className="ak-viewer__hint-dot" />
        Tarik untuk melihat sekeliling
      </div>

      {showHelp && (
        <div className="ak-viewer__help" role="dialog" aria-modal="true">
          <div className="ak-viewer__help-card">
            <span className="ak-viewer__info-eyebrow">Panduan singkat</span>
            <h3>Menjelajah ruang 360°</h3>
            <ul>
              <li>Tarik atau geser layar untuk melihat sekeliling ruangan.</li>
              <li>Klik penanda panah untuk berpindah ke ruangan lain.</li>
              <li>Klik penanda <strong>i</strong> untuk membaca detail fasilitas.</li>
              <li>Gunakan tombol di bawah untuk zoom, rotasi, dan layar penuh.</li>
            </ul>
            <button type="button" onClick={() => setShowHelp(false)}>
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
