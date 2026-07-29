import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Newspaper, Plus } from "lucide-react"
import { useBerita } from "../../../../context/BeritaContext"
import AdminBeritaCard from "./AdminBeritaCard"
import AdminBeritaDeleteModal from "./AdminBeritaDeleteModal"

function AdminBeritaList() {
  const navigate = useNavigate()
  const { beritaList, deleteBerita } = useBerita()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filteredBerita = useMemo(() => {
    const keyword = search.toLowerCase()
    return beritaList.filter((b) => {
      const matchSearch =
        b.title.toLowerCase().includes(keyword) ||
        b.event.toLowerCase().includes(keyword)
      const matchStatus =
        statusFilter === "all" || (b.status || "published") === statusFilter
      return matchSearch && matchStatus
    })
  }, [beritaList, search, statusFilter])

  function handleSearchChange(value) {
    setSearch(value)
  }

  function handleAddClick() {
    navigate("/admin/berita/tambah")
  }

  function handlePreviewClick(berita) {
    navigate(`/admin/berita/preview/${berita.id}`)
  }

  function handleEditClick(berita) {
    navigate(`/admin/berita/edit/${berita.id}`)
  }

  function handleDeleteClick(berita) {
    setDeleteTarget(berita)
  }

  function handleConfirmDelete() {
    deleteBerita(deleteTarget.id)
    setDeleteTarget(null)
  }

  function handleCancelDelete() {
    setDeleteTarget(null)
  }

  return (
    <div className="px-6 pb-10 md:px-10">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col min-[500px]:flex-row gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 rounded-xl border border-white/20 bg-white px-3.5 py-2.5">
              <Search size={16} className="text-slate-500 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Cari judul atau event..."
                className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  statusFilter === "all"
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("published")}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  statusFilter === "published"
                    ? "bg-emerald-400/20 text-emerald-300"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Published
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("draft")}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  statusFilter === "draft"
                    ? "bg-yellow-400/20 text-yellow-300"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Draft
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddClick}
              className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-500 hover:bg-[position:100%_0]"
            >
              <Plus size={16} />
              Tambah Berita
            </button>
          </div>
        </div>

        {filteredBerita.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-16 text-center">
            <Newspaper className="h-10 w-10 text-slate-500" />
            <p className="text-sm md:text-base text-slate-400">
              Belum ada berita yang cocok.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {filteredBerita.map((berita) => (
              <AdminBeritaCard
                key={berita.id}
                berita={berita}
                onEdit={handleEditClick}
                onDeleteClick={handleDeleteClick}
                onPreview={handlePreviewClick}
              />
            ))}
          </div>
        )}
      </div>

      <AdminBeritaDeleteModal
        berita={deleteTarget}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  )
}

export default AdminBeritaList
