import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Calendar, User, Newspaper, ArrowRight } from "lucide-react"
import DustBackground from "../../ui/DustBackground"
import GlowBackground from "../../ui/GlowBackground"
import useSearchAndExpand from "../../../hooks/useSearchAndExpand"
import GlassCard from "../../ui/GlassCard"
import SearchBar from "../../ui/SearchBar"
import OutlineButton from "../../ui/OutlineButton"
import { useBerita } from "../../../context/BeritaContext"

function Berita() {
  const navigate = useNavigate()
  const { beritaList } = useBerita()
  const [initialCount, setInitialCount] = useState(6)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1536) {
        setInitialCount(8)
      } else {
        setInitialCount(6)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const {
    search,
    handleSearchChange,
    visibleData: visibleBerita,
    filteredData: filteredBerita,
    showAll,
    setShowAll,
  } = useSearchAndExpand(beritaList, initialCount)

  return (
    <section
      id="berita"
      className="relative overflow-hidden bg-brand-navy min-h-screen pt-[calc(var(--navbar-h)-8px)] pb-6 sm:pb-10 lg:pb-12 2xl:pb-20"
    >
      <GlowBackground />
      <DustBackground />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 relative 2xl:max-w-[1440px] 2xl:px-12">
        <div className="text-center">
          <h2 className="mt-8 text-3xl font-black text-white sm:text-4xl lg:text-5xl 2xl:text-6xl">
            Berita & <span className="text-cyan-300">Kegiatan</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8 2xl:mt-8 2xl:max-w-4xl 2xl:text-xl 2xl:leading-9">
            Kumpulan berita, publikasi kegiatan, dan informasi akademik civitas
            akademika terkini di platform SINGGAH.
          </p>
        </div>

        <div className="mt-8 2xl:mt-12">
          <SearchBar
            value={search}
            onChange={handleSearchChange}
            placeholder="Cari berita atau kegiatan..."
          />
        </div>

        {/* Grid Card Berita */}
        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3 2xl:mt-20 2xl:grid-cols-4 2xl:gap-10">
          {visibleBerita.length > 0 ? (
            visibleBerita.map((item) => (
              <GlassCard
                key={item.id}
                hover
                onClick={() => navigate(`/berita/${item.slug}`)}
                className="group cursor-pointer overflow-hidden flex flex-col justify-between"
              >
                {/* Gambar Berita / Thumbnail */}
                <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-gradient-to-br from-[#0a2472]/40 to-brand-navy/60 flex-shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Newspaper className="text-white/20" size={56} />
                    </div>
                  )}

                  {/* Kategori Badge di atas gambar */}
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-brand-navy/80 backdrop-blur-md text-cyan-300 text-xs font-semibold border border-cyan-500/30 shadow-md">
                    {item.tags?.[0] || "Berita"}
                  </div>
                </div>

                {/* Konten dengan Struktur Konsisten */}
                <div className="p-6 sm:p-7 flex flex-col flex-grow justify-between space-y-4">
                  <div className="space-y-3">
                    {/* Baris Metadata Terpadu (Tanggal & Penulis sejajar rapi dalam satu blok flex) */}
                    <div className="flex items-center justify-between text-xs text-slate-400 gap-2">
                      <div className="flex items-center gap-1.5 font-medium truncate">
                        <Calendar
                          size={13}
                          className="text-cyan-400 flex-shrink-0"
                        />
                        <span className="truncate">{item.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium truncate">
                        <User
                          size={13}
                          className="text-cyan-400 flex-shrink-0"
                        />
                        <span className="truncate">{item.source}</span>
                      </div>
                    </div>

                    {/* Judul Berita Utama */}
                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h3>

                    {/* Sub-teks / Tagline Kegiatan */}
                    <div className="inline-block px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 text-xs font-semibold tracking-wide border border-cyan-500/20">
                      {item.event}
                    </div>

                    {/* Deskripsi Singkat */}
                    <p className="text-sm leading-relaxed text-slate-300/90 line-clamp-3">
                      {item.desc}
                    </p>
                  </div>

                  {/* Tombol Baca / Action Button Kotak Tersendiri di Bawah */}
                  <div className="pt-4 border-t border-slate-700/40 flex items-center justify-between flex-shrink-0">
                    <span className="text-xs text-slate-400 font-medium">
                      Selengkapnya
                    </span>
                    <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold group-hover:bg-cyan-500 group-hover:text-brand-navy transition-all duration-300 shadow-sm">
                      <span>Baca</span>
                      <ArrowRight
                        size={14}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/60 bg-slate-800/20 py-16 sm:py-24 2xl:py-32">
              <div className="mb-5 rounded-full bg-slate-800/50 p-4 ring-1 ring-slate-700/50 backdrop-blur-sm">
                <svg
                  className="h-10 w-10 text-slate-400 2xl:h-12 2xl:w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-200 2xl:text-2xl">
                Berita tidak ditemukan
              </h3>
              <p className="mt-2 max-w-md text-center text-sm text-slate-400 sm:text-base 2xl:mt-3 2xl:text-lg">
                Maaf, kami tidak menemukan berita atau kegiatan yang cocok
                dengan kata kunci{" "}
                <span className="font-semibold text-slate-300">"{search}"</span>
                . Coba gunakan istilah lain.
              </p>
            </div>
          )}
        </div>

        {!showAll && filteredBerita.length > initialCount && (
          <div className="mt-6 flex justify-center sm:mt-8 2xl:mt-12">
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
