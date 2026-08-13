import { useNavigate } from "react-router-dom"
import { CheckCircle2, ArrowRight, FolderOpen } from "lucide-react"
import { useProjects } from "../../../../context/ProjectContext"

function DashboardApprovedProjects() {
  const navigate = useNavigate()
  const { projects } = useProjects()
  const approvedProjects = projects
    .filter((p) => p.status === "approved" || p.status === "published")
    .slice(0, 4)

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-xl backdrop-blur-xl md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <h2 className="text-[14px] font-semibold text-white min-[500px]:text-[17px] md:text-[18px]">
            <span className="hidden min-[500px]:inline">Project </span>Disetujui
          </h2>
        </div>

        <button
          onClick={() => navigate("/projects?status=approved")}
          className="group ml-auto hidden cursor-pointer min-[600px]:flex items-center gap-1 text-[9px] font-medium text-cyan-400 transition-all duration-200 hover:text-cyan-300 min-[500px]:text-xs"
        >
          Lihat Semua
          <ArrowRight size={14} className="hidden transition-transform duration-200 group-hover:translate-x-0.5 min-[500px]:block" />
        </button>
      </div>

      {approvedProjects.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 py-6 text-center">
          <FolderOpen className="h-8 w-8 text-slate-500" />
          <p className="text-sm text-slate-400">
            Belum ada project yang disetujui.
          </p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {approvedProjects.map((project) => (
            <div
              key={project.id}
              className="group flex flex-col gap-3 rounded-[14px] border border-white/10 bg-white/[0.04] p-3 transition-all duration-250 hover:-translate-y-[2px] hover:bg-white/[0.08] hover:border-white/20 hover:shadow-lg sm:flex-row sm:items-center"
              style={{ minHeight: 90 }}
            >
              <img
                src={project.thumbnail}
                alt={project.title}
                className="h-[72px] w-full shrink-0 rounded-lg object-cover sm:h-[72px] sm:w-[72px]"
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
