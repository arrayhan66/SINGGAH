import { useState, useMemo } from "react"
import { FolderX } from "lucide-react"
import { dummyAdminProjects } from "../dummyAdminProjects"
import AdminProjectsFilter from "./AdminProjectsFilter"
import AdminProjectsCard from "./AdminProjectsCard"
import AdminProjectsDetailModal from "./AdminProjectsDetailModal"

function AdminProjectsList() {
  const [projects, setProjects] = useState(dummyAdminProjects)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedProject, setSelectedProject] = useState(null)

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchStatus = statusFilter === "all" || p.status === statusFilter
      const keyword = search.toLowerCase()
      const matchSearch =
        p.title.toLowerCase().includes(keyword) ||
        p.studentName.toLowerCase().includes(keyword)
      return matchStatus && matchSearch
    })
  }, [projects, statusFilter, search])

  function handleSearchChange(e) {
    setSearch(e.target.value)
  }

  function handleViewDetail(project) {
    setSelectedProject(project)
  }

  function handleCloseModal() {
    setSelectedProject(null)
  }

  function handleApprove(projectId) {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status: "approved" } : p)),
    )
    setSelectedProject(null)
  }

  function handleReject(projectId, reason) {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, status: "rejected", rejectionReason: reason }
          : p,
      ),
    )
    setSelectedProject(null)
  }

  return (
    <div className="px-6 pb-10 md:px-10">
      <div className="flex flex-col gap-5">
        <AdminProjectsFilter
          search={search}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />

        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-16 text-center">
            <FolderX className="h-10 w-10 text-slate-500" />
            <p className="text-sm md:text-base text-slate-400">
              Tidak ada project yang cocok.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {filteredProjects.map((project) => (
              <AdminProjectsCard
                key={project.id}
                project={project}
                onViewDetail={handleViewDetail}
              />
            ))}
          </div>
        )}
      </div>

      <AdminProjectsDetailModal
        project={selectedProject}
        onApprove={handleApprove}
        onReject={handleReject}
        onClose={handleCloseModal}
      />
    </div>
  )
}

export default AdminProjectsList
