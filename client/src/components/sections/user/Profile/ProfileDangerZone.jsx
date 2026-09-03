import { useState } from "react"
import { createPortal } from "react-dom"
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
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#fd6467] to-rose-600 shadow-md shadow-[#fd6467]/30">
            <AlertTriangle className="h-4 w-4 text-white!" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm min-[350px]:text-base md:text-lg font-semibold text-white">Zona Bahaya</h2>
            <p className="mt-1 text-xs md:text-sm text-slate-400">Menghapus akun akan menghapus semua data secara permanen.</p>
          </div>
        </div>
        <button type="button" onClick={handleOpen} className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#fd6467] to-rose-600 px-5 py-2.5 text-sm font-medium text-white! shadow-lg shadow-[#fd6467]/30 transition-all hover:from-red-500 hover:to-rose-500 cursor-pointer">
          <Trash2 size={16} /> Hapus Akun
        </button>
      </GlassCard>

      {showModal &&
        createPortal(
          <PopupToast show={showModal} variant="danger" onClose={handleClose} closeOnEscape={false} position="center">
            <div className="p-0">
              <div className={`relative overflow-hidden rounded-2xl ${isDark ? "bg-[#0e2c4b]" : "bg-white"}`}>
                <div className="relative px-6 pt-5 pb-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-transparent pointer-events-none" />
                  <div className="relative flex items-center gap-3.5">
                    <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-lg shadow-red-500/30 border border-red-400/40 ${isDark ? "bg-gradient-to-br from-red-500 to-rose-600" : "bg-gradient-to-br from-[#fd6467] to-red-500"}`}>
                      <AlertTriangle className="h-6 w-6 text-white!" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className={`text-lg font-extrabold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Hapus Akun Permanen</h3>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mx-6 mt-3.5 flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/15 px-3.5 py-2.5 text-xs font-medium text-red-300 shadow-sm">
                    <AlertTriangle size={14} className="shrink-0 text-red-400" />
                    {error}
                  </div>
                )}

                <div className="mt-4 flex flex-col gap-3 px-6 pb-1">
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-700"}`}>Konfirmasi Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan password akunmu"
                        className={`w-full rounded-xl border-2 px-3.5 py-3 pr-10 text-xs transition-all focus:outline-none ${isDark ? "border-white/15 bg-white/5 text-white placeholder:text-slate-500 focus:border-red-400 focus:bg-white/10" : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:bg-white"}`}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition-colors ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      Ketik <span className="font-extrabold text-red-500 tracking-widest">SAYA MENGERTI</span>
                    </label>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="SAYA MENGERTI"
                      className={`w-full rounded-xl border-2 px-3.5 py-3 text-xs transition-all uppercase tracking-wider focus:outline-none ${isDark ? "border-white/15 bg-white/5 text-white placeholder:text-slate-500 focus:border-red-400 focus:bg-white/10" : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:bg-white"}`}
                    />
                  </div>
                </div>

                <div className={`mt-5 flex items-center gap-2.5 border-t px-6 py-4 ${isDark ? "border-white/10" : "border-slate-200"}`}>
                  <button
                    type="button"
                    onClick={handleClose}
                    className={`flex-1 rounded-xl border-2 px-4 py-2.5 text-xs font-bold cursor-pointer transition-all ${isDark ? "border-white/15 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white" : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"}`}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={!canSubmit || submitting}
                    className="flex-1 rounded-xl bg-gradient-to-r from-[#fd6467] to-rose-600 px-4 py-2.5 text-xs font-bold text-white! shadow-lg shadow-[#fd6467]/30 hover:from-red-500 hover:to-rose-500 active:scale-[0.98] cursor-pointer transition-all disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Menghapus...
                      </span>
                    ) : (
                      "Ya, Hapus Akun"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </PopupToast>,
          document.body,
        )}
    </>
  )
}

export default ProfileDangerZone