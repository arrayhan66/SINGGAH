import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../services/api";
import { cloudinarySrc, isBrokenImage } from "../../utils/imageUrl";
import "./KategoriPopuler.css";
import thumbWebsite from "../../assets/images/categories/website.jpg";
import thumbGame from "../../assets/images/categories/game-developer.jpg";
import thumbIot from "../../assets/images/categories/internet-of-things.jpg";
import thumbMobile from "../../assets/images/categories/mobile-app.jpg";
import thumbAi from "../../assets/images/categories/ai.jpg";
import thumbCyber from "../../assets/images/categories/cyber-security.jpg";

// SEMENTARA: ganti dengan thumbnail dari database lalu hapus objek ini
const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const THUMB_SEMENTARA = {
  website: thumbWebsite,
  gamedeveloper: thumbGame,
  gamedevelopment: thumbGame,
  game: thumbGame,
  internetofthings: thumbIot,
  iot: thumbIot,
  mobileapp: thumbMobile,
  artificialintelligence: thumbAi,
  ai: thumbAi,
  cybersecurity: thumbCyber,
};
const thumbFor = (cat) =>
  THUMB_SEMENTARA[norm(cat.slug)] || THUMB_SEMENTARA[norm(cat.name)] || null;

const HEADING_LIKES = "Kategori yang paling banyak disukai";

function coverOf(project) {
  if (project?.thumbnail) return project.thumbnail;
  if (project?.image) return project.image;
  const first = Array.isArray(project?.images) ? project.images[0] : null;
  return first?.image_url || first || "";
}

function workTime(project) {
  const raw = project?.createdAt || project?.created_at;
  if (!raw) return 0;
  const time = new Date(raw).getTime();
  return Number.isFinite(time) ? time : 0;
}

function buildCategoryData(projects) {
  if (!Array.isArray(projects) || projects.length === 0) {
    return { items: [], heading: HEADING_LIKES };
  }

  const hasNumberField = (field) =>
    projects.some((project) => typeof project?.[field] === "number");

  let metric = "count";
  if (hasNumberField("viewsCount")) metric = "views";
  else if (hasNumberField("likesCount")) metric = "likes";
  else if (hasNumberField("bookmarksCount")) metric = "bookmarks";

  const valueOf = (project) => {
    if (metric === "likes") return Number(project?.likesCount) || 0;
    if (metric === "bookmarks") return Number(project?.bookmarksCount) || 0;
    if (metric === "views") return Number(project?.viewsCount) || 0;
    return 1;
  };

  const groups = new Map();

  for (const project of projects) {
    const category = project?.Category;
    if (!category?.slug || !category?.name) continue;
    if (category.is_active === false) continue;

    let group = groups.get(category.slug);
    if (!group) {
      group = {
        slug: category.slug,
        name: category.name,
        description: "",
        works: [],
      };
      groups.set(category.slug, group);
    }

    if (!group.description && typeof category.description === "string") {
      const text = category.description.trim();
      if (text) group.description = text;
    }

    group.works.push(project);
  }

  const items = [];

  for (const group of groups.values()) {
    if (group.works.length === 0) continue;

    let score = 0;
    let cover = "";
    let coverMetric = -1;
    let coverTime = -1;

    for (const work of group.works) {
      const value = valueOf(work);
      const time = workTime(work);
      score += value;

      if (value > coverMetric || (value === coverMetric && time > coverTime)) {
        coverMetric = value;
        coverTime = time;
        const rawCover = coverOf(work);
        cover =
          rawCover && !isBrokenImage(rawCover)
            ? cloudinarySrc(rawCover, { w: 900, q: 82 }) || rawCover
            : "";
      }
    }

    items.push({
      key: group.slug,
      slug: group.slug,
      name: group.name,
      desc: group.description,
      img: cover,
      score,
      visits: metric === "views" ? score : 0,
    });
  }

  items.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.name.localeCompare(b.name, "id");
  });

  return { items: items.slice(0, 8) };
}

