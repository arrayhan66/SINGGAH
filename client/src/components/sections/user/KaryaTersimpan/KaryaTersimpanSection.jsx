import { useState, useEffect } from "react"
import { Bookmark } from "lucide-react"
import SearchBar from "../../../ui/SearchBar"
import OutlineButton from "../../../ui/OutlineButton"
import useSearchAndExpand from "../../../../hooks/useSearchAndExpand"
import KaryaTersimpanCard from "./KaryaTersimpanCard"

const dummyBookmarks = []

function KaryaTersimpanSection() {
  const [initialCount, setInitialCount] = useState(6)

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
  } = useSearchAndExpand(dummyBookmarks, initialCount)

  return (
    <section className="relative bg-brand-dark px-4 pt-24 pb-8 sm:px-5 sm:pt-28 sm:pb-10 md:px-8 md:pt-32 lg:px-10 lg:pb-12 xl:px-12 3xl:px-16 4xl:px-20 4xl:pb-20">
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 xl:max-w-[1280px] 3xl:max-w-[1600px] 3xl:px-10 4xl:max-w-[2000px] 4xl:px-14">
        {/* Title */}
        <div className="text-center">
          <h2 className="mt-6 text-2xl font-black text-white sm:mt-8 sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl 3xl:text-6xl 4xl:text-7xl">
            Karya <span className="text-cyan-300">Tersimpan</span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:mt-6 sm:max-w-2xl sm:text-base sm:leading-7 md:text-base lg:text-lg 3xl:mt-8 3xl:max-w-3xl 3xl:text-xl 3xl:leading-8 4xl:mt-10 4xl:max-w-4xl 4xl:text-2xl 4xl:leading-9">
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
        <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 md:gap-6 lg:grid-cols-3 lg:gap-7 xl:gap-8 3xl:mt-14 3xl:grid-cols-4 3xl:gap-9 4xl:mt-16 4xl:grid-cols-5 4xl:gap-10">
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

        {/* Load more */}
        {!showAll && filteredBookmarks.length > initialCount && (
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

export default KaryaTersimpanSection
