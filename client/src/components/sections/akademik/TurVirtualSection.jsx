import { useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { ArrowUpRight, Compass, MapPin, Move3d, ScanEye } from "lucide-react"
import VirtualTourViewer from "../../akademik/VirtualTourViewer"
import FloorPlan from "../../akademik/FloorPlan"
import AkademikNav from "../../akademik/AkademikNav"
import {
  tourSceneMap,
  tourScenes,
} from "../../../data/akademik/turVirtual"

const notes = [
  {
    icon: Move3d,
    title: "Berjalan bebas",
    text: "Geser panorama untuk melihat ke segala arah, lalu ikuti penanda untuk berpindah ruang.",
  },
  {
    icon: ScanEye,
    title: "Kenali fasilitas",
    text: "Setiap ruangan memiliki catatan fasilitas yang bisa dibuka langsung dari dalam panorama.",
  },
  {
    icon: MapPin,
    title: "Tidak tersesat",
    text: "Peta lantai dan daftar ruang selalu tersedia di samping kanan panorama.",
  },
]

export default function TurVirtualSection() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedScene = searchParams.get("scene")
  const activeSceneId = tourSceneMap[requestedScene]
    ? requestedScene
    : "lobby"
  const activeScene = tourSceneMap[activeSceneId]
  const activeIndex = tourScenes.findIndex(
    (scene) => scene.id === activeSceneId,
  )

  const handleSceneChange = useCallback(
    (id) => {
      if (!tourSceneMap[id]) return
      setSearchParams({ scene: id }, { replace: true, preventScrollReset: true })
    },
    [setSearchParams],
  )

  return (
    <section className="ak-section ak-tour-page">
      <div className="ak-section__grain" aria-hidden="true" />

      <div className="ak-container">
        <header className="ak-hero">
          <div>
            <div className="ak-eyebrow">
              <span>Lingkungan Akademik</span>
              <span className="ak-eyebrow__slash">/</span>
              <span>Tur Virtual</span>
            </div>
            <h1 className="ak-display">
              Susuri gedung <em>elektro</em>,
              <br />
              satu ruangan demi satu.
            </h1>
            <p className="ak-hero__lead">
              Panorama 360° dari lobby hingga laboratorium. Klik penanda di
              dalam ruangan untuk berpindah tempat dan mengenali fasilitas
              Jurusan Teknik Elektro.
            </p>
          </div>

          <div className="ak-hero__aside">
            <span className="ak-hero__stamp">
              <Compass size={18} />
              Panorama interaktif
            </span>
            <div className="ak-hero__stats">
              <div>
                <strong>{String(tourScenes.length).padStart(2, "0")}</strong>
                <span>ruang</span>
              </div>
              <div>
                <strong>360°</strong>
                <span>sudut pandang</span>
              </div>
              <div>
                <strong>1</strong>
                <span>lantai virtual</span>
              </div>
            </div>
          </div>
        </header>

        <AkademikNav />

        <div className="ak-tour-grid">
          <aside className="ak-tour-side" aria-label="Daftar ruangan">
            <FloorPlan
              scenes={tourScenes}
              activeSceneId={activeSceneId}
              onSelect={handleSceneChange}
            />

            <div className="ak-room-list">
              <div className="ak-room-list__head">
                <span>Daftar ruang</span>
                <span className="ak-room-list__hint">klik untuk masuk</span>
              </div>
              <ol>
                {tourScenes.map((scene, index) => (
                  <li key={scene.id}>
                    <button
                      type="button"
                      onClick={() => handleSceneChange(scene.id)}
                      className={`ak-room-list__item ${
                        scene.id === activeSceneId ? "is-active" : ""
                      }`}
                      aria-current={
                        scene.id === activeSceneId ? "true" : undefined
                      }
                    >
                      <span className="ak-room-list__num">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="ak-room-list__body">
                        <strong>{scene.name}</strong>
                        <small>
                          {scene.category} · {scene.floor}
                        </small>
                      </span>
                      <ArrowUpRight size={15} className="ak-room-list__arrow" />
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          <div className="ak-tour-stage">
            <VirtualTourViewer
              scenes={tourScenes}
              sceneMap={tourSceneMap}
              activeSceneId={activeSceneId}
              onSceneChange={handleSceneChange}
            />

            <div className="ak-room-caption">
              <div className="ak-room-caption__main">
                <span className="ak-kicker">
                  Ruang {String(activeIndex + 1).padStart(2, "0")} ·{" "}
                  {activeScene.category}
                </span>
                <h2>{activeScene.name}</h2>
                <p>{activeScene.description}</p>
              </div>
              <div className="ak-room-caption__side">
                <span className="ak-kicker">Yang bisa ditemukan</span>
                <ul className="ak-chip-list">
                  {activeScene.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="ak-notes">
          {notes.map((note, index) => {
            const Icon = note.icon
            return (
              <article key={note.title} className="ak-note">
                <span className="ak-note__index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="ak-note__icon">
                  <Icon size={18} strokeWidth={1.7} />
                </span>
                <h3>{note.title}</h3>
                <p>{note.text}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
