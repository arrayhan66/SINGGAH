import { useState } from "react"
import { Trash2, Copy, Check, ExternalLink, Eye, Image as ImageIcon } from "lucide-react"
import {
  getFileTypeLabel,
  getFileThumbStyle,
  getDocumentPreviewUrl,
  isPreviewable,
  formatDate,
} from "../../../../utils/mediaHelpers"
import SmartImage from "../../../ui/SmartImage"

function FileSheet({ mime, compact = false }) {
  const style = getFileThumbStyle(mime)
  const isImage = mime?.startsWith("image/")
  const isPresentation =
    mime?.includes("powerpoint") || mime?.includes("presentation") || mime?.includes("ppt")

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br ${style.bg}`}
    >
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-black/20 blur-2xl" />
      <div className="relative flex w-[70%] items-center justify-center">
        <div className="absolute left-[4%] top-[6%] h-full w-full rotate-6 rounded-lg border border-white/15 bg-white/[0.09]" />
        <div className="relative flex aspect-[5/4] w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-white/25 bg-white/95 shadow-lg shadow-black/30">
          {isImage ? (
            <ImageIcon
              className={`${compact ? "h-3.5 w-3.5" : "h-5 w-5"} text-fuchsia-600`}
            />
          ) : isPresentation ? (
            <svg
              className={`${compact ? "h-3.5 w-3.5" : "h-5 w-5"} text-orange-500`}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M5 4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4Zm3 4.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm1.8 3.6-1.8 2.4h4l-1.8-1.5 1.2-1.2 1.3 1 .6-.7-1.6-1.2.5.2-1.4.5Z" />
            </svg>
          ) : (
            <svg
              className={`${compact ? "h-3.5 w-3.5" : "h-5 w-5"} text-slate-500`}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M6 2h7l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm6.5 1.5V8H16L12.5 3.5Z" />
            </svg>
          )}
          <span
            className={`font-black uppercase tracking-widest text-slate-900 ${
              compact ? "text-[9px]" : "text-sm sm:text-lg"
            }`}
          >
            {style.label}
          </span>
        </div>
      </div>
    </div>
  )
}

function MediaThumb({ item, className = "", compact = false }) {
  const [useSheet, setUseSheet] = useState(false)
  const docPreviewUrl = getDocumentPreviewUrl(item)
  const showDocPreview = docPreviewUrl !== item.url
  if ((isPreviewable(item.type) || showDocPreview) && !useSheet) {
    return (
      <SmartImage
        src={showDocPreview ? docPreviewUrl : item.url}
        alt={item.name}
        className={`h-full w-full object-cover ${className}`}
        onError={() => setUseSheet(true)}
      />
    )
  }
  return <FileSheet mime={item.type} compact={compact} />
}

export default function MediaCard({
  item,
  view,
  onPreview,
  onCopy,
  onDelete,
  copiedId,
}) {
  const style = getFileThumbStyle(item.type)

  if (view === "grid") {
    return (
      <div className="admin-media-card group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-800/70 shadow-lg shadow-black/20 transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-cyan-500/10">
        <div
          className="admin-media-thumb relative aspect-[4/3] cursor-pointer overflow-hidden bg-brand-navy"
          onClick={() => onPreview(item)}
        >
          <div className="h-full w-full">
            <MediaThumb
              item={item}
              className="transition-transform duration-500 group-hover:scale-[1.06]"
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <span
            className={`media-chip absolute left-3 top-3 border border-white/15 px-2 py-1 backdrop-blur-md ${style.chipClass}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${style.accent}`} />
            {getFileTypeLabel(item.type)}
          </span>

          <div className="absolute bottom-2 right-2 flex gap-1 opacity-100 transition-all duration-300 sm:opacity-0 sm:group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onPreview(item)
              }}
              className="cursor-pointer rounded-lg bg-black/60 p-1.5 text-white backdrop-blur-sm hover:bg-black/80 transition-colors"
              title="Preview"
              aria-label={`Preview ${item.name}`}
            >
              <ExternalLink size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onCopy(item)
              }}
              className="cursor-pointer rounded-lg bg-black/60 p-1.5 text-white backdrop-blur-sm hover:bg-black/80 transition-colors"
              title="Salin URL"
              aria-label={`Salin URL ${item.name}`}
            >
              {copiedId === item.id ? <Check size={14} /> : <Copy size={14} />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(item.id)
              }}
              className="cursor-pointer rounded-lg bg-black/60 p-1.5 text-white backdrop-blur-sm hover:bg-red-500/80 transition-colors"
              title="Hapus"
              aria-label={`Hapus ${item.name}`}
            >
              <Trash2 size={14} />
            </button>
          </div>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
            <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md">
              <Eye size={12} /> Lihat
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-3.5 min-w-0">
          <p className="admin-media-name truncate text-sm font-medium text-slate-100 transition-colors group-hover:text-white">
            {item.name}
          </p>
          <div className="mt-auto flex items-center justify-between gap-2">
            <span className="admin-media-size shrink-0 text-xs text-slate-500">
              {item.size}
            </span>
          </div>
        </div>

        <div
          className={`pointer-events-none absolute inset-x-0 top-0 z-10 h-[3px] origin-left scale-x-0 bg-gradient-to-r ${style.accent} transition-transform duration-500 ease-out group-hover:scale-x-100`}
        />
      </div>
    )
  }

  return (
    <tr className="border-b border-white/5 transition-colors hover:bg-white/[0.04] last:border-0">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl"
            onClick={() => onPreview(item)}
          >
            <MediaThumb item={item} compact />
          </div>
          <div className="min-w-0">
            <p
              className="truncate max-w-[220px] text-sm font-medium text-white cursor-pointer hover:text-cyan-300 transition-colors"
              onClick={() => onPreview(item)}
            >
              {item.name}
            </p>
            <p className="text-xs text-slate-500">
              {item.uploadedAt ? formatDate(item.uploadedAt) : "Baru saja"}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`media-chip ${style.chipClass}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${style.accent}`} />
          {getFileTypeLabel(item.type)}
        </span>
      </td>
      <td className="px-4 py-3 text-slate-400">{item.size}</td>
      <td className="px-4 py-3 text-slate-400">
        {item.uploadedAt ? formatDate(item.uploadedAt) : "Baru saja"}
      </td>
      <td className="px-4 py-3">
        <span className="rounded-md border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 text-xs font-medium text-cyan-300">
          {item.usedIn || 0} kali
        </span>
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