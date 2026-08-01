import { useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import AdminLayout from "../../../layouts/AdminLayout"
import AdminProjectsHero from "../../../components/sections/admin/ManageProjects/AdminProjectsHero"
import AdminProjectsList from "../../../components/sections/admin/ManageProjects/AdminProjectsList"
import { useProjects } from "../../../context/ProjectContext"

const VALID_STATUSES = ["all", "pending", "approved", "rejected"]

function AdminProjects() {
  const { projects } = useProjects()

  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState("")

  const statusParam = searchParams.get("status")
  const statusFilter = VALID_STATUSES.includes(statusParam) ? statusParam : "all"

  const handleStatusChange = (value) => {
    const next = new URLSearchParams(searchParams)
    if (value === "all") {
      next.delete("status")
    } else {
      next.set("status", value)
    }
    setSearchParams(next, { replace: true })
  }

  const stats = useMemo(() => {
    const total = projects.length
    const pending = projects.filter((p) => p.status === "pending").length
    const approved = projects.filter((p) => p.status === "approved").length
    const rejected = projects.filter((p) => p.status === "rejected").length
    return { total, pending, approved, rejected }
  }, [projects])

  return (
    <AdminLayout>
      <AdminProjectsHero
        stats={stats}
        search={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
      />
      <AdminProjectsList
        search={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
      />
    </AdminLayout>
  )
}

export default AdminProjects
