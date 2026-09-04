import { useState, useEffect } from "react"
import { useAuth } from "../../../../context/AuthContext"
import api from "../../../../services/api"
import GlassCard from "../../../ui/GlassCard"
import { FolderCheck, Clock, FolderOpen } from "lucide-react"

const statsConfig = [
  {
    key: "published",
    label: "Published",
    icon: FolderCheck,
    iconBg: "bg-emerald-500/15",
    iconBorder: "border-emerald-400/30",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/20",
  },
  {
    key: "pending",
    label: "Pending",
    icon: Clock,
    iconBg: "bg-amber-500/15",
    iconBorder: "border-amber-400/30",
    text: "text-amber-400",
    glow: "shadow-amber-500/20",
  },
  {
    key: "total",
    label: "Total",
    icon: FolderOpen,
    iconBg: "bg-cyan-500/15",
    iconBorder: "border-cyan-400/30",
    text: "text-cyan-400",
    glow: "shadow-cyan-500/20",
  },
]

function ProfileStats() {
  const { token } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function fetchStats() {
      try {
        const res = await api.get("/auth/profile-stats", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!cancelled) setStats(res.data.data)
      } catch {
        if (!cancelled) setStats({ published: 0, pending: 0, rejected: 0, total: 0 })
      }
    }
    fetchStats()
    return () => { cancelled = true }
  }, [token])

  return (
    <GlassCard className="p-5 md:p-6">
      <h2 className="text-sm min-[350px]:text-base md:text-lg font-semibold text-white">
        Statistik Saya
      </h2>
      <p className="mt-1 text-xs md:text-sm text-slate-400">
        Ringkasan project yang telah kamu upload.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3 min-[520px]:grid-cols-3">
        {statsConfig.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.key}
              className={`group/stat relative flex min-w-0 flex-row items-center gap-2 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3.5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.07] ${s.glow} hover:shadow-lg`}
            >
              <div
                className={`absolute -right-4 -top-4 h-16 w-16 rounded-full blur-2xl transition-opacity duration-300 group-hover/stat:opacity-100 ${s.iconBg} opacity-70`}
              />
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${s.iconBorder} ${s.iconBg} transition-transform duration-300 group-hover/stat:scale-110 md:h-10 md:w-10`}
              >
                <Icon className={`h-[18px] w-[18px] ${s.text} md:h-5 md:w-5`} />
              </div>
              <span className="text-xl font-bold leading-none tracking-tight text-white md:text-3xl">
                {stats ? stats[s.key] : "-"}
              </span>
              <span className="truncate text-[11px] font-medium text-slate-400">
                {s.label}
              </span>
            </div>
          )
        })}
      </div>
    </GlassCard>
  )
}

export default ProfileStats
