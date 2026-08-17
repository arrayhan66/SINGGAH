import { useEffect, useState } from "react"
import { Activity, User, FileText, CheckCircle2, XCircle, Clock, Newspaper, FolderKanban, Settings, Image, Tag, ThumbsUp, MessageSquare } from "lucide-react"
import api from "../../../../services/api"

const actionConfig = {
  project_created: { icon: FileText, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  project_approved: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  project_rejected: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
  project_pending: { icon: Clock, color: "text-orange-400", bg: "bg-orange-500/10" },
  project_deleted: { icon: FolderKanban, color: "text-red-400", bg: "bg-red-500/10" },
  project_liked: { icon: ThumbsUp, color: "text-pink-400", bg: "bg-pink-500/10" },
  user_login: { icon: User, color: "text-blue-400", bg: "bg-blue-500/10" },
  user_registered: { icon: User, color: "text-blue-400", bg: "bg-blue-500/10" },
  user_created: { icon: User, color: "text-blue-400", bg: "bg-blue-500/10" },
  user_updated: { icon: User, color: "text-blue-400", bg: "bg-blue-500/10" },
  user_deleted: { icon: User, color: "text-red-400", bg: "bg-red-500/10" },
  news_created: { icon: Newspaper, color: "text-blue-400", bg: "bg-blue-500/10" },
  news_updated: { icon: Newspaper, color: "text-blue-400", bg: "bg-blue-500/10" },
  news_deleted: { icon: Newspaper, color: "text-red-400", bg: "bg-red-500/10" },
  comment_added: { icon: MessageSquare, color: "text-teal-400", bg: "bg-teal-500/10" },
  category_created: { icon: Tag, color: "text-violet-400", bg: "bg-violet-500/10" },
  category_updated: { icon: Tag, color: "text-violet-400", bg: "bg-violet-500/10" },
  category_deleted: { icon: Tag, color: "text-red-400", bg: "bg-red-500/10" },
  media_uploaded: { icon: Image, color: "text-purple-400", bg: "bg-purple-500/10" },
  media_deleted: { icon: Image, color: "text-red-400", bg: "bg-red-500/10" },
  settings_updated: { icon: Settings, color: "text-slate-300", bg: "bg-slate-500/10" },
}

const DEFAULT_ACTION = { icon: Activity, color: "text-slate-400", bg: "bg-slate-500/10" }

function timeAgo(dateString) {
  if (!dateString) return ""
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ""

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 60) return "baru saja"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} menit lalu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} hari lalu`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} bulan lalu`
  return `${Math.floor(months / 12)} tahun lalu`
}

function DashboardActivityFeed() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    api
      .get("/activity-logs", { params: { limit: 5 } })
      .then((res) => {
        const items = res.data?.data?.items || []
        if (isMounted) {
          setActivities(items)
        }
      })
      .catch((err) => {
        console.error("Failed to fetch activity logs:", err)
        if (isMounted) {
          setActivities([])
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const visibleActivities = activities.slice(0, 5)

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-xl backdrop-blur-xl md:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-500/15">
          <Activity className="h-4 w-4 text-slate-400" />
        </div>
        <h2 className="text-[15px] font-semibold text-white min-[500px]:text-[17px] md:text-[18px]">
          Aktivitas Terbaru
        </h2>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[64px] animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.04]"
            />
          ))}
        </div>
      ) : visibleActivities.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 py-6 text-center">
          <Activity className="h-8 w-8 text-slate-500" />
          <p className="text-sm text-slate-400">
            Belum ada aktivitas terbaru.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleActivities.map((item) => {
            const config = actionConfig[item.action] || DEFAULT_ACTION
            const Icon = config.icon
            return (
              <div key={item.id} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 transition-all hover:bg-white/[0.08]">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${config.bg}`}>
                  <Icon size={16} className={config.color} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug text-slate-300">
                    {item.description || item.action}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {timeAgo(item.created_at)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default DashboardActivityFeed
