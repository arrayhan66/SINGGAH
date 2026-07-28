import { useRef } from "react"
import { ImagePlus, X } from "lucide-react"
import GlassCard from "../../../ui/GlassCard"

function UploadThumbnail({ value, onChange }) {
  const inputRef = useRef(null)

  const previewUrl = value ? URL.createObjectURL(value) : null

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (file) onChange(file)
  }

  function handleRemove() {
    onChange(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <GlassCard className="p-4 min-[280px]:p-5 sm:p-6 2xl:p-8 3xl:p-10 4xl:p-12">
      <h2 className="text-sm min-[280px]:text-base sm:text-lg 2xl:text-xl 3xl:text-2xl 4xl:text-3xl font-semibold text-white">
        Thumbnail Project
      </h2>
      <p className="mt-1 text-xs min-[280px]:text-sm text-slate-400 2xl:text-base 3xl:text-lg 4xl:text-xl">
        Gambar utama yang akan tampil di card Hall. Wajib diisi.
      </p>

      <div className="mt-3 min-[280px]:mt-4">
        {previewUrl ? (
          <div className="relative w-full max-w-sm">
            <img
              src={previewUrl}
              alt="Preview thumbnail"
              className="aspect-video w-full rounded-xl object-cover border border-white/10"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -right-2 -top-2 flex h-7 w-7 min-[280px]:h-8 min-[280px]:w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors 2xl:h-9 2xl:w-9 3xl:h-10 3xl:w-10 4xl:h-12 4xl:w-12"
            >
              <X size={14} className="2xl:size-4 3xl:size-5 4xl:size-6" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-video w-full max-w-sm flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-cyan-400/30 bg-cyan-400/5 text-slate-300 transition-colors hover:bg-cyan-400/10"
          >
            <ImagePlus className="h-6 w-6 text-cyan-300 2xl:h-7 2xl:w-7 3xl:h-8 3xl:w-8 4xl:h-10 4xl:w-10" />
            <span className="text-xs min-[280px]:text-sm 2xl:text-base 3xl:text-lg 4xl:text-xl">
              Klik untuk upload gambar
            </span>
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
    </GlassCard>
  )
}

export default UploadThumbnail
