import { useState, useMemo } from "react"
import GlowBackground from "../../../ui/GlowBackground"
import DustBackground from "../../../ui/DustBackground"
import MyProjectHero from "./MyProjectHero"
import MyProjectStats from "./MyProjectStats"
import MyProjectFilter from "./MyProjectFilter"
import MyProjectCard from "./MyProjectCard"
import MyProjectDeleteModal from "./MyProjectDeleteModal"
import { dummyProjects } from "./dummyProjects"
import { FolderX } from "lucide-react"
import OutlineButton from "../../../ui/OutlineButton"

const INITIAL_VISIBLE_COUNT = 6

function MyProjectSection() {
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

  const stats = useMemo(() => ({
    total: projects.length,
    pending: projects.filter((p) => p.status === "pending").length,
    published: projects.filter((p) => p.status === "published").length,
    rejected: projects.filter((p) => p.status === "rejected").length,
  }), [projects])

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
    <section
      id="my-project"
      className="relative overflow-hidden bg-brand-navy min-h-screen pt-[calc(var(--navbar-h)+16px)] sm:pt-[calc(var(--navbar-h)+24px)] pb-6 sm:pb-10 lg:pb-12 3xl:pb-16 4xl:pb-20"
    >
      <GlowBackground />
      <DustBackground />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 relative 2xl:max-w-[1440px] 2xl:px-12 3xl:max-w-[1800px] 3xl:px-16 4xl:max-w-[2200px] 4xl:px-20">
        <MyProjectHero />

        <MyProjectStats stats={stats} />

        <div className="mt-8 2xl:mt-12 3xl:mt-14 4xl:mt-16">
          <MyProjectFilter
            search={search}
            onSearchChange={handleSearchChange}
            statusFilter={statusFilter}
            onStatusChange={handleStatusChange}
          />
        </div>

        {filteredData.length === 0 ? (
          <div className="mt-14 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/60 bg-slate-800/20 py-16 sm:mt-20 sm:py-24 2xl:mt-24 2xl:py-32 3xl:mt-28 3xl:py-40 4xl:mt-32 4xl:py-48">
            <div className="mb-5 rounded-full bg-slate-800/50 p-4 ring-1 ring-slate-700/50 backdrop-blur-sm 3xl:p-6 4xl:p-8">
              <FolderX className="h-10 w-10 text-slate-400 2xl:h-12 2xl:w-12 3xl:h-14 3xl:w-14 4xl:h-16 4xl:w-16" />
            </div>
            <h3 className="text-xl font-bold text-slate-200 2xl:text-2xl 3xl:text-3xl 4xl:text-4xl">
              Belum ada project
            </h3>
            <p className="mt-2 max-w-md text-center text-sm text-slate-400 sm:text-base 2xl:mt-3 2xl:text-lg 3xl:text-xl 4xl:text-2xl">
              Kamu belum memiliki project. Mulai upload project pertamamu sekarang!
            </p>
          </div>
        ) : (
          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3 2xl:mt-20 2xl:gap-10 3xl:mt-24 3xl:gap-12 4xl:mt-28 4xl:gap-14">
            {visibleData.map((project) => (
              <MyProjectCard
                key={project.id}
                project={project}
                onDeleteClick={handleDeleteClick}
              />
            ))}
          </div>
        )}

        {!showAll && visibleData.length < filteredData.length && (
          <div className="mt-6 flex justify-center sm:mt-8 2xl:mt-12 3xl:mt-16 4xl:mt-20">
            <OutlineButton onClick={() => setShowAll(true)}>
              Tampilkan Semua
            </OutlineButton>
          </div>
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

export default MyProjectSection
