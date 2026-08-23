import { BarChart3 } from "lucide-react"
import AdminHeroBackground from "../../../../components/ui/AdminHeroBackground"
import Sparkline from "./Sparkline"
import Trend from "./Trend"

export default function ReportsHero({ stats, loading, viewYear, years, onYearChange }) {
  return (
    <AdminHeroBackground fullWidth>
      <div className="px-4 min-[260px]:px-3 pt-5 min-[260px]:pt-5 md:px-6 md:pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col items-center text-center sm:flex-row sm:text-left gap-[clamp(0.75rem,0.5rem+1vw,1rem)]">
            <div className="flex h-[clamp(2.75rem,2.25rem+2vw,3.5rem)] w-[clamp(2.75rem,2.25rem+2vw,3.5rem)] shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 border border-cyan-400/30 sm:h-16 sm:w-16">
              <BarChart3 className="h-[clamp(1.375rem,1.25rem+0.6vw,1.75rem)] w-[clamp(1.375rem,1.25rem+0.6vw,1.75rem)] text-cyan-300 sm:h-8 sm:w-8" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[clamp(1.25rem,0.9375rem+1.5vw,1.5rem)] sm:text-3xl font-black text-white">
                Laporan & <span className="text-slate-100">Statistik</span>
              </h1>
              <p className="mt-1 text-[clamp(0.8125rem,0.75rem+0.5vw,0.875rem)] text-slate-400 max-w-xl">
                Ringkasan aktivitas platform dalam periode tertentu.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {loading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
            )}
            <label className="flex items-center gap-2 text-xs font-medium text-slate-400">
              Tahun
              <select
                value={viewYear}
                onChange={onYearChange}
                className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 backdrop-blur-sm outline-none transition-colors hover:border-white/25 focus:border-cyan-400/40"
              >
                {years.map((y) => (
                  <option
                    key={y}
                    value={y}
                    className="bg-slate-900 text-slate-200"
                  >
                    {y}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="px-4 min-[260px]:px-3 pt-8 pb-5 md:px-6 md:pt-10 md:pb-6">
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient id="sparkCyan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="sparkViolet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="sparkEmerald" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="sparkRose" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        <div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-lg backdrop-blur-xl transition-all duration-[250ms] ease-out hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.09] hover:shadow-xl"
              >
                <div
                  className={`pointer-events-none absolute -right-12 -bottom-14 h-32 w-32 rounded-full bg-gradient-to-br ${stat.glow} to-transparent blur-2xl opacity-60 transition-opacity duration-[250ms] group-hover:opacity-80`}
                />

                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] ring-1 ring-inset ring-white/10">
                    <Icon size={16} strokeWidth={2} className={stat.color} />
                  </div>
                  <Sparkline
                    data={stat.spark}
                    stroke={stat.stroke}
                    gradientId={stat.gradientId}
                  />
                </div>

                <div className="relative mt-6">
                  <p
                    className="animate-fade-up text-[30px] font-bold tracking-tight text-white leading-none tabular-nums md:text-[32px]"
                    style={{ animationDelay: `${index * 80 + 120}ms` }}
                  >
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-400">
                    {stat.label}
                  </p>
                </div>

                <div className="relative mt-5 flex items-center justify-between gap-2">
                  <Trend value={stat.trend} />
                  <span className="text-xs text-slate-500">Bulan ini</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AdminHeroBackground>
  )
}
