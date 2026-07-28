import { useNavigate } from "react-router-dom"
import DustBackground from "../../ui/DustBackground"
import GlowBackground from "../../ui/GlowBackground"
import useSearchAndExpand from "../../../hooks/useSearchAndExpand"
import SearchBar from "../../ui/SearchBar"
import OutlineButton from "../../ui/OutlineButton"
import KaryaCategoryCard from "./KaryaCategoryCard"
import { karyaCategories } from "../../../data/karyaData"

function KaryaSection() {
  const navigate = useNavigate()
  const initialCount = 6

  const {
    search,
    handleSearchChange,
    visibleData: visibleCategories,
    filteredData: filteredCategories,
    showAll,
    setShowAll,
  } = useSearchAndExpand(karyaCategories, initialCount)

  function handleCategoryClick(slug) {
    navigate(`/karya/${slug}`)
  }

  return (
    <section
      id="karya"
      className="relative overflow-hidden bg-brand-navy min-h-screen pt-[calc(var(--navbar-h)+16px)] sm:pt-[calc(var(--navbar-h)+24px)] pb-6 sm:pb-10 lg:pb-12 3xl:pb-16 4xl:pb-20"
    >
      <GlowBackground />
      <DustBackground />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 relative 2xl:max-w-[1440px] 2xl:px-12 3xl:max-w-[1800px] 3xl:px-16 4xl:max-w-[2200px] 4xl:px-20">
        <div className="text-center">
          <h2 className="mt-8 text-3xl font-black text-white sm:text-4xl lg:text-5xl 2xl:text-6xl 3xl:text-7xl 4xl:text-8xl">
            Karya <span className="text-cyan-300">SinggaH</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8 2xl:mt-8 2xl:max-w-4xl 2xl:text-xl 2xl:leading-9 3xl:mt-10 3xl:max-w-5xl 3xl:text-2xl 3xl:leading-10 4xl:mt-12 4xl:max-w-6xl 4xl:text-3xl 4xl:leading-11">
            Jelajahi seluruh karya mahasiswa Teknik Elektro Politeknik Negeri
            Banjarmasin.
          </p>
        </div>

        <div className="mt-8 2xl:mt-12 3xl:mt-14 4xl:mt-16">
          <SearchBar
            value={search}
            onChange={handleSearchChange}
            placeholder="Cari kategori..."
          />
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3 2xl:mt-20 2xl:gap-10 3xl:mt-24 3xl:gap-12 4xl:mt-28 4xl:gap-14">
          {visibleCategories.length > 0 ? (
            visibleCategories.map((item) => (
              <KaryaCategoryCard
                key={item.slug}
                item={item}
                onClick={() => handleCategoryClick(item.slug)}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/60 bg-slate-800/20 py-16 sm:py-24 2xl:py-32 3xl:py-40 4xl:py-48">
              <div className="mb-5 rounded-full bg-slate-800/50 p-4 ring-1 ring-slate-700/50 backdrop-blur-sm 3xl:p-6 4xl:p-8">
                <svg
                  className="h-10 w-10 text-slate-400 2xl:h-12 2xl:w-12 3xl:h-14 3xl:w-14 4xl:h-16 4xl:w-16"
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
              <h3 className="text-xl font-bold text-slate-200 2xl:text-2xl 3xl:text-3xl 4xl:text-4xl">
                Kategori tidak ditemukan
              </h3>
              <p className="mt-2 max-w-md text-center text-sm text-slate-400 sm:text-base 2xl:mt-3 2xl:text-lg 3xl:text-xl 4xl:text-2xl">
                Maaf, kami tidak menemukan kategori yang cocok dengan kata kunci{" "}
                <span className="font-semibold text-slate-300">&quot;{search}&quot;</span>
                . Coba gunakan istilah lain.
              </p>
            </div>
          )}
        </div>

        {!showAll && filteredCategories.length > initialCount && (
          <div className="mt-6 flex justify-center sm:mt-8 2xl:mt-12 3xl:mt-16 4xl:mt-20">
            <OutlineButton onClick={() => setShowAll(true)}>
              Lihat Lebih Banyak
            </OutlineButton>
          </div>
        )}
      </div>
    </section>
  )
}

export default KaryaSection
