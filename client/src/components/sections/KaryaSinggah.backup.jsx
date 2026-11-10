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

export default function KaryaSinggah() {
  const [projects, setProjects] = useState([]);
  const [active, setActive] = useState("Semua");
  const [error, setError] = useState(false);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const scroller = useRef(null);

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
      : projects.filter((p) => (p.category || p.categoryName) === active);

  const updateArrows = () => {
    const el = scroller.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows);
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [filtered]);

  const scrollByCard = (dir) => {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector("[data-card]");
    const w = card ? card.offsetWidth + 20 : 300;
    el.scrollBy({ left: dir * w, behavior: "smooth" });
  };

  const select = (c) => {
    setActive(c);
    if (scroller.current) scroller.current.scrollTo({ left: 0, behavior: "smooth" });
  };

  return (
    <section style={{ background: "#043fa9", padding: "150px 0 96px" }}>
      <div className="mx-auto max-w-[1100px] px-4">
        <h2
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 300,
            fontSize: "clamp(2.4rem, 5.5vw, 4rem)",
            letterSpacing: "-0.025em",
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
            color: "rgba(255,255,255,0.88)",
            maxWidth: "720px",
            margin: "18px auto 40px",
            textAlign: "center",
          }}
        >
          Karya mahasiswa dan dosen Elektro Poliban. Geser untuk lihat lebih banyak.
        </p>
        <div className="flex flex-wrap justify-center gap-1.5 mb-10">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              aria-pressed={active === c}
              onClick={() => select(c)}
              className="rounded-full px-5 py-2.5 text-sm"
              style={{
                background: active === c ? "#fff" : "transparent",
                color: active === c ? "#0F172A" : "rgba(255,255,255,0.9)",
                border: "none",
              }}
              onMouseEnter={(e) => {
                if (active !== c) e.currentTarget.style.background = "rgba(255,255,255,0.14)";
              }}
              onMouseLeave={(e) => {
                if (active !== c) e.currentTarget.style.background = "transparent";
              }}
            >
              {c}
            </button>
          ))}
        </div>
        {error ? (
          <p style={{ color: "#fff", textAlign: "center", opacity: 0.8 }}>
            Karya belum bisa dimuat, coba muat ulang halaman.
          </p>
        ) : filtered.length === 0 ? (
          <div
            style={{
              border: "1px dashed rgba(255,255,255,0.4)",
              height: "clamp(360px, 45vw, 480px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              borderRadius: "16px",
            }}
          >
            Belum ada karya di kategori ini.
          </div>
        ) : (
          <div
            ref={scroller}
            tabIndex={0}
            aria-label="Slideshow karya"
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4"
            style={{ scrollbarWidth: "none" }}
          >
            {filtered.map((p, i) => (
              <a
                key={i}
                data-card
                href={p.link || p.url || "#"}
                className="snap-start shrink-0 rounded-2xl overflow-hidden relative"
                style={{ width: "clamp(280px, 30vw, 380px)", aspectRatio: "4/5" }}
              >
                {p.thumbnail ? (
                  <img
                    src={p.thumbnail}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement.querySelector(".ph").style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="ph"
                  style={{
                    display: p.thumbnail ? "none" : "flex",
                    position: "absolute",
                    inset: 0,
                    background: "#1A4FC4",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: "16px",
                    background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)",
                  }}
                >
                  <div style={{ color: "#fff", fontSize: "1rem", fontWeight: 500 }}>{p.title}</div>
                  <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.75rem", marginTop: "2px" }}>
                    {p.category || p.categoryName}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
        <div className="flex justify-center gap-3 mt-8">
          <button
            onClick={() => scrollByCard(-1)}
            disabled={!canLeft}
            aria-label="Sebelumnya"
            className="h-12 w-12 rounded-full flex items-center justify-center"
            style={{
              border: "1.5px solid #fff",
              background: "transparent",
              color: "#fff",
              opacity: canLeft ? 1 : 0.4,
              cursor: canLeft ? "pointer" : "default",
            }}
            onMouseEnter={(e) => {
              if (canLeft) {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.color = "#2563eb";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#fff";
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={() => scrollByCard(1)}
            disabled={!canRight}
            aria-label="Berikutnya"
            className="h-12 w-12 rounded-full flex items-center justify-center"
            style={{
              border: "1.5px solid #fff",
              background: "transparent",
              color: "#fff",
              opacity: canRight ? 1 : 0.4,
              cursor: canRight ? "pointer" : "default",
            }}
            onMouseEnter={(e) => {
              if (canRight) {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.color = "#2563eb";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#fff";
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}