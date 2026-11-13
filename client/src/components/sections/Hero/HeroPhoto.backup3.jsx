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

const GLASS = {
  background: "rgba(0,0,0,0.38)",
  border: "1px solid rgba(255,255,255,0.28)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  color: "#fff",
}

const WHITE = { color: "#fff" }

function Divider() {
  return (
    <>
      <span aria-hidden="true" className="hidden h-9 w-px shrink-0 md:block" style={{ background: "#e2e8f0" }} />
      <span aria-hidden="true" className="block h-px w-full md:hidden" style={{ background: "#e2e8f0" }} />
    </>
  )
}

function Field({ label, htmlFor, className = "", children }) {
  const [focused, setFocused] = useState(false)

  return (
    <div
      className={`relative flex flex-col justify-center px-4 py-2 md:px-7 md:py-0 ${className}`}
      style={{ borderBottom: `2px solid ${focused ? "#2563eb" : "transparent"}` }}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={() => setFocused(false)}
    >
      <label
        htmlFor={htmlFor}
        style={{
          display: "block",
          marginBottom: 2,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "#475569",
        }}
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
        style={{
          width: "100%",
          appearance: "none",
          border: 0,
          background: "transparent",
          outline: "none",
          fontSize: 15,
          color: "#0f172a",
          paddingRight: 24,
        }}
      >
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2"
        style={{ color: "#334155" }}
      />
    </div>
  )
}

