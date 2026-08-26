import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Library } from "lucide-react"
import DustBackground from "../../ui/DustBackground"
import GlowBackground from "../../ui/GlowBackground"
import PCBBackground from "../../ui/PCBBackground"
import useSearchAndExpand from "../../../hooks/useSearchAndExpand"
import SearchBar from "../../ui/SearchBar"
import OutlineButton from "../../ui/OutlineButton"
import KaryaCategoryCard from "./KaryaCategoryCard"
import api from "../../../services/api"

const DEFAULT_CATEGORIES = [
  { name: "Website", slug: "website", description: "Situs web modern dan responsif.", color: "#3b82f6" },
  { name: "Mobile App", slug: "mobile-app", description: "Aplikasi Android & iOS.", color: "#a78bfa" },
  { name: "IoT", slug: "iot", description: "Perangkat pintar dan sistem otomatis.", color: "#06b6d4" },
  { name: "Artificial Intelligence", slug: "artificial-intelligence", description: "Kecerdasan buatan untuk solusi nyata.", color: "#ec4899" },
  { name: "Data Science", slug: "data-science", description: "Analisis data dan visualisasi.", color: "#34d399" },
  { name: "Cyber Security", slug: "cyber-security", description: "Keamanan jaringan dan sistem.", color: "#fbbf24" },
  { name: "UI/UX Design", slug: "ui-ux-design", description: "Desain antarmuka dan pengalaman pengguna.", color: "#fb7185" },
  { name: "Game Development", slug: "game-development", description: "Pengembangan game 2D/3D.", color: "#a855f7" },
]

function KaryaSection() {
  const navigate = useNavigate()
  const initialCount = 6
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)

  useEffect(() => {
    api.get("/categories")
      .then((res) => {
        const items = res.data.data.items || res.data.data || []
        if (items.length > 0) setCategories(items)
      })
      .catch((err) => {
        console.error("Failed to fetch categories, using fallback:", err)
      })
  }, [])

  const {
    search,
    handleSearchChange,
    visibleData: visibleCategories,
    filteredData: filteredCategories,
    showAll,
    setShowAll,
  } = useSearchAndExpand(categories, initialCount)

  function handleCategoryClick(slug) {
    navigate(`/karya/${slug}`)
  }

  return (
    <section
      id="karya"
      className="relative overflow-hidden bg-brand-dark min-h-screen pt-[calc(var(--navbar-h)+24px)] sm:pt-[calc(var(--navbar-h)+32px)] pb-6 sm:pb-10 lg:pb-12 3xl:pb-16 4xl:pb-20"
    >
      <GlowBackground />
      <PCBBackground />
      <DustBackground />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 relative 2xl:max-w-[1440px] 2xl:px-12 3xl:max-w-[1800px] 3xl:px-16 4xl:max-w-[2200px] 4xl:px-20">
        <div className="text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 border border-cyan-400/30 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 3xl:h-28 3xl:w-28 4xl:h-32 4xl:w-32">
            <Library className="h-7 w-7 text-cyan-300 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 3xl:h-14 3xl:w-14 4xl:h-16 4xl:w-16" />
          </div>
          <h2 className="mt-2 sm:mt-3 md:mt-4 lg:mt-5 2xl:mt-6 3xl:mt-7 4xl:mt-8 text-3xl font-black text-white sm:text-4xl lg:text-5xl 2xl:text-6xl 3xl:text-7xl 4xl:text-8xl">
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
            <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/60 bg-slate-800/20 px-4 py-12 text-center sm:px-6 sm:py-16 md:py-20 lg:py-24 3xl:py-28 4xl:py-32">
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
              <h3 className="text-center text-lg font-bold text-slate-200 sm:text-xl 3xl:text-2xl 4xl:text-3xl">
                Kategori tidak ditemukan
              </h3>
              <p className="mt-2 max-w-sm text-center text-xs text-slate-400 sm:max-w-md sm:text-sm md:text-base lg:text-base 3xl:mt-3 3xl:text-lg 4xl:text-xl">
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
