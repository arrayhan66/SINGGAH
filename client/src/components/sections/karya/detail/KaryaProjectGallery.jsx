import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function KaryaProjectGallery({
  slug,
  gallery,
  activeImage,
  setActiveImage,
  projectTitle,
  isUserRoute,
}) {
  return (
    <div className="relative overflow-hidden bg-slate-950/40">
      {/* Tombol Kembali di Pojok Kiri Atas */}
      <Link
        to={isUserRoute ? `/user/karya/${slug}` : `/karya/${slug}`}
        className="group absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-2 sm:py-2 sm:pl-3 sm:pr-4 text-sm text-slate-300 backdrop-blur-md transition-colors duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300 cursor-pointer"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 transition-colors duration-300 group-hover:bg-cyan-400/20">
          <ArrowLeft
            size={14}
            className="transition-transform duration-300 group-hover:-translate-x-0.5"
          />
        </span>
        <span className="hidden sm:inline">Kembali</span>
      </Link>

      {/* Area Gambar Utama */}
      <div className="aspect-video w-full overflow-hidden bg-slate-900">
        <img
          src={gallery[activeImage]}
          alt={projectTitle}
          className="h-full w-full object-cover transition-all duration-300"
        />
      </div>

      {/* Thumbnail List (Jika ada lebih dari 1 gambar) */}
      {gallery.length > 1 && (
        <div className="flex gap-3 overflow-x-auto p-4 sm:p-6 bg-slate-950/60 border-t border-white/10">
          {gallery.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(index)}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition cursor-pointer sm:h-20 sm:w-28 ${
                activeImage === index
                  ? "border-cyan-400 shadow-lg shadow-cyan-500/20"
                  : "border-white/10 opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={img}
                alt={`${projectTitle} ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default KaryaProjectGallery;
