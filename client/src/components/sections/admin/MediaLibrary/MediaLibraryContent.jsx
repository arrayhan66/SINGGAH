import { useState } from "react"
import { Image, Upload, Loader2 } from "lucide-react"
import MediaCard from "./MediaCard"
import ShowMoreButton from "../../../ui/ShowMoreButton"
import { AdminMediaSkeleton } from "../../../ui/PageSkeletons"

const INITIAL_VISIBLE = 12

export default function MediaLibraryContent({
  loading,
  filtered,
  media,
  view,
  search,
  typeFilter,
  isDragging,
  uploading,
  copiedId,
  onPreview,
  onCopy,
  onDelete,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  fileInputRef,
}) {
  const [showAll, setShowAll] = useState(false)
  const filterKey = `${search}|${typeFilter}|${view}`
  const [activeFilter, setActiveFilter] = useState(filterKey)
  if (filterKey !== activeFilter) {
    setActiveFilter(filterKey)
    setShowAll(false)
  }

  const visible = showAll ? filtered : filtered.slice(0, INITIAL_VISIBLE)
  const showButton = filtered.length > INITIAL_VISIBLE

  return (
    <div
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className="px-4 md:px-6 lg:px-8 pt-6 md:pt-8 pb-12"
    >
      {isDragging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-cyan-900/20 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-cyan-400/50 bg-slate-900/90 px-12 py-10 shadow-2xl">
            <Upload className="h-10 w-10 text-cyan-400" />
            <p className="text-lg font-semibold text-white">
              Lepaskan file di sini
            </p>
            <p className="text-sm text-slate-400">File akan langsung diupload</p>
          </div>
        </div>
      )}

      {loading ? (
        <AdminMediaSkeleton view={view} />
      ) : filtered.length === 0 ? (
        <div className="admin-empty-news animate-fade-in-up flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] py-16 text-center">
          <div className="rounded-full bg-slate-800/50 p-4 ring-1 ring-slate-700/50">
            <Image className="h-8 w-8 text-slate-500" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-300">
              {media.length === 0 ? "Belum ada file" : "File tidak ditemukan"}
            </p>
            <p className="mt-1 text-sm text-slate-500 max-w-sm">
              {media.length === 0
                ? "Klik tombol Upload atau drag & drop file ke halaman ini untuk mulai mengelola media."
                : "Coba ubah kata kunci atau filter tipe file untuk mencari media lain."}
            </p>
          </div>
          {media.length === 0 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mt-2 flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-500 hover:bg-[position:100%_0] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Upload size={16} />
              )}
              {uploading ? "Mengupload..." : "Pilih File"}
            </button>
          )}
        </div>
      ) : view === "grid" ? (
        <>
        <p className="text-xs text-slate-500 mb-4">
          Menampilkan {filtered.length} dari {media.length} file
        </p>
        <div className="grid max-[400px]:grid-cols-1 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {visible.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              view="grid"
              onPreview={onPreview}
              onCopy={onCopy}
              onDelete={onDelete}
              copiedId={copiedId}
            />
          ))}
        </div>
        {showButton && (
          <ShowMoreButton
            label="Lihat Semua File"
            total={filtered.length}
            showAll={showAll}
            onToggle={() => setShowAll((prev) => !prev)}
            className="mt-6"
          />
        )}
        </>
      ) : (
        <>
        <p className="text-xs text-slate-500 mb-4">
          Menampilkan {filtered.length} dari {media.length} file
        </p>
        <div className="admin-media-table overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="admin-media-table-head border-b border-white/5 bg-white/[0.03]">
                  <th className="px-4 py-3 font-medium text-slate-400">
                    File
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-400">
                    Tipe
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-400">
                    Ukuran
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-400">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-400">
                    Digunakan
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-400 text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    view="list"
                    onPreview={onPreview}
                    onCopy={onCopy}
                    onDelete={onDelete}
                    copiedId={copiedId}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {showButton && (
          <ShowMoreButton
            label="Lihat Semua File"
            total={filtered.length}
            showAll={showAll}
            onToggle={() => setShowAll((prev) => !prev)}
            className="mt-6"
          />
        )}
        </>
      )}
    </div>
  )
}
