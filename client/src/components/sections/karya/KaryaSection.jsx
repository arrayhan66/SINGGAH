import { useNavigate } from "react-router-dom"
import DustBackground from "../../ui/DustBackground"
import GlowBackground from "../../ui/GlowBackground"
import useSearchAndExpand from "../../../hooks/useSearchAndExpand"
import SearchBar from "../../ui/SearchBar"
import OutlineButton from "../../ui/OutlineButton"
import KaryaCategoryCard from "./KaryaCategoryCard"
import { karyaCategories } from "../../../data/karyaData"

const INITIAL_COUNT = 6

function KaryaSection() {
  const navigate = useNavigate()
  const {
    search,
    handleSearchChange,
    visibleData: visibleCategories,
    filteredData: filteredCategories,
    showAll,
    setShowAll,
  } = useSearchAndExpand(karyaCategories, INITIAL_COUNT)

  function handleCategoryClick(slug) {
    navigate(`/karya/${slug}`)
  }

  return (
    <section
      id="karya"
      className="relative overflow-hidden bg-brand-navy pt-12 pb-6 sm:pt-20 sm:pb-10 lg:pt-28 lg:pb-12"
    >
      <GlowBackground />
      <DustBackground />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 relative mt-10">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-black text-white sm:text-4xl lg:text-5xl">
            Karya <span className="text-cyan-300">SinggaH</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            Jelajahi seluruh karya mahasiswa Teknik Elektro Politeknik Negeri
            Banjarmasin.
          </p>
        </div>

        <SearchBar
          value={search}
          onChange={handleSearchChange}
          placeholder="Cari kategori..."
        />

        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {visibleCategories.length > 0 ? (
            visibleCategories.map((item) => (
              <KaryaCategoryCard
                key={item.slug}
                item={item}
                onClick={() => handleCategoryClick(item.slug)}
              />
            ))
          ) : (
            <p className="col-span-full text-center text-slate-400">
              Kategori tidak ditemukan.
            </p>
          )}
        </div>

        {!showAll && filteredCategories.length > INITIAL_COUNT && (
          <div className="mt-6 flex justify-center sm:mt-8">
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
