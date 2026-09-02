import { useRef, useState } from "react"
import { ImagePlus, X } from "lucide-react"
import GlassCard from "../../../ui/GlassCard"

function UploadThumbnail({ value, onChange, existingValue, onRemoveExisting }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  const isEdit = Boolean(existingValue && !value)
  const previewUrl = value
    ? URL.createObjectURL(value)
    : existingValue || null

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (file) onChange(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) onChange(file)
  }

  function handleRemove() {
    onChange(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <GlassCard className="relative overflow-hidden p-3 min-[280px]:p-5 sm:p-6 2xl:p-8 3xl:p-10 4xl:p-12">
      <div className="relative z-10">
        <div className="flex items-center gap-1.5 min-[280px]:gap-2">
          <div className="flex shrink-0 h-[clamp(2.5rem,1.5rem+2.5vw,5rem)] w-[clamp(2.5rem,1.5rem+2.5vw,5rem)] items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/30">
            <ImagePlus className="text-cyan-300 h-[clamp(1.25rem,0.75rem+1.25vw,2.5rem)] w-[clamp(1.25rem,0.75rem+1.25vw,2.5rem)]" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xs min-[280px]:text-base sm:text-lg 2xl:text-xl 3xl:text-2xl 4xl:text-3xl font-semibold text-white">
              Thumbnail Karya
            </h2>
          </div>
          <span className="shrink-0 rounded-full border border-red-400/30 bg-red-400/10 px-1.5 min-[280px]:px-2.5 py-0.5 text-[9px] min-[280px]:text-[11px] font-medium text-red-400 2xl:text-sm 3xl:text-base">
            Wajib
          </span>
        </div>

        <div className="mt-2 min-[280px]:mt-4">
          {previewUrl ? (
            <div className="relative w-full">
              <img
                src={previewUrl}
                alt="Preview thumbnail"
                className="aspect-video w-full rounded-xl object-cover border border-white/10 shadow-lg"
              />
              <button
                type="button"
                onClick={() => {
                  if (isEdit) {
                    onRemoveExisting?.()
                  } else {
                    handleRemove()
                  }
                }}
                className="absolute -right-1.5 -top-1.5 min-[280px]:-right-2 min-[280px]:-top-2 flex h-6 w-6 min-[280px]:h-8 min-[280px]:w-8 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors 2xl:h-9 2xl:w-9 3xl:h-10 3xl:w-10 4xl:h-12 4xl:w-12"
              >
                <X className="h-3.5 w-3.5 min-[280px]:h-4 min-[280px]:w-4 2xl:h-[18px] 2xl:w-[18px] 3xl:h-5 3xl:w-5 4xl:h-6 4xl:w-6" />
              </button>
              {isEdit && (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="absolute bottom-3 right-3 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-800 shadow-lg backdrop-blur-sm hover:bg-white transition-colors cursor-pointer"
                >
                  Ganti
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`group relative flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-2 min-[280px]:gap-3 overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300 ${
                dragOver
                  ? "border-cyan-500 bg-cyan-100 scale-[1.02]"
                  : "border-slate-200 bg-white hover:border-cyan-400 hover:bg-cyan-50"
              }`}
            >
              <div className="pointer-events-none absolute -inset-full -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-all duration-700 group-hover:inset-0" />

              <ImagePlus className={`h-6 w-6 min-[280px]:h-10 min-[280px]:w-10 transition-colors duration-300 ${
                dragOver ? "text-cyan-500" : "text-cyan-400"
              } 2xl:h-12 2xl:w-12 3xl:h-14 3xl:w-14 4xl:h-16 4xl:w-16`} />
              <div className="flex flex-col items-center gap-0.5 min-[280px]:gap-1">
                <span className={`text-[11px] min-[280px]:text-sm font-medium transition-colors duration-300 2xl:text-base 3xl:text-lg 4xl:text-xl ${
                  dragOver ? "text-cyan-600" : "text-slate-600"
                }`}>
                  {dragOver ? "Lepaskan gambar di sini" : "Klik untuk upload gambar"}
                </span>
                <span className="text-[9px] min-[280px]:text-[10px] text-slate-400 2xl:text-sm 3xl:text-base">
                  PNG, JPG, atau WEBP — Maks 5MB
                </span>
              </div>
            </button>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </GlassCard>
  )
}

export default UploadThumbnail
