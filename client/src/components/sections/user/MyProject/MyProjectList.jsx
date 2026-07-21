import { useState, useMemo } from "react"
import { FolderX } from "lucide-react"
import { dummyProjects } from "./dummyProjects"
import MyProjectFilter from "./MyProjectFilter"
import MyProjectCard from "./MyProjectCard"
import MyProjectDeleteModal from "./MyProjectDeleteModal"

const INITIAL_VISIBLE_COUNT = 6

function MyProjectList() {
  const [projects, setProjects] = useState(dummyProjects)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAll, setShowAll] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filteredData = useMemo(() => {
    return projects.filter((p) => {
      const matchStatus = statusFilter === "all" || p.status === statusFilter
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase())
      return matchStatus && matchSearch
    })
  }, [projects, statusFilter, search])

  const visibleData = showAll
    ? filteredData
    : filteredData.slice(0, INITIAL_VISIBLE_COUNT)

  function handleSearchChange(e) {
    setSearch(e.target.value)
    setShowAll(false)
  }

  function handleStatusChange(value) {
    setStatusFilter(value)
    setShowAll(false)
  }

  function handleDeleteClick(project) {
    setDeleteTarget(project)
  }

  function handleConfirmDelete() {
    setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  function handleCancelDelete() {
    setDeleteTarget(null)
  }

  return (
    <section className="relative bg-brand-dark px-4 py-8 md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <MyProjectFilter
          search={search}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
        />

        {filteredData.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-16 text-center">
            <FolderX className="h-10 w-10 text-slate-500" />
            <p className="text-sm md:text-base text-slate-400">
              Belum ada project yang cocok.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {visibleData.map((project) => (
                <MyProjectCard
                  key={project.id}
                  project={project}
                  onDeleteClick={handleDeleteClick}
                />
              ))}
            </div>

            {!showAll && visibleData.length < filteredData.length && (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="mx-auto rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-6 py-2.5 text-sm font-medium text-cyan-300 hover:bg-cyan-400/20 transition-colors"
              >
                Tampilkan Semua
              </button>
            )}
          </>
        )}
      </div>

      <MyProjectDeleteModal
        project={deleteTarget}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </section>
  )
}

export default MyProjectList
