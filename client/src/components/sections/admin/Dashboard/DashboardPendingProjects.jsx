import { useNavigate } from "react-router-dom"
import { Clock, ArrowRight, Inbox } from "lucide-react"
import { dummyAdminProjects } from "../dummyAdminProjects"

function DashboardPendingProjects() {
  const navigate = useNavigate()
  const pendingProjects = dummyAdminProjects
    .filter((p) => p.status === "pending")
    .slice(0, 5)

  return (
    <div className="px-6 py-8 md:px-10">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-300" />
            <h2 className="text-sm md:text-base font-semibold text-white">
              Project Menunggu Review
            </h2>
          </div>

          <button
            onClick={() => navigate("/admin/projects")}
            className="flex items-center gap-1.5 text-xs md:text-sm text-cyan-300 hover:text-cyan-200 transition-colors"
          >
            Lihat Semua
            <ArrowRight size={14} />
          </button>
        </div>

        {pendingProjects.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-2 py-8 text-center">
            <Inbox className="h-8 w-8 text-slate-500" />
            <p className="text-sm text-slate-400">
              Tidak ada project yang menunggu review.
            </p>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            {pendingProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 min-w-0"
              >
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="h-12 w-16 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {project.title}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {project.studentName}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[11px] text-amber-300">
                  Pending
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPendingProjects
