import { useEffect, useState } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import {
  Hourglass,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Inbox,
} from "lucide-react"
import EditKaryaHero from "../../user/EditKarya/EditKaryaHero"
import EditKaryaSection from "../../user/EditKarya/EditKaryaSection"
import Toast from "../../../ui/Toast"
import PopupToast from "../../../ui/PopupToast"
import { useProjects } from "../../../../context/ProjectContext"
import api from "../../../../services/api"

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
    icon: Hourglass,
    iconBox: "border-amber-400/30 bg-amber-400/10 shadow-amber-500/10",
    iconColor: "text-amber-300",
  },
  published: {
    icon: CheckCircle2,
    iconBox: "border-emerald-400/30 bg-emerald-400/10 shadow-emerald-500/10",
    iconColor: "text-emerald-300",
  },
  rejected: {
    icon: XCircle,
    iconBox: "border-red-400/30 bg-red-400/10 shadow-red-500/10",
    iconColor: "text-red-300",
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
  const location = useLocation()
  const fromPath = location.state?.from || "/admin/karya"
  const { getProjectBySlug, approveProject, rejectProject } = useProjects()

  const contextProject = getProjectBySlug(slug)

  const [data, setData] = useState(() => ({
    slug,
    status: contextProject ? "ready" : "loading",
    error: null,
  }))

  useEffect(() => {
    if (contextProject) return

    let cancelled = false

    api
      .get(`/projects/${slug}`)
      .then((res) => {
        if (cancelled) return
        setData({
          slug,
          status: "ready",
          error: null,
          project: res.data?.data || res.data || null,
        })
      })
      .catch((err) => {
        if (cancelled) return
        if (err.response?.status === 401) return
        setData({
          slug,
          status: "error",
          error:
            err.response?.data?.message || "Gagal memuat karya. Coba lagi.",
          project: null,
        })
      })
      .finally(() => {
        if (!cancelled) setData((prev) => ({ ...prev, status: "idle" }))
      })

    return () => {
      cancelled = true
    }
  }, [slug, contextProject])

  const staleData = String(data.slug) !== String(slug)
  const existing =
    contextProject ||
    (data.project && !staleData ? data.project : null)
  const dataLoading = staleData || data.status === "loading"
  const dataError = !staleData ? data.error : null

  const [rejectReason, setRejectReason] = useState("")
  const [rejecting, setRejecting] = useState(false)
  const [approveNote, setApproveNote] = useState("")
  const [approving, setApproving] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)
  const [actionSuccess, setActionSuccess] = useState(null)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    if (!actionSuccess) return
    const timer = setTimeout(() => setActionSuccess(null), 2500)
    return () => clearTimeout(timer)
  }, [actionSuccess])

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
      setActionSuccess({ type: "approve", message: "Karya disetujui & diterbitkan!" })
      setTimeout(() => navigate("/admin/karya"), 2000)
    } catch {
      showNotification("Gagal menyetujui karya. Coba lagi.", "error")
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
      setActionSuccess({ type: "reject", message: "Karya ditolak." })
      setTimeout(() => navigate("/admin/karya"), 2000)
    } catch {
      showNotification("Gagal menolak karya. Coba lagi.", "error")
    } finally {
      setSavingStatus(false)
    }
  }

  const config = existing ? statusConfig[existing.status] || statusConfig.pending : statusConfig.pending
  const StatusIcon = config.icon

  return (
    <div className="user-page">
      <EditKaryaHero
        backPath={fromPath}
        subtitle="Perbarui informasi dan tinjau status karya mahasiswa di SINGGAH."
        ptClass="pt-6 sm:pt-8 2xl:pt-10"
      />

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
            <div className="relative mb-6 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-xl sm:p-6">
              <div className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border shadow-lg ${config.iconBox}`}>
                    <StatusIcon className={`h-6 w-6 ${config.iconColor}`} strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-white sm:text-base">
                      Status Review
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {statusDescription[existing.status] || statusDescription.pending}
                    </p>
                  </div>
                </div>
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

              {existing.status === "pending" && (
                <div className="relative mt-5 flex flex-col gap-3 min-[420px]:flex-row">
                  {!approving && !rejecting && (
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={savingStatus}
                    style={{ color: "#ffffff" }}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:from-emerald-400 hover:to-green-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CheckCircle2 size={17} />
                    Setujui
                  </button>
                )}

                {!approving && !rejecting && (
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
                      style={{ color: "#ffffff" }}
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
              )}

              {existing.status === "rejected" && existing.rejection_reason && (
                <div className="relative mt-3 overflow-hidden rounded-xl border border-red-400/25 bg-red-500/5 p-3.5 sm:p-4">
                  <span
                    className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-red-400 to-rose-500"
                    aria-hidden="true"
                  />
                  <div className="flex items-start gap-3 pl-1.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-400/30 bg-red-500/15">
                      <AlertTriangle className="h-4 w-4 text-red-400" strokeWidth={2.2} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-red-400">
                        Alasan Penolakan
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-300">
                        {existing.rejection_reason}
                      </p>
                    </div>
                  </div>
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

        {dataLoading && !existing ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
              <p className="text-sm text-slate-400">Memuat karya...</p>
            </div>
          </div>
        ) : existing ? (
          <EditKaryaSection redirectPath={fromPath} />
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-slate-900/60 px-6 py-14 text-center backdrop-blur-xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
              <Inbox className="h-7 w-7 text-slate-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Karya Tidak Ditemukan</h2>
              <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-slate-400">
                {dataError || "Karya dengan alamat ini tidak ditemukan atau sudah dihapus."}
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/karya")}
              className="cursor-pointer rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition hover:from-cyan-400 hover:to-blue-500"
            >
              Kembali ke Kelola Karya
            </button>
          </div>
        )}
      </div>

      {actionSuccess && (
        <PopupToast
          show
          variant={actionSuccess.type === "approve" ? "success" : "danger"}
          onClose={() => setActionSuccess(null)}
          duration={2500}
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
                <p className="mt-0.5 text-[11px] text-slate-500">Mengalihkan ke halaman karya...</p>
              </div>
            </div>
          </div>
        </PopupToast>
      )}
    </div>
  )
}

export default AdminProjectForm
