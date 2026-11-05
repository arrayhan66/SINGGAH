import { useNavigate } from "react-router-dom";
import heroRaysLight from "../../../assets/images/hero/hero-rays-light.webp";
import bandLight from "../../../assets/images/hero/hero-band-light.webp";
import HeroStats from "./HeroStats";
import HeroKaryaShowcase from "./HeroKaryaShowcase";

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
        {/* Blok atas: konten teks + tombol dalam wadah ber-padding */}
        <div className="relative mx-auto flex w-full max-w-[1700px] flex-col px-5 md:px-8 lg:px-10 xl:px-12 2xl:px-16 pt-[calc(var(--navbar-h)+16px)] sm:pt-[calc(var(--navbar-h)+20px)] lg:pt-[calc(var(--navbar-h)+32px)] pb-8 sm:pb-10">
          <div className="hero-rays-block relative w-full">
            {/* Sinar radial di belakang judul dan tombol */}
            <div
              aria-hidden="true"
              className="hero-rays pointer-events-none absolute z-0"
            >
              <img
                src={heroRaysLight}
                alt=""
                aria-hidden="true"
                className="hero-rays-img pointer-events-none absolute inset-0 h-full w-full object-cover object-[center_bottom]"
              />
            </div>
            {/* Konten hero: judul, paragraf, tombol */}
            <div className="relative z-[1] flex w-full flex-col items-center text-center">
              <h1
                className="mt-0 leading-tight text-white"
                style={{
                  fontFamily: "'Unbounded', sans-serif",
                  fontSize: "clamp(1.75rem, 5vw, 3.25rem)",
                  fontWeight: 900,
                }}
              >
                Dari Lab Elektro,
                <br />
                Jadi <span className="text-cyan-300">Karya Nyata</span>
              </h1>

              <div className="mt-3 flex flex-col items-center gap-3">
                <p className="text-xs min-[350px]:text-sm md:text-base lg:text-lg 2xl:text-xl leading-relaxed text-slate-300 max-w-xl md:max-w-2xl lg:max-w-4xl 2xl:max-w-5xl">
                  Ini ruang pameran karya Teknik Elektro Politeknik Negeri Banjarmasin.
                  Isinya proyek mahasiswa dan dosen, dari yang berawal sebagai tugas kuliah
                  sampai yang sudah dipakai di lapangan.
                </p>
              </div>

              <div className="relative z-[60] mt-4 flex w-full flex-wrap items-center justify-center gap-3 sm:mt-6 max-sm:gap-[10px]">
                <button
                  onClick={handleStartExploration}
                  className="inline-flex items-center justify-center h-12 px-6 rounded-[10px] border font-[inherit] text-[15px] lg:text-base normal-case tracking-normal whitespace-nowrap min-w-0 w-full sm:w-auto cursor-pointer transition-[background-color,border-color,box-shadow,transform] duration-150 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-current border-[#22d3ee] bg-[#22d3ee] text-[color:#04142b] shadow-[0_6px_14px_-6px_rgba(34,211,238,0.45)] hover:border-[#06b6d4] hover:bg-[#06b6d4] hover:shadow-[0_4px_10px_-6px_rgba(34,211,238,0.45)] light:border-[#2563eb] light:bg-[#2563eb] light:text-[color:#ffffff] light:shadow-[0_6px_14px_-6px_rgba(37,99,235,0.55)] light:hover:border-[#1d4ed8] light:hover:bg-[#1d4ed8] light:hover:shadow-[0_4px_10px_-6px_rgba(37,99,235,0.55)] min-[2560px]:h-14 min-[2560px]:px-7"
                >
                  <span className="leading-none">Lihat Karya</span>
                </button>

                <a
                  href="#panduan"
                  className="inline-flex items-center justify-center h-12 px-6 rounded-[10px] border font-[inherit] text-[15px] lg:text-base normal-case tracking-normal whitespace-nowrap min-w-0 w-full sm:w-auto cursor-pointer transition-[background-color,border-color,box-shadow,transform] duration-150 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-current border-white/[0.18] bg-white/[0.06] text-[color:#e2e8f0] hover:border-white/[0.3] hover:bg-white/[0.1] light:border-[#d5dbe3] light:bg-[#f1f5f9] light:text-[color:#0f172a] light:shadow-[0_1px_2px_rgba(15,23,42,0.06)] light:hover:border-[#bcc5d1] light:hover:bg-[#e8edf3] min-[2560px]:h-14 min-[2560px]:px-7"
                >
                  <span className="leading-none">Baca Panduan</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* bandZone: pita biru bergambar, carousel + HeroStats, selebar layar */}
      <div className="bandZone hero-band relative w-full">
        <div className="hero-band-showcase relative w-full overflow-hidden">
          <div className="relative z-10 w-full overflow-hidden">
            <HeroKaryaShowcase />
          </div>

          {/* Lapisan gambar pita biru di belakang carousel */}
          <div
            aria-hidden="true"
            className="hero-band-bg pointer-events-none"
            style={{ backgroundImage: `url(${bandLight})` }}
          />
        </div>

        {/* HeroStats dalam wadah ber-padding */}
        <div className="relative z-10 mx-auto flex w-full max-w-[1700px] flex-col items-center justify-center px-5 md:px-8 lg:px-10 xl:px-12 2xl:px-16 mt-10 lg:mt-14 pb-6 lg:pb-12">
          {/* Kalimat pengantar section stats */}
          <p
            className="mb-10 text-center whitespace-nowrap max-[479px]:whitespace-normal"
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "clamp(0.95rem, 1.8vw, 1.15rem)",
              fontWeight: 400,
              lineHeight: 1.5,
              color: "#0F172A",
            }}
          >
            Sedikit angka biar kelihatan{" "}
            <span style={{ color: "#1D6FF2", fontWeight: 500 }}>
              seberapa ramai ruang pameran ini.
            </span>
          </p>
          <HeroStats />
        </div>
      </div>
    </section>
  );
}

export default Hero;
