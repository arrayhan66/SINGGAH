import { BarChart3, PieChart } from "lucide-react"

const barData = [
  { month: "Jan", value: 4 },
  { month: "Feb", value: 7 },
  { month: "Mar", value: 5 },
  { month: "Apr", value: 9 },
  { month: "Mei", value: 6 },
  { month: "Jun", value: 8 },
]

function BarChart() {
  const maxVal = Math.max(...barData.map((d) => d.value))
  return (
    <div className="flex items-end justify-between gap-2 px-1">
      {barData.map((item) => (
        <div key={item.month} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-400">{item.value}</span>
          <div
            className="w-full max-w-[32px] rounded-[4px] bg-gradient-to-t from-cyan-600 to-cyan-400 transition-all duration-300 mx-auto"
            style={{ height: `${(item.value / maxVal) * 180}px` }}
          />
          <span className="text-[11px] text-slate-500">{item.month}</span>
        </div>
      ))}
    </div>
  )
}

const donutData = [
  { label: "Pending", value: 35, color: "bg-orange-400" },
  { label: "Disetujui", value: 40, color: "bg-emerald-400" },
  { label: "Ditolak", value: 25, color: "bg-red-400" },
]

function DonutChart() {
  const total = donutData.reduce((sum, d) => sum + d.value, 0)
  const segments = donutData.reduce((acc, d) => {
    const start = acc.length === 0 ? 0 : acc[acc.length - 1].end
    const end = start + (d.value / total) * 360
    acc.push({ ...d, start, end })
    return acc
  }, [])

  return (
    <div className="relative mx-auto flex h-[156px] w-[156px] items-center justify-center">
      <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
        {segments.map((seg, i) => {
          const [startX, startY] = [
            18 + 15 * Math.cos(((seg.start - 90) * Math.PI) / 180),
            18 + 15 * Math.sin(((seg.start - 90) * Math.PI) / 180),
          ]
          const [endX, endY] = [
            18 + 15 * Math.cos(((seg.end - 90) * Math.PI) / 180),
            18 + 15 * Math.sin(((seg.end - 90) * Math.PI) / 180),
          ]
          const largeArc = seg.end - seg.start > 180 ? 1 : 0
          return (
            <path
              key={i}
              d={`M 18 18 L ${startX} ${startY} A 15 15 0 ${largeArc} 1 ${endX} ${endY} Z`}
              fill={
                seg.label === "Pending"
                  ? "#fb923c"
                  : seg.label === "Disetujui"
                    ? "#34d399"
                    : "#f87171"
              }
              className="transition-all duration-300"
            />
          )
        })}
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-bold text-white">100%</span>
        <span className="text-[10px] text-slate-500">Total</span>
      </div>
    </div>
  )
}

function DashboardAnalytics() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-7">
      <div className="rounded-[18px] border border-white/[0.06] bg-[#0E2745] p-5 shadow-[0_12px_28px_rgba(0,0,0,.18)] md:p-6">
        <div className="mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-slate-400" />
          <h2 className="text-[17px] font-semibold text-white md:text-[18px]">
            Project per Bulan
          </h2>
        </div>
        <BarChart />
      </div>
      <div className="rounded-[18px] border border-white/[0.06] bg-[#0E2745] p-5 shadow-[0_12px_28px_rgba(0,0,0,.18)] md:p-6">
        <div className="mb-3 flex items-center gap-2">
          <PieChart className="h-4 w-4 text-slate-400" />
          <h2 className="text-[17px] font-semibold text-white md:text-[18px]">
            Status Project
          </h2>
        </div>
        <div className="flex items-center justify-center gap-4">
          <DonutChart />
          <div className="flex flex-col gap-2">
            {donutData.map((d) => (
              <div key={d.label} className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${d.color}`} />
                <span className="text-sm text-slate-400">{d.label}</span>
                <span className="text-sm font-medium text-white">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardAnalytics
