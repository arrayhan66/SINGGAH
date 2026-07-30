import { useNavigate } from "react-router-dom"
import { FolderKanban, Newspaper, Users, ArrowRight } from "lucide-react"
import { useAuth } from "../../../../context/AuthContext"
import AdminHeroBackground from "../../../ui/AdminHeroBackground"
import DashboardStats from "./DashboardStats"

function AdminHero() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const name = user?.name || "Admin"

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? "Selamat Pagi" : hour < 17 ? "Selamat Siang" : "Selamat Sore"

  const quickActions = [
    { label: "Project", icon: FolderKanban, to: "/admin/projects" },
    { label: "Berita", icon: Newspaper, to: "/admin/berita" },
    { label: "User", icon: Users, to: "/admin/users" },
  ]

  return (
    <AdminHeroBackground>
      <div className="px-4 min-[260px]:px-3 pt-6 min-[260px]:pt-6 pb-2 md:px-6 md:pt-8">
        <h1 className="text-[22px] min-[260px]:text-[18px] min-[320px]:text-[20px] font-bold text-white md:text-[30px]">
          {greeting}, {name}
        </h1>
        <p className="mt-1 text-[11px] min-[260px]:text-[10px] text-slate-400 md:text-base">
          Kelola project, berita, dan aktivitas SINGGAH dari sini.
        </p>

        <div className="mt-4 min-[260px]:mt-3 flex flex-wrap items-center gap-2 min-[260px]:gap-1.5">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.to}
                onClick={() => navigate(action.to)}
                className="group flex cursor-pointer items-center gap-1.5 min-[260px]:gap-1 rounded-[10px] min-[260px]:rounded-[8px] border border-white/10 bg-white/5 px-3 min-[260px]:px-2.5 py-2 text-[11px] min-[260px]:text-[10px] text-slate-300 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 hover:text-white hover:shadow-[0_8px_20px_rgba(0,0,0,.2)]"
              >
                <Icon size={14} />
                {action.label}
                <ArrowRight size={12} className="opacity-50 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            )
          })}
        </div>
      </div>
      <DashboardStats />
    </AdminHeroBackground>
  )
}

export default AdminHero
