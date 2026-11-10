const links = [
  ["lobby", "koridor"],
  ["koridor", "kantor-jurusan"],
  ["koridor", "ruang-kelas"],
  ["koridor", "ruang-dosen"],
  ["koridor", "lab-elektronika"],
  ["lobby", "lab-komputer"],
]

export default function FloorPlan({ scenes, activeSceneId, onSelect }) {
  const byId = Object.fromEntries(scenes.map((scene) => [scene.id, scene]))
  const active = byId[activeSceneId]

  return (
    <div className="ak-plan">
      <div className="ak-plan__head">
        <span className="ak-plan__eyebrow">Peta lantai</span>
        <span className="ak-plan__count">{scenes.length} ruang</span>
      </div>

      <div className="ak-plan__canvas">
        <span className="ak-plan__grid" aria-hidden="true" />
        <svg viewBox="0 0 100 100" aria-hidden="true" className="ak-plan__lines">
          {links.map(([from, to]) => {
            const a = byId[from]
            const b = byId[to]
            if (!a || !b) return null
            return (
              <line
                key={`${from}-${to}`}
                x1={a.map.x}
                y1={a.map.y}
                x2={b.map.x}
                y2={b.map.y}
              />
            )
          })}
        </svg>

        {scenes.map((scene, index) => {
          const isActive = scene.id === activeSceneId
          return (
            <button
              key={scene.id}
              type="button"
              onClick={() => onSelect(scene.id)}
              className={`ak-plan__node ${isActive ? "is-active" : ""}`}
              style={{ left: `${scene.map.x}%`, top: `${scene.map.y}%` }}
              aria-label={`Buka ${scene.name}`}
              aria-pressed={isActive}
            >
              <span className="ak-plan__node-dot">{index + 1}</span>
              <span className="ak-plan__node-label">{scene.label}</span>
            </button>
          )
        })}
      </div>

      <div className="ak-plan__now">
        <span className="ak-plan__now-dot" />
        <div>
          <span className="ak-plan__now-label">Posisi kamu</span>
          <strong>{active?.name}</strong>
        </div>
      </div>
    </div>
  )
}
