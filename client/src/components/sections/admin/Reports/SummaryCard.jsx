import { summaryTheme } from "../../../../utils/reportsHelpers"

export default function SummaryCard({ icon: Icon, label, value, color }) {
  const c = summaryTheme[color]
  return (
    <div
      className={`group relative min-w-0 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${c.grad} px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20`}
    >
      <Icon
        className={`absolute -right-2 -top-2 h-20 w-20 rotate-12 ${c.text} opacity-[0.07] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}
      />
      <div className="relative flex items-center gap-3.5">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-lg ${c.wrap}`}
        >
          <Icon className={`h-5 w-5 ${c.text}`} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-2xl font-black leading-tight text-white tabular-nums">
            {value}
          </p>
          <p className="truncate text-xs leading-tight text-slate-300/80">
            {label}
          </p>
        </div>
      </div>
    </div>
  )
}
