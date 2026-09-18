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
// agar deretan titik penunjuk tetap ringkas (sama dengan kuota admin).
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

// Tinggi kartu dibuat 56.25% dari lebar lewat padding-top (bukan aspect-ratio)
// agar rasio landscape 16:9 terjamin di semua browser / kompositor.
const CARD_HEIGHT_STYLE = { paddingTop: "56.25%", height: "0px" };

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

  useEffect(() => {
    let cancelled = false;
    const fetchSlides = async () => {
      try {
        let res = await api.get("/projects", {
          params: { status: "published", limit: FETCH_LIMIT, slideshow: "true" },
        });
        let items = res.data.data.items || res.data.data || [];
        let normalized = items
          .map(normalizeProject)
          .filter((p) => p.title && p.slug);
        // Kalau admin belum menandai karya slideshow, fallback ke daftar
        // publikasi terbaru (perilaku lama).
        if (normalized.length === 0) {
          res = await api.get("/projects", {
            params: { status: "published", limit: FETCH_LIMIT },
          });
          items = res.data.data.items || res.data.data || [];
          normalized = items
            .map(normalizeProject)
            .filter((p) => p.title && p.slug);
        }
        if (cancelled) return;
        setProjects(normalized.length ? normalized : FALLBACK_PROJECTS);
      } catch {
        if (cancelled) return;
        setProjects(FALLBACK_PROJECTS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchSlides();
    return () => {
      cancelled = true;
    };
  }, []);

  // Daftar slide carousel: utamakan karya yang ditandai "Slideshow Beranda"
  // oleh admin. Kalau belum ada penanda sama sekali, fallback ke daftar lama
  // (maks 6, tiap kategori tampil minimal satu kali).
  const slides = useMemo(() => {
    const flagged = projects.filter((p) => p.isShownInSlideshow);
    if (flagged.length > 0) return flagged.slice(0, MAX_SLIDES);

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

  // Autoplay santai: setiap slide tampil PENUH ±3 detik dulu (interval 4s
  // dikurangi 0.6s animasi masuk), baru berpindah. Berhenti saat hover.
  useEffect(() => {
    if (paused || count < 2) return;
    const t = setInterval(() => goTo(activeRef.current + 1), 4000);
    return () => clearInterval(t);
  }, [paused, count, goTo]);

  const openDetail = () => {
    if (!preview) return;
    navigate(`/karya/${preview.categorySlug}/${preview.slug || preview.id}`);
  };

  // Tiga badge hologram mengambang — data & nilai selalu sinkron dengan slide
  // aktif. Posisi: kategori (kiri-atas), status (kanan-atas), update
  // (kanan-bawah). Kiri-bawah TIDAK dipakai karena sudah ada judul karya di
  // dalam kartu. `anim` = fasa animasi naik-turun; `delay` = tunda mulai agar
  // gerakannya berirama (parallax), bukan serempak.
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

  // Posisi badge dikelola via CSS plain (bukan class Tailwind) agar mudah
  // diresponsif: di desktop/tablet badge melayang DI LUAR sudut kartu, di
  // mobile (≤640px) badge MASUK KE DALAM thumbnail (menghindari korup).
  // `anim` juga memakai class CSS plain .karta-float-* — selalu dihasilkan,
  // tidak bergantung scanner Tailwind, jadi animasi PASTI berjalan.

  // Peta gaya per theme (dark/light) — GAYA ASLI TIAP TEMA, bukan salinan.
  // LIGHT: kaca putih + teks/aksen biru tua (theme light), tetap kontras
  // terhadap halaman terang. DARK: kaca navy + cyan. Gaya badge hologram
  // diatur penuh di CSS agar konsisten.
  const cls = {
    blobA: isLight ? "bg-gradient-to-br from-blue-400/30 to-cyan-300/20" : "bg-gradient-to-br from-cyan-500/50 to-blue-600/40",
    blobB: isLight ? "bg-gradient-to-tr from-sky-300/30 to-blue-400/20" : "bg-gradient-to-tr from-blue-600/40 to-cyan-500/30",
    skeleton: isLight ? "bg-blue-100/60" : "bg-slate-800/40",
    // Overlay bottom sengaja pekat (navy solid di dasar) agar JUDUL PUTIH
    // murni terbaca di atas thumbnail terang — bukan abu-abu.
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
    dotActive: "bg-blue-600",
    // Light: titik non-aktif putih lembut (tidak putih pekat) + border tipis
    // supaya tetap kelihatan di atas latar paper (#f3f5f8). Dark: tetap abu.
    dotIdle: isLight
      ? "bg-white/80 border border-slate-500"
      : "bg-[#6B7280]",
  };

  return (
    <div
      className="hero-karya-showcase group relative w-full max-w-[640px] mx-auto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Ambient glow nebula — murni dekoratif, di belakang tumpukan kartu. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -top-14 right-0 z-0 h-56 w-56 animate-karta-pulse rounded-full blur-[90px] opacity-60 md:h-72 md:w-72 ${cls.blobA}`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -bottom-12 -left-14 z-0 h-64 w-64 animate-karta-pulse-slow rounded-full blur-[100px] md:h-80 md:w-80 ${cls.blobB}`}
      />

      <div className="relative z-20">
        {/* Ruang 3D HANYA untuk tumpukan kartu (rear + main). Badge hologram
            & tombol navigasi dibiarkan FLAT (di luar perspektif) agar teks
            kecil di dalamnya tidak dilukis ulang oleh rasterizer 3D → tajam/HD. */}
        <div className="relative z-0">
                  {/* LAYER 1 — MAIN CARD, centered di depan. */}
        <div className="group/img relative z-10 transition-transform duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.02]">
          {loading || !preview ? (
            <div className="showcase-card relative overflow-hidden rounded-2xl" style={CARD_HEIGHT_STYLE}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-6 w-24 animate-pulse rounded-md bg-white/10" />
              </div>
            </div>
          ) : (
            <div
              key={`${active}-${slideDir}`}
              className={slideDir > 0 ? "animate-karta-slide-in-right" : "animate-karta-slide-in-left"}
            >
              <div className="showcase-card relative overflow-hidden rounded-2xl" style={CARD_HEIGHT_STYLE}>
                <SmartImage
                  src={imageUrl(preview.thumbnail)}
                  srcSet={buildSrcSet(preview.thumbnail)}
                  sizes="(min-width: 768px) 640px, 92vw"
                  alt={preview.title}
                  eager
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                />
                {/* Overlay gradasi gelap agar teks selalu terbaca. */}
                <div className={`pointer-events-none absolute inset-0 ${cls.imgOverlay}`} />
                {/* Refleksi kaca tipis — kilau diagonal. */}
                <div aria-hidden="true" className="showcase-glass pointer-events-none absolute inset-0" />
                {/* Klik seluruh kartu → detail. */}
                <button
                  type="button"
                  onClick={openDetail}
                  aria-label={`Buka detail ${preview.title}`}
                  className="absolute inset-0 z-10 cursor-pointer"
                />
                {/* Judul — area aman di kiri-bawah, tidak bertabrakan badge. */}
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
                    {preview.title}
                  </h3>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
        {/* End ruang perspektif 3D kartu — badge & navigasi FLAT setelah ini. */}

        {/* TIGA BADGE HOLOGRAM — melayang di sudut kiri-atas, kanan-atas &
            kanan-bawah kartu utama (DI LUAR tepi kartu). Kiri-bawah kosong
            karena diisi judul karya di dalam kartu. Lapis: aura + kaca
            angular + ikon + teks, semua beranimasi NAIT-TURUN terus. */}
        {preview && !loading && (
          <div className="pointer-events-none absolute inset-0 z-30">
            {badges.map((b) => {
              const Icon = b.icon;
              return (
                <div
                      key={b.key}
                      className={`karta-bpos karta-bpos-${b.pos}`}
                    >
                      {/* Lapis animasi melayang naik-turun (class CSS plain,
                          bukan Tailwind — PASTI berjalan), fasa berbeda tiap
                          badge via delay inline. */}
                      <div
                        className={`karta-float karta-float-${b.anim}`}
                        style={{ animationDelay: b.delay }}
                      >
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

        {/* NAVIGASI — dua tombol bulat simetris di tepi kanan-kiri MAIN CARD. */}
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
      </div>

      {/* PAGINATION — jarak seimbang: nggak mepet ke kartu, nggak jauh dari CTA. */}
      {count > 1 && (
        <div className="mt-4 flex items-center justify-center sm:mt-8">
          <div className="flex items-center gap-2 sm:gap-2.5">
            {slides.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Karya ${i + 1}`}
                className={`h-2 cursor-pointer rounded-full transition-all duration-300 sm:h-2.5 ${
                  i === active ? `w-6 sm:w-7 ${cls.dotActive}` : `w-2 sm:w-2.5 ${cls.dotIdle}`
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default HeroKaryaShowcase;