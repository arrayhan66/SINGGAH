import { useEffect, useId, useLayoutEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { LayoutGrid, GraduationCap, Compass, Search, ChevronDown, Newspaper } from "lucide-react"
import foto1 from "../../../assets/images/hero/poliban.jpg"
import foto2 from "../../../assets/images/hero/poliban1.jpeg"
import foto3 from "../../../assets/images/hero/poliban2.jpeg"

// angka kedua makin besar = bagian bawah foto makin terlihat
const SLIDES = [
  { src: foto1, position: "50% 55%", alt: "Gedung utama Politeknik Negeri Banjarmasin" },
  { src: foto2, position: "50% 85%", alt: "Gerbang dan atap khas Politeknik Negeri Banjarmasin" },
  { src: foto3, position: "50% 60%", alt: "Kampus Politeknik Negeri Banjarmasin" },
]

// Isi dengan jurusan NYATA dari data karya. Kalau kosong, kolom Jurusan disembunyikan.
const JURUSAN_OPTIONS = []

const TAHUN_OPTIONS = (() => {
  const now = new Date().getFullYear()
  return Array.from({ length: 6 }, (_, i) => String(now - i))
})()

const INTERVAL_MS = 3000
const WHITE = { color: "#fff" }

function Divider() {
  return (
    <>
      <span className="hidden h-8 w-px shrink-0 bg-slate-200 md:block" />
      <span className="block h-px w-full bg-slate-200 md:hidden" />
    </>
  )
}

function Field({ label, htmlFor, className = "", children }) {
  return (
    <div
      className={`relative flex flex-col justify-center border-b-2 border-transparent px-5 py-2 focus-within:border-blue-600 ${className}`}
    >
      <label
        htmlFor={htmlFor}
        className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-600"
      >
        {label}
      </label>
      {children}
    </div>
  )
}

function SelectBox({ id, name, allLabel, options }) {
  return (
    <div className="relative">
      <select
        id={id}
        name={name}
        defaultValue=""
        className="w-full appearance-none border-0 bg-transparent pr-6 text-[15px] text-slate-900 outline-none"
      >
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-slate-700" />
    </div>
  )
}

export default function HeroPhoto() {
  const navigate = useNavigate()
  const uid = useId()
  const [current, setCurrent] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [tabHidden, setTabHidden] = useState(
    () => typeof document !== "undefined" && document.hidden
  )
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
  const [barH, setBarH] = useState(72)
  const barRef = useRef(null)
  const dotRefs = useRef([])

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const onChange = (e) => setReducedMotion(e.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  useEffect(() => {
    const onVis = () => setTabHidden(document.hidden)
    document.addEventListener("visibilitychange", onVis)
    return () => document.removeEventListener("visibilitychange", onVis)
  }, [])

  useLayoutEffect(() => {
    const el = barRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setBarH(el.offsetHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const paused = hovered || focused || tabHidden || reducedMotion
  
  const handleAnimationEnd = () => {
    if (!paused) {
      setCurrent((c) => (c + 1) % SLIDES.length)
    }
  }

  const goTo = (i) => {
    setCurrent(i)
    dotRefs.current[i]?.focus()
  }

  const onDotsKeyDown = (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault()
      goTo((current + 1) % SLIDES.length)
    } else if (e.key === "ArrowLeft") {
      e.preventDefault()
      goTo((current - 1 + SLIDES.length) % SLIDES.length)
    }
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const params = new URLSearchParams()
    const q = String(fd.get("q") || "").trim()
    const jurusan = String(fd.get("jurusan") || "")
    const tahun = String(fd.get("tahun") || "")
    if (q) params.set("q", q)
    if (jurusan) params.set("jurusan", jurusan)
    if (tahun) params.set("tahun", tahun)
    const qs = params.toString()
    navigate(qs ? `/karya?${qs}` : "/karya")
  }

  const half = barH / 2

  return (
    // Padding di LUAR, max-w di DALAM: sama persis dengan susunan navbar.
    <section
      aria-labelledby={`${uid}-judul`}
      className="w-full px-3 min-[350px]:px-5 md:px-8 lg:px-10 xl:px-12 2xl:px-16"
      style={{
        paddingTop: "calc(var(--navbar-h) + 12px)",
        paddingBottom: `${half + 24}px`,
      }}
    >
      <style>
        {`
          @keyframes hero-fill {
            from { width: 0%; }
            to { width: 100%; }
          }
          .hero-progress {
            animation: hero-fill ${INTERVAL_MS}ms linear forwards;
          }
        `}
      </style>
      <div className="mx-auto w-full max-w-[1700px]">
        <div
          role="group"
          aria-roledescription="carousel"
          aria-label="Foto kampus"
          className="relative"
          style={{ height: "clamp(520px, calc(100svh - var(--navbar-h) - 60px), 820px)" }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false)
          }}
        >
          {/* kartu foto */}
          <div className="absolute inset-0 overflow-hidden rounded-[20px] bg-slate-900 md:rounded-[28px] shadow-[0_24px_60px_-24px_rgba(15,23,42,0.5)]">
            {SLIDES.map((s, i) => (
              <img
                key={s.src}
                src={s.src}
                alt={s.alt}
                draggable={false}
                loading="eager"
                decoding="async"
                {...(i === 0 ? { fetchPriority: "high" } : {})}
                aria-hidden={i === current ? undefined : true}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out motion-reduce:transition-none ${
                  i === current ? "opacity-100" : "opacity-0"
                }`}
                style={{ objectPosition: s.position }}
              />
            ))}
            {/* scrim satu lapis */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0.30) 55%, rgba(0,0,0,0.78) 100%)",
              }}
            />
          </div>

          {/* teks: judul kiri bawah, subteks dan tag kanan bawah */}
          <div
            className="absolute inset-x-0 bottom-0 z-[2] flex flex-col gap-6 px-5 pb-[calc(var(--half)_+_72px)] md:px-9 lg:flex-row lg:items-end lg:justify-between lg:pb-[calc(var(--half)_+_28px)]"
            style={{ "--half": `${half}px` }}
          >
            <div className="flex flex-col items-start">
              <h1
                id={`${uid}-judul`}
                className="max-w-[14em] text-balance"
                style={{ ...WHITE, fontSize: "clamp(36px, 4.6vw, 72px)" }}
              >
                Kami punya sesuatu untuk ditunjukkan
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <p className="max-w-[9rem] text-[13px] font-medium" style={WHITE}>
                  Jelajahi dari semua jurusan
                </p>
                <nav
                  aria-label="Pintasan"
                  className="flex items-center gap-1 rounded-full border border-white/25 bg-black/30 p-1 backdrop-blur-sm"
                >
                  <Link
                    to="/karya"
                    aria-label="Karya Mahasiswa"
                    title="Karya Mahasiswa"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full no-underline transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                    style={WHITE}
                  >
                    <LayoutGrid size={18} aria-hidden="true" />
                  </Link>
                  <Link
                    to="/akademik/tur-virtual"
                    aria-label="Tur Virtual"
                    title="Tur Virtual"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full no-underline transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                    style={WHITE}
                  >
                    <Compass size={18} aria-hidden="true" />
                  </Link>
                  <Link
                    to="/berita"
                    aria-label="Berita"
                    title="Berita"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full no-underline transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                    style={WHITE}
                  >
                    <Newspaper size={18} aria-hidden="true" />
                  </Link>
                </nav>
              </div>
            </div>
            <div className="flex max-w-[430px] flex-col items-start gap-4 lg:items-end">
              <p className="text-[15px] leading-relaxed" style={WHITE}>
                Karya-karya dari kampus Politeknik Negeri Banjarmasin yang bisa kamu lihat langsung di sini.
              </p>
              <ul className="flex flex-wrap gap-2 lg:justify-end">
                <li>
                  <Link
                    to="/karya"
                    className="inline-flex h-9 items-center gap-2 rounded-full border border-white/25 bg-black/30 backdrop-blur-sm px-4 text-[13px] font-medium no-underline transition-colors hover:border-white/60 hover:bg-black/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                    style={WHITE}
                  >
                    <LayoutGrid size={15} aria-hidden="true" />
                    Karya Mahasiswa
                  </Link>
                </li>
                <li>
                  <Link
                    to="/karya"
                    className="inline-flex h-9 items-center gap-2 rounded-full border border-white/25 bg-black/30 backdrop-blur-sm px-4 text-[13px] font-medium no-underline transition-colors hover:border-white/60 hover:bg-black/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                    style={WHITE}
                  >
                    <GraduationCap size={15} aria-hidden="true" />
                    Semua Jurusan
                  </Link>
                </li>
                <li>
                  <Link
                    to="/akademik/tur-virtual"
                    className="inline-flex h-9 items-center gap-2 rounded-full border border-white/25 bg-black/30 backdrop-blur-sm px-4 text-[13px] font-medium no-underline transition-colors hover:border-white/60 hover:bg-black/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                    style={WHITE}
                  >
                    <Compass size={15} aria-hidden="true" />
                    Tur Virtual
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* indikator slide, tepat di atas bar */}
          <div
            className="absolute left-1/2 z-[2] flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/30 backdrop-blur-sm px-3 py-1"
            style={{ bottom: half + 14 }}
            onKeyDown={onDotsKeyDown}
          >
            {SLIDES.map((_, i) => (
              <button
                key={i}
                ref={(el) => (dotRefs.current[i] = el)}
                type="button"
                aria-label={`Slide ${i + 1} dari ${SLIDES.length}`}
                aria-current={i === current ? "true" : undefined}
                onClick={() => setCurrent(i)}
                className="flex h-6 w-12 items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-white md:w-14"
              >
                <span className="relative flex h-[3px] w-full items-center overflow-hidden rounded-full bg-white/35">
                  {i === current && (
                    <span
                      key={current}
                      onAnimationEnd={handleAnimationEnd}
                      style={{ animationPlayState: paused ? "paused" : "running" }}
                      className={`absolute inset-y-0 left-0 h-full rounded-full bg-white ${
                        reducedMotion ? "w-full" : "hero-progress"
                      }`}
                    />
                  )}
                </span>
              </button>
            ))}
          </div>

          {/* bar pencarian yang menumpang di tepi bawah foto */}
          <form
            ref={barRef}
            role="search"
            aria-label="Cari karya mahasiswa"
            onSubmit={onSubmit}
            className="absolute bottom-0 left-1/2 z-[3] flex w-[min(100%_-_24px,520px)] flex-col items-stretch gap-1 rounded-[20px] border border-slate-200 bg-white p-3 shadow-[0_12px_32px_rgba(15,23,42,0.18)] md:h-[76px] md:w-[min(100%_-_32px,1000px)] md:flex-row md:items-center md:gap-0 md:rounded-[36px] md:p-0 md:pr-2.5"
            style={{ transform: "translate(-50%, 50%)" }}
          >
            <Field label="Cari karya" htmlFor={`${uid}-q`} className="md:flex-[1.6]">
              <input
                id={`${uid}-q`}
                type="search"
                name="q"
                maxLength={100}
                placeholder="Judul, proyek, atau kata kunci"
                className="w-full border-0 bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-500"
              />
            </Field>
            {JURUSAN_OPTIONS.length > 0 && (
              <>
                <Divider />
                <Field label="Jurusan" htmlFor={`${uid}-jurusan`} className="md:flex-1">
                  <SelectBox id={`${uid}-jurusan`} name="jurusan" allLabel="Semua jurusan" options={JURUSAN_OPTIONS} />
                </Field>
              </>
            )}
            <Divider />
            <Field label="Tahun" htmlFor={`${uid}-tahun`} className="md:flex-[0.8]">
              <SelectBox id={`${uid}-tahun`} name="tahun" allLabel="Semua tahun" options={TAHUN_OPTIONS} />
            </Field>
            <button
              type="submit"
              style={WHITE}
              className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-blue-600 px-7 text-[15px] font-medium transition-colors duration-200 hover:bg-blue-700 active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 md:mt-0 md:ml-3 md:h-[56px]"
            >
              <Search size={17} aria-hidden="true" />
              Cari
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}