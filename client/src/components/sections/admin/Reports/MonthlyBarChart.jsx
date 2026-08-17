import { barTheme } from "../../../../utils/reportsHelpers"

export default function MonthlyBarChart({
  title,
  subtitle,
  data,
  valueKey,
  color,
  Icon,
  formatter,
}) {
  const c = barTheme[color]
  const total = data.reduce((s, d) => s + (d[valueKey] || 0), 0)
  const maxValue = Math.max(...data.map((d) => d[valueKey] || 0), 1)
  const bestIndex = data.findIndex((d) => (d[valueKey] || 0) === maxValue)

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-5 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-white/20 md:p-6">
      <div
        className={`pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full ${c.glow} blur-3xl opacity-50 transition-opacity duration-300 group-hover:opacity-80`}
      />
      <div className="relative mb-6 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-lg ${c.iconWrap}`}
          >
            <Icon className={`h-5 w-5 ${c.iconText}`} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-[17px] font-semibold text-white leading-tight md:text-[18px]">
              {title}
            </h3>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
        </div>
        <div
          className={`flex shrink-0 flex-col items-center rounded-xl border px-3.5 py-2 ${c.badge}`}
        >
          <span
            className={`text-base font-black leading-none tabular-nums ${c.badgeText}`}
          >
            {formatter(total)}
          </span>
          <span className="mt-0.5 text-[10px] text-slate-400">Total</span>
        </div>
      </div>

      <div className="relative flex h-40 items-end gap-1.5 overflow-x-auto overflow-y-hidden">
        <div className="flex min-w-[300px] flex-1 items-end gap-1.5">
          {data.map((d, i) => {
            const val = d[valueKey] || 0
            const isBest = val > 0 && i === bestIndex
            const height =
              val > 0 ? Math.max((val / maxValue) * 100, 4) : 3
            return (
              <div
                key={d.month}
                className="flex flex-1 flex-col items-center gap-1.5"
              >
                <span
                  className={`text-[10px] font-semibold tabular-nums ${
                    val > 0 ? c.top : "text-slate-600"
                  }`}
                >
                  {formatter(val)}
                </span>
                <div
                  className={`w-full rounded-t-lg bg-gradient-to-t ${c.bar} transition-all duration-200 ${
                    isBest
                      ? `${c.glowShadow} shadow-lg opacity-100`
                      : "opacity-60 group-hover:opacity-100"
                  }`}
                  style={{ height: `${height}%` }}
                />
                <span
                  className={`text-[10px] ${
                    isBest
                      ? `font-semibold ${c.badgeText}`
                      : "text-slate-500"
                  }`}
                >
                  {d.month}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
