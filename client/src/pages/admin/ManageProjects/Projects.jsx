import AdminLayout from "../../../layouts/AdminLayout"
import AdminProjectsHero from "../../../components/sections/admin/ManageProjects/AdminProjectsHero"
import AdminProjectsList from "../../../components/sections/admin/ManageProjects/AdminProjectsList"

function AdminProjects() {
  return (
    <AdminLayout>
      <AdminProjectsHero />
      <AdminProjectsList />
    </AdminLayout>
  )
}

export default AdminProjects
