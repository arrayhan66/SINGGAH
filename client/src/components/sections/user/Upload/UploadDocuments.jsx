import { useRef } from "react"
import { FileUp, X, FileText } from "lucide-react"
import GlassCard from "../../../ui/GlassCard"

function UploadDocuments({ value, onChange }) {
  const inputRef = useRef(null)

  function handleFileChange(e) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    onChange([...value, ...files])
    if (inputRef.current) inputRef.current.value = ""
  }

  function handleRemove(index) {
    onChange(value.filter((_, i) => i !== index))
  }

  function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  return (
    <GlassCard className="p-4 min-[280px]:p-5 sm:p-6 2xl:p-8 3xl:p-10 4xl:p-12">
      <h2 className="text-sm min-[280px]:text-base sm:text-lg 2xl:text-xl 3xl:text-2xl 4xl:text-3xl font-semibold text-white">
        Dokumen Pendukung{" "}
        <span className="text-slate-500 font-normal text-xs min-[280px]:text-sm 2xl:text-base 3xl:text-lg 4xl:text-xl">
          (opsional)
        </span>
      </h2>
      <p className="mt-1 text-xs min-[280px]:text-sm text-slate-400 2xl:text-base 3xl:text-lg 4xl:text-xl">
        Upload dokumen seperti laporan, paper, atau file pendukung lainnya.
      </p>

      <div className="mt-3 min-[280px]:mt-4 flex flex-col gap-2">
        {value.map((file, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 min-[280px]:px-4 min-[280px]:py-2.5"
          >
            <FileText size={18} className="shrink-0 text-cyan-400" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-white">{file.name}</p>
              <p className="text-xs text-slate-500">{formatSize(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-3 min-[280px]:mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-cyan-400/30 bg-cyan-400/5 py-6 min-[280px]:py-8 text-sm text-slate-300 transition-colors hover:bg-cyan-400/10"
      >
        <FileUp className="h-5 w-5 text-cyan-300 2xl:h-6 2xl:w-6 3xl:h-7 3xl:w-7 4xl:h-8 4xl:w-8" />
        <span className="min-[280px]:text-sm 2xl:text-base 3xl:text-lg 4xl:text-xl">
          Klik untuk upload dokumen
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </GlassCard>
  )
}

export default UploadDocuments
