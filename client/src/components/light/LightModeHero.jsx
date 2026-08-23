// LIGHT MODE - versi pembanding skripsi, terpisah dari dark mode
import { ArrowRight, ChevronDown } from "lucide-react";
import { Suspense, lazy, useState } from "react";
import logoPoliban from "../../assets/icons/Logo_Poliban.png";
import { useNavigate } from "react-router-dom";
import LightModeHeroStats from "./LightModeHeroStats";

const HeroModel3D = lazy(() => import("../../components/sections/Hero/HeroModel3D"));
const HERO_MODEL_BOX =
  "h-[400px] w-full lg:h-[680px] lg:w-[520px] xl:h-[760px] xl:w-[620px] 2xl:h-[900px] 2xl:w-[860px]";

const faq = [
  {
    question: <>Apa itu SINGGAH?</>,
    answer: (
      <>
        SINGGAH adalah panggung digital tempat civitas akademika Politeknik
        Negeri Banjarmasin, Teknik Elektro memamerkan karya terbaiknya di bidang
        teknologi — mulai dari website, mobile app, IoT, sampai artificial
        intelligence. Semuanya dikemas dalam exhibition hall virtual yang bisa
        dijelajahi layaknya pameran sungguhan, tapi dari layar kamu sendiri.
      </>
    ),
  },
  {
    question: "Bagaimana cara mengikuti pameran ini?",
    answer:
      "Gampang! Cukup daftar dan unggah project kamu lewat halaman registrasi. Tim kami akan meninjau karyamu sebentar, lalu project langsung tayang di Virtual Hall dan siap dilihat pengunjung dari mana saja.",
  },
  {
    question: "Apakah masyarakat umum bisa melihat project yang dipamerkan?",
    answer:
      "Bisa banget. Semua project yang sudah tayang terbuka untuk siapa saja — mahasiswa, dosen, atau masyarakat umum — tanpa perlu login atau daftar akun dulu.",
  },
  {
    question: "Apakah project yang dipamerkan bisa diunduh?",
    answer:
      "Tergantung pemiliknya. Beberapa project menyediakan source code atau dokumentasi lengkap untuk diunduh, sementara yang lain hanya menampilkan demo atau preview saja.",
  },
];

