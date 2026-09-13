import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Grid3x3,
  History,
  Layers,
  User,
  Users,
} from "lucide-react";
import api from "../../../services/api";
import { imageUrl } from "../../../utils/imageUrl";
import { useTheme } from "../../../context/ThemeContext";
import SmartImage from "../../ui/SmartImage";

// Data cadangan bila API belum tersedia / output kosong. Struktur ini
// sengaja dibuat semirip mungkin dengan response API /projects agar mudah
// diganti data manual tanpa menyentuh logika komponen.
const FALLBACK_PROJECTS = [
  {
    id: "fb-plts",
    title: "Sistem Monitoring PLTS Berbasis IoT",
    slug: "plts-iot",
    description:
      "Pantau produksi dan konsumsi daya PLTS secara real-time lewat sensor IoT dan dashboard berbasis web.",
    category: "PLTS IoT",
    categorySlug: "iot",
    thumbnail: "https://placehold.co/800x600/06283d/22d3ee?text=PLTS+IoT",
    year: 2025,
    author: "Tim Elektro",
    status: "published",
    updatedAt: "2025-03-14T08:00:00.000Z",
  },
  {
    id: "fb-robot",
    title: "Robot Line Follower Otomatis",
    slug: "robot-line-follower",
    description:
      "Robot penjejak garis dengan kontrol PID untuk akurasi dan kecepatan melintasi lintasan.",
    category: "Robotika",
    categorySlug: "robotika",
    thumbnail: "https://placehold.co/800x600/0f2232/7dd3fc?text=Robotika",
    year: 2025,
    author: "Tim Robotika",
    status: "published",
    updatedAt: "2025-09-01T08:00:00.000Z",
  },
  {
    id: "fb-electro",
    title: "Modul Rangkaian Dasar Elektronika",
    slug: "rangkaian-elektronik",
    description:
      "Modul praktikum papan rangkaian dengan proteksi arus dan indikator digital.",
    category: "Rangkaian Elektronik",
    categorySlug: "rangkaian-elektronik",
    thumbnail: "https://placehold.co/800x600/1e1b4b/818cf8?text=Rangkaian",
    year: 2024,
    author: "Tim Elektronika",
    status: "published",
    updatedAt: "2024-11-20T08:00:00.000Z",
  },
  {
    id: "fb-appweb",
    title: "Aplikasi & Web Layanan Kampus",
    slug: "aplikasi-web",
    description:
      "Aplikasi mobile dan website layanan akademik yang saling terintegrasi.",
    category: "Aplikasi & Web",
    categorySlug: "website",
    thumbnail: "https://placehold.co/800x600/082f49/38bdf8?text=Aplikasi+%26+Web",
    year: 2026,
    author: "Tim Pengembangan",
    status: "published",
    updatedAt: "2026-02-18T08:00:00.000Z",
  },
];

// Jumlah maksimal karya yang dimuat dari API. Diambil lebih banyak dari
// tampilan agar kartu kategori di bawah mencakup semua kategori yang ada.
const FETCH_LIMIT = 50;
// Jumlah maksimal slide yang ditampilkan di carousel hero — dijaga sedikit
// agar deretan titik penunjuk tetap ringkas.
const MAX_SLIDES = 6;

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
  };
}

// Format tanggal update terakhir ke Bahasa Indonesia (mis. "14 Mar 2025").
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

// Label status karya untuk badge "Status" — sesuai API /projects.
const STATUS_MAP = {
  published: "Aktif",
  active: "Aktif",
  draft: "Draf",
  archived: "Arsip",
};

// Tinggi kartu dibuat 50% dari lebar lewat padding-top (bukan aspect-ratio)
// agar rasio landscape 2:1 terjamin di semua browser / kompositor.
const CARD_HEIGHT_STYLE = { paddingTop: "50%", height: "0px" };

