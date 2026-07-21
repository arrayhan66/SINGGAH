import { useRef } from "react"
import { ImagePlus, X } from "lucide-react"
import GlassCard from "../../../ui/GlassCard"

function UploadGallery({ value, onChange }) {
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

  return (
    <GlassCard className="p-5 md:p-6">
      <h2 className="text-sm min-[350px]:text-base md:text-lg font-semibold text-white">
        Galeri Project{" "}
        <span className="text-slate-500 font-normal text-xs md:text-sm">
          (opsional)
        </span>
      </h2>
      <p className="mt-1 text-xs md:text-sm text-slate-400">
        Tambahkan gambar pendukung, misalnya proses pengerjaan atau hasil akhir
        dari sudut lain.
      </p>

      <div className="mt-4 grid grid-cols-2 min-[400px]:grid-cols-3 md:grid-cols-4 gap-3">
        {value.map((file, index) => {
          const previewUrl = URL.createObjectURL(file)
          return (
            <div key={index} className="relative aspect-square">
              <img
                src={previewUrl}
                alt={`Galeri ${index + 1}`}
                className="h-full w-full rounded-xl object-cover border border-white/10"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )
        })}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-cyan-400/30 bg-cyan-400/5 text-slate-300 transition-colors hover:bg-cyan-400/10"
        >
          <ImagePlus className="h-5 w-5 text-cyan-300" />
          <span className="text-[11px] md:text-xs">Tambah</span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </GlassCard>
  )
}

export default UploadGallery
