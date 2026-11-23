import { useEffect, useRef } from "react"

const KECEPATAN = 60
const MIN_SEL_PER_SET = 8

const modul = import.meta.glob("../../../assets/images/mitra/*.{png,svg,webp,jpg,jpeg}", {
  eager: true,
  import: "default",
})

const MITRA = Object.entries(modul)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, src]) => ({
    src,
    nama: path
      .split("/")
      .pop()
      .replace(/\.[^.]+$/, "")
      .replace(/[-_]+/g, " ")
      .trim(),
  }))

const ULANG = Math.max(1, Math.ceil(MIN_SEL_PER_SET / Math.max(MITRA.length, 1)))
const SATU_SET = Array.from({ length: ULANG }).flatMap((_, r) =>
  MITRA.map((m, i) => ({ ...m, kunci: r + "-" + i })),
)

const CSS = `
.mitra-band{container-type:inline-size;position:relative;overflow:hidden;width:100%;border-top:1px solid #e2e8f0 !important;border-bottom:1px solid #e2e8f0 !important;border-left:0 !important;border-right:0 !important;border-radius:0 !important;background-color:#ffffff !important;--n:7}
@media (max-width:1023px){.mitra-band{--n:5}}
@media (max-width:639px){.mitra-band{--n:3}}
.mitra-track{display:flex;align-items:flex-start;width:max-content;will-change:transform}
.mitra-set{display:flex;align-items:flex-start;flex:0 0 auto}
.mitra-sel{position:relative;flex:0 0 auto;box-sizing:border-box;width:calc(100cqw / var(--n));aspect-ratio:1 / 1;border-right:1px solid #e2e8f0 !important;border-radius:0 !important;background-color:#ffffff !important;background-image:none !important;transition:background-color 200ms ease}
.mitra-logo{position:absolute;inset:0;margin:auto;width:44%;height:30%;object-fit:contain;filter:grayscale(1) !important;opacity:.7 !important;mix-blend-mode:multiply !important;transition:opacity 200ms ease,filter 200ms ease}
@media (hover:hover){
.mitra-sel:hover{background-color:#f8fafc !important}
.mitra-sel:hover .mitra-logo{filter:none !important;opacity:1 !important}
}
`

function Strip() {
  const bandRef = useRef(null)
  const trackRef = useRef(null)
  const setRef = useRef(null)
  const berhenti = useRef(false)

  useEffect(() => {
    const band = bandRef.current
    const track = trackRef.current
    const satu = setRef.current
    if (!band || !track || !satu) return

    let raf = 0
    let last = 0
    let x = 0
    let lebarSet = 0
    let tampil = !document.hidden
    let dalamLayar = true
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    let reduced = motionQuery.matches

    const ukur = () => {
      lebarSet = satu.getBoundingClientRect().width
    }

    const langkah = (t) => {
      if (last === 0) last = t
      const dt = Math.min((t - last) / 1000, 0.1)
      last = t
      if (!berhenti.current && lebarSet > 0) {
        x -= KECEPATAN * dt
        if (x <= -lebarSet) x += lebarSet
        track.style.transform = "translate3d(" + x + "px,0,0)"
      }
      raf = requestAnimationFrame(langkah)
    }

    const mulai = () => {
      if (raf) return
      last = 0
      raf = requestAnimationFrame(langkah)
    }
    const henti = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    }
    const sinkron = () => {
      if (!reduced && tampil && dalamLayar) mulai()
      else henti()
    }

    ukur()
    sinkron()

    const ro = new ResizeObserver(() => ukur())
    ro.observe(satu)

    const io = new IntersectionObserver(
      (entries) => {
        dalamLayar = entries[0].isIntersecting
        sinkron()
      },
      { threshold: 0 },
    )
    io.observe(band)

    const onVisibility = () => {
      tampil = !document.hidden
      sinkron()
    }
    document.addEventListener("visibilitychange", onVisibility)
    const onMotionChange = (event) => {
      reduced = event.matches
      if (reduced) {
        x = 0
        track.style.transform = "translate3d(0px,0,0)"
      }
      sinkron()
    }
    motionQuery.addEventListener("change", onMotionChange)

    return () => {
      henti()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
      motionQuery.removeEventListener("change", onMotionChange)
    }
  }, [])

  return (
    <section aria-label="Mitra" className="w-full" style={{ marginTop: 16, marginBottom: 0 }}>
      <style>{CSS}</style>
      <div ref={bandRef} className="mitra-band" onPointerEnter={() => { berhenti.current = true }} onPointerLeave={() => { berhenti.current = false }}>
        <div ref={trackRef} className="mitra-track">
          <div ref={setRef} className="mitra-set">
            {SATU_SET.map((m) => (
              <div key={m.kunci} className="mitra-sel">
                <img className="mitra-logo" src={m.src} alt={m.nama} draggable="false" />
              </div>
            ))}
          </div>
          <div className="mitra-set" aria-hidden="true">
            {SATU_SET.map((m) => (
              <div key={m.kunci} className="mitra-sel">
                <img className="mitra-logo" src={m.src} alt="" draggable="false" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function MitraMarquee() {
  if (MITRA.length === 0) return null
  return <Strip />
}
