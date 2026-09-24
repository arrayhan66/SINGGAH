import { useState } from "react"
import { ShieldCheck, ShieldX } from "lucide-react"
import PopupToast from "../../../ui/PopupToast"

const predefinedReasons = [
  "Identitas tidak valid",
  "Bukti pendukung tidak lengkap",
  "NIM/NIP tidak terdaftar",
  "Deskripsi pengajuan kurang detail",
  "Duplikasi dengan pengajuan lain",
  "Tidak memenuhi standar akademik",
]

const tipeLabel = { mahasiswa: "Mahasiswa", dosen: "Dosen" }

function AdminUserTipeModal({ user, decision, onConfirm, onCancel, loading }) {
  const [reason, setReason] = useState("")

  if (!user || !decision) return null

  const isApprove = decision === "approve"
  const label = tipeLabel[user.pending_tipe] || "Tipe Baru"

  const handlePredefinedReason = (r) => {
    setReason((prev) => {
      const reasons = prev.split(", ").filter(Boolean)
      if (reasons.includes(r)) {
        return reasons.filter((x) => x !== r).join(", ")
      }
      return [...reasons, r].join(", ")
    })
  }

  const handleConfirm = () => {
    if (loading) return
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
              {isApprove ? (
                <>Pengajuan tipe <span className="font-medium text-slate-200">{label}</span> oleh{" "}
                  <span className="font-medium text-slate-200">"{user.name}"</span> akan disetujui.</>
              ) : (
                <>Pengajuan tipe <span className="font-medium text-slate-200">{label}</span> oleh{" "}
                  <span className="font-medium text-slate-200">"{user.name}"</span> akan ditolak.</>
              )}
            </p>
          </div>
        </div>

        {!isApprove && (
          <>
            <div className="mt-2.5 flex flex-wrap gap-1">
              {predefinedReasons.map((r) => {
                const selected = reason.includes(r)
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handlePredefinedReason(r)}
                    className={`cursor-pointer rounded-lg border px-2 py-0.5 text-[10px] font-medium transition-all ${
                      selected
                        ? "border-red-400/50 bg-red-500/20 text-red-300"
                        : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    {r}
                  </button>
                )
              })}
            </div>

            <div className="mt-2">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="Alasan penolakan..."
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-red-400/50 focus:outline-none"
              />
            </div>
          </>
        )}

        <div className="mt-3 flex gap-2">
          <button type="button" onClick={onCancel} disabled={loading} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 cursor-pointer disabled:opacity-50">
            Batal
          </button>
          <button type="button" onClick={handleConfirm} disabled={!isApprove && !reason.trim() || loading}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-lg cursor-pointer disabled:opacity-50 ${
              isApprove ? "bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-700" : "bg-gradient-to-r from-red-600 to-red-700 shadow-red-600/30 hover:from-red-700 hover:to-red-800"
            }`}
          >
            {loading ? "Memproses..." : isApprove ? "Ya, Setujui" : "Kirim Penolakan"}
          </button>
        </div>
      </div>
    </PopupToast>
  )
}

export default AdminUserTipeModal