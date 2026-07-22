import GlassCard from "../../ui/GlassCard";
import { Layers, Grid3x3, Users } from "lucide-react";

export const statsData = [
  { icon: Layers, value: "50", label: "Proyek" },
  { icon: Grid3x3, value: "10", label: "Kategori" },
  { icon: Users, value: "1000", label: "Pengunjung" },
];

function HeroStats() {
  return (
    <div className="w-full">
      <div className="flex w-full gap-4">
        {statsData.map((stat) => (
          <GlassCard
            key={stat.label}
            hover
            className="flex-1 flex flex-col items-center justify-center gap-1 rounded-2xl px-8 py-5 2xl:px-10 2xl:py-6 text-center !cursor-default"
          >
            <h2 className="text-3xl 2xl:text-4xl font-bold text-cyan-300">
              {stat.value}
            </h2>

            <p className="text-slate-300 2xl:text-lg">{stat.label}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

export default HeroStats;