function ShortcutLink({ to, label, icon: Icon }) {
  const [hover, setHover] = useState(false)

  return (
    <Link
      to={to}
      aria-label={label}
      title={label}
      className="hero-shortcut inline-flex items-center justify-center rounded-full"
      style={{
        ...WHITE,
        width: 36,
        height: 36,
        textDecoration: "none",
        background: hover ? "rgba(255,255,255,0.22)" : "transparent",
        transition: "background-color 150ms ease",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Icon size={18} aria-hidden="true" />
    </Link>
  )
}

function TagLink({ to, icon: Icon, children }) {
  const [hover, setHover] = useState(false)

  return (
    <Link
      to={to}
      className="hero-tag inline-flex items-center rounded-full"
      style={{
        ...GLASS,
        height: 36,
        padding: "0 16px",
        gap: 8,
        fontSize: 13,
        fontWeight: 500,
        textDecoration: "none",
        whiteSpace: "nowrap",
        transition: "background-color 150ms ease, border-color 150ms ease",
        ...(hover
          ? { background: "rgba(0,0,0,0.55)", borderColor: "rgba(255,255,255,0.6)" }
          : {}),
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Icon size={15} aria-hidden="true" />
      {children}
    </Link>
  )
}

export default function HeroPhoto() {
  const navigate = useNavigate()
  const uid = useId()
  const [current, setCurrent] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [buttonHover, setButtonHover] = useState(false)
  const [isLg, setIsLg] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches
  )
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
    const mq = window.matchMedia("(min-width: 1024px)")
    const onChange = (e) => setIsLg(e.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

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
          .hero-slide {
            transition: opacity 700ms ease-in-out;
          }
          .hero-tag:focus-visible,
          .hero-shortcut:focus-visible,
          .hero-dot:focus-visible {
            outline: 2px solid #fff;
            outline-offset: 2px;
          }
          .hero-search-btn:focus-visible {
            outline: 2px solid #2563eb;
            outline-offset: 2px;
          }
          .hero-search-btn:active {
            transform: translateY(1px);
          }
          .hero-input::placeholder {
            color: #64748b;
          }
          @media (prefers-reduced-motion: reduce) {
            .hero-slide { transition: none; }
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
          <div
            className="absolute inset-0 overflow-hidden rounded-[20px] md:rounded-[28px]"
            style={{ background: "#0f172a" }}
          >
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
                className="hero-slide absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: s.position, opacity: i === current ? 1 : 0 }}
              />
            ))}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.88) 100%), linear-gradient(90deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.25) 100%)",
              }}
            />
          </div>

          <div
            className="absolute inset-x-0 bottom-0 z-[2] flex gap-6 px-5 md:px-9"
            style={{
              flexDirection: isLg ? "row" : "column",
              alignItems: isLg ? "flex-end" : "flex-start",
              justifyContent: isLg ? "space-between" : "flex-start",
              paddingBottom: half + (isLg ? 24 : 72),
            }}
          >
            <div className="flex flex-col items-start">
              <h1
                id={`${uid}-judul`}
                style={{
                  ...WHITE,
                  fontSize: "clamp(40px, 4.6vw, 72px)",
                  maxWidth: "14em",
                  textWrap: "balance",
                }}
              >
                Kami punya sesuatu untuk ditunjukkan
              </h1>
              <div className="flex flex-wrap items-center gap-3" style={{ marginTop: 20 }}>
                <p
                  style={{
                    ...WHITE,
                    fontSize: 13,
                    fontWeight: 500,
                    lineHeight: 1.3,
                    maxWidth: "8.5rem",
                    textAlign: "left",
                  }}
                >
                  Jelajahi dari semua jurusan
                </p>
                <nav
                  aria-label="Pintasan"
                  className="flex items-center gap-0.5"
                  style={{ ...GLASS, borderRadius: 9999, padding: 4 }}
                >
                  <ShortcutLink to="/karya" label="Karya" icon={LayoutGrid} />
                  <ShortcutLink to="/akademik/tur-virtual" label="Tur Virtual" icon={Compass} />
                  <ShortcutLink to="/berita" label="Berita" icon={Newspaper} />
                </nav>
              </div>
            </div>

            <div
              className="flex flex-col gap-4"
              style={{
                maxWidth: 400,
                alignItems: isLg ? "flex-end" : "flex-start",
              }}
            >
              <p
                style={{
                  ...WHITE,
                  fontSize: 15,
                  lineHeight: 1.55,
                  maxWidth: 400,
                  textAlign: isLg ? "right" : "left",
                }}
              >
                Karya-karya dari kampus Politeknik Negeri Banjarmasin yang bisa kamu lihat langsung di sini.
              </p>
              <ul
                className="flex flex-wrap gap-2"
                style={{
                  justifyContent: isLg ? "flex-end" : "flex-start",
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                }}
              >
                <li>
                  <TagLink to="/karya" icon={LayoutGrid}>
                    Karya Mahasiswa
                  </TagLink>
                </li>
                <li>
                  <TagLink to="/karya" icon={GraduationCap}>
                    Semua Jurusan
                  </TagLink>
                </li>
                <li>
                  <TagLink to="/akademik/tur-virtual" icon={Compass}>
                    Tur Virtual
                  </TagLink>
                </li>
              </ul>
            </div>
          </div>

          <div
            className="absolute left-1/2 z-[2] flex items-center gap-1.5"
            style={{
              ...GLASS,
              borderRadius: 9999,
              padding: "4px 10px",
              bottom: half + 16,
              transform: "translateX(-50%)",
            }}
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
                className="hero-dot flex h-6 w-12 items-center md:w-14"
                style={{
                  background: "transparent",
                  border: 0,
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                <span
                  className="relative flex h-[3px] w-full items-center overflow-hidden rounded-full"
                  style={{ background: "rgba(255,255,255,0.35)" }}
                >
                  {i === current && (
                    <span
                      key={current}
                      onAnimationEnd={handleAnimationEnd}
                      style={{
                        background: "#fff",
                        animationPlayState: paused ? "paused" : "running",
                      }}
                      className={`absolute inset-y-0 left-0 h-full rounded-full ${
                        reducedMotion ? "w-full" : "hero-progress"
                      }`}
                    />
                  )}
                </span>
              </button>
            ))}
          </div>

          <form
            ref={barRef}
            role="search"
            aria-label="Cari karya mahasiswa"
            onSubmit={onSubmit}
            className="absolute bottom-0 left-1/2 z-[3] flex w-[min(100%_-_24px,520px)] flex-col items-stretch rounded-[24px] p-3 md:h-[78px] md:w-[min(100%_-_32px,980px)] md:flex-row md:items-center md:gap-0 md:rounded-full md:p-0"
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 10px 30px rgba(15,23,42,0.16)",
              transform: "translate(-50%, 50%)",
            }}
          >
            <Field label="Cari karya" htmlFor={`${uid}-q`} className="md:flex-[1.6]">
              <input
                id={`${uid}-q`}
                type="search"
                name="q"
                maxLength={100}
                placeholder="Judul, proyek, atau kata kunci"
                className="hero-input"
                style={{
                  width: "100%",
                  border: 0,
                  background: "transparent",
                  outline: "none",
                  fontSize: 15,
                  color: "#0f172a",
                  padding: 0,
                }}
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
              className="hero-search-btn mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full md:mt-0 md:ml-3 md:mr-2.5 md:h-[56px] md:w-auto"
              style={{
                background: buttonHover ? "#1d4ed8" : "#2563eb",
                color: "#fff",
                border: 0,
                padding: "0 28px",
                fontSize: 15,
                fontWeight: 500,
                cursor: "pointer",
                transition: "background-color 150ms ease",
              }}
              onMouseEnter={() => setButtonHover(true)}
              onMouseLeave={() => setButtonHover(false)}
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
