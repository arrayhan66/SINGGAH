import { createElement } from "react"
import { X, Download } from "lucide-react"
import {
  getFileIcon,
  getFileTypeLabel,
  isPreviewable,
  isPdf,
  formatDate,
} from "../../../../utils/mediaHelpers"

function FileIcon({ mime, size = 16, className = "" }) {
  return createElement(getFileIcon(mime), { size, className })
}

export default function PreviewModal({ item, onClose }) {
  if (!item) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="animate-modal-in relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-brand-navy/95 via-brand-dark/95 to-slate-900/95 shadow-2xl shadow-black/50 backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <FileIcon
              mime={item.type}
              size={16}
              className="shrink-0 text-cyan-300"
            />
            <p className="truncate text-sm font-medium text-white">
              {item.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-400/10 border border-cyan-400/30 hover:bg-cyan-400/20 transition-colors"
            >
              Buka di Tab Baru
            </a>
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
        <div
          className="flex-1 overflow-auto bg-black/20"
          style={{ minHeight: "50vh" }}
        >
          {isPreviewable(item.type) ? (
            <div className="flex items-center justify-center p-2">
              <img
                src={item.url}
                alt={item.name}
                className="max-h-[65vh] max-w-full rounded-lg object-contain"
              />
            </div>
          ) : isPdf(item.type) ? (
            <iframe
              src={item.url}
              title={item.name}
              className="h-full w-full border-0"
              style={{ minHeight: "50vh" }}
            />
          ) : (
            <div className="flex flex-col items-center gap-4 py-16">
              <FileIcon mime={item.type} size={64} className="text-slate-500" />
              <p className="text-sm text-slate-400">File tidak dapat dipreview</p>
              <a
                href={item.url}
                download={item.name}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-500 hover:bg-[position:100%_0]"
              >
                <Download size={16} />
                Download File
              </a>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 border-t border-white/[0.06] px-5 py-3 text-xs">
          <div>
            <p className="text-slate-500">Tipe</p>
            <p className="text-white font-medium">
              {getFileTypeLabel(item.type)}
            </p>
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
            <p className="text-white font-medium">
              {item.uploadedAt ? formatDate(item.uploadedAt) : "Baru saja"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
