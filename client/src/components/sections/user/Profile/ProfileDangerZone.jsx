import { useState } from "react"
import { Trash2, AlertTriangle, Eye, EyeOff } from "lucide-react"
import api from "../../../../services/api"
import { useAuth } from "../../../../context/AuthContext"
import GlassCard from "../../../ui/GlassCard"
import PopupToast from "../../../ui/PopupToast"

function ProfileDangerZone() {
  const { token, logout } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const isConfirmValid = confirmText === "SAYA MENGERTI"
  const canSubmit = password.length > 0 && isConfirmValid

  function handleOpen() {
    setShowModal(true)
    setPassword("")
    setConfirmText("")
    setError("")
    setShowPassword(false)
  }

  function handleClose() {
    setShowModal(false)
    setPassword("")
    setConfirmText("")
    setError("")
  }

  async function handleDelete() {
    if (!canSubmit) return
    setSubmitting(true)
    setError("")
    try {
      await api.delete("/auth/account", {
        headers: { Authorization: `Bearer ${token}` },
        data: { password },
      })
      logout()
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menghapus akun. Silakan coba lagi.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <GlassCard className="border-red-500/20 p-5 md:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm min-[350px]:text-base md:text-lg font-semibold text-white">Zona Bahaya</h2>
            <p className="mt-1 text-xs md:text-sm text-slate-400">Menghapus akun akan menghapus semua data secara permanen.</p>
          </div>
        </div>
        <button type="button" onClick={handleOpen} className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300 cursor-pointer">
          <Trash2 size={16} /> Hapus Akun
        </button>
      </GlassCard>

      {showModal && (
        <PopupToast show={showModal} variant="danger" onClose={handleClose} closeOnEscape={false}>
          <div className="px-4 py-3.5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/20 border border-red-500/30">
                <AlertTriangle className="h-4.5 w-4.5 text-red-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="pt-1 text-sm font-semibold text-white">Hapus Akun</h3>
                <p className="mt-0.5 text-xs text-slate-400">Semua data kamu akan dihapus permanen.</p>
              </div>
            </div>

            {error && (
              <div className="mt-2.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-400">
                {error}
              </div>
            )}

            <div className="mt-3 flex flex-col gap-2">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 pr-9 text-xs text-white placeholder:text-slate-500 focus:border-red-400/50 focus:outline-none"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer">
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-300">Ketik <span className="font-bold text-red-400">SAYA MENGERTI</span></label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="SAYA MENGERTI"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-red-400/50 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <button type="button" onClick={handleClose} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 cursor-pointer">
                Batal
              </button>
              <button type="button" onClick={handleDelete} disabled={!canSubmit || submitting} className="flex-1 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50">
                {submitting ? "Menghapus..." : "Hapus Akun"}
              </button>
            </div>
          </div>
        </PopupToast>
      )}
    </>
  )
}

export default ProfileDangerZone