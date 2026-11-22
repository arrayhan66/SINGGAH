import { useEffect, useRef, useState } from "react";
import { PageFlip } from "page-flip";
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import pdfUrl from "../assets/pdf-files/bulletin-terbaru.pdf?url";
import "./BulletinBook.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

const MIN_W = 260;
const MAX_W = 2400;
const TARGET_W = 1100;
const ZOOM_MIN = 1;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.25;
const IS_DEV = import.meta.env.DEV;

async function probe(url) {
  try {
    const res = await fetch(url, { headers: { Range: "bytes=0-1023" } });
    const type = res.headers.get("content-type") || "?";
    let head = "";
    if (res.body) {
      const reader = res.body.getReader();
      const { value } = await reader.read();
      head = new TextDecoder().decode((value || new Uint8Array()).slice(0, 8));
      reader.cancel();
    }
    return { ok: res.ok, status: res.status, type, head, err: "" };
  } catch (e) {
    return { ok: false, status: 0, type: "", head: "", err: String((e && e.message) || e) };
  }
}

function Icon({ children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export default function BulletinBook() {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const hostRef = useRef(null);
  const apiRef = useRef(null);
  const zoomRef = useRef(1);
  const syncEdgeRef = useRef(() => {});

  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [total, setTotal] = useState(0);
  const [pageInput, setPageInput] = useState("1");
  const [zoom, setZoom] = useState(1);
  const [isFs, setIsFs] = useState(false);
  const [edge, setEdge] = useState("start");
  const [curPage, setCurPage] = useState(1);

  useEffect(() => {
    let dead = false;
    let task = null;
    let pdf = null;
    let pf = null;
    let mount = null;
    let ro = null;
    let raf = 0;
    let ratio = 0.7;
    let busy = false;
    let queue = [];
    const urls = [];
    const imgs = [];
    const tried = new Set();

    const applyLayout = () => {
      const stage = stageRef.current;
      const host = hostRef.current;
      if (!stage || !host) return;
      const cs = getComputedStyle(stage);
      const inner =
        stage.clientWidth - parseFloat(cs.paddingLeft || "0") - parseFloat(cs.paddingRight || "0");
      const portrait = inner * zoomRef.current < MIN_W * 2;
      host.style.setProperty("--bk-ar", String(portrait ? ratio : ratio * 2));
      host.classList.toggle("bk-portrait", portrait);
    };

    const relayout = () => {
      applyLayout();
      try {
        if (pf) pf.update();
      } catch {
        /* abaikan */
      }
      window.dispatchEvent(new Event("resize"));
      syncEdgeRef.current();
    };

    const renderPage = async (n) => {
      const p = await pdf.getPage(n);
      const base = p.getViewport({ scale: 1 });
      const scale = Math.min(2.5, Math.max(1, TARGET_W / base.width));
      const vp = p.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(vp.width);
      canvas.height = Math.floor(vp.height);
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await p.render({ canvasContext: ctx, canvas, viewport: vp }).promise;
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
      p.cleanup();
      canvas.width = 0;
      canvas.height = 0;
      if (!blob) throw new Error("toBlob menghasilkan null");
      if (dead) return;
      const url = URL.createObjectURL(blob);
      urls.push(url);
      const img = imgs[n - 1];
      img.alt = `Halaman ${n}`;
      img.src = url;
      img.parentElement.classList.add("is-ready");
    };

    const pump = async () => {
      if (busy) return;
      busy = true;
      while (!dead && queue.length) {
        const n = queue.shift();
        if (tried.has(n)) continue;
        tried.add(n);
        try {
          await renderPage(n);
        } catch (e) {
          console.error("Gagal render halaman", n, e);
        }
      }
      busy = false;
    };

    const want = (idx) => {
      const list = [];
      for (let d = 0; d <= 3; d++) {
        const around = d === 0 ? [idx] : [idx + d, idx - d];
        for (const i of around) {
          const n = i + 1;
          if (n >= 1 && n <= pdf.numPages && !tried.has(n) && !list.includes(n)) list.push(n);
        }
      }
      queue = list;
      pump();
    };

    const buildPages = (count) => {
      const els = [];
      for (let i = 0; i < count; i++) {
        const el = document.createElement("div");
        el.className = "bk-page " + (i % 2 === 1 ? "bk-left" : "bk-right");
        if (i === 0 || i === count - 1) el.dataset.density = "hard";
        const img = document.createElement("img");
        img.alt = "";
        img.draggable = false;
        img.decoding = "async";
        const ph = document.createElement("span");
        ph.className = "bk-ph";
        ph.textContent = `Memuat halaman ${i + 1}`;
        el.append(img, ph);
        imgs.push(img);
        els.push(el);
      }
      return els;
    };

    (async () => {
      try {
        await Promise.all([probe(workerUrl), probe(pdfUrl)]);
        if (dead) return;

        task = pdfjsLib.getDocument({ url: pdfUrl });
        pdf = await task.promise;
        if (dead) return;

        const first = await pdf.getPage(1);
        const vp = first.getViewport({ scale: 1 });
        ratio = vp.width / vp.height;
        first.cleanup();
        if (dead) return;

        applyLayout();
        mount = document.createElement("div");
        mount.className = "bk-mount";
        hostRef.current.appendChild(mount);

        const pages = buildPages(pdf.numPages);
        pf = new PageFlip(mount, {
          width: 400,
          height: Math.round(400 / ratio),
          size: "stretch",
          minWidth: MIN_W,
          maxWidth: MAX_W,
          minHeight: Math.round(MIN_W / ratio),
          maxHeight: Math.round(MAX_W / ratio),
          showCover: true,
          usePortrait: true,
          drawShadow: true,
          maxShadowOpacity: 0.5,
          flippingTime: 800,
          mobileScrollSupport: true,
          autoSize: true,
        });
        pf.loadFromHTML(pages);
        try {
          pf.update();
        } catch {
          /* abaikan */
        }
        const syncEdge = () => {
          if (dead || !pf) return;
          const idx = (() => {
            try {
              return pf.getCurrentPageIndex();
            } catch {
              return 0;
            }
          })();
          const last = pdf.numPages - 1;
          setEdge(idx <= 0 ? "start" : idx >= last ? "end" : "mid");
          document.querySelectorAll(".bk-host").forEach(function(h){ h.style.setProperty("--bk-prog", String(last > 0 ? Math.min(1, Math.max(0, idx / last)) : 0)); });
        };
        syncEdgeRef.current = syncEdge;
        pf.on("flip", (e) => {
          setPageInput(String(e.data + 1));
          setCurPage(e.data + 1);
          want(e.data);
          syncEdge();
        });
        pf.on("changeState", syncEdge);
        pf.on("changeOrientation", syncEdge);
        syncEdge();

        apiRef.current = {
          next: () => pf.flipNext(),
          prev: () => pf.flipPrev(),
          go: (n) => pf.flip(n - 1),
          relayout,
        };

        setTotal(pdf.numPages);
        setStatus("ready");
        want(0);

        ro = new ResizeObserver(() => {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(relayout);
        });
        ro.observe(stageRef.current);
      } catch (e) {
        if (dead) return;
        const msg = String((e && e.message) || e);
        setErrorMsg(msg);
        setStatus("error");
        console.error("BulletinBook gagal:", e);
      }
    })();

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      try {
        if (task) task.destroy();
      } catch {
        /* abaikan */
      }
      try {
        if (pf) pf.destroy();
      } catch {
        /* abaikan */
      }
      if (mount && mount.parentNode) mount.remove();
      urls.forEach((u) => URL.revokeObjectURL(u));
      apiRef.current = null;
    };
  }, []);

  useEffect(() => {
    zoomRef.current = zoom;
    if (apiRef.current) apiRef.current.relayout();
  }, [zoom]);

  useEffect(() => {
    const onChange = () => setIsFs(document.fullscreenElement === rootRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const goTo = () => {
    const n = Math.min(Math.max(parseInt(pageInput, 10) || 1, 1), total || 1);
    setPageInput(String(n));
    if (apiRef.current) apiRef.current.go(n);
  };

  const toggleFs = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (rootRef.current && rootRef.current.requestFullscreen) rootRef.current.requestFullscreen();
  };

  const onKey = (e) => {
    if (!apiRef.current) return;
    if (e.key === "ArrowRight") apiRef.current.next();
    if (e.key === "ArrowLeft") apiRef.current.prev();
  };

  const atStart = edge === "start";
  const atEnd = edge === "end";
  const chip =
    status !== "ready"
      ? ""
      : atStart
        ? "Sampul depan"
        : atEnd
          ? "Sampul belakang"
          : `Halaman ${curPage}–${Math.min(curPage + 1, total)} dari ${total}`;

  return (
    <div ref={rootRef} className={`bk${isFs ? " is-fs" : ""}`}>
      <div className="bk-player">
        <div className="bk-top">
          <span className="bk-title">Buletin terbaru</span>
          {chip && <span className="bk-chip">{chip}</span>}
        </div>

        <div
          ref={stageRef}
          className="bk-stage"
          style={{ "--bk-zoom": zoom }}
          tabIndex={0}
          onKeyDown={onKey}
          aria-label="Buku buletin interaktif"
        >
          <div ref={hostRef} className="bk-host" data-edge={edge} />
          {status === "ready" && (
            <>
              <button
                type="button"
                className="bk-nav bk-nav-prev"
                aria-label="Halaman sebelumnya"
                disabled={atStart}
                onClick={() => apiRef.current && apiRef.current.prev()}
              >
                <Icon>
                  <path d="M15 18l-6-6 6-6" />
                </Icon>
              </button>
              <button
                type="button"
                className="bk-nav bk-nav-next"
                aria-label="Halaman berikutnya"
                disabled={atEnd}
                onClick={() => apiRef.current && apiRef.current.next()}
              >
                <Icon>
                  <path d="M9 18l-6-6-6-6" />
                </Icon>
              </button>
            </>
          )}
          {status === "loading" && (
            <div className="bk-overlay" role="status">
              Memuat buletin…
            </div>
          )}
          {status === "error" && (
            <div className="bk-error" role="alert">
              <strong>Buletin belum dapat dimuat</strong>
              <p>{IS_DEV ? errorMsg : "Silakan unduh PDF-nya langsung."}</p>
              <a className="bk-btn" href={pdfUrl} download>
                Unduh E-Book
              </a>
            </div>
          )}
        </div>

        {status !== "error" && (
          <div className="bk-controls">
            {status === "ready" && (
              <div className="bk-toolbar" role="toolbar" aria-label="Kontrol buku">
                <div className="bk-zoomgroup">
                  <button
                    type="button"
                    className="bk-tbtn"
                    aria-label="Perkecil"
                    disabled={zoom <= ZOOM_MIN}
                    onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
                  >
                    <Icon>
                      <circle cx="11" cy="11" r="7" />
                      <path d="M21 21l-4.3-4.3M8 11h6" />
                    </Icon>
                  </button>
                  <span className="bk-zoomlabel">{Math.round(zoom * 100)}%</span>
                  <button
                    type="button"
                    className="bk-tbtn"
                    aria-label="Perbesar"
                    disabled={zoom >= ZOOM_MAX}
                    onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
                  >
                    <Icon>
                      <circle cx="11" cy="11" r="7" />
                      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6" />
                    </Icon>
                  </button>
                  <span className="bk-sep" />
                </div>

                <div className="bk-pager">
                  <input
                    type="text"
                    inputMode="numeric"
                    aria-label="Nomor halaman"
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") goTo();
                    }}
                  />
                  <span>/ {total}</span>
                </div>

                <span className="bk-sep" />
                <button
                  type="button"
                  className="bk-tbtn"
                  aria-label={isFs ? "Keluar layar penuh" : "Layar penuh"}
                  onClick={toggleFs}
                >
                  <Icon>
                    {isFs ? (
                      <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
                    ) : (
                      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
                    )}
                  </Icon>
                </button>
              </div>
            )}
            <a className="bk-btn" href={pdfUrl} download>
              Unduh E-Book
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
