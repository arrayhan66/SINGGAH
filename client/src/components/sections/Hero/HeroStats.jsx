import { useState, useEffect } from "react";
import GlassCard from "../../ui/GlassCard";
import { Layers, Grid3x3, Users } from "lucide-react";
import Skeleton from "../../ui/Skeleton";
import api from "../../../services/api";

function HeroStats({ variant = "card" }) {
  const [stats, setStats] = useState({
    projectsCount: "–",
    categoriesCount: "–",
    visitorsCount: "–",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/stats")
      .then((res) => {
        const d = res.data.data || res.data;
        setStats({
          projectsCount: String(d.totalProject ?? "–"),
          categoriesCount: String(d.totalCategory ?? "–"),
          visitorsCount: String(d.totalVisitors ?? "–"),
        });
      })
      .catch((err) => {
        console.error("Failed to fetch public stats:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const statsData = [
    { icon: Layers, value: stats.projectsCount, label: "Proyek" },
    { icon: Grid3x3, value: stats.categoriesCount, label: "Kategori" },
    { icon: Users, value: stats.visitorsCount, label: "Pengunjung" },
  ];

  if (variant === "mobile") {
    return (
      <div className="flex flex-col min-[400px]:flex-row items-center justify-between gap-6 min-[400px]:gap-0 rounded-2xl border border-white/10 bg-white/5 px-4 md:px-6 py-5 min-[400px]:py-4 backdrop-blur-xl">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex w-full min-[400px]:w-auto flex-1 items-center justify-start min-[400px]:justify-center gap-4">
                <Skeleton className="h-10 w-10 md:h-12 md:w-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))
          : statsData.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="relative flex w-full min-[400px]:w-auto flex-1 items-center justify-start min-[400px]:justify-center gap-4"
                >
                  <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10">
                    <Icon className="h-5 w-5 md:h-6 md:w-6 text-cyan-300" />
                  </div>

                  <div className="text-left">
                    <p className="text-base min-[400px]:text-sm md:text-lg font-bold text-white leading-none">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-[11px] md:text-sm text-slate-400 leading-none">
                      {stat.label}
                    </p>
                  </div>

                  {index < statsData.length - 1 && (
                    <div className="hidden min-[400px]:block absolute right-0 top-1/2 h-8 w-px -translate-y-1/2 bg-white/20 md:h-10" />
                  )}

                  {index < statsData.length - 1 && (
                    <div className="block min-[400px]:hidden absolute -bottom-3 left-1/2 h-px w-[90%] -translate-x-1/2 bg-white/10" />
                  )}
                </div>
              );
            })}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex w-full gap-4">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex-1 flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-8 py-5 2xl:px-10 2xl:py-6 text-center"
              >
                <Skeleton className="h-8 w-12 2xl:h-9" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))
          : statsData.map((stat) => (
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
