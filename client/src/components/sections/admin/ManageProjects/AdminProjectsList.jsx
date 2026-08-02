import { useState, useMemo, useCallback } from "react"
import { FolderX } from "lucide-react"
import { useProjects } from "../../../../context/ProjectContext"
import AdminProjectsCard from "./AdminProjectsCard"
import AdminProjectsDetailModal from "./AdminProjectsDetailModal"
import AdminProjectApproveModal from "./AdminProjectApproveModal"
import AdminProjectRejectModal from "./AdminProjectRejectModal"
import ShowMoreButton from "../../../ui/ShowMoreButton"

const INITIAL_VISIBLE = 6

function AdminProjectsList({ search, statusFilter }) {
  const { projects, approveProject, rejectProject } = useProjects()

  const [selectedProject, setSelectedProject] = useState(null)
  const [approveModalProject, setApproveModalProject] = useState(null)
  const [rejectModalProject, setRejectModalProject] = useState(null)
  const [showAll, setShowAll] = useState(false)

  const filterKey = `${search}|${statusFilter}`
  const [activeFilter, setActiveFilter] = useState(filterKey)
  if (filterKey !== activeFilter) {
    setActiveFilter(filterKey)
    setShowAll(false)
  }

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

  const visibleProjects = showAll ? filteredProjects : filteredProjects.slice(0, INITIAL_VISIBLE)

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
    <div className="px-4 md:px-6 lg:px-8 pt-6 md:pt-8 pb-12 md:pb-16">
      <div className="flex flex-col gap-5 md:gap-6">
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
                  : "Belum ada project dengan status ini."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 min-[500px]:grid-cols-2 min-[1100px]:grid-cols-3 gap-5 md:gap-6">
            {visibleProjects.map((project, i) => (
              <div key={project.id} className="h-full animate-fade-in-up" style={{ animationDelay: `${i * 30}ms` }}>
                <AdminProjectsCard
                  project={project}
                  onViewDetail={handleViewDetail}
                  onQuickApprove={handleApproveClick}
                  onQuickReject={handleRejectClick}
                />
              </div>
            ))}
          </div>
        )}

        {filteredProjects.length > INITIAL_VISIBLE && (
          <ShowMoreButton
            label="Lihat Semua Project"
            total={filteredProjects.length}
            showAll={showAll}
            onToggle={() => setShowAll((prev) => !prev)}
          />
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
