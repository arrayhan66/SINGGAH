import { createElement } from "react"
import { Trash2, Copy, Check, ExternalLink } from "lucide-react"
import {
  getFileIcon,
  getFileTypeLabel,
  isPreviewable,
  formatDate,
} from "../../../../utils/mediaHelpers"

function FileIcon({ mime, size = 16, className = "" }) {
  return createElement(getFileIcon(mime), { size, className })
}

export default function MediaCard({
  item,
  view,
  onPreview,
  onCopy,
  onDelete,
  copiedId,
}) {
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
          <p className="truncate text-sm font-medium text-white">
            {item.name}
          </p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="truncate rounded-md border border-white/[0.06] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
              {getFileTypeLabel(item.type)}
            </span>
            <span className="shrink-0 text-xs text-slate-500">
              {item.size}
            </span>
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
              <img
                src={item.url}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <FileIcon
                mime={item.type}
                size={20}
                className="text-slate-500"
              />
            )}
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
      <td className="px-4 py-3 text-slate-400">
        {getFileTypeLabel(item.type)}
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
