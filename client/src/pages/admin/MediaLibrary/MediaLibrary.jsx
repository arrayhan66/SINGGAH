import { useState, useMemo, useRef, useCallback, useEffect, createElement } from "react"
import {
  Image, Upload, Search, Trash2, Copy, Check,
  Grid3X3, List, FileImage, FileText, FileArchive,
  FileVideo, File, X, Download, ExternalLink,
  AlertTriangle, Files, Database, LayoutGrid
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

function getFileCategory(mime) {
  if (!mime) return "document"
  if (mime.startsWith("image/")) return "image"
  if (mime.startsWith("video/")) return "video"
  return "document"
}

function FileIcon({ mime, size = 16, className = "" }) {
  return createElement(getFileIcon(mime), { size, className })
}

function MediaCard({ item, view, onPreview, onCopy, onDelete, copiedId }) {
  if (view === "grid") {
    return (
      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl transition-all duration-300 hover:-translate-y-[2px] hover:border-cyan-400/30 hover:bg-white/[0.09] hover:shadow-[0_0_30px_-6px_rgba(34,211,238,0.15)]">
        <div className="relative aspect-[4/3] overflow-hidden bg-brand-navy">
          {isPreviewable(item.type) ? (
            <img
              src={item.url}
              alt={item.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onClick={() => onPreview(item)}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <FileIcon mime={item.type} size={40} className="text-slate-500" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {isPreviewable(item.type) && (
              <button
                onClick={() => onPreview(item)}
                className="cursor-pointer rounded-lg bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors"
                title="Preview"
                aria-label={`Preview ${item.name}`}
              >
                <ExternalLink size={14} />
              </button>
            )}
            <button
              onClick={() => onCopy(item)}
              className="cursor-pointer rounded-lg bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors"
              title="Salin URL"
              aria-label={`Salin URL ${item.name}`}
            >
              {copiedId === item.id ? <Check size={14} /> : <Copy size={14} />}
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="cursor-pointer rounded-lg bg-black/60 p-1.5 text-white hover:bg-red-500/80 transition-colors"
              title="Hapus"
              aria-label={`Hapus ${item.name}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <div className="p-3.5">
          <p className="truncate text-sm font-medium text-white">{item.name}</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="truncate rounded-md border border-white/[0.06] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
              {getFileTypeLabel(item.type)}
            </span>
            <span className="shrink-0 text-xs text-slate-500">{item.size}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <tr className="border-b border-white/5 transition-colors hover:bg-white/[0.04] last:border-0">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg overflow-hidden bg-brand-navy cursor-pointer"
            onClick={() => onPreview(item)}
          >
            {isPreviewable(item.type) ? (
              <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
            ) : (
              <FileIcon mime={item.type} size={20} className="text-slate-500" />
            )}
          </div>
          <div className="min-w-0">
            <p
              className="truncate max-w-[220px] text-sm font-medium text-white cursor-pointer hover:text-cyan-300 transition-colors"
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
        <span className="rounded-md border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 text-xs font-medium text-cyan-300">{item.usedIn || 0} kali</span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onCopy(item)}
            className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-cyan-300 transition-colors"
            title="Salin URL"
            aria-label={`Salin URL ${item.name}`}
          >
            {copiedId === item.id ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-red-400 transition-colors"
            title="Hapus"
            aria-label={`Hapus ${item.name}`}
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="animate-modal-in relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-brand-navy/95 via-brand-dark/95 to-slate-900/95 shadow-2xl shadow-black/50 backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <FileIcon mime={item.type} size={16} className="shrink-0 text-cyan-300" />
            <p className="truncate text-sm font-medium text-white">{item.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={item.url}
              download={item.name}
              className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
              title="Download"
              aria-label={`Download ${item.name}`}
            >
              <Download size={16} />
            </a>
            <button
              onClick={onClose}
              className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
              aria-label="Tutup preview"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center p-2 bg-black/20 max-h-[70vh] overflow-auto">
          {isPreviewable(item.type) ? (
            <img src={item.url} alt={item.name} className="max-h-[65vh] max-w-full rounded-lg object-contain" />
          ) : (
            <div className="flex flex-col items-center gap-3 py-16">
              <FileIcon mime={item.type} size={64} className="text-slate-500" />
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
            <p className="text-cyan-300 font-mono truncate">{item.url}</p>
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
  if (!item) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4"
      onClick={onCancel}
    >
      <div
        className="animate-modal-in w-full max-w-sm rounded-3xl border border-white/[0.06] bg-gradient-to-br from-brand-navy/95 via-brand-dark/95 to-slate-900/95 p-6 shadow-2xl shadow-black/50 backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-600/20 border border-red-500/30">
            <div className="absolute inset-0 rounded-2xl bg-red-500/10 animate-pulse" />
            <AlertTriangle className="relative h-5 w-5 text-red-400" />
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Batal hapus"
          >
            <X size={16} />
          </button>
        </div>

        <h3 className="mt-5 text-lg font-bold text-white">Hapus File</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-400 min-w-0 break-words">
          Kamu akan menghapus file{" "}
          <span className="font-semibold text-cyan-300">&quot;{item.name}&quot;</span>.
          File yang sudah dihapus tidak akan tersedia lagi untuk project atau berita.
        </p>
        <p className="mt-2 text-xs font-medium text-red-400/80">
          Tindakan ini tidak bisa dibatalkan.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 cursor-pointer rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-300 transition-all hover:bg-white/10 hover:text-white"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onConfirm(item.id)}
            className="flex-1 cursor-pointer rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/30 transition-all hover:from-red-600 hover:to-rose-700 hover:shadow-red-500/50 hover:-translate-y-0.5 active:translate-y-0"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  )
}

const typeTabs = [
  { value: "all", label: "Semua", icon: LayoutGrid },
  { value: "image", label: "Gambar", icon: Image },
  { value: "video", label: "Video", icon: FileVideo },
  { value: "document", label: "Dokumen", icon: FileText },
]

function MediaLibrary() {
  const [media, setMedia] = useState([])
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
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
    return media.filter((m) => {
      const matchSearch = m.name.toLowerCase().includes(s)
      const matchType = typeFilter === "all" || getFileCategory(m.type) === typeFilter
      return matchSearch && matchType
    })
  }, [media, search, typeFilter])

  const totalSize = useMemo(() => {
    const total = media.reduce((acc, m) => acc + (m.rawBytes || 0), 0)
    return formatBytes(total)
  }, [media])

  const stats = useMemo(() => ({
    total: media.length,
    images: media.filter((m) => m.type?.startsWith("image/")).length,
    videos: media.filter((m) => m.type?.startsWith("video/")).length,
    documents: media.filter((m) => m.type && !m.type.startsWith("image/") && !m.type.startsWith("video/")).length,
  }), [media])

  const typeCounts = useMemo(() => ({
    all: media.length,
    image: stats.images,
    video: stats.videos,
    document: stats.documents,
  }), [media, stats])

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setPreviewItem(null)
        setDeleteTarget(null)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

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

  const statCards = [
    { key: "total", label: "Total File", value: stats.total, icon: Files, iconBg: "bg-cyan-500/10", iconColor: "text-cyan-400" },
    { key: "images", label: "Gambar", value: stats.images, icon: Image, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-400" },
    { key: "documents", label: "Dokumen", value: stats.documents, icon: FileText, iconBg: "bg-blue-500/10", iconColor: "text-blue-400" },
    { key: "size", label: "Total Ukuran", value: totalSize, icon: Database, iconBg: "bg-violet-500/10", iconColor: "text-violet-400" },
  ]

  return (
    <AdminLayout>
      <AdminHeroBackground fullWidth>
        <div className="px-4 md:px-6 lg:px-8 pt-8 md:pt-10">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 border border-cyan-400/30 sm:h-16 sm:w-16">
              <Image className="h-7 w-7 text-cyan-300 sm:h-8 sm:w-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Media <span className="text-cyan-300">Library</span>
              </h1>
              <p className="mt-1 text-sm text-slate-400 max-w-xl">Kelola semua file dan gambar yang diupload.</p>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-6 lg:px-8 py-5 md:py-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 backdrop-blur-xl md:px-6 md:py-5">
            <div className="grid grid-cols-2 gap-x-4 gap-y-5 min-[500px]:grid-cols-4 min-[500px]:gap-0 min-[500px]:divide-x min-[500px]:divide-white/[0.06]">
              {statCards.map((stat) => {
                const Icon = stat.icon
                return (
                  <div
                    key={stat.key}
                    className="group flex items-center gap-3 min-w-0 min-[500px]:px-5 min-[500px]:first:pl-0"
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-105 ${stat.iconBg}`}>
                      <Icon className={`h-[18px] w-[18px] ${stat.iconColor}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-lg font-bold text-white leading-tight md:text-xl tabular-nums">
                        {stat.value}
                      </p>
                      <p className="truncate text-[11px] text-slate-400 leading-tight">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="px-4 md:px-6 lg:px-8 pb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari file..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none shadow-sm focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div
                className="flex items-center rounded-xl border border-white/10 bg-white/5 p-1"
                role="group"
                aria-label="Tampilan media"
              >
                <button
                  onClick={() => setView("list")}
                  className={`cursor-pointer rounded-lg p-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400/40 focus-visible:outline-none ${view === "list" ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400 hover:text-white"}`}
                  title="Tampilan daftar"
                  aria-label="Tampilan daftar"
                  aria-pressed={view === "list"}
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => setView("grid")}
                  className={`cursor-pointer rounded-lg p-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400/40 focus-visible:outline-none ${view === "grid" ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400 hover:text-white"}`}
                  title="Tampilan grid"
                  aria-label="Tampilan grid"
                  aria-pressed={view === "grid"}
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
                className="group flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-500 hover:bg-[position:100%_0] focus-visible:ring-2 focus-visible:ring-cyan-400/40 focus-visible:outline-none"
              >
                <Upload size={16} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
                Upload File
              </button>
            </div>
          </div>

          <div className="mt-4 flex w-fit flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
            {typeTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = typeFilter === tab.value
              const count = typeCounts[tab.value]
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setTypeFilter(tab.value)}
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-cyan-400/40 focus-visible:outline-none ${
                    isActive
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                  aria-pressed={isActive}
                >
                  <Icon
                    className={`h-3.5 w-3.5 transition-colors duration-200 ${isActive ? "text-cyan-300" : "text-slate-500"}`}
                  />
                  {tab.label}
                  {count !== undefined && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                        isActive
                          ? "bg-cyan-500/20 text-cyan-300"
                          : "bg-white/[0.07] text-slate-400"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </AdminHeroBackground>

      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="px-4 md:px-6 lg:px-8 pt-6 md:pt-8 pb-12"
      >
        {isDragging && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-cyan-900/20 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-cyan-400/50 bg-slate-900/90 px-12 py-10 shadow-2xl">
              <Upload className="h-10 w-10 text-cyan-400" />
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
                className="mt-2 flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-500 hover:bg-[position:100%_0]"
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
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.03]">
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
          className={`animate-slide-down fixed bottom-6 right-6 z-50 rounded-xl border px-4 py-3 shadow-2xl shadow-black/50 backdrop-blur-xl transition-all duration-300 ${
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
