import GlassCard from "../../ui/GlassCard"
import { Layers, Grid3x3, Users } from "lucide-react"

export const statsData = [
  { icon: Layers, value: "50", label: "Proyek" },
  { icon: Grid3x3, value: "10", label: "Kategori" },
  { icon: Users, value: "1000", label: "Pengunjung" },
]

function HeroStats() {
  return (
    <div className="mt-10 flex items-center gap-4">
      {statsData.map((stat) => (
        <GlassCard
          key={stat.label}
          hover
          className="flex flex-col items-center justify-center gap-1 rounded-2xl px-8 py-5 text-center !cursor-default"
        >
          <h2 className="text-3xl font-bold text-cyan-300">{stat.value}</h2>
          <p className="text-slate-300">{stat.label}</p>
        </GlassCard>
      ))}
    </div>
  )
}

export default HeroStats
