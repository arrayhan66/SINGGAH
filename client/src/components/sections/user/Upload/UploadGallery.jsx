import { useRef } from "react"
import { ImagePlus, X, Image } from "lucide-react"
import GlassCard from "../../../ui/GlassCard"
import { imageUrl } from "../../../../utils/imageUrl"

function UploadGallery({ value, onChange, existingItems, onRemoveExisting }) {
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

  return (
    <GlassCard className="p-3 min-[280px]:p-5 sm:p-6 2xl:p-8 3xl:p-10 4xl:p-12">
      <div className="flex items-center gap-2">
        <div className="flex shrink-0 h-[clamp(2.5rem,1.5rem+2.5vw,5rem)] w-[clamp(2.5rem,1.5rem+2.5vw,5rem)] items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/30">
          <Image className="text-cyan-300 h-[clamp(1.25rem,0.75rem+1.25vw,2.5rem)] w-[clamp(1.25rem,0.75rem+1.25vw,2.5rem)]" />
        </div>
        <div>
          <h2 className="text-xs min-[280px]:text-base sm:text-lg 2xl:text-xl 3xl:text-2xl 4xl:text-3xl font-semibold text-white">
            Galeri Karya
          </h2>
        </div>
        <span className="ml-auto inline-flex items-center rounded-full border border-slate-600 bg-slate-800 px-1.5 min-[280px]:px-2 py-0.5 text-[8px] min-[280px]:text-[10px] font-medium text-slate-400 2xl:text-xs 3xl:text-sm">
          Opsional
        </span>
      </div>

      <div className="mt-2 min-[280px]:mt-4 grid grid-cols-2 min-[400px]:grid-cols-3 md:grid-cols-4 gap-2 min-[280px]:gap-3 2xl:gap-4 3xl:gap-5 4xl:gap-6">
        {hasExisting &&
          existingItems.map((img, index) => {
            const src = imageUrl(typeof img === "string" ? img : img.image_url || img.url)
            return (
              <div key={`existing-${index}`} className="relative aspect-square">
                <img
                  src={src}
                  alt={`Existing ${index + 1}`}
                  className="h-full w-full rounded-xl object-cover border border-white/10"
                />
                <button
                  type="button"
                  onClick={() => onRemoveExisting?.(index)}
                  className="absolute -right-1.5 -top-1.5 min-[280px]:-right-2 min-[280px]:-top-2 flex h-5 w-5 min-[280px]:h-7 min-[280px]:w-7 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors 2xl:h-8 2xl:w-8 3xl:h-9 3xl:w-9 4xl:h-10 4xl:w-10"
                >
                  <X className="h-3 w-3 min-[280px]:h-3.5 min-[280px]:w-3.5 2xl:h-4 2xl:w-4 3xl:h-[18px] 3xl:w-[18px] 4xl:h-5 4xl:w-5" />
                </button>
              </div>
            )
          })}

        {value.map((file, index) => {
          const previewUrl = URL.createObjectURL(file)
          return (
            <div key={`new-${index}`} className="relative aspect-square">
              <img
                src={previewUrl}
                alt={`New ${index + 1}`}
                className="h-full w-full rounded-xl object-cover border border-white/10"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute -right-1.5 -top-1.5 min-[280px]:-right-2 min-[280px]:-top-2 flex h-5 w-5 min-[280px]:h-7 min-[280px]:w-7 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors 2xl:h-8 2xl:w-8 3xl:h-9 3xl:w-9 4xl:h-10 4xl:w-10"
              >
                <X className="h-3 w-3 min-[280px]:h-3.5 min-[280px]:w-3.5 2xl:h-4 2xl:w-4 3xl:h-[18px] 3xl:w-[18px] 4xl:h-5 4xl:w-5" />
              </button>
            </div>
          )
        })}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-200 bg-white text-slate-600 transition-colors hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-600"
        >
          <ImagePlus className="h-4 w-4 min-[280px]:h-5 min-[280px]:w-5 text-cyan-400 2xl:h-6 2xl:w-6 3xl:h-7 3xl:w-7 4xl:h-8 4xl:w-8" />
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
