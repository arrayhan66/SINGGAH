import { useState } from "react"
import { ShieldCheck, ShieldX, AtSign, Mail, IdCard, CalendarClock, MessageSquareWarning } from "lucide-react"
import { formatFullDate } from "../../../../utils/notificationHelpers"
import PopupToast from "../../../ui/PopupToast"
import UserAvatar from "../../../ui/UserAvatar"

const tipeLabel = { mahasiswa: "Mahasiswa", dosen: "Dosen" }

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
    <PopupToast show={!!(user && decision)} variant={isApprove ? "default" : "danger"} onClose={onCancel} position="center">
      <div className="px-4 py-3.5 max-h-[80vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-start gap-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
            isApprove ? "bg-emerald-500/20 border-emerald-500/30" : "bg-red-500/20 border-red-500/30"
          }`}>
            {isApprove ? <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" /> : <ShieldX className="h-4.5 w-4.5 text-red-400" />}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="pt-1 text-sm font-semibold text-white">
              {isApprove ? "Setujui Verifikasi Tipe?" : "Tolak Verifikasi Tipe?"}
            </h3>
            <p className="mt-0.5 text-xs text-slate-400 min-w-0 break-words">
              {user.name} mengajukan tipe <span className="font-medium text-slate-200">{label}</span>
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-white/[0.08] bg-white/[0.04] p-3">
          <div className="flex items-center gap-2.5">
            <div className="shrink-0">
              <UserAvatar
                name={user.name}
                avatar={user.avatar}
                imgSizeClass="h-10 w-10"
                imgClass="rounded-xl"
                fallbackSizeClass="h-10 w-10"
                fallbackClass="bg-gradient-to-br from-cyan-500 to-blue-700 text-cyan-100"
                textClass="text-xs"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">{user.name}</p>
              <p className="flex items-center gap-1 truncate text-[11px] text-slate-400"><Mail size={10} /> {user.email}</p>
              {user.username && <p className="flex items-center gap-1 truncate text-[11px] text-slate-400"><AtSign size={10} /> {user.username}</p>}
            </div>
          </div>
          {user.nim_nip && (
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">{user.pending_tipe === "dosen" ? "NIP" : "NIM"}</span>
              <span className="font-mono text-slate-200">{user.nim_nip}</span>
            </div>
          )}
          {requestDate && (
            <div className="mt-1 flex items-center justify-between gap-2 text-[11px]">
              <span className="text-slate-400">Diajukan</span>
              <span className="flex items-center gap-1 text-slate-300"><CalendarClock size={10} className="text-slate-500" /> {formatFullDate(requestDate)}</span>
            </div>
          )}
        </div>

        {user.identitas_photo && (
          <div className="mt-2 rounded-xl border border-white/[0.08] bg-white/[0.04] p-3">
            <div className="flex items-center gap-2 mb-2"><IdCard className="h-3.5 w-3.5 text-cyan-300" /><span className="text-[11px] font-semibold text-white">Foto Identitas</span></div>
            <img src={user.identitas_photo} alt="" className="w-full max-h-32 rounded-lg border border-white/10 object-contain" />
          </div>
        )}

        {isReject && (
          <div className="mt-2">
            <div className="flex items-center gap-1.5 mb-1"><MessageSquareWarning className="h-3.5 w-3.5 text-red-400" /><span className="text-[11px] font-semibold text-white">Alasan Penolakan</span></div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Alasan penolakan (wajib)..."
              rows={2}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-red-400/50 focus:outline-none"
            />
          </div>
        )}

        <div className="mt-3 flex gap-2">
          <button type="button" onClick={onCancel} disabled={loading} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 cursor-pointer disabled:opacity-50">
            Batal
          </button>
          <button type="button" onClick={handleConfirm} disabled={!canConfirm || loading}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-lg cursor-pointer disabled:opacity-50 ${
              isApprove ? "bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-700" : "bg-gradient-to-r from-red-500 to-rose-600 shadow-red-500/30 hover:from-red-600 hover:to-rose-700"
            }`}
          >
            {loading ? "Memproses..." : isApprove ? "Ya, Setujui" : "Ya, Tolak"}
          </button>
        </div>
      </div>
    </PopupToast>
  )
}

export default AdminUserTipeModal