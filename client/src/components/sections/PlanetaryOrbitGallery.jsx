import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, MousePointer2, Sparkles } from "lucide-react";
import api from "../../services/api";
import { cloudinarySrc } from "../../utils/imageUrl";

const YAW_MIN = -62;
const YAW_MAX = 62;
const PITCH_MIN = -26;
const PITCH_MAX = 26;
const START_YAW = -6;
const START_PITCH = 2;

const PERSPECTIVE = 2600;

const RING_TIERS_DESKTOP = [
  { count: 10, rx: 42, ry: 30, z: -180, scale: 1 },
  { count: 7, rx: 18, ry: 16, z: -750, scale: 0.85 },
];

const RING_TIERS_MOBILE = [
  { count: 17, rx: 34, ry: 24, z: -200, scale: 0.95 },
];

function buildPanelSlots(tiers) {
  const slots = [];

  for (const tier of tiers) {
    const step = (2 * Math.PI) / tier.count;

    for (let i = 0; i < tier.count; i += 1) {
      const angle = i * step;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      slots.push({
        tx: cos * tier.rx,
        ty: sin * tier.ry,
        z: tier.z,
        yaw: ((i % 3) - 1) * 5,
        pitch: ((i % 2) * 2 - 1) * 3,
        scale: tier.scale,
      });
    }
  }

  return slots;
}

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
  const raw =
    project?.Category?.name ||
    project?.categoryName ||
    (typeof project?.category === "string"
      ? project.category
      : project?.category?.name || project?.category?.slug) ||
    "";
  return niceCategory(raw) || "Karya";
}

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
    category: categoryOf(project),
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

function layoutFor(index, count, isCompact) {
  if (count === 1) {
    return { tx: 0, ty: 0, x: 0, y: 0, z: -250, yaw: 0, pitch: 0, scale: 1 };
  }

  const currentTiers = isCompact ? RING_TIERS_MOBILE : RING_TIERS_DESKTOP;
  const panelSlots = buildPanelSlots(currentTiers);
  let slot;

  if (index < panelSlots.length) {
    slot = panelSlots[index];
  } else {
    const extra = index - panelSlots.length;
    const angle = extra * 2.399963229728653;
    slot = {
      tx: Math.cos(angle) * (isCompact ? 28 : 44 + (extra % 3) * 3),
      ty: Math.sin(angle) * (isCompact ? 20 : 30 + (extra % 2) * 4),
      z: -400 - (extra % 5) * 90,
      yaw: Math.sin(angle) * 10,
      pitch: Math.cos(angle) * 7,
      scale: 0.92,
    };
  }

  const perspectiveScale = PERSPECTIVE / (PERSPECTIVE - slot.z);

  return {
    ...slot,
    x: slot.tx / perspectiveScale,
    y: slot.ty / perspectiveScale,
  };
}

function orientationFor(slot) {
  const tx = slot.tx ?? slot.x;
  const ty = slot.ty ?? slot.y;

  return {
    yaw: clamp(-tx * 0.06 + slot.yaw, -34, 34),
    pitch: clamp(-ty * 0.05 + slot.pitch, -12, 12),
  };
}

function panelTransform(slot, yaw, pitch) {
  return `translate(-50%, -50%) translateZ(${slot.z}px) rotateY(${yaw}deg) rotateX(${pitch}deg) scale(${slot.scale.toFixed(3)})`;
}

