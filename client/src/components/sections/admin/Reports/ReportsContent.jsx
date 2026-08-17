import { TrendingUp, Eye, FolderKanban, UserCheck, Sparkles, Calendar } from "lucide-react"
import MonthlyBarChart from "./MonthlyBarChart"
import SummaryCard from "./SummaryCard"

export default function ReportsContent({ monthlyData, summary, viewYear }) {
  return (
    <div className="px-4 pb-12 md:px-6 lg:px-8 md:pb-16">
      <div className="mt-6 grid grid-cols-1 gap-6 md:mt-8 lg:grid-cols-2">
        <MonthlyBarChart
          title="Project per Bulan"
          subtitle={`Tahun ${viewYear}`}
          data={monthlyData}
          valueKey="projects"
          color="cyan"
          Icon={TrendingUp}
          formatter={(v) => v.toString()}
        />
        <MonthlyBarChart
          title="Pengunjung per Bulan"
          subtitle={`Tahun ${viewYear}`}
          data={monthlyData}
          valueKey="visitors"
          color="emerald"
          Icon={Eye}
          formatter={(v) =>
            v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v.toString()
          }
        />
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-6 shadow-xl backdrop-blur-xl md:p-8">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 shadow-lg shadow-cyan-500/20">
            <Calendar className="h-4 w-4 text-cyan-300" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              Ringkasan Cepat
            </h3>
            <p className="text-xs text-slate-400">
              Gambaran singkat aktivitas platform.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 min-[600px]:grid-cols-2 min-[1500px]:grid-cols-4">
          <SummaryCard
            icon={FolderKanban}
            label="Rata-rata Project/Bulan"
            value={summary.avgProjects.toFixed(1)}
            color="cyan"
          />
          <SummaryCard
            icon={Eye}
            label="Rata-rata Pengunjung/Bulan"
            value={
              summary.avgVisitors >= 1000
                ? `${(summary.avgVisitors / 1000).toFixed(1)}K`
                : summary.avgVisitors
            }
            color="emerald"
          />
          <SummaryCard
            icon={UserCheck}
            label="User Aktif (Bulan Ini)"
            value={summary.activeUsers}
            color="blue"
          />
          <SummaryCard
            icon={Sparkles}
            label="Proyek Baru (Bulan Ini)"
            value={summary.newProjectsThisMonth}
            color="amber"
          />
        </div>
      </div>
    </div>
  )
}
