import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown, ArrowRight, Home, LayoutGrid, GraduationCap, Newspaper, Info } from "lucide-react";
import logo from "../../assets/icons/logo.webp";
import { prefetchRouteFromLink } from "../../utils/routePrefetch";
import { applyNavbarFont } from "../../utils/navbarFont";
import SmartImage from "../ui/SmartImage";
import imgPemenang from "../../assets/images/navbarSupports/prestasi.jpg";
import imgTur from "../../assets/images/navbarSupports/tur virtual.jpg";
import imgDosen from "../../assets/images/navbarSupports/daftar dosen.jpg";
import imgVisitasi from "../../assets/images/navbarSupports/visitasi.jpg";

const SNAV_CSS = `
.snav-link,.snav-menu,.snav-mobile,.snav-ink,.snav-auth{--snav-c:#475569;--snav-h:#0f172a;--snav-a:#2563eb;--snav-bg:#fff;--snav-bd:rgba(148,163,184,.35);--snav-hov:rgba(37,99,235,.07);--snav-sh:rgba(15,23,42,.22);--snav-mono:ui-monospace,"JetBrains Mono","IBM Plex Mono",Consolas,Menlo,monospace}
.snav-link.snav-link{position:relative;z-index:1;display:inline-flex;align-items:center;padding:clamp(4px,0.8vw,8px) clamp(2px,0.4vw,4px);font-family:var(--snav-font,var(--snav-mono));font-size:clamp(11px,1.2vw,15px);line-height:1.5;font-weight:700;color:var(--snav-c);text-decoration:none;cursor:pointer;border:0;background:transparent;transition:color .2s ease;white-space:nowrap}
@media (min-width:2560px){.snav-link.snav-link{font-size:clamp(15px,1.5vw,22px);padding:clamp(8px,1vw,14px) clamp(4px,0.6vw,8px)}}
.snav-link.snav-link:hover{color:#2563eb}
.snav-link.snav-link:focus-visible{outline:2px solid var(--snav-a);outline-offset:4px;border-radius:6px}
.snav-ink{position:absolute;left:0;bottom:0;height:2px;pointer-events:none;z-index:0;opacity:0;will-change:transform,width,opacity;background-repeat:no-repeat;background-position:50% 100%;background-size:100% 1.5px;background-image:linear-gradient(90deg,transparent,var(--snav-a) 20%,var(--snav-a) 80%,transparent)}
.snav-chev{margin-left:5px;transition:transform .28s cubic-bezier(.22,1,.36,1)}
.snav-dd.is-open .snav-chev{transform:rotate(180deg)}
.snav-dd{position:static}
.snav-dd>.snav-link::after{content:"";position:absolute;left:-10px;right:-10px;top:100%;height:44px}
.snav-menu{position:absolute;top:calc(100% + 14px);left:0;width:min(920px,100%);font-family:var(--snav-font,var(--snav-mono));display:grid;grid-template-columns:220px minmax(0,1fr) 260px;column-gap:32px;padding:28px 28px 28px 32px;border-radius:16px;background:var(--snav-bg);border:1px solid var(--snav-bd);box-shadow:0 2px 6px -2px var(--snav-sh);opacity:0;visibility:hidden;pointer-events:none;transform:translateY(-12px);transition:opacity 1.5s cubic-bezier(.22,1,.36,1),transform 1.5s cubic-bezier(.22,1,.36,1),visibility 0s;z-index:60}
.snav-dd.is-open .snav-menu{opacity:1;visibility:visible;pointer-events:auto;transform:none;transition:opacity 1.5s cubic-bezier(.22,1,.36,1),transform 1.5s cubic-bezier(.22,1,.36,1),visibility 0s}
.snav-menu::before{content:"";position:absolute;top:-8px;left:var(--caret,50%);width:14px;height:14px;background:var(--snav-bg);border-left:1px solid var(--snav-bd);border-top:1px solid var(--snav-bd);border-radius:3px 0 0 0;transform:translateX(-50%) rotate(45deg)}
.snav-mm-side{padding-right:32px;border-right:1px solid var(--snav-bd)}
.snav-mm-label{margin-bottom:18px;font-family:var(--snav-font,var(--snav-mono));font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--snav-c)}
.snav-mm-item{display:block;padding:7px 0;font-family:var(--snav-font,var(--snav-mono));font-size:17px;font-weight:700;color:var(--snav-c);text-decoration:none;transition:color .15s}
.snav-mm-item.is-hover,.snav-mm-item:focus-visible{color:#2563eb;outline:none}
.snav-mm-body{display:flex;flex-direction:column;min-width:0}
.snav-mm-title{display:inline-flex;align-items:center;gap:8px;align-self:flex-start;font-family:var(--snav-font,var(--snav-mono));font-size:17px;font-weight:700;color:var(--snav-h);text-decoration:none}
.snav-mm-desc{margin:14px 0 0;max-width:34ch;font-size:16px;line-height:1.6;color:var(--snav-c)}
.snav-mm-tags{display:grid;grid-template-columns:repeat(2,max-content);gap:8px 10px;margin-top:auto;padding-top:24px}
.snav-mm-tags span{padding:6px 14px;border-radius:9999px;font-size:13px;font-weight:500;color:var(--snav-h);background:rgba(148,163,184,.16)}
.snav-mm-img{position:relative;min-height:260px;overflow:hidden;border-radius:6px;background:var(--snav-hov)}
.snav-mm-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(.8);animation:snav-img-in .25s ease}
@keyframes snav-img-in{from{opacity:0}to{opacity:1}}
@media (max-width:1199px){.snav-menu{grid-template-columns:240px minmax(0,1fr)}.snav-mm-img{display:none}}
.snav-burger{position:relative;width:40px;height:40px;border:0;background:transparent;cursor:pointer}
.snav-burger span{position:absolute;left:10px;right:10px;height:2px;border-radius:2px;background:currentColor;transition:transform .3s cubic-bezier(.22,1,.36,1),opacity .2s}
.snav-burger span:nth-child(1){top:14px}.snav-burger span:nth-child(2){top:19px}.snav-burger span:nth-child(3){top:24px}
.snav-burger.is-open span:nth-child(1){transform:translateY(5px) rotate(45deg)}
.snav-burger.is-open span:nth-child(2){opacity:0}
.snav-burger.is-open span:nth-child(3){transform:translateY(-5px) rotate(-45deg)}
.snav-mobile{position:absolute;right:0;left:auto;top:calc(100% + 12px);width:min(340px,100%);max-width:360px;max-height:calc(100dvh - var(--navbar-h) - 32px);overflow:hidden;overscroll-behavior:contain;opacity:0;visibility:hidden;pointer-events:none;transform:translateX(20px);clip-path:inset(0 0 0 100%);transform-origin:top right;transition:opacity 1s ease,transform 1s ease,clip-path 1s ease,visibility 0s;z-index:50}
.snav-mobile.is-open{opacity:1;visibility:visible;pointer-events:auto;transform:none;clip-path:inset(-16px -16px -16px -16px);transition:opacity 1s ease,transform 1s ease,clip-path 1s ease,visibility 0s}
.snav-mobile-inner{min-height:0;overflow:hidden}
.snav-mlink{display:flex;align-items:center;gap:12px;padding:12px 12px;font-family:var(--snav-font,var(--snav-mono));font-size:clamp(15px,4vw,17px);font-weight:600;color:var(--snav-c);text-decoration:none;background:none;border:0;width:100%;text-align:left;cursor:pointer;border-radius:8px;min-height:48px}.snav-mlink:hover{color:#2563eb;background:var(--snav-hov)}.snav-mlink.is-active{color:var(--snav-a)}.snav-mlink-sub{display:flex;align-items:center;gap:12px;padding:10px 12px 10px 48px;font-family:var(--snav-font,var(--snav-mono));font-size:clamp(14px,3.6vw,16px);font-weight:400;color:var(--snav-c);text-decoration:none;background:none;border:0;width:100%;text-align:left;cursor:pointer;border-radius:8px;min-height:44px}.snav-mlink-sub:hover{color:#2563eb;background:var(--snav-hov)}.snav-mlink-sub.is-active{color:var(--snav-a)}
.snav-mlink:hover{color:#2563eb}
.snav-mlink.is-active{color:var(--snav-a)}
.snav-acc{display:grid;grid-template-rows:0fr;transition:grid-template-rows 1s ease}
.snav-acc.is-open{grid-template-rows:1fr}
.snav-acc>div{min-height:0;overflow:hidden;padding-left:0}
.snav-auth{display:inline-flex;align-items:center;gap:10px;margin-left:12px}.snav-mbtn{display:flex;flex:1;align-items:center;justify-content:center;height:44px;border-radius:4px;font-family:ui-monospace,"JetBrains Mono","IBM Plex Mono",Consolas,Menlo,monospace;font-size:13px;font-weight:500;letter-spacing:.05em;text-transform:uppercase;text-decoration:none;border:1px solid;transition:background-color .15s,border-color .15s;cursor:pointer}.snav-mbtn-primary{background:#2563eb;color:#fff;border-color:#2563eb}.snav-mbtn-primary:hover{background:#1d4ed8;border-color:#1d4ed8}.snav-mbtn:not(.snav-mbtn-primary){background:#f1f5f9;color:#0f172a;border-color:#d5dbe3;box-shadow:0 1px 2px rgba(15,23,42,.06)}.snav-mbtn:not(.snav-mbtn-primary):hover{background:#e8edf3;border-color:#bcc5d1}
.snav-login.snav-login,.snav-cta.snav-cta{display:inline-flex;align-items:center;justify-content:center;height:40px;padding:0 18px;border-radius:4px;font-family:'Quicksand',sans-serif;font-size:13px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;text-decoration:none;white-space:nowrap;transition:background-color .15s,border-color .15s}
.snav-login.snav-login{color:#0f172a;background:#f1f5f9;border:1px solid #d5dbe3;box-shadow:0 1px 2px rgba(15,23,42,.06)}
.snav-login.snav-login:hover{background:#e8edf3;border-color:#bcc5d1}
.snav-cta.snav-cta{color:#fff;background:#2563eb;border:1px solid #2563eb}
.snav-cta.snav-cta:hover{background:#1d4ed8;border-color:#1d4ed8}
.snav-cta.snav-cta:active,.snav-login.snav-login:active{transform:translateY(1px)}
.snav-cta.snav-cta:focus-visible,.snav-login.snav-login:focus-visible{outline:2px solid currentColor;outline-offset:2px}
@media (max-width:949px){.snav-auth{display:none}}
@media (max-width:949px){.snav-link.snav-link{font-size:14px}}
@media (min-width:950px) and (max-width:1023px){.snav-link.snav-link{font-size:14px}}
@media (min-width:1024px) and (max-width:1279px){.snav-link.snav-link{font-size:15px}}
@media (min-width:1280px) and (max-width:1535px){.snav-link.snav-link{font-size:15px}}
@media (min-width:1536px){.snav-link.snav-link{font-size:15px}}
@media (min-width:950px) and (max-width:1199px){.snav-login,.snav-cta{height:36px;padding:0 14px;font-size:12px}.snav-auth{gap:8px}}
@media (min-width:1200px) and (max-width:2559px){.snav-login,.snav-cta{height:42px;padding:0 18px;font-size:13px}.snav-auth{gap:10px}}
@media (min-width:2560px){.snav-link.snav-link{font-size:clamp(16px,1.6vw,24px);padding:clamp(10px,1.2vw,16px) clamp(6px,0.8vw,12px)}.snav-mm-item{font-size:clamp(18px,1.8vw,26px)}.snav-mlink{font-size:clamp(16px,1.6vw,22px);padding:clamp(14px,1.4vw,20px)}.snav-mlink-sub{font-size:clamp(15px,1.5vw,20px);padding:clamp(12px,1.2vw,18px) clamp(12px,1.4vw,20px) clamp(12px,1.2vw,18px) 60px}.snav-login,.snav-cta{height:48px;padding:0 24px;font-size:15px}.snav-mbtn{height:52px;font-size:15px}.snav-auth{gap:14px}}
@media (prefers-reduced-motion:reduce){.snav-link.snav-link,.snav-ink,.snav-chev,.snav-menu,.snav-mm-img img,.snav-burger span,.snav-mobile,.snav-acc{transition:none!important;animation:none!important}}
`;

