import { useNavigate } from "react-router-dom"
import { Newspaper, Search, Plus } from "lucide-react"
import AdminHeroBackground from "../../../ui/AdminHeroBackground"

function AdminBeritaHero({ search, onSearchChange, statusFilter, onStatusChange }) {
  const navigate = useNavigate()

  const filterTabs = [
    { value: "all", label: "Semua" },
    { value: "published", label: "Published" },
    { value: "draft", label: "Draft" },
  ]

  const activeStyles = {
    all: "bg-white/10 text-white",
    published: "bg-emerald-400/20 text-emerald-300",
    draft: "bg-yellow-400/20 text-yellow-300",
  }

  return (
    <AdminHeroBackground fullWidth>
      <div className="px-4 md:px-6 lg:px-8 pt-8 md:pt-10">
        <div className="flex flex-col items-center text-center sm:flex-row sm:text-left gap-[clamp(0.75rem,0.5rem+1vw,1rem)]">
          <div className="flex h-[clamp(2.75rem,2.25rem+2vw,3.5rem)] w-[clamp(2.75rem,2.25rem+2vw,3.5rem)] shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 border border-cyan-400/30 sm:h-16 sm:w-16">
            <Newspaper className="h-[clamp(1.375rem,1.25rem+0.6vw,1.75rem)] w-[clamp(1.375rem,1.25rem+0.6vw,1.75rem)] text-cyan-300 sm:h-8 sm:w-8" />
          </div>
          <div className="min-w-0">
            <h1 className="text-[clamp(1.25rem,0.9375rem+1.5vw,1.5rem)] sm:text-3xl font-black text-white">
              Kelola <span className="text-cyan-300">Berita</span>
            </h1>
            <p className="mt-1 text-[clamp(0.8125rem,0.75rem+0.5vw,0.875rem)] text-slate-400 max-w-xl">
              Tambah, ubah, atau hapus berita dan pencapaian SINGGAH.
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 lg:px-8 pt-6 md:pt-7 pb-6 md:pb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={onSearchChange}
              placeholder="Cari judul atau event..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none shadow-sm focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <button
            type="button"
            onClick={() => navigate("/berita/tambah")}
            className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-500 hover:bg-[position:100%_0]"
          >
            <Plus size={16} />
            Tambah Berita
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => onStatusChange(tab.value)}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  statusFilter === tab.value
                    ? activeStyles[tab.value]
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AdminHeroBackground>
  )
}

export default AdminBeritaHero