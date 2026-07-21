import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Save, X, AlertCircle, CheckCircle2 } from "lucide-react"

function validateProfile(profileData, passwordData) {
  const errors = []

  if (!profileData.name.trim()) errors.push("Nama lengkap wajib diisi")
  if (!profileData.email.trim()) errors.push("Email wajib diisi")

  const isChangingPassword =
    passwordData.currentPassword ||
    passwordData.newPassword ||
    passwordData.confirmPassword

  if (isChangingPassword) {
    if (!passwordData.currentPassword)
      errors.push("Password saat ini wajib diisi untuk ganti password")
    if (passwordData.newPassword.length < 8)
      errors.push("Password baru minimal 8 karakter")
    if (passwordData.newPassword !== passwordData.confirmPassword)
      errors.push("Konfirmasi password baru tidak cocok")
  }

  return errors
}

function ProfileAction({ profileData, passwordData, onSubmit }) {
  const navigate = useNavigate()
  const [errors, setErrors] = useState([])
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit() {
    const validationErrors = validateProfile(profileData, passwordData)

    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      setSuccess(false)
      return
    }

    setErrors([])
    setSubmitting(true)

    // sementara belum ada backend, simulasi proses simpan
    setTimeout(() => {
      onSubmit()
      setSubmitting(false)
      setSuccess(true)
    }, 800)
  }

  function handleCancel() {
    navigate("/user")
  }

  return (
    <div className="flex flex-col gap-3">
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

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          <CheckCircle2 size={16} className="shrink-0" />
          Profil berhasil diperbarui.
        </div>
      )}

      <div className="flex flex-col min-[400px]:flex-row gap-3">
        <button
          type="button"
          onClick={handleCancel}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors"
        >
          <X size={16} />
          Batal
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-500 hover:bg-[position:100%_0] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={16} />
          {submitting ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  )
}

export default ProfileAction
