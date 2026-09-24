import { useEffect, useMemo, useRef, useState } from "react";
import {
  Layers,
  LayoutGrid,
  Users,
  PenTool,
  ShieldCheck,
  Tags,
  Radio,
  UserPlus,
} from "lucide-react";
import Skeleton from "../../ui/Skeleton";
import api from "../../../services/api";

const COUNT_DURATION = 1000;

function useInView() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return [ref, inView];
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

function formatCount(value) {
  const num = Number(String(value ?? "").replace(/\D/g, ""));
  return Number.isFinite(num) ? num : null;
}

function Counter({ value, className = "", active = false }) {
  const reduced = useReducedMotion();
  const target = useMemo(() => formatCount(value), [value]);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (target === null || !active) return undefined;
    let raf;
    if (reduced) {
      raf = requestAnimationFrame(() => setDisplay(target));
      return () => cancelAnimationFrame(raf);
    }
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / COUNT_DURATION);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced, active]);

  if (target === null) {
    return <span className={`font-mono ${className}`}>{value}</span>;
  }

  const compact =
    target >= 1000
      ? `${(target / 1000).toFixed(1).replace(".0", "")}k`
      : null;

  return (
    <span className={`font-mono tabular-nums ${className}`}>
      {compact ?? display}
    </span>
  );
}

const badgeCls =
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide";

const badgeLight =
  "light:border-emerald-200/70 light:bg-emerald-50 light:text-emerald-700";

const cardCls =
  "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.09] light:border-slate-200/70 light:bg-white light:shadow-[0_10px_30px_-12px_rgba(2,10,26,0.35)] light:hover:bg-white";

function HeroStats() {
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

  const items = [
    {
      label: "Karya",
      value: stats.projectsCount,
      icon: Layers,
      chip: "from-cyan-400 to-blue-600 text-white shadow-cyan-500/30",
      labelColor: "text-cyan-300 light:text-blue-600",
      plus: "text-cyan-300 light:text-blue-600",
      glow: "bg-cyan-400/10 group-hover:bg-cyan-400/25",
      desc: "Karya mahasiswa & dosen Elektro Poliban yang ditampilkan di galeri virtual.",
      badge: (
        <span className={`${badgeCls} border-emerald-400/30 bg-emerald-400/10 text-emerald-300 ${badgeLight}`}>
          <ShieldCheck className="h-3 w-3" /> TERVERIFIKASI
        </span>
      ),
    },
    {
      label: "Kategori",
      value: stats.categoriesCount,
      icon: LayoutGrid,
      chip: "from-cyan-400 to-blue-600 text-white shadow-cyan-500/30",
      labelColor: "text-cyan-300 light:text-blue-600",
      plus: "text-cyan-300 light:text-blue-600",
      glow: "bg-sky-400/10 group-hover:bg-sky-400/25",
      desc: "Kategori karya yang dihadirkan dalam galeri virtual SINGGAH.",
      badge: (
        <span className={`${badgeCls} border-emerald-400/30 bg-emerald-400/10 text-emerald-300 ${badgeLight}`}>
          <Tags className="h-3 w-3" /> TERINDEKS
        </span>
      ),
    },
    {
      label: "Pengunjung",
      value: stats.visitorsCount,
      icon: Users,
      chip: "from-cyan-400 to-blue-600 text-white shadow-cyan-500/30",
      labelColor: "text-cyan-300 light:text-blue-600",
      plus: "text-cyan-300 light:text-blue-600",
      glow: "bg-emerald-400/10 group-hover:bg-emerald-400/25",
      desc: "Pengunjung yang telah singgah menikmati galeri virtual SINGGAH.",
      badge: (
        <span className={`${badgeCls} border-emerald-400/30 bg-emerald-400/10 text-emerald-300 ${badgeLight}`}>
          <Radio className="h-3 w-3" /> TERPANTAU
        </span>
      ),
    },
    {
      label: "Kontributor",
      value: stats.usersCount,
      icon: PenTool,
      chip: "from-cyan-400 to-blue-600 text-white shadow-cyan-500/30",
      labelColor: "text-cyan-300 light:text-blue-600",
      plus: "text-cyan-300 light:text-blue-600",
      glow: "bg-indigo-400/10 group-hover:bg-indigo-400/25",
      desc: "Pengguna terdaftar yang turut berkontribusi karya di SINGGAH.",
      badge: (
        <span className={`${badgeCls} border-emerald-400/30 bg-emerald-400/10 text-emerald-300 ${badgeLight}`}>
          <UserPlus className="h-3 w-3" /> BERGABUNG
        </span>
      ),
    },
  ];

  const [gridRef, inView] = useInView();

  return (
    <div
      ref={gridRef}
      className="grid w-full grid-cols-1 gap-3 min-[600px]:grid-cols-2 min-[1200px]:grid-cols-4 min-[1200px]:gap-5"
    >
      {loading
        ? Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`${cardCls} pointer-events-none`}
            >
              <div className="flex items-start justify-between">
                <Skeleton className="h-11 w-11 rounded-xl" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="mt-4">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="mt-1 h-3 w-full" />
                <Skeleton className="mt-1 h-3 w-3/4" />
              </div>
            </div>
          ))
        : items.map((c, i) => {
            const Icon = c.icon;
            return (
              <div
                key={c.label}
                style={{ transitionDelay: `${i * 120}ms` }}
                className={`${cardCls} ${
                  inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
              >
                <div
                  aria-hidden="true"
                  className={`absolute -right-12 -top-12 h-28 w-28 rounded-full blur-2xl transition-all ${c.glow}`}
                />
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br shadow-lg transition-transform duration-300 group-hover:scale-105 ${c.chip}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  {c.badge}
                </div>
                <div className="mt-4 min-w-0">
                  <div className="flex items-end gap-2.5">
                    <Counter
                      value={c.value}
                      active={inView}
                      className="font-mono text-5xl font-extrabold tracking-tight leading-none text-white light:text-slate-900"
                    />
                    <span
                      className={`mb-1 shrink-0 font-sans text-xl font-extrabold uppercase tracking-wide ${c.labelColor}`}
                    >
                      {c.label}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-400 light:text-slate-500">
                    {c.desc}
                  </p>
                </div>
              </div>
            );
          })}
    </div>
  );
}

export default HeroStats;