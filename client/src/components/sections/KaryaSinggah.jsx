import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Eye,
  User,
} from "lucide-react";
import api from "../../services/api";
import SmartImage from "../ui/SmartImage";

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

const CATEGORY_NAMES = {
  "artificial intelligence": "Artificial Intelligence",
  ai: "Artificial Intelligence",
  "cyber security": "Cyber Security",
  cybersecurity: "Cyber Security",
  "data science": "Data Science",
  "game developer": "Game Developer",
  "game development": "Game Developer",
  "game dev": "Game Developer",
  "internet of things": "Internet of Things",
  iot: "Internet of Things",
  "mobile app": "Mobile App",
  "mobile application": "Mobile App",
  "system design": "System Design",
  "ui/ux design": "UI/UX Design",
  "ui ux design": "UI/UX Design",
  "ui/ux": "UI/UX Design",
  website: "Website",
  web: "Website",
};

function niceCategory(raw) {
  if (!raw) return "";
  const key = String(raw)
    .toLowerCase()
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  if (CATEGORY_NAMES[key]) return CATEGORY_NAMES[key];

  return key
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function categoryOf(project) {
  if (!project) return "";
  const raw =
    project.Category?.name ||
    project.categoryName ||
    (typeof project.category === "string"
      ? project.category
      : project.category?.name || project.category?.slug) ||
    "";
  return niceCategory(raw);
}

function coverOf(project) {
  if (!project) return "";
  if (project.thumbnail) return project.thumbnail;
  if (project.image) return project.image;
  const first = Array.isArray(project.images) ? project.images[0] : null;
  return first?.image_url || first || "";
}

function projectHref(project) {
  if (!project) return "/karya";
  const category =
    project.Category?.slug ||
    (typeof project.category === "string"
      ? project.category
      : project.category?.slug);
  const key = project.slug || project.id;
  return category && key ? `/karya/${category}/${key}` : "/karya";
}

function slideOffset(i, index, total) {
  if (total <= 1) return i - index;
  let distance = i - index;
  if (distance > total / 2) distance -= total;
  if (distance < -total / 2) distance += total;
  return distance;
}

function NavButton({ direction, onClick, className = "" }) {
  const Icon = direction === "prev" ? ArrowLeft : ArrowRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "prev" ? "Karya sebelumnya" : "Karya berikutnya"}
      className={`flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-[0_12px_28px_-12px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#1D6FF2]/40 hover:text-[#1D6FF2] hover:shadow-[0_16px_34px_-14px_rgba(29,111,242,0.55)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D6FF2]/40 sm:h-12 sm:w-12 ${className}`}
    >
      <Icon className="h-5 w-5" strokeWidth={2.2} />
    </button>
  );
}

export default function KaryaSinggah() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [active, setActive] = useState("Semua");
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/projects", {
          params: { status: "published", limit: 100 },
        });
        const data = res.data?.data?.items || res.data?.data || [];
        if (cancelled) return;
        setProjects(Array.isArray(data) ? data : []);
        setError(false);
      } catch {
        if (cancelled) return;
        setProjects([]);
        setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const items =
    active === "Semua"
      ? projects
      : projects.filter((project) => categoryOf(project) === active);

  const countFor = (category) =>
    category === "Semua"
      ? projects.length
      : projects.filter((project) => categoryOf(project) === category).length;

  const selectCategory = (category) => {
    setActive(category);
    setIndex(0);
  };

  const go = (next) => {
    if (items.length === 0) return;
    setIndex(((next % items.length) + items.length) % items.length);
  };

  useEffect(() => {
    if (paused || loading || items.length < 2) return undefined;
    const timer = setTimeout(() => {
      setIndex((current) => (current + 1) % items.length);
    }, 6000);
    return () => clearTimeout(timer);
  }, [index, paused, loading, items.length]);

  const handleTouchStart = (event) => {
    touchStart.current = event.touches[0].clientX;
    setPaused(true);
  };

  const handleTouchEnd = (event) => {
    if (touchStart.current !== null) {
      const delta = event.changedTouches[0].clientX - touchStart.current;
      if (Math.abs(delta) > 42) go(index + (delta < 0 ? 1 : -1));
    }
    touchStart.current = null;
    setPaused(false);
  };

  const handleTouchCancel = () => {
    touchStart.current = null;
    setPaused(false);
  };

  return (
    <section className="relative overflow-hidden bg-[#F8FAFC] pt-[calc(var(--navbar-h)+64px)] pb-28 sm:pb-32 lg:pb-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        style={{
          background:
            "radial-gradient(60% 72% at 50% 0%, rgba(29,111,242,0.12) 0%, rgba(29,111,242,0.04) 42%, rgba(248,250,252,0) 76%)",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(15,23,42,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.035) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 68% 52% at 50% 32%, #000 18%, transparent 76%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 68% 52% at 50% 32%, #000 18%, transparent 76%)",
        }}
      />

      <svg
        aria-hidden="true"
        viewBox="0 0 1440 240"
        preserveAspectRatio="none"
        className="pointer-events-none absolute bottom-0 left-0 h-[160px] w-full sm:h-[210px]"
      >
        <path
          d="M0,118 C220,176 430,44 690,82 C950,120 1180,210 1440,138 L1440,240 L0,240 Z"
          fill="#EAF2FF"
        />
        <path
          d="M0,156 C250,208 520,84 760,122 C1000,160 1230,226 1440,174 L1440,240 L0,240 Z"
          fill="#DFEBFF"
          opacity="0.75"
        />
      </svg>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-8 right-8 z-20 hidden opacity-80 lg:block xl:right-14"
      >
        <svg width="132" height="96" viewBox="0 0 132 96" fill="none">
          <ellipse cx="66" cy="82" rx="44" ry="7" fill="#C7DBFF" opacity="0.55" />
          <path
            d="M29 66c-2-13 5-25 17-29 4-10 8-17 12-17s7 6 8 15c10-2 22 2 28 11 8 10 7 23-2 30-5 4-12 6-20 6H43c-8 0-13-7-14-16Z"
            fill="#F5F9FF"
            stroke="#A9C8FF"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M50 53c2-1 4-1 6 0M72 53c2-1 4-1 6 0"
            stroke="#8FB7FF"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M61 60c2 2 4 2 6 0"
            stroke="#8FB7FF"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M41 49l-8-4 5 9M87 49l8-4-5 9"
            stroke="#A9C8FF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M98 33c4-4 8-4 11 0M105 24c4-4 8-4 11 0"
            stroke="#A9C8FF"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-10">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1D6FF2] shadow-[0_6px_18px_-12px_rgba(29,111,242,0.5)] sm:text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1D6FF2]" />
            Galeri Karya
          </span>

          <h2 className="mt-5 text-[2.1rem] font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem]">
            Karya <span className="text-[#1D6FF2]">Singgah</span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
            Dari tugas kuliah sampai proyek yang sudah dipakai di lapangan.
            Geser untuk lihat yang lain.
          </p>

          <div className="mx-auto mt-6 h-[3px] w-14 rounded-full bg-gradient-to-r from-[#1D6FF2] to-[#8DBBFF]" />
        </div>

        <div className="mt-8 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-10">
          <div className="flex w-max min-w-full flex-nowrap items-center justify-center gap-2 px-1">
            {CATEGORIES.map((category) => {
              const selected = active === category;
              const total = countFor(category);
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => selectCategory(category)}
                  aria-pressed={selected}
                  className={`group flex shrink-0 items-center gap-1 rounded-full border px-3 py-2 text-xs font-medium transition-all duration-300 sm:px-2 sm:py-2 sm:text-[11px] ${
                    selected
                      ? "border-[#1D6FF2] bg-[#1D6FF2] text-white shadow-[0_8px_22px_-10px_rgba(29,111,242,0.8)]"
                      : "border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-[#1D6FF2]/40 hover:bg-blue-50/60 hover:text-[#1D6FF2] hover:shadow-[0_8px_20px_-14px_rgba(29,111,242,0.45)]"
                  }`}
                >
                  <span className="whitespace-nowrap">{category}</span>
                  <span
                    className={`text-[9px] tabular-nums transition-colors ${
                      selected
                        ? "text-white/70"
                        : "text-slate-400 group-hover:text-[#1D6FF2]/70"
                    }`}
                  >
                    {total}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {error ? (
          <div className="mx-auto mt-12 max-w-xl rounded-[24px] border border-slate-200 bg-white px-6 py-14 text-center shadow-[0_24px_60px_-32px_rgba(15,23,42,0.3)]">
            <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
              Karyanya gagal dimuat. Coba muat ulang halaman, ya.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#1D6FF2] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#155BD6]"
            >
              Muat ulang
            </button>
          </div>
        ) : loading ? (
          <div className="relative mt-12 h-[600px] sm:h-[580px] md:h-[480px] lg:h-[440px]">
            <div className="absolute left-1/2 top-1/2 h-full w-[min(84vw,860px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_30px_70px_-34px_rgba(15,23,42,0.35)]">
              <div className="grid h-full grid-cols-1 grid-rows-[220px_minmax(0,1fr)] md:grid-cols-[1.02fr_1fr] md:grid-rows-1">
                <div className="flex flex-col justify-center gap-4 p-6 sm:p-8">
                  <div className="h-6 w-24 animate-pulse rounded-full bg-slate-100" />
                  <div className="h-8 w-3/4 animate-pulse rounded-lg bg-slate-100" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
                  <div className="mt-2 h-11 w-36 animate-pulse rounded-full bg-slate-100" />
                </div>
                <div className="h-full animate-pulse bg-slate-100" />
              </div>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="mx-auto mt-12 max-w-xl rounded-[24px] border border-dashed border-slate-300 bg-white/80 px-6 py-16 text-center">
            <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
              Kategori ini belum ada isinya. Coba lihat kategori lain.
            </p>
            <button
              type="button"
              onClick={() => selectCategory("Semua")}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-[#1D6FF2]/40 hover:text-[#1D6FF2]"
            >
              Lihat semua karya
            </button>
          </div>
        ) : (
          <div className="mt-10 sm:mt-12">
            <div
              role="region"
              aria-roledescription="carousel"
              aria-label="Karya Singgah"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  go(index - 1);
                }
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  go(index + 1);
                }
              }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchCancel}
              className="relative h-[600px] touch-pan-y focus-visible:outline-none sm:h-[580px] md:h-[480px] lg:h-[440px]"
            >
              {items.map((project, i) => {
                const offset = slideOffset(i, index, items.length);
                const isActive = offset === 0;
                const distance = Math.abs(offset);
                if (distance > 2) return null;

                const scale = isActive ? 1 : distance === 1 ? 0.84 : 0.72;
                const shift = offset * 24;
                const category = categoryOf(project);
                const author = project.User?.name || project.user?.name || "";
                const cover = coverOf(project);
                const views = Number(project.viewsCount || 0);

                return (
                  <article
                    key={project.id || project.slug || i}
                    aria-roledescription="slide"
                    aria-label={`${i + 1} dari ${items.length}`}
                    aria-hidden={!isActive}
                    className="absolute left-1/2 top-1/2 h-full overflow-hidden rounded-[24px] border border-slate-200/80 bg-white will-change-transform"
                    style={{
                      width: "min(84vw, 860px)",
                      transform: `translate(calc(-50% ${shift >= 0 ? "+" : "-"} ${Math.abs(shift)}%), -50%) scale(${scale})`,
                      zIndex: isActive ? 30 : 20 - distance,
                      opacity: distance <= 1 ? 1 : 0,
                      boxShadow: isActive
                        ? "0 32px 72px -30px rgba(15,23,42,0.4)"
                        : "0 18px 44px -28px rgba(15,23,42,0.22)",
                      transition:
                        "transform 700ms cubic-bezier(0.22,1,0.36,1), opacity 500ms ease, box-shadow 500ms ease",
                    }}
                  >
                    <div
                      className={`absolute inset-0 transition-opacity duration-500 ${
                        isActive ? "opacity-100" : "pointer-events-none opacity-0"
                      }`}
                    >
                      <div className="grid h-full grid-cols-1 grid-rows-[220px_minmax(0,1fr)] md:grid-cols-[1.02fr_1fr] md:grid-rows-1">
                        <div className="order-2 flex min-h-0 flex-col justify-center p-6 sm:p-7 md:order-1 md:p-8 lg:p-10">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1D6FF2]">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#1D6FF2]" />
                              {category || "Karya"}
                            </span>
                            {project.year ? (
                              <span className="text-xs font-medium text-slate-400">
                                {project.year}
                              </span>
                            ) : null}
                          </div>

                          <h3 className="mt-4 line-clamp-2 text-[1.45rem] font-bold leading-tight text-slate-900 sm:text-3xl lg:text-[2rem]">
                            {project.title || "Tanpa Judul"}
                          </h3>

                          {project.description ? (
                            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-500 sm:text-[15px]">
                              {project.description}
                            </p>
                          ) : null}

                          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
                            {author ? (
                              <span className="inline-flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5 text-slate-400" />
                                <span className="max-w-[180px] truncate">{author}</span>
                              </span>
                            ) : null}
                            {project.year ? (
                              <span className="inline-flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                {project.year}
                              </span>
                            ) : null}
                            {views > 0 ? (
                              <span className="inline-flex items-center gap-1.5">
                                <Eye className="h-3.5 w-3.5 text-slate-400" />
                                {views}
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-7">
                            <Link
                              to={projectHref(project)}
                              tabIndex={isActive ? 0 : -1}
                              className="group inline-flex items-center gap-2 rounded-full bg-[#1D6FF2] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_26px_-12px_rgba(29,111,242,0.9)] transition-all duration-300 hover:bg-[#155BD6] hover:shadow-[0_16px_30px_-14px_rgba(29,111,242,0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D6FF2]/40 focus-visible:ring-offset-2"
                            >
                              Lihat Detail
                              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                            </Link>
                          </div>
                        </div>

                        <div className="relative order-1 overflow-hidden bg-blue-50/60 md:order-2">
                          <SmartImage
                            src={cover}
                            alt=""
                            aria-hidden="true"
                            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl"
                          />
                          <div className="absolute inset-0 bg-gradient-to-br from-white/55 via-white/25 to-blue-100/55" />
                          <SmartImage
                            src={cover}
                            alt={project.title || "Karya Singgah"}
                            className="relative z-10 h-full w-full object-contain p-4 sm:p-6"
                            eager={isActive}
                          />
                          <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-slate-900/5 via-transparent to-transparent" />
                        </div>
                      </div>
                    </div>

                    <div
                      className={`absolute inset-0 transition-opacity duration-500 ${
                        isActive ? "pointer-events-none opacity-0" : "opacity-100"
                      }`}
                    >
                      <SmartImage
                        src={cover}
                        alt={project.title || "Karya Singgah"}
                        className="h-full w-full object-cover"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/5 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
                          {category || "Karya"}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-white">
                          {project.title || "Tanpa Judul"}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}

              <NavButton
                direction="prev"
                onClick={() => go(index - 1)}
                className="absolute left-1 top-1/2 z-40 hidden -translate-y-1/2 md:flex lg:-left-6"
              />
              <NavButton
                direction="next"
                onClick={() => go(index + 1)}
                className="absolute right-1 top-1/2 z-40 hidden -translate-y-1/2 md:flex lg:-right-6"
              />
            </div>

            <div className="mt-7 flex flex-col items-center gap-3 sm:mt-8 sm:flex-row sm:justify-center sm:gap-4">
              <div className="flex items-center justify-center gap-3">
                <NavButton
                  direction="prev"
                  onClick={() => go(index - 1)}
                  className="md:hidden"
                />

                <div className="flex max-w-[240px] flex-wrap items-center justify-center gap-1 sm:max-w-none">
                  {items.map((project, i) => (
                    <button
                      key={project.id || project.slug || i}
                      type="button"
                      onClick={() => go(i)}
                      aria-label={`Tampilkan karya ke-${i + 1}`}
                      aria-current={i === index ? "true" : undefined}
                      className={`h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D6FF2]/40 ${
                        i === index
                          ? "w-5 bg-[#1D6FF2]"
                          : "w-1.5 bg-slate-300 hover:bg-slate-400"
                      }`}
                    />
                  ))}
                </div>

                <NavButton
                  direction="next"
                  onClick={() => go(index + 1)}
                  className="md:hidden"
                />
              </div>

              <span className="min-w-[52px] text-center text-xs font-medium tabular-nums text-slate-400 sm:text-right">
                {String(index + 1).padStart(2, "0")} /{" "}
                {String(items.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
