import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2, ArrowRight, FolderOpen } from "lucide-react"
import api from "../../../../services/api"
import { imageUrl } from "../../../../utils/imageUrl"
import SmartImage from "../../../ui/SmartImage"

function DashboardApprovedProjects() {
  const navigate = useNavigate()
  const [approvedProjects, setApprovedProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    api
      .get("/projects", { params: { status: "published", limit: 4 } })
      .then((res) => {
        const items = res.data?.data?.items || []
        if (isMounted) setApprovedProjects(items.slice(0, 4))
      })
      .catch((err) => {
        console.error("Failed to fetch approved projects:", err)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="dashboard-approved-card dashboard-panel group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-all duration-300 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <h2 className="text-[14px] font-semibold text-white min-[500px]:text-[17px] md:text-[18px]">
            <span className="hidden min-[500px]:inline">Karya </span>Disetujui
          </h2>
        </div>

        <button
          onClick={() => navigate("/admin/karya?status=published")}
          className="group ml-auto hidden cursor-pointer min-[600px]:flex items-center gap-1 text-[9px] font-medium text-cyan-400 transition-all duration-200 hover:text-cyan-300 min-[500px]:text-xs"
        >
          Lihat Semua
          <ArrowRight size={14} className="hidden transition-transform duration-200 group-hover:translate-x-0.5 min-[500px]:block" />
        </button>
      </div>

      {loading ? (
        <div className="mt-4 flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-[14px] border border-white/10 bg-white/[0.04] p-3 sm:flex-row sm:items-center"
              style={{ minHeight: 90 }}
            >
              <div className="aspect-video w-full shrink-0 animate-pulse rounded-lg bg-white/10 sm:h-[84px] sm:w-[150px]" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-white/10" />
              </div>
              <div className="h-7 w-24 shrink-0 animate-pulse rounded-md bg-white/10" />
            </div>
          ))}
        </div>
      ) : approvedProjects.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 py-6 text-center">
          <FolderOpen className="h-8 w-8 text-slate-500" />
          <p className="text-sm text-slate-400">
            Belum ada karya yang disetujui.
          </p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {approvedProjects.map((project) => (
            <div
              key={project.id}
              className="dashboard-approved-item group flex flex-col gap-3 rounded-[14px] border border-white/10 bg-white/[0.04] p-3 transition-all duration-250 hover:-translate-y-[2px] hover:bg-white/[0.08] hover:border-white/20 hover:shadow-lg sm:flex-row sm:items-center"
              style={{ minHeight: 90 }}
            >
              <SmartImage
                src={imageUrl(project.thumbnail)}
                alt={project.title}
                className="aspect-video w-full shrink-0 rounded-lg border border-white/15 object-cover sm:h-[84px] sm:w-[150px]"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-white md:text-[17px]">
                  {project.title}
                </p>
                <p className="mt-0.5 text-sm text-slate-400">
                  {project.User?.name}
                </p>
              </div>
              <span className="shrink-0 self-start rounded-md border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 sm:self-center">
                Approved
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DashboardApprovedProjects
