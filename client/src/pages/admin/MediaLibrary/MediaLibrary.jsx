import { useState, useMemo, useRef, useCallback } from "react"
import {
  Image, Upload, Search, Trash2, Copy, Check,
  Grid3X3, List, FileImage, FileText, FileArchive,
  FileVideo, File, X, Download, ExternalLink,
  AlertTriangle
} from "lucide-react"
import AdminLayout from "../../../layouts/AdminLayout"
import AdminHeroBackground from "../../../components/ui/AdminHeroBackground"

function formatBytes(bytes) {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const val = bytes / Math.pow(k, i)
  return `${val % 1 === 0 ? val : val.toFixed(1)} ${sizes[i]}`
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  })
}

function getFileIcon(mime) {
  if (!mime) return File
  if (mime.startsWith("image/")) return FileImage
  if (mime.startsWith("video/")) return FileVideo
  if (mime.includes("zip") || mime.includes("rar") || mime.includes("tar")) return FileArchive
  if (mime.includes("pdf") || mime.includes("document") || mime.includes("sheet")) return FileText
  return File
}

function getFileTypeLabel(mime) {
  if (!mime) return "UNKNOWN"
  if (mime.startsWith("image/")) return mime.split("/").pop().toUpperCase()
  if (mime.startsWith("video/")) return mime.split("/").pop().toUpperCase()
  if (mime.includes("pdf")) return "PDF"
  if (mime.includes("zip") || mime.includes("rar")) return "ARCHIVE"
  return mime.split("/").pop().toUpperCase()
}

function isPreviewable(mime) {
  return mime && mime.startsWith("image/")
}