let navInkMemo = null;
let navInkMemoAt = 0;

function useNavInk(barRef, listRef, inkRef, deps) {
  const target = useRef({ x: 0, w: 0, show: 0 });
  const current = useRef({ x: 0, w: 0, show: 0 });
  const vel = useRef({ x: 0, w: 0 });
  const raf = useRef(null);
  const last = useRef(0);
  const first = useRef(true);

  const apply = () => {
    const el = inkRef.current;
    if (!el) return;
    const c = current.current;
    el.style.transform = `translate3d(${c.x}px,0,0)`;
    el.style.width = `${Math.max(c.w, 0)}px`;
    el.style.opacity = Math.min(Math.max(c.show, 0), 1).toFixed(3);
  };

  const tick = (now) => {
    const t = target.current,
      c = current.current,
      v = vel.current;
    // dt dalam detik, dibatasi supaya tidak meloncat saat tab sempat di-background
    const dt = Math.min((now - last.current) / 1000, 1 / 30);
    last.current = now;

    const STIFF = 190; // makin besar makin cepat
    const DAMP = 24; // makin kecil makin membal (kritis ≈ 27.6)
    v.x += (STIFF * (t.x - c.x) - DAMP * v.x) * dt;
    v.w += (STIFF * (t.w - c.w) - DAMP * v.w) * dt;
    c.x += v.x * dt;
    c.w += v.w * dt;
    c.show += (t.show - c.show) * (1 - Math.exp(-dt / 0.08));

    const settled =
      Math.abs(t.x - c.x) < 0.1 &&
      Math.abs(t.w - c.w) < 0.1 &&
      Math.abs(v.x) < 0.5 &&
      Math.abs(v.w) < 0.5 &&
      Math.abs(t.show - c.show) < 0.01;

    if (settled) {
      c.x = t.x;
      c.w = t.w;
      c.show = t.show;
      v.x = 0;
      v.w = 0;
      apply();
      raf.current = null;
      return;
    }
    apply();
    raf.current = requestAnimationFrame(tick);
  };

  const start = () => {
    if (raf.current != null) return;
    last.current = performance.now();
    raf.current = requestAnimationFrame(tick);
  };

  const measure = useCallback(() => {
    const bar = barRef.current,
      list = listRef.current;
    if (!bar || !list) return;
    const el = list.querySelector(
      ".snav-link.is-active, .snav-link[aria-current='page']",
    );
    let next;
    if (!el || el.offsetParent === null) {
      next = { ...target.current, show: 0 };
    } else {
      const b = bar.getBoundingClientRect(),
        r = el.getBoundingClientRect();
      const pad = 12;
      // tanpa Math.round: biarkan subpixel supaya tidak bergetar
      next = {
        x: r.left - b.left - bar.clientLeft - pad,
        w: r.width + pad * 2,
        show: 1,
      };
    }
    target.current = next;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (first.current) {
      first.current = false;
      const recent = navInkMemo && performance.now() - navInkMemoAt < 1200;
      current.current = recent ? { ...navInkMemo } : { ...next };
      apply();
      if (recent && !reduce) start();
      else if (recent) {
        current.current = { ...next };
        apply();
      }
      return;
    }
    if (reduce) {
      current.current = { ...next };
      apply();
      return;
    }
    start();
  }, [barRef, listRef, inkRef]);

  useLayoutEffect(
    () => () => {
      navInkMemo = { ...current.current };
      navInkMemoAt = performance.now();
    },
    [],
  );

  useLayoutEffect(() => {
    measure();
  }, [measure, ...deps]);
  useEffect(() => {
    const ro = new ResizeObserver(measure);
    if (barRef.current) ro.observe(barRef.current);
    if (listRef.current) ro.observe(listRef.current);
    window.addEventListener("resize", measure);
    if (document.fonts && document.fonts.ready)
      document.fonts.ready.then(measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      if (raf.current != null) cancelAnimationFrame(raf.current);
      raf.current = null;
    };
  }, [measure]);
}