function HeroKaryaShowcase({ variant }) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  // Light mode di-render pada halaman yang sama (hanya class html.light),
  // jadi tema dibaca dari context. Prop variant opsional untuk komponen
  // yang di-mount di luar ThemeProvider.
  const isLight = (variant || theme) === "light";

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Statistik untuk floating badge & stats row diambil dari endpoint yang sama
  // dengan HeroStats (/stats) — angka di badge selalu sinkron dengan kartu
  // statistik utama, bukan angka karangan. totalUser dipakai sebagai kolom
  // keempat (Kontributor).
  const [stats, setStats] = useState({
    projectsCount: "0",
    categoriesCount: "0",
    visitorsCount: "0",
    usersCount: "0",
  });

  useEffect(() => {
    let cancelled = false;
    api
      .get("/stats")
      .then((res) => {
        if (cancelled) return;
        const d = res.data.data || res.data;
        setStats({
          projectsCount: String(d.totalProject ?? "-"),
          categoriesCount: String(d.totalCategory ?? "-"),
          visitorsCount: String(d.totalVisitors ?? "-"),
          usersCount: String(d.totalUser ?? "-"),
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/projects", { params: { status: "published", limit: FETCH_LIMIT } })
      .then((res) => {
        if (cancelled) return;
        const items = res.data.data.items || res.data.data || [];
        const normalized = items
          .map(normalizeProject)
          .filter((p) => p.title && p.slug);
        setProjects(normalized.length ? normalized : FALLBACK_PROJECTS);
      })
      .catch(() => {
        if (!cancelled) setProjects(FALLBACK_PROJECTS);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Daftar slide carousel: maks 6, tapi diprioritaskan agar tiap kategori
  // yang ada tampil minimal satu kali (semua kartu kategori bisa diklik).
  const slides = useMemo(() => {
    const byCat = new Map();
    for (const p of projects) {
      const key = p.categorySlug || "karya";
      if (!byCat.has(key)) byCat.set(key, []);
      byCat.get(key).push(p);
    }
    const ordered = [];
    for (const arr of byCat.values()) if (arr[0]) ordered.push(arr[0]);
    for (const arr of byCat.values()) ordered.push(...arr.slice(1));
    return ordered.slice(0, MAX_SLIDES);
  }, [projects]);

  const count = slides.length;
  const preview = count ? slides[active] : null;

  // Geometri 4 badge pill di SISI KIRI-KANAN kartu (bukan atas/bawah, agar
  // tidak menambah tinggi section):
  //   LT/LB -> kiri  : top 15%/65% dari TINGGI KARTU + left:-20px + pill
  //                    di-geser translateX(-100%) => menjorok penuh keluar kiri
  //                    dengan gap 20px dari tepi kartu (pill hanya sibuk
  //                    horizontal, vertikalnya STAY dalam 0..100% tinggi kartu).
  //   RT/RB -> kanan  : mirror (right:-20px + translateX(100%)).
  // Konteks: grup badge adalah anak dari kontainer kartu (.relative.isolate),
  // jadi `top:%` dihitung RELATIF ke tinggi kartu. SVG konektor tiap badge
  // di-anchor ke GRUP (bukan pill) supaya tetap diam terhadap kartu; dot ujung
  // tepat ON tepi kartu (kiri/kanan) yang berdekatan.
const CONNECTOR = {
    lt: {
      group: "top-[15%] -left-2 lg:-left-3 xl:-left-5",
      shift: "showcase-badge-left",
      svgPos: "left-0 -top-0",
      w: 40,
      h: 46,
      path: "M -4 22 L 16 22 L 40 4",
      dot: { x: 43, y: 4 },
      origin: "43px 4px",
    },
    lb: {
      group: "top-[65%] -left-2 lg:-left-3 xl:-left-5",
      shift: "showcase-badge-left",
      svgPos: "left-0 -top-0",
      w: 40,
      h: 46,
      path: "M -4 22 L 16 22 L 40 40",
      dot: { x: 43, y: 40 },
      origin: "43px 40px",
    },
    rt: {
      group: "top-[15%] -right-2 lg:-right-3 xl:-right-5",
      shift: "showcase-badge-right",
      svgPos: "right-0 -top-0",
      w: 40,
      h: 46,
      path: "M 44 22 L 24 22 L 0 4",
      dot: { x: -3, y: 4 },
      origin: "-3px 4px",
    },
    rb: {
      group: "top-[65%] -right-2 lg:-right-3 xl:-right-5",
      shift: "showcase-badge-right",
      svgPos: "right-0 -top-0",
      w: 40,
      h: 46,
      path: "M 44 22 L 24 22 L 0 40",
      dot: { x: -3, y: 40 },
      origin: "-3px 40px",
    },
  };

  // Konten badge (FIX 2): metadata karya aktif — BUKAN nama kategori (yang
  // sudah tampil di strip di bawah kartu). nilainya sinkron dengan slide.
  const badgeItems = useMemo(() => {
    const s = preview || {};
    return [
      {
        key: "author",
        icon: User,
        label: "Dibuat Oleh",
        value: s.author || "Tim Elektro",
        corner: "lt",
        delay: 0,
      },
      {
        key: "year",
        icon: CalendarDays,
        label: "Tahun Rilis",
        value: s.year ? String(s.year) : "—",
        corner: "rt",
        delay: 0.5,
      },
      {
        key: "status",
        icon: BadgeCheck,
        label: "Status",
        value: STATUS_MAP[s.status] || s.status || "Aktif",
        corner: "lb",
        delay: 1,
      },
      {
        key: "updated",
        icon: History,
        label: "Update Terakhir",
        value: formatDate(s.updatedAt),
        corner: "rb",
        delay: 1.5,
      },
    ];
  }, [preview]);

  const activeRef = useRef(0);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // Arah masuk slide: maju/autoplay => dari kanan; mundur atau wrap-balik
  // (ujung kanan -> kiri) => dari kiri.
  const [slideDir, setSlideDir] = useState(1);
  const goTo = useCallback(
    (i) => {
      const cur = activeRef.current;
      const next = ((i % count) + count) % count;
      if (next === cur) return;
      const delta = ((next - cur) % count + count) % count;
      // Masuk dari kiri saat mundur, ataupun putaran maju yang "balik ke kiri"
      // (ujung kanan -> awal).
      setSlideDir(next < cur || delta === count - 1 ? -1 : 1);
      setActive(next);
    },
    [count]
  );
  const next = useCallback(() => goTo(activeRef.current + 1), [goTo]);
  const prev = useCallback(() => goTo(activeRef.current - 1), [goTo]);

  // Kategori strip bawah diambil dari data asli (props/state projects) —
  // kartu per kategori pertama (maks 4), lengkap dengan thumbnail
  // representatifnya. Bukan data dummy; selaras dengan carousel utama.
  const categories = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const p of projects) {
      const key = p.categorySlug || p.category || "karya";
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        key,
        category: p.category || "Karya",
        thumbnail: p.thumbnail,
        title: p.title,
      });
      if (out.length === 4) break;
    }
    return out;
  }, [projects]);

  const activeCategory = preview ? preview.categorySlug || preview.category : "";
  const goToCategory = useCallback(
    (key) => {
      const idx = slides.findIndex((p) => (p.categorySlug || p.category || "karya") === key);
      if (idx >= 0) goTo(idx);
    },
    [slides, goTo]
  );

  // Autoplay halus: jeda pendek 3 detik, dan berhenti saat kursor hover.
  useEffect(() => {
    if (paused || count < 2) return;
    const t = setInterval(() => goTo(activeRef.current + 1), 3000);
    return () => clearInterval(t);
  }, [paused, count, goTo]);

  const openDetail = () => {
    if (!preview) return;
    navigate(`/karya/${preview.categorySlug}/${preview.slug || preview.id}`);
  };

  // Peta gaya per theme (dark / light) — showcase berupa panel 3D yang
  // melayang: layer berlapis + border solid (outer box-shadow di CSS) + glow
  // halus. Bentuk jajaran genjang tajam + border satu warna solid di CSS.
  const cls = {
    label: isLight
      ? "border-blue-700 bg-blue-600 text-white shadow-sm"
      : "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
    rule: isLight ? "from-blue-500/40 via-blue-400/20 to-transparent" : "from-cyan-400/40 via-blue-500/20 to-transparent",
    backBorder: isLight
      ? "border-[rgba(37,99,235,0.85)]"
      : "border-cyan-400",
    backShell: isLight ? "border-[rgba(37,99,235,0.25)]" : "border-cyan-400/25",
    backFill1: isLight ? "bg-white/95" : "bg-[#0d2546]/80",
    backFill2: isLight ? "bg-blue-50/90" : "bg-[#0a1f3c]/75",
    backFill3: isLight ? "bg-sky-100/85" : "bg-[#081933]/65",
    cardBg: isLight ? "bg-white" : "bg-[#0a1f3d]",
    // Strip border solid satu warna — teknik isi-penuh + konten inset (lihat
    // komentar di index.css) agar merata di keempat sisi jajaran genjang.
    borderStrip: isLight ? "bg-[rgba(37,99,235,0.65)]" : "bg-[rgba(56,189,248,0.95)]",
    ringInner: isLight ? "ring-1 ring-inset ring-blue-400/25" : "ring-1 ring-inset ring-white/10",
    imgOverlay: isLight ? "from-white/95 via-white/55 to-transparent" : "from-[#021026]/95 via-[#031430]/45 to-transparent",
    hiEdge: isLight ? "from-blue-400/70 via-sky-200/40 to-transparent" : "from-cyan-300/80 via-cyan-200/30 to-transparent",
    vignette: isLight ? "bg-[radial-gradient(120%_90%_at_30%_20%,transparent_45%,rgba(255,255,255,0.8)_100%)]" : "bg-[radial-gradient(120%_90%_at_30%_20%,transparent_45%,rgba(2,12,32,0.55)_100%)]",
    chip: isLight ? "border-white/40 bg-blue-700/90 text-white backdrop-blur-md" : "border-cyan-400/40 bg-[#041d38]/70 text-cyan-300 backdrop-blur-md",
    eyebrow: isLight ? "text-blue-600" : "text-cyan-300",
    title: isLight ? "text-navy-ink" : "text-white",
    meta: isLight ? "text-slate-500" : "text-slate-400",
    metaDotC: isLight ? "bg-blue-500/80" : "bg-cyan-400/80",
    metaDotB: isLight ? "bg-cyan-400/70" : "bg-blue-500/70",
    arrow: isLight
      ? "border-white bg-white text-blue-700 shadow-[0_4px_14px_-2px_rgba(2,12,32,0.22)] hover:border-blue-200 hover:text-blue-800 hover:shadow-[0_6px_18px_-4px_rgba(2,12,32,0.3)]"
      : "border-white/70 bg-white text-blue-700 shadow-[0_4px_14px_-2px_rgba(2,12,32,0.5)] hover:border-white hover:text-blue-800 hover:shadow-[0_6px_18px_-4px_rgba(2,12,32,0.55)]",
    nav: isLight
      ? "border-blue-200 bg-white text-blue-600 shadow-[0_4px_14px_-2px_rgba(37,99,235,0.35)] hover:border-blue-400 hover:text-blue-700 hover:shadow-[0_0_14px_rgba(56,189,248,0.45)]"
      : "border-white/70 bg-white text-blue-700 shadow-[0_4px_14px_-2px_rgba(2,12,32,0.5)] hover:border-white hover:text-blue-800 hover:shadow-[0_0_14px_rgba(255,255,255,0.35)]",
    dotActive: isLight ? "bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]" : "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]",
    dotIdle: isLight ? "bg-blue-200 hover:bg-blue-400" : "bg-slate-600 hover:bg-slate-400",
    // Strip kategori (FIX 3): hanya sentuhan visual — ukuran/padding/layout
    // kartu TIDAK berubah. Gradient halus, glow tipis saat aktif, hover lebih
    // hidup, warna ikon/tulisan mengikuti tema cyan/biru.
    catActive: isLight
      ? "border-blue-500 bg-gradient-to-r from-blue-500/20 via-cyan-400/15 to-blue-500/20 text-blue-700 ring-1 ring-inset ring-blue-400/40 shadow-[0_2px_10px_-2px_rgba(37,99,235,0.45),0_0_16px_rgba(56,189,248,0.3)]"
      : "border-cyan-400/90 bg-gradient-to-r from-cyan-400/25 via-blue-500/20 to-cyan-400/25 text-cyan-200 ring-1 ring-inset ring-cyan-300/40 shadow-[0_2px_12px_-2px_rgba(34,211,238,0.5),0_0_18px_rgba(34,211,238,0.35)]",
    catIdle: isLight
      ? "border-blue-200/80 bg-white/70 text-slate-600 hover:-translate-y-0.5 hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-500/10 hover:via-cyan-400/10 hover:to-blue-500/10 hover:text-blue-700 hover:shadow-[0_0_12px_rgba(37,99,235,0.3)]"
      : "border-white/10 bg-white/[0.03] text-slate-400 hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-gradient-to-r hover:from-cyan-400/10 hover:via-blue-500/10 hover:to-cyan-400/10 hover:text-cyan-200 hover:shadow-[0_0_14px_rgba(34,211,238,0.3)]",
    catThumb: isLight
      ? "border-blue-300/90 ring-1 ring-blue-400/30 shadow-[0_0_8px_rgba(56,189,248,0.3)]"
      : "border-cyan-400/50 ring-1 ring-cyan-300/20 shadow-[0_0_10px_rgba(34,211,238,0.3)]",
    catLabel: isLight
      ? "border-white/60 bg-blue-600 text-white shadow-[0_4px_12px_-2px_rgba(37,99,235,0.5)]"
      : "border-white/30 bg-cyan-400/20 text-white shadow-[0_0_12px_rgba(34,211,238,0.3)]",
    catRule: isLight
      ? "from-blue-500/80 via-cyan-400/40 to-transparent"
      : "from-cyan-400/90 via-cyan-300/40 to-transparent",
    catRuleShine: "cat-rule-shine",
    // Floating badge — capsule/pill di 4 sudut kartu (posisi penuh di luar
    // kartu lihat CONNECTOR). backdrop-blur dipasang tapi bg tetap pekat
    // supaya tetap tergambar walau renderer mengabaikan backdrop compositing.
    badgePill: isLight
      ? "border-blue-300/80 bg-white/90 shadow-[0_0_0_1px_rgba(37,99,235,0.18),0_0_16px_rgba(56,189,248,0.35),0_8px_22px_-8px_rgba(37,99,235,0.5)]"
      : "border-cyan-300/70 bg-[#031a33]/85 shadow-[0_0_0_1px_rgba(34,211,238,0.28),0_0_18px_rgba(34,211,238,0.45),0_8px_22px_-8px_rgba(2,12,32,0.85)]",
    badgeBadge: isLight
      ? "bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-[0_2px_10px_-2px_rgba(37,99,235,0.7)]"
      : "bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-[0_0_12px_rgba(34,211,238,0.55)]",
    badgeTitle: isLight ? "text-slate-900" : "text-white",
    badgeLabel: isLight ? "text-slate-500" : "text-slate-400",
    badgeLine: isLight ? "#38bdf8" : "#22d3ee",
    dotCore: "#ffffff",
    strokeGlow: isLight
      ? "drop-shadow-[0_0_3px_rgba(59,130,246,0.75)]"
      : "drop-shadow-[0_0_3px_rgba(34,211,238,0.95)]",
    blobA: isLight ? "bg-gradient-to-br from-blue-400/40 to-cyan-300/30" : "bg-gradient-to-br from-cyan-500/60 to-blue-600/50",
    blobB: isLight ? "bg-gradient-to-tr from-sky-300/35 to-blue-400/25" : "bg-gradient-to-tr from-blue-600/50 to-cyan-500/40",
    skeleton: isLight ? "bg-blue-100/70" : "bg-slate-800/40",
  };

  return (
    <div
      className="hero-karya-showcase group relative w-full max-w-[600px] mx-auto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Blob ambient glow di belakang seluruh kartu — murni dekoratif. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -top-10 right-0 z-0 h-44 w-44 animate-karta-pulse rounded-full blur-[70px] md:h-64 md:w-64 ${cls.blobA}`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-0 -left-12 z-0 h-52 w-52 animate-karta-pulse-slow rounded-full blur-[80px] ${cls.blobB}`}
      />

      <div className="relative z-20">
        <div className="relative isolate [perspective:1400px]">
          {/* Floating badge — capsule di sisi KIRI-KANAN kartu (geometri di
              CONNECTOR, konten di badgeItems). Anak dari kontainer kartu supaya
              `top:%` relatif tinggi kartu. pointer-events-none supaya tidak
              menghalangi klik pada kartu/prev/next. Kartu bobbing, garis SVG
              konektor tetap diam. */}
          {badgeItems.map((b) => {
            const cfg = CONNECTOR[b.corner];
            const Icon = b.icon;
            return (
              <div
                key={b.key}
                className={`pointer-events-none absolute z-30 hidden md:block ${cfg.group}`}
              >
                <svg
                  aria-hidden="true"
                  className={`showcase-connector absolute overflow-visible ${cfg.svgPos} ${cls.strokeGlow}`}
                  style={{ transformOrigin: cfg.origin }}
                  width={cfg.w}
                  height={cfg.h}
                  viewBox={`0 0 ${cfg.w} ${cfg.h}`}
                  fill="none"
                >
                  <defs>
                    <radialGradient
                      id={`dot-g-${b.corner}`}
                      cx="50%"
                      cy="42%"
                      r="65%"
                    >
                      <stop offset="0%" stopColor={cls.dotCore} />
                      <stop offset="60%" stopColor={cls.badgeLine} stopOpacity="0.95" />
                      <stop offset="100%" stopColor={cls.badgeLine} />
                    </radialGradient>
                  </defs>
                  <path
                    d={cfg.path}
                    pathLength="1"
                    stroke={cls.badgeLine}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-karta-draw"
                    style={{ animationDelay: `${b.delay + 0.25}s` }}
                  />
                  <circle
                    cx={cfg.dot.x}
                    cy={cfg.dot.y}
                    r="7.5"
                    fill={cls.badgeLine}
                    opacity="0.16"
                    className="animate-pulse"
                  />
                  <circle
                    cx={cfg.dot.x}
                    cy={cfg.dot.y}
                    r="4.2"
                    fill="none"
                    stroke={cls.badgeLine}
                    strokeWidth="1.1"
                    opacity="0.85"
                  />
                  <circle
                    cx={cfg.dot.x}
                    cy={cfg.dot.y}
                    r="3"
                    fill={`url(#dot-g-${b.corner})`}
                  />
                  <circle
                    cx={cfg.dot.x}
                    cy={cfg.dot.y}
                    r="1.4"
                    fill={cls.dotCore}
                    opacity="0.95"
                  />
                </svg>
                <div className={cfg.shift}>
                  <div
                    className={`animate-karta-float flex items-center gap-2.5 rounded-full border py-1 pl-1.5 pr-4 backdrop-blur-md ${cls.badgePill}`}
                    style={{ animationDelay: `${b.delay}s` }}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${cls.badgeBadge}`}
                    >
                      <Icon size={16} strokeWidth={2.2} />
                    </span>
                    <span className="flex min-w-0 flex-col justify-center leading-tight">
                      <span
                        className={`max-w-[120px] truncate text-[11px] font-bold ${cls.badgeTitle}`}
                        title={b.value}
                      >
                        {b.value}
                      </span>
                      <span
                        className={`max-w-[120px] truncate text-[9px] ${cls.badgeLabel}`}
                      >
                        {b.label}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          <div
            aria-hidden="true"
            key={`back-${active}`}
            className={`pointer-events-none absolute inset-0 z-0 border ${cls.backShell} animate-karta-back-sway transition-transform duration-700 ease-out group-hover:translate-x-2 group-hover:translate-y-1`}
          >
            <div
              aria-hidden="true"
              className={`showcase-back-3 absolute inset-0 border-[3px] opacity-[0.65] ${cls.backBorder} ${cls.backFill3}`}
            />
            <div
              aria-hidden="true"
              className={`showcase-back-2 absolute inset-0 z-[1] border-[3px] opacity-[0.8] ${cls.backBorder} ${cls.backFill2}`}
            />
            <div
              aria-hidden="true"
              className={`showcase-back-1 absolute inset-0 z-[2] border-[3px] opacity-[0.9] ${cls.backBorder} ${cls.backFill1}`}
            />
          </div>

          <div
            className="group/img relative z-10 duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] [transform:translate(0,0)_scale(1)] hover:[transform:translate(-6px,-6px)_scale(1.02)]"
          >
            {loading || !preview ? (
              <div className="showcase-card relative" style={CARD_HEIGHT_STYLE}>
                <div aria-hidden="true" className={`showcase-border absolute inset-0 ${cls.borderStrip}`} />
                <div
                  className={`showcase-inner absolute inset-[3px] overflow-hidden ${cls.skeleton}`}
                >
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="h-6 w-24 rounded-md bg-white/10" />
                  </div>
                </div>
              </div>
            ) : (
              <div
                key={`${active}-${slideDir}`}
                className={
                  slideDir > 0 ? "animate-karta-slide-in-right" : "animate-karta-slide-in-left"
                }
              >
                <div className="showcase-card relative" style={CARD_HEIGHT_STYLE}>
                  <div aria-hidden="true" className={`showcase-border absolute inset-0 ${cls.borderStrip}`} />
                  <div
                    className={`showcase-inner absolute inset-[3px] overflow-hidden ${cls.cardBg} ${cls.ringInner}`}
                  >
                    <SmartImage
                      src={imageUrl(preview.thumbnail)}
                      alt={preview.title}
                      eager
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                    />
                    <div
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-t ${cls.imgOverlay}`}
                    />
                    <div
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r opacity-70 ${cls.hiEdge}`}
                    />
                    <div
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-0 ${cls.vignette}`}
                    />
                    <button
                      type="button"
                      onClick={openDetail}
                      aria-label={`Buka detail ${preview.title}`}
                      className="absolute inset-0 z-10 cursor-pointer"
                    />
                    {preview.category && (
                      <span
                        className={`absolute left-3 top-3 z-20 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold lg:left-4 lg:top-4 ${cls.chip}`}
                      >
                        <Layers size={10} />
                        {preview.category}
                      </span>
                    )}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-4 pb-3.5 sm:px-5 sm:pb-4 lg:px-6 lg:pb-5">
                      <span
                        className={`text-[9px] font-black uppercase tracking-[0.2em] lg:text-[10px] ${cls.eyebrow}`}
                      >
                        Karya Terbaru
                      </span>
                      <h3
                        className={`mt-0.5 text-sm font-extrabold leading-snug sm:text-lg lg:text-xl ${cls.title}`}
                      >
                        {preview.title}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={openDetail}
                      aria-label={`Buka detail ${preview.title}`}
                      className={`absolute bottom-3.5 right-4 z-30 flex h-7 w-7 cursor-pointer items-center justify-center rounded-xl transition-all duration-300 active:scale-95 sm:bottom-4 sm:right-5 sm:h-8 sm:w-8 lg:right-6 lg:h-9 lg:w-9 ${cls.arrow}`}
                    >
                      <ArrowRight size={15} className="lg:h-[17px] lg:w-[17px]" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={prev}
            aria-label="Karya sebelumnya"
            className={`absolute left-1.5 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 translate-x-0 cursor-pointer items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 sm:-left-5 sm:-translate-x-1/2 sm:h-9 sm:w-9 lg:h-10 lg:w-10 ${cls.nav}`}
          >
            <ArrowLeft size={15} className="lg:h-4 lg:w-4" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Karya berikutnya"
            className={`absolute right-1.5 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 translate-x-0 cursor-pointer items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 sm:-right-5 sm:translate-x-1/2 sm:h-9 sm:w-9 lg:h-10 lg:w-10 ${cls.nav}`}
          >
            <ArrowRight size={15} className="lg:h-4 lg:w-4" />
          </button>
        </div>
      </div>

      {count > 1 && (
        <div className="mt-2.5 flex items-center justify-center">
          <div className="flex items-center gap-1.5">
            {slides.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Karya ${i + 1}`}
                className={`h-1.5 cursor-pointer rounded-full transition-all duration-300 ${
                  i === active ? `w-6 ${cls.dotActive}` : `w-1.5 ${cls.dotIdle}`
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {count > 1 && categories.length > 0 && (
        <div className="relative z-40 mt-10">
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute -inset-x-3 -inset-y-2 -skew-x-[4deg] rounded-lg border bg-white/[0.04] ${cls.backShell}`}
          />
          <div className="flex items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] ${cls.catLabel}`}
            >
              <Layers size={11} />
              Kategori
            </span>
            <span
              className={`relative h-[2px] flex-1 overflow-hidden rounded-full bg-gradient-to-r ${cls.catRule}`}
            >
              <span className={`absolute inset-0 ${cls.catRuleShine}`} />
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {categories.map((c, i) => {
              const isActive = c.key === activeCategory;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => goToCategory(c.key)}
                  style={{
                    transform: `skewX(-4deg) ${
                      i % 2 === 0 ? "translateY(-1px)" : "translateY(2px)"
                    }`,
                  }}
                  className={`group/cat flex cursor-pointer items-center gap-1.5 rounded-[4px] border py-0.5 pl-0.5 pr-2.5 transition-all duration-300 ${
                    isActive ? cls.catActive : cls.catIdle
                  }`}
                >
                  <span
                    className={`relative h-6 w-8 shrink-0 overflow-hidden rounded-md border ${cls.catThumb}`}
                  >
                    <SmartImage
                      src={imageUrl(c.thumbnail)}
                      alt={c.title}
                      className="absolute inset-0 h-full w-full scale-[1.35] object-cover transition-transform duration-500 group-hover/cat:scale-[1.5]"
                    />
                  </span>
                  <span className="text-[9px] font-semibold tracking-wide sm:text-[10px]">
                    {c.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default HeroKaryaShowcase;