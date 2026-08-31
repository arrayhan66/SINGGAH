import { useEffect } from "react"
import { Send } from "lucide-react"
import toast from "../../../../utils/toast"

function validateForm(formData, isEdit = false) {
  const errors = []

  if (!formData.title.trim()) errors.push("Judul karya wajib diisi")
  if (!formData.category_id) errors.push("Kategori wajib dipilih")
  if (!formData.description.trim())
    errors.push("Deskripsi karya wajib diisi")
  if (!isEdit && !formData.thumbnail) errors.push("Thumbnail wajib diupload")
  if (!formData.year) errors.push("Tahun wajib diisi")
  else {
    const y = parseInt(formData.year, 10)
    if (isNaN(y) || y < 1900 || y > 2100) errors.push("Tahun tidak valid (1900-2100)")
  }

  return errors
}

function UploadAction({ formData, onSubmit, submitting, apiError, isEdit = false, submitLabel }) {
  useEffect(() => {
    if (typeof apiError === "string" && apiError) {
      toast.error(apiError)
    }
  }, [apiError])

  function handleSubmit() {
    const errors = validateForm(formData, isEdit)

    if (errors.length > 0) {
      toast.error(errors.join(", "))
      return
    }

    onSubmit()
  }

  return (
    <div className="flex flex-col gap-3 min-[280px]:gap-4 2xl:gap-5 3xl:gap-6 4xl:gap-7">
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-5 py-2.5 min-[280px]:px-6 min-[280px]:py-3 text-xs min-[280px]:text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-500 hover:bg-[position:100%_0] disabled:cursor-not-allowed disabled:opacity-60 2xl:text-base 2xl:px-7 2xl:py-3.5 3xl:text-lg 3xl:px-8 3xl:py-4 4xl:text-xl 4xl:px-9 4xl:py-4.5"
      >
        <Send className="h-5 w-5 2xl:h-6 2xl:w-6 3xl:h-7 3xl:w-7 4xl:h-8 4xl:w-8" />
        {submitting ? "Menyimpan..." : submitLabel || (isEdit ? "Simpan Perubahan" : "Submit untuk Ditinjau")}
      </button>
    </div>
  )
}

export default UploadAction
