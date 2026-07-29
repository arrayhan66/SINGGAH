import { useMemo } from "react"
import AdminLayout from "../../../layouts/AdminLayout"
import AdminProjectsHero from "../../../components/sections/admin/ManageProjects/AdminProjectsHero"
import AdminProjectsList from "../../../components/sections/admin/ManageProjects/AdminProjectsList"
import { useProjects } from "../../../context/ProjectContext"

function AdminProjects() {
  const { projects } = useProjects()

  const stats = useMemo(() => {
    const total = projects.length
    const pending = projects.filter((p) => p.status === "pending").length
    const approved = projects.filter((p) => p.status === "approved").length
    const rejected = projects.filter((p) => p.status === "rejected").length
    return { total, pending, approved, rejected }
  }, [projects])

  return (
    <AdminLayout>
      <AdminProjectsHero stats={stats} />
      <AdminProjectsList />
    </AdminLayout>
  )
}

export default AdminProjects
