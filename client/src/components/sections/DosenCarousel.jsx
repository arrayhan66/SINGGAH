import { useCallback, useEffect, useRef, useState } from "react";
import { DOSEN } from "./dosenData";
import "./DosenCarousel.css";

export default function DosenCarousel() {
  const trackRef = useRef(null);
  const [edges, setEdges] = useState({ prev: true, next: false });
  const inisial = (nama) => {
    const kata = nama.replace(/^(Dr\.|Prof\.)\s*/, "").trim().split(/\s+/);
    return (kata[0][0] + (kata[1]?.[0] || "")).toUpperCase();
  };
  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setEdges({
      prev: el.scrollLeft <= 1,
      next: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1,
    });
  }, []);
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(updateEdges);
    });
    const observer = new ResizeObserver(updateEdges);
    observer.observe(el);
    const first = el.firstElementChild;
    if (first) observer.observe(first);
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      observer.disconnect();
    };
  }, [updateEdges]);
  const geser = (arah) => {
    const el = trackRef.current;
    if (!el) return;
    const kartu = el.querySelector("li");
    const gap = kartu ? parseFloat(getComputedStyle(el).columnGap) || 0 : 24;
    const step = kartu ? kartu.getBoundingClientRect().width + gap : 304;
    el.scrollBy({ left: arah * step, behavior: "smooth" });
  };
  const dragRef = useRef({ isDown: false, startX: 0, scrollLeft: 0, moved: false });
  const onPointerDown = (e) => {
    if (e.pointerType !== "mouse") return;
    const el = trackRef.current;
    if (!el) return;
    dragRef.current.isDown = true;
    dragRef.current.startX = e.clientX;
    dragRef.current.scrollLeft = el.scrollLeft;
    dragRef.current.moved = false;
    try { el.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    el.classList.add("is-dragging");
  };
  const onPointerMove = (e) => {
    const el = trackRef.current;
    const d = dragRef.current;
    if (!d.isDown || !el) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 5) d.moved = true;
    el.scrollLeft = d.scrollLeft - dx;
  };
  const endDrag = (e) => {
    const el = trackRef.current;
    const d = dragRef.current;
    if (!d.isDown) return;
    d.isDown = false;
    if (el) {
      try { el.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
      el.classList.remove("is-dragging");
    }
  };
  const onClickCapture = (e) => {
    if (dragRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      dragRef.current.moved = false;
    }
  };
  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); geser(1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); geser(-1); }
  };
  return (
    <section className="dc" aria-labelledby="dc-title">
      <div className="px-3 min-[350px]:px-5 md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="dc-wrap">
        <header className="dc-header">
          <div className="dc-heading">
            <span className="dc-tag">Dosen &amp; Peneliti</span>
            <h2 id="dc-title" className="dc-title">Kenali dosen<br />dan <span className="dc-accent">peneliti</span></h2>
          </div>
          <p className="dsn-head-desc">Setiap bidang punya orang-orang di baliknya, geser dan kenali satu per satu.</p>
          <div className="dc-arrows">
            <button type="button" aria-label="Sebelumnya" onClick={() => geser(-1)} disabled={edges.prev}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg></button>
            <button type="button" aria-label="Berikutnya" onClick={() => geser(1)} disabled={edges.next}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg></button>
          </div>
        </header>
        <ul className="dc-track" ref={trackRef} onScroll={updateEdges} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag} onPointerLeave={endDrag} onClickCapture={onClickCapture} onKeyDown={onKeyDown} tabIndex={0} aria-label="Daftar dosen">
          {DOSEN.map((d) => (
            <li key={d.id} className="dc-card">
              {d.foto ? <img className="dc-img" src={d.foto} alt="" loading="lazy" draggable={false} /> : <span className="dc-initials" aria-hidden="true">{inisial(d.nama)}</span>}
              <p className="dc-group">{d.kelompok}</p>
              <div className="dc-body">
                <p className="dc-num">{d.angka}</p>
                <p className="dc-cap">{d.keteranganAngka}</p>
                <p className="dc-quote">“{d.fokus}”</p>
                <div className="dc-foot">
                  <div>
                    <p className="dc-name">{d.nama}</p>
                    <p className="dc-role">{d.jabatan}</p>
                  </div>
                  <a className="dc-go" href={d.profilUrl} aria-label={`Profil ${d.nama}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul></div></div></section>
    );
}
