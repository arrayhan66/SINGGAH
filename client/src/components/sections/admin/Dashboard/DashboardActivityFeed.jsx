import { Activity, User, FileText, CheckCircle2, XCircle, Clock } from "lucide-react"

const activities = [
  { id: 1, type: "project", text: "Project baru diajukan oleh Ahmad Fadillah", time: "2 jam lalu", icon: FileText, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { id: 2, type: "approve", text: "Project Panel Surya disetujui", time: "5 jam lalu", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { id: 3, type: "reject", text: "Project Drone Pemantau ditolak", time: "1 hari lalu", icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
  { id: 4, type: "user", text: "User baru terdaftar: Dimas Ardiansyah", time: "2 hari lalu", icon: User, color: "text-blue-400", bg: "bg-blue-500/10" },
  { id: 5, type: "pending", text: "Project menunggu review: Sistem Irigasi", time: "3 hari lalu", icon: Clock, color: "text-orange-400", bg: "bg-orange-500/10" },
]

function DashboardActivityFeed() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-xl backdrop-blur-xl md:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-500/15">
          <Activity className="h-4 w-4 text-slate-400" />
        </div>
        <h2 className="text-[17px] font-semibold text-white md:text-[18px]">
          Aktivitas Terbaru
        </h2>
      </div>
      <div className="flex flex-col gap-3">
        {activities.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.id} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 transition-all hover:bg-white/[0.08]">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.bg}`}>
                <Icon size={16} className={item.color} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug text-slate-300">{item.text}</p>
                <p className="mt-0.5 text-xs text-slate-500">{item.time}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DashboardActivityFeed
