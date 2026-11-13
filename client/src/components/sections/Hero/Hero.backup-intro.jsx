import { useNavigate } from "react-router-dom";
import HeroStats from "./HeroStats";
import HeroKaryaShowcase from "./HeroKaryaShowcase";
import HeroRays from "./HeroRays";
import bandLight from "../../../assets/images/hero/hero-band-light.webp";

function Hero() {
  const navigate = useNavigate();

  // Flag freshHall dipakai scene hall untuk mengembalikan pemain ke titik awal
  // (hologram). Sengaja lewat state navigasi, bukan pustaka three, supaya
  // bundle Beranda tetap ringan.
  const handleStartExploration = () => {
    navigate("/hall", { state: { freshHall: true } });
  };

  return (
    <section id="hero" className="relative overflow-hidden">
      {/* Blok atas: latar bersih + sinar, berakhir sebelum pita */}
      <div className="hero-top relative">
        {/* Sinar garis dari titik tengah bawah blok atas (tepi atas deretan karya) */}
        <HeroRays />
        {/* Blok atas: konten teks + tombol dalam wadah ber-padding */}
        <div className="relative z-[1] mx-auto flex w-full max-w-[1700px] flex-col px-5 md:px-8 lg:px-10 xl:px-12 2xl:px-16 pt-[calc(var(--navbar-h)+28px)] sm:pt-[calc(var(--navbar-h)+32px)] md:pt-[calc(var(--navbar-h)+48px)] pb-[35px] md:pb-[72px]">
          <div className="hero-rays-block relative w-full">
            {/* Konten hero: judul, paragraf, tombol */}
            <div className="relative z-[1] flex w-full flex-col items-center text-center">
              <h1
                className="mt-0 text-white"
                style={{
                  fontFamily: "var(--font-headline)",
                  fontSize: "clamp(1.645rem, 5vw, 3.055rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.015em",
                  lineHeight: 1.05,
                }}
              >
                Kami punya sesuatu
                <br />
                untuk <span style={{ color: "var(--hero-accent)" }}>ditunjukkan</span>
              </h1>

              <div className="mt-3 flex flex-col items-center gap-3 md:mt-5">
                <p
                  className="mx-auto max-w-[36rem] text-center text-[17px] leading-[1.6] md:text-[18px]"
                  style={{ color: "var(--hero-desc)" }}
                >
                  Karya-karya dari kampus Politeknik Negeri Banjarmasin yang bisa kamu
                  lihat langsung di sini.
                </p>
              </div>

              <div className="relative z-[60] mt-5 flex w-full flex-wrap items-center justify-center gap-3 md:mt-8 max-sm:gap-[10px]">
                <button
                  onClick={handleStartExploration}
                  className="inline-flex items-center justify-center h-12 px-6 rounded-[10px] border font-[inherit] text-[15px] lg:text-base normal-case tracking-normal whitespace-nowrap min-w-0 w-full sm:w-auto cursor-pointer transition-[background-color,border-color,box-shadow] duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)] active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-current border-[#22d3ee] bg-[#22d3ee] text-[color:#04142b] shadow-[0_6px_14px_-6px_rgba(34,211,238,0.45)] hover:border-[#06b6d4] hover:bg-[#06b6d4] hover:shadow-[0_4px_10px_-6px_rgba(34,211,238,0.45)] light:border-[#2563eb] light:bg-[#2563eb] light:text-[color:#ffffff] light:shadow-[0_6px_14px_-6px_rgba(37,99,235,0.55)] light:hover:border-[#1d4ed8] light:hover:bg-[#1d4ed8] light:hover:shadow-[0_4px_10px_-6px_rgba(37,99,235,0.55)] min-[2560px]:h-14 min-[2560px]:px-7"
                >
                  <span className="leading-none">Mulai Eksplorasi</span>
                </button>

                <a
                  href="#panduan"
                  className="inline-flex items-center justify-center h-12 px-6 rounded-[10px] border font-[inherit] text-[15px] lg:text-base normal-case tracking-normal whitespace-nowrap min-w-0 w-full sm:w-auto cursor-pointer transition-[background-color,border-color,box-shadow] duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)] active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-current border-[#d5dbe3] bg-[#f1f5f9] text-[color:#0f172a] hover:bg-[#e8edf3] shadow-[0_1px_2px_rgba(15,23,42,0.06)] min-[2560px]:h-14 min-[2560px]:px-7"
                >
                  <span className="leading-none">Baca Panduan</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* bandZone: pita biru bergambar, carousel + HeroStats, selebar layar */}
      <div className="bandZone hero-band relative w-full overflow-hidden">
        <div className="hero-band-showcase relative w-full overflow-hidden">
          <div className="relative z-10 w-full overflow-hidden">
            <HeroKaryaShowcase />
          </div>

          {/* Pita biru bergambar di belakang carousel */}
          <div
            aria-hidden="true"
            className="hero-band-bg pointer-events-none"
            style={{ backgroundImage: `url(${bandLight})` }}
          />
        </div>

        {/* HeroStats dalam wadah ber-padding */}
        <div className="relative z-10 mx-auto flex w-full max-w-[1700px] flex-col items-center justify-center px-5 md:px-8 lg:px-10 xl:px-12 2xl:px-16 mt-0 pb-12 lg:pb-[72px]">
          {/* Kalimat pengantar section stats */}
          <p
            className="mb-10 text-center whitespace-nowrap max-[479px]:whitespace-normal"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(0.95rem, 1.8vw, 1.15rem)",
              fontWeight: 400,
              lineHeight: 1.5,
              color: "#0F172A",
            }}
          >
            Lebih dari sekadar ruang untuk{" "}
            <span style={{ color: "#1D6FF2", fontWeight: 500 }}>
              memajang karya.
            </span>
          </p>
          <HeroStats />
        </div>
      </div>
    </section>
  );
}

export default Hero;
