import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Save, X, AlertCircle, CheckCircle } from "lucide-react"
import api from "../../../../services/api"
import { useAuth } from "../../../../context/AuthContext"

function ProfileAction({ profileData, passwordData, onResetPassword, identitasPhoto }) {
  const navigate = useNavigate()
  const { token, user, login } = useAuth()
  const [errors, setErrors] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [emailChanged, setEmailChanged] = useState(false)

  useEffect(() => {
    if (!showSuccess) return
    const t = setTimeout(() => {
      setShowSuccess(false)
      if (emailChanged) {
        navigate("/verify-code")
      }
    }, emailChanged ? 2500 : 3000)
    return () => clearTimeout(t)
  }, [showSuccess, emailChanged, navigate])

  useEffect(() => {
    if (showSuccess) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [showSuccess])

  const isChangingPassword =
    passwordData.currentPassword ||
    passwordData.newPassword ||
    passwordData.confirmPassword

  function validate() {
    const errs = []

    if (!profileData.name.trim()) errs.push("Nama lengkap wajib diisi")
    if (!profileData.username.trim()) errs.push("Username wajib diisi")
    if (!profileData.email.trim()) errs.push("Email wajib diisi")

    if (isChangingPassword) {
      if (!passwordData.currentPassword)
        errs.push("Password saat ini wajib diisi untuk ganti password")
      if (passwordData.newPassword.length < 8)
        errs.push("Password baru minimal 8 karakter")
      if (/[A-Z]/.test(passwordData.newPassword) === false)
        errs.push("Password baru harus mengandung minimal 1 huruf besar")
      if (/[0-9]/.test(passwordData.newPassword) === false)
        errs.push("Password baru harus mengandung minimal 1 angka")
      if (passwordData.newPassword !== passwordData.confirmPassword)
        errs.push("Konfirmasi password baru tidak cocok")
    }

    return errs
  }

  async function handleSubmit() {
    const validationErrors = validate()

    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors([])
    setSubmitting(true)

    try {
      if (isChangingPassword) {
        await api.put(
          "/auth/change-password",
          {
            oldPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        )
      }

      const formData = new FormData()
      formData.append("name", profileData.name.trim())
      formData.append("username", profileData.username.trim())
      formData.append("email", profileData.email.trim())

      if (profileData.nim_nip) {
        formData.append("nim_nip", profileData.nim_nip.trim())
      }

      if (profileData.avatar) {
        formData.append("avatar", profileData.avatar)
      }

      if (identitasPhoto) {
        formData.append("identitas_photo", identitasPhoto)
      }

      const res = await api.put("/auth/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      const updatedUser = res.data.data
      login({ ...user, ...updatedUser }, token)

      const changedEmail = Boolean(updatedUser.email_changed)
      setEmailChanged(changedEmail)

      if (changedEmail) {
        localStorage.setItem("verifyType", "profile")
        localStorage.setItem("profileEmail", updatedUser.pending_email)
      }

      if (onResetPassword) onResetPassword()
      setShowSuccess(true)
    } catch (err) {
      const msg =
        err.response?.data?.message || "Terjadi kesalahan. Silakan coba lagi."
      setErrors([msg])
    } finally {
      setSubmitting(false)
    }
  }

  function handleCancel() {
    navigate("/")
  }

  return (
    <div className="relative flex flex-col gap-3">
      {/* Success Modal */}
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden p-4 transition-all duration-500 ease-out ${
          showSuccess
            ? "visible bg-black/60 opacity-100 backdrop-blur-sm"
            : "invisible bg-black/0 opacity-0 backdrop-blur-none"
        }`}
      >
        <div
          className={`relative flex w-full max-w-sm transform flex-col items-center overflow-hidden rounded-3xl border border-cyan-400/30 bg-slate-900 p-8 text-center shadow-2xl shadow-cyan-900/50 transition-all duration-500 ease-out ${
            showSuccess
              ? "translate-y-0 scale-100 opacity-100 delay-100"
              : "translate-y-10 scale-90 opacity-0"
          }`}
        >
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>

          <h3 className="mb-2 text-2xl font-bold text-white">
            {emailChanged ? "Periksa Email Baru!" : "Berhasil!"}
          </h3>
          <p className="text-sm text-slate-300">
            {emailChanged
              ? "Kami mengirim kode verifikasi ke email baru kamu. Email aktif baru berubah setelah kode berhasil diverifikasi."
              : "Profil kamu berhasil diperbarui."}
          </p>

          <div className="mt-6 flex items-center justify-center gap-1.5">
            <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-400 [animation-delay:-0.3s]" />
            <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-400 [animation-delay:-0.15s]" />
            <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" />
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="flex flex-col gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-red-400">
            <AlertCircle size={16} className="shrink-0" />
            Periksa kembali form berikut:
          </div>
          <ul className="ml-6 list-disc text-xs md:text-sm text-red-300">
            {errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col min-[400px]:flex-row gap-3">
        <button
          type="button"
          onClick={handleCancel}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X size={16} />
          Batal
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-500 hover:bg-[position:100%_0] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          <Save size={16} />
          {submitting ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  )
}

export default ProfileAction
