import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { Clock, CheckCircle2, XCircle, Eye, Heart, Calendar, Tag, Globe, Pencil, Trash2, Star, Crown, Lock, Plus } from "lucide-react"
import { imageUrl } from "../../../../utils/imageUrl"
import toast from "../../../../utils/toast"
import SmartImage from "../../../ui/SmartImage"
import UserAvatar from "../../../ui/UserAvatar"

const statusConfig = {
  pending: {
    label: "Menunggu Review",
    icon: Clock,
    className: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    dot: "bg-amber-400",
  },
  published: {
    label: "Dipublikasikan",
    icon: Globe,
    className: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
    dot: "bg-cyan-400",
  },
  rejected: {
    label: "Ditolak",
    icon: XCircle,
    className: "border-red-400/30 bg-red-400/10 text-red-300",
    dot: "bg-red-400",
  },
}

function AdminProjectsCard({ project, onViewDetail, onQuickApprove, onQuickReject, onEdit, onDelete, onSetFeatured, featuredBySlot = {} }) {
  const [featuredMenuOpen, setFeaturedMenuOpen] = useState(false)
  const [featuredMenuPos, setFeaturedMenuPos] = useState(null)
  const starBtnRef = useRef(null)
  const status =
    statusConfig[project.status] || {
      label: project.status || "Status",
      icon: Clock,
      className: "border-slate-400/30 bg-slate-400/10 text-slate-300",
      dot: "bg-slate-400",
    }
  const StatusIcon = status.icon
  const categoryName = project.Category?.name || ""

  // Slot unggulan bersifat per PORTAL (kategori): okupasi dihitung dari semua
  // karya dalam kategori yang sama, apa pun jenis author (mahasiswa/dosen).
  const scopeKey = String(project.category_id ?? project.Category?.id ?? "")
  const scopedFeatured = featuredBySlot?.[scopeKey] || {}

  const PANEL_WIDTH = 224

  function computeMenuPos() {
    const rect = starBtnRef.current?.getBoundingClientRect()
    if (!rect) return null
    return {
      top: Math.max(8, rect.bottom + 8),
      left: Math.max(8, rect.right - PANEL_WIDTH + 14),
    }
  }

  function toggleFeaturedMenu(e) {
    e.stopPropagation()
    if (featuredMenuOpen) {
      setFeaturedMenuOpen(false)
      return
    }
    setFeaturedMenuPos(computeMenuPos())
    setFeaturedMenuOpen(true)
  }

  function closeFeaturedMenu() {
    setFeaturedMenuOpen(false)
  }

  useEffect(() => {
    if (!featuredMenuOpen) return undefined
    const updatePos = () => {
      setFeaturedMenuPos(computeMenuPos())
    }
    const handleKey = (e) => {
      if (e.key === "Escape") setFeaturedMenuOpen(false)
    }
    window.addEventListener("scroll", updatePos, true)
    window.addEventListener("resize", updatePos)
    window.addEventListener("keydown", handleKey)
    return () => {
      window.removeEventListener("scroll", updatePos, true)
      window.removeEventListener("resize", updatePos)
      window.removeEventListener("keydown", handleKey)
    }
  }, [featuredMenuOpen])

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.09] to-white/[0.04] shadow-lg shadow-black/10 backdrop-blur-xl transition-all duration-[250ms] hover:-translate-y-0.5 hover:border-cyan-400/30 hover:shadow-xl hover:shadow-black/20">
      <div
        className="aspect-video w-full overflow-hidden bg-brand-navy relative cursor-pointer"
        onClick={() => onViewDetail(project)}
      >
        <SmartImage
          src={imageUrl(project.thumbnail)}
          alt={project.title}
          className="h-full w-full object-cover transition-all duration-500"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {project.featured_slot && (
          <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full border border-amber-300/50 bg-gradient-to-r from-amber-500/90 to-yellow-400/90 px-2 py-1 text-[10px] font-bold text-amber-950 shadow-md backdrop-blur-sm">
            <Crown className="hidden min-[300px]:max-[499px]:block min-[600px]:block" size={11} />
            <span className="hidden min-[300px]:max-[499px]:inline min-[530px]:inline">Unggulan {project.featured_slot}</span>
            <span className="inline min-[300px]:max-[499px]:hidden min-[530px]:hidden">#{project.featured_slot}</span>
          </span>
        )}

        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          {project.status === "published" && (
            <div className="relative">
              <button
                ref={starBtnRef}
                type="button"
                onClick={toggleFeaturedMenu}
                className={`card-action-btn card-star-btn flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border backdrop-blur-md transition-all shadow-lg ${
                  project.featured_slot
                    ? "card-featured border-amber-400 bg-amber-500 text-amber-950 font-bold hover:bg-amber-400"
                    : "border-blue-400/40 bg-blue-950/90 text-white hover:bg-blue-900 hover:border-blue-300"
                }`}
                title="Karya Unggulan (podium hall 3D)"
                aria-label="Atur karya unggulan"
              >
                <Star className={`h-4 w-4 ${project.featured_slot ? "fill-current" : ""}`} />
              </button>

              {featuredMenuOpen &&
                featuredMenuPos &&
                createPortal(
                  <>
                    <div
                      className="card-featured-overlay fixed inset-0"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        closeFeaturedMenu()
                      }}
                    />
                    <div
                      className="card-featured-menu card-featured-menu-portal fixed w-56 overflow-hidden rounded-2xl border border-cyan-400/25 bg-gradient-to-b from-[#0d1f3c] via-[#0b1628] to-[#081020] shadow-[0_18px_50px_-12px_rgba(34,211,238,0.35),0_12px_32px_-14px_rgba(0,0,0,0.85)] ring-1 ring-white/5 backdrop-blur-xl"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        top: featuredMenuPos.top,
                        left: featuredMenuPos.left,
                      }}
                    >
                    <div className="flex items-center justify-between gap-2 px-3 pt-2.5 pb-2">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-amber-400/15 text-amber-300">
                          <Crown size={11} className="fill-current" />
                        </span>
                        <p className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
                          Karya Unggulan
                        </p>
                      </div>
                      {categoryName && (
                        <span className="max-w-[108px] truncate rounded-full border border-white/5 bg-white/5 px-2 py-0.5 text-[9px] font-semibold text-slate-300">
                          {categoryName}
                        </span>
                      )}
                    </div>
                    <div className="mx-3 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
                    <div className="py-1">
                    {[1, 2].map((slot) => {
                      const occupant = scopedFeatured[slot]
                      const occupiedByOther = Boolean(
                        occupant && String(occupant.id) !== String(project.id),
                      )
                      const isCurrentSlot = Number(project.featured_slot) === slot

                      return (
                        <button
                          key={slot}
                          type="button"
                          aria-disabled={occupiedByOther}
                          onClick={(e) => {
                            e.stopPropagation()
                            setFeaturedMenuOpen(false)
                            if (occupiedByOther) {
                              toast.show(
                                `Slot ${slot} portal ini sudah terisi karya "${occupant.title}". Lepas dulu karya tersebut dari unggulan sebelum mengisi slot ${slot}.`,
                                "error",
                              )
                              return
                            }
                            if (isCurrentSlot) {
                              toast.success(
                                `Karya ini sudah menjadi unggulan slot ${slot}`,
                              )
                              return
                            }
                            onSetFeatured?.(project, slot)
                          }}
                          className={`flex w-full px-3.5 text-xs font-semibold transition-colors ${
                            occupiedByOther
                              ? "card-featured-occupied cursor-not-allowed flex-col items-start gap-1.5 py-2.5 text-red-300/80"
                              : isCurrentSlot
                                ? "cursor-pointer items-center justify-between gap-2 py-2.5 text-amber-300 font-bold"
                                : "cursor-pointer items-center justify-between gap-2 py-2.5 text-white hover:bg-cyan-400/10"
                          }`}
                          title={
                            occupiedByOther
                              ? `Slot ${slot} portal ini sudah terisi oleh "${occupant.title}". Lepas dulu karya tersebut dari unggulan untuk mengisi slot ${slot}.`
                              : isCurrentSlot
                                ? "Karya ini sedang menjadi unggulan slot ini"
                                : `Jadikan karya ini unggulan slot ${slot}`
                          }
                        >
                          {occupiedByOther ? (
                            <>
                              <span className="flex items-center gap-2">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-red-500/15 text-red-300">
                                  <Lock size={11} />
                                </span>
                                <span>Slot {slot}</span>
                              </span>
                              <span
                                className="w-full truncate pl-[26px] text-[10px] font-normal italic opacity-85"
                                title={occupant.title}
                              >
                                terisi: {occupant.title}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="flex items-center gap-2">
                                <span
                                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-black ${
                                    isCurrentSlot
                                      ? "bg-amber-400/15 text-amber-300"
                                      : "border border-white/10 bg-white/5 text-slate-300"
                                  }`}
                                >
                                  {isCurrentSlot ? (
                                    <Crown size={11} className="fill-current" />
                                  ) : (
                                    slot
                                  )}
                                </span>
                                <span>Slot {slot}</span>
                              </span>
                              {isCurrentSlot ? (
                                <span className="shrink-0 rounded-md bg-amber-400/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-300">
                                  Aktif
                                </span>
                              ) : (
                                <Plus size={13} className="shrink-0 text-cyan-300" />
                              )}
                            </>
                          )}
                        </button>
                      )
                    })}
                    </div>
                    {[1, 2].every(
                      (slot) =>
                        scopedFeatured[slot] &&
                        String(scopedFeatured[slot].id) !== String(project.id),
                    ) && (
                      <p className="border-t border-blue-500/30 px-3 py-2 text-[10px] leading-relaxed text-red-300/90">
                        Slot 1 &amp; 2 portal ini sudah penuh. Buka karya
                        pengisi slot lalu pilih "Lepas dari Unggulan" untuk
                        mengosongkannya.
                      </p>
                    )}
                    {project.featured_slot && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setFeaturedMenuOpen(false)
                          onSetFeatured?.(project, null)
                        }}
                        className="flex w-full cursor-pointer items-center gap-1.5 border-t border-blue-500/30 px-3.5 py-2 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/20"
                      >
                        <XCircle size={13} />
                        Lepas dari Unggulan
                      </button>
                    )}
                  </div>
                  </>,
                  document.body,
                )}
            </div>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onEdit?.(project)
            }}
            className="card-action-btn card-edit-btn flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-blue-400/40 bg-blue-950/90 text-white backdrop-blur-md transition-all shadow-lg hover:bg-blue-900 hover:border-blue-300"
            title="Edit karya"
            aria-label="Edit karya"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.(project)
            }}
            className="card-action-btn card-delete-btn flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-red-500/40 bg-red-950/90 text-white backdrop-blur-md transition-all shadow-lg hover:bg-red-900 hover:border-red-400"
            title="Hapus karya"
            aria-label="Hapus karya"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
          <span
            className={`status-pill status-pill-${project.status} inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide backdrop-blur-md ${status.className}`}
          >
            <span className={`status-dot h-1.5 w-1.5 rounded-full ${status.dot}`} />
            <StatusIcon size={11} strokeWidth={2.5} />
            {status.label}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 md:p-5">
        <div className="flex items-center gap-2.5 min-w-0">
          <UserAvatar
            name={project.User?.name}
            avatar={project.User?.avatar}
            imgSizeClass="h-8 w-8"
            fallbackSizeClass="h-8 w-8"
            textClass="text-[11px]"
            className="shrink-0"
          />
          <p className="truncate text-sm font-semibold text-white">
            {project.User?.name || ""}
          </p>
        </div>

        <h3 className="mt-3 text-sm font-semibold text-white leading-snug line-clamp-2">
          {project.title}
        </h3>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
          {categoryName && (
            <span className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {categoryName}
            </span>
          )}
          {project.year && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {project.year}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {project.likesCount ?? 0}
          </span>
        </div>

        <div className="mt-auto flex flex-col items-stretch gap-2 pt-4 md:flex-row md:items-center lg:flex-row lg:items-center">
          {project.status === "pending" ? (
            <>
              <button
                type="button"
                onClick={() => onViewDetail(project)}
                className="card-detail-btn flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all duration-500 hover:bg-[position:100%_0]"
              >
                <Eye className="h-3.5 w-3.5" />
                Detail
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onQuickReject?.(project)
                }}
                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
              >
                <XCircle className="h-3.5 w-3.5" />
                Tolak
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onQuickApprove?.(project)
                }}
                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-600"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Setujui
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onViewDetail(project)}
              className="card-detail-btn flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all duration-500 hover:bg-[position:100%_0]"
            >
              <Eye className="h-3.5 w-3.5" />
              Lihat Detail
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminProjectsCard
