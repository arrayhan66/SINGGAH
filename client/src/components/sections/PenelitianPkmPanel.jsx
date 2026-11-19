import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Plus } from "lucide-react";
import photoPenelitian from "../../assets/images/penelitian-pkm/penelitian.jpg";
import photoDiseminasi from "../../assets/images/penelitian-pkm/desiminasi.jpeg";
import photoPkm from "../../assets/images/penelitian-pkm/pkm.jpeg";
import photoBuletin from "../../assets/images/penelitian-pkm/bulletin.jpg";

const PANELS = [
  {
    no: "01",
    title: "Kegiatan Penelitian",
    summary: "Riset yang sedang berjalan",
    description:
      "Lihat topik penelitian yang sedang dikerjakan prodi lengkap dengan perkembangannya",
    button: "Lihat Kegiatan Penelitian",
    photo: photoPenelitian,
    fokus: "center 35%",
    tags: ["Ide", "Proses", "Hasil", "Perkembangan"],
    link: "/penelitian/kegiatan",
  },
  {
    no: "02",
    title: "Diseminasi",
    summary: "Manfaat yang nyata",
    description:
      "Hasil riset dibawa ke forum dan kegiatan terbuka supaya langsung bisa dipakai",
    button: "Lihat Diseminasi",
    photo: photoDiseminasi,
    fokus: "center 40%",
    tags: ["Berbagi", "Forum", "Manfaat", "Jangkauan"],
    link: "/pkm/diseminasi",
  },
  {
    no: "03",
    title: "Kegiatan PkM",
    summary: "Dekat dengan warga",
    description:
      "Pengabdian yang menjawab kebutuhan masyarakat dan dikerjakan bersama tim prodi",
    button: "Lihat Kegiatan PkM",
    photo: photoPkm,
    fokus: "center 40%",
    tags: ["Peduli", "Bersama", "Lapangan", "Dampak"],
    link: "/pkm/kegiatan",
  },
  {
    no: "04",
    title: "Buletin",
    summary: "Arsip yang terbuka",
    description:
      "Rangkuman riset prodi yang terbit rutin dan cocok dibaca sebelum menelusuri penelitian lengkap",
    button: "Lihat Buletin",
    photo: photoBuletin,
    fokus: "center 30%",
    tags: ["Terbit", "Rutin", "Ringkas", "Arsip"],
    link: "/penelitian/buletin",
  },
];

const Panel = memo(function Panel({
  panel,
  index,
  dataPos,
  onActivate,
  onKeyDown,
  setRef,
}) {
  const isActive = dataPos === "active";
  const isExternal = /^https?:\/\//.test(panel.link);
  const Cta = isExternal ? "a" : Link;
  const ctaProps = isExternal ? { href: panel.link } : { to: panel.link };

  return (
    <div className="pp-panel" data-pos={dataPos} style={{ "--i": index }}>
      <div className="pp-content">
        <img
          className="pp-img"
          src={panel.photo}
          alt=""
          style={{ objectPosition: panel.fokus }}
          decoding="async"
          loading="eager"
          draggable={false}
        />
        <div className="pp-text">
          <h3 className="pp-active-title">{panel.title}</h3>
          <p className="pp-active-summary">{panel.summary}</p>
          <p className="pp-active-desc">{panel.description}</p>
          <span className="pp-cta-wrap">
            <Cta className="pp-cta" {...ctaProps}>
              {panel.button}
              <span className="pp-cta-ikon">
                <ArrowRight size={14} aria-hidden="true" />
                <ArrowRight size={14} aria-hidden="true" />
              </span>
            </Cta>
          </span>
        </div>
      </div>
      <div className="pp-scrim" aria-hidden="true" />
      <div className="pp-cover" aria-hidden="true" />
      <div className="pp-bottomshade" aria-hidden="true" />
      <span className="pp-edge" aria-hidden="true" />
      <span className="pp-num">{panel.no}</span>
      <ul className="pp-tags" aria-label="Kata kunci">
        {panel.tags.slice().reverse().map((tag, i) => (
          <li className="pp-tag-wrap" key={`${panel.no}-${tag}`} style={{ "--t": i }}>
            <span className="pp-tag">{tag}</span>
          </li>
        ))}
      </ul>
      <span className="pp-vtitle">{panel.title}</span>
      <span className="pp-plus" aria-hidden="true">
        <span aria-hidden="true" className="pp-plus-fill" />
        <Plus size={16} className="pp-plusicon" aria-hidden="true" />
      </span>
      <button
        type="button"
        className="pp-hit"
        ref={(el) => setRef(index, el)}
        aria-expanded={isActive}
        aria-label={panel.title}
        tabIndex={isActive ? -1 : 0}
        onClick={() => onActivate(index)}
        onKeyDown={(e) => onKeyDown(e, index)}
      />
    </div>
  );
});

