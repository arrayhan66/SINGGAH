import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Send, X, AlertCircle } from "lucide-react"

function validateForm(formData) {
  const errors = []

  if (!formData.title.trim()) errors.push("Judul project wajib diisi")
  if (!formData.category_id) errors.push("Kategori wajib dipilih")
  if (!formData.description.trim())
    errors.push("Deskripsi project wajib diisi")
  if (!formData.thumbnail) errors.push("Thumbnail wajib diupload")
  if (!formData.year) errors.push("Tahun wajib diisi")

  return errors
}

function UploadAction({ formData, onSubmit, submitting, apiError }) {
  const navigate = useNavigate()
  const [validationErrors, setValidationErrors] = useState([])

  function handleSubmit() {
    const errors = validateForm(formData)

    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    setValidationErrors([])
    onSubmit()
  }

  function handleCancel() {
    navigate("/")
  }

  const showValidationErrors = validationErrors.length > 0
  const showApiError = typeof apiError === "string" && apiError

  return (
    <div className="flex flex-col gap-3 2xl:gap-4 3xl:gap-5 4xl:gap-6">
      {showValidationErrors && (
        <div className="flex flex-col gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 min-[280px]:p-4 2xl:p-5 3xl:p-6 4xl:p-7">
          <div className="flex items-center gap-2 text-xs min-[280px]:text-sm font-medium text-red-400 2xl:text-base 3xl:text-lg 4xl:text-xl">
            <AlertCircle size={16} className="shrink-0 2xl:size-5 3xl:size-6 4xl:size-7" />
            Lengkapi form berikut sebelum submit:
          </div>
          <ul className="ml-6 list-disc text-xs min-[280px]:text-sm text-red-300 2xl:text-base 3xl:text-lg 4xl:text-xl">
            {validationErrors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {showApiError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 min-[280px]:p-4 text-xs min-[280px]:text-sm text-red-400 2xl:text-base">
          <AlertCircle size={16} className="shrink-0" />
          {apiError}
        </div>
      )}

      <div className="flex flex-col min-[400px]:flex-row gap-3 2xl:gap-4 3xl:gap-5 4xl:gap-6">
        <button
          type="button"
          onClick={handleCancel}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 min-[280px]:px-6 min-[280px]:py-3 text-xs min-[280px]:text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors 2xl:text-base 2xl:px-7 2xl:py-3.5 3xl:text-lg 3xl:px-8 3xl:py-4 4xl:text-xl 4xl:px-9 4xl:py-4.5"
        >
          <X size={16} className="2xl:size-5 3xl:size-6 4xl:size-7" />
          Batal
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-5 py-2.5 min-[280px]:px-6 min-[280px]:py-3 text-xs min-[280px]:text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-500 hover:bg-[position:100%_0] disabled:cursor-not-allowed disabled:opacity-60 2xl:text-base 2xl:px-7 2xl:py-3.5 3xl:text-lg 3xl:px-8 3xl:py-4 4xl:text-xl 4xl:px-9 4xl:py-4.5"
        >
          <Send size={16} className="2xl:size-5 3xl:size-6 4xl:size-7" />
          {submitting ? "Mengirim..." : "Submit untuk Ditinjau"}
        </button>
      </div>
    </div>
  )
}

export default UploadAction
