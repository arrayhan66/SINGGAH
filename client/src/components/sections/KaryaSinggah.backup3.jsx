import { useEffect, useRef, useState } from "react";
import api from "../../services/api";

const CATEGORIES = [
  "Semua",
  "Artificial Intelligence",
  "Cyber Security",
  "Data Science",
  "Game Developer",
  "Internet of Things",
  "Mobile App",
  "System Design",
  "UI/UX Design",
  "Website",
];

const SLUG_TO_NAME = {
  "artificial-intelligence": "Artificial Intelligence",
  "cyber-security": "Cyber Security",
  "data-science": "Data Science",
  "game-developer": "Game Developer",
  "internet-of-things": "Internet of Things",
  "internet-of-things-iot": "Internet of Things",
  "mobile-app": "Mobile App",
  "system-design": "System Design",
  "ui-ux-design": "UI/UX Design",
  "website": "Website",
};

function niceCategory(raw) {
  if (!raw) return "";
  const key = String(raw).toLowerCase().trim();
  if (SLUG_TO_NAME[key]) return SLUG_TO_NAME[key];
  return key
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function KaryaSinggah() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(false);
  const [active, setActive] = useState("Semua");
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const startX = useRef(null);
  const total = projects.length === 0 ? 0 : (active === "Semua" ? projects.length : projects.filter((p) => niceCategory(p.category || p.categoryName) === active).length);

  const items =
    active === "Semua"
      ? projects
      : projects.filter((p) => niceCategory(p.category || p.categoryName) === active);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/projects", { params: { status: "published", limit: 100 } });
        const data = res.data.data.items || res.data.data || [];
        if (cancelled) return;
        setProjects(Array.isArray(data) ? data : []);
        setError(false);
      } catch {
        if (cancelled) return;
        setProjects([]);
        setError(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setIndex(0);
  }, [active, items.length]);

  const go = (i) => {
    if (items.length === 0) return;
    setIndex(((i % items.length) + items.length) % items.length);
  };

  useEffect(() => {
    if (paused || items.length < 2 || reduced) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % items.length), 5000);
    return () => clearTimeout(id);
  }, [index, paused, items.length, reduced]);

  const countFor = (cat) =>
    cat === "Semua"
      ? projects.length
      : projects.filter((p) => niceCategory(p.category || p.categoryName) === cat).length;

  if (error) {
    return (
      <section style={{ background: "#043fa9", padding: "150px 0 96px" }}>
        <div className="mx-auto max-w-[1100px] px-4 text-center">
          <h2 style={{ color: "#fff", fontFamily: "'Poppins', sans-serif", fontWeight: 300, fontSize: "clamp(2.4rem, 5.5vw, 4rem)", letterSpacing: "-0.02em" }}>
            Karya Singgah
          </h2>
          <p style={{ color: "#fff", opacity: 0.85, marginTop: "18px" }}>
            Karya belum bisa dimuat, coba muat ulang halaman.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section style={{ background: "#043fa9", padding: "150px 0 96px" }}>
      <div className="mx-auto max-w-[1100px] px-4">
        <h2
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 300,
            fontSize: "clamp(2.4rem, 5.5vw, 4rem)",
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
            color: "#fff",
            textAlign: "center",
          }}
        >
          Karya Singgah
        </h2>
        <p
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: "1rem",
            color: "rgba(255,255,255,0.85)",
            maxWidth: "720px",
            margin: "18px auto 40px",
            textAlign: "center",
          }}
        >
          Karya mahasiswa dan dosen Elektro Poliban. Geser untuk lihat lebih banyak.
        </p>
        <div className="flex flex-wrap justify-center gap-1.5 mb-10">
          {CATEGORIES.map((c) => {
            const n = countFor(c);
            const empty = c !== "Semua" && n === 0;
            return (
              <button
                key={c}
                aria-pressed={active === c}
                onClick={() => setActive(c)}
                className="rounded-full px-5 py-2.5 text-sm"
                style={{
                  background: active === c ? "#fff" : "transparent",
                  color: active === c ? "#0F172A" : "rgba(255,255,255,0.9)",
                  border: "none",
                  opacity: empty ? 0.45 : 1,
                }}
              >
                {c} <span style={{ opacity: 0.6, fontSize: "0.8em" }}>{n}</span>
              </button>
            );
          })}
        </div>

        {items.length === 0 ? (
          <p style={{ color: "#fff", opacity: 0.8, textAlign: "center", minHeight: "200px" }}>
            Belum ada karya di kategori ini.
          </p>
        ) : (
          <>
            <div
              style={{ maxWidth: 900, margin: "0 auto", overflow: "hidden", borderRadius: 6 }}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocus={() => setPaused(true)}
              onBlur={() => setPaused(false)}
              onTouchStart={(e) => { startX.current = e.touches[0].clientX; setPaused(true); }}
              onTouchEnd={(e) => {
                const dx = e.changedTouches[0].clientX - startX.current;
                if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
                setPaused(false);
              }}
            >
              <div
                style={{
                  display: "flex",
                  transform: `translateX(-${index * 100}%)`,
                  transition: reduced ? "none" : "transform 600ms cubic-bezier(.4,0,.2,1)",
                }}
              >
                {items.map((p, i) => (
                  <div key={p.id || i} style={{ flex: "0 0 100%" }}>
                    <img
                      src={p.thumbnail || p.image}
                      alt={p.title}
                      style={{ width: "100%", maxHeight: "70vh", objectFit: "contain", display: "block" }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div
              style={{
                maxWidth: 900,
                margin: "12px auto 0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <div>
                <div style={{ color: "#fff", fontFamily: "'Poppins', sans-serif", fontWeight: 400, fontSize: "1.05rem" }}>
                  {items[index].title}
                </div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", marginTop: "2px" }}>
                  {niceCategory(items[index].category || items[index].categoryName)}
                </div>
              </div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}>
                {index + 1} / {items.length}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "20px", alignItems: "center" }}>
              <button
                onClick={() => go(index - 1)}
                aria-label="Sebelumnya"
                style={{ width: "44px", height: "44px", borderRadius: "50%", border: "1.5px solid #fff", background: "transparent", color: "#fff", cursor: "pointer" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <div style={{ width: "200px", height: "2px", background: "rgba(255,255,255,0.3)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${((index + 1) / items.length) * 100}%`, background: "#fff", transition: "width 300ms" }} />
              </div>
              <button
                onClick={() => go(index + 1)}
                aria-label="Berikutnya"
                style={{ width: "44px", height: "44px", borderRadius: "50%", border: "1.5px solid #fff", background: "transparent", color: "#fff", cursor: "pointer" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}