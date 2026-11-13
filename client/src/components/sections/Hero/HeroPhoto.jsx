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

const TAHUN_OPTIONS = (() => {
  const now = new Date().getFullYear()
  return Array.from({ length: 6 }, (_, i) => String(now - i))
})()

const YEAR_ITEMS = [
  { value: "", label: "Semua" },
  ...TAHUN_OPTIONS.map((t) => ({ value: t, label: t })),
]

const INTERVAL_MS = 3000

const GLASS = {
  background: "rgba(0,0,0,0.38)",
  border: "1px solid rgba(255,255,255,0.28)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  color: "#fff",
}

const WHITE = { color: "#fff" }

const HERO_LABEL = {
  display: "block",
  marginBottom: 2,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "#64748b",
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
  const [progress, setProgress] = useState(0)
  const [year, setYear] = useState("")
  const [yearOpen, setYearOpen] = useState(false)
  const [activeYearIndex, setActiveYearIndex] = useState(0)
  const [isLg, setIsLg] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches
  )
  const [isMd, setIsMd] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches
  )
  const [tabHidden, setTabHidden] = useState(
    () => typeof document !== "undefined" && document.hidden
  )
  const [inView, setInView] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
  const [barH, setBarH] = useState(72)
  const barRef = useRef(null)
  const cardRef = useRef(null)
  const yearRef = useRef(null)
  const dotRefs = useRef([])
  const elapsedRef = useRef(0)

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    const onChange = (e) => setIsLg(e.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)")
    const onChange = (e) => setIsMd(e.matches)
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

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.25 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!yearOpen) return
    const onDown = (e) => {
      if (yearRef.current && !yearRef.current.contains(e.target)) setYearOpen(false)
    }
    const onKey = (e) => {
      if (e.key === "Escape") setYearOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [yearOpen])

  useLayoutEffect(() => {
    const el = barRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setBarH(el.offsetHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const paused = tabHidden || !inView

  useEffect(() => {
    let last = performance.now()
    const id = setInterval(() => {
      const now = performance.now()
      const delta = now - last
      last = now
      if (paused) return
      elapsedRef.current += delta
      if (elapsedRef.current >= INTERVAL_MS) {
        elapsedRef.current = 0
        setCurrent((c) => {
          const next = (c + 1) % SLIDES.length
          console.log("hero slide ->", next) // DEBUG hapus nanti
          return next
        })
      }
      setProgress(elapsedRef.current / INTERVAL_MS)
    }, 50)
    return () => clearInterval(id)
  }, [paused])

  const goTo = (i) => {
    elapsedRef.current = 0
    setProgress(0)
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

  const selectYear = (value) => {
    setYear(value)
    setYearOpen(false)
  }

  const onYearKeyDown = (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault()
      if (!yearOpen) {
        setYearOpen(true)
        setActiveYearIndex(Math.max(0, YEAR_ITEMS.findIndex((o) => o.value === year)))
        return
      }
      const step = e.key === "ArrowDown" ? 1 : -1
      setActiveYearIndex((i) => (i + step + YEAR_ITEMS.length) % YEAR_ITEMS.length)
      return
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      if (!yearOpen) {
        setYearOpen(true)
        setActiveYearIndex(Math.max(0, YEAR_ITEMS.findIndex((o) => o.value === year)))
        return
      }
      selectYear(YEAR_ITEMS[activeYearIndex].value)
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
          .hero-tag:focus-visible,
          .hero-shortcut:focus-visible,
          .hero-dot:focus-visible {
            outline: 2px solid #fff;
            outline-offset: 2px;
          }
          .hp-seg:focus-within {
            background: #f8fafc;
            border-radius: 9999px;
          }
          .hp-seg input:focus,
          .hp-seg button:focus {
            outline: none !important;
          }
          .hero-search-btn:hover {
            background-color: #1d4ed8 !important;
          }
          .hero-search-btn:focus-visible {
            outline: none;
            box-shadow: 0 0 0 3px rgba(37,99,235,0.35);
          }
          .hero-search-btn:active {
            transform: translateY(1px);
          }
          .hero-search-field::placeholder {
            color: #94a3b8;
          }
          input[type="search"]::-webkit-search-cancel-button,
          input[type="search"]::-webkit-search-decoration {
            -webkit-appearance: none;
            display: none;
          }
          .hero-year-option:hover {
            background-color: #f1f5f9 !important;
          }
        `}
      </style>
      <div className="mx-auto w-full max-w-[1700px]">
        <div
          ref={cardRef}
          role="group"
          aria-roledescription="carousel"
          aria-label="Foto kampus"
          className="relative"
          style={{ height: "clamp(520px, calc(100svh - var(--navbar-h) - 60px), 820px)" }}
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
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  objectPosition: s.position,
                  opacity: i === current ? 1 : 0,
                  transition: reducedMotion ? "none" : "opacity 700ms ease-in-out",
                }}
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
            className="absolute z-[2]"
            style={{
              left: "50%",
              bottom: half + 16,
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              borderRadius: 9999,
              background: "rgba(0,0,0,0.28)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
            onKeyDown={onDotsKeyDown}
          >
            {SLIDES.map((_, i) => {
              const isActive = i === current
              const width = isActive ? (isMd ? 84 : 56) : isMd ? 56 : 40
              return (
                <button
                  key={i}
                  ref={(el) => (dotRefs.current[i] = el)}
                  type="button"
                  aria-label={`Slide ${i + 1} dari ${SLIDES.length}`}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => goTo(i)}
                  className="hero-dot"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width,
                    height: 20,
                    padding: 0,
                    border: 0,
                    background: "transparent",
                    cursor: "pointer",
                    transition: "width 300ms ease",
                  }}
                >
                  <span
                    style={{
                      position: "relative",
                      display: "block",
                      width: "100%",
                      height: 3,
                      borderRadius: 9999,
                      background: "rgba(255,255,255,0.35)",
                      overflow: "hidden",
                    }}
                  >
                    {isActive && (
                      <span
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: `${progress * 100}%`,
                          borderRadius: 9999,
                          background: "#fff",
                        }}
                      />
                    )}
                  </span>
                </button>
              )
            })}
          </div>

          <form
            ref={barRef}
            role="search"
            aria-label="Cari karya mahasiswa"
            onSubmit={onSubmit}
            className="hero-search-form absolute bottom-0 left-1/2 z-[3] flex flex-col md:flex-row md:items-center"
            style={{
              height: isMd ? 72 : "auto",
              width: isMd ? "min(100% - 32px, 880px)" : "min(100% - 24px, 520px)",
              borderRadius: isMd ? 9999 : 24,
              background: "#fff",
              border: "none",
              boxShadow: "0 12px 32px -8px rgba(15,23,42,0.18)",
              padding: isMd ? "8px 8px 8px 28px" : 8,
              transform: "translate(-50%, 50%)",
            }}
          >
            <div className="hp-seg flex h-[60px] flex-1 flex-col justify-center px-4 md:h-full md:px-3">
              <label htmlFor={`${uid}-q`} style={HERO_LABEL}>
                Cari karya
              </label>
              <input
                id={`${uid}-q`}
                type="search"
                name="q"
                maxLength={100}
                autoComplete="off"
                spellCheck={false}
                placeholder="Judul karya atau kata kunci"
                className="hero-search-field w-full"
                style={{
                  fontSize: 16,
                  color: "#0f172a",
                  background: "transparent",
                  outline: "none",
                  border: "none",
                  boxShadow: "none",
                  appearance: "none",
                  WebkitAppearance: "none",
                  padding: 0,
                  width: "100%",
                }}
              />
            </div>
            <span
              aria-hidden="true"
              className="hidden md:block"
              style={{ width: 1, height: 36, background: "#e2e8f0", margin: "0 20px", flexShrink: 0 }}
            />
            <span
              aria-hidden="true"
              className="md:hidden"
              style={{ height: 1, background: "#e2e8f0", margin: "0 16px" }}
            />
            <div className="flex md:contents">
              <div ref={yearRef} className="hp-seg relative flex h-[52px] flex-1 items-center px-4 md:h-full md:flex-none md:px-3">
                <button
                  id={`${uid}-tahun`}
                  type="button"
                  className="hero-year-trigger flex h-full w-full flex-col items-start justify-center text-left"
                  style={{
                    outline: "none",
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    cursor: "pointer",
                    textAlign: "left",
                    WebkitAppearance: "none",
                    appearance: "none",
                  }}
                  aria-haspopup="listbox"
                  aria-expanded={yearOpen}
                  aria-controls={`${uid}-tahun-list`}
                  aria-activedescendant={yearOpen ? `${uid}-tahun-opt-${activeYearIndex}` : undefined}
                  onClick={() => {
                    const next = !yearOpen
                    setYearOpen(next)
                    if (next) {
                      setActiveYearIndex(Math.max(0, YEAR_ITEMS.findIndex((o) => o.value === year)))
                    }
                  }}
                  onKeyDown={onYearKeyDown}
                >
                  <span style={HERO_LABEL}>Tahun</span>
                  <span className="flex items-center gap-1" style={{ fontSize: 16, fontWeight: 500, color: "#334155" }}>
                    {year || "Semua"}
                    <ChevronDown size={14} aria-hidden="true" style={{ color: "#94a3b8" }} />
                  </span>
                </button>
                {yearOpen && (
                  <ul
                    id={`${uid}-tahun-list`}
                    role="listbox"
                    aria-label="Pilih tahun"
                    className="absolute right-0 z-20 min-w-[160px] p-1.5"
                    style={{
                      bottom: "calc(100% + 10px)",
                      background: "#fff",
                      border: "none",
                      borderRadius: 16,
                      boxShadow: "0 12px 32px -8px rgba(15,23,42,0.18)",
                    }}
                  >
                    {YEAR_ITEMS.map((item, i) => {
                      const selected = item.value === year
                      return (
                        <li
                          key={item.value || "all"}
                          id={`${uid}-tahun-opt-${i}`}
                          role="option"
                          aria-selected={selected}
                          className="hero-year-option flex h-10 cursor-pointer items-center px-3"
                          style={{
                            borderRadius: 10,
                            fontSize: 15,
                            fontWeight: selected ? 600 : 400,
                            color: selected ? "#2563eb" : "#334155",
                            background: i === activeYearIndex && !selected ? "#f1f5f9" : "transparent",
                          }}
                          onClick={() => selectYear(item.value)}
                        >
                          {item.label}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
              <button
                type="submit"
                className="hero-search-btn flex flex-1 items-center justify-center gap-2 md:ml-3 md:flex-none"
                style={{
                  height: isMd ? 56 : 52,
                  padding: "0 32px",
                  borderRadius: 9999,
                  background: "#2563eb",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 600,
                  border: "none",
                  outline: "none",
                  WebkitAppearance: "none",
                  appearance: "none",
                }}
              >
                <Search size={16} aria-hidden="true" />
                Cari
              </button>
            </div>
            <input type="hidden" name="tahun" value={year} />
          </form>
        </div>
      </div>
    </section>
  )
}
