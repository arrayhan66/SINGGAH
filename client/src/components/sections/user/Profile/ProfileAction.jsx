import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Save, X, CheckCircle } from "lucide-react"
import api from "../../../../services/api"
import { useAuth } from "../../../../context/AuthContext"
import PopupToast from "../../../ui/PopupToast"
import toast from "../../../../utils/toast"

function ProfileAction({ profileData, passwordData, onResetPassword, identitasPhoto }) {
  const navigate = useNavigate()
  const { token, user, login } = useAuth()
  const [errors, setErrors] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [emailChanged, setEmailChanged] = useState(false)

  useEffect(() => {
    if (!showSuccess) return

    if (emailChanged) {
      const t = setTimeout(() => {
        setShowSuccess(false)
        navigate("/verify-code")
      }, 2500)
      return () => clearTimeout(t)
    }

    const t = setTimeout(() => {
      setShowSuccess(false)
    }, 2500)
    return () => clearTimeout(t)
  }, [showSuccess, emailChanged, navigate])

  const isChangingPassword = Boolean(
    passwordData.currentPassword ||
    passwordData.newPassword ||
    passwordData.confirmPassword
  )

  const hasPasswordChanged = Boolean(
    passwordData.currentPassword && passwordData.newPassword
  )

  useEffect(() => {
    if (errors.length > 0) {
      toast.error(errors.join(", "))
    }
  }, [errors])

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
      {/* Success Toast */}
      <PopupToast show={showSuccess} variant="success" onClose={() => {}} duration={2500}>
        <div className="px-4 py-3.5 text-center">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30">
              <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="pt-1 text-sm font-semibold text-emerald-300">
                {emailChanged ? "Periksa Email Baru!" : hasPasswordChanged ? "Password Berhasil Diubah!" : "Berhasil!"}
              </h3>
              <p className="mt-0.5 text-xs text-emerald-300/80">
                {emailChanged ? "Kode verifikasi telah dikirim ke email baru." : hasPasswordChanged ? "Password dan profil berhasil diperbarui." : "Profil berhasil diperbarui."}
              </p>
            </div>
          </div>
          <div className="mt-3 flex justify-center gap-1.5">
            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400 [animation-delay:-0.3s]" />
            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400 [animation-delay:-0.15s]" />
            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400" />
          </div>
        </div>
      </PopupToast>

      <div className="flex flex-col">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-500 hover:bg-[position:100%_0] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          <Save size={16} />
          {submitting ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  )
}

export default ProfileAction
