import { useCallback, useEffect, useRef, useState } from "react";
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
  const [offset, setOffset] = useState(0); // for transition
  const timerRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/projects", { params: { status: "published", limit: 100 } });
        const items = res.data.data.items || res.data.data || [];
        if (cancelled) return;
        setProjects(Array.isArray(items) ? items : []);
        setError(false);
      } catch {
        if (cancelled) return;
        setProjects([]);
        setError(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered =
    active === "Semua"
      ? projects
      : projects.filter((p) => niceCategory(p.category || p.categoryName) === active);

  const countFor = (cat) =>
    cat === "Semua"
      ? projects.length
      : projects.filter((p) => niceCategory(p.category || p.categoryName) === cat).length;

  const goTo = useCallback(
    (i) => {
      if (filtered.length === 0) return;
      const next = ((i % filtered.length) + filtered.length) % filtered.length;
      setIndex(next);
      setOffset(0);
      if (progressRef.current) {
        progressRef.current.style.transition = "none";
        progressRef.current.style.width = "0%";
      }
    },
    [filtered.length]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // auto advance
  useEffect(() => {
    if (paused || filtered.length <= 1 || error) return;
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      next();
    }, 5000);
    // progress bar
    if (progressRef.current) {
      progressRef.current.style.transition = "none";
      progressRef.current.style.width = "0%";
      requestAnimationFrame(() => {
        if (progressRef.current) {
          progressRef.current.style.transition = "width 5000ms linear";
          progressRef.current.style.width = "100%";
        }
      });
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index, paused, filtered.length, error, next]);

  const select = (c) => {
    setActive(c);
    setIndex(0);
  };

  const current = filtered[index];

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
                onClick={() => select(c)}
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

        {filtered.length === 0 ? (
          <p style={{ color: "#fff", opacity: 0.8, textAlign: "center", minHeight: "200px" }}>
            Belum ada karya di kategori ini.
          </p>
        ) : (
          <>
            <div
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocus={() => setPaused(true)}
              onBlur={() => setPaused(false)}
              onTouchStart={() => setPaused(true)}
              onTouchEnd={() => setPaused(false)}
              style={{ maxWidth: "900px", margin: "0 auto" }}
            >
              <div
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "6px",
                }}
              >
                <img
                  src={current.thumbnail || current.image}
                  alt={current.title}
                  style={{
                    width: "100%",
                    maxHeight: "70vh",
                    objectFit: "contain",
                    display: "block",
                    margin: "0 auto",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  marginTop: "12px",
                  maxWidth: "900px",
                }}
              >
                <div>
                  <div style={{ color: "#fff", fontFamily: "'Poppins', sans-serif", fontWeight: 400, fontSize: "1.05rem" }}>
                    {current.title}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", marginTop: "2px" }}>
                    {niceCategory(current.category || current.categoryName)}
                  </div>
                </div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}>
                  {index + 1} / {filtered.length}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "20px", alignItems: "center" }}>
                <button
                  onClick={prev}
                  aria-label="Sebelumnya"
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    border: "1.5px solid #fff",
                    background: "transparent",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <div style={{ width: "200px", height: "2px", background: "rgba(255,255,255,0.3)", borderRadius: "2px", overflow: "hidden" }}>
                  <div ref={progressRef} style={{ height: "100%", width: "0%", background: "#fff" }} />
                </div>
                <button
                  onClick={next}
                  aria-label="Berikutnya"
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    border: "1.5px solid #fff",
                    background: "transparent",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}