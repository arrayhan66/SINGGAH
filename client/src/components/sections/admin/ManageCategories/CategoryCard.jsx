import { createElement } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { getCategoryIcon } from "../../../../utils/categoryHelpers"

export default function CategoryCard({ cat, onEdit, onDelete }) {
  const IconComponent = getCategoryIcon(cat.name)

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.14] bg-gradient-to-b from-white/[0.09] to-white/[0.05] p-5 shadow-lg shadow-black/20 sm:p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/50 hover:bg-white/[0.1] hover:shadow-xl hover:shadow-cyan-500/10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 shadow-inner transition-transform duration-300 group-hover:scale-105 sm:h-14 sm:w-14">
            {createElement(IconComponent, { size: 24 })}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-white truncate">
              {cat.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              /{cat.slug}
            </p>
          </div>
        </div>

        <div className="hidden min-[400px]:flex gap-1 opacity-80 sm:opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(cat)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-cyan-500/10 hover:text-cyan-300"
            title="Edit Kategori"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(cat)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-400"
            title="Hapus Kategori"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {cat.description && (
        <p className="mt-4 text-sm leading-relaxed text-slate-300/90 line-clamp-3">
          {cat.description}
        </p>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-white/[0.1] pt-4">
        <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${
          (cat.projectCount || 0) > 0
            ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-300"
            : "border-white/[0.08] bg-white/[0.04] text-slate-400"
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${(cat.projectCount || 0) > 0 ? "bg-cyan-400" : "bg-slate-500"}`} />
          {cat.projectCount} Project
        </span>
        <span className="hidden text-[11px] text-slate-500 min-[400px]:inline">
          ID: #{cat.id}
        </span>
        <div className="flex gap-1 min-[400px]:hidden">
          <button
            type="button"
            onClick={() => onEdit(cat)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-cyan-500/10 hover:text-cyan-300"
            title="Edit Kategori"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(cat)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-400"
            title="Hapus Kategori"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
