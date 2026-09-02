import { Image, Upload, Loader2 } from "lucide-react"
import MediaCard from "./MediaCard"
import { AdminMediaSkeleton } from "../../../ui/PageSkeletons"

export default function MediaLibraryContent({
  loading,
  filtered,
  media,
  view,
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
        <AdminMediaSkeleton />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-700/60 bg-slate-800/20 py-16 text-center">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((item) => (
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
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.03]">
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
                {filtered.map((item) => (
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
      )}
    </div>
  )
}
