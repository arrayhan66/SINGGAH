import { Tag } from "lucide-react"
import ShowMoreButton from "../../../../components/ui/ShowMoreButton"
import CategoryCard from "./CategoryCard"

const INITIAL_VISIBLE = 9

export default function CategoryContent({
  loading,
  filtered,
  visibleCategories,
  search,
  showAll,
  onShowAllToggle,
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

  return (
    <>
      <div className="grid grid-cols-1 min-[750px]:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {visibleCategories.map((cat) => (
          <CategoryCard
            key={cat.id}
            cat={cat}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {filtered.length > INITIAL_VISIBLE && (
        <ShowMoreButton
          label="Lihat Semua Kategori"
          total={filtered.length}
          showAll={showAll}
          onToggle={onShowAllToggle}
          className="mt-4 md:mt-5"
        />
      )}
    </>
  )
}
