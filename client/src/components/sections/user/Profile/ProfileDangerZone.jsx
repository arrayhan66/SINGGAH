import { useState } from "react"
import { Trash2, AlertTriangle, Eye, EyeOff } from "lucide-react"
import api from "../../../../services/api"
import { useAuth } from "../../../../context/AuthContext"
import { useTheme } from "../../../../context/ThemeContext"
import GlassCard from "../../../ui/GlassCard"
import PopupToast from "../../../ui/PopupToast"

function ProfileDangerZone() {
  const { token, logout } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === "dark"
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
        <PopupToast show={showModal} variant="danger" onClose={handleClose} closeOnEscape={false} position="center">
          <div className="p-1 sm:p-2">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-500/20 border border-red-500/40 shadow-lg shadow-red-500/20">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className={`text-base font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Hapus Akun Permanen</h3>
                <p className={`mt-0.5 text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>Tindakan ini tidak dapat dibatalkan. Semua data kamu akan terhapus selamanya.</p>
              </div>
            </div>

            {error && (
              <div className="mt-3.5 rounded-xl border border-red-500/40 bg-red-500/15 px-3.5 py-2.5 text-xs font-medium text-red-300 shadow-sm">
                {error}
              </div>
            )}

            <div className="mt-4 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className={`text-[11px] font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Konfirmasi Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password akunmu"
                    className={`w-full rounded-xl border px-3.5 py-2.5 pr-10 text-xs transition-all focus:outline-none ${isDark ? "border-white/15 bg-white/5 text-white placeholder:text-slate-500 focus:border-red-400 focus:bg-white/10" : "border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:bg-white"}`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition-colors ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className={`text-[11px] font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Ketik <span className="font-bold text-red-500 tracking-wider">SAYA MENGERTI</span>
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="SAYA MENGERTI"
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-xs transition-all uppercase tracking-wider focus:outline-none ${isDark ? "border-white/15 bg-white/5 text-white placeholder:text-slate-500 focus:border-red-400 focus:bg-white/10" : "border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:bg-white"}`}
                />
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2.5">
              <button 
                type="button" 
                onClick={handleClose} 
                className={`flex-1 rounded-xl border px-4 py-2.5 text-xs font-semibold cursor-pointer transition-all ${isDark ? "border-white/15 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white" : "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"}`}
              >
                Batal
              </button>
              <button 
                type="button" 
                onClick={handleDelete} 
                disabled={!canSubmit || submitting} 
                className="flex-1 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-600/30 hover:from-red-500 hover:to-rose-500 cursor-pointer transition-all disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? "Menghapus..." : "Ya, Hapus Akun"}
              </button>
            </div>
          </div>
        </PopupToast>
      )}
    </>
  )
}

export default ProfileDangerZone