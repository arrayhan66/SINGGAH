import { useState, useEffect } from "react"
import { useAuth } from "../../../../context/AuthContext"
import api from "../../../../services/api"
import GlassCard from "../../../ui/GlassCard"
import { FolderCheck, Clock, FolderOpen } from "lucide-react"

const statsConfig = [
  { key: "published", label: "Published", icon: FolderCheck, color: "text-emerald-400" },
  { key: "pending", label: "Pending", icon: Clock, color: "text-amber-400" },
  { key: "total", label: "Total", icon: FolderOpen, color: "text-cyan-400" },
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

      <div className="mt-5 grid grid-cols-3 gap-3">
        {statsConfig.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.key}
              className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] px-3 py-4 text-center"
            >
              <Icon className={`h-5 w-5 ${s.color}`} />
              <span className="mt-2 text-2xl font-bold text-white">
                {stats ? stats[s.key] : "-"}
              </span>
              <span className="mt-0.5 text-[11px] text-slate-400">
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
