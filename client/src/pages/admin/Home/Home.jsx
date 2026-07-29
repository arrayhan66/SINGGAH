import AdminLayout from "../../../layouts/AdminLayout"
import AdminHero from "../../../components/sections/admin/Dashboard/Hero"
import DashboardStats from "../../../components/sections/admin/Dashboard/DashboardStats"
import DashboardPendingProjects from "../../../components/sections/admin/Dashboard/DashboardPendingProjects"
import DashboardApprovedProjects from "../../../components/sections/admin/Dashboard/DashboardApprovedProjects"
import DashboardLatestNews from "../../../components/sections/admin/Dashboard/DashboardLatestNews"

function HomeAdmin() {
  return (
    <AdminLayout>
      <AdminHero />
      <DashboardStats />
      <div className="px-6 md:px-10 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <DashboardPendingProjects />
          <DashboardApprovedProjects />
        </div>
      </div>
      <div className="px-6 md:px-10 pb-10">
        <DashboardLatestNews />
      </div>
    </AdminLayout>
  )
}

export default HomeAdmin
