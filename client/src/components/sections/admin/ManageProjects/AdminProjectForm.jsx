import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  FolderKanban,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import AdminHeroBackground from "../../../ui/AdminHeroBackground"
import EditKaryaSection from "../../user/EditKarya/EditKaryaSection"
import Toast from "../../../ui/Toast"
import PopupToast from "../../../ui/PopupToast"
import { useProjects } from "../../../../context/ProjectContext"

const predefinedReasons = [
  "Dokumentasi tidak lengkap",
  "Karya tidak sesuai pedoman",
  "Kode sumber tidak disertakan",
  "Deskripsi kurang detail",
  "Duplikasi dengan karya lain",
  "Tidak memenuhi standar akademik",
]

const statusConfig = {
  pending: {
    label: "Menunggu Review",
    icon: Clock,
    chip: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    softBg: "bg-amber-500/10",
    softColor: "text-amber-400",
  },
  published: {
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
}

const statusDescription = {
  pending: "Karya ini menunggu persetujuan untuk tampil di Hall.",
  published: "Karya ini sudah disetujui dan tampil di Hall.",
  rejected: "Karya ini ditolak. Kamu bisa setujui kembali setelah revisi.",
}

function AdminProjectForm() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { getProjectBySlug, approveProject, rejectProject } = useProjects()

  const existing = getProjectBySlug(slug)

  const [rejectReason, setRejectReason] = useState("")
  const [rejecting, setRejecting] = useState(false)
  const [approveNote, setApproveNote] = useState("")
  const [approving, setApproving] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)
  const [actionSuccess, setActionSuccess] = useState(null)
  const [notification, setNotification] = useState(null)

  function showNotification(message, type = "success") {
    setNotification({ message, type })
  }

  function handlePredefinedReason(reason) {
    setRejectReason((prev) => {
      const reasons = prev.split(", ").filter(Boolean)
      if (reasons.includes(reason)) {
        return reasons.filter((r) => r !== reason).join(", ")
      }
      return [...reasons, reason].join(", ")
    })
  }

  async function handleApprove() {
    if (!existing) return
    if (!approving) {
      setApproving(true)
      setRejecting(false)
      return
    }
    setSavingStatus(true)
    setNotification(null)
    try {
      await approveProject(existing.id, approveNote)
      setActionSuccess({ type: "approve", message: "Project disetujui & diterbitkan!" })
      setTimeout(() => navigate("/projects"), 2000)
    } catch {
      showNotification("Gagal menyetujui project. Coba lagi.", "error")
    } finally {
      setSavingStatus(false)
    }
  }

  async function handleReject() {
    if (!existing) return
    if (!rejecting) {
      setRejecting(true)
      setApproving(false)
      return
    }
    if (!rejectReason.trim()) {
      showNotification("Alasan penolakan wajib diisi.", "error")
      return
    }
    setSavingStatus(true)
    setNotification(null)
    try {
      await rejectProject(existing.id, rejectReason)
      setActionSuccess({ type: "reject", message: "Project ditolak." })
      setTimeout(() => navigate("/projects"), 2000)
    } catch {
      showNotification("Gagal menolak project. Coba lagi.", "error")
    } finally {
      setSavingStatus(false)
    }
  }

  const config = existing ? statusConfig[existing.status] || statusConfig.pending : statusConfig.pending
  const StatusIcon = config.icon

  return (
    <>
      <AdminHeroBackground fullWidth>
        <div className="pt-8 pb-10 sm:pt-10 sm:pb-16 2xl:pt-12 2xl:pb-20 3xl:pb-24 4xl:pb-28">
          <button
            onClick={() => navigate("/projects")}
            className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 p-2 sm:py-2 sm:pl-3 sm:pr-4 text-xs text-slate-300 backdrop-blur-sm transition-colors duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300 sm:text-sm"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 transition-colors duration-300 group-hover:bg-cyan-400/20 sm:h-6 sm:w-6">
              <ArrowLeft
                size={12}
                className="transition-transform duration-300 group-hover:-translate-x-0.5 sm:size-[13px]"
              />
            </span>
            <span className="hidden sm:inline">Kembali ke Kelola Project</span>
          </button>

          <div className="mx-auto mt-6 flex max-w-5xl flex-col items-center text-center sm:mt-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 border border-cyan-400/30 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 3xl:h-28 3xl:w-28 4xl:h-32 4xl:w-32">
              <FolderKanban className="h-8 w-8 text-cyan-300 sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-12 lg:w-12 3xl:h-14 3xl:w-14 4xl:h-16 4xl:w-16" />
            </div>

            <h1 className="mt-2 sm:mt-3 md:mt-4 lg:mt-5 2xl:mt-6 3xl:mt-7 4xl:mt-8 text-2xl min-[280px]:text-4xl sm:text-4xl lg:text-5xl 2xl:text-6xl 3xl:text-7xl 4xl:text-8xl font-black text-white">
              Edit <span className="text-slate-100">Project</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8 2xl:mt-8 2xl:max-w-4xl 2xl:text-xl 2xl:leading-9 3xl:mt-10 3xl:max-w-5xl 3xl:text-2xl 3xl:leading-10 4xl:mt-12 4xl:max-w-6xl 4xl:text-3xl 4xl:leading-11">
              Perbarui informasi dan tinjau status project mahasiswa di SINGGAH.
            </p>
          </div>
        </div>
      </AdminHeroBackground>

      <div className="bg-brand-dark pt-10 sm:pt-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 md:px-8 lg:px-12 2xl:px-16 3xl:px-20 4xl:px-24">
          {notification && (
            <Toast
              message={notification.message}
              type={notification.type}
              onDone={() => setNotification(null)}
            />
          )}

          {existing && existing.status !== "published" && (
            <div className="relative mb-6 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl sm:p-6">
              <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-16 h-44 w-44 rounded-full bg-emerald-500/5 blur-3xl" />

              <div className="relative flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.softBg}`}>
                    <StatusIcon className={`h-5 w-5 ${config.softColor}`} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white">Status Review</h3>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {statusDescription[existing.status] || statusDescription.pending}
                    </p>
                  </div>
                </div>

                <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${config.chip}`}>
                  <StatusIcon size={12} />
                  {config.label}
                </span>
              </div>

              {rejecting && (
                <div className="relative mt-5 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300">
                      Alasan Penolakan <span className="text-red-400">*</span>
                    </label>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Pilih alasan atau tulis secara manual.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {predefinedReasons.map((reason) => {
                      const selected = rejectReason.includes(reason)
                      return (
                        <button
                          key={reason}
                          type="button"
                          onClick={() => handlePredefinedReason(reason)}
                          className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                            selected
                              ? "border-red-400/50 bg-red-500/20 text-red-300"
                              : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-300"
                          }`}
                        >
                          {reason}
                        </button>
                      )
                    })}
                  </div>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                    placeholder="Atau tulis alasan penolakan secara manual..."
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-red-400/50 focus:outline-none transition-colors"
                  />
                </div>
              )}

              {approving && (
                <div className="relative mt-5">
                  <label className="text-xs font-medium text-slate-300">
                    Catatan / Pesan Persetujuan <span className="text-slate-500">(Opsional)</span>
                  </label>
                  <textarea
                    value={approveNote}
                    onChange={(e) => setApproveNote(e.target.value)}
                    rows={3}
                    placeholder="Cth: Mantap karyanya! Sangat inovatif..."
                    className="mt-1.5 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
              )}

              <div className="relative mt-5 flex flex-col gap-3 min-[420px]:flex-row">
                {!approving && !rejecting && existing.status === "pending" && (
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={savingStatus}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:from-emerald-400 hover:to-green-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CheckCircle2 size={17} />
                    Setujui & Terbitkan
                  </button>
                )}

                {!approving && !rejecting && existing.status === "pending" && (
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={savingStatus}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <XCircle size={17} />
                    Tolak
                  </button>
                )}

                {approving && (
                  <>
                    <button
                      type="button"
                      onClick={() => { setApproving(false); setApproveNote(""); }}
                      className="flex-1 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleApprove}
                      disabled={savingStatus}
                      className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:from-emerald-400 hover:to-green-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingStatus ? <Loader2 size={17} className="animate-spin" /> : <CheckCircle2 size={17} />}
                      {savingStatus ? "Menyimpan..." : "Konfirmasi Setujui"}
                    </button>
                  </>
                )}

                {rejecting && (
                  <>
                    <button
                      type="button"
                      onClick={() => { setRejecting(false); setRejectReason(""); }}
                      className="flex-1 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleReject}
                      disabled={savingStatus}
                      className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition hover:from-red-400 hover:to-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingStatus ? <Loader2 size={17} className="animate-spin" /> : <XCircle size={17} />}
                      {savingStatus ? "Menyimpan..." : "Konfirmasi Tolak"}
                    </button>
                  </>
                )}
              </div>

              {existing.status === "rejected" && existing.rejection_reason && (
                <div className="relative mt-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                  <p className="text-xs text-red-300/90">
                    Alasan penolakan saat ini: {existing.rejection_reason}
                  </p>
                </div>
              )}

              {existing.status === "published" && existing.approve_note && (
                <div className="relative mt-4 flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <p className="text-xs text-emerald-300/90">
                    Catatan Admin: {existing.approve_note}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <EditKaryaSection redirectPath="/projects" />
      </div>

      {actionSuccess && (
        <PopupToast
          show
          variant={actionSuccess.type === "approve" ? "success" : "danger"}
          onClose={() => {}}
        >
          <div className="px-4 py-3.5">
            <div className="flex items-start gap-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                actionSuccess.type === "approve"
                  ? "bg-emerald-500/20 border-emerald-500/30"
                  : "bg-red-500/20 border-red-500/30"
              }`}>
                {actionSuccess.type === "approve"
                  ? <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                  : <XCircle className="h-4.5 w-4.5 text-red-400" />
                }
              </div>
              <div className="min-w-0 flex-1">
                <h3 className={`pt-1 text-sm font-semibold ${actionSuccess.type === "approve" ? "text-emerald-300" : "text-red-300"}`}>
                  {actionSuccess.type === "approve" ? "Berhasil Disetujui!" : "Berhasil Ditolak"}
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">{actionSuccess.message}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">Mengalihkan ke halaman projects...</p>
              </div>
            </div>
          </div>
        </PopupToast>
      )}
    </>
  )
}

export default AdminProjectForm
