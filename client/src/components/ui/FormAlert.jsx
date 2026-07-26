// File: src/ui/FormAlert.jsx (Sesuaikan letak foldernya)
import { AlertCircle } from "lucide-react"

export default function FormAlert({ message, type = "error" }) {
  if (!message) return null

  // Kita kasih opsi warna kalau mau nampilin sukses (hijau) atau error (merah)
  const isError = type === "error"

  return (
    <div
      className={`mb-4 flex items-start gap-2 rounded-xl border p-3 backdrop-blur-md sm:mb-6 sm:p-4 transition-all duration-300 ${
        isError
          ? "border-red-500/30 bg-red-500/10 text-red-400"
          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
      }`}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
      <p className="text-[11px] leading-relaxed sm:text-xs">{message}</p>
    </div>
  )
}