export default function KategoriPopuler() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [page, setPage] = useState(0);

  function perView(w) {
    return w >= 1280 ? 5 : w >= 1024 ? 4 : w >= 768 ? 3 : w >= 640 ? 2 : 1;
  }

  const [n, setN] = useState(() =>
    perView(typeof window === "undefined" ? 1280 : window.innerWidth),
  );

  const [isDragging, setIsDragging] = useState(false);
  const [dragTranslate, setDragTranslate] = useState(null);

  const trackRef = useRef(null);
  const railRef = useRef(null);
  const startXRef = useRef(null);
  const baseTranslateRef = useRef(0);
  const stepPxRef = useRef(0);
  const pointerIdRef = useRef(null);
  const capturedRef = useRef(false);
  const lastXRef = useRef(0);
  const lastTRef = useRef(0);
  const velocityRef = useRef(0);
  const suppressClickRef = useRef(false);
  const handlersRef = useRef({});

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(false);

      try {
        const res = await api.get("/projects", {
          params: { status: "published", limit: 100 },
        });
        const data = res.data?.data?.items || res.data?.data || [];

        if (cancelled) return;
        setProjects(Array.isArray(data) ? data : []);
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

  useEffect(() => {
    const handler = () => setN(perView(window.innerWidth));
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const { items } = useMemo(
    () => buildCategoryData(projects),
    [projects],
  );

  const total = items.length;
  const maxIndex = Math.max(0, total - n);
  const pages = Math.max(1, Math.ceil(total / n));
  const pageSafe = Math.min(page, pages - 1);
  const index = Math.min(pageSafe * n, maxIndex);

  const measureDragGeometry = () => {
    const track = trackRef.current;
    const rail = railRef.current;
    if (!track || !rail) return null;

    const V = track.clientWidth;
    const gap =
      parseFloat(getComputedStyle(rail).columnGap || getComputedStyle(rail).gap) ||
      (window.innerWidth < 768 ? 16 : 20);
    const cardW = (V - (n - 1) * gap) / n;
    const step = cardW + gap;
    return { V, gap, step };
  };

  const handlePointerDown = (event) => {
    if (event.button !== 0) return;

    const track = trackRef.current;
    if (!track) return;

    const geo = measureDragGeometry();
    if (!geo) return;

    startXRef.current = event.clientX;
    baseTranslateRef.current = -index * geo.step;
    stepPxRef.current = geo.step;
    pointerIdRef.current = event.pointerId;
    capturedRef.current = false;
    lastXRef.current = event.clientX;
    lastTRef.current = event.timeStamp || performance.now();
    velocityRef.current = 0;
    suppressClickRef.current = false;

    setIsDragging(true);
    setDragTranslate(baseTranslateRef.current);
  };

  const handlePointerMove = (event) => {
    if (startXRef.current === null) return;

    const dx = event.clientX - startXRef.current;
    const geo = measureDragGeometry();
    if (!geo) return;

    const { step } = geo;
    stepPxRef.current = step;

    if (!capturedRef.current && Math.abs(dx) > 5) {
      const track = trackRef.current;
      if (track) {
        try {
          track.setPointerCapture(pointerIdRef.current);
          capturedRef.current = true;
        } catch {
          // pointer capture bisa gagal pada perangkat tertentu
        }
      }
    }

    if (Math.abs(dx) > 5) {
      suppressClickRef.current = true;
    }

    let next = baseTranslateRef.current + dx;
    const minTranslate = -maxIndex * step;
    const maxTranslate = 0;

    if (next > maxTranslate) {
      next = maxTranslate + (next - maxTranslate) * 0.3;
    } else if (next < minTranslate) {
      next = minTranslate + (next - minTranslate) * 0.3;
    }

    setDragTranslate(next);

    const now = event.timeStamp || performance.now();
    const dt = now - (lastTRef.current || now);
    if (dt > 0) {
      velocityRef.current = (event.clientX - (lastXRef.current || event.clientX)) / dt;
    }
    lastXRef.current = event.clientX;
    lastTRef.current = now;
  };

  const handlePointerUp = (event) => {
    if (startXRef.current === null) return;

    const dx = event.clientX - startXRef.current;
    const threshold = 0.15 * (trackRef.current ? trackRef.current.clientWidth : 0);
    const vel = velocityRef.current;

    const shouldSwipe =
      Math.abs(dx) > threshold || Math.abs(vel) > 0.5;

    let newPage = page;
    if (shouldSwipe) {
      if (dx < 0 || vel < 0) {
        newPage = Math.min(pages - 1, page + 1);
      } else {
        newPage = Math.max(0, page - 1);
      }
    }

    const track = trackRef.current;
    if (capturedRef.current && track) {
      try {
        track.releasePointerCapture(pointerIdRef.current);
      } catch {
        // pointer capture bisa gagal
      }
      capturedRef.current = false;
    }

    startXRef.current = null;
    pointerIdRef.current = null;
    setIsDragging(false);
    setDragTranslate(null);

    if (newPage !== page) {
      setPage(newPage);
    }
  };

  const handlePointerCancel = () => {
    if (startXRef.current === null) return;

    const track = trackRef.current;
    if (capturedRef.current && track) {
      try {
        track.releasePointerCapture(pointerIdRef.current);
      } catch {
        // pointer capture bisa gagal
      }
      capturedRef.current = false;
    }

    startXRef.current = null;
    pointerIdRef.current = null;
    setIsDragging(false);
    setDragTranslate(null);
  };

  const handleClickCapture = (event) => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  };

  useEffect(() => {
    handlersRef.current = {
      move: handlePointerMove,
      up: handlePointerUp,
      cancel: handlePointerCancel,
    };
  });

  useEffect(() => {
    const move = (e) => handlersRef.current.move && handlersRef.current.move(e);
    const up = (e) => handlersRef.current.up && handlersRef.current.up(e);
    const cancel = (e) => handlersRef.current.cancel && handlersRef.current.cancel(e);

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
    };
  }, []);

  if (error) return null;
  if (!loading && items.length === 0) return null;

  return (
    <>
      <style>
        {`
          .kp-track {
            --kp-n: 5;
            --kp-gap: 20px;
            overflow: hidden !important;
            scroll-snap-type: none !important;
            padding: 0 !important;
            cursor: grab;
            touch-action: pan-y;
          }
          .kp-arrowbtn:hover {
            background: #f8fafc !important;
            border-color: #cbd5e1 !important;
          }
          .kp-arrowbtn:focus-visible,
          .kp-dot:focus-visible {
            outline: 2px solid #0f172a;
            outline-offset: 2px;
          }
          .kp-dots {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
          }
          .kp-dot {
            box-sizing: border-box;
            position: relative;
            width: 20px;
            height: 3px;
            border-radius: 999px;
            background: #94a3b8;
            opacity: 1;
            padding: 0;
            margin: 0;
            border: 0;
            cursor: pointer;
            transition: width 400ms cubic-bezier(0.22, 1, 0.36, 1), background-color 250ms cubic-bezier(0.22, 1, 0.36, 1);
          }
          .kp-dot:hover:not(.is-active):not([aria-current="true"]) {
            background: #64748b;
          }
          .kp-dot::after {
            content: "";
            position: absolute;
            inset: -10px -4px;
          }
          .kp-dot[aria-current="true"],
          .kp-dot.is-active {
            width: 40px;
            background: #0f172a;
          }
          .kp-dot:focus-visible {
            outline: 2px solid #0f172a;
            outline-offset: 3px;
          }
          @media (max-width: 1279px) {
            .kp-track {
              --kp-n: 4;
            }
          }
          @media (max-width: 1023px) {
            .kp-track {
              --kp-n: 3;
            }
          }
          @media (max-width: 767px) {
            .kp-track {
              --kp-n: 2;
              --kp-gap: 16px;
            }
          }
          @media (max-width: 639px) {
            .kp-track {
              --kp-n: 1;
            }
          }
          .kp-card {
            flex: 0 0 calc((100% - (var(--kp-n) - 1) * var(--kp-gap)) / var(--kp-n)) !important;
            width: auto !important;
            min-width: 0 !important;
            max-width: none !important;
          }
          .kp-lihat {
            transition: background-color 200ms ease;
          }
          @media (hover:hover) {
            .kp-lihat:hover {
              background: #1d4ed8 !important;
            }
          }
          @media (max-width: 639px) {
            .kp-head {
              flex-direction: column;
              align-items: flex-start;
            }
            .kp-head-right {
              flex-direction: column;
              align-items: flex-start;
              align-self: flex-start;
              text-align: left;
            }
            .kp-geser {
              white-space: normal !important;
            }
          }
          .kp-img {
            filter: none !important;
            z-index: 0;
          }
          .kp-scrim {
            z-index: 1;
          }
          .kp-text,
          .kp-visits,
          .kp-arrow {
            z-index: 2;
          }
          .kp-text {
            position: absolute;
            left: 0;
            top: 16px;
            right: 0;
            padding: 0 16px;
            max-width: none;
            display: flex;
            flex-direction: column;
            gap: 0;
          }
          .kp-name {
            color: #ffffff !important;
            font-size: 17px;
            font-weight: 600;
            line-height: 1.25;
            margin: 0 0 8px 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .kp-sub {
            color: rgba(255, 255, 255, 0.94) !important;
            font-size: 13.5px;
            font-weight: 500;
            line-height: 1.45;
            text-wrap: pretty;
            overflow-wrap: normal;
            hyphens: manual;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
            min-height: calc(1.45em * 3);
          }
          .kp-sub::first-letter {
            text-transform: uppercase;
          }
          @media (hover:hover) {
            .kp-img {
              transition: transform 500ms cubic-bezier(.22,1,.36,1), opacity 300ms ease;
              will-change: transform;
            }
            .kp-card:hover .kp-img {
              transform: scale(1.05) !important;
            }
            .kp-track:has(.kp-card:hover) .kp-card:not(:hover) .kp-img {
              opacity: 0.78;
            }
            .kp-card:hover .kp-arrow svg {
              transform: rotate(0deg) !important;
            }
          }
        `}
      </style>
      <section className="kp" aria-labelledby="kp-title" style={{ paddingTop: 0, paddingBottom: 24 }}>
        <div className="kp-wrap">
          <div
            className="kp-head"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: 16,
              flexWrap: "wrap",
               paddingLeft: 0,
               paddingRight: 0,
               marginBottom: 24,
             }}
           >
             <div>
              <span
                style={{
                  display: "inline-block",
                  backgroundColor: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  borderRadius: "999px",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#334155",
                  padding: "4px 12px",
                  marginBottom: 16,
                }}
              >
                Kategori Unggulan
              </span>
              <h2
                id="kp-title"
                className="kp-title"
                style={{
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                  color: "#0f172a",
                  fontSize: 36,
                }}
              >
                Buka karya dari kategori{" "}
                <span style={{ color: "var(--color-accent-primary)" }}>favoritmu</span>
              </h2>
            </div>
            <div
              className="kp-head-right"
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 16,
                alignSelf: "flex-end",
                textAlign: "right",
              }}
            >
              <p
                className="kp-geser"
                style={{
                  margin: 0,
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: "#64748b",
                  textAlign: "right",
                  whiteSpace: "nowrap",
                }}
              >
                Geser untuk melihat kategori lainnya dan klik untuk membuka karyanya.
              </p>
            </div>
          </div>
        <div
          ref={trackRef}
          className="kp-track"
          style={{
            paddingLeft: 0,
            paddingRight: 0,
            scrollPaddingInline: 0,
            "--kp-n": n,
            cursor: isDragging ? "grabbing" : "grab",
            userSelect: isDragging ? "none" : undefined,
            touchAction: "pan-y",
          }}
          onPointerDown={handlePointerDown}
          onClickCapture={handleClickCapture}
        >
          <div
            ref={railRef}
            className="kp-rail"
            style={{
              display: "flex",
              gap: "var(--kp-gap)",
              width: "100%",
              willChange: "transform",
              transition: isDragging
                ? "none"
                : "transform 600ms cubic-bezier(.22,1,.36,1)",
              transform:
                dragTranslate !== null
                  ? `translateX(${dragTranslate}px)`
                  : `translateX(calc(${index} * -1 * ((100% - ${n - 1} * var(--kp-gap)) / ${n} + var(--kp-gap))))`,
            }}
          >
            {loading
              ? Array.from({ length: 4 }, (_, i) => (
                  <div
                    className="kp-card"
                    aria-hidden="true"
                    key={`kp-placeholder-${i}`}
                  />
                ))
              : items.map((category) => (
                  <Link
                    className="kp-card"
                    to={`/karya/${category.slug}`}
                    aria-label={category.name}
                    key={category.key}
                    draggable={false}
                  >
                  {category.img ? (
                    <img
                      className="kp-img"
                      src={thumbFor(category) ?? category.img}
                      alt=""
                      draggable={false}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}
                  <span
                    className="kp-scrim"
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      inset: 0,
                       background:
                         "radial-gradient(ellipse 90% 65% at 0% 100%, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.6) 40%, rgba(15,23,42,0) 78%), linear-gradient(to bottom, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.78) 28%, rgba(15,23,42,0) 58%), linear-gradient(to top, rgba(15,23,42,0.75) 0%, rgba(15,23,42,0) 26%)",
                      pointerEvents: "none",
                    }}
                  />
                  <span className="kp-text">
                    <span className="kp-name">{category.name}</span>
                    {category.desc ? (
                      <span className="kp-sub">{category.desc}</span>
                    ) : null}
                  </span>
                  <span className="kp-visits">
                    {Number(category.visits) || 0} kunjungan
                  </span>
                  <span
                    className="kp-arrow"
                    style={{
                      position: "absolute",
                      right: 16,
                      bottom: 16,
                      width: 36,
                      height: 36,
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ArrowRight
                      size={16}
                      strokeWidth={2}
                      aria-hidden="true"
                      style={{
                        color: "#0f172a",
                        transform: "rotate(-45deg)",
                        transition: "transform 380ms cubic-bezier(.22,1,.36,1)",
                        willChange: "transform",
                      }}
                    />
                  </span>
                </Link>
              ))}
          </div>
        </div>
        {pages > 1 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              alignItems: "center",
              marginTop: 20,
            }}
          >
            <div />
            <div className="kp-dots">
              {Array.from({ length: pages }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`kp-dot${i === pageSafe ? " is-active" : ""}`}
                  aria-label={`Halaman ${i + 1}`}
                  aria-current={i === pageSafe ? "true" : undefined}
                  onClick={() => setPage(i)}
                />
              ))}
            </div>
            <div
              style={{
                justifySelf: "end",
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <button
                type="button"
                className="kp-arrowbtn"
                aria-label="Sebelumnya"
                disabled={pageSafe === 0}
                onClick={() => setPage(Math.max(0, pageSafe - 1))}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  cursor: pageSafe === 0 ? "default" : "pointer",
                  opacity: pageSafe === 0 ? 0.4 : 1,
                  pointerEvents: pageSafe === 0 ? "none" : "auto",
                  transition:
                    "background-color 200ms ease, border-color 200ms ease, opacity 200ms ease",
                }}
              >
                <ChevronLeft size={16} strokeWidth={2} style={{ color: "#0f172a" }} />
              </button>
              <button
                type="button"
                className="kp-arrowbtn"
                aria-label="Berikutnya"
                disabled={pageSafe === pages - 1}
                onClick={() => setPage(Math.min(pages - 1, pageSafe + 1))}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  cursor: pageSafe === pages - 1 ? "default" : "pointer",
                  opacity: pageSafe === pages - 1 ? 0.4 : 1,
                  pointerEvents: pageSafe === pages - 1 ? "none" : "auto",
                  transition:
                    "background-color 200ms ease, border-color 200ms ease, opacity 200ms ease",
                }}
              >
                <ChevronRight size={16} strokeWidth={2} style={{ color: "#0f172a" }} />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
    </>
  );
}
