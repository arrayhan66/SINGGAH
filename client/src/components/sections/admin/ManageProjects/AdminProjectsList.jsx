import { useState, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { FolderX, Plus, Search } from "lucide-react"
import { useProjects } from "../../../../context/ProjectContext"
import AdminProjectsFilter from "./AdminProjectsFilter"
import AdminProjectsCard from "./AdminProjectsCard"
import AdminProjectsDetailModal from "./AdminProjectsDetailModal"
import AdminProjectApproveModal from "./AdminProjectApproveModal"
import AdminProjectRejectModal from "./AdminProjectRejectModal"

function AdminProjectsList() {
  const navigate = useNavigate()
  const { projects, approveProject, rejectProject } = useProjects()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedProject, setSelectedProject] = useState(null)
  const [approveModalProject, setApproveModalProject] = useState(null)
  const [rejectModalProject, setRejectModalProject] = useState(null)

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchStatus = statusFilter === "all" || p.status === statusFilter
      const keyword = search.toLowerCase()
      const matchSearch =
        p.title.toLowerCase().includes(keyword) ||
        (p.User?.name || "").toLowerCase().includes(keyword)
      return matchStatus && matchSearch
    })
  }, [projects, statusFilter, search])

  const tabCounts = useMemo(() => {
    const pending = projects.filter((p) => p.status === "pending").length
    const approved = projects.filter((p) => p.status === "approved").length
    const rejected = projects.filter((p) => p.status === "rejected").length
    return { all: projects.length, pending, approved, rejected }
  }, [projects])

  function handleSearchChange(e) {
    setSearch(e.target.value)
  }

  function handleAddClick() {
    navigate("/admin/projects/tambah")
  }

  function handleViewDetail(project) {
    setSelectedProject(project)
  }

  function handleCloseModal() {
    setSelectedProject(null)
  }

  const handleApproveClick = useCallback((project) => {
    setApproveModalProject(project)
  }, [])

  const handleRejectClick = useCallback((project) => {
    setRejectModalProject(project)
  }, [])

  const handleConfirmApprove = useCallback((projectId, note) => {
    approveProject(projectId, note)
    setApproveModalProject(null)
    setSelectedProject(null)
  }, [approveProject])

  const handleConfirmReject = useCallback((projectId, reason) => {
    rejectProject(projectId, reason)
    setRejectModalProject(null)
    setSelectedProject(null)
  }, [rejectProject])

  return (
    <div className="px-4 md:px-6 lg:px-8 pb-12">
      <div className="flex flex-col gap-5 md:gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Cari judul atau nama mahasiswa..."
              className="w-full rounded-xl border border-white/10 bg-slate-800/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 focus:outline-none transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={handleAddClick}
            className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-500 hover:bg-[position:100%_0]"
          >
            <Plus size={16} />
            Tambah Project
          </button>
        </div>

        <AdminProjectsFilter
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          counts={tabCounts}
        />

        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-700/60 bg-slate-800/20 py-16 text-center">
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
                  : "Belum ada project dengan status ini."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {filteredProjects.map((project) => (
              <AdminProjectsCard
                key={project.id}
                project={project}
                onViewDetail={handleViewDetail}
                onQuickApprove={handleApproveClick}
                onQuickReject={handleRejectClick}
              />
            ))}
          </div>
        )}
      </div>

      <AdminProjectsDetailModal
        project={selectedProject}
        onApproveClick={handleApproveClick}
        onRejectClick={handleRejectClick}
        onClose={handleCloseModal}
      />

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
    </div>
  )
}

export default AdminProjectsList