function NavDropdown({ label, items }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [cur, setCur] = useState(0);
  const rootRef = useRef(null);
  const timer = useRef(null);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const activeIdx = items.findIndex(
    (i) => pathname === i.to || pathname.startsWith(i.to + "/"),
  );
  const active = activeIdx >= 0;
  const item = items[cur] || items[0];
  const openNow = () => {
    clearTimeout(timer.current);
    setCur(Math.max(activeIdx, 0));
    setOpen(true);
  };
  const closeSoon = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 140);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const b = btnRef.current,
        m = menuRef.current;
      if (!b || !m || !m.offsetParent) return;
      const br = b.getBoundingClientRect();
      const pr = m.offsetParent.getBoundingClientRect();
      let x =
        br.left -
        pr.left -
        m.offsetParent.clientLeft +
        br.width / 2 -
        m.offsetLeft;
      x = Math.max(24, Math.min(x, m.offsetWidth - 24));
      m.style.setProperty("--caret", `${Math.round(x)}px`);
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const down = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target))
        setOpen(false);
    };
    const key = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("keydown", key);
    };
  }, [open]);
  return (
    <div
      ref={rootRef}
      className={`snav-dd${open ? " is-open" : ""}`}
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
    >
      <button
        type="button"
        ref={btnRef}
        className={`snav-link${active ? " is-active" : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          setCur(Math.max(activeIdx, 0));
          setOpen((o) => (e.detail === 0 ? !o : true));
        }}
      >
        {label}
        <ChevronDown className="snav-chev" size={14} />
      </button>
      <div className="snav-menu" role="menu" ref={menuRef}>
        <div className="snav-mm-side">
          <div className="snav-mm-label">{label}</div>
          {items.map((it, i) => (
            <NavLink
              key={it.to}
              to={it.to}
              role="menuitem"
              className={`snav-mm-item${i === cur ? " is-hover" : ""}`}
              onMouseEnter={() => setCur(i)}
              onFocus={() => setCur(i)}
              onClick={() => setOpen(false)}
            >
              {it.label}
            </NavLink>
          ))}
        </div>
        <div className="snav-mm-body">
          <div className="snav-mm-label">Jelajahi</div>
          <NavLink
            to={item.to}
            className="snav-mm-title"
            onClick={() => setOpen(false)}
          >
            {item.label}
            <ArrowRight size={16} aria-hidden="true" />
          </NavLink>
          {item.desc && <p className="snav-mm-desc">{item.desc}</p>}
          {item.tags && item.tags.length > 0 && (
            <div className="snav-mm-tags">
              {item.tags.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          )}
        </div>
        <div className="snav-mm-img" aria-hidden="true">
          {item.img && (
            <img key={item.to} src={item.img} alt="" loading="lazy" />
          )}
        </div>
      </div>
    </div>
  );
}

function NavbarVisitor() {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [accOpen, setAccOpen] = useState(false);
  const navRef = useRef(null);
  const headerRef = useRef(null);
  const barRef = useRef(null);
  const listRef = useRef(null);
  const inkRef = useRef(null);
  useNavInk(barRef, listRef, inkRef, [pathname]);
  useEffect(() => {
    applyNavbarFont();
  }, []);
  const zonaAkademikItems = [
    {
      to: "/pemenang",
      label: "Pemenang",
      desc: "Daftar juara tiap kategori lomba, lengkap dengan judul karya yang dinilai.",
      tags: ["Juara", "Penghargaan"],
      img: imgPemenang,
    },
    {
      to: "/akademik/tur-virtual",
      label: "Tur Virtual",
      desc: "Keliling laboratorium, ruang kelas, dan bengkel praktik lewat foto 360°.",
      tags: ["Laboratorium", "Fasilitas"],
      img: imgTur,
    },
    {
      to: "/dosen",
      label: "Daftar Dosen",
      desc: "Profil dosen pengajar, gelar, dan mata kuliah yang diampu di Jurusan Elektro.",
      tags: ["Profil", "Bidang keahlian"],
      img: imgDosen,
    },
    {
      to: "/visitasi",
      label: "Visitasi",
      desc: "Jadwal dan panduan kunjungan sekolah atau instansi ke Jurusan Elektro.",
      tags: ["Jadwal", "Kunjungan"],
      img: imgVisitasi,
    },
];
   const closeMenu = () => {
     setIsOpen(false);
     setAccOpen(false);
   };
  useEffect(() => {
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsOpen(false);
        setAccOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const setVar = () => {
      document.documentElement.style.setProperty(
        "--navbar-h",
        `${el.offsetHeight}px`,
      );
    };
    setVar();
    const observer = new ResizeObserver(setVar);
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);
  return (
    <header
      ref={(node) => {
        navRef.current = node;
        headerRef.current = node;
      }}
      className="fixed left-0 top-0 z-50 w-full px-3 min-[350px]:px-5 md:px-8 lg:px-10 xl:px-12 2xl:px-16"
    >
      <div
        ref={barRef}
        className={`relative mx-auto mt-3 flex w-full max-w-[1700px] items-center justify-between rounded-2xl px-2.5 py-2.5 min-[350px]:mt-5 min-[350px]:px-4 min-[350px]:py-3 sm:mt-6 sm:px-6 sm:py-4 md:mt-7 md:px-8 2xl:mt-8 2xl:px-10 border border-slate-300 bg-white shadow-md shadow-slate-300/30`}
      >
        <NavLink
          to="/"
          onClick={closeMenu}
          className="flex items-center gap-2 min-[350px]:gap-3 sm:gap-4"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-xl min-[350px]:h-9 min-[350px]:w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 2xl:h-14 2xl:w-14">
            <SmartImage
              src={logo}
              alt="Singgah Logo"
              eager
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <h1
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: "700",
              }}
              className={`text-xs min-[350px]:text-sm sm:text-xl 2xl:text-2xl text-neutral-900`}
            >
              Singgah
            </h1>
          </div>
        </NavLink>
        <nav
          ref={listRef}
          className="hidden flex-1 items-center justify-start font-medium min-[950px]:flex min-[950px]:ml-4 min-[1024px]:ml-6 min-[1280px]:ml-8 min-[950px]:gap-4 min-[1024px]:gap-6 min-[1280px]:gap-8"
        >
          <style>{SNAV_CSS}</style>
          <NavLink
            to="/"
            end
            onMouseEnter={() => prefetchRouteFromLink("/")}
            className={({ isActive }) =>
              `snav-link${isActive ? " is-active" : ""}`
            }
          >
            Beranda
          </NavLink>
          <NavLink
            to="/karya"
            onMouseEnter={() => prefetchRouteFromLink("/karya")}
            className={({ isActive }) =>
              `snav-link${isActive ? " is-active" : ""}`
            }
          >
            Karya
          </NavLink>

          <NavDropdown label="Zona Akademik" items={zonaAkademikItems} />
          <NavLink
            to="/berita"
            onMouseEnter={() => prefetchRouteFromLink("/berita")}
            className={({ isActive }) =>
              `snav-link${isActive ? " is-active" : ""}`
            }
          >
            Berita
          </NavLink>
          <NavLink
            to="/about"
            onMouseEnter={() => prefetchRouteFromLink("/about")}
            className={({ isActive }) =>
              `snav-link${isActive ? " is-active" : ""}`
            }
          >
            Tentang
          </NavLink>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="snav-auth min-[950px]:flex">
            <NavLink to="/login" onClick={closeMenu} className="snav-login">
              Masuk
            </NavLink>
            <NavLink to="/register" onClick={closeMenu} className="snav-cta">
              Daftar
            </NavLink>
          </div>
<button
            onClick={() => setIsOpen(!isOpen)}
            className={`snav-burger min-[950px]:hidden${isOpen ? " is-open" : ""}`}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            style={{ color: "#1B2A4A" }}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
        <span ref={inkRef} className="snav-ink" aria-hidden="true" />
      </div>
      <div
        className={`snav-mobile${isOpen ? " is-open" : ""} min-[950px]:hidden`}
      >
        <div className="snav-mobile-inner">
          <div
            className={`mx-auto max-w-[420px] mt-2 rounded-[14px] border border-[var(--snav-bd)] bg-[var(--snav-bg)] shadow-[0_2px_6px_-2px_var(--snav-sh)]`}
          >
            <nav
              className="relative flex flex-col p-3"
              style={{ color: "#1f2937" }}
            >
              <NavLink
                to="/"
                end
                onClick={closeMenu}
                className={({ isActive }) =>
                  `snav-mlink${isActive ? " is-active" : ""}`
                }
              >
                <Home size={20} strokeWidth={1.75} />
                <span>Beranda</span>
              </NavLink>
              <NavLink
                to="/karya"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `snav-mlink${isActive ? " is-active" : ""}`
                }
              >
                <LayoutGrid size={20} strokeWidth={1.75} />
                <span>Karya</span>
              </NavLink>

              <button
                type="button"
                className="snav-mlink flex items-center"
                onClick={() => setAccOpen((o) => !o)}
                aria-expanded={accOpen}
              >
                <GraduationCap size={20} strokeWidth={1.75} />
                <span className="flex-1 text-left min-w-0">Zona Akademik</span>
                <ChevronDown
                  className={`snav-chev${accOpen ? " rotate-180" : ""}`}
                  size={16}
                  style={{ marginLeft: "auto" }}
                />
              </button>
              <div className={`snav-acc${accOpen ? " is-open" : ""}`}>
                <div>
                  {zonaAkademikItems.map((it) => (
                    <NavLink
                      key={it.to}
                      to={it.to}
                      onClick={closeMenu}
                      className={({ isActive }) =>
                        `snav-mlink-sub${isActive ? " is-active" : ""}`
                      }
                    >
                      {it.label}
                    </NavLink>
                  ))}
                </div>
              </div>
              <NavLink
                to="/berita"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `snav-mlink${isActive ? " is-active" : ""}`
                }
              >
                <Newspaper size={20} strokeWidth={1.75} />
                <span>Berita</span>
              </NavLink>
              <NavLink
                to="/about"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `snav-mlink${isActive ? " is-active" : ""}`
                }
              >
                <Info size={20} strokeWidth={1.75} />
                <span>Tentang</span>
              </NavLink>
              <div style={{ height: 1, background: "var(--snav-bd)", margin: "8px 0" }} />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <NavLink to="/login" onClick={closeMenu} className="snav-mbtn">
                  Masuk
                </NavLink>
                <NavLink to="/register" onClick={closeMenu} className="snav-mbtn snav-mbtn-primary">
                  Daftar
                </NavLink>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}

export default NavbarVisitor;
