import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Newspaper, Plus } from "lucide-react"
import { useBerita } from "../../../../context/BeritaContext"
import SearchBar from "../../../ui/SearchBar"
import AdminBeritaCard from "./AdminBeritaCard"
import AdminBeritaDeleteModal from "./AdminBeritaDeleteModal"

function AdminBeritaList() {
  const navigate = useNavigate()
  const { beritaList, deleteBerita } = useBerita()
  const [search, setSearch] = useState("")
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filteredBerita = useMemo(() => {
    const keyword = search.toLowerCase()
    return beritaList.filter(
      (b) =>
        b.title.toLowerCase().includes(keyword) ||
        b.event.toLowerCase().includes(keyword),
    )
  }, [beritaList, search])

  function handleSearchChange(e) {
    setSearch(e.target.value)
  }

  function handleAddClick() {
    navigate("/admin/berita/tambah")
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
            <SearchBar
              value={search}
              onChange={handleSearchChange}
              placeholder="Cari judul atau event..."
            />
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
