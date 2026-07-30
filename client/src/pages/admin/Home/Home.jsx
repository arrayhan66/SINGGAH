import AdminLayout from "../../../layouts/AdminLayout"
import AdminHero from "../../../components/sections/admin/Dashboard/Hero"
import DashboardPendingProjects from "../../../components/sections/admin/Dashboard/DashboardPendingProjects"
import DashboardApprovedProjects from "../../../components/sections/admin/Dashboard/DashboardApprovedProjects"
import DashboardActivityFeed from "../../../components/sections/admin/Dashboard/DashboardActivityFeed"
import DashboardLatestNews from "../../../components/sections/admin/Dashboard/DashboardLatestNews"

function HomeAdmin() {
  return (
    <AdminLayout>
      <div className="space-y-6 md:space-y-7 lg:space-y-8 pb-12 md:pb-16">
        <AdminHero />

        <div className="px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-7">
            <div className="flex flex-col gap-6 lg:col-span-2 lg:gap-7">
              <DashboardPendingProjects />
              <DashboardApprovedProjects />
            </div>
            <div className="flex flex-col gap-6 lg:gap-7">
              <DashboardActivityFeed />
              <DashboardLatestNews />
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}

export default HomeAdmin
