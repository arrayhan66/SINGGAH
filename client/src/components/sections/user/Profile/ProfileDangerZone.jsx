import { useState, useEffect } from "react"
import { Trash2, AlertTriangle, Eye, EyeOff, X } from "lucide-react"
import api from "../../../../services/api"
import { useAuth } from "../../../../context/AuthContext"
import GlassCard from "../../../ui/GlassCard"

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

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [showModal])

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
      setError(
        err.response?.data?.message || "Gagal menghapus akun. Silakan coba lagi.",
      )
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
            <h2 className="text-sm min-[350px]:text-base md:text-lg font-semibold text-white">
              Zona Bahaya
            </h2>
            <p className="mt-1 text-xs md:text-sm text-slate-400">
              Menghapus akun akan menghapus semua data secara permanen. Tindakan
              ini tidak dapat dibatalkan.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpen}
          className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300 cursor-pointer"
        >
          <Trash2 size={16} />
          Hapus Akun
        </button>
      </GlassCard>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4 animate-[fade-in_0.15s_ease-out]">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={handleClose}
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-red-500/20 bg-slate-900 p-6 shadow-2xl animate-modal-in">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <h3 className="text-lg font-bold text-white">Hapus Akun</h3>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="cursor-pointer rounded-full bg-white/5 p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-slate-300">
              Semua data kamu akan dihapus permanen. Masukkan password untuk
              melanjutkan.
            </p>

            {error && (
              <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="mt-4 flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password kamu"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pr-11 text-sm text-white placeholder:text-slate-500 focus:border-red-400/50 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Ketik <span className="font-bold text-red-400">SAYA MENGERTI</span> untuk konfirmasi
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="SAYA MENGERTI"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-red-400/50 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!canSubmit || submitting}
                className="flex-1 cursor-pointer rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Menghapus..." : "Hapus Akun"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ProfileDangerZone
