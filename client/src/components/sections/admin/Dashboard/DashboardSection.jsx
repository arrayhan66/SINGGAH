import AdminHero from "./Hero"
import DashboardPendingProjects from "./DashboardPendingProjects"
import DashboardApprovedProjects from "./DashboardApprovedProjects"
import DashboardActivityFeed from "./DashboardActivityFeed"
import DashboardLatestNews from "./DashboardLatestNews"

export default function DashboardSection() {
  return (
    <div className="space-y-6 md:space-y-7 lg:space-y-8 pb-12 md:pb-16">
      <AdminHero />

      <div className="px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 min-[1200px]:grid-cols-3 min-[1200px]:gap-7">
          <div className="flex flex-col gap-6 min-[1200px]:col-span-2 min-[1200px]:gap-7">
            <DashboardPendingProjects />
            <DashboardApprovedProjects />
          </div>
          <div className="flex flex-col gap-6 min-[1200px]:gap-7">
            <DashboardActivityFeed />
            <DashboardLatestNews />
          </div>
        </div>
      </div>
    </div>
  )
}
