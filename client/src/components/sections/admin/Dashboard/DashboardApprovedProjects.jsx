import { useNavigate } from "react-router-dom"
import { CheckCircle2, ArrowRight, FolderOpen } from "lucide-react"
import { dummyAdminProjects } from "../dummyAdminProjects"
import GlowBackground from "../../../ui/GlowBackground"
import DustBackground from "../../../ui/DustBackground"

function DashboardApprovedProjects() {
  const navigate = useNavigate()
  const approvedProjects = dummyAdminProjects
    .filter((p) => p.status === "approved")
    .slice(0, 4)

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 md:p-6 backdrop-blur-xl h-full">
      <GlowBackground />
      <DustBackground />
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            <h2 className="text-sm md:text-base font-semibold text-white">
              Project Disetujui
            </h2>
          </div>

          <button
            onClick={() => navigate("/admin/projects")}
            className="flex cursor-pointer items-center gap-1.5 text-xs md:text-sm text-cyan-300 hover:text-cyan-200 transition-colors"
          >
            Lihat Semua
            <ArrowRight size={14} />
          </button>
        </div>

        {approvedProjects.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-2 py-8 text-center">
            <FolderOpen className="h-8 w-8 text-slate-500" />
            <p className="text-sm text-slate-400">
              Belum ada project yang disetujui.
            </p>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            {approvedProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 min-w-0 transition-all duration-200 hover:bg-white/[0.06] hover:border-white/[0.12]"
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
                <span className="shrink-0 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] text-emerald-300">
                  Approved
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardApprovedProjects
