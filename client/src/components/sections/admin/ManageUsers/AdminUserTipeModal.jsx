import { useState } from "react"
import {
  ShieldCheck,
  ShieldX,
  X,
  UserRound,
  AtSign,
  Mail,
  IdCard,
  CalendarClock,
  ImageOff,
  MessageSquareWarning,
} from "lucide-react"
import { formatFullDate } from "../../../../utils/notificationHelpers"

const tipeLabel = {
  mahasiswa: "Mahasiswa",
  dosen: "Dosen",
}

function AdminUserTipeModal({ user, decision, onConfirm, onCancel, loading }) {
  const [reason, setReason] = useState("")

  if (!user || !decision) return null

  const isApprove = decision === "approve"
  const label = tipeLabel[user.pending_tipe] || "Tipe Baru"
  const isReject = !isApprove
  const canConfirm = isApprove || reason.trim().length > 0
  const requestDate = user.updated_at || user.created_at

  const handleConfirm = () => {
    if (!canConfirm || loading) return
    onConfirm(isApprove ? "" : reason.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-[fade-in_0.15s_ease-out]">
      <div className="custom-scrollbar max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/[0.06] bg-gradient-to-br from-brand-navy to-brand-dark shadow-2xl backdrop-blur-xl animate-modal-in">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${
                isApprove
                  ? "border border-emerald-500/30 bg-emerald-500/10"
                  : "border border-red-500/30 bg-red-500/10"
              }`}
            >
              {isApprove ? (
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              ) : (
                <ShieldX className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div>
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  isApprove
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {isApprove ? "Verifikasi Tipe" : "Verifikasi Ditolak"}
              </span>
              <p className="mt-1 text-xs text-slate-500">Detail Verifikasi</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-white"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-5">
          <h3 className="text-base font-semibold text-white md:text-lg">
            {isApprove ? "Setujui Verifikasi Tipe?" : "Tolak Verifikasi Tipe?"}
          </h3>

          <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.04] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-cyan-400/10 border border-cyan-400/30">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound className="h-5 w-5 text-cyan-300" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {user.name}
                </p>
                <p className="flex items-center gap-1 truncate text-xs text-slate-400">
                  <Mail size={11} className="shrink-0" />
                  <span className="truncate">{user.email}</span>
                </p>
                {user.username && (
                  <p className="flex items-center gap-1 truncate text-xs text-slate-400">
                    <AtSign size={11} className="shrink-0" />
                    <span className="truncate">{user.username}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-slate-400">Mengajukan tipe</span>
              <span className="font-bold text-cyan-300">{label}</span>
            </div>

            {user.nim_nip && (
              <div className="mt-1.5 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  {user.pending_tipe === "dosen" ? "Kartu Identitas" : "NIM"}
                </span>
                <span className="font-mono text-slate-200">{user.nim_nip}</span>
              </div>
            )}

            {(user.tipe || user.created_at) && (
              <div className="mt-1.5 flex items-center justify-between text-xs">
                <span className="text-slate-400">Tipe saat ini</span>
                <span className="font-semibold text-slate-300">
                  {user.tipe === "umum" ? "Umum" : user.tipe || "-"}
                </span>
              </div>
            )}

            {requestDate && (
              <div className="mt-1.5 flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-400">Diajukan</span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <CalendarClock size={11} className="shrink-0 text-slate-500" />
                  {formatFullDate(requestDate)}
                </span>
              </div>
            )}
          </div>

          <div className="mt-3 rounded-xl border border-white/[0.08] bg-white/[0.04] p-4">
            <div className="flex items-center gap-2">
              <IdCard className="h-4 w-4 text-cyan-300" />
              <span className="text-xs font-semibold text-white">
                Foto {user.pending_tipe === "dosen" ? "Kartu Identitas" : "KTM"}
              </span>
            </div>
            <div className="mt-3 flex justify-center">
              {user.identitas_photo ? (
                <img
                  src={user.identitas_photo}
                  alt="Foto identitas"
                  className="max-h-48 w-full rounded-lg border border-white/10 object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 py-6 text-slate-500">
                  <ImageOff className="h-8 w-8" />
                  <span className="text-xs">
                    Foto identitas tidak diunggah
                  </span>
                </div>
              )}
            </div>
          </div>

          {isReject && (
            <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/[0.04] p-4">
              <div className="flex items-center gap-2">
                <MessageSquareWarning className="h-4 w-4 text-red-400" />
                <span className="text-xs font-semibold text-white">
                  Alasan Penolakan
                </span>
              </div>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Tuliskan alasan penolakan (wajib diisi). Contoh: foto KTM tidak jelas / NIM tidak terdaftar."
                rows={3}
                className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-red-400/50 focus:outline-none transition-colors"
              />
              <p className="mt-1.5 text-[11px] text-slate-500">
                Alasan ini akan dikirim ke user via notifikasi dan email.
              </p>
            </div>
          )}

          <p className="mt-3 text-xs text-slate-400 md:text-sm">
            {isApprove
              ? `Tipe akun akan berubah menjadi ${label} dan user akan menerima notifikasi.`
              : "Permintaan akan dihapus dan user tetap berstatus Umum. User bisa mengajukan ulang setelah memperbaiki datanya."}
          </p>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm || loading}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                isApprove
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-700"
                  : "bg-gradient-to-r from-red-500 to-rose-600 shadow-red-500/30 hover:from-red-600 hover:to-rose-700"
              }`}
            >
              {loading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {loading
                ? "Memproses..."
                : isApprove
                  ? "Ya, Setujui"
                  : "Ya, Tolak"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminUserTipeModal
