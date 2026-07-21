import AdminLayout from "../../../layouts/AdminLayout"
import AdminHero from "../../../components/sections/admin/Dashboard/Hero"
import DashboardStats from "../../../components/sections/admin/Dashboard/DashboardStats"
import DashboardPendingProjects from "../../../components/sections/admin/Dashboard/DashboardPendingProjects"

function HomeAdmin() {
  return (
    <AdminLayout>
      <AdminHero />
      <DashboardStats />
      <DashboardPendingProjects />
    </AdminLayout>
  )
}

export default HomeAdmin
