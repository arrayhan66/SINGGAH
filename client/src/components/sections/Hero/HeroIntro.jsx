import { useId } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Compass, LayoutGrid } from "lucide-react";
import karyaMahasiswa from "../../../assets/images/hero/karyaMahasiswa.jpg";
import turVirtual from "../../../assets/images/hero/tur virtual.jpg";

// Cara mengisi gambar:
// 1. Letakkan file di src/assets/images/intro/.
// 2. Tambahkan impor di atas, misalnya:
//    import fotoKartu1 from "../../../assets/images/intro/kartu1.jpg";
// 3. Isi src pada objek di bawah dengan variabel impor tersebut.
// Rasio disarankan: kartu 1 portrait 3:4 (minimal 900x1200),
// kartu 2 landscape 16:10 (minimal 1200x750).
const INTRO_IMG = {
  kartu1: {
    src: karyaMahasiswa,
    alt: "Galeri Karya",
  },
  kartu2: {
    src: turVirtual,
    alt: "Keliling Kampus",
  },
};

function IntroImg({ item, Icon }) {
  if (!item || !item.src) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center bg-blue-900"
        aria-hidden="true"
      >
        {Icon ? (
          <Icon
            size={44}
            strokeWidth={1.25}
            aria-hidden="true"
            style={{ color: "#ffffff", opacity: 0.25 }}
          />
        ) : null}
      </div>
    );
  }

  return (
    <img
      src={item.src}
      alt={item.alt}
      loading="lazy"
      decoding="async"
      draggable={false}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

function HeroIntro() {
  const id = useId();
  const navigate = useNavigate();

  const handleStartExploration = () => {
    navigate("/hall", { state: { freshHall: true } });
  };

  return (
    <section
      aria-labelledby={id}
      className="px-3 pb-2 pt-6 min-[350px]:px-5 md:px-8 lg:px-10 lg:pb-2 lg:pt-[40px] xl:px-12 2xl:px-16"
    >
      <style>
        {`
          .hi-btn {
            height: 48px;
            padding: 0 24px;
            font-size: 15px;
            font-weight: 600;
            letter-spacing: -0.01em;
            border-radius: 8px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: #0f172a;
            background: transparent;
            border: 1px solid transparent;
            box-shadow: none;
            text-decoration: none;
            transition: background-color 300ms ease, border-color 300ms ease, color 300ms ease, box-shadow 300ms ease;
          }
          .hi-btn-utama {
            background: var(--color-accent-primary);
            color: #ffffff;
            border: none;
            box-shadow: 0 4px 12px -4px rgba(37, 99, 235, 0.45);
          }
          .hi-btn-utama:hover,
          .hi-btn-utama:focus-visible {
            background: #1d4ed8;
            box-shadow: 0 6px 16px -4px rgba(29, 78, 216, 0.5);
          }
          .hi-btn-kedua {
            background: transparent;
            border: 1px solid #cbd5e1;
            color: #0f172a;
          }
          .hi-btn-kedua:hover,
          .hi-btn-kedua:focus-visible {
            background: #e2e8f0;
            border-color: #94a3b8;
            color: #0f172a;
          }
          .hi-btn:focus-visible {
            outline: 2px solid #0f172a;
            outline-offset: 3px;
          }
          .hi-card {
            -webkit-tap-highlight-color: transparent;
          }
          .hi-card img {
            transition: transform 900ms cubic-bezier(0.22, 1, 0.36, 1);
            will-change: transform;
          }
          .hi-card::after {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(to top, rgba(15, 23, 42, 0.25) 0%, transparent 60%);
            opacity: 0;
            transition: opacity 500ms cubic-bezier(0.22, 1, 0.36, 1);
            pointer-events: none;
            z-index: 2;
          }
          .hi-card:hover img,
          .hi-card:focus-visible img {
            transform: scale(1.04);
          }
          .hi-card:hover::after,
          .hi-card:focus-visible::after {
            opacity: 1;
          }
          .hi-card-label {
            transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1);
            display: inline-block;
          }
          .hi-card:hover .hi-card-label,
          .hi-card:focus-visible .hi-card-label {
            transform: translateX(4px);
          }
          .hi-card-arrow {
            transition: background-color 400ms cubic-bezier(0.22, 1, 0.36, 1), transform 400ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 400ms cubic-bezier(0.22, 1, 0.36, 1);
            will-change: transform;
          }
          .hi-card:hover .hi-card-arrow,
          .hi-card:focus-visible .hi-card-arrow {
            background-color: #0f172a;
            transform: translateY(-2px);
            box-shadow: 0 8px 18px -6px rgba(15, 23, 42, 0.5);
          }
          .hi-card-arrow-icon {
            color: #0f172a;
            transform: rotate(-45deg);
            transition: color 400ms cubic-bezier(0.22, 1, 0.36, 1), transform 500ms cubic-bezier(0.22, 1, 0.36, 1);
          }
          .hi-card:hover .hi-card-arrow-icon,
          .hi-card:focus-visible .hi-card-arrow-icon {
            color: #ffffff;
            transform: rotate(0deg);
          }
          .hi-card:focus-visible {
            outline: 2px solid #0f172a !important;
            outline-offset: 3px !important;
          }
          @media (prefers-reduced-motion: reduce) {
            .hi-card img,
            .hi-card::after,
            .hi-card-label,
            .hi-card-arrow,
            .hi-card-arrow-icon {
              transition: none !important;
              transform: none !important;
            }
          }
        `}
      </style>
      <div className="mx-auto w-full max-w-[1700px]">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_0.8fr_1.1fr] lg:items-start lg:gap-8">
          <div>
            <span
              className="inline-flex items-center"
              style={{
                backgroundColor: "#f1f5f9",
                border: "1px solid #e2e8f0",
                borderRadius: "999px",
                padding: "4px 12px",
                fontSize: "13px",
                fontWeight: 500,
                color: "#334155",
              }}
            >
              Produk Unggulan
            </span>

            <h2
              id={id}
              className="mt-5 font-headline"
              style={{
                fontSize: "clamp(32px, 3.6vw, 56px)",
                fontWeight: 500,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                color: "#0f172a",
                textWrap: "balance",
              }}
            >
              Karya yang bisa dilihat{" "}
              <span style={{ color: "var(--color-accent-primary)" }}>siapa saja</span>
            </h2>

            <p
              className="mt-5"
              style={{
                fontSize: "17px",
                fontWeight: 400,
                lineHeight: 1.6,
                color: "#64748b",
                maxWidth: "440px",
                textWrap: "pretty",
              }}
            >
              Setiap karya berawal dari satu pertanyaan kecil, lalu dikerjakan
              pelan-pelan sampai jadi. Lihat hasilnya, atau cari lewat judul dan
              tahun.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleStartExploration}
                className="hi-btn hi-btn-utama"
              >
                Mulai eksplorasi
              </button>

              <a href="#panduan" className="hi-btn hi-btn-kedua">
                Buku panduan
              </a>
            </div>
          </div>

           <Link
             to="/karya"
             className="group relative block overflow-hidden rounded-[28px] bg-slate-900 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-blue-600 hi-card"
             style={{
               aspectRatio: "3 / 4",
               minHeight: "380px",
               boxShadow: "0 24px 48px -24px rgba(15,23,42,0.35)",
             }}
           >
             <IntroImg item={INTRO_IMG.kartu1} Icon={LayoutGrid} />

             <div
               aria-hidden="true"
               className="pointer-events-none absolute inset-0 z-[1]"
               style={{
                 background:
                   "linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.65) 100%)",
               }}
             />

             <div className="absolute left-4 top-4 flex items-center gap-2 z-10">
               <span
                 className="flex h-7 w-7 items-center justify-center rounded-lg text-[12px] font-medium"
                 style={{
                   backgroundColor: "rgba(0,0,0,0.5)",
                   color: "#ffffff",
                 }}
               >
                 01
               </span>
               <span
                 className="inline-flex h-7 items-center rounded-full px-3 text-[12px] font-medium"
                 style={{
                   backgroundColor: "rgba(0,0,0,0.38)",
                   border: "1px solid rgba(255,255,255,0.3)",
                   color: "#ffffff",
                 }}
               >
                 Galeri Karya
               </span>
             </div>

             <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3 z-10">
               <p
                 className="max-w-[220px] text-[17px] font-medium hi-card-label"
                 style={{ lineHeight: 1.35, color: "#ffffff" }}
               >
                 Lihat Semua Karya
               </p>
               <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white hi-card-arrow">
                 <ArrowRight
                   size={18}
                   aria-hidden="true"
                   className="hi-card-arrow-icon"
                 />
               </span>
             </div>
           </Link>

           <div>
             <Link
               to="/akademik/tur-virtual"
               className="group relative block overflow-hidden rounded-[28px] bg-slate-900 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-blue-600 hi-card"
               style={{
                 aspectRatio: "16 / 10",
                 boxShadow: "0 24px 48px -24px rgba(15,23,42,0.35)",
               }}
             >
               <IntroImg item={INTRO_IMG.kartu2} Icon={Compass} />

               <div className="absolute left-4 top-4 flex items-center gap-2 z-10">
                 <span
                   className="flex h-7 w-7 items-center justify-center rounded-lg text-[12px] font-medium"
                   style={{
                     backgroundColor: "rgba(0,0,0,0.5)",
                     color: "#ffffff",
                   }}
                 >
                   02
                 </span>
                 <span
                   className="inline-flex h-7 items-center rounded-full px-3 text-[12px] font-medium"
                   style={{
                     backgroundColor: "rgba(0,0,0,0.38)",
                     border: "1px solid rgba(255,255,255,0.3)",
                     color: "#ffffff",
                   }}
                 >
                   Keliling Kampus
                 </span>
               </div>

               <div
                 aria-hidden="true"
                 className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] z-[1]"
                 style={{
                   background:
                     "linear-gradient(to top, rgba(15,23,42,0.55) 0%, transparent 100%)",
                 }}
               />

               <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3 z-10">
                 <p
                   className="max-w-[220px] text-[17px] font-medium hi-card-label"
                   style={{ lineHeight: 1.35, color: "#ffffff" }}
                 >
                   Jelajahi Ruangan
                 </p>
                 <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white hi-card-arrow">
                   <ArrowRight
                     size={18}
                     aria-hidden="true"
                     className="hi-card-arrow-icon"
                   />
                 </span>
               </div>
             </Link>

             <p
                className="mt-5 max-w-[560px] text-[15px]"
                style={{ lineHeight: 1.65, color: "#64748b" }}
              >
                Bawa suasana kampus ke layar Anda, jelajahi tiap ruangan lewat tur virtual kapan saja dan dari mana saja, tanpa harus datang langsung
             </p>
           </div>
        </div>
      </div>
    </section>
  );
}

export default HeroIntro;
