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
  const initialCount = 6

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
      className="relative overflow-hidden bg-brand-navy min-h-screen pt-[calc(var(--navbar-h)+16px)] sm:pt-[calc(var(--navbar-h)+24px)] pb-6 sm:pb-10 lg:pb-12 3xl:pb-16 4xl:pb-20"
    >
      <GlowBackground />
      <DustBackground />

      <div className="mx-auto max-w-7xl px-4 sm:px-5 md:px-8 lg:px-10 xl:px-12 relative xl:max-w-[1280px] 3xl:max-w-[1600px] 3xl:px-14 4xl:max-w-[2000px] 4xl:px-16">
        <div className="text-center">
          <h2 className="mt-6 text-2xl font-black text-white sm:mt-8 sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl 3xl:text-6xl 4xl:text-7xl">
            Berita & <span className="text-cyan-300">Kegiatan</span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:mt-6 sm:max-w-2xl sm:text-base sm:leading-7 md:text-base lg:text-lg 3xl:mt-8 3xl:max-w-3xl 3xl:text-xl 3xl:leading-8 4xl:mt-10 4xl:max-w-4xl 4xl:text-2xl 4xl:leading-9">
            Kumpulan berita, publikasi kegiatan, dan informasi akademik civitas
            akademika terkini di platform SINGGAH.
          </p>
        </div>

        <div className="mt-6 sm:mt-8 3xl:mt-10 4xl:mt-12">
          <SearchBar
            value={search}
            onChange={handleSearchChange}
            placeholder="Cari berita atau kegiatan..."
          />
        </div>

        {/* Grid Card Berita */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 sm:mt-12 md:gap-7 lg:grid-cols-3 lg:gap-8 xl:gap-9 3xl:mt-16 3xl:grid-cols-4 3xl:gap-10 4xl:mt-20 4xl:grid-cols-5 4xl:gap-12">
          {visibleBerita.length > 0 ? (
            visibleBerita.map((item) => (
              <GlassCard
                key={item.id}
                hover
                onClick={() => navigate(`/berita/${item.slug}`)}
                className="group cursor-pointer overflow-hidden flex flex-col justify-between"
              >
                {/* Gambar Berita */}
                <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-[#0a2472]/40 to-brand-navy/60 flex-shrink-0 sm:h-48 md:h-52 lg:h-56 3xl:h-64 4xl:h-72">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Newspaper className="text-white/20" size={48} />
                    </div>
                  )}

                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-lg bg-brand-navy/80 backdrop-blur-md text-cyan-300 text-[10px] font-semibold border border-cyan-500/30 shadow-md sm:top-4 sm:left-4 sm:px-3 sm:py-1 sm:text-xs md:text-xs 3xl:text-sm 4xl:px-4 4xl:py-1.5 4xl:text-base">
                    {item.tags?.[0] || "Berita"}
                  </div>
                </div>

                {/* Konten */}
                <div className="p-4 sm:p-5 md:p-6 lg:p-7 flex flex-col flex-grow justify-between space-y-3 sm:space-y-4">
                  <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 gap-2 sm:text-xs md:text-xs lg:text-sm">
                      <div className="flex items-center gap-1.5 font-medium truncate">
                        <Calendar
                          size={11}
                          className="text-cyan-400 flex-shrink-0 sm:size-[13px] md:size-3.5 lg:size-4"
                        />
                        <span className="truncate">{item.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium truncate">
                        <User
                          size={11}
                          className="text-cyan-400 flex-shrink-0 sm:size-[13px] md:size-3.5 lg:size-4"
                        />
                        <span className="truncate">{item.source}</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug sm:text-lg md:text-xl lg:text-xl 3xl:text-2xl 4xl:text-3xl">
                      {item.title}
                    </h3>

                    <div className="inline-block px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 text-[10px] font-semibold tracking-wide border border-cyan-500/20 sm:px-2.5 sm:py-1 sm:text-xs md:text-xs 3xl:text-sm 4xl:px-3 4xl:py-1.5 4xl:text-base">
                      {item.event}
                    </div>

                    <p className="text-xs leading-relaxed text-slate-300/90 line-clamp-3 sm:text-sm md:text-sm lg:text-base 3xl:text-base 4xl:text-lg">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-700/40 flex items-center justify-between flex-shrink-0 sm:pt-4">
                    <span className="text-[10px] text-slate-400 font-medium sm:text-xs md:text-xs lg:text-sm 3xl:text-sm 4xl:text-base">
                      Selengkapnya
                    </span>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-semibold group-hover:bg-cyan-500 group-hover:text-brand-navy transition-all duration-300 shadow-sm sm:px-3.5 sm:py-2 sm:text-xs md:text-xs lg:text-sm 3xl:text-sm 4xl:px-4 4xl:py-2.5 4xl:text-base">
                      <span>Baca</span>
                      <ArrowRight
                        size={12}
                        className="transition-transform group-hover:translate-x-0.5 sm:size-[13px] md:size-3.5 lg:size-4 3xl:size-[18px] 4xl:size-5"
                      />
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/60 bg-slate-800/20 py-12 sm:py-16 md:py-20 lg:py-24 3xl:py-28 4xl:py-32">
              <div className="mb-4 rounded-full bg-slate-800/50 p-3 ring-1 ring-slate-700/50 backdrop-blur-sm sm:mb-5 sm:p-4 3xl:p-5 4xl:p-6">
                <svg
                  className="h-8 w-8 text-slate-400 sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-11 lg:w-11 3xl:h-12 3xl:w-12 4xl:h-14 4xl:w-14"
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
              <h3 className="text-lg font-bold text-slate-200 sm:text-xl 3xl:text-2xl 4xl:text-3xl">
                Berita tidak ditemukan
              </h3>
              <p className="mt-2 max-w-sm text-center text-xs text-slate-400 sm:max-w-md sm:text-sm md:text-base lg:text-base 3xl:mt-3 3xl:text-lg 4xl:text-xl">
                Maaf, kami tidak menemukan berita atau kegiatan yang cocok
                dengan kata kunci{" "}
                <span className="font-semibold text-slate-300">"{search}"</span>
                . Coba gunakan istilah lain.
              </p>
            </div>
          )}
        </div>

        {!showAll && filteredBerita.length > initialCount && (
          <div className="mt-6 flex justify-center sm:mt-8 3xl:mt-10 4xl:mt-12">
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
