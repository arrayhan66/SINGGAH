import HeroStats from "./HeroStats";
import HeroKaryaShowcase from "./HeroKaryaShowcase";
import HeroRays from "./HeroRays";
import HeroIntro from "./HeroIntro";
import bandLight from "../../../assets/images/hero/hero-band-light.webp";

function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden">
      {/* Blok atas: latar bersih + sinar, berakhir sebelum pita */}
      <div className="hero-top relative">
        {/* Sinar garis dari titik tengah bawah blok atas (tepi atas deretan karya) */}
        <HeroRays />
        {/* Blok atas: konten teks + tombol dalam wadah ber-padding */}
        <div className="relative z-[1] mx-auto flex w-full max-w-[1700px] flex-col px-5 md:px-8 lg:px-10 xl:px-12 2xl:px-16 pt-0 pb-[35px] md:pb-[72px]">
          <div className="hero-rays-block relative w-full">
            <HeroIntro />
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
