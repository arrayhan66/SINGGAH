import { useNavigate } from "react-router-dom"
import { LayoutDashboard, FolderKanban, Newspaper, Users, ArrowRight } from "lucide-react"
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
    { label: "Project", icon: FolderKanban, to: "/projects" },
    { label: "Berita", icon: Newspaper, to: "/berita" },
    { label: "User", icon: Users, to: "/users" },
  ]

  return (
    <AdminHeroBackground fullWidth>
      <div className="px-4 min-[260px]:px-3 pt-5 min-[260px]:pt-5 pb-1 md:px-6 md:pt-6">
        <div className="flex flex-col items-center text-center sm:flex-row sm:text-left gap-3 sm:gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 border border-cyan-400/30 sm:h-16 sm:w-16">
            <LayoutDashboard className="h-7 w-7 text-cyan-300 sm:h-8 sm:w-8" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white">
              {greeting}
              <span className="hidden min-[400px]:inline">, </span>
              <br className="min-[400px]:hidden" />
              <span className="text-slate-100">{name}</span>
            </h1>
            <p className="mt-1 text-sm text-slate-400 max-w-xl">
              Kelola project, berita, dan aktivitas SINGGAH dari sini.
            </p>
          </div>
        </div>

        <div className="mt-5 min-[260px]:mt-4 md:mt-6 flex flex-wrap items-center gap-2.5 min-[260px]:gap-2 md:gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.to}
                onClick={() => navigate(action.to)}
                className="group flex flex-1 basis-0 max-w-[150px] min-[260px]:max-w-[136px] cursor-pointer items-center justify-center min-[380px]:justify-start gap-2 min-[260px]:gap-1.5 rounded-lg border border-white/[0.07] bg-gradient-to-b from-white/[0.08] to-white/[0.02] px-2.5 min-[260px]:px-2 py-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:to-transparent hover:border-cyan-400/40 hover:from-cyan-500/[0.12] hover:shadow-[0_10px_30px_-12px_rgba(34,211,238,0.35)] active:translate-y-0"
              >
                <span className="hidden h-7 w-7 min-[260px]:h-6 min-[260px]:w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 transition-all duration-200 group-hover:scale-105 group-hover:bg-cyan-500/20 min-[380px]:flex">
                  <Icon size={14} strokeWidth={2} className="text-cyan-400" />
                </span>
                <span className="text-xs min-[260px]:text-[11px] font-semibold tracking-tight text-white">
                  {action.label}
                </span>
                <span className="hidden ml-auto h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white/10 text-slate-400 transition-all duration-200 group-hover:border-cyan-400/50 group-hover:bg-cyan-500/20 group-hover:text-cyan-300 min-[450px]:flex">
                  <ArrowRight size={10} />
                </span>
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
