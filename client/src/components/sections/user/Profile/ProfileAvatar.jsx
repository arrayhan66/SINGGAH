import { useRef } from "react"
import { Camera, X } from "lucide-react"
import GlassCard from "../../../ui/GlassCard"

function ProfileAvatar({ value, existingUrl, onChange, onRemove }) {
  const inputRef = useRef(null)

  const previewUrl = value ? URL.createObjectURL(value) : null
  const displayUrl = previewUrl || existingUrl

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (file) onChange(file)
  }

  function handleRemove(e) {
    e.stopPropagation()
    onRemove()
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <GlassCard className="p-5 md:p-6">
      <h2 className="text-sm min-[350px]:text-base md:text-lg font-semibold text-white">
        Foto Profil
      </h2>
      <p className="mt-1 text-xs md:text-sm text-slate-400">
        Foto ini akan tampil di Navbar dan project yang kamu upload.
      </p>

      <div className="mt-4 flex items-center gap-5">
        <div className="relative">
          <div className="flex h-20 w-20 md:h-24 md:w-24 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-cyan-500 to-blue-700">
            {displayUrl ? (
              <img
                src={displayUrl}
                alt="Preview avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-2xl md:text-3xl font-bold text-white">
                ?
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500 text-white shadow-lg hover:bg-cyan-400 transition-colors cursor-pointer"
          >
            <Camera size={14} />
          </button>

          {displayUrl && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500/80 text-white shadow-lg hover:bg-red-500 transition-colors cursor-pointer"
            >
              <X size={12} />
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

        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-xs md:text-sm text-slate-300">
            Klik ikon kamera untuk mengganti foto
          </p>
          <p className="text-[11px] text-slate-500">
            Format JPG/PNG, maksimal 2MB
          </p>
        </div>
      </div>
    </GlassCard>
  )
}

export default ProfileAvatar
