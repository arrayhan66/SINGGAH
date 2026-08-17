import { useRef } from "react"
import { FileUp, X, FileText } from "lucide-react"
import GlassCard from "../../../ui/GlassCard"

function UploadDocuments({ value, onChange, existingItems, onRemoveExisting }) {
  const inputRef = useRef(null)
  const hasExisting = Array.isArray(existingItems) && existingItems.length > 0

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

  function getDocName(doc, index) {
    if (typeof doc === "string") return doc.split("/").pop()
    return doc.name || doc.filename || `Dokumen ${index + 1}`
  }

  return (
    <GlassCard className="p-3 min-[280px]:p-5 sm:p-6 2xl:p-8 3xl:p-10 4xl:p-12">
      <div className="flex items-center gap-2">
        <div className="flex shrink-0 h-[clamp(2.5rem,1.5rem+2.5vw,5rem)] w-[clamp(2.5rem,1.5rem+2.5vw,5rem)] items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/30">
          <FileText className="text-cyan-300 h-[clamp(1.25rem,0.75rem+1.25vw,2.5rem)] w-[clamp(1.25rem,0.75rem+1.25vw,2.5rem)]" />
        </div>
        <div>
          <h2 className="text-xs min-[280px]:text-base sm:text-lg 2xl:text-xl 3xl:text-2xl 4xl:text-3xl font-semibold text-white">
            Dokumen Pendukung
          </h2>
        </div>
        <span className="ml-auto inline-flex items-center rounded-full border border-slate-600 bg-slate-800 px-1.5 min-[280px]:px-2 py-0.5 text-[8px] min-[280px]:text-[10px] font-medium text-slate-400 2xl:text-xs 3xl:text-sm">
          Opsional
        </span>
      </div>

      <div className="mt-2 min-[280px]:mt-4 flex flex-col gap-2">
        {hasExisting &&
          existingItems.map((doc, index) => (
            <div
              key={`existing-doc-${index}`}
              className="flex items-center gap-2 min-[280px]:gap-3 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 min-[280px]:px-4 min-[280px]:py-2.5"
            >
              <FileText className="h-4 w-4 min-[280px]:h-[18px] min-[280px]:w-[18px] shrink-0 text-cyan-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs min-[280px]:text-sm text-white">
                  {getDocName(doc, index)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemoveExisting?.(index)}
                className="flex h-6 w-6 min-[280px]:h-7 min-[280px]:w-7 cursor-pointer shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

        {value.map((file, index) => (
          <div
            key={`new-doc-${index}`}
            className="flex items-center gap-2 min-[280px]:gap-3 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 min-[280px]:px-4 min-[280px]:py-2.5"
          >
            <FileText className="h-4 w-4 min-[280px]:h-[18px] min-[280px]:w-[18px] shrink-0 text-cyan-400" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs min-[280px]:text-sm text-white">{file.name}</p>
              <p className="text-[10px] min-[280px]:text-xs text-slate-500">{formatSize(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="flex h-6 w-6 min-[280px]:h-7 min-[280px]:w-7 cursor-pointer shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-3 min-[280px]:mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-white py-5 min-[280px]:py-8 text-xs min-[280px]:text-sm text-slate-600 transition-colors hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-600"
      >
        <FileUp className="h-4 w-4 min-[280px]:h-5 min-[280px]:w-5 text-cyan-400 2xl:h-6 2xl:w-6 3xl:h-7 3xl:w-7 4xl:h-8 4xl:w-8" />
        <span className="min-[280px]:text-sm 2xl:text-base 3xl:text-lg 4xl:text-xl">
          Klik untuk upload dokumen
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </GlassCard>
  )
}

export default UploadDocuments
