import { useNavigate } from "react-router-dom"
import { FolderKanban, Newspaper, Users, ArrowRight } from "lucide-react"
import { useAuth } from "../../../../context/AuthContext"
import GlowBackground from "../../../ui/GlowBackground"
import DustBackground from "../../../ui/DustBackground"

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
    <div className="relative overflow-hidden px-6 pt-8 pb-2 md:px-10 md:pt-10">
      <GlowBackground />
      <DustBackground />
      <div className="relative z-10">
        <h1 className="text-xl font-bold text-white md:text-2xl">
          {greeting}, {name}
        </h1>
        <p className="mt-1 text-sm text-slate-400 md:text-base">
          Kelola project, berita, dan aktivitas SINGGAH dari sini.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.to}
                onClick={() => navigate(action.to)}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Icon size={15} />
                {action.label}
                <ArrowRight size={13} className="ml-0.5 opacity-50" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default AdminHero
