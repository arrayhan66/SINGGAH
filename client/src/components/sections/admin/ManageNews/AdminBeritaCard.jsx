import { Eye, Pencil, Trash2 } from "lucide-react"

function AdminBeritaCard({ berita, onEdit, onDeleteClick, onPreview }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <div className="aspect-video w-full overflow-hidden bg-brand-navy relative">
        <img
          src={berita.image}
          alt={berita.title}
          className="h-full w-full object-cover"
        />
        {berita.status === "draft" && (
          <span className="absolute top-2 left-2 rounded-md bg-yellow-400/20 border border-yellow-400/30 px-2 py-0.5 text-[10px] font-bold text-yellow-300 uppercase tracking-wider backdrop-blur-sm">
            Draft
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2.5 p-4 min-w-0">
        {berita.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {berita.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-[10px] text-cyan-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h3 className="truncate text-sm md:text-base font-semibold text-white">
          {berita.title}
        </h3>

        <p className="truncate text-xs text-cyan-300">{berita.event}</p>

        <p className="truncate text-xs text-slate-400">{berita.date}</p>

        <div className="mt-1 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
          <button
            type="button"
            onClick={() => onPreview(berita)}
            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-white px-2 py-2 text-xs font-medium text-slate-800 hover:bg-slate-100 transition-colors sm:px-3"
          >
            <Eye size={13} />
            Preview
          </button>

          <button
            type="button"
            onClick={() => onEdit(berita)}
            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-white px-2 py-2 text-xs font-medium text-slate-800 hover:bg-slate-100 transition-colors sm:px-3"
          >
            <Pencil size={13} />
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDeleteClick(berita)}
            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/5 px-2 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors sm:px-3"
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