export default function PlanetaryOrbitGallery() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [facePose, setFacePose] = useState(null);
  const [coarsePointer, setCoarsePointer] = useState(false);
  const [isCompact, setIsCompact] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const media = window.matchMedia("(max-width: 639px)");
    const listener = (event) => setIsCompact(event.matches);
    if (media.addEventListener) {
      media.addEventListener("change", listener);
    } else {
      media.addListener(listener);
    }
    setIsCompact(media.matches);
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, []);

  const stageRef = useRef(null);
  const sceneRef = useRef(null);
  const dragCleanupRef = useRef(null);
  const motionRef = useRef(null);
  const suppressClickRef = useRef(false);
  const yawRef = useRef(START_YAW);
  const pitchRef = useRef(START_PITCH);

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
          .filter((project) => project.id && project.image);

        const valid = await Promise.all(
          normalized.map((project) =>
            preloadImage(project.image).then((ok) => (ok ? project : null))
          )
        );

        if (cancelled) return;

        setHoveredId(null);
        setSelectedId(null);
        setFacePose(null);
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
    const query = window.matchMedia("(hover: none), (pointer: coarse)");
    const update = () => setCoarsePointer(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);

  useLayoutEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    scene.style.transform = `translate3d(0, 0, 0) rotateX(${pitchRef.current}deg) rotateY(${yawRef.current}deg)`;
  }, []);

  useEffect(() => {
    return () => {
      dragCleanupRef.current?.();
      if (motionRef.current !== null) {
        window.cancelAnimationFrame(motionRef.current);
      }
    };
  }, []);

  const applyScene = () => {
    const scene = sceneRef.current;
    if (!scene) return;
    scene.style.transform = `translate3d(0, 0, 0) rotateX(${pitchRef.current.toFixed(
      2
    )}deg) rotateY(${yawRef.current.toFixed(2)}deg)`;
  };

  const stopMotion = () => {
    if (motionRef.current !== null) {
      window.cancelAnimationFrame(motionRef.current);
      motionRef.current = null;
    }
  };

  const startMomentum = (initialYawVelocity, initialPitchVelocity) => {
    stopMotion();

    let yawVelocity = clamp(initialYawVelocity, -0.5, 0.5);
    let pitchVelocity = clamp(initialPitchVelocity, -0.35, 0.35);
    let last = performance.now();

    if (Math.abs(yawVelocity) < 0.002 && Math.abs(pitchVelocity) < 0.002) {
      return;
    }

    const step = (now) => {
      const delta = Math.min(now - last, 34);
      last = now;

      yawRef.current += yawVelocity * delta;
      pitchRef.current += pitchVelocity * delta;

      if (yawRef.current <= YAW_MIN || yawRef.current >= YAW_MAX) {
        yawRef.current = clamp(yawRef.current, YAW_MIN, YAW_MAX);
        yawVelocity = 0;
      }

      if (pitchRef.current <= PITCH_MIN || pitchRef.current >= PITCH_MAX) {
        pitchRef.current = clamp(pitchRef.current, PITCH_MIN, PITCH_MAX);
        pitchVelocity = 0;
      }

      const damping = Math.pow(0.92, delta / 16.67);
      yawVelocity *= damping;
      pitchVelocity *= damping;

      applyScene();

      if (
        Math.abs(yawVelocity) > 0.002 ||
        Math.abs(pitchVelocity) > 0.002
      ) {
        motionRef.current = window.requestAnimationFrame(step);
      } else {
        motionRef.current = null;
      }
    };

    motionRef.current = window.requestAnimationFrame(step);
  };

  const handlePointerDown = (event) => {
    if (projects.length === 0) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (dragCleanupRef.current) return;

    stopMotion();

    const pointerId = event.pointerId;
    const startX = event.clientX;
    const startY = event.clientY;
    const startYaw = yawRef.current;
    const startPitch = pitchRef.current;
    let lastYaw = startYaw;
    let lastPitch = startPitch;
    let lastTime = performance.now();
    let yawVelocity = 0;
    let pitchVelocity = 0;
    let moved = false;

    const cleanup = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
    };

    const onMove = (moveEvent) => {
      if (moveEvent.pointerId !== pointerId) return;

      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      if (!moved && Math.hypot(deltaX, deltaY) > 6) {
        moved = true;
        suppressClickRef.current = true;
        setHoveredId(null);
        setSelectedId(null);
        setFacePose(null);
      }

      if (!moved) return;
      if (moveEvent.cancelable) moveEvent.preventDefault();

      const now = performance.now();
      const elapsed = now - lastTime;
      const nextYaw = clamp(startYaw - deltaX * 0.18, YAW_MIN, YAW_MAX);
      const nextPitch = clamp(
        startPitch + deltaY * 0.14,
        PITCH_MIN,
        PITCH_MAX
      );

      if (elapsed > 0) {
        yawVelocity = (nextYaw - lastYaw) / elapsed;
        pitchVelocity = (nextPitch - lastPitch) / elapsed;
      }

      yawRef.current = nextYaw;
      pitchRef.current = nextPitch;
      lastYaw = nextYaw;
      lastPitch = nextPitch;
      lastTime = now;
      applyScene();
    };

    const finish = (finishEvent) => {
      if (finishEvent.pointerId !== pointerId) return;

      cleanup();
      dragCleanupRef.current = null;

      if (!moved) {
        suppressClickRef.current = false;
        return;
      }

      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);

      startMomentum(yawVelocity, pitchVelocity);
    };

    dragCleanupRef.current = cleanup;
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
  };

  const handleClickCapture = (event) => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const faceProject = (projectId, baseYaw) => {
    setFacePose({
      id: projectId,
      yaw: baseYaw + yawRef.current,
      pitch: pitchRef.current,
    });
  };

  const handlePanelClick = (event, projectId, baseYaw) => {
    if (suppressClickRef.current) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (!coarsePointer || selectedId === projectId) return;

    event.preventDefault();
    event.stopPropagation();
    setSelectedId(projectId);
    setHoveredId(null);
    faceProject(projectId, baseYaw);
  };

  const handleStageClick = (event) => {
    if (!coarsePointer) return;
    if (event.target.closest?.("[data-spatial-panel]")) return;
    setSelectedId(null);
    setFacePose(null);
  };

  const handleKeyDown = (event) => {
    if (projects.length === 0) return;

    const rotatesScene = [
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
    ].includes(event.key);

    if (rotatesScene) {
      setHoveredId(null);
      setSelectedId(null);
      setFacePose(null);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      yawRef.current = clamp(yawRef.current + 8, YAW_MIN, YAW_MAX);
      applyScene();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      yawRef.current = clamp(yawRef.current - 8, YAW_MIN, YAW_MAX);
      applyScene();
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      pitchRef.current = clamp(pitchRef.current + 6, PITCH_MIN, PITCH_MAX);
      applyScene();
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      pitchRef.current = clamp(pitchRef.current - 6, PITCH_MIN, PITCH_MAX);
      applyScene();
    }
  };

  const retry = () => {
    setLoading(true);
    setError(false);
    setFacePose(null);
    setReloadKey((key) => key + 1);
  };

  return (
    <section
      id="galeri-karya-3d"
      aria-labelledby="galeri-karya-3d-title"
      className="relative overflow-hidden bg-[#060B1A] pt-20 pb-0 light:bg-[#EDF3FB] sm:pt-24"
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
        className="pointer-events-none absolute inset-0 opacity-25 light:opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(148,163,184,0.13) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.13) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 72% 58% at 50% 42%, #000 12%, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 72% 58% at 50% 42%, #000 12%, transparent 78%)",
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
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-32 bg-gradient-to-b from-transparent via-[#F8FAFC]/55 to-[#F8FAFC] sm:h-40"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-10">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200 shadow-[0_10px_30px_-18px_rgba(34,211,238,0.8)] backdrop-blur-sm light:border-blue-200 light:bg-white/70 light:text-[#1D6FF2] light:shadow-[0_8px_24px_-18px_rgba(29,111,242,0.7)] sm:text-[11px]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Galeri Karya 3D
          </span>

          <h2
            id="galeri-karya-3d-title"
            className="mt-5 text-[2.1rem] font-bold leading-tight tracking-tight text-white light:text-slate-900 sm:text-5xl lg:text-[3.4rem]"
          >
            Setiap karya punya{" "}
            <span className="text-cyan-300 light:text-[#1D6FF2]">orbitnya</span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 light:text-slate-600 sm:text-base">
            Geser galeri untuk menjelajahi karya. Hover untuk melihat kategori,
            klik untuk membuka detail karya.
          </p>
        </div>

        <div
          ref={stageRef}
          role="region"
          data-spatial-stage="true"
          aria-roledescription="galeri 3D"
          aria-label="Galeri karya 3D"
          aria-busy={loading}
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onClickCapture={handleClickCapture}
          onClick={handleStageClick}
          onKeyDown={handleKeyDown}
          className="relative mt-9 h-[480px] w-full cursor-grab touch-none select-none outline-none active:cursor-grabbing sm:mt-12 sm:h-[560px] lg:h-[650px] [perspective:2600px] [perspective-origin:50%_50%] focus-visible:ring-2 focus-visible:ring-cyan-300/50 focus-visible:ring-offset-4 focus-visible:ring-offset-[#060B1A] light:focus-visible:ring-[#1D6FF2]/40 light:focus-visible:ring-offset-[#EDF3FB]"
        >
          <div
            ref={sceneRef}
            data-spatial-scene="true"
            className="absolute inset-0 [transform-style:preserve-3d] will-change-transform"
          >
            {!loading &&
              !error &&
              projects.map((project, index) => {
                const slot = layoutFor(index, projects.length, isCompact);
                const base = orientationFor(slot);
                const isSelected = selectedId === project.id;
                const isActive = hoveredId === project.id || isSelected;
                const pose = facePose?.id === project.id ? facePose : null;
                const depthOpacity = clamp(
                  0.66 +
                    Math.max(0, Math.min(1, (slot.z + 1300) / 1050)) * 0.34,
                  0.66,
                  1
                );
                const activeTransform = isActive
                  ? pose
                    ? `rotateX(${-base.pitch}deg) rotateY(${-pose.yaw}deg) rotateX(${-pose.pitch}deg) translateZ(80px) scale(1.06)`
                    : `rotateX(${-base.pitch}deg) rotateY(${-base.yaw}deg) translateZ(80px) scale(1.06)`
                  : "rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)";

                return (
                  <Link
                    key={project.id}
                    to={project.href}
                    draggable={false}
                    data-spatial-panel="true"
                    aria-label={`${project.title} — ${project.category}`}
                    onPointerEnter={(event) => {
                      if (dragCleanupRef.current) return;
                      if (event.pointerType && event.pointerType !== "mouse") {
                        return;
                      }
                      setHoveredId(project.id);
                      faceProject(project.id, base.yaw);
                    }}
                    onPointerLeave={(event) => {
                      if (event.pointerType && event.pointerType !== "mouse") {
                        return;
                      }
                      setHoveredId((current) =>
                        current === project.id ? null : current
                      );
                      setFacePose((current) =>
                        current?.id === project.id && selectedId !== project.id
                          ? null
                          : current
                      );
                    }}
                    onFocus={() => {
                      setHoveredId(project.id);
                      faceProject(project.id, base.yaw);
                    }}
                    onBlur={() => {
                      setHoveredId((current) =>
                        current === project.id ? null : current
                      );
                      setFacePose((current) =>
                        current?.id === project.id && selectedId !== project.id
                          ? null
                          : current
                      );
                    }}
                    onClick={(event) =>
                      handlePanelClick(event, project.id, base.yaw)
                    }
                    className="group absolute block w-[clamp(82px,22vw,100px)] cursor-grab outline-none [transform-style:preserve-3d] will-change-transform active:cursor-grabbing transition-opacity duration-300 sm:w-[clamp(100px,14vw,125px)] lg:w-[clamp(118px,11.5vw,130px)] focus-visible:ring-2 focus-visible:ring-cyan-300/80 focus-visible:ring-offset-4 focus-visible:ring-offset-[#060B1A] light:focus-visible:ring-[#1D6FF2]/50 light:focus-visible:ring-offset-[#EDF3FB]"
                    style={{
                      left: `${50 + slot.x}%`,
                      top: `${50 + slot.y}%`,
                      transform: panelTransform(slot, base.yaw, base.pitch),
                      opacity: depthOpacity,
                    }}
                  >
                    <span
                      className="block aspect-[4/3] overflow-hidden rounded-[14px] border border-white/15 bg-[#081120] shadow-[0_22px_48px_-22px_rgba(0,0,0,0.95)] transition-transform duration-300 ease-out will-change-transform [backface-visibility:hidden] light:border-slate-200/90 light:bg-white light:shadow-[0_22px_48px_-24px_rgba(15,23,42,0.45)]"
                      style={{
                        transform: activeTransform,
                        transformOrigin: "center center",
                      }}
                    >
                      <span aria-hidden className="absolute inset-0">
                        <img
                          src={project.image}
                          alt=""
                          draggable={false}
                          className="h-full w-full scale-110 object-cover opacity-45 blur-xl"
                        />
                      </span>

                      <span
                        aria-hidden
                        className="absolute inset-0 bg-gradient-to-b from-[#08101F]/10 via-[#08101F]/15 to-[#030712]/80"
                      />

                      <img
                        src={project.image}
                        alt=""
                        draggable={false}
                        decoding="async"
                        className="relative z-10 h-full w-full object-contain p-2 sm:p-2.5"
                      />

                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 z-20 rounded-[14px] ring-1 ring-inset ring-white/10 light:ring-slate-900/5"
                      />

                      <span
                        className={`pointer-events-none absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-[#030712]/95 via-[#030712]/55 to-transparent p-3 pt-10 transition-all duration-300 sm:p-3.5 sm:pt-12 ${
                          isActive
                            ? "translate-y-0 opacity-100"
                            : "translate-y-2 opacity-0"
                        }`}
                      >
                        <span className="inline-flex max-w-full items-center rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-cyan-100 backdrop-blur-sm sm:text-[9px]">
                          <span className="truncate">{project.category}</span>
                        </span>
                        <span className="mt-1.5 block line-clamp-2 text-[10px] font-semibold leading-snug text-white sm:text-[11px]">
                          {project.title}
                        </span>
                        {coarsePointer && isSelected && (
                          <span className="mt-1 block text-[8px] font-medium text-slate-300/90 sm:text-[9px]">
                            Tap lagi untuk membuka
                          </span>
                        )}
                      </span>
                    </span>
                  </Link>
                );
              })}

            {loading &&
              buildPanelSlots(
                isCompact ? RING_TIERS_MOBILE : RING_TIERS_DESKTOP
              )
                .slice(0, 8)
                .map((_, index) => {
                  const slot = layoutFor(index, 8, isCompact);
                  const base = orientationFor(slot);

                return (
                  <div
                    key={`skeleton-${index}`}
                    aria-hidden
                    className="pointer-events-none absolute block w-[clamp(82px,22vw,100px)] animate-pulse sm:w-[clamp(100px,14vw,125px)] lg:w-[clamp(118px,11.5vw,130px)]"
                    style={{
                      left: `${50 + slot.x}%`,
                      top: `${50 + slot.y}%`,
                      transform: panelTransform(slot, base.yaw, base.pitch),
                    }}
                  >
                    <div className="aspect-[4/3] overflow-hidden rounded-[14px] border border-white/10 bg-white/5 light:border-white/80 light:bg-white/70" />
                  </div>
                );
              })}
          </div>
          {loading && (
            <div className="pointer-events-none absolute inset-x-0 bottom-8 z-30 flex justify-center">
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
            <div className="absolute inset-0 z-30 flex items-center justify-center px-4">
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
            <div className="absolute inset-0 z-30 flex items-center justify-center px-4">
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
        {!loading && !error && projects.length > 0 && (
          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:mt-5 sm:flex-row">
            <p className="inline-flex items-center gap-2 text-[11px] font-medium text-slate-400 light:text-slate-500 sm:text-xs">
              <MousePointer2 className="h-3.5 w-3.5" aria-hidden />
              {coarsePointer
                ? "Geser ruang untuk memutar. Tap panel untuk melihat kategori."
                : "Tarik ruang untuk memutar pandangan galeri."}
            </p>

            <span className="text-[11px] font-medium text-slate-400 light:text-slate-500 sm:text-xs">
              {String(projects.length).padStart(2, "0")} karya
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
