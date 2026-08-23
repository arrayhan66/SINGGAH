// LIGHT MODE - versi pembanding skripsi, terpisah dari dark mode
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Library,
  Globe,
  Smartphone,
  Cpu,
  Brain,
  Database,
  ShieldCheck,
  Layout,
  Gamepad2,
  Layers,
} from "lucide-react"
import SearchBar from "../ui/SearchBar"
import api from "../../services/api"

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

const ICON_MAP = {
  website: Globe,
  "mobile-app": Smartphone,
  iot: Cpu,
  "artificial-intelligence": Brain,
  "data-science": Database,
  "cyber-security": ShieldCheck,
  "ui-ux-design": Layout,
  "game-development": Gamepad2,
}

function LightModeKaryaSection() {
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

  const [search, setSearch] = useState("")
  const [showAll, setShowAll] = useState(false)

  const filteredCategories = categories.filter((item) =>
    (item.name || "").toLowerCase().includes(search.toLowerCase()),
  )
  const visibleCategories = showAll
    ? filteredCategories
    : filteredCategories.slice(0, initialCount)

  function handleCategoryClick(slug) {
    navigate(`/light-mode/karya/${slug}`)
  }

  return (
    <section
      id="karya"
      className="relative min-h-screen overflow-hidden bg-paper pt-[calc(var(--navbar-h)+24px)] sm:pt-[calc(var(--navbar-h)+32px)] pb-6 sm:pb-10 lg:pb-12 3xl:pb-16 4xl:pb-20"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(#2E6FF2 0.75px, transparent 0.75px)`,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 2xl:max-w-[1440px] 2xl:px-12 3xl:max-w-[1800px] 3xl:px-16 4xl:max-w-[2200px] 4xl:px-20">
        <div className="text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 3xl:h-28 3xl:w-28 4xl:h-32 4xl:w-32">
            <Library className="h-7 w-7 text-blue-600 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 3xl:h-14 3xl:w-14 4xl:h-16 4xl:w-16" />
          </div>
          <h2 className="mt-2 sm:mt-3 md:mt-4 lg:mt-5 2xl:mt-6 3xl:mt-7 4xl:mt-8 text-3xl font-black text-navy-ink sm:text-4xl lg:text-5xl 2xl:text-6xl 3xl:text-7xl 4xl:text-8xl">
            Karya <span className="text-blue-600">SinggaH</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg sm:leading-8 2xl:mt-8 2xl:max-w-4xl 2xl:text-xl 2xl:leading-9 3xl:mt-10 3xl:max-w-5xl 3xl:text-2xl 3xl:leading-10 4xl:mt-12 4xl:max-w-6xl 4xl:text-3xl 4xl:leading-11">
            Jelajahi seluruh karya mahasiswa Teknik Elektro Politeknik Negeri
            Banjarmasin.
          </p>
        </div>

        <div className="mt-8 2xl:mt-12 3xl:mt-14 4xl:mt-16 [&>div]:mt-0">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Cari kategori..."
          />
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3 2xl:mt-20 2xl:gap-10 3xl:mt-24 3xl:gap-12 4xl:mt-28 4xl:gap-14">
          {visibleCategories.length > 0 ? (
            visibleCategories.map((item) => {
              const IconComponent = ICON_MAP[item.slug] || Layers
              return (
                <div
                  key={item.slug}
                  className="group flex h-full flex-col rounded-3xl border border-paper-border bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-3 hover:border-blue-200 hover:shadow-md sm:p-8 2xl:p-10 3xl:p-12 4xl:p-14"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-400 text-white shadow-lg shadow-blue-500/20 transition group-hover:scale-110 sm:h-20 sm:w-20 2xl:h-24 2xl:w-24 3xl:h-28 3xl:w-28 4xl:h-32 4xl:w-32">
                      <IconComponent size={36} className="sm:size-9 2xl:size-11 3xl:size-12 4xl:size-14" />
                    </div>

                    {typeof item.projectCount === "number" && (
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 sm:text-sm 2xl:text-base 3xl:text-lg 4xl:text-xl">
                        {item.projectCount} Karya
                      </span>
                    )}
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-navy-ink sm:mt-8 sm:text-2xl 2xl:mt-10 2xl:text-3xl 3xl:mt-12 3xl:text-4xl 4xl:mt-14 4xl:text-5xl">
                    {item.title || item.name || ""}
                  </h3>

                  <p className="mt-4 leading-7 text-gray-500 2xl:mt-5 2xl:text-lg 2xl:leading-8 3xl:mt-6 3xl:text-xl 3xl:leading-9 4xl:mt-7 4xl:text-2xl 4xl:leading-10">
                    {item.description || item.desc || ""}
                  </p>

                  <div className="mt-auto pt-8 2xl:pt-10 3xl:pt-12 4xl:pt-14">
                    <button
                      onClick={() => handleCategoryClick(item.slug)}
                      className="w-fit cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 font-semibold text-white shadow-md shadow-blue-500/20 transition-all duration-300 hover:from-blue-700 hover:to-cyan-600 hover:shadow-lg hover:shadow-blue-500/30 2xl:px-6 2xl:py-4 2xl:text-lg 3xl:px-8 3xl:py-5 3xl:text-xl 4xl:px-10 4xl:py-6 4xl:text-2xl"
                    >
                      Lihat Karya
                    </button>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 sm:py-24 2xl:py-32 3xl:py-40 4xl:py-48">
              <div className="mb-5 rounded-full bg-white p-4 ring-1 ring-slate-200 3xl:p-6 4xl:p-8">
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
              <h3 className="text-xl font-bold text-navy-ink 2xl:text-2xl 3xl:text-3xl 4xl:text-4xl">
                Kategori tidak ditemukan
              </h3>
              <p className="mt-2 max-w-md text-center text-sm text-gray-500 sm:text-base 2xl:mt-3 2xl:text-lg 3xl:text-xl 4xl:text-2xl">
                Maaf, kami tidak menemukan kategori yang cocok dengan kata kunci{" "}
                <span className="font-semibold text-navy-ink">&quot;{search}&quot;</span>
                . Coba gunakan istilah lain.
              </p>
            </div>
          )}
        </div>

        {!showAll && filteredCategories.length > initialCount && (
          <div className="mt-6 flex justify-center sm:mt-8 2xl:mt-12 3xl:mt-16 4xl:mt-20">
            <button
              onClick={() => setShowAll(true)}
              className="cursor-pointer rounded-xl border border-blue-200 bg-blue-50 px-5 py-2.5 text-xs font-semibold text-blue-600 transition duration-300 hover:bg-blue-100 sm:rounded-2xl sm:px-6 sm:py-3 sm:text-sm md:px-7 md:py-3.5 md:text-sm lg:text-base 3xl:px-8 3xl:py-4 3xl:text-base 4xl:px-10 4xl:py-5 4xl:text-lg"
            >
              Lihat Lebih Banyak
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default LightModeKaryaSection
