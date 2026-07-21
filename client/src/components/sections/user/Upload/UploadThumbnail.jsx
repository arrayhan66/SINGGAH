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
    <GlassCard className="p-5 md:p-6">
      <h2 className="text-sm min-[350px]:text-base md:text-lg font-semibold text-white">
        Thumbnail Project
      </h2>
      <p className="mt-1 text-xs md:text-sm text-slate-400">
        Gambar utama yang akan tampil di card Hall. Wajib diisi.
      </p>

      <div className="mt-4">
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
              className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-video w-full max-w-sm flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-cyan-400/30 bg-cyan-400/5 text-slate-300 transition-colors hover:bg-cyan-400/10"
          >
            <ImagePlus className="h-6 w-6 text-cyan-300" />
            <span className="text-xs md:text-sm">Klik untuk upload gambar</span>
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
