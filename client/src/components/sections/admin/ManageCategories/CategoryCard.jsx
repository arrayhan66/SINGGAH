import { createElement, useEffect, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { getCategoryIcon } from "../../../../utils/categoryHelpers"
import { toggleClass, getSwitchClass } from "../../../../utils/settingsHelpers"
import { useTheme } from "../../../../context/ThemeContext"
import Skeleton from "../../../ui/Skeleton"

export default function CategoryCard({ cat, onEdit, onDelete, onToggleActive, toggling }) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const [cardKey] = useState(() => Math.random().toString(36).slice(2, 9))
  const [iconLoading, setIconLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIconLoading(false), 120)
    return () => clearTimeout(timer)
  }, [cardKey])

  const IconComponent = getCategoryIcon(cat.name)

  return (
    <div className={`group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.14] bg-gradient-to-b from-white/[0.09] to-white/[0.05] p-4 min-[300px]:p-5 sm:p-6 3xl:p-7 4xl:p-8 shadow-lg shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/50 hover:bg-white/[0.1] hover:shadow-xl hover:shadow-cyan-500/10 ${cat.is_active ? "" : "opacity-70 saturate-50"}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="flex min-w-0 items-center gap-3 min-[300px]:gap-4">
          <div className="admin-category-icon relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-inner transition-transform duration-300 group-hover:scale-105 min-[300px]:h-12 min-[300px]:w-12 min-[300px]:rounded-xl sm:h-14 sm:w-14 3xl:h-16 3xl:w-16 4xl:h-20 4xl:w-20">
            {iconLoading && <Skeleton className="absolute inset-0 rounded-none" />}
            {createElement(IconComponent, { size: 24, key: cardKey, className: `relative ${iconLoading ? "opacity-0" : ""}` })}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-white min-[300px]:text-base 3xl:text-lg 4xl:text-xl">
              {cat.name}
            </h3>
            <p className="mt-0.5 truncate text-[11px] text-slate-400 min-[300px]:text-xs 3xl:text-sm">
              /{cat.slug}
            </p>
          </div>
        </div>

        <div className="hidden min-[400px]:flex shrink-0 gap-1 opacity-80 transition-opacity duration-200">
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
        <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-slate-300/90 sm:mt-4 3xl:text-sm 4xl:text-base">
          {cat.description}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-2 gap-y-3 border-t border-white/[0.1] pt-4 sm:mt-5 4xl:mt-6 4xl:pt-5">
        <span className={`inline-flex max-[340px]:hidden shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium sm:text-xs ${
          (cat.projectCount || 0) > 0
            ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-300"
            : "border-white/[0.08] bg-white/[0.04] text-slate-400"
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${(cat.projectCount || 0) > 0 ? "bg-cyan-400" : "bg-slate-500"}`} />
          {cat.projectCount} Project
        </span>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          <label
            className={`${toggleClass} shrink-0 ${toggling ? "pointer-events-none opacity-60" : ""}`}
            title={cat.is_active ? "Klik untuk menonaktifkan dari hall" : "Klik untuk menampilkan di hall"}
          >
            <input
              type="checkbox"
              checked={cat.is_active}
              disabled={toggling}
              onChange={() => onToggleActive(cat)}
              className="peer sr-only"
            />
            <div className={getSwitchClass(isDark)} />
          </label>
          <span className={`shrink-0 text-[11px] font-semibold sm:text-xs ${
            cat.is_active ? "text-emerald-300" : "text-slate-400"
          }`}>
            {cat.is_active ? "Aktif" : "Nonaktif"}
          </span>
          <div className="flex shrink-0 gap-1 min-[400px]:hidden">
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
    </div>
  )
}