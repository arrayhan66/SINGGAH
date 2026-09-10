import { createElement, useState } from "react"
import { X, Download, ExternalLink, Copy, Check, Calendar, Scale, Link2 } from "lucide-react"
import {
  getFileIcon,
  getFileTypeLabel,
  getFileThumbStyle,
  getDocumentPreviewUrl,
  isPreviewable,
  isPdf,
  formatDate,
} from "../../../../utils/mediaHelpers"
import SmartImage from "../../../ui/SmartImage"
import useLockBodyScroll from "../../../../hooks/useLockBodyScroll"
import api from "../../../../services/api"

function FileIcon({ mime, size = 16, className = "" }) {
  return createElement(getFileIcon(mime), { size, className })
}

export default function PreviewModal({ item, onClose }) {
  const [copied, setCopied] = useState(false)
  const isOpen = Boolean(item)
  useLockBodyScroll(isOpen)
  if (!item) return null

  const style = getFileThumbStyle(item.type)
  const previewUrl = getDocumentPreviewUrl(item)
  const showDocAsImage = previewUrl !== item.url

  function copyUrl() {
    navigator.clipboard?.writeText(item.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  function recordUsage(type) {
    api
      .post("/media/usage", { publicId: item.publicId, type })
      .catch(() => {})
  }

  function downloadFile() {
    recordUsage("download")
    fetch(item.url)
      .then((res) => res.blob())
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = objectUrl
        a.download = item.name
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(objectUrl)
      })
      .catch(() => {
        const a = document.createElement("a")
        a.href = item.url
        a.download = item.name
        document.body.appendChild(a)
        a.click()
        a.remove()
      })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="animate-modal-in admin-preview-modal relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-y-auto rounded-3xl border border-white/[0.06] bg-gradient-to-br from-brand-navy/95 via-brand-dark/95 to-slate-900/95 shadow-2xl shadow-black/50 backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r ${style.accent}`}
        />

        <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${style.bg} shadow-lg shadow-black/30`}
            >
              <FileIcon mime={item.type} size={20} className="admin-preview-head-icon text-white drop-shadow" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {item.name}
              </p>
              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                <span className={`media-chip ${style.chipClass}`}>
                  {getFileTypeLabel(item.type)}
                </span>
                <span className="truncate">{item.size}</span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => recordUsage("view")}
              className="hidden cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-500 hover:bg-[position:100%_0] sm:inline-flex"
            >
              <ExternalLink size={14} />
              Buka di Tab Baru
            </a>
            <button
              type="button"
              onClick={downloadFile}
              className="cursor-pointer rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              title="Download"
              aria-label={`Download ${item.name}`}
            >
              <Download size={16} />
            </button>
            <button
              onClick={onClose}
              className="cursor-pointer rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Tutup preview"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div
          className="flex flex-1 flex-col overflow-auto bg-black/20"
          style={{ minHeight: "50vh" }}
        >
          {isPreviewable(item.type) || showDocAsImage ? (
            <div className="admin-preview-checkerboard flex items-center justify-center p-4">
              <SmartImage
                src={previewUrl}
                alt={item.name}
                className="max-h-[62vh] max-w-full rounded-xl object-contain shadow-2xl shadow-black/40"
              />
            </div>
          ) : isPdf(item.type) ? (
            <div className="admin-preview-pdf relative flex h-full flex-col">
              <iframe
                src={item.url}
                title={item.name}
                className="h-full w-full border-0"
                style={{ minHeight: "50vh" }}
              />
              <div className="pointer-events-none absolute inset-x-4 top-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-xl">
                <span className="flex items-center gap-2 text-xs text-slate-300">
                  <FileIcon mime={item.type} size={14} className="text-rose-300" />
                  Pratinjau dokumen
                </span>
                <span className="media-chip media-chip-pdf border border-white/15 px-2 py-0.5 backdrop-blur-sm">
                  <span className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${style.accent}`} />
                  PDF
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${style.bg} shadow-xl shadow-black/30`}
              >
                <FileIcon mime={item.type} size={36} className="text-white" />
              </div>
              <p className="text-sm text-slate-400">File tidak dapat dipreview</p>
              <button
                type="button"
                onClick={downloadFile}
                className={`admin-preview-download flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-br ${style.bg} px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/25 transition-all duration-300 hover:brightness-110 active:scale-95`}
              >
                <Download size={16} />
                Download File
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2.5 border-t border-white/[0.06] px-5 py-4">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <div className="admin-preview-meta-item flex min-w-0 items-center gap-2.5 rounded-xl px-3 py-2.5">
              <div
                className={`admin-preview-meta-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br shadow-md shadow-black/25 ${style.bg}`}
              >
                <FileIcon mime={item.type} size={15} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Tipe
                </p>
                <p className="flex min-w-0 items-center gap-1.5">
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r ${style.accent}`}
                  />
                  <span className="truncate text-xs font-semibold text-white">
                    {getFileTypeLabel(item.type)}
                  </span>
                </p>
              </div>
            </div>

            <div className="admin-preview-meta-item flex min-w-0 items-center gap-2.5 rounded-xl px-3 py-2.5">
              <div className="admin-preview-meta-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
                <Scale size={15} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Ukuran
                </p>
                <p className="truncate text-xs font-semibold text-white">{item.size}</p>
              </div>
            </div>

            <div className="admin-preview-meta-item flex min-w-0 items-center gap-2.5 rounded-xl px-3 py-2.5">
              <div className="admin-preview-meta-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
                <Calendar size={15} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Diupload
                </p>
                <p className="truncate text-xs font-semibold text-white">
                  {item.uploadedAt ? formatDate(item.uploadedAt) : "Baru saja"}
                </p>
              </div>
            </div>
          </div>

          <div className="admin-preview-urlbar flex items-center gap-2.5 rounded-xl px-3 py-2">
            <Link2 className="h-4 w-4 shrink-0 text-cyan-300" />
            <p className="min-w-0 flex-1 truncate font-mono text-[11px] text-slate-400" title={item.url}>
              {item.url}
            </p>
            <button
              onClick={copyUrl}
              className="admin-preview-urlbtn shrink-0"
              title="Salin URL"
              aria-label="Salin URL"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => recordUsage("view")}
              className="admin-preview-urlbtn shrink-0"
              title="Buka URL"
              aria-label="Buka URL"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}