import { Pencil, Trash2 } from "lucide-react"

function AdminBeritaCard({ berita, onEdit, onDeleteClick }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <div className="aspect-video w-full overflow-hidden bg-brand-navy">
        <img
          src={berita.image}
          alt={berita.title}
          className="h-full w-full object-cover"
        />
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

        <div className="mt-1 flex items-center gap-2 border-t border-white/10 pt-3">
          <button
            type="button"
            onClick={() => onEdit(berita)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 transition-colors"
          >
            <Pencil size={13} />
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDeleteClick(berita)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
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
