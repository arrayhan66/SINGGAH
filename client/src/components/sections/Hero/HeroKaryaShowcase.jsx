import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  History,
  Layers,
} from "lucide-react";
import api from "../../../services/api";
import { imageUrl, buildSrcSet } from "../../../utils/imageUrl";
import { useTheme } from "../../../context/ThemeContext";
import SmartImage from "../../ui/SmartImage";
import { SLIDESHOW_MAX_ITEMS } from "../../../constants/slideshow";
import HeroCat from "./HeroCat";

// Jumlah maksimal karya yang dimuat dari API.
const FETCH_LIMIT = 50;
// Jumlah maksimal slide yang ditampilkan di carousel hero.
const MAX_SLIDES = SLIDESHOW_MAX_ITEMS;

function normalizeProject(p) {
  const Category = p.Category || {};
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    description:
      p.description ||
      "Karya inovatif dari civitas akademika Politeknik Negeri Banjarmasin.",
    category: Category.name || "Karya",
    categorySlug: Category.slug || "karya",
    thumbnail: p.thumbnail,
    year: p.year,
    author: (p.User && p.User.name) || "",
    status: p.status,
    updatedAt: p.updatedAt || p.updated_at || "",
    isShownInSlideshow: Boolean(p.is_shown_in_slideshow),
  };
}

// Format tanggal update terakhir ke Bahasa Indonesia.
function formatDate(v) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Label status karya untuk badge "Status".
const STATUS_MAP = {
  published: "Aktif",
  active: "Aktif",
  draft: "Draf",
  archived: "Arsip",
};

// Tinggi kartu dibuat 56.25% dari lebar lewat padding-top
const CARD_HEIGHT_STYLE = { paddingTop: "56.25%", height: "0px" };

const getPos = (i, active, count) => {
  if (count === 0) return "hidden";
  const off = (((i - active) % count) + count) % count;
  if (off === 0) return "0";
  if (off === 1) return "1";
  if (off === 2 && count >= 3) return "2";
  if (off === count - 1 && count >= 4) return "prev";
  return "hidden";
};

function HeroKaryaShowcase({ variant }) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isLight = (variant || theme) === "light";

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchSlides = async () => {
      try {
        const res = await api.get("/projects", {
          params: { status: "published", limit: FETCH_LIMIT, slideshow: "true" },
        });
        const items = res.data.data.items || res.data.data || [];
        const normalized = items
          .map(normalizeProject)
          .filter((p) => p.isShownInSlideshow && p.title && p.slug);
        if (cancelled) return;
        setProjects(normalized);
        setActive(0);
      } catch {
        if (cancelled) return;
        setProjects([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchSlides();
    return () => {
      cancelled = true;
    };
  }, []);

  const slides = useMemo(
    () => projects.filter((p) => p.isShownInSlideshow).slice(0, MAX_SLIDES),
    [projects]
  );

  const count = slides.length;
  const preview = count ? slides[active] : null;

  const activeRef = useRef(0);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const goTo = useCallback(
    (i) => {
      if (count <= 1) return;
      const nextIdx = ((i % count) + count) % count;
      if (nextIdx === activeRef.current) return;
      setActive(nextIdx);
    },
    [count]
  );
  const next = useCallback(() => goTo(activeRef.current + 1), [goTo]);
  const prev = useCallback(() => goTo(activeRef.current - 1), [goTo]);

  useEffect(() => {
    if (paused || count < 2) return;
    const t = setInterval(() => goTo(activeRef.current + 1), 4000);
    return () => clearInterval(t);
  }, [paused, count, goTo]);

  const openDetail = () => {
    if (!preview) return;
    navigate(`/karya/${preview.categorySlug}/${preview.slug || preview.id}`);
  };

  const badges = preview
    ? [
        { key: "cat", icon: Layers, label: "Kategori", value: preview.category, pos: "tl", anim: "a", delay: "0s" },
        {
          key: "status",
          icon: BadgeCheck,
          label: "Status",
          value: STATUS_MAP[preview.status] || preview.status || "Aktif",
          pos: "br",
          anim: "b",
          delay: "0.7s",
        },
        {
          key: "updated",
          icon: History,
          label: "Update Terakhir",
          value: formatDate(preview.updatedAt),
          pos: "tr",
          anim: "d",
          delay: "1.4s",
        },
      ]
    : [];

  const cls = {
    blobA: isLight ? "bg-gradient-to-br from-blue-400/30 to-cyan-300/20" : "bg-gradient-to-br from-cyan-500/50 to-blue-600/40",
    blobB: isLight ? "bg-gradient-to-tr from-sky-300/30 to-blue-400/20" : "bg-gradient-to-tr from-blue-600/40 to-cyan-500/30",
    skeleton: isLight ? "bg-blue-100/60" : "bg-slate-800/40",
    imgOverlay: isLight
      ? "bg-gradient-to-t from-[#01101f] via-[#0a2b52]/65 to-transparent"
      : "bg-gradient-to-t from-[#010c1c] via-[#08243f]/45 to-transparent",
    eyebrow:
      "[text-shadow:0_1px_0_rgba(0,0,0,0.85),0_0_6px_rgba(1,10,25,0.9)]",
    title:
      "[text-shadow:0_1px_0_rgba(0,0,0,0.9),0_2px_10px_rgba(1,10,25,0.95)] text-white",
    nav: isLight
      ? "border-blue-400/50 bg-gradient-to-br from-white via-blue-50 to-blue-100 text-blue-600 shadow-[0_8px_22px_-8px_rgba(37,99,235,0.5),0_0_14px_rgba(56,189,248,0.25)] ring-1 ring-blue-200/60 hover:scale-110 hover:border-blue-500 hover:from-blue-50 hover:via-blue-100 hover:to-blue-200 hover:text-blue-700 hover:shadow-[0_10px_26px_-8px_rgba(37,99,235,0.65),0_0_18px_rgba(56,189,248,0.35)] hover:ring-blue-300/70"
      : "border-cyan-300/40 bg-[#041d38]/75 text-cyan-300 shadow-[0_6px_20px_-6px_rgba(2,12,32,0.8),0_0_12px_rgba(34,211,238,0.4)] hover:border-cyan-300/70 hover:text-cyan-200",
  };

  return (
    <div
      className="hero-karya-showcase group relative w-full max-w-[640px] mx-auto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -top-14 right-0 z-0 h-56 w-56 animate-karta-pulse rounded-full blur-[90px] opacity-60 md:h-72 md:w-72 ${cls.blobA}`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -bottom-12 -left-14 z-0 h-64 w-64 animate-karta-pulse-slow rounded-full blur-[100px] md:h-80 md:w-80 ${cls.blobB}`}
      />

      <div className="relative z-20">
        <div className="peek-frame">
          {!loading && count > 0 && <HeroCat />}
          <div className="peek-stage">
            {loading ? (
              <div className="showcase-card relative overflow-hidden rounded-2xl" style={CARD_HEIGHT_STYLE}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-6 w-24 animate-pulse rounded-md bg-white/10" />
                </div>
              </div>
            ) : count === 0 ? (
              <div className={`showcase-card relative overflow-hidden rounded-2xl ${isLight ? "bg-blue-50" : "bg-[#041d38]"}`} style={CARD_HEIGHT_STYLE}>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
                  <Layers size={28} className={isLight ? "text-blue-400" : "text-cyan-400"} />
                  <p className={`text-sm font-semibold ${isLight ? "text-blue-700" : "text-cyan-200"}`}>
                    Belum ada karya unggulan
                  </p>
                  <p className={`text-xs ${isLight ? "text-blue-500" : "text-slate-400"}`}>
                    Admin belum memilih karya untuk slideshow beranda.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div aria-hidden="true" style={CARD_HEIGHT_STYLE} />
                {slides.map((slide, idx) => {
                  const pos = getPos(idx, active, count);
                  const isActiveCard = pos === "0";
                  return (
                    <div
                      key={slide.id}
                      className="peek-card"
                      data-pos={pos}
                      aria-hidden={pos !== "0"}
                    >
                      <div className="showcase-card relative h-full w-full overflow-hidden rounded-2xl">
                        <SmartImage
                          src={imageUrl(slide.thumbnail)}
                          srcSet={buildSrcSet(slide.thumbnail)}
                          sizes="(min-width: 768px) 640px, 92vw"
                          alt={slide.title}
                          eager={idx === 0}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className={`pointer-events-none absolute inset-0 ${cls.imgOverlay}`} />
                        <div aria-hidden="true" className="showcase-glass pointer-events-none absolute inset-0" />
                        {isActiveCard && (
                          <>
                            <button
                              type="button"
                              onClick={openDetail}
                              aria-label={`Buka detail ${slide.title}`}
                              className="absolute inset-0 z-10 cursor-pointer"
                            />
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 pb-3 pl-3 pr-32 sm:pb-4 sm:pl-5 sm:pr-36 lg:pb-5 lg:pl-6 lg:pr-40">
                              <span
                                className={`karta-eyebrow text-[9px] font-black uppercase tracking-[0.22em] lg:text-[10px] ${cls.eyebrow}`}
                                style={{ color: "#67e8f9" }}
                              >
                                Karya Unggulan
                              </span>
                              <h3
                                className={`mt-1 text-base font-extrabold leading-snug sm:text-xl lg:text-2xl ${cls.title}`}
                                style={{ color: "#ffffff" }}
                              >
                                {slide.title}
                              </h3>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {preview && !loading && count > 0 && (
            <div className="pointer-events-none absolute inset-0 z-30">
              {badges.map((b) => {
                const Icon = b.icon;
                return (
                  <div key={b.key} className={`karta-bpos karta-bpos-${b.pos}`}>
                    <div className={`karta-float karta-float-${b.anim}`} style={{ animationDelay: b.delay }}>
                      <span aria-hidden="true" className="badge-aura" />
                      <div className="badge-shell">
                        <span className="badge-ico">
                          <Icon size={17} strokeWidth={2.3} />
                        </span>
                        <span className="badge-txt">
                          <b className="badge-value">{b.value}</b>
                          <em className="badge-label">{b.label}</em>
                        </span>
                        <span aria-hidden="true" className="badge-accent" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {count > 0 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Karya sebelumnya"
                className={`absolute -left-2 top-1/2 z-40 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 sm:-left-3 sm:h-9 sm:w-9 md:-left-4 md:h-10 md:w-10 ${cls.nav}`}
              >
                <ArrowLeft size={15} className="lg:h-4 lg:w-4" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Karya berikutnya"
                className={`absolute -right-2 top-1/2 z-40 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 sm:-right-3 sm:h-9 sm:w-9 md:-right-4 md:h-10 md:w-10 ${cls.nav}`}
              >
                <ArrowRight size={15} className="lg:h-4 lg:w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default HeroKaryaShowcase;