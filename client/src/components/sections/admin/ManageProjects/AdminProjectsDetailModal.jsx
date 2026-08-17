import { useState, useEffect, useRef } from "react"
import {
  X, CheckCircle2, XCircle, Clock, Tag, Calendar, Heart, Eye, Layers,
  FileText, AlertTriangle, Pencil, Trash2, Globe,
} from "lucide-react"
import { imageUrl } from "../../../../utils/imageUrl"

const statusConfig = {
  published: {
    label: "Dipublikasikan",
    icon: Globe,
    chip: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
    softBg: "bg-cyan-500/10",
    softColor: "text-cyan-400",
  },
  approved: {
    label: "Disetujui",
    icon: CheckCircle2,
    chip: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    softBg: "bg-emerald-500/10",
    softColor: "text-emerald-400",
  },
  rejected: {
    label: "Ditolak",
    icon: XCircle,
    chip: "border-red-400/30 bg-red-400/10 text-red-300",
    softBg: "bg-red-500/10",
    softColor: "text-red-400",
  },
  pending: {
    label: "Menunggu Review",
    icon: Clock,
    chip: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    softBg: "bg-amber-500/10",
    softColor: "text-amber-400",
  },
}

function AdminProjectsDetailModal({ project, onApproveClick, onRejectClick, onClose, onEdit, onDelete }) {
  const [visible, setVisible] = useState(false)
  const [activeImage, setActiveImage] = useState(null)
  const closeButtonRef = useRef(null)

  useEffect(() => {
    if (!project) return undefined
    document.body.style.overflow = "hidden"
    closeButtonRef.current?.focus()
    const timer = setTimeout(() => {
      setVisible(true)
      setActiveImage(null)
    }, 10)
    return () => {
      clearTimeout(timer)
      document.body.style.overflow = "unset"
    }
  }, [project])

  if (!project) return null

  const config = statusConfig[project.status] || statusConfig.pending
  const StatusIcon = config.icon
  const techStack = Array.isArray(project.technologies) ? project.technologies : []
  const allImages = Array.from(
    new Set([
      project.thumbnail,
      ...(Array.isArray(project.images) ? project.images : []).map((img) => img.image_url),
    ]),
  ).filter(Boolean)
  const currentImage = imageUrl(activeImage || project.thumbnail)

  function formatDate(value) {
    if (!value) return "—"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
  }

  function handleClose() {
    setVisible(false)
    setTimeout(() => onClose(), 200)
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) handleClose()
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") handleClose()
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-detail-title"
        className={`relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-brand-navy to-brand-dark shadow-2xl backdrop-blur-xl transition-all duration-200 ${
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-brand-navy/90 px-5 py-4 backdrop-blur-md">
          <div className="flex min-w-0 items-center gap-3">
            <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${config.chip}`}>
              <StatusIcon size={12} />
              {config.label}
            </span>
            <span className="hidden min-[300px]:inline text-xs text-slate-500">ID: #{project.id}</span>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            aria-label="Tutup detail project"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={16} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
            <main className="min-w-0 p-4 min-[400px]:p-5 md:p-6">
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-brand-dark">
                <div className="aspect-video w-full">
                  <img
                    src={currentImage}
                    alt={project.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent" />
                <span className={`absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium backdrop-blur-md ${config.chip}`}>
                  <StatusIcon size={11} />
                  {config.label}
                </span>
              </div>

              {allImages.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {allImages.map((img, i) => {
                    const active = img === currentImage
                    return (
                      <button
                        key={`${img}-${i}`}
                        type="button"
                        onClick={() => setActiveImage(img)}
                        aria-label={`Lihat gambar ${i + 1}`}
                        aria-pressed={active}
                        className={`relative h-12 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 min-[400px]:h-16 min-[400px]:w-24 ${
                          active
                            ? "border-cyan-400 shadow-[0_0_16px_-4px_rgba(34,211,238,0.6)]"
                            : "border-white/10 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={img} alt="" loading="lazy" className="h-full w-full object-cover" />
                        {active && (
                          <span className="absolute inset-x-0 bottom-0 flex h-6 items-center justify-center bg-cyan-400/20 backdrop-blur-sm">
                            <CheckCircle2 className="h-3.5 w-3.5 text-cyan-300" />
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}

              <h2
                id="project-detail-title"
                className="mt-5 text-xl font-bold leading-snug text-white md:text-2xl"
              >
                {project.title}
              </h2>

              {project.description && (
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {project.description}
                </p>
              )}

              <div className="mt-5 flex w-fit items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1.5">
                <span className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-slate-400">
                  <Heart className="h-3.5 w-3.5 text-pink-400/80" />
                  <strong className="font-semibold tabular-nums text-white">{project.likesCount ?? 0}</strong>
                  Suka
                </span>
                <span className="h-4 w-px bg-white/10" />
                <span className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-slate-400">
                  <Eye className="h-3.5 w-3.5 text-cyan-400/80" />
                  <strong className="font-semibold tabular-nums text-white">{project.viewsCount ?? 0}</strong>
                  Dilihat
                </span>
              </div>

              {techStack.length > 0 && (
                <div className="mt-6">
                  <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <Layers className="h-3.5 w-3.5" />
                    Teknologi
                  </h4>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {techStack.map((tech, i) => (
                      <span
                        key={i}
                        className="rounded-lg border border-cyan-400/15 bg-cyan-400/5 px-2.5 py-1 text-xs font-medium text-cyan-300/90"
                      >
                        {typeof tech === "string" ? tech : tech?.name || ""}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {project.status === "rejected" && project.rejection_reason && (
                <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-red-400">Alasan Penolakan</h4>
                      <p className="mt-1 text-sm leading-relaxed text-red-200/80">
                        {project.rejection_reason}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {project.status === "approved" && (
                <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-emerald-400">Project Disetujui</h4>
                      <p className="mt-1 text-sm leading-relaxed text-emerald-200/80">
                        {project.approveNote || "Project ini sudah disetujui dan ditampilkan di halaman Karya."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </main>

            <aside className="flex flex-col gap-4 border-t border-white/10 p-5 md:p-6 lg:border-l lg:border-t-0">
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-bold text-white shadow-sm">
                    {project.User?.name?.charAt(0) || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {project.User?.name || "—"}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {project.User?.nim || ""}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <FileText className="h-3.5 w-3.5" />
                  Detail Project
                </h4>
                <dl className="mt-3 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="flex items-center gap-2 text-xs text-slate-500">
                      <Tag className="h-3.5 w-3.5" />
                      Kategori
                    </dt>
                    <dd className="min-w-0 truncate text-xs font-medium text-slate-200">
                      {project.Category?.name || "—"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />
                      Tahun
                    </dt>
                    <dd className="text-xs font-medium text-slate-200">{project.year || "—"}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      Dikirim
                    </dt>
                    <dd className="text-right text-xs font-medium text-slate-200">
                      {formatDate(project.created_at)}
                    </dd>
                  </div>
                </dl>
              </div>

              {project.status === "pending" ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Keputusan Review
                  </h4>
                  <div className="mt-3 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => onApproveClick(project)}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 active:scale-[0.98]"
                    >
                      <CheckCircle2 size={16} />
                      Setujui
                    </button>
                    <button
                      type="button"
                      onClick={() => onRejectClick(project)}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20 active:scale-[0.98]"
                    >
                      <XCircle size={16} />
                      Tolak
                    </button>
                  </div>
                  <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
                    Project akan langsung tampil di halaman Karya setelah disetujui.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Status
                  </h4>
                  <div className="mt-3 flex items-center gap-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.softBg}`}>
                      <StatusIcon className={`h-5 w-5 ${config.softColor}`} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{config.label}</p>
                      <p className="text-xs text-slate-500">ID: #{project.id}</p>
                    </div>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>

        <footer className="flex items-center gap-2 border-t border-white/10 bg-brand-navy/90 px-5 py-3 backdrop-blur-md">
          <button
            type="button"
            onClick={() => onEdit?.(project)}
            className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2.5 text-sm font-medium text-cyan-300 transition hover:bg-cyan-400/20"
          >
            <Pencil size={15} />
            Edit Project
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(project)}
            className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
          >
            <Trash2 size={15} />
            Hapus Project
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={handleClose}
            className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Tutup
          </button>
        </footer>
      </div>
    </div>
  )
}

export default AdminProjectsDetailModal
