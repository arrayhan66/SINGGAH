// LIGHT MODE - versi pembanding skripsi, terpisah dari dark mode
import { useState, useEffect } from "react";
import Skeleton from "../../components/ui/Skeleton";
import GlassCard from "../../components/ui/GlassCard";
import { Layers, Grid3x3, Users, PenTool } from "lucide-react";
import api from "../../services/api";

function LightModeHeroStats() {
  const [stats, setStats] = useState({
    projectsCount: "–",
    categoriesCount: "–",
    visitorsCount: "–",
    usersCount: "–",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/stats")
      .then((res) => {
        const d = res.data.data || res.data;
        setStats({
          projectsCount: String(d.totalProject ?? "–"),
          categoriesCount: String(d.totalCategory ?? "–"),
          visitorsCount: String(d.totalVisitors ?? "–"),
          usersCount: String(d.totalUser ?? "–"),
        });
      })
      .catch((err) => {
        console.error("Failed to fetch public stats:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const statsData = [
    { icon: Layers, value: stats.projectsCount, label: "Karya" },
    { icon: Grid3x3, value: stats.categoriesCount, label: "Kategori" },
    { icon: Users, value: stats.visitorsCount, label: "Pengunjung" },
    { icon: PenTool, value: stats.usersCount, label: "Kontributor" },
  ];

  // DESKTOP (lg+): satu baris kartu terpisah per stat, versi terang.
  const cardCls =
    "flex-1 flex flex-col items-center justify-center gap-1 rounded-2xl px-8 py-5 2xl:px-10 2xl:py-6 text-center !cursor-default";

  const desktop = (
    <div className="w-full">
      <div className="flex w-full gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex-1 flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-5 2xl:px-10 2xl:py-6 text-center"
              >
                <Skeleton className="h-8 w-12 2xl:h-9 bg-slate-200" />
                <Skeleton className="h-4 w-20 bg-slate-200" />
              </div>
            ))
          : statsData.map((stat) => (
              <GlassCard light hover key={stat.label} className={cardCls}>
                <h2 className="text-3xl 2xl:text-4xl font-bold text-blue-600">
                  {stat.value}
                </h2>
                <p className="text-slate-500 2xl:text-lg">{stat.label}</p>
              </GlassCard>
            ))}
      </div>
    </div>
  );

  // MOBILE/Tablet (<lg): satu bar glass menyatu, versi terang.
  const mobile = (
    <div className="flex flex-col min-[500px]:flex-row items-center justify-between gap-6 min-[500px]:gap-0 rounded-2xl border border-slate-200 bg-white px-4 md:px-6 py-5 min-[500px]:py-4">
      {loading
        ? Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex w-full min-[500px]:w-auto flex-1 items-center justify-start min-[500px]:justify-center gap-4"
            >
              <Skeleton className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-slate-200" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-10 bg-slate-200" />
                <Skeleton className="h-3 w-16 bg-slate-200" />
              </div>
            </div>
          ))
        : statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="relative flex w-full min-[500px]:w-auto flex-1 items-center justify-start min-[500px]:justify-center gap-4"
              >
                <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                  <Icon className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                </div>

                <div className="text-left">
                  <p className="text-base min-[500px]:text-sm md:text-lg font-bold text-slate-900 leading-none">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[11px] md:text-sm text-slate-500 leading-none">
                    {stat.label}
                  </p>
                </div>

                {index < statsData.length - 1 && (
                  <div className="hidden min-[500px]:block absolute right-0 top-1/2 h-8 w-px -translate-y-1/2 bg-slate-300 md:h-10" />
                )}
                {index < statsData.length - 1 && (
                  <div className="block min-[500px]:hidden absolute -bottom-3 left-1/2 h-px w-[90%] -translate-x-1/2 bg-slate-200" />
                )}
              </div>
            );
          })}
    </div>
  );

  return (
    <>
      <div className="hidden lg:block w-full">{desktop}</div>
      <div className="lg:hidden w-full">{mobile}</div>
    </>
  );
}

export default LightModeHeroStats;