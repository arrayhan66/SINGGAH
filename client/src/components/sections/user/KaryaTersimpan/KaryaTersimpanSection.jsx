import { useState, useEffect } from "react"
import { Bookmark } from "lucide-react"
import SearchBar from "../../../ui/SearchBar"
import OutlineButton from "../../../ui/OutlineButton"
import GlowBackground from "../../../ui/GlowBackground"
import DustBackground from "../../../ui/DustBackground"
import useSearchAndExpand from "../../../../hooks/useSearchAndExpand"
import KaryaTersimpanCard from "./KaryaTersimpanCard"
import { SavedKaryaPageSkeleton } from "../../../ui/PageSkeletons"
import api from "../../../../services/api"

function KaryaTersimpanSection() {
  const [initialCount, setInitialCount] = useState(6)
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/projects/my-bookmarks")
      .then((res) => {
        const data = Array.isArray(res.data.data) ? res.data.data : []
        setBookmarks(data.map((b) => b.Project).filter(Boolean))
      })
      .catch((err) => {
        console.error("Failed to fetch bookmarks:", err)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth
      if (w >= 2560) {
        setInitialCount(12)
      } else if (w >= 1920) {
        setInitialCount(10)
      } else if (w >= 1536) {
        setInitialCount(8)
      } else if (w >= 1024) {
        setInitialCount(6)
      } else {
        setInitialCount(4)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const {
    search,
    handleSearchChange,
    visibleData: visibleBookmarks,
    filteredData: filteredBookmarks,
    showAll,
    setShowAll,
  } = useSearchAndExpand(bookmarks, initialCount)

  return (
    <section className="relative overflow-hidden bg-brand-dark px-4 pt-[calc(var(--navbar-h)+24px)] pb-8 sm:px-5 sm:pt-[calc(var(--navbar-h)+32px)] sm:pb-10 md:px-8 lg:px-10 lg:pb-12 xl:px-12 3xl:px-16 4xl:px-20 4xl:pb-20">
      <GlowBackground />
      <DustBackground />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:max-w-[1280px] 3xl:max-w-[1600px] 3xl:px-10 4xl:max-w-[2000px] 4xl:px-14">
        {loading ? (
          <SavedKaryaPageSkeleton />
        ) : (
          <>
            {/* Title */}
            <div className="text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 border border-cyan-400/30 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 3xl:h-28 3xl:w-28 4xl:h-32 4xl:w-32">
                <Bookmark className="h-7 w-7 text-cyan-300 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 3xl:h-14 3xl:w-14 4xl:h-16 4xl:w-16" />
              </div>
              <h2 className="mt-2 sm:mt-3 md:mt-4 lg:mt-5 2xl:mt-6 3xl:mt-7 4xl:mt-8 text-2xl font-black text-white sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl 3xl:text-6xl 4xl:text-7xl">
                Karya <span className="text-cyan-300">Tersimpan</span>
              </h2>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8 2xl:mt-8 2xl:max-w-4xl 2xl:text-xl 2xl:leading-9 3xl:mt-10 3xl:max-w-5xl 3xl:text-2xl 3xl:leading-10 4xl:mt-12 4xl:max-w-6xl 4xl:text-3xl 4xl:leading-11">
                Koleksi karya yang kamu simpan untuk dilihat nanti.
              </p>
            </div>

            {/* Search */}
            <div className="mt-6 sm:mt-8 3xl:mt-10 4xl:mt-12">
              <SearchBar
                value={search}
                onChange={handleSearchChange}
                placeholder="Cari karya tersimpan..."
              />
            </div>

            {/* Grid */}
            <div className="mt-8 sm:mt-10 3xl:mt-14 4xl:mt-16">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6 lg:grid-cols-3 lg:gap-7 xl:gap-8 3xl:grid-cols-4 3xl:gap-9 4xl:grid-cols-5 4xl:gap-10">
                {visibleBookmarks.length > 0 ? (
                  visibleBookmarks.map((item) => (
                    <KaryaTersimpanCard key={item.id} item={item} />
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700/60 bg-slate-800/20 py-10 sm:rounded-2xl sm:py-14 md:py-16 lg:py-20 3xl:py-24 4xl:py-28">
                    <div className="mb-3 rounded-full bg-slate-800/50 p-3 ring-1 ring-slate-700/50 backdrop-blur-sm sm:mb-4 sm:p-4 3xl:mb-5 3xl:p-5 4xl:p-6">
                      <Bookmark className="h-8 w-8 text-slate-400 sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-11 lg:w-11 3xl:h-12 3xl:w-12 4xl:h-14 4xl:w-14" />
                    </div>
                    <h3 className="text-center text-lg font-bold text-slate-200 sm:text-xl 3xl:text-2xl 4xl:text-3xl">
                      {search
                        ? "Karya tidak ditemukan"
                        : "Belum ada karya tersimpan"}
                    </h3>
                    <p className="mt-2 max-w-full px-2 text-center text-xs text-slate-400 sm:max-w-sm sm:px-0 sm:text-sm md:text-base lg:text-base 3xl:mt-3 3xl:max-w-md 3xl:text-lg 4xl:text-xl">
                      {search
                        ? <>
                            Tidak ada karya yang cocok dengan{" "}
                            <span className="font-semibold text-slate-300">
                              "{search}"
                            </span>
                            . Coba gunakan istilah lain.
                          </>
                        : "Mulai jelajahi karya dan simpan yang menarik untukmu."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Load more */}
            {!showAll && filteredBookmarks.length > initialCount && (
              <div className="mt-6 flex justify-center sm:mt-8 3xl:mt-10 4xl:mt-12">
                <OutlineButton onClick={() => setShowAll(true)}>
                  Lihat Lebih Banyak
                </OutlineButton>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default KaryaTersimpanSection
