import { useState, useMemo, useCallback } from "react"
import { FolderX, FolderOpen, AlertTriangle } from "lucide-react"
import ShowMoreButton from "../../../ui/ShowMoreButton"
import PopupToast from "../../../ui/PopupToast"
import { useNavigate } from "react-router-dom"
import { useProjects } from "../../../../context/ProjectContext"
import AdminProjectsCard from "./AdminProjectsCard"
import AdminProjectApproveModal from "./AdminProjectApproveModal"
import AdminProjectRejectModal from "./AdminProjectRejectModal"
import DeleteConfirmModal from "../../../ui/DeleteConfirmModal"
import ProjectDeletedModal from "../../../ui/ProjectDeletedModal"
import toast from "../../../../utils/toast"

function AdminProjectsList({ search, statusFilter, categoryFilter = "all" }) {
  const navigate = useNavigate()
  const { projects, approveProject, rejectProject, deleteProject, setFeaturedSlot, setSlideshowVisible } = useProjects()

  const [approveModalProject, setApproveModalProject] = useState(null)
  const [rejectModalProject, setRejectModalProject] = useState(null)
  const [deleteProjectTarget, setDeleteProjectTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deletedTitle, setDeletedTitle] = useState(null)
  const [slideshowUnpublishTarget, setSlideshowUnpublishTarget] = useState(null)
  const [expandedGroups, setExpandedGroups] = useState(() => ({}))

  const filterKey = `${search}|${statusFilter}|${categoryFilter}`
  const [activeFilter, setActiveFilter] = useState(filterKey)
  if (filterKey !== activeFilter) {
    setActiveFilter(filterKey)
    setExpandedGroups({})
  }

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Tab "Slideshow Beranda" menampilkan karya slideshow aktif lintas status/kategori.
      const matchStatus =
        statusFilter === "slideshow"
          ? p.is_shown_in_slideshow
          : statusFilter === "all" || p.status === statusFilter
      const matchCategory =
        categoryFilter === "all" ||
        String(p.category_id ?? p.Category?.id ?? "") === String(categoryFilter)
      const keyword = search.toLowerCase()
      const matchSearch =
        (p.title || "").toLowerCase().includes(keyword) ||
        (p.User?.name || "").toLowerCase().includes(keyword)
      return matchStatus && matchCategory && matchSearch
    })
  }, [projects, statusFilter, categoryFilter, search])

  // Kelompokkan project berdasarkan kategori
  const groupedProjects = useMemo(() => {
    const map = {}
    const uncategorized = []

    for (const p of filteredProjects) {
      const catId = p.category_id ?? p.Category?.id
      const catName = p.Category?.name
      if (catId && catName) {
        if (!map[catId]) {
          map[catId] = { id: catId, name: catName, slug: p.Category?.slug, projects: [] }
        }
        map[catId].projects.push(p)
      } else {
        uncategorized.push(p)
      }
    }

    const groups = Object.values(map)
    if (uncategorized.length > 0) {
      groups.push({ id: "lainnya", name: "Lainnya / Tanpa Kategori", projects: uncategorized })
    }
    return groups
  }, [filteredProjects])

  // Peta slot unggulan per PORTAL (kategori). Satu portal punya slot 1 & 2.
// Dipakai untuk memblokir slot yang sudah terisi karya lain (harus dilepas
// dulu). Hanya karya published yang dianggap mengisi slot, supaya karya yang
// di-unpublish/ditolak tidak "menyandera" slot unggulan selamanya.
  const featuredScopeKey = (p) => String(p.category_id ?? p.Category?.id ?? "")

  const featuredBySlot = useMemo(() => {
    const map = {}
    for (const p of projects) {
      const slotNum = Number(p.featured_slot)
      if (p.status === "published" && (slotNum === 1 || slotNum === 2)) {
        const key = featuredScopeKey(p)
        map[key] = map[key] || {}
        map[key][slotNum] = p
      }
    }
    return map
  }, [projects])

  const slideshowCount = useMemo(
    () => projects.filter((p) => p.is_shown_in_slideshow).length,
    [projects],
  )

  function handleViewDetail(project) {
    navigate(`/admin/karya/detail/${project.slug || project.id}`)
  }

  const handleApproveClick = useCallback((project) => {
    setApproveModalProject(project)
  }, [])

  const handleRejectClick = useCallback((project) => {
    setRejectModalProject(project)
  }, [])

  const handleEditClick = useCallback((project) => {
    navigate(`/admin/karya/edit/${project.slug || project.id}`)
  }, [navigate])

  const handleDeleteClick = useCallback((project) => {
    setDeleteProjectTarget(project)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteProjectTarget || deleteLoading) return
    setDeleteLoading(true)
    try {
      await deleteProject(deleteProjectTarget.id)
      setDeleteLoading(false)
      setDeletedTitle(deleteProjectTarget.title)
      setDeleteProjectTarget(null)
    } catch {
      setDeleteLoading(false)
      setDeleteProjectTarget(null)
    }
  }, [deleteProject, deleteProjectTarget, deleteLoading])

  const handleConfirmApprove = useCallback((projectId, note) => {
    approveProject(projectId, note)
    setApproveModalProject(null)
  }, [approveProject])

  const handleConfirmReject = useCallback((projectId, reason) => {
    rejectProject(projectId, reason)
    setRejectModalProject(null)
  }, [rejectProject])

  const doSetFeatured = useCallback(async (p, slot) => {
    try {
      await setFeaturedSlot(p.id, slot)
      toast.success(
        slot
          ? `Karya "${p.title}" berhasil ditambahkan ke unggulan slot ${slot}`
          : `Karya "${p.title}" berhasil dilepaskan dari unggulan`,
      )
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          (slot
            ? `Gagal memperbarui slot karya unggulan slot ${slot}`
            : "Gagal melepas karya dari unggulan"),
      )
    }
  }, [setFeaturedSlot])

  return (
    <div className="px-4 md:px-6 lg:px-8 pt-6 md:pt-8 pb-12 md:pb-16">
      <div className="flex flex-col gap-8 md:gap-10">
        {filteredProjects.length === 0 ? (
          <div className="admin-empty-projects animate-fade-in-up flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] py-16 text-center">
            <div className="rounded-full bg-slate-800/50 p-4 ring-1 ring-slate-700/50">
              <FolderX className="h-8 w-8 text-slate-500" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-300">
                Tidak ada karya yang cocok
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {search
                  ? `Tidak ditemukan karya dengan kata kunci "${search}"`
                  : "Belum ada karya dengan filter ini."}
              </p>
            </div>
          </div>
        ) : (
          groupedProjects.map((group) => {
            const isExpanded = Boolean(expandedGroups[group.id])
            const visibleProjects = isExpanded
              ? group.projects
              : group.projects.slice(0, 3)
            const hasMore = group.projects.length > 3

            return (
              <div key={group.id} className="flex flex-col gap-4">
                <div className="category-group-divider flex items-center gap-2.5 border-b border-white/10 pb-3">
                  <div className="category-group-icon flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
                    <FolderOpen size={15} strokeWidth={2.2} />
                  </div>
                  <h3 className="text-base font-bold text-white tracking-wide">
                    {group.name} <span className="ml-1 text-xs font-normal text-slate-400">({group.projects.length})</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 min-[530px]:grid-cols-2 min-[1100px]:grid-cols-3 gap-5 md:gap-6">
                  {visibleProjects.map((project, i) => (
                    <div key={project.id} className="h-full animate-fade-in-up" style={{ animationDelay: `${i * 30}ms` }}>
                      <AdminProjectsCard
                        project={project}
                        onViewDetail={handleViewDetail}
                        onQuickApprove={handleApproveClick}
                        onQuickReject={handleRejectClick}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        onSetFeatured={(p, slot) => {
                          // Melepas unggulan pada karya yang sedang tampil di
                          // slideshow otomatis menonaktifkannya dari slideshow.
                          if (!slot && p.is_shown_in_slideshow) {
                            setSlideshowUnpublishTarget(p)
                            return
                          }
                          doSetFeatured(p, slot)
                        }}
                        onToggleSlideshow={(p, visible) => {
                          setSlideshowVisible(p.id, visible)
                            .then(() => {
                              toast.success(
                                visible
                                  ? `Karya "${p.title}" kini tampil di slideshow beranda`
                                  : `Karya "${p.title}" tidak lagi tampil di slideshow beranda`,
                              )
                            })
                            .catch((err) => {
                              toast.error(
                                err?.response?.data?.message ||
                                  (visible
                                    ? "Gagal menampilkan karya di slideshow beranda"
                                    : "Gagal menyembunyikan karya dari slideshow beranda"),
                              )
                            })
                        }}
                        featuredBySlot={featuredBySlot}
                        slideshowCount={slideshowCount}
                      />
                    </div>
                  ))}
                </div>

                {hasMore && (
                  <ShowMoreButton
                    label="Lihat Semua"
                    total={group.projects.length}
                    showAll={isExpanded}
                    onToggle={() =>
                      setExpandedGroups((prev) => ({
                        ...prev,
                        [group.id]: !isExpanded,
                      }))
                    }
                  />
                )}
              </div>
            )
          })
        )}
      </div>

      {approveModalProject && (
        <AdminProjectApproveModal
          project={approveModalProject}
          onConfirm={handleConfirmApprove}
          onCancel={() => setApproveModalProject(null)}
        />
      )}

      {rejectModalProject && (
        <AdminProjectRejectModal
          project={rejectModalProject}
          onConfirm={handleConfirmReject}
          onCancel={() => setRejectModalProject(null)}
        />
      )}

      {deleteProjectTarget && (
        <DeleteConfirmModal
          title="Hapus karya ini?"
          message={`Karya "${deleteProjectTarget.title}" akan dihapus permanen bersama semua data terkait (gambar, komentar, dll) dan tidak bisa dikembalikan.`}
          confirmLabel="Ya, Hapus Karya"
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setDeleteProjectTarget(null)
            setDeleteLoading(false)
          }}
          loading={deleteLoading}
        />
      )}

      <ProjectDeletedModal
        isOpen={!!deletedTitle}
        karyaTitle={deletedTitle || ""}
        redirectPath="/admin/karya"
        onClose={() => setDeletedTitle(null)}
      />

      {slideshowUnpublishTarget && (
        <PopupToast
          show
          variant="danger"
          position="center"
          onClose={() => setSlideshowUnpublishTarget(null)}
        >
          <div className="px-4 py-3.5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="pt-1 text-sm font-semibold text-white">Nonaktifkan slideshow?</h3>
                <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">
                  Karya <span className="font-medium text-slate-200">"{slideshowUnpublishTarget.title}"</span> sedang aktif di slideshow beranda. Melepas status unggulan otomatis akan menonaktifkan tampilnya di slideshow. Lanjutkan?
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setSlideshowUnpublishTarget(null)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  doSetFeatured(slideshowUnpublishTarget, null)
                  setSlideshowUnpublishTarget(null)
                }}
                className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600 cursor-pointer"
              >
                Ya, Lepas
              </button>
            </div>
          </div>
        </PopupToast>
      )}
    </div>
  )
}

export default AdminProjectsList
