import { useNavigate } from "react-router-dom"
import { Calendar, ArrowRight, Bookmark } from "lucide-react"
import { imageUrl } from "../../../../utils/imageUrl"
import GlassCard from "../../../ui/GlassCard"

function KaryaTersimpanCard({ item, onRemove }) {
  const navigate = useNavigate()

  const categorySlug = item.Category?.slug || item.category || ""
  const categoryName = item.Category?.name || "Karya"
  const authorName = item.User?.name || "—"
  const year = item.year || ""
  const firstAdditionalImage =
    Array.isArray(item.images) && item.images.length > 0
      ? item.images[0]?.image_url || item.images[0]
      : null;
  const coverImage = item.thumbnail || firstAdditionalImage

  function handleOpen(e) {
    e.preventDefault()
    navigate(`/karya/${categorySlug}/${item.slug || item.id}`)
  }

  function handleUnbookmark(e) {
    e.preventDefault()
    e.stopPropagation()
    onRemove?.()
  }

  return (
    <GlassCard
      hover
      className="group flex h-full flex-col overflow-hidden p-0 !cursor-default"
    >
      <div className="relative overflow-hidden">
        <img
          src={imageUrl(coverImage)}
          alt={item.title}
          className="h-36 w-full object-cover transition-all duration-500 sm:h-40 md:h-44"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-transparent to-transparent" />
        <span className="absolute left-3 top-3 z-10 rounded-full border border-cyan-400/30 bg-brand-navy/80 px-2.5 py-0.5 text-[10px] font-medium text-cyan-300 backdrop-blur-sm sm:left-4 sm:top-4 sm:text-xs">
          {categoryName}
        </span>
        <button
          type="button"
          onClick={handleUnbookmark}
          aria-label="Hapus dari tersimpan"
          title="Hapus dari tersimpan"
          className="absolute right-3 top-3 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-brand-navy/80 text-slate-200 backdrop-blur-sm transition-colors hover:border-cyan-400/30 hover:text-cyan-300 sm:right-4 sm:top-4 sm:h-8 sm:w-8"
        >
          <Bookmark size={14} className="fill-cyan-400 text-cyan-400 sm:size-[15px]" />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="line-clamp-2 text-sm font-bold text-white sm:text-base md:text-lg">
          {item.title}
        </h3>

        <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-slate-400 sm:text-xs md:text-sm">
          {item.description}
        </p>

        <div className="mt-auto pt-3">
          <p className="flex items-center gap-1.5 text-[10px] text-slate-500 sm:text-xs">
            {authorName}
            {year && (
              <>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  {year}
                </span>
              </>
            )}
          </p>

          <button
            onClick={handleOpen}
            className="group/btn mt-2.5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-xs font-semibold text-slate-900 transition-colors duration-300 hover:bg-slate-200 sm:mt-3 sm:py-3 sm:text-sm"
          >
            Lihat Detail
            <ArrowRight
              size={14}
              className="transition-transform duration-300 group-hover/btn:translate-x-1 sm:size-[15px]"
            />
          </button>
        </div>
      </div>
    </GlassCard>
  )
}

export default KaryaTersimpanCard
