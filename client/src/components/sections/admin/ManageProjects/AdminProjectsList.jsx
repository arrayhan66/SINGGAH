import { useState, useMemo, useCallback } from "react"
import { FolderX, Tag, FolderOpen } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useProjects } from "../../../../context/ProjectContext"
import AdminProjectsCard from "./AdminProjectsCard"
import AdminProjectApproveModal from "./AdminProjectApproveModal"
import AdminProjectRejectModal from "./AdminProjectRejectModal"
import DeleteConfirmModal from "../../../ui/DeleteConfirmModal"
import ShowMoreButton from "../../../ui/ShowMoreButton"
import api from "../../../../services/api"
import { useEffect } from "react"

function AdminProjectsList({ search, statusFilter, categoryFilter = "all" }) {
  const navigate = useNavigate()
  const { projects, approveProject, rejectProject, deleteProject, setFeaturedSlot } = useProjects()

  const [categories, setCategories] = useState([])
  const [approveModalProject, setApproveModalProject] = useState(null)
  const [rejectModalProject, setRejectModalProject] = useState(null)
  const [deleteProjectTarget, setDeleteProjectTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState(false)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    api.get("/categories").then((res) => {
      setCategories(res.data.data.items || res.data.data || [])
    }).catch(() => {})
  }, [])

  const filterKey = `${search}|${statusFilter}|${categoryFilter}`
  const [activeFilter, setActiveFilter] = useState(filterKey)
  if (filterKey !== activeFilter) {
    setActiveFilter(filterKey)
    setShowAll(false)
  }

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchStatus = statusFilter === "all" || p.status === statusFilter
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

  function handleViewDetail(project) {
    navigate(`/projects/detail/${project.slug || project.id}`)
  }

  const handleApproveClick = useCallback((project) => {
    setApproveModalProject(project)
  }, [])

  const handleRejectClick = useCallback((project) => {
    setRejectModalProject(project)
  }, [])

  const handleEditClick = useCallback((project) => {
    navigate(`/projects/edit/${project.slug || project.id}`)
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
      setDeleteSuccess(true)
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

  return (
    <div className="px-4 md:px-6 lg:px-8 pt-6 md:pt-8 pb-12 md:pb-16">
      <div className="flex flex-col gap-8 md:gap-10">
        {filteredProjects.length === 0 ? (
          <div className="animate-fade-in-up flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] py-16 text-center">
            <div className="rounded-full bg-slate-800/50 p-4 ring-1 ring-slate-700/50">
              <FolderX className="h-8 w-8 text-slate-500" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-300">
                Tidak ada project yang cocok
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {search
                  ? `Tidak ditemukan project dengan kata kunci "${search}"`
                  : "Belum ada project dengan filter ini."}
              </p>
            </div>
          </div>
        ) : (
          groupedProjects.map((group) => (
            <div key={group.id} className="flex flex-col gap-4">
              <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <FolderOpen size={15} />
                </div>
                <h3 className="text-base font-bold text-white tracking-wide">
                  {group.name} <span className="ml-1 text-xs font-normal text-slate-400">({group.projects.length})</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 min-[500px]:grid-cols-2 min-[1100px]:grid-cols-3 gap-5 md:gap-6">
                {group.projects.map((project, i) => (
                  <div key={project.id} className="h-full animate-fade-in-up" style={{ animationDelay: `${i * 30}ms` }}>
                    <AdminProjectsCard
                      project={project}
                      onViewDetail={handleViewDetail}
                      onQuickApprove={handleApproveClick}
                      onQuickReject={handleRejectClick}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteClick}
                      onSetFeatured={(p, slot) => setFeaturedSlot(p.id, slot)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))
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
          title="Hapus project ini?"
          message={`Project "${deleteProjectTarget.title}" akan dihapus permanen bersama semua data terkait (gambar, komentar, dll) dan tidak bisa dikembalikan.`}
          confirmLabel="Ya, Hapus Project"
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setDeleteProjectTarget(null)
            setDeleteLoading(false)
            setDeleteSuccess(false)
          }}
          loading={deleteLoading}
          success={deleteSuccess}
        />
      )}
    </div>
  )
}

export default AdminProjectsList
