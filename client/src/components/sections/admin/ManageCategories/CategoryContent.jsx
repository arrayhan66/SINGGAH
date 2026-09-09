import { Tag } from "lucide-react"
import ShowMoreButton from "../../../../components/ui/ShowMoreButton"
import CategoryCard from "./CategoryCard"
import { AdminCategoriesSkeleton } from "../../../../components/ui/PageSkeletons"

const INITIAL_VISIBLE = 12

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
    return <AdminCategoriesSkeleton />
  }

  if (filtered.length === 0) {
    return (
      <div className="admin-empty-categories animate-fade-in-up flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] py-16 text-center">
        <div className="rounded-full bg-slate-800/50 p-4 ring-1 ring-slate-700/50">
          <Tag className="h-8 w-8 text-slate-500" />
        </div>
        <div>
          <p className="text-base font-semibold text-slate-300">
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
    <div className="flex flex-col gap-8">
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
    </div>
  )
}