export default function PenelitianPkmPanel() {
  const [active, setActive] = useState(0);
  const refs = useRef([]);

  const setRef = useCallback((idx, el) => {
    refs.current[idx] = el;
  }, []);

  const activatePanel = useCallback((idx) => {
    setActive((current) => (current === idx ? current : idx));
  }, []);

  const rowRef = useRef(null);
  const hoverTimerRef = useRef(null);

  const handlePointerMove = useCallback(
    (e) => {
      const row = rowRef.current;
      if (!row) return;
      const rect = row.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const openW = rect.width - 312;
      if (openW <= 0) return;
      let cursor = 0;
      let idx = PANELS.length - 1;
      for (let i = 0; i < PANELS.length; i += 1) {
        const w = i === active ? openW + 8 : 104;
        if (x < cursor + w) {
          idx = i;
          break;
        }
        cursor += w;
      }
      if (idx === active) return;
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = setTimeout(() => {
        setActive(idx);
        hoverTimerRef.current = null;
      }, 70);
    },
    [active],
  );

  const handlePointerLeave = useCallback(() => {}, []);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const handleKey = useCallback((e, idx) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = (idx + 1) % PANELS.length;
      refs.current[next]?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = (idx - 1 + PANELS.length) % PANELS.length;
      refs.current[prev]?.focus();
    }
  }, []);

  return (
    <section className="pp-section">
      <style>{`
        .pp-section { padding-top: 0; padding-bottom: 96px; }
        @media (max-width: 767px) { .pp-section { padding-top: 0; padding-bottom: 64px; } }
        .pp-header { max-width: 640px; }
        .pp-tag { display: inline-block; background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 999px; font-size: 13px; font-weight: 500; color: #334155; padding: 4px 12px; margin: 0 0 12px 0; }
        .pp-title-main { font-family: var(--font-headline); font-size: clamp(36px, 4.4vw, 56px); font-weight: 500; line-height: 1.02; letter-spacing: -0.02em; color: #0f172a; max-width: 620px; margin: 0; padding: 0; }
        .pp-sub { color: #64748b; font-size: 15px; font-weight: 400; line-height: 1.6; letter-spacing: 0; max-width: 640px; margin: 12px 0 0 0; }
        .pp-row { position: relative; height: 520px; container-type: inline-size; display: block; margin: 32px 0 0 0; }
        @media (max-width: 767px) { .pp-row { margin-top: 24px; } }
        .pp-panel { position: absolute; top: 0; left: 0; width: calc(100cqw - 312px); height: 100%; background: #0f172a; overflow: hidden; contain: layout paint; isolation: isolate; backface-visibility: hidden; transition: transform 750ms cubic-bezier(0.4, 0, 0.2, 1), clip-path 750ms cubic-bezier(0.4, 0, 0.2, 1); }
        .pp-panel[data-pos="before"], .pp-panel[data-pos="active"] { transform: translate3d(calc(var(--i) * 104px), 0, 0); }
        .pp-panel[data-pos="after"] { transform: translate3d(calc(var(--i) * 104px + 100cqw - 408px), 0, 0); }
        .pp-panel[data-pos="active"] { clip-path: inset(0 0 0 0 round 20px); }
        .pp-panel[data-pos="before"], .pp-panel[data-pos="after"] { clip-path: inset(0 calc(100cqw - 408px) 0 0 round 20px); }
        .pp-content { position: absolute; top: 0; bottom: 0; left: 0; width: calc(100cqw - 312px); min-width: calc(100cqw - 312px); }
.pp-img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; transform: translate3d(0, 0, 0); transition: transform 750ms cubic-bezier(0.4, 0, 0.2, 1); }
        .pp-panel:not([data-pos="active"]) .pp-img { transform: translate3d(calc((100cqw - 408px) / -2), 0, 0); }
        .pp-scrim { position: absolute; inset: 0; pointer-events: none; z-index: 1; background: linear-gradient(to bottom, rgba(15,23,42,0.45) 0%, rgba(15,23,42,0) 22%), linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.55) 30%, rgba(15,23,42,0) 62%); opacity: 0; transition: opacity 750ms cubic-bezier(0.4, 0, 0.2, 1); }
        .pp-panel[data-pos="active"] .pp-scrim { opacity: 1; }
        .pp-cover { position: absolute; top: 0; left: 0; width: calc(100cqw - 312px); height: 100%; object-fit: cover; pointer-events: none; z-index: 2; background: linear-gradient(to bottom, rgba(15,23,42,0.80) 0%, rgba(15,23,42,0.88) 100%); opacity: 1; transition: opacity 850ms cubic-bezier(0.45, 0.05, 0.15, 1), transform 850ms cubic-bezier(0.45, 0.05, 0.15, 1); }
        .pp-panel[data-pos="active"] .pp-cover { opacity: 0; }
        .pp-panel:not([data-pos="active"]):hover .pp-cover { opacity: 0.6; }
        .pp-bottomshade { position: absolute; inset: 0; pointer-events: none; z-index: 4; opacity: 0; transition: opacity 850ms cubic-bezier(0.45, 0.05, 0.15, 1); background: radial-gradient(ellipse 75% 90% at 0% 100%, rgba(8,15,35,0.92) 0%, rgba(8,15,35,0.78) 30%, rgba(8,15,35,0.38) 60%, rgba(8,15,35,0) 100%); }
        .pp-panel[data-pos="active"] .pp-bottomshade { opacity: 1; }
        .pp-edge { position: absolute; inset: 0; pointer-events: none; z-index: 3; border-radius: 20px; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.14); }
        .pp-num { position: absolute; top: 20px; left: 20px; display: block; color: rgba(255,255,255,0.82); font-size: 13px; font-weight: 500; letter-spacing: 0.14em; font-variant-numeric: tabular-nums; line-height: 1; font-family: inherit; text-shadow: 0 1px 4px rgba(0,0,0,0.45); z-index: 4; transform: translate3d(0, 0, 0); transition: opacity 450ms ease-out, transform 850ms cubic-bezier(0.45, 0.05, 0.15, 1); }
        .pp-num::before { content: ""; display: block; position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); width: 1px; height: 54px; margin: 0 auto 10px; background: rgba(255,255,255,0.85); box-shadow: 0 1px 3px rgba(0,0,0,0.45); opacity: 0; transition: opacity 850ms cubic-bezier(0.45, 0.05, 0.15, 1); }
        .pp-panel[data-pos="before"] .pp-num::before, .pp-panel[data-pos="after"] .pp-num::before { opacity: 1; transition: opacity 850ms cubic-bezier(0.45, 0.05, 0.15, 1); }
        .pp-num::after { content: none; display: none; }
        .pp-panel:not([data-pos="active"]) .pp-num { display: flex; flex-direction: column; align-items: center; transform: translate3d(calc(28px - 50%), 44px, 0); transition: opacity 450ms ease-out, transform 850ms cubic-bezier(0.45, 0.05, 0.15, 1); }

        .pp-tags { position: absolute; top: 20px; right: 20px; z-index: 6; display: flex; flex-wrap: wrap; flex-direction: row-reverse; justify-content: flex-end; gap: 6px; max-width: calc(100% - 120px); margin: 0; padding: 0; list-style: none; pointer-events: none; }
        .pp-panel[data-pos="before"] .pp-tags, .pp-panel[data-pos="after"] .pp-tags { pointer-events: none; }
        .pp-panel[data-pos="active"] .pp-tag { pointer-events: auto; }
        .pp-tag-wrap { opacity: 0; transform: translate3d(14px, 0, 0); pointer-events: none; transition: opacity 250ms ease; }
        .pp-panel[data-pos="before"] .pp-tag-wrap, .pp-panel[data-pos="after"] .pp-tag-wrap { opacity: 0; transform: translate3d(14px, 0, 0); pointer-events: none; transition: opacity 250ms ease; }
        .pp-panel[data-pos="active"] .pp-tag-wrap { opacity: 1; transform: translate3d(0, 0, 0); pointer-events: auto; transition: opacity 250ms ease 200ms; }
        .pp-tag { display: inline-flex; align-items: center; height: 26px; padding: 0 11px; border-radius: 4px; background: rgba(15,23,42,0.18); border: 1px solid rgba(255,255,255,0.55); color: #ffffff; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; line-height: 1; white-space: nowrap; text-shadow: 0 1px 4px rgba(0,0,0,0.35); font-family: inherit; }
        .pp-panel[data-pos="active"] .pp-tag:hover { background-color: #ffffff; color: #0f172a; border-color: #ffffff; text-shadow: none; transform: translate3d(0, -2px, 0); transition: background-color 350ms cubic-bezier(0.22, 1, 0.36, 1), color 350ms cubic-bezier(0.22, 1, 0.36, 1), border-color 350ms cubic-bezier(0.22, 1, 0.36, 1), transform 350ms cubic-bezier(0.22, 1, 0.36, 1); }
        .pp-section-tag { display: inline-block; background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 999px; font-size: 13px; font-weight: 500; color: #334155; padding: 4px 12px; margin-bottom: 12px; }
        .pp-vtitle { position: absolute; left: 48px; bottom: 76px; transform: translateX(-50%) rotate(180deg); writing-mode: vertical-rl; color: #fff; font-size: 19px; font-family: var(--font-headline); font-weight: 500; letter-spacing: -0.02em; white-space: nowrap; z-index: 5; opacity: 1; transition: opacity 200ms ease; }
        .pp-panel[data-pos="active"] .pp-vtitle { opacity: 0; transition: opacity 200ms ease; }
        .pp-plus { position: absolute; left: 48px; bottom: 20px; transform: translateX(-50%); width: 36px; height: 36px; border-radius: 999px; overflow: hidden; isolation: isolate; border: 1px solid rgba(255,255,255,0.7); background: transparent; color: #ffffff; display: flex; align-items: center; justify-content: center; z-index: 6; opacity: 1; transition: opacity 450ms ease-out; }
        .pp-plus-fill { position: absolute; inset: 0; border-radius: 50%; background: #ffffff; transform: translateY(100%); pointer-events: none; z-index: 0; transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1); }
        .pp-panel[data-pos="active"] .pp-plus { opacity: 0; pointer-events: none; z-index: 11; transition: opacity 850ms cubic-bezier(0.45, 0.05, 0.15, 1); }
        .pp-panel:not([data-pos="active"]):hover .pp-plus, .pp-panel:not([data-pos="active"]):focus-within .pp-plus { border-color: #ffffff; }
          .pp-panel:hover .pp-plus-fill { transform: translateY(0); }
        .pp-panel:not([data-pos="active"]) .pp-plus:active { transform: translateX(-50%) scale(0.95); transition: transform 120ms cubic-bezier(0.22, 1, 0.36, 1); }
        .pp-plusicon { position: relative; z-index: 1; transition: color 280ms cubic-bezier(0.22, 1, 0.36, 1), transform 280ms cubic-bezier(0.22, 1, 0.36, 1); }
        .pp-panel:hover .pp-plusicon { color: #0f172a; transform: rotate(90deg); }
        .pp-text { position: absolute; left: 28px; bottom: 28px; width: min(440px, calc(100cqw - 312px - 56px)); z-index: 9; pointer-events: none; }
        .pp-active-title { font-family: var(--font-headline); font-size: clamp(32px, 3.2vw, 44px); font-weight: 500; line-height: 1.12; letter-spacing: -0.02em; color: #ffffff; margin: 0; opacity: 0; transform: translate3d(0, 14px, 0); pointer-events: none; transition: opacity 250ms ease; }
        .pp-panel[data-pos="active"] .pp-active-title { opacity: 1; transform: translate3d(0, 0, 0); text-shadow: 0 1px 6px rgba(0,0,0,0.6); transition: opacity 250ms ease 200ms; }
        .pp-active-summary { font-size: 14px; font-weight: 600; line-height: 1.4; letter-spacing: 0; color: #fff; opacity: 0; transform: translate3d(0, 14px, 0); margin-top: 12px; pointer-events: none; transition: opacity 250ms ease; }
        .pp-panel[data-pos="active"] .pp-active-summary { opacity: 0.88; transform: translate3d(0, 0, 0); text-shadow: 0 1px 6px rgba(0,0,0,0.6); transition: opacity 250ms ease 200ms; }
        .pp-active-desc { font-size: 15px; font-weight: 500; line-height: 1.55; letter-spacing: 0; color: #fff; opacity: 0; transform: translate3d(0, 14px, 0); margin-top: 12px; max-width: 440px; pointer-events: none; transition: opacity 250ms ease; }
        .pp-panel[data-pos="active"] .pp-active-desc { opacity: 0.92; transform: translate3d(0, 0, 0); text-shadow: 0 1px 6px rgba(0,0,0,0.6); transition: opacity 250ms ease 200ms; }
        .pp-cta-wrap { display: inline-block; opacity: 0; transform: translate3d(0, 14px, 0); pointer-events: none; transition: opacity 250ms ease; }
        .pp-panel[data-pos="active"] .pp-cta-wrap { opacity: 1; transform: translate3d(0, 0, 0); pointer-events: auto; transition: opacity 250ms ease 200ms; }
        .pp-cta { display: inline-flex; align-items: center; gap: 0; height: 44px; padding: 0 8px 0 20px; border-radius: 999px; background: #ffffff; color: #0f172a; font-size: 14px; font-weight: 600; text-decoration: none; margin-top: 22px; border: 1px solid #ffffff; pointer-events: auto; position: relative; z-index: 8; box-shadow: 0 4px 14px -6px rgba(15,23,42,0.35); transition: background-color 400ms cubic-bezier(0.22, 1, 0.36, 1), color 400ms cubic-bezier(0.22, 1, 0.36, 1), border-color 400ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 450ms cubic-bezier(0.22, 1, 0.36, 1), transform 400ms cubic-bezier(0.22, 1, 0.36, 1); }
        .pp-cta:hover, .pp-cta:focus-visible { background-color: #0f172a; color: #ffffff; border-color: #ffffff; transform: translate3d(0, -2px, 0); box-shadow: 0 16px 30px -12px rgba(15,23,42,0.65); }
        .pp-cta:active { transform: translate3d(0, 0, 0); transition: transform 120ms cubic-bezier(0.22, 1, 0.36, 1); }
        .pp-cta:focus-visible { outline: 2px solid #ffffff; outline-offset: 3px; box-shadow: 0 0 0 5px #0f172a; }
        .pp-cta-ikon { width: 28px; height: 28px; border-radius: 999px; background: #0f172a; color: #ffffff; overflow: hidden; position: relative; flex-shrink: 0; margin-left: 12px; display: inline-flex; align-items: center; justify-content: center; transition: background-color 400ms cubic-bezier(0.22, 1, 0.36, 1), color 400ms cubic-bezier(0.22, 1, 0.36, 1); }
        .pp-cta-ikon svg { width: 14px; height: 14px; color: currentColor; transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1); }
        .pp-cta-ikon svg:first-child { transform: translate3d(0, 0, 0); }
        .pp-cta-ikon svg:last-child { position: absolute; transform: translate3d(-28px, 0, 0); }
        .pp-cta:hover .pp-cta-ikon, .pp-cta:focus-visible .pp-cta-ikon { background-color: #ffffff; color: #0f172a; }
        .pp-cta:hover .pp-cta-ikon svg:first-child, .pp-cta:focus-visible .pp-cta-ikon svg:first-child { transform: translate3d(28px, 0, 0); }
        .pp-cta:hover .pp-cta-ikon svg:last-child, .pp-cta:focus-visible .pp-cta-ikon svg:last-child { transform: translate3d(0, 0, 0); }
        .pp-panel[data-pos="active"] { pointer-events: none; }
        .pp-panel:not([data-pos="active"]) .pp-hit { pointer-events: auto; z-index: 10; }
        .pp-panel[data-pos="active"] .pp-hit { pointer-events: auto; }
        .pp-panel[data-pos="before"] .pp-plus, .pp-panel[data-pos="after"] .pp-plus, .pp-panel[data-pos="before"] .pp-num, .pp-panel[data-pos="after"] .pp-num, .pp-panel[data-pos="before"] .pp-vtitle, .pp-panel[data-pos="after"] .pp-vtitle { pointer-events: none; }
        .pp-panel:not([data-pos="active"]) .pp-cta-wrap, .pp-panel:not([data-pos="active"]) .pp-cta { pointer-events: none; }
        .pp-hit { position: absolute; inset: 0; background: transparent; border: 0; padding: 0; cursor: pointer; z-index: 7; }
        .pp-hit:focus-visible { outline: 2px solid #ffffff; outline-offset: -4px; box-shadow: inset 0 0 0 4px #0f172a; }
        @media (max-width: 899px) {
          .pp-row { display: grid; grid-template-columns: 1fr; grid-template-rows: var(--pp-rows); gap: 8px; height: auto; }
          .pp-panel { position: relative; width: 100%; transform: none; clip-path: none; border-radius: 20px; overflow: hidden; min-height: 0; }
          .pp-content { position: static; width: 100%; min-width: 0; }
          .pp-img { transform: none; }
          .pp-text { width: calc(100% - 40px); left: 20px; bottom: 20px; }
          .pp-active-title { font-size: 30px; }
          .pp-vtitle { writing-mode: horizontal-tb; transform: none; left: 20px; right: auto; top: 50%; bottom: auto; transform: translateY(-50%); }
          .pp-plus { left: auto; right: 20px; transform: none; top: 50%; bottom: auto; transform: translateY(-50%); }
          .pp-tags { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pp-panel, .pp-img, .pp-scrim, .pp-cover, .pp-bottomshade, .pp-num, .pp-vtitle, .pp-plus, .pp-plusicon, .pp-text *, .pp-tag, .pp-tag-wrap, .pp-cta-wrap, .pp-cta, .pp-cta-ikon, .pp-cta-ikon svg { transition: none !important; transform: none !important; }
          .pp-plus-fill { transition: none !important; }
        }
      `}</style>
      <div className="px-3 min-[350px]:px-5 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="mx-auto w-full max-w-[1700px]">
          <header className="pp-header">
            <span className="pp-section-tag">Penelitian & PkM</span>
            <h2 className="pp-title-main">Riset yang sampai ke <span style={{ color: "var(--color-accent-primary)" }}>masyarakat</span></h2>
            <p className="pp-sub">
              Dari penelitian yang sedang berjalan sampai pengabdian di tengah masyarakat, semua kegiatan riset bisa Anda ikuti di sini
            </p>
          </header>
          <div
            className="pp-row"
            ref={rowRef}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
          >
            {PANELS.map((panel, idx) => {
              const dataPos =
                idx === active ? "active" : idx < active ? "before" : "after";
              return (
                <Panel
                  key={panel.no}
                  panel={panel}
                  index={idx}
                  dataPos={dataPos}
                  onActivate={activatePanel}
                  onKeyDown={handleKey}
                  setRef={setRef}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}