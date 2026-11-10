import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Loader2, MousePointer2 } from "lucide-react";
import api from "../../services/api";
import { cloudinarySrc, isBrokenImage } from "../../utils/imageUrl";
import "./PlanetaryOrbitGallery.css";

const CONFIG = {
  DESKTOP: {
    TILE_W: 220, // lebar tile (px) desktop
    TILE_H: 140, // tinggi tile (px) desktop
    GAP: 56, // jarak antar tile pada keliling silinder (px)
    ROWS: 3, // jumlah baris tile
    COLS_MIN: 14, // minimal kolom pada silinder
    ROW_STEP: 212, // jarak vertikal antar baris (px)
    CONTAINER_H: 700, // tinggi wadah galeri (px)
  },
  MOBILE: {
    TILE_W: 150, // lebar tile (px) mobile
    TILE_H: 96, // tinggi tile (px) mobile
    GAP: 40, // jarak antar tile pada keliling silinder (px)
    ROWS: 3, // jumlah baris tile
    COLS_MIN: 12, // minimal kolom pada silinder
    ROW_STEP: 150, // jarak vertikal antar baris (px)
    CONTAINER_H: 520, // tinggi wadah galeri (px)
  },
  CAM_BACK: 0.3, // kamera mundur 30% radius dari pusat silinder
  PERSP_FACTOR: 1.0, // skala tile di tengah layar
  ROW_ANGLE_OFFSET: [0, 0.5, 0.25], // offset sudut per baris (x 360/COLS)
  DRAG_DEG_PER_PX: 0.1, // derajat rotasi per px drag
  TILT_PER_PX: 0.015, // derajat tilt per px drag vertikal
  TILT_MAX: 4, // batas tilt maksimum (derajat)
  AUTO_DEG_PER_SEC: 2.4, // kecepatan putar otomatis (derajat/detik)
  RELAX_RATE: 2.5, // laju v menuju target per detik
  TILT_RETURN_RATE: 3.5, // laju tilt kembali ke nol per detik
  SNAP_RATE: 6, // laju putar ke tile yang difokus
  CLICK_THRESHOLD_PX: 8, // ambang gerak sebelum dianggap drag
  PILL_OFFSET: 16, // jarak pil dari kursor (px)
  PILL_H: 40, // tinggi pil hover (px)
  PILL_MAX_W: 280, // lebar maksimum judul pada pil (px)
  VEL_MAX: 40, // batas kecepatan akibat drag (derajat/detik)
};

const DUST = Array.from({ length: 28 }, (_, index) => {
  const angle = index * 2.399963229728653;
  const radius = 14 + ((index * 29) % 78);

  return {
    left: 50 + Math.cos(angle) * radius,
    top: 46 + Math.sin(angle) * radius * 0.58,
    size: index % 7 === 0 ? 3 : index % 3 === 0 ? 2 : 1,
    opacity: 0.12 + ((index * 13) % 32) / 100,
    duration: 7 + (index % 6),
    delay: -((index % 11) * 0.9),
  };
});

function coverOf(project) {
  if (project?.thumbnail) return project.thumbnail;
  if (project?.image) return project.image;
  const first = Array.isArray(project?.images) ? project.images[0] : null;
  return first?.image_url || first || "";
}

function projectHref(project) {
  const category =
    project?.Category?.slug ||
    (typeof project?.category === "string"
      ? project.category
      : project?.category?.slug);
  const key = project?.slug || project?.id;
  return category && key ? `/karya/${category}/${key}` : "/karya";
}

function normalizeProject(project) {
  const rawCover = coverOf(project);
  const cover = rawCover
    ? cloudinarySrc(rawCover, { w: 900, q: 82 }) || rawCover
    : "";

  return {
    id: project.id,
    title: project.title || "Karya Singgah",
    href: projectHref(project),
    image: cover,
  };
}

function preloadImage(src, timeout = 8000) {
  if (!src) return Promise.resolve(false);

  return new Promise((resolve) => {
    const image = new Image();
    let settled = false;

    const finish = (ok) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      image.onload = null;
      image.onerror = null;
      resolve(ok);
    };

    const timer = window.setTimeout(() => finish(false), timeout);
    image.onload = () => finish(true);
    image.onerror = () => finish(false);
    image.src = src;
  });
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function buildGeometry(count, isDesktop) {
  if (!count) return null;

  const cfg = isDesktop ? CONFIG.DESKTOP : CONFIG.MOBILE;
  const COLS = Math.max(cfg.COLS_MIN, Math.ceil(count / cfg.ROWS));
  const R = Math.round((COLS * (cfg.TILE_W + cfg.GAP)) / (2 * Math.PI));
  const perspective = Math.round(
    R * (1 + CONFIG.CAM_BACK) * CONFIG.PERSP_FACTOR
  );
  const stageZ = perspective - R * CONFIG.CAM_BACK;

  return {
    ...cfg,
    n: count,
    COLS,
    R,
    perspective,
    stageZ,
    angleStep: 360 / COLS,
    slotCount: COLS * cfg.ROWS,
  };
}

function buildTiles(projects, geo) {
  if (!geo || projects.length === 0) return [];

  const { COLS, ROWS, R, angleStep, n, ROW_STEP, TILE_W, TILE_H } = geo;
  const seen = new Set();
  const result = [];

  for (let r = 0; r < ROWS; r += 1) {
    for (let i = 0; i < COLS; i += 1) {
      const project = projects[(i + r * 5) % n];
      if (!project) continue;

      const isPrimary = !seen.has(project.id);
      if (isPrimary) seen.add(project.id);

      const theta = i * angleStep + CONFIG.ROW_ANGLE_OFFSET[r] * angleStep;
      const s = 0.92 + ((i * 7 + r * 13) % 5) * 0.03;
      const jitterY = ((i * 11 + r * 5) % 7 - 3) * 3;
      const rowY = (r - 1) * ROW_STEP + jitterY;
      const rz = ((i * 3 + r * 7) % 5 - 2) * 1.2;
      const W = TILE_W * [0.92, 1, 1.1][(i * 3 + r * 2) % 3];
      const H = TILE_H * [0.86, 1, 1.08][(i * 5 + r) % 3];
      const slotIndex = r * COLS + i;

      result.push({
        key: `${project.id}-${slotIndex}`,
        project,
        isPrimary,
        theta,
        slotIndex,
        width: W,
        height: H,
        loading: slotIndex < 12 ? "eager" : "lazy",
        transform: `rotateY(${theta}deg) translateZ(${-R}px) translateY(${rowY}px) rotateZ(${rz}deg) scale(${s})`,
      });
    }
  }

  return result;
}

export default function PlanetaryOrbitGallery() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 768px)").matches
      : true
  );

  const wrapRef = useRef(null);
  const stageRef = useRef(null);
  const pillRef = useRef(null);
  const pillLabelRef = useRef(null);
  const startLoopRef = useRef(null);

  const ARef = useRef(0);
  const vRef = useRef(0);
  const tiltRef = useRef(0);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });
  const lastRef = useRef({ x: 0, y: 0, t: 0 });
  const snapRef = useRef(null);
  const hoveringRef = useRef(false);
  const focusWithinRef = useRef(false);
  const visibleRef = useRef(false);
  const suppressRef = useRef(false);
  const pointerTypeRef = useRef("mouse");
  const stageZRef = useRef(0);
  const reduceRef = useRef(false);
  const lastPointerRef = useRef(null);
  const focusTileRef = useRef(null);
  const positionFocusRef = useRef(null);
  const hoverTileRef = useRef(null);
  const hoverApiRef = useRef(null);

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
        const normalized = (Array.isArray(data) ? data : [])
          .map(normalizeProject)
          .filter(
            (project) =>
              project.id && project.image && !isBrokenImage(project.image)
          );

        const valid = await Promise.all(
          normalized.map((project) =>
            preloadImage(project.image).then((ok) => (ok ? project : null))
          )
        );

        if (cancelled) return;
        setProjects(valid.filter(Boolean));
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
  }, [reloadKey]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const media = window.matchMedia("(min-width: 768px)");
    const listener = (event) => setIsDesktop(event.matches);
    media.addEventListener?.("change", listener);
    return () => media.removeEventListener?.("change", listener);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reduceRef.current = media.matches;
    };
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  const geo = useMemo(
    () => buildGeometry(projects.length, isDesktop),
    [projects.length, isDesktop]
  );
  const tiles = useMemo(() => buildTiles(projects, geo), [projects, geo]);
  const cfg = isDesktop ? CONFIG.DESKTOP : CONFIG.MOBILE;

  const positionPill = useCallback((clientX, clientY) => {
    const wrap = wrapRef.current;
    const pill = pillRef.current;
    if (!wrap || !pill) return;

    const rect = wrap.getBoundingClientRect();
    const pillW = pill.offsetWidth;
    const pillH = pill.offsetHeight;
    let x = clientX - rect.left + CONFIG.PILL_OFFSET;
    let y = clientY - rect.top + CONFIG.PILL_OFFSET;

    if (x + pillW > rect.width) {
      x = clientX - rect.left - CONFIG.PILL_OFFSET - pillW;
    }
    if (y + pillH > rect.height) {
      y = clientY - rect.top - CONFIG.PILL_OFFSET - pillH;
    }

    x = clamp(x, 0, Math.max(0, rect.width - pillW));
    y = clamp(y, 0, Math.max(0, rect.height - pillH));

    pill.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }, []);

  const showPill = useCallback(
    (title, clientX, clientY) => {
      const pill = pillRef.current;
      const label = pillLabelRef.current;
      if (!pill || !label) return;

      label.textContent = title;
      pill.style.opacity = "1";
      if (typeof clientX === "number" && typeof clientY === "number") {
        positionPill(clientX, clientY);
      }
    },
    [positionPill]
  );

  const hidePill = useCallback(() => {
    if (pillRef.current) pillRef.current.style.opacity = "0";
  }, []);

  const positionPillOverTile = useCallback((tile) => {
    const wrap = wrapRef.current;
    const pill = pillRef.current;
    if (!wrap || !pill || !tile) return;

    const wrapRect = wrap.getBoundingClientRect();
    const tileRect = tile.getBoundingClientRect();
    const pillW = pill.offsetWidth;
    const pillH = pill.offsetHeight;

    let x = tileRect.left - wrapRect.left + tileRect.width / 2 - pillW / 2;
    let y = tileRect.top - wrapRect.top - pillH - CONFIG.PILL_OFFSET;

    if (y < 0) {
      y = tileRect.bottom - wrapRect.top + CONFIG.PILL_OFFSET;
    }

    x = clamp(x, 0, Math.max(0, wrapRect.width - pillW));
    y = clamp(y, 0, Math.max(0, wrapRect.height - pillH));

    pill.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }, []);

  useEffect(() => {
    positionFocusRef.current = positionPillOverTile;
  }, [positionPillOverTile]);

  useEffect(() => {
    hoverApiRef.current = { showPill, hidePill };
  }, [showPill, hidePill]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    stageZRef.current = geo ? geo.stageZ : 0;
    stage.style.transform = `translateZ(${stageZRef.current}px) rotateX(${tiltRef.current}deg) rotateY(${ARef.current}deg)`;
  }, [geo]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    let raf = null;
    let last = performance.now();

    const frame = (now) => {
      const dt = Math.min(Math.max((now - last) / 1000, 0), 1 / 30);
      last = now;

      if (!visibleRef.current || document.hidden) {
        raf = null;
        return;
      }

      const snap = snapRef.current;
      if (snap !== null && !draggingRef.current) {
        const d = ((snap - ARef.current + 540) % 360) - 180;
        ARef.current += d * (1 - Math.exp(-dt * CONFIG.SNAP_RATE));
        vRef.current = 0;
        if (Math.abs(d) < 0.05) snapRef.current = null;
      } else if (!draggingRef.current) {
        const target =
          hoveringRef.current || focusWithinRef.current || reduceRef.current
            ? 0
            : CONFIG.AUTO_DEG_PER_SEC;
        const rate = reduceRef.current ? 8 : CONFIG.RELAX_RATE;
        vRef.current += (target - vRef.current) * (1 - Math.exp(-dt * rate));
        ARef.current += vRef.current * dt;
      }

      if (!draggingRef.current) {
        tiltRef.current +=
          (0 - tiltRef.current) *
          (1 - Math.exp(-dt * CONFIG.TILT_RETURN_RATE));
      }

      stage.style.transform = `translateZ(${stageZRef.current}px) rotateX(${tiltRef.current}deg) rotateY(${ARef.current}deg)`;

      const probe = hoveringRef.current ? lastPointerRef.current : null;
      if (probe && !draggingRef.current) {
        const hit = document.elementFromPoint(probe.x, probe.y);
        const tile = hit?.closest?.("[data-title]");
        if (tile && wrapRef.current?.contains(tile)) {
          if (hoverTileRef.current !== tile) {
            hoverTileRef.current = tile;
            hoverApiRef.current?.showPill(
              tile.dataset.title || "",
              probe.x,
              probe.y
            );
          }
        } else {
          hoverTileRef.current = null;
          hoveringRef.current = false;
          hoverApiRef.current?.hidePill();
        }
      }

      if (focusWithinRef.current && focusTileRef.current && !hoveringRef.current) {
        positionFocusRef.current?.(focusTileRef.current);
      }

      raf = window.requestAnimationFrame(frame);
    };

    const ensure = () => {
      if (raf !== null) return;
      if (!visibleRef.current || document.hidden) return;
      last = performance.now();
      raf = window.requestAnimationFrame(frame);
    };

    startLoopRef.current = ensure;

    const onVisibility = () => {
      if (document.hidden) {
        if (raf !== null) window.cancelAnimationFrame(raf);
        raf = null;
      } else {
        ensure();
      }
    };

    const onWindowBlur = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      suppressRef.current = movedRef.current;
      movedRef.current = false;
      if (wrapRef.current) wrapRef.current.style.cursor = "grab";
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onWindowBlur);
    ensure();

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onWindowBlur);
      if (raf !== null) window.cancelAnimationFrame(raf);
      startLoopRef.current = null;
    };
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || typeof IntersectionObserver === "undefined") {
      visibleRef.current = true;
      startLoopRef.current?.();
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        visibleRef.current = Boolean(entries[0]?.isIntersecting);
        if (visibleRef.current) startLoopRef.current?.();
      },
      { threshold: 0 }
    );

    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || typeof ResizeObserver === "undefined") return undefined;

    const observer = new ResizeObserver(() => {
      const pill = pillRef.current;
      if (!pill || pill.style.opacity !== "1") return;
      if (lastPointerRef.current) {
        positionPill(lastPointerRef.current.x, lastPointerRef.current.y);
      }
    });

    observer.observe(wrap);
    return () => observer.disconnect();
  }, [positionPill]);

  const handlePointerDown = (event) => {
    if (event.button !== 0) return;

    pointerTypeRef.current = event.pointerType || "mouse";
    startRef.current = { x: event.clientX, y: event.clientY };
    lastRef.current = {
      x: event.clientX,
      y: event.clientY,
      t: event.timeStamp,
    };
    draggingRef.current = false;
    movedRef.current = false;
    snapRef.current = null;
    suppressRef.current = false;
  };

  const handlePointerMove = (event) => {
    const now = event.timeStamp;
    const pointerType = event.pointerType || pointerTypeRef.current;

    if (!movedRef.current && (event.buttons & 1) === 1) {
      const dx0 = event.clientX - startRef.current.x;
      const dy0 = event.clientY - startRef.current.y;

      if (Math.hypot(dx0, dy0) > CONFIG.CLICK_THRESHOLD_PX) {
        movedRef.current = true;
        draggingRef.current = true;
        hoveringRef.current = false;
        hidePill();
        try {
          wrapRef.current?.setPointerCapture(event.pointerId);
        } catch {
          // pointer capture bisa gagal pada perangkat tertentu
        }
        if (wrapRef.current) wrapRef.current.style.cursor = "grabbing";
      }
    }

    if (draggingRef.current) {
      if ((event.buttons & 1) === 0) {
        endPointer(event);
        return;
      }

      const last = lastRef.current;
      const dx = event.clientX - last.x;
      const dy = event.clientY - last.y;

      ARef.current -= dx * CONFIG.DRAG_DEG_PER_PX;
      tiltRef.current = clamp(
        tiltRef.current - dy * CONFIG.TILT_PER_PX,
        -CONFIG.TILT_MAX,
        CONFIG.TILT_MAX
      );

      const dt = Math.max((now - last.t) / 1000, 0.001);
      const vInst = -(dx * CONFIG.DRAG_DEG_PER_PX) / dt;
      vRef.current = clamp(
        vRef.current * 0.8 + vInst * 0.2,
        -CONFIG.VEL_MAX,
        CONFIG.VEL_MAX
      );
    } else if (pointerType === "mouse" || pointerType === "pen") {
      lastPointerRef.current = { x: event.clientX, y: event.clientY };
      const hit = document.elementFromPoint(event.clientX, event.clientY);
      const tile = hit?.closest?.("[data-title]");
      if (tile && wrapRef.current?.contains(tile)) {
        const changed = hoverTileRef.current !== tile || !hoveringRef.current;
        hoverTileRef.current = tile;
        hoveringRef.current = true;
        if (changed) {
          showPill(tile.dataset.title || "", event.clientX, event.clientY);
        } else {
          positionPill(event.clientX, event.clientY);
        }
      } else {
        hoverTileRef.current = null;
        if (hoveringRef.current) {
          hoveringRef.current = false;
          hidePill();
        }
      }
    }

    lastRef.current = { x: event.clientX, y: event.clientY, t: now };
  };

  const endPointer = (event) => {
    if (draggingRef.current) {
      try {
        wrapRef.current?.releasePointerCapture(event.pointerId);
      } catch {
        // abaikan jika pointer capture sudah lepas
      }
      draggingRef.current = false;
      suppressRef.current = movedRef.current;
    }

    movedRef.current = false;
    if (wrapRef.current) wrapRef.current.style.cursor = "grab";
  };

  const handleClickCapture = (event) => {
    if (!suppressRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressRef.current = false;
  };

  const handlePointerOver = (event) => {
    if (draggingRef.current) return;

    const tile = event.target.closest?.("[data-title]");
    if (!tile || !wrapRef.current?.contains(tile)) return;

    hoveringRef.current = true;
    hoverTileRef.current = tile;
    lastPointerRef.current = { x: event.clientX, y: event.clientY };
    showPill(tile.dataset.title || "", event.clientX, event.clientY);
  };

  const handlePointerOut = (event) => {
    const tile = event.target.closest?.("[data-title]");
    if (!tile) return;

    const related = event.relatedTarget;
    if (related instanceof Node && tile.contains(related)) return;

    hoveringRef.current = false;
    hoverTileRef.current = null;
    hidePill();
  };

  const handleTileFocus = (event, tile) => {
    if (!event.currentTarget.matches(":focus-visible")) return;

    focusWithinRef.current = true;
    lastPointerRef.current = null;
    focusTileRef.current = event.currentTarget;
    showPill(tile.project.title);
    positionPillOverTile(event.currentTarget);
    snapRef.current = -tile.theta;
  };

  const handleTileBlur = () => {
    focusWithinRef.current = false;
    focusTileRef.current = null;
    hidePill();
  };

  const retry = () => {
    setLoading(true);
    setError(false);
    setReloadKey((key) => key + 1);
  };

  return (
    <section
      id="galeri-karya-3d"
      aria-label="Galeri karya 3D"
      className="relative overflow-hidden"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 light:hidden"
        style={{
          background:
            "radial-gradient(64% 58% at 50% 40%, rgba(29,111,242,0.24), transparent 70%), radial-gradient(42% 46% at 84% 72%, rgba(14,165,233,0.1), transparent 72%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden light:block"
        style={{
          background:
            "radial-gradient(58% 52% at 50% 40%, rgba(29,111,242,0.14), transparent 72%), radial-gradient(40% 42% at 84% 76%, rgba(14,165,233,0.08), transparent 74%)",
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {DUST.map((particle, index) => (
          <span
            key={`dust-${index}`}
            className="gallery-dust absolute rounded-full bg-cyan-200/70 light:bg-[#1D6FF2]/35"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              animation: `gallery-dust ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
            }}
          />
        ))}
      </div>

      <div
        ref={wrapRef}
        role="region"
        aria-roledescription="galeri 3D"
        aria-label="Galeri karya 3D"
        aria-busy={loading}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onLostPointerCapture={endPointer}
        onClickCapture={handleClickCapture}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        className="gal-wrap relative mt-0 w-full cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing"
        style={{
          height: `${cfg.CONTAINER_H}px`,
          perspective: `${geo ? geo.perspective : 1200}px`,
          perspectiveOrigin: "50% 50%",
        }}
      >
        <div
          ref={stageRef}
          className="absolute left-1/2 top-1/2 h-0 w-0 [transform-style:preserve-3d] will-change-transform"
        >
          {tiles.map((tile) => (
            <Link
              key={tile.key}
              to={tile.project.href}
              draggable={false}
              onDragStart={(event) => event.preventDefault()}
              data-title={tile.project.title}
              data-index={tile.slotIndex}
              aria-label={tile.project.title}
              aria-hidden={tile.isPrimary ? undefined : true}
              tabIndex={tile.isPrimary ? 0 : -1}
              onFocus={
                tile.isPrimary
                  ? (event) => handleTileFocus(event, tile)
                  : undefined
              }
              onBlur={tile.isPrimary ? handleTileBlur : undefined}
              className="gal-tile group absolute block cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
              style={{
                left: "50%",
                top: "50%",
                width: `${tile.width}px`,
                height: `${tile.height}px`,
                marginLeft: `${-tile.width / 2}px`,
                marginTop: `${-tile.height / 2}px`,
                transform: tile.transform,
                transformOrigin: "50% 50%",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <div className="gal-inner pointer-events-none h-full w-full overflow-hidden rounded-[6px] group-hover:scale-[1.04]">
                <img
                  src={tile.project.image}
                  alt={tile.project.title}
                  draggable={false}
                  decoding="async"
                  loading={tile.loading}
                  className="block h-full w-full object-cover"
                />
              </div>
            </Link>
          ))}
        </div>

        <div className="gal-vignette" aria-hidden="true" />

        <p className="gal-center" aria-hidden="true">
          <span className="gal-center-a">Dibuat oleh</span>
          <span className="gal-center-b">Civitas Poliban</span>
        </p>

        <div
          ref={pillRef}
          aria-hidden="true"
          className="gal-pill pointer-events-none absolute left-0 top-0 inline-flex h-10 items-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 opacity-0 transition-opacity duration-150 ease-out"
          style={{ willChange: "transform, opacity" }}
        >
          <span
            ref={pillLabelRef}
            className="block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap"
            style={{ maxWidth: `${CONFIG.PILL_MAX_W}px` }}
          />
          <ArrowUpRight className="ml-2 h-3.5 w-3.5 shrink-0" aria-hidden />
        </div>

        {loading && (
          <div className="pointer-events-none absolute inset-x-0 bottom-8 z-10 flex justify-center">
            <span
              role="status"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 backdrop-blur-sm light:border-slate-200 light:bg-white/80 light:text-slate-600"
            >
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Menyiapkan ruang galeri…
            </span>
          </div>
        )}

        {!loading && error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center px-4">
            <div className="max-w-sm text-center">
              <p className="text-sm font-semibold text-white light:text-slate-900">
                Ruang galeri sedang tidak bisa dimuat
              </p>
              <p className="mt-1 text-xs text-slate-400 light:text-slate-500">
                Periksa koneksi lalu coba sekali lagi.
              </p>
              <button
                type="button"
                onClick={retry}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1D6FF2] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#155BD6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
              >
                Coba lagi
              </button>
            </div>
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center px-4">
            <div className="max-w-sm text-center">
              <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-cyan-200 light:border-blue-100 light:bg-white light:text-[#1D6FF2]">
                <MousePointer2 className="h-5 w-5" aria-hidden />
              </span>
              <p className="text-sm font-semibold text-white light:text-slate-900">
                Belum ada karya untuk dijelajahi
              </p>
              <p className="mt-1 text-xs text-slate-400 light:text-slate-500">
                Karya terbaru akan muncul di sini.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
