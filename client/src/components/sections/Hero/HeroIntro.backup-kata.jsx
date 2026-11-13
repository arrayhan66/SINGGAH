import { useId } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, Compass, LayoutGrid } from "lucide-react";

// Cara mengisi gambar:
// 1. Letakkan file di src/assets/images/intro/.
// 2. Tambahkan impor di atas, misalnya:
//    import fotoKartu1 from "../../../assets/images/intro/kartu1.jpg";
// 3. Isi src pada objek di bawah dengan variabel impor tersebut.
// Rasio disarankan: kartu 1 portrait 3:4 (minimal 900x1200),
// kartu 2 landscape 16:10 (minimal 1200x750).
const INTRO_IMG = {
  kartu1: { src: "", alt: "Karya mahasiswa Politeknik Negeri Banjarmasin" },
  kartu2: {
    src: "",
    alt: "Kegiatan dan proyek mahasiswa Politeknik Negeri Banjarmasin",
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
      className="px-3 pb-16 pt-14 min-[350px]:px-5 md:px-8 lg:px-10 lg:pb-24 lg:pt-20 xl:px-12 2xl:px-16"
    >
      <div className="mx-auto w-full max-w-[1700px]">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_0.8fr_1.1fr] lg:items-start lg:gap-8">
          <div>
            <span
              className="inline-flex h-7 items-center rounded-full border border-slate-200 bg-slate-100 px-3 text-[13px] font-medium"
              style={{ color: "#334155" }}
            >
              Karya Poliban
            </span>

            <h2
              id={id}
              className="mt-5"
              style={{
                fontSize: "clamp(32px, 3.6vw, 56px)",
                color: "#0f172a",
                textWrap: "balance",
              }}
            >
              Kami punya sesuatu untuk ditunjukkan
            </h2>

            <p
              className="mt-5 max-w-[440px] text-base"
              style={{ lineHeight: 1.65, color: "#475569" }}
            >
              Karya-karya dari kampus Politeknik Negeri Banjarmasin yang bisa
              kamu lihat langsung di sini.
            </p>

            <div className="mt-8 flex items-center gap-[10px]">
              <button
                type="button"
                onClick={handleStartExploration}
                className="inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-6 text-[15px] font-medium transition-colors hover:bg-blue-700 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                style={{ color: "#ffffff" }}
              >
                Mulai Eksplorasi
              </button>

              <a
                href="#panduan"
                aria-label="Baca panduan"
                title="Baca panduan"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <ArrowUpRight
                  size={18}
                  aria-hidden="true"
                  style={{ color: "#ffffff" }}
                />
              </a>
            </div>
          </div>

          <Link
            to="/karya"
            className="group relative block overflow-hidden rounded-[28px] bg-slate-900 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-blue-600"
            style={{
              aspectRatio: "3 / 4",
              minHeight: "380px",
              boxShadow: "0 24px 48px -24px rgba(15,23,42,0.35)",
            }}
          >
            <IntroImg item={INTRO_IMG.kartu1} Icon={LayoutGrid} />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.65) 100%)",
              }}
            />

            <div className="absolute left-4 top-4 flex items-center gap-2">
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
                Karya Mahasiswa
              </span>
            </div>

            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3">
              <p
                className="max-w-[220px] text-[17px] font-medium"
                style={{ lineHeight: 1.35, color: "#ffffff" }}
              >
                Lihat karya terbaru dari mahasiswa Poliban.
              </p>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
                <ArrowUpRight
                  size={18}
                  aria-hidden="true"
                  style={{ color: "#0f172a" }}
                />
              </span>
            </div>
          </Link>

          <div>
            <Link
              to="/akademik/tur-virtual"
              className="group relative block overflow-hidden rounded-[28px] bg-slate-900 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-blue-600"
              style={{
                aspectRatio: "16 / 10",
                boxShadow: "0 24px 48px -24px rgba(15,23,42,0.35)",
              }}
            >
              <IntroImg item={INTRO_IMG.kartu2} Icon={Compass} />

              <div className="absolute left-4 top-4 flex items-center gap-2">
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
                  Tur Virtual
                </span>
              </div>
            </Link>

            <p
              className="mt-5 max-w-[460px] text-[15px]"
              style={{ lineHeight: 1.65, color: "#64748b" }}
            >
              Telusuri laboratorium, ruang kelas, dan bengkel kampus lewat foto
              360 derajat, dari mana saja.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroIntro;
