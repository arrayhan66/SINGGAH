import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
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
  const [uploadProgress, setUploadProgress] = useState(null)

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

      const payload = {
        name: profileData.name.trim(),
        username: profileData.username.trim(),
        email: profileData.email.trim(),
        ...(profileData.nim_nip
          ? { nim_nip: profileData.nim_nip.trim() }
          : {}),
      }

      const hasFiles = Boolean(profileData.avatar || identitasPhoto)

      const putProfile = async (attempt = 1) => {
        try {
          let data = payload
          let headers = {
            Authorization: `Bearer ${token}`,
          }

          if (hasFiles) {
            const formData = new FormData()
            Object.entries(payload).forEach(([k, v]) =>
              formData.append(k, v),
            )
            if (profileData.avatar) {
              formData.append("avatar", profileData.avatar)
            }
            if (identitasPhoto) {
              formData.append("identitas_photo", identitasPhoto)
            }
            data = formData
            headers["Content-Type"] = "multipart/form-data"
          } else {
            headers["Content-Type"] = "application/json"
          }

          return await api.put("/auth/profile", data, {
            headers,
            timeout: 60000,
            onUploadProgress: (progressEvent) => {
              if (!hasFiles) return
              const total = progressEvent.total || 1
              const percent = Math.round((progressEvent.loaded / total) * 100)
              setUploadProgress(percent)
            },
          })
        } catch (err) {
          const isNetworkError =
            !err.response &&
            (err.code === "ECONNRESET" ||
              err.code === "ETIMEDOUT" ||
              err.message?.includes("Network Error") ||
              err.code === "ERR_NETWORK")
          if (isNetworkError && attempt < 4) {
            const backoff = 1500 * attempt
            await new Promise((r) => setTimeout(r, backoff))
            return putProfile(attempt + 1)
          }
          throw err
        }
      }

      const res = await putProfile()

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
      setUploadProgress(null)
    }
  }

  function handleCancel() {
    navigate("/")
  }

  return (
    <div className="relative flex flex-col gap-3">
      {/* Success Toast */}
      {createPortal(
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
        </PopupToast>,
        document.body,
      )}

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

        {submitting && (
          <div className="mt-3">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-200"
                style={{ width: `${uploadProgress ?? 0}%` }}
              />
            </div>
            <p className="mt-1.5 text-center text-[11px] font-medium text-cyan-300">
              {uploadProgress !== null
                ? `Menyimpan ${uploadProgress}%`
                : "Menyimpan perubahan..."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileAction
