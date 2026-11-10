import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { imageUrl, buildSrcSet } from "../../../utils/imageUrl";
import SmartImage from "../../ui/SmartImage";
import { SLIDESHOW_MAX_ITEMS } from "../../../constants/slideshow";
import HeroCat from "./HeroCat";

const FETCH_LIMIT = 50;
const MAX_SLIDES = SLIDESHOW_MAX_ITEMS;
const AUTOPLAY_DELAY = 3000;
const AUTOPLAY_RESUME_DELAY = 8000;
const DRAG_THRESHOLD = 50;

function normalizeProject(p) {
  const Category = p.Category || {};
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: Category.name || "Karya",
    categorySlug: Category.slug || "karya",
    thumbnail: p.thumbnail,
    updatedAt: p.updatedAt || p.updated_at || "",
    isShownInSlideshow: Boolean(p.is_shown_in_slideshow),
  };
}

function cardWidthVw(width) {
  if (width < 640) return "78vw";
  if (width < 1024) return "64vw";
  return "50vw";
}

function HeroKaryaShowcase() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragDelta, setDragDelta] = useState(0);
  const [pillMode, setPillMode] = useState(null);
  const [showFocusRing, setShowFocusRing] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });
  const [isTabVisible, setIsTabVisible] = useState(
    typeof document !== "undefined" ? !document.hidden : true
  );
  const [isMobileNarrow, setIsMobileNarrow] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );
  const [cardWidth, setCardWidth] = useState(() =>
    cardWidthVw(typeof window !== "undefined" ? window.innerWidth : 1024)
  );

  const carouselRef = useRef(null);
  const pillRef = useRef(null);
  const pillPos = useRef({ x: 0, y: 0 });
  const pillTarget = useRef({ x: 0, y: 0 });
  const pillRaf = useRef(0);
  const prevOffsetsRef = useRef(new Map());
  const resumeTimeoutRef = useRef(null);
  const capturedRef = useRef(false);

  const slides = useMemo(
    () => projects.filter((p) => p.isShownInSlideshow).slice(0, MAX_SLIDES),
    [projects]
  );
  const count = slides.length;

  const renderSlides = useMemo(() => {
    if (count === 0) return [];
    return slides.map((s, i) => ({
      key: String(s.id),
      slide: s,
      origIndex: i,
    }));
  }, [slides, count]);
  const renderCount = renderSlides.length;

  const offsetFor = useCallback(
    (renderIdx) => {
      if (renderCount === 0) return 999;
      let off = ((renderIdx - index) % renderCount + renderCount) % renderCount;
      if (off > renderCount / 2) off -= renderCount;
      return off;
    },
    [index, renderCount]
  );

  const centerIdx = renderCount
    ? ((index % renderCount) + renderCount) % renderCount
    : 0;
  const preview = renderSlides[centerIdx]?.slide || null;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const handler = () => setIsTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => setIsMobileNarrow(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => setCardWidth(cardWidthVw(window.innerWidth));
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

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
        setIndex(0);
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

  useEffect(() => {
    return () => {
      if (pillRaf.current) cancelAnimationFrame(pillRaf.current);
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  useLayoutEffect(() => {
    if (renderCount === 0) {
      prevOffsetsRef.current = new Map();
      return;
    }
    const nextMap = new Map();
    const jumps = new Set();
    for (let i = 0; i < renderCount; i++) {
      const item = renderSlides[i];
      const off = offsetFor(i);
      nextMap.set(item.key, off);
      const prev = prevOffsetsRef.current.get(item.key);
      if (prev !== undefined && Math.abs(off - prev) > 1) {
        jumps.add(item.key);
      }
    }
    prevOffsetsRef.current = nextMap;
    if (jumps.size === 0 || !carouselRef.current) return;

    const els = [];
    carouselRef.current
      .querySelectorAll("[data-card-key]")
      .forEach((el) => {
        if (jumps.has(el.dataset.cardKey)) els.push(el);
      });
    if (els.length === 0) return;

    const restore = reducedMotion
      ? "none"
      : "transform 300ms ease, filter 300ms ease";

    els.forEach((el) => {
      el.style.transition = "none";
    });
    let r2 = 0;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => {
        els.forEach((el) => {
          el.style.transition = restore;
        });
      });
    });
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
      els.forEach((el) => {
        el.style.transition = restore;
      });
    };
  }, [index, renderCount, renderSlides, offsetFor, reducedMotion]);

  const scheduleResume = useCallback(() => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    resumeTimeoutRef.current = setTimeout(() => {
      setPaused(false);
    }, AUTOPLAY_RESUME_DELAY);
  }, []);

  const next = useCallback(() => {
    setIndex((i) => i + 1);
    scheduleResume();
  }, [scheduleResume]);

  const prev = useCallback(() => {
    setIndex((i) => i - 1);
    scheduleResume();
  }, [scheduleResume]);

  const openDetail = () => {
    if (!preview) return;
    navigate(`/karya/${preview.categorySlug}/${preview.slug || preview.id}`);
  };

  const handleCardClick = (off) => {
    if (off === 0) {
      openDetail();
    } else {
      setIndex((i) => i + off);
      scheduleResume();
    }
  };

  const stepPill = () => {
    const p = pillPos.current;
    const t = pillTarget.current;
    p.x += (t.x - p.x) * 0.25;
    p.y += (t.y - p.y) * 0.25;
    if (pillRef.current) {
      pillRef.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%)`;
    }
    if (Math.abs(t.x - p.x) > 0.5 || Math.abs(t.y - p.y) > 0.5) {
      pillRaf.current = requestAnimationFrame(stepPill);
    } else {
      pillRaf.current = 0;
    }
  };

  const updatePill = (e) => {
    const stage = carouselRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const halfW = (pillRef.current?.offsetWidth || 0) / 2;
    const halfH = (pillRef.current?.offsetHeight || 0) / 2;
    const pad = 8;
    pillTarget.current = {
      x: Math.min(
        Math.max(e.clientX - rect.left, halfW + pad),
        rect.width - halfW - pad
      ),
      y: Math.min(
        Math.max(e.clientY - rect.top, halfH + pad),
        rect.height - halfH - pad
      ),
    };
    if (!pillRaf.current) pillRaf.current = requestAnimationFrame(stepPill);
    const el =
      e.target instanceof Element
        ? e.target.closest("[data-card-offset]")
        : null;
    const off = el ? Number(el.getAttribute("data-card-offset")) : NaN;
    if (off === 1) {
      setPillMode((m) => (m === "next" ? m : "next"));
    } else if (off === -1) {
      setPillMode((m) => (m === "prev" ? m : "prev"));
    } else {
      setPillMode((m) => (m === null ? m : null));
    }
  };

  const handlePointerDown = (e) => {
    if (count <= 1) return;
    capturedRef.current = false;
    setDragging(true);
    setDragStartX(e.clientX);
    setDragDelta(0);
    setPillMode(null);
  };

  const handlePointerMove = (e) => {
    if (!isMobileNarrow && e.pointerType === "mouse" && !dragging) {
      updatePill(e);
    }
    if (!dragging) return;
    const delta = e.clientX - dragStartX;
    if (!capturedRef.current && Math.abs(delta) > 6) {
      capturedRef.current = true;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
    setDragDelta(delta);
  };

  const handlePointerUp = (e) => {
    if (!dragging) return;
    setDragging(false);
    if (capturedRef.current) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
    if (Math.abs(dragDelta) > DRAG_THRESHOLD) {
      if (dragDelta > 0) prev();
      else next();
    }
    setDragDelta(0);
    scheduleResume();
  };

  const handlePointerLeave = () => {
    setPillMode(null);
    if (pillRaf.current) {
      cancelAnimationFrame(pillRaf.current);
      pillRaf.current = 0;
    }
    if (dragging && !capturedRef.current) {
      setDragging(false);
      setDragDelta(0);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    }
  };

  useEffect(() => {
    if (paused || count < 2 || !isTabVisible || dragging || reducedMotion)
      return;
    const t = setInterval(() => {
      setIndex((i) => i + 1);
    }, AUTOPLAY_DELAY);
    return () => clearInterval(t);
  }, [paused, count, isTabVisible, dragging, reducedMotion]);

  const mul = isMobileNarrow ? 0.9 : 1.04;
  const rotateYDeg = isMobileNarrow ? 8 : 14;

  const cardBaseStyle = {
    position: "absolute",
    top: 0,
    left: "50%",
    marginLeft: `calc(var(--card-w) / -2)`,
    width: `min(var(--card-w), 2400px)`,
    aspectRatio: "16 / 10",
    borderRadius: "12px",
    border: "1px solid var(--snav-bd)",
    boxShadow:
      "0 10px 28px -6px color-mix(in srgb, var(--hero-accent) 30%, transparent)",
    overflow: "hidden",
    transformOrigin: "center center",
    backfaceVisibility: "hidden",
  };

  return (
    <div
      className="hero-karya-showcase group relative w-full"
      onMouseEnter={() => {
        if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
      }}
      onMouseLeave={() => {
        scheduleResume();
      }}
      onFocus={() => {
        if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          scheduleResume();
        }
      }}
    >
      <div
        ref={carouselRef}
        className="relative w-full overflow-hidden"
        style={{
          perspective: "1800px",
          perspectiveOrigin: "center center",
          touchAction: "pan-y",
          "--card-w": cardWidth,
          minHeight: `calc(var(--card-w) * 0.625 + 80px)`,
          outline: showFocusRing ? "2px solid currentColor" : undefined,
          outlineOffset: showFocusRing ? 3 : undefined,
        }}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Karya unggulan"
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      >
        {!loading && count > 0 && (
          <div className="pointer-events-none absolute -top-6 left-[calc(50%-min(48vw,500px))] z-[60] sm:-top-8 md:-top-10">
            <HeroCat />
          </div>
        )}

        {!loading && count > 0 && (
          <>
            {renderSlides.map((item, renderIdx) => {
              const slide = item.slide;
              const off = offsetFor(renderIdx);
              const isActiveCard = off === 0;
              const side = off === -1 || off === 1;

              let s, op, z, pe, ry, rz;
              if (isActiveCard) {
                s = 1;
                op = 1;
                z = 5;
                pe = "auto";
                ry = 0;
                rz = 0;
              } else if (side) {
                s = 0.96;
                op = 1;
                z = 4;
                pe = "auto";
                ry = off * -rotateYDeg;
                rz = off * 1.6;
              } else {
                s = 0.9;
                op = 0;
                z = 0;
                pe = "none";
                ry = 0;
                rz = 0;
              }

              const dragX = dragging ? dragDelta : 0;
              if (reducedMotion) {
                ry = 0;
                rz = 0;
              }

              let trans;
              if (dragging || reducedMotion) {
                trans = "none";
              } else {
                trans = "transform 300ms ease, filter 300ms ease";
              }

              const style = {
                ...cardBaseStyle,
                cursor: isActiveCard ? "pointer" : side ? "none" : "default",
                transition: trans,
                willChange: reducedMotion ? "filter" : "transform, filter",
                transform: `translateX(calc(${off} * var(--card-w) * ${mul} + ${dragX}px)) scale(${s}) rotateY(${ry}deg) rotateZ(${rz}deg)`,
                opacity: op,
                filter: side ? "brightness(var(--hero-side-dim))" : "none",
                zIndex: z,
                pointerEvents: pe,
              };

              return (
                <div
                  key={item.key}
                  data-card-key={item.key}
                  data-card-offset={off}
                  style={style}
                  aria-hidden={off !== 0}
                  onClick={() => handleCardClick(off)}
                >
                  <SmartImage
                    src={imageUrl(slide.thumbnail)}
                    srcSet={buildSrcSet(slide.thumbnail, [
                      640, 1024, 1920, 2560,
                    ])}
                    sizes="(min-width: 1024px) min(50vw, 2400px), (min-width: 640px) 64vw, 78vw"
                    style={{ filter: "none" }}
                    alt={slide.title}
                    eager={isActiveCard || Math.abs(off) === 1}
                    loading={
                      isActiveCard || Math.abs(off) === 1 ? undefined : "lazy"
                    }
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover object-top"
                  />
                </div>
              );
            })}
          </>
        )}

        {!loading && count > 0 && (
          <div
            ref={pillRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-20 hidden min-[640px]:block"
            style={{ willChange: "transform" }}
          >
            <div
              className={`whitespace-nowrap rounded-full bg-white px-5 py-3 text-[15px] font-medium text-[color:#111] shadow-[0_8px_24px_rgba(0,0,0,.28)] transition-[opacity,transform] duration-150 ease-out ${
                pillMode ? "opacity-100 scale-100" : "opacity-0 scale-90"
              }`}
            >
              {pillMode === "prev" ? "Sebelumnya" : "Berikutnya"}
            </div>
          </div>
        )}

        {count > 0 && !loading && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Karya sebelumnya"
              className="sr-only"
              onFocus={(e) => {
                if (e.currentTarget.matches(":focus-visible")) {
                  setShowFocusRing(true);
                }
              }}
              onBlur={() => setShowFocusRing(false)}
            >
              Karya sebelumnya
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Karya berikutnya"
              className="sr-only"
              onFocus={(e) => {
                if (e.currentTarget.matches(":focus-visible")) {
                  setShowFocusRing(true);
                }
              }}
              onBlur={() => setShowFocusRing(false)}
            >
              Karya berikutnya
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default HeroKaryaShowcase;
