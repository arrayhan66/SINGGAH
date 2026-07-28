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
    <GlassCard className="p-4 min-[280px]:p-5 sm:p-6 2xl:p-8 3xl:p-10 4xl:p-12">
      <h2 className="text-sm min-[280px]:text-base sm:text-lg 2xl:text-xl 3xl:text-2xl 4xl:text-3xl font-semibold text-white">
        Galeri Project{" "}
        <span className="text-slate-500 font-normal text-xs min-[280px]:text-sm 2xl:text-base 3xl:text-lg 4xl:text-xl">
          (opsional)
        </span>
      </h2>
      <p className="mt-1 text-xs min-[280px]:text-sm text-slate-400 2xl:text-base 3xl:text-lg 4xl:text-xl">
        Tambahkan gambar pendukung, misalnya proses pengerjaan atau hasil akhir
        dari sudut lain.
      </p>

      <div className="mt-3 min-[280px]:mt-4 grid grid-cols-2 min-[400px]:grid-cols-3 md:grid-cols-4 gap-2 min-[280px]:gap-3 2xl:gap-4 3xl:gap-5 4xl:gap-6">
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
                className="absolute -right-2 -top-2 flex h-6 w-6 min-[280px]:h-7 min-[280px]:w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors 2xl:h-8 2xl:w-8 3xl:h-9 3xl:w-9 4xl:h-10 4xl:w-10"
              >
                <X size={12} className="2xl:size-3.5 3xl:size-4 4xl:size-5" />
              </button>
            </div>
          )
        })}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-cyan-400/30 bg-cyan-400/5 text-slate-300 transition-colors hover:bg-cyan-400/10"
        >
          <ImagePlus className="h-5 w-5 text-cyan-300 2xl:h-6 2xl:w-6 3xl:h-7 3xl:w-7 4xl:h-8 4xl:w-8" />
          <span className="text-[10px] min-[280px]:text-[11px] min-[350px]:text-xs 2xl:text-sm 3xl:text-base 4xl:text-lg">
            Tambah
          </span>
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
