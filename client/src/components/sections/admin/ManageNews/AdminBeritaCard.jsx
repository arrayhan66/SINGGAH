import { Eye, Pencil, Trash2, FilePen } from "lucide-react"
import { imageUrl } from "../../../../utils/imageUrl"
import SmartImage from "../../../ui/SmartImage"

function AdminBeritaCard({ berita, onEdit, onDeleteClick, onPreview }) {
  return (
    <div className="admin-berita-card flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <div className="aspect-video w-full overflow-hidden bg-brand-navy relative">
        <SmartImage
          src={imageUrl(berita.image)}
          alt={berita.title}
          className="h-full w-full object-cover"
        />
        {berita.status === "draft" && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1.5 rounded-lg border border-amber-300/70 bg-gradient-to-r from-amber-400 to-yellow-300 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-amber-950 shadow-[0_4px_14px_-4px_rgba(245,158,11,0.9)]">
            <FilePen size={11} strokeWidth={2.6} className="text-amber-900" />
            Draft
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4 min-w-0">
        {berita.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {berita.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="admin-article-tag rounded-full px-2.5 py-1 text-[10px] font-medium tracking-wide"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h3 className="text-sm md:text-base font-semibold leading-snug text-white">
          {berita.title}
        </h3>



        {berita.date && <p className="truncate text-xs text-slate-400">{berita.date}</p>}

        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
          <button
            type="button"
            onClick={() => onPreview(berita)}
            className="card-detail-btn flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all duration-500 hover:bg-[position:100%_0]"
          >
            <Eye size={13} />
            Preview
          </button>

          <button
            type="button"
            onClick={() => onEdit(berita)}
            className="card-detail-btn flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all duration-500 hover:bg-[position:100%_0]"
          >
            <Pencil size={13} />
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDeleteClick(berita)}
            className="news-delete-btn flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 transition-all duration-300"
          >
            <Trash2 size={13} />
            Hapus
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminBeritaCard
