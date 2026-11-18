import { useEffect, useMemo, useRef, useState } from "react";
import {
  Layers,
  LayoutGrid,
  Users,
  PenTool,
} from "lucide-react";
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
    return <span className={`${className}`}>{value}</span>;
  }

  const compact =
    target >= 1000
      ? `${(target / 1000).toFixed(1).replace(".0", "")}k`
      : null;

  return (
    <span className={`tabular-nums ${className}`}>
      {compact ?? display}
    </span>
  );
}

const GESER = ["-56px", "64px", "-24px", "80px"];
const KIRI = [
  [30, 120, 250],
  [10, 90, 200],
  [60, 180, 280],
  [20, 100, 230],
];
const KANAN = [
  [40, 200, 270],
  [70, 150, 260],
  [20, 110, 240],
  [50, 170, 290],
];

function HeroStats() {
  const [stats, setStats] = useState({
    projectsCount: "–",
    categoriesCount: "–",
    visitorsCount: "–",
    usersCount: "–",
  });
  const [, setLoading] = useState(true);

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
      icon: Layers,
      value: stats.projectsCount,
      chip: "from-cyan-400 to-blue-600 text-white shadow-cyan-500/30",
      labelColor: "text-cyan-300 light:text-blue-600",
      plus: "text-cyan-300 light:text-blue-600",
      glow: "bg-cyan-400/10 group-hover:bg-cyan-400/25",
      kiri: "Terdapat",
      kanan: "dari civitas akademika",
    },
    {
      label: "Kategori",
      icon: LayoutGrid,
      varian: "gelap",
      value: stats.categoriesCount,
      chip: "from-cyan-400 to-blue-600 text-white shadow-cyan-500/30",
      labelColor: "text-cyan-300 light:text-blue-600",
      plus: "text-cyan-300 light:text-blue-600",
      glow: "bg-sky-400/10 group-hover:bg-sky-400/25",
      kiri: "sesuai jenisnya",
      kanan: "Tersusun dalam",
    },
    {
      label: "Pengunjung",
      icon: Users,
      value: stats.visitorsCount,
      chip: "from-cyan-400 to-blue-600 text-white shadow-cyan-500/30",
      labelColor: "text-cyan-300 light:text-blue-600",
      plus: "text-cyan-300 light:text-blue-600",
      glow: "bg-emerald-400/10 group-hover:bg-emerald-400/25",
      kiri: "Sudah ada",
      kanan: "yang singgah",
    },
    {
      label: "Kontributor",
      icon: PenTool,
      varian: "gelap",
      value: stats.usersCount,
      chip: "from-cyan-400 to-blue-600 text-white shadow-cyan-500/30",
      labelColor: "text-cyan-300 light:text-blue-600",
      plus: "text-cyan-300 light:text-blue-600",
      glow: "bg-indigo-400/10 group-hover:bg-indigo-400/25",
      kiri: "yang menaruh karyanya",
      kanan: "Ada juga",
    },
  ];

  const [gridRef, inView] = useInView();

  return (
    <div ref={gridRef} className="stats-jaring relative w-full">
                      <style>{`
.stats-jaring{display:flex;flex-direction:column;align-items:center;gap:12px;width:100%}
.stats-baris{position:relative;display:flex;flex-direction:column;align-items:stretch;gap:8px;width:100%;max-width:520px}
.stats-sambung,.stats-kipas{display:none}
.stats-masuk{display:block;opacity:0;transform:translate3d(0,14px,0);transition:opacity 600ms cubic-bezier(0.22,1,0.36,1),transform 800ms cubic-bezier(0.22,1,0.36,1);transition-delay:var(--d,0ms)}
.stats-masuk.is-in{opacity:1;transform:translate3d(0,0,0)}
.stats-chip{position:relative;z-index:1;box-sizing:border-box;display:flex;align-items:center;gap:0;height:52px;padding:0 18px;border-radius:0;white-space:nowrap}
.stats-terang{background:var(--color-accent-primary);border:1px solid var(--color-accent-primary);color:#0f172a;border-radius:0;box-shadow:none;transition:background-color 200ms ease,border-color 200ms ease}
.stats-terang:hover,.stats-terang:focus-visible{background-color:#1d4ed8;border-color:#1d4ed8}
.stats-terang.stats-gelap{background:#0f172a;border-color:#0f172a}
.stats-terang.stats-gelap:hover,.stats-terang.stats-gelap:focus-visible{background-color:#1e293b;border-color:#1e293b}
.stats-redup{background:#f1f5f9;border:1px solid #e9edf3;color:#64748b;font-size:20px;font-weight:400;border-radius:0;box-shadow:none}
.stats-angka{font-family:var(--font-headline);font-size:20px;line-height:1;font-weight:600;color:#ffffff;font-variant-numeric:tabular-nums}
.stats-label{font-size:20px;line-height:1;font-weight:600;letter-spacing:0;text-transform:none;margin:0 0 0 8px;color:#ffffff}
.stats-icon{transition:transform 200ms ease}
.stats-terang:hover .stats-icon,.stats-terang:focus-visible .stats-icon{transform:translateY(-2px)}
@media (max-width:1199.98px){
.stats-chip,.stats-redup{font-size:16px}
}
@media (min-width:1200px){
.stats-jaring{gap:20px}
.stats-baris{flex-direction:row;align-items:center;gap:0;width:auto;max-width:none;left:var(--geser)}
.stats-balik{flex-direction:row-reverse}
.stats-sambung{display:block;flex:none;width:40px;height:1px;background:#cbd5e1}
.stats-chip::before,.stats-chip::after{content:"";display:block;position:absolute;top:50%;width:3px;height:3px;margin-top:-1.5px;border-radius:0;background:#475569;z-index:2;pointer-events:none}
.stats-chip::before{left:-8px}
.stats-chip::after{right:-8px}
.stats-kipas{display:block;position:absolute;top:50%;width:100vw;height:300px;margin-top:-150px;overflow:visible;pointer-events:none;z-index:0;-webkit-mask-image:linear-gradient(90deg,#000 0%,#000 12%,rgba(0,0,0,0) 34%,rgba(0,0,0,0) 66%,#000 88%,#000 100%);mask-image:linear-gradient(90deg,#000 0%,#000 12%,rgba(0,0,0,0) 34%,rgba(0,0,0,0) 66%,#000 88%,#000 100%)}
.stats-kipas-kiri{right:calc(100% + 10px)}
.stats-kipas-kanan{left:calc(100% + 10px)}
}
@media (prefers-reduced-motion: reduce){
.stats-masuk,.stats-terang{transition:none}
.stats-masuk{opacity:1;transform:none;transition-delay:0ms}
}
`}</style>
      {items.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className={`stats-baris ${i % 2 === 1 ? "stats-balik" : ""}`}
            style={{
              "--geser": GESER[i % GESER.length],
            }}
          >
            <svg
              className="stats-kipas stats-kipas-kiri"
              aria-hidden="true"
              viewBox="0 0 100 300"
              preserveAspectRatio="none"
            >
              {KIRI[i % KIRI.length].map((y, k) => (
                <line
                  key={k}
                  x1="0"
                  y1={y}
                  x2={k < 2 ? 100 : 118}
                  y2="150"
                  stroke="#cbd5e1"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
            <div className={`stats-masuk ${inView ? "is-in" : ""}`} style={{ "--d": `${i * 120 + 0 * 60}ms` }}>
              <div className="stats-chip stats-redup">
                {c.kiri}
              </div>
            </div>
            <span className="stats-sambung" aria-hidden="true" />
            <div className={`stats-masuk ${inView ? "is-in" : ""}`} style={{ "--d": `${i * 120 + 1 * 60}ms` }}>
              <div className={`stats-chip stats-terang${c.varian === "gelap" ? " stats-gelap" : ""}`}>
                <Icon
                  className="stats-icon"
                  width={22}
                  height={22}
                  strokeWidth={1.75}
                  style={{ color: "#ffffff", marginRight: 10 }}
                />
                <Counter
                  value={c.value}
                  active={inView}
                  className="stats-angka tabular-nums"
                />
                <span className="stats-label font-sans">
                  {c.label}
                </span>
              </div>
            </div>
            <span className="stats-sambung" aria-hidden="true" />
            <div className={`stats-masuk ${inView ? "is-in" : ""}`} style={{ "--d": `${i * 120 + 2 * 60}ms` }}>
              <div className="stats-chip stats-redup">
                {c.kanan}
              </div>
            </div>
            <svg
              className="stats-kipas stats-kipas-kanan"
              aria-hidden="true"
              viewBox="0 0 100 300"
              preserveAspectRatio="none"
            >
              {KANAN[i % KANAN.length].map((y, k) => (
                <line
                  key={k}
                  x1="100"
                  y1={y}
                  x2={k < 2 ? 0 : -18}
                  y2="150"
                  stroke="#cbd5e1"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
          </div>
        );
      })}
    </div>
  );
}

export default HeroStats;
