import { FolderKanban, Search, Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import AdminHeroBackground from "../../../ui/AdminHeroBackground"
import AdminProjectsFilter from "./AdminProjectsFilter"
import AdminProjectsCategoryFilter from "./AdminProjectsCategoryFilter"

function AdminProjectsHero({
  stats,
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categories,
  categoryFilter,
  onCategoryChange,
}) {
  const navigate = useNavigate()

  return (
    <AdminHeroBackground fullWidth>
      <div className="px-4 md:px-6 lg:px-8 pt-8 md:pt-10">
        <div className="flex flex-col items-center text-center sm:flex-row sm:text-left gap-[clamp(0.75rem,0.5rem+1vw,1rem)] md:gap-5">
          <div className="dashboard-hero-icon flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 border border-cyan-400/30 sm:h-16 sm:w-16">
            <FolderKanban className="h-7 w-7 text-cyan-300 sm:h-8 sm:w-8" />
          </div>
          <div className="min-w-0">
            <h1 className="text-[clamp(1.25rem,0.9375rem+1.5vw,1.5rem)] font-black text-white sm:text-3xl">
              Kelola <span className="text-cyan-300">Karya</span>
            </h1>
            <p className="mt-1.5 max-w-xl text-[clamp(0.8125rem,0.75rem+0.5vw,0.875rem)] text-slate-300/90">
              Tinjau, setujui, atau tolak karya yang diunggah mahasiswa.
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-12 pb-6 md:px-6 md:pt-14 md:pb-8 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={onSearchChange}
              placeholder="Cari judul atau nama mahasiswa..."
              className="w-full rounded-xl border border-slate-200/90 bg-slate-100 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-500 shadow-lg shadow-black/20 outline-none transition-all duration-[250ms] focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>
          <button
            type="button"
            onClick={() => navigate("/projects/tambah")}
            className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-500 hover:bg-[position:100%_0]"
          >
            <Plus size={16} />
            Tambah Karya
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-2.5 md:mt-5">
          <AdminProjectsFilter
            statusFilter={statusFilter}
            onStatusChange={onStatusChange}
            counts={{ all: stats?.total ?? 0, ...stats }}
          />
          {categories?.items?.length > 0 && (
            <AdminProjectsCategoryFilter
              categories={categories}
              categoryFilter={categoryFilter}
              onCategoryChange={onCategoryChange}
            />
          )}
        </div>
      </div>
    </AdminHeroBackground>
  )
}

export default AdminProjectsHero
