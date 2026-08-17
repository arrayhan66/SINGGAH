import { useEffect, useState } from "react"
import { FolderOpen, Newspaper, Users, Clock } from "lucide-react"
import api from "../../../../services/api"

const ACCENT = {
  color: "text-cyan-400",
  stroke: "#22d3ee",
  iconBg: "bg-cyan-500/10",
  gradient: "from-cyan-500 to-cyan-400",
  gradId: "sparkCyan",
}

const sparklinePaths = {
  "Total Project": "M0,26 C12,28 18,10 30,14 S42,4 54,6 S60,2 72,0",
  "Total Berita": "M0,22 C12,24 18,14 30,18 S42,6 54,8 S60,3 72,0",
  "Total User": "M0,28 C12,24 18,20 30,12 S42,6 54,4 S60,1 72,2",
  "Menunggu Review": "M0,24 C12,26 18,18 30,16 S42,8 54,10 S60,4 72,4",
}

function Sparkline({ d }) {
  return (
    <svg className="shrink-0" width="72" height="28" viewBox="0 0 72 28" fill="none">
      <path d={d} stroke={ACCENT.stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.9" />
      <path d={`${d} L72,28 L0,28 Z`} fill={`url(#${ACCENT.gradId})`} opacity="0.15" />
    </svg>
  )
}

function DashboardStats() {
  const [stats, setStats] = useState({
    totalProject: 0,
    pendingProject: 0,
    totalNews: 0,
    totalUser: 0,
  })

  useEffect(() => {
    let isMounted = true

    api
      .get("/dashboard")
      .then((res) => {
        const data = res.data?.data?.stats || {}
        if (isMounted) {
          setStats({
            totalProject: data.totalProject || 0,
            pendingProject: data.pendingProject || 0,
            totalNews: data.totalNews || 0,
            totalUser: data.totalUser || 0,
          })
        }
      })
      .catch((err) => {
        console.error("Failed to fetch dashboard stats:", err)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const statItems = [
    { label: "Total Project", value: stats.totalProject, icon: FolderOpen },
    { label: "Total Berita", value: stats.totalNews, icon: Newspaper },
    { label: "Total User", value: stats.totalUser, icon: Users },
    { label: "Menunggu Review", value: stats.pendingProject, icon: Clock },
  ]

  return (
    <div className="px-4 min-[260px]:px-3 pt-5 pb-5 md:px-6 md:pt-6 md:pb-6">
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id={ACCENT.gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT.stroke} />
            <stop offset="100%" stopColor={ACCENT.stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <div className="grid grid-cols-1 min-[640px]:grid-cols-2 min-[1200px]:grid-cols-4 gap-3 md:gap-4">
        {statItems.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.09] hover:border-white/20 md:p-6"
            >
              <div className={`absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b ${ACCENT.gradient} rounded-l-2xl`} />
              <div className="flex items-start justify-between gap-2 pl-4 min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${ACCENT.iconBg} group-hover:scale-105 transition-transform`}>
                    <Icon className={`h-5 w-5 ${ACCENT.color}`} />
                  </div>
                  <div>
                    <p className="text-[28px] font-bold text-white leading-none md:text-[32px]">
                      {stat.value}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Sparkline d={sparklinePaths[stat.label]} />
                  <p className="truncate text-[10px] text-slate-400 text-right leading-tight md:text-[11px]">
                    {stat.label}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DashboardStats
