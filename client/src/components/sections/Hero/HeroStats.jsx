import { useState, useEffect } from "react";
import GlassCard from "../../ui/GlassCard";
import { Layers, Grid3x3, Users } from "lucide-react";
import api from "../../../services/api";

function HeroStats() {
  const [stats, setStats] = useState({
    projectsCount: "50",
    categoriesCount: "10",
    visitorsCount: "1000",
  });

  useEffect(() => {
    api.get("/stats")
      .then((res) => {
        const d = res.data.data || res.data;
        setStats({
          projectsCount: String(d.totalProject ?? "50"),
          categoriesCount: String(d.totalCategory ?? "10"),
          visitorsCount: String(d.totalUser ?? "1000"),
        });
      })
      .catch((err) => {
        console.error("Failed to fetch public stats:", err);
      });
  }, []);

  const statsData = [
    { icon: Layers, value: stats.projectsCount, label: "Proyek" },
    { icon: Grid3x3, value: stats.categoriesCount, label: "Kategori" },
    { icon: Users, value: stats.visitorsCount, label: "Pengunjung" },
  ];

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
