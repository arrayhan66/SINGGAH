import { useNavigate } from "react-router-dom"
import { Clock, ArrowRight, Eye, Inbox } from "lucide-react"
import { useProjects } from "../../../../context/ProjectContext"

function DashboardPendingProjects() {
  const navigate = useNavigate()
  const { projects } = useProjects()
  const pendingProjects = projects
    .filter((p) => p.status === "pending")
    .slice(0, 4)

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-xl backdrop-blur-xl md:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15">
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <h2 className="text-[17px] font-semibold text-white md:text-[18px]">
            Project Menunggu Review
          </h2>
        </div>

        <button
          onClick={() => navigate("/projects?status=pending")}
          className="group flex cursor-pointer items-center gap-1.5 text-xs font-medium text-cyan-400 transition-all duration-200 hover:text-cyan-300"
        >
          Lihat Semua
          <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </div>

      {pendingProjects.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 py-6 text-center">
          <Inbox className="h-8 w-8 text-slate-500" />
          <p className="text-sm text-slate-400">
            Tidak ada project yang menunggu review.
          </p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {pendingProjects.map((project) => (
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
              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="shrink-0 rounded-md border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400">
                  Pending
                </span>
                <button
                  onClick={() => navigate(`/projects/${project.slug}`)}
                  className="flex cursor-pointer items-center gap-1 rounded-md bg-cyan-500/15 px-2.5 py-1.5 text-[11px] font-medium text-cyan-400 transition-all duration-200 hover:bg-cyan-500/25 hover:text-cyan-300"
                >
                  <Eye size={13} />
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DashboardPendingProjects