function LightModeHero() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-paper text-navy-ink overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* HERO SECTION */}
      <section
        id="hero"
        className="relative min-h-[100dvh] overflow-hidden bg-paper"
      >
        {/* Soft light decorative background pattern */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#2E6FF2 0.75px, transparent 0.75px)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-[1700px] flex-col lg:flex-row items-center justify-between px-5 md:px-8 lg:px-10 xl:px-12 2xl:px-16 pt-[calc(var(--navbar-h,80px)+24px)] pb-12">
          <div className="flex w-full flex-col items-center text-center md:max-w-2xl md:mx-auto lg:max-w-xl 2xl:max-w-2xl lg:mx-0 lg:items-start lg:text-left lg:-mt-20">
            <div className="inline-flex items-center gap-2 min-[350px]:gap-3 rounded-full border border-blue-300 bg-white px-3 min-[350px]:px-4 py-2 shadow-sm backdrop-blur-md">
              <img
                src={logoPoliban}
                alt="Logo Poliban"
                className="h-4 w-4 min-[350px]:h-5 min-[350px]:w-5 md:h-6 md:w-6 2xl:h-8 2xl:w-8 object-contain"
              />
              <span className="text-[10px] min-[350px]:text-xs md:text-sm 2xl:text-lg font-medium text-blue-700">
                Politeknik Negeri Banjarmasin
              </span>
            </div>

            <h1 className="mt-4 text-3xl min-[350px]:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl font-black leading-tight text-neutral-900">
              SINGGAH
              <br />
              SEJENAK <span className="text-blue-600">DISINI</span>
            </h1>

            <div className="mt-5 flex flex-col md:flex-row items-center lg:items-start gap-3">
              <div className="hidden lg:block mt-2 h-13 w-[3px] shrink-0 rounded-full bg-gradient-to-b from-blue-600 to-cyan-400" />
              <p className="text-xs min-[350px]:text-sm md:text-base lg:text-lg 2xl:text-xl leading-relaxed text-gray-500 max-w-md md:max-w-xl 2xl:max-w-2xl">
                Sebuah Karya Ciptaan Civitas Akademika{" "}
                <span className="font-semibold text-blue-600">
                  #ElektroPoliban
                </span>{" "}
                tertarik untuk kolaborasi riset?
              </p>
            </div>

            <div className="hidden lg:block mt-10 w-full">
              <button
                onClick={() => navigate("/hall")}
                className="group relative w-full cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-12 py-6 2xl:px-14 2xl:py-7 font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-500 hover:bg-[position:100%_0] hover:shadow-blue-400/40"
              >
                <span className="relative flex items-center justify-between gap-4">
                  <span className="text-lg tracking-wide">Mulai Eksplorasi</span>
                  <ArrowRight
                    size={22}
                    className="transition-transform duration-300 group-hover:translate-x-2"
                  />
                </span>
              </button>
            </div>

            <div className="hidden lg:block mt-10 w-full">
              <LightModeHeroStats />
            </div>
          </div>

          <div className="mt-8 flex w-full lg:w-[45%] xl:w-1/2 items-center justify-center shrink-0 lg:-mt-20">
            <div className="w-full max-w-xs md:max-w-lg lg:max-w-full">
              <Suspense fallback={<div className={HERO_MODEL_BOX} aria-hidden="true" />}>
                <HeroModel3D />
              </Suspense>
            </div>
          </div>

          <div className="mt-8 flex w-full max-w-lg md:max-w-2xl flex-col items-center gap-8 lg:hidden">
            <div className="w-full max-w-sm md:max-w-md">
              <button
                onClick={() => navigate("/hall")}
                className="group relative w-full cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-6 py-4 font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-500 hover:bg-[position:100%_0] hover:shadow-blue-400/40"
              >
                <span className="relative flex items-center justify-between gap-4">
                  <span className="text-base tracking-wide">
                    Mulai Eksplorasi
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 group-hover:translate-x-1">
                    <ArrowRight size={18} />
                  </span>
                </span>
              </button>
            </div>

            <div className="w-full">
              <LightModeHeroStats variant="mobile" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section
        id="faq"
        className="relative overflow-hidden bg-paper pt-6 pb-10 sm:pt-16 sm:pb-16 md:pt-20 md:pb-20 lg:pb-24 3xl:pt-24 3xl:pb-28 4xl:pt-28 4xl:pb-32 border-t border-paper-border"
      >
        <div className="mx-auto max-w-4xl px-4 sm:max-w-5xl sm:px-5 md:px-8 lg:max-w-6xl xl:max-w-6xl 3xl:max-w-7xl 3xl:px-12 4xl:max-w-[1400px] 4xl:px-16">
          <h2 className="text-center text-xl font-black text-navy-ink sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl 3xl:text-5xl 4xl:text-6xl">
            Pertanyaan yang <span className="text-blue-600">Sering Diajukan</span>
          </h2>

          <div className="mt-8 space-y-4 sm:mt-10 sm:space-y-5 md:space-y-6 lg:mt-12 lg:space-y-7 3xl:mt-16 3xl:space-y-8 4xl:mt-20 4xl:space-y-10">
            {faq.map((item, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  key={index}
                  className="rounded-xl border border-paper-border bg-white shadow-sm transition hover:border-blue-300 sm:rounded-2xl"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="flex w-full cursor-pointer items-center justify-between gap-3 p-3.5 text-left sm:p-5 md:p-6 lg:p-7 xl:p-8 3xl:p-9 4xl:p-10"
                  >
                    <span className="text-sm font-semibold text-navy-ink sm:text-base md:text-lg lg:text-lg xl:text-xl 3xl:text-2xl 4xl:text-3xl">
                      {item.question}
                    </span>

                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-blue-600 transition-transform duration-300 sm:size-5 md:size-[22px] lg:size-6 3xl:size-7 4xl:size-8 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-3.5 pb-3.5 text-justify text-sm leading-6 text-gray-500 sm:px-5 sm:pb-5 sm:text-sm sm:leading-7 md:px-6 md:pb-6 md:text-base lg:text-base lg:leading-8 3xl:px-8 3xl:pb-8 3xl:text-lg 3xl:leading-9 4xl:text-xl 4xl:leading-10">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export default LightModeHero;
