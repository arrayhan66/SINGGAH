import { lazy, Suspense } from "react";
import HeroStats from "./HeroStats";
import HeroRays from "./HeroRays";
import HeroIntro from "./HeroIntro";
import KategoriPopuler from "../KategoriPopuler";
import PenelitianPkmPanel from "../PenelitianPkmPanel";
import Bulletin from "../../Bulletin";
const DosenCarousel = lazy(() => import("../DosenCarousel"));
const FaqSection = lazy(() => import("../FaqSection"));

function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden">
      {/* Blok atas: latar bersih + sinar */}
      <div
        className="hero-top relative"
        style={{ borderBottom: "1px solid #e2e8f0" }}
      >
        {/* Sinar garis dari titik tengah bawah blok atas */}
        <HeroRays />
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "50%",
            bottom: -4,
            width: 7,
            height: 7,
            marginLeft: -3.5,
            borderRadius: "50%",
            background: "#94a3b8",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />
        {/* Blok atas: konten teks + tombol dalam wadah ber-padding */}
        <div className="relative z-[1] mx-auto flex w-full max-w-[1700px] flex-col px-5 md:px-8 lg:px-10 xl:px-12 2xl:px-16 pt-12 pb-10">
          <div
            className="hero-rays-block relative w-full"
            style={{ paddingBottom: 0 }}
          >
            <HeroIntro />
          </div>
        </div>
        <div className="px-3 min-[350px]:px-5 md:px-8 lg:px-10 xl:px-12 2xl:px-16 mt-[6px] lg:mt-[22px]">
          <div className="mx-auto w-full max-w-[1700px]">
            <KategoriPopuler />
          </div>
        </div>
      </div>

      {/* bandZone: HeroStats, selebar layar */}
      <div className="bandZone hero-band relative w-full overflow-hidden">
        {/* HeroStats dalam wadah ber-padding */}
        <div className="relative z-10 mx-auto flex w-full max-w-[1700px] flex-col items-center justify-center px-5 md:px-8 lg:px-10 xl:px-12 2xl:px-16 pt-12 pb-10 lg:pb-14">
          {/* Kalimat pengantar section stats */}
          <p
            className="mx-auto mb-14 max-w-[720px] text-center"
            style={{
              fontFamily: "var(--font-headline)",
              fontSize: "clamp(28px, 4.2vw, 52px)",
              fontWeight: 500,
              lineHeight: 1.12,
              letterSpacing: "-0.02em",
              color: "#0F172A",
              textWrap: "balance",
            }}
          >
            Lebih dari sekadar ruang untuk <span style={{ color: "var(--color-accent-primary)" }}>memajang karya</span>
          </p>
          <HeroStats />
        </div>
      </div>

      <PenelitianPkmPanel />
      <Bulletin />
      <Suspense fallback={null}>
        <DosenCarousel />
        <FaqSection />
      </Suspense>
    </section>
  );
}

export default Hero;
