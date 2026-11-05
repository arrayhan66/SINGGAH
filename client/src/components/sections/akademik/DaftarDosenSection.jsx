import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowUpRight,
  BookOpen,
  DoorOpen,
  GraduationCap,
  Mail,
  Phone,
  Search,
  X,
} from "lucide-react"
import AkademikNav from "../../akademik/AkademikNav"
import { dosenList } from "../../../data/akademik/dosen"
import { tourSceneMap } from "../../../data/akademik/turVirtual"

export default function DaftarDosenSection() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return dosenList
    return dosenList.filter((dosen) =>
      [
        dosen.name,
        dosen.position,
        dosen.expertise.join(" "),
        dosen.courses.join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    )
  }, [search])

  useEffect(() => {
    if (!selected) return undefined
    const onKeyDown = (event) => {
      if (event.key === "Escape") setSelected(null)
    }
    document.addEventListener("keydown", onKeyDown)
    document.documentElement.classList.add("no-scroll")
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.documentElement.classList.remove("no-scroll")
    }
  }, [selected])

  const openRoom = (roomId) => {
    navigate(`/akademik/tur-virtual?scene=${roomId}`)
  }

  return (
    <section className="ak-section ak-dosen-page">
      <div className="ak-section__grain" aria-hidden="true" />

      <div className="ak-container">
        <header className="ak-hero">
          <div>
            <div className="ak-eyebrow">
              <span>Lingkungan Akademik</span>
              <span className="ak-eyebrow__slash">/</span>
              <span>Daftar Dosen</span>
            </div>
            <h1 className="ak-display">
              Kenali <em>orang</em> di balik
              <br />
              ruang-ruang elektro.
            </h1>
            <p className="ak-hero__lead">
              Direktori dosen Jurusan Teknik Elektro, lengkap dengan bidang
              keahlian, mata kuliah, dan jadwal konsultasi. Buka profil untuk
              melihat informasi akademik yang dipublikasikan.
            </p>
          </div>

          <div className="ak-hero__aside">
            <span className="ak-hero__stamp">
              <GraduationCap size={18} />
              Direktori akademik
            </span>
            <div className="ak-hero__stats">
              <div>
                <strong>{dosenList.length}</strong>
                <span>dosen</span>
              </div>
              <div>
                <strong>05</strong>
                <span>bidang keahlian</span>
              </div>
              <div>
                <strong>02</strong>
                <span>ruang konsultasi</span>
              </div>
            </div>
          </div>
        </header>

        <AkademikNav />

        <div className="ak-directory-bar">
          <label className="ak-search">
            <Search size={17} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama, keahlian, atau mata kuliah..."
              aria-label="Cari dosen"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Hapus pencarian"
              >
                <X size={14} />
              </button>
            )}
          </label>
          <span className="ak-directory-count">
            {filtered.length} dari {dosenList.length} dosen
          </span>
        </div>

        {filtered.length > 0 ? (
          <div className="ak-dosen-grid">
            {filtered.map((dosen, index) => (
              <button
                key={dosen.id}
                type="button"
                onClick={() => setSelected(dosen)}
                className="ak-dosen-card"
                style={{ "--ak-accent": dosen.accent }}
              >
                <div className="ak-dosen-card__top">
                  <span className="ak-dosen-card__id">
                    DOS-{String(dosenList.indexOf(dosen) + 1).padStart(2, "0")}
                  </span>
                  <div className="ak-avatar" aria-hidden="true">
                    <span>{dosen.initials}</span>
                  </div>
                  <span className="ak-dosen-card__room">
                    <DoorOpen size={13} />
                    {dosen.roomLabel}
                  </span>
                </div>

                <div className="ak-dosen-card__body">
                  <h2>{dosen.name}</h2>
                  <p className="ak-dosen-card__position">{dosen.position}</p>
                  <ul className="ak-chip-list ak-chip-list--small">
                    {dosen.expertise.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <span className="ak-dosen-card__more">
                    Lihat profil
                    <ArrowUpRight size={15} />
                  </span>
                </div>
                <span className="ak-dosen-card__index">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="ak-empty">
            <Search size={26} />
            <h2>Dosen tidak ditemukan</h2>
            <p>
              Coba kata kunci lain, misalnya nama bidang keahlian atau mata
              kuliah.
            </p>
            <button type="button" onClick={() => setSearch("")}>
              Tampilkan semua
            </button>
          </div>
        )}

        <p className="ak-source-note">
          Catatan: direktori ini masih memakai data contoh. Hubungkan ke basis
          data dosen jurusan untuk menampilkan data resmi.
        </p>
      </div>

      {selected && (
        <div
          className="ak-modal"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null)
          }}
        >
          <div
            className="ak-modal__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dosen-profile-title"
          >
            <button
              type="button"
              className="ak-modal__close"
              onClick={() => setSelected(null)}
              aria-label="Tutup profil"
            >
              <X size={18} />
            </button>

            <div className="ak-profile">
              <aside
                className="ak-profile__side"
                style={{ "--ak-accent": selected.accent }}
              >
                <span className="ak-kicker">Profil dosen</span>
                <div className="ak-avatar ak-avatar--large" aria-hidden="true">
                  <span>{selected.initials}</span>
                </div>
                <h3 id="dosen-profile-title">{selected.name}</h3>
                <p>{selected.position}</p>

                <div className="ak-profile__contact">
                  <span>
                    <Mail size={15} />
                    <a href={`mailto:${selected.email}`}>{selected.email}</a>
                  </span>
                  <span>
                    <Phone size={15} />
                    {selected.phone || "Nomor belum dipublikasikan"}
                  </span>
                  <span>
                    <DoorOpen size={15} />
                    {selected.roomLabel}
                  </span>
                </div>

                <button
                  type="button"
                  className="ak-btn ak-btn--accent"
                  onClick={() => openRoom(selected.roomId)}
                  disabled={!tourSceneMap[selected.roomId]}
                >
                  <DoorOpen size={16} />
                  Buka ruang 3D
                </button>
              </aside>

              <div className="ak-profile__main">
                <div className="ak-profile__block">
                  <span className="ak-kicker">Fokus akademik</span>
                  <p className="ak-profile__focus">{selected.focus}</p>
                </div>

                <div className="ak-profile__block">
                  <h4>
                    <BookOpen size={16} />
                    Mata kuliah yang diampu
                  </h4>
                  <ul className="ak-list">
                    {selected.courses.map((course) => (
                      <li key={course}>{course}</li>
                    ))}
                  </ul>
                </div>

                <div className="ak-profile__block">
                  <h4>
                    <GraduationCap size={16} />
                    Riwayat pendidikan
                  </h4>
                  <ol className="ak-list ak-list--number">
                    {selected.education.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                </div>

                <div className="ak-profile__consult">
                  <div>
                    <span className="ak-kicker">Jadwal konsultasi</span>
                    <strong>{selected.consultation}</strong>
                  </div>
                  <span className="ak-profile__consult-note">
                    Konfirmasi terlebih dahulu melalui email institusi.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
