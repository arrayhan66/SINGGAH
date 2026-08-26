import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { imageUrl } from "../../../../utils/imageUrl";

const NAV_HEIGHT_PX = 64;

function calcObjectPosition(naturalW, naturalH) {
  const imageAR = naturalW / naturalH;
  const containerAR = 16 / 9;
  if (imageAR <= containerAR) {
    const visibleFraction = (9 / 16) * imageAR;
    const navFraction = NAV_HEIGHT_PX / naturalH;
    const centerY = (navFraction + visibleFraction / 2) * 100;
    return `50% ${centerY}%`;
  }
  return "50% 50%";
}

function KaryaProjectGallery({
  slug,
  gallery,
  activeImage,
  setActiveImage,
  projectTitle,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const fromHall = location.state?.fromHall;
  const total = gallery.length;
  const timerRef = useRef(null);
  const [paused, setPaused] = useState(false);

  function handleBack() {
    if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate(`/karya/${slug}`);
    }
  }

  const goTo = useCallback(
    (index) => {
      setActiveImage(index);
      resetTimer();
    },
    [total],
  );

  function prev() {
    setActiveImage((i) => (i === 0 ? total - 1 : i - 1));
    resetTimer();
  }

  function next() {
    setActiveImage((i) => (i === total - 1 ? 0 : i + 1));
    resetTimer();
  }

  function resetTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!paused && total > 1) {
      timerRef.current = setInterval(() => {
        setActiveImage((i) => (i === total - 1 ? 0 : i + 1));
      }, 4500);
    }
  }

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, total]);

  const isFirst = activeImage === 0;
  const isLast = activeImage === total - 1;

  return (
    <div
      className="gallery-container relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Tombol Kembali */}
      <button
        onClick={handleBack}
        className="gallery-back group absolute left-2 top-2 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-brand-dark/90 p-1.5 text-[11px] font-medium text-slate-100 shadow-lg shadow-black/30 backdrop-blur-md transition-colors duration-300 hover:border-cyan-400/50 hover:bg-brand-navy hover:text-cyan-300 cursor-pointer sm:left-4 sm:top-4 sm:gap-2 sm:p-2 sm:py-2 sm:pl-3 sm:pr-4 sm:text-sm"
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 transition-colors duration-300 group-hover:bg-cyan-400/20 sm:h-6 sm:w-6">
          <ArrowLeft
            size={12}
            className="transition-transform duration-300 group-hover:-translate-x-0.5 sm:size-3.5"
          />
        </span>
        <span className="hidden sm:inline">{fromHall ? "Kembali ke Hall 3D" : "Kembali"}</span>
      </button>

      {/* Slideshow stage */}
      <div className="gallery-stage relative w-full overflow-hidden">
        {/* Track — slide geser */}
        <div
          className="gallery-track flex"
          style={{ transform: `translateX(-${activeImage * 100}%)` }}
        >
          {gallery.map((img, index) => (
            <div key={index} className="gallery-slide w-full shrink-0">
              <div className="gallery-image">
                <div className="gallery-image-crop">
                  <img
                    src={imageUrl(img)}
                    alt={`${projectTitle} ${index + 1}`}
                    loading={index === 0 ? "eager" : "lazy"}
                    onLoad={(e) => {
                      const pos = calcObjectPosition(
                        e.target.naturalWidth,
                        e.target.naturalHeight,
                      );
                      e.target.style.objectPosition = pos;
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Panah kiri */}
        {total > 1 && !isFirst && (
          <button
            onClick={prev}
            className="gallery-arrow absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full sm:left-3 sm:h-10 sm:w-10"
          >
            <ChevronLeft size={18} className="sm:hidden" />
            <ChevronLeft size={22} className="hidden sm:block" />
          </button>
        )}

        {/* Panah kanan */}
        {total > 1 && !isLast && (
          <button
            onClick={next}
            className="gallery-arrow absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full sm:right-3 sm:h-10 sm:w-10"
          >
            <ChevronRight size={18} className="sm:hidden" />
            <ChevronRight size={22} className="hidden sm:block" />
          </button>
        )}

        {/* Counter badge */}
        {total > 1 && (
          <span className="gallery-counter absolute bottom-2 right-2 z-10 rounded-full px-2 py-0.5 text-[10px] font-medium sm:bottom-3 sm:right-3 sm:px-2.5 sm:py-1 sm:text-xs">
            {activeImage + 1} / {total}
          </span>
        )}

        {/* Dot indicators — di dalam gambar, bawah tengah */}
        {total > 1 && (
          <div className="gallery-dots absolute inset-x-0 bottom-2 z-10 flex items-center justify-center sm:bottom-3">
            <div className="gallery-dots-bar flex items-center gap-1 rounded-full px-2.5 py-1 sm:gap-1.5 sm:px-3 sm:py-1.5">
              {gallery.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goTo(index)}
                  className={`gallery-dot cursor-pointer rounded-full transition-all duration-300 ${
                    activeImage === index ? "gallery-dot-active" : "gallery-dot-inactive"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default KaryaProjectGallery;
