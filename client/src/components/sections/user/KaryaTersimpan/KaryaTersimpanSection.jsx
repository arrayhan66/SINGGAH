import { useState } from "react"
import { Bookmark } from "lucide-react"
import SearchBar from "../../ui/SearchBar"
import OutlineButton from "../../ui/OutlineButton"
import useSearchAndExpand from "../../../hooks/useSearchAndExpand"
import KaryaTersimpanCard from "./KaryaTersimpanCard"

const dummyBookmarks = []

function KaryaTersimpanSection() {
  const [initialCount] = useState(6)

  const {
    search,
    handleSearchChange,
    visibleData: visibleBookmarks,
    filteredData: filteredBookmarks,
    showAll,
    setShowAll,
  } = useSearchAndExpand(dummyBookmarks, initialCount)

  return (
    <section className="relative bg-brand-dark px-5 pt-28 pb-6 sm:pb-10 lg:pb-12 2xl:pb-20 md:px-12 md:pt-32">
      <div className="relative mx-auto max-w-7xl 2xl:max-w-[1440px] 2xl:px-12">
        {/* Title */}
        <div className="text-center">
          <h2 className="mt-8 text-3xl font-black text-white sm:text-4xl lg:text-5xl 2xl:text-6xl">
            Karya <span className="text-cyan-300">Tersimpan</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8 2xl:mt-8 2xl:max-w-4xl 2xl:text-xl 2xl:leading-9">
            Koleksi karya yang kamu simpan untuk dilihat nanti.
          </p>
        </div>

        {/* Search */}
        <div className="mt-8 2xl:mt-12">
          <SearchBar
            value={search}
            onChange={handleSearchChange}
            placeholder="Cari karya tersimpan..."
          />
        </div>

        {/* Grid */}
        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3 2xl:mt-20 2xl:grid-cols-4 2xl:gap-10">
          {visibleBookmarks.length > 0 ? (
            visibleBookmarks.map((item) => (
              <KaryaTersimpanCard key={item.id} item={item} />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/60 bg-slate-800/20 py-16 sm:py-24 2xl:py-32">
              <div className="mb-5 rounded-full bg-slate-800/50 p-4 ring-1 ring-slate-700/50 backdrop-blur-sm">
                <Bookmark className="h-10 w-10 text-slate-400 2xl:h-12 2xl:w-12" />
              </div>
              <h3 className="text-xl font-bold text-slate-200 2xl:text-2xl">
                {search
                  ? "Karya tidak ditemukan"
                  : "Belum ada karya tersimpan"}
              </h3>
              <p className="mt-2 max-w-md text-center text-sm text-slate-400 sm:text-base 2xl:mt-3 2xl:text-lg">
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

export default KaryaTersimpanSection
