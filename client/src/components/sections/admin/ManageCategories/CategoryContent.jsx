import { createElement } from "react"
import { Tag, FolderOpen, PackageOpen, Pencil, Trash2 } from "lucide-react"
import ShowMoreButton from "../../../../components/ui/ShowMoreButton"
import CategoryCard from "./CategoryCard"
import { getCategoryIcon } from "../../../../utils/categoryHelpers"

const INITIAL_VISIBLE = 12

export default function CategoryContent({
  loading,
  filtered,
  visibleCategories,
  search,
  showAll,
  onShowAllToggle,
  view,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-3xl border border-dashed border-slate-700/50 bg-white/[0.02] py-20 text-sm text-slate-400">
        Memuat kategori...
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-3xl border border-dashed border-slate-700/50 bg-white/[0.02] py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/40 ring-1 ring-slate-700/30 backdrop-blur-sm">
          <Tag className="h-7 w-7 text-slate-500" />
        </div>
        <div>
          <p className="text-lg font-bold text-slate-300">
            {search ? "Kategori tidak ditemukan" : "Belum ada kategori"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {search
              ? `Tidak ada kategori yang cocok dengan "${search}"`
              : 'Klik "Tambah Kategori" untuk membuat kategori baru.'}
          </p>
        </div>
      </div>
    )
  }

  const activeCats = visibleCategories.filter((c) => (c.projectCount || 0) > 0)
  const emptyCats = visibleCategories.filter((c) => (c.projectCount || 0) === 0)

  return (
    <div className="flex flex-col gap-8">
      {view === "list" ? (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.03]">
                  <th className="px-4 py-3.5 font-medium text-slate-400">Kategori</th>
                  <th className="px-4 py-3.5 font-medium text-slate-400">Deskripsi</th>
                  <th className="px-4 py-3.5 font-medium text-slate-400">Project</th>
                  <th className="px-4 py-3.5 font-medium text-slate-400 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {visibleCategories.map((cat) => {
                  const IconComponent = getCategoryIcon(cat.name)
                  return (
                    <tr
                      key={cat.id}
                      className="border-b border-white/5 transition-colors hover:bg-white/[0.04] last:border-0"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                            {createElement(IconComponent, { size: 20 })}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">
                              {cat.name}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              /{cat.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-300 text-xs max-w-xs truncate">
                        {cat.description || "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-slate-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                          {cat.projectCount} Project
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
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
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {activeCats.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                  <FolderOpen size={15} />
                </div>
                <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                  Kategori Berisi Project ({activeCats.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 min-[750px]:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {activeCats.map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    cat={cat}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {emptyCats.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-500/10 text-slate-400">
                  <PackageOpen size={15} />
                </div>
                <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                  Kategori Kosong / Belum Ada Project ({emptyCats.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 min-[750px]:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {emptyCats.map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    cat={cat}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {filtered.length > INITIAL_VISIBLE && (
        <ShowMoreButton
          label="Lihat Semua Kategori"
          total={filtered.length}
          showAll={showAll}
          onToggle={onShowAllToggle}
          className="mt-4 md:mt-5"
        />
      )}
    </div>
  )
}