function MediaCard({ item, view, onPreview, onCopy, onDelete, copiedId }) {
  const Icon = getFileIcon(item.type)

  if (view === "grid") {
    return (
      <div className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] transition-all duration-200 hover:border-emerald-500/30 hover:bg-white/[0.06]">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-800/50">
          {isPreviewable(item.type) ? (
            <img
              src={item.url}
              alt={item.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onClick={() => onPreview(item)}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Icon className="h-10 w-10 text-slate-600" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {isPreviewable(item.type) && (
              <button
                onClick={() => onPreview(item)}
                className="cursor-pointer rounded-lg bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors"
                title="Preview"
              >
                <ExternalLink size={14} />
              </button>
            )}
            <button
              onClick={() => onCopy(item)}
              className="cursor-pointer rounded-lg bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors"
              title="Salin URL"
            >
              {copiedId === item.id ? <Check size={14} /> : <Copy size={14} />}
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="cursor-pointer rounded-lg bg-black/60 p-1.5 text-white hover:bg-red-500/80 transition-colors"
              title="Hapus"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <div className="p-3">
          <p className="truncate text-sm font-medium text-white">{item.name}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            <span>{getFileTypeLabel(item.type)}</span>
            <span>•</span>
            <span>{item.size}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <tr className="border-b border-white/5 transition-colors hover:bg-white/5 last:border-0">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg overflow-hidden bg-slate-800/50 cursor-pointer"
            onClick={() => onPreview(item)}
          >
            {isPreviewable(item.type) ? (
              <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
            ) : (
              <Icon className="h-5 w-5 text-slate-500" />
            )}
          </div>
          <div className="min-w-0">
            <p
              className="truncate max-w-[220px] text-sm font-medium text-white cursor-pointer hover:text-emerald-300 transition-colors"
              onClick={() => onPreview(item)}
            >
              {item.name}
            </p>
            <p className="text-xs text-slate-500">{item.uploadedAt ? formatDate(item.uploadedAt) : "Baru saja"}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{getFileTypeLabel(item.type)}</td>
      <td className="px-4 py-3 text-slate-400 hidden sm:table-cell">{item.size}</td>
      <td className="px-4 py-3 text-slate-400 hidden lg:table-cell">{item.uploadedAt ? formatDate(item.uploadedAt) : "Baru saja"}</td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="rounded-md bg-slate-700/40 px-2 py-0.5 text-xs text-slate-300">{item.usedIn || 0} kali</span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onCopy(item)}
            className="cursor-pointer rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-emerald-400 transition-colors"
            title="Salin URL"
          >
            {copiedId === item.id ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="cursor-pointer rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-red-400 transition-colors"
            title="Hapus"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}

function PreviewModal({ item, onClose }) {
  if (!item) return null

  const Icon = getFileIcon(item.type)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <Icon className="h-4 w-4 shrink-0 text-slate-400" />
            <p className="truncate text-sm font-medium text-white">{item.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={item.url}
              download={item.name}
              className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
              title="Download"
            >
              <Download size={16} />
            </a>
            <button
              onClick={onClose}
              className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center p-2 bg-slate-800/30 max-h-[70vh] overflow-auto">
          {isPreviewable(item.type) ? (
            <img src={item.url} alt={item.name} className="max-h-[65vh] max-w-full rounded-lg object-contain" />
          ) : (
            <div className="flex flex-col items-center gap-3 py-16">
              <Icon className="h-16 w-16 text-slate-600" />
              <p className="text-sm text-slate-400">File tidak dapat dipreview</p>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 border-t border-white/[0.06] px-5 py-3 text-xs">
          <div>
            <p className="text-slate-500">Tipe</p>
            <p className="text-white font-medium">{getFileTypeLabel(item.type)}</p>
          </div>
          <div>
            <p className="text-slate-500">Ukuran</p>
            <p className="text-white font-medium">{item.size}</p>
          </div>
          <div>
            <p className="text-slate-500">URL</p>
            <p className="text-emerald-300 font-mono truncate">{item.url}</p>
          </div>
          <div>
            <p className="text-slate-500">Diupload</p>
            <p className="text-white font-medium">{item.uploadedAt ? formatDate(item.uploadedAt) : "Baru saja"}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ConfirmDeleteModal({ item, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-slate-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Hapus File</h3>
            <p className="mt-1 text-sm text-slate-400">
              Yakin ingin menghapus <span className="font-medium text-white">{item?.name}</span>?
              Tindakan ini tidak bisa dibatalkan.
            </p>
          </div>
          <div className="flex w-full gap-3 mt-2">
            <button
              onClick={onCancel}
              className="flex-1 cursor-pointer rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={() => onConfirm(item.id)}
              className="flex-1 cursor-pointer rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-500 transition-colors"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MediaLibrary() {
  const [media, setMedia] = useState([])
  const [search, setSearch] = useState("")
  const [copiedId, setCopiedId] = useState(null)
  const [view, setView] = useState("list")
  const [previewItem, setPreviewItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [notification, setNotification] = useState(null)
  const fileInputRef = useRef(null)
  const dragCounter = useRef(0)

  const filtered = useMemo(() => {
    const s = search.toLowerCase()
    return media.filter((m) => m.name.toLowerCase().includes(s))
  }, [media, search])

  const totalSize = useMemo(() => {
    const total = media.reduce((acc, m) => acc + (m.rawBytes || 0), 0)
    return formatBytes(total)
  }, [media])

  function showNotif(msg, type = "success") {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 2500)
  }

  function addFiles(files) {
    const newMedia = Array.from(files).map((file, idx) => {
      const id = Date.now() + idx + Math.random()
      const url = URL.createObjectURL(file)
      return {
        id,
        name: file.name,
        url,
        type: file.type,
        rawBytes: file.size,
        size: formatBytes(file.size),
        uploadedAt: new Date().toISOString().split("T")[0],
        usedIn: 0,
      }
    })
    setMedia((prev) => [...newMedia, ...prev])
    showNotif(`${files.length} file berhasil diupload`)
  }

  function handleFileSelect(e) {
    const files = e.target.files
    if (files?.length) {
      addFiles(files)
    }
    e.target.value = ""
  }

  function handleDragOver(e) {
    e.preventDefault()
    e.stopPropagation()
  }

  function handleDragEnter(e) {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    if (e.dataTransfer?.types?.includes("Files")) {
      setIsDragging(true)
    }
  }

  function handleDragLeave(e) {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current <= 0) {
      dragCounter.current = 0
      setIsDragging(false)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    dragCounter.current = 0
    const files = e.dataTransfer?.files
    if (files?.length) {
      addFiles(files)
    }
  }

  const handleDelete = useCallback((id) => {
    setDeleteTarget(media.find((m) => m.id === id))
  }, [media])

  function confirmDelete(id) {
    setMedia((prev) => {
      const item = prev.find((m) => m.id === id)
      if (item?.url?.startsWith("blob:")) {
        URL.revokeObjectURL(item.url)
      }
      return prev.filter((m) => m.id !== id)
    })
    setDeleteTarget(null)
    showNotif("File berhasil dihapus")
  }

  function handleCopyUrl(item) {
    navigator.clipboard.writeText(item.url)
    setCopiedId(item.id)
    setTimeout(() => setCopiedId(null), 2000)
    showNotif("URL berhasil disalin")
  }

  const stats = useMemo(() => ({
    total: media.length,
    images: media.filter((m) => m.type?.startsWith("image/")).length,
    documents: media.filter((m) => m.type && !m.type.startsWith("image/") && !m.type.startsWith("video/")).length,
  }), [media])

  return (
    <AdminLayout>
      <AdminHeroBackground>
        <div className="px-4 md:px-6 lg:px-8 pt-8 md:pt-10 pb-8 md:pb-10">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/10 border border-emerald-400/30">
              <Image className="h-6 w-6 text-emerald-300" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">Media Library</h1>
              <p className="text-xs md:text-sm text-slate-400 mt-0.5">Kelola semua file dan gambar yang diupload.</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-slate-500">Total File</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
              <p className="text-2xl font-bold text-emerald-300">{stats.images}</p>
              <p className="text-xs text-slate-500">Gambar</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
              <p className="text-2xl font-bold text-blue-300">{stats.documents}</p>
              <p className="text-xs text-slate-500">Dokumen</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
              <p className="text-2xl font-bold text-slate-300">{totalSize}</p>
              <p className="text-xs text-slate-500">Total Ukuran</p>
            </div>
          </div>

          <div className="mt-6 md:mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari file..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none shadow-sm focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center rounded-xl border border-white/10 bg-slate-800/50 p-1 backdrop-blur-sm">
                <button
                  onClick={() => setView("list")}
                  className={`cursor-pointer rounded-lg p-1.5 transition-colors ${view === "list" ? "bg-emerald-500/20 text-emerald-300" : "text-slate-400 hover:text-white"}`}
                  title="Tampilan daftar"
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => setView("grid")}
                  className={`cursor-pointer rounded-lg p-1.5 transition-colors ${view === "grid" ? "bg-emerald-500/20 text-emerald-300" : "text-slate-400 hover:text-white"}`}
                  title="Tampilan grid"
                >
                  <Grid3X3 size={16} />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.zip,.rar"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 bg-[length:200%_100%] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all duration-500 hover:bg-[position:100%_0]"
              >
                <Upload size={16} /> Upload File
              </button>
            </div>
          </div>
        </div>
      </AdminHeroBackground>

      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="px-4 py-8 md:px-6 md:py-10 lg:px-8 lg:py-12"
      >
            {isDragging && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-900/20 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-emerald-400/50 bg-slate-900/90 px-12 py-10 shadow-2xl">
                  <Upload className="h-10 w-10 text-emerald-400" />
                  <p className="text-lg font-semibold text-white">Lepaskan file di sini</p>
                  <p className="text-sm text-slate-400">File akan langsung diupload</p>
                </div>
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-700/60 bg-slate-800/20 py-16 text-center">
                <div className="rounded-full bg-slate-800/50 p-4 ring-1 ring-slate-700/50">
                  <Image className="h-8 w-8 text-slate-500" />
                </div>
                <p className="text-base font-semibold text-slate-300">
                  {media.length === 0 ? "Belum ada file" : "File tidak ditemukan"}
                </p>
                <p className="text-sm text-slate-500 max-w-sm">
                  {media.length === 0
                    ? "Klik tombol Upload atau drag & drop file ke halaman ini untuk mulai mengelola media."
                    : "Coba gunakan kata kunci lain untuk mencari file."}
                </p>
                {media.length === 0 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors"
                  >
                    <Upload size={16} /> Pilih File
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
                    onPreview={setPreviewItem}
                    onCopy={handleCopyUrl}
                    onDelete={handleDelete}
                    copiedId={copiedId}
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-white/10">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/5 bg-slate-800/40">
                      <th className="px-4 py-3 font-medium text-slate-400">File</th>
                      <th className="px-4 py-3 font-medium text-slate-400 hidden md:table-cell">Tipe</th>
                      <th className="px-4 py-3 font-medium text-slate-400 hidden sm:table-cell">Ukuran</th>
                      <th className="px-4 py-3 font-medium text-slate-400 hidden lg:table-cell">Tanggal</th>
                      <th className="px-4 py-3 font-medium text-slate-400 hidden lg:table-cell">Digunakan</th>
                      <th className="px-4 py-3 font-medium text-slate-400 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => (
                      <MediaCard
                        key={item.id}
                        item={item}
                        view="list"
                        onPreview={setPreviewItem}
                        onCopy={handleCopyUrl}
                        onDelete={handleDelete}
                        copiedId={copiedId}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        {previewItem && (
          <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
        )}

        {deleteTarget && (
          <ConfirmDeleteModal
            item={deleteTarget}
            onConfirm={confirmDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}

        {notification && (
          <div
            className={`fixed bottom-6 right-6 z-50 rounded-xl border px-4 py-3 shadow-lg transition-all duration-300 ${
              notification.type === "success"
                ? "border-emerald-500/30 bg-emerald-900/90 text-emerald-200"
                : "border-red-500/30 bg-red-900/90 text-red-200"
            }`}
          >
            <p className="text-sm font-medium">{notification.msg}</p>
          </div>
        )}
    </AdminLayout>
  )
}

export default MediaLibrary
