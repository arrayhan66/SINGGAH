import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Send, X, AlertCircle } from "lucide-react"

function validateForm(formData) {
  const errors = []

  if (!formData.title.trim()) errors.push("Judul project wajib diisi")
  if (!formData.category) errors.push("Kategori wajib dipilih")
  if (!formData.shortDescription.trim())
    errors.push("Deskripsi singkat wajib diisi")
  if (!formData.fullDescription.trim())
    errors.push("Deskripsi lengkap wajib diisi")
  if (!formData.thumbnail) errors.push("Thumbnail wajib diupload")

  return errors
}

function UploadAction({ formData, onSubmit }) {
  const navigate = useNavigate()
  const [errors, setErrors] = useState([])
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit() {
    const validationErrors = validateForm(formData)

    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors([])
    setSubmitting(true)

    // sementara belum ada backend, simulasi proses submit
    setTimeout(() => {
      onSubmit()
      setSubmitting(false)
      navigate("/user/my-project")
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
            Lengkapi form berikut sebelum submit:
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
          <Send size={16} />
          {submitting ? "Mengirim..." : "Submit untuk Ditinjau"}
        </button>
      </div>
    </div>
  )
}

export default UploadAction
