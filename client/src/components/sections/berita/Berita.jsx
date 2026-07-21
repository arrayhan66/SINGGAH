import { Trophy, User } from "lucide-react"
import { useNavigate } from "react-router-dom"
import DustBackground from "../../ui/DustBackground"
import GlowBackground from "../../ui/GlowBackground"
import useSearchAndExpand from "../../../hooks/useSearchAndExpand"
import GlassCard from "../../ui/GlassCard"
import SearchBar from "../../ui/SearchBar"
import OutlineButton from "../../ui/OutlineButton"
import { useBerita } from "../../../context/BeritaContext"

const INITIAL_COUNT = 6

function Berita() {
  const navigate = useNavigate()
  const { beritaList } = useBerita()

  const {
    search,
    handleSearchChange,
    visibleData: visibleBerita,
    filteredData: filteredBerita,
    showAll,
    setShowAll,
  } = useSearchAndExpand(beritaList, INITIAL_COUNT)

  return (
    <section
      id="berita"
      className="relative overflow-hidden bg-brand-navy pt-24 lg:pt-28 pb-6 sm:pb-10 lg:pb-12"
    >
      {/* Glow */}
      <GlowBackground />

      {/* Dust Particles */}
      <DustBackground />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 mt-6 sm:mt-10">
        <div className="text-center">
          <h2 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-black text-white">
            Berita & <span className="text-cyan-300">Kegiatan</span>
          </h2>
          <p className="mx-auto mt-4 sm:mt-5 max-w-2xl text-base sm:text-lg leading-relaxed sm:leading-8 text-slate-300">
            Kumpulan berita, kegiatan, dan pencapaian civitas akademika Teknik
            Elektro Poliban terkini.
          </p>
        </div>

        {/* Search Bar */}
        <SearchBar
          value={search}
          onChange={handleSearchChange}
          placeholder="Cari berita..."
        />

        <div className="mt-10 sm:mt-14 grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {visibleBerita.length > 0 ? (
            visibleBerita.map((item, index) => {
              const Icon = item.icon || Trophy

              return (
                <GlassCard
                  key={index}
                  hover
                  onClick={() => navigate(`/berita/${item.id}`)}
                  className="group cursor-pointer overflow-hidden"
                >
                  {/* Gambar */}
                  <div className="relative flex h-48 sm:h-56 w-full items-center justify-center bg-gradient-to-br from-[#0a2472]/40 to-brand-navy/60">
                    <Trophy className="text-white/20" size={56} />

                    {/* Icon */}
                    <div className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-xl transition group-hover:scale-110">
                      <Icon size={22} />
                    </div>
                  </div>

                  {/* Konten */}
                  <div className="p-6 sm:p-8">
                    <h3 className="text-xl font-bold text-white">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm font-medium text-cyan-300">
                      {item.event}
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                      <User size={16} className="text-cyan-400" />
                      <span>{item.winner}</span>
                    </div>

                    <p className="mt-4 leading-7 text-slate-300">{item.desc}</p>
                  </div>
                </GlassCard>
              )
            })
          ) : (
            <p className="col-span-full text-center text-slate-400">
              Berita tidak ditemukan.
            </p>
          )}
        </div>

        {/* Tombol Lihat Lebih Banyak */}
        {!showAll && filteredBerita.length > INITIAL_COUNT && (
          <div className="mt-6 sm:mt-8 flex justify-center">
            <OutlineButton onClick={() => setShowAll(true)}>
              Lihat Lebih Banyak
            </OutlineButton>
          </div>
        )}
      </div>
    </section>
  )
}

export default Berita
