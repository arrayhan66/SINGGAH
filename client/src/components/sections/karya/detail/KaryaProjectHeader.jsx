import { Calendar, User, Tag, Heart, Share2, Bookmark } from "lucide-react";

function KaryaProjectHeader({
  project,
  isLiked,
  likeCount,
  handleLike,
  isBookmarked,
  handleBookmark,
  handleShare,
}) {
  return (
    <div className="mb-5 border-b border-white/10 pb-5 sm:mb-6 sm:pb-6">
      {/* Meta Tags */}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-400 sm:mb-4 sm:gap-4 sm:text-sm">
        {project.Category && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 font-medium text-cyan-300 sm:px-3">
            <Tag size={12} className="sm:size-3.5" />
            {project.Category.name}
          </span>
        )}
        {project.year && (
          <span className="flex items-center gap-1.5">
            <Calendar size={12} className="sm:size-3.5" />
            {project.year}
          </span>
        )}
        {project.User && (
          <span className="flex items-center gap-1.5">
            <User size={12} className="sm:size-3.5" />
            {project.User.name}
          </span>
        )}
      </div>

      {/* Judul Project */}
      <h1 className="mb-4 text-2xl font-bold leading-tight text-white sm:text-3xl sm:leading-snug lg:text-4xl">
        {project.title}
      </h1>

      {/* Tombol Aksi */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <button
          onClick={handleLike}
          className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition sm:px-4 sm:py-2.5 sm:text-sm ${
            isLiked
              ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
              : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Heart
            size={14}
            className={`sm:h-4 sm:w-4 ${isLiked ? "fill-rose-400" : ""}`}
          />
          {likeCount} Suka
        </button>

        <button
          onClick={handleShare}
          className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white sm:px-4 sm:py-2.5 sm:text-sm"
        >
          <Share2 size={14} className="sm:h-4 sm:w-4" />
          Bagikan
        </button>

        <button
          onClick={handleBookmark}
          className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition sm:px-4 sm:py-2.5 sm:text-sm ${
            isBookmarked
              ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
              : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Bookmark
            size={14}
            className={`sm:h-4 sm:w-4 ${isBookmarked ? "fill-amber-400" : ""}`}
          />
          {isBookmarked ? "Tersimpan" : "Simpan"}
        </button>
      </div>
    </div>
  );
}

export default KaryaProjectHeader;
