import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Newspaper } from "lucide-react"
import { useBerita } from "../../../../context/BeritaContext"
import AdminBeritaCard from "./AdminBeritaCard"
import AdminBeritaDeleteModal from "./AdminBeritaDeleteModal"
import ShowMoreButton from "../../../ui/ShowMoreButton"

const INITIAL_VISIBLE = 6

function AdminBeritaList({ search, statusFilter }) {
  const navigate = useNavigate()
  const { beritaList, deleteBerita } = useBerita()
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const filterKey = `${search}|${statusFilter}`
  const [activeFilter, setActiveFilter] = useState(filterKey)
  if (filterKey !== activeFilter) {
    setActiveFilter(filterKey)
    setShowAll(false)
  }

  const filteredBerita = useMemo(() => {
    const keyword = search.toLowerCase()
    return beritaList.filter((b) => {
      const matchSearch =
        (b.title || "").toLowerCase().includes(keyword) ||
        (b.event || "").toLowerCase().includes(keyword)
      const matchStatus =
        statusFilter === "all" || (b.status || "published") === statusFilter
      return matchSearch && matchStatus
    })
  }, [beritaList, search, statusFilter])

  const visibleBerita = showAll ? filteredBerita : filteredBerita.slice(0, INITIAL_VISIBLE)

  function handlePreviewClick(berita) {
    navigate(`/berita/preview/${berita.slug}`)
  }

  function handleEditClick(berita) {
    navigate(`/berita/edit/${berita.slug}`)
  }

  function handleDeleteClick(berita) {
    setDeleteTarget(berita)
  }

  async function handleConfirmDelete() {
    if (deleteLoading) return
    setDeleteLoading(true)
    try {
      await deleteBerita(deleteTarget.id)
      setDeleteLoading(false)
      setDeleteSuccess(true)
    } catch {
      setDeleteLoading(false)
      setDeleteTarget(null)
    }
  }

  function handleCancelDelete() {
    setDeleteTarget(null)
    setDeleteLoading(false)
    setDeleteSuccess(false)
  }

  return (
    <div className="px-4 md:px-6 lg:px-8 pt-6 md:pt-8 pb-12 md:pb-16">
      <div className="flex flex-col gap-5">
        {filteredBerita.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-16 text-center">
            <Newspaper className="h-10 w-10 text-slate-500" />
            <p className="text-sm md:text-base text-slate-400">
              Belum ada berita yang cocok.
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-500">
              Menampilkan {filteredBerita.length} dari {beritaList.length} berita
            </p>
            <div className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {visibleBerita.map((berita) => (
                <AdminBeritaCard
                  key={berita.id}
                  berita={berita}
                  onEdit={handleEditClick}
                  onDeleteClick={handleDeleteClick}
                  onPreview={handlePreviewClick}
                />
              ))}
            </div>
          </>
        )}

        {filteredBerita.length > INITIAL_VISIBLE && (
          <ShowMoreButton
            label="Lihat Semua Berita"
            total={filteredBerita.length}
            showAll={showAll}
            onToggle={() => setShowAll((prev) => !prev)}
          />
        )}
      </div>

      <AdminBeritaDeleteModal
        berita={deleteTarget}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        loading={deleteLoading}
        success={deleteSuccess}
      />
    </div>
  )
}

export default AdminBeritaList
