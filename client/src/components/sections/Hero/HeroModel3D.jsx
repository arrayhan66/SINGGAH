import { lazy, Suspense, useEffect, useRef, useState } from "react";

const HeroModel3DCanvas = lazy(() => import("./HeroModel3DCanvas"));

function HeroModel3D() {
  const wrapRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    let t = null;
    const show = () => {
      t = setTimeout(() => setReady(true), 800);
    };

    if (!("IntersectionObserver" in window)) {
      show();
      return () => clearTimeout(t);
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          show();
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative h-[400px] w-full lg:h-[680px] lg:w-[520px] xl:h-[760px] xl:w-[620px] 2xl:h-[900px] 2xl:w-[860px]"
    >
      {ready && (
        <Suspense fallback={null}>
          <HeroModel3DCanvas />
        </Suspense>
      )}

      <div className="absolute bottom-16 left-1/2 h-28 w-80 -translate-x-1/2 rounded-full bg-cyan-400/25 blur-3xl" />
    </div>
  );
}

export default HeroModel3D;
