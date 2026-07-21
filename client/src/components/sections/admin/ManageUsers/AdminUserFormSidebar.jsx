import { useRef } from "react"
import { Camera } from "lucide-react"

const roleOptions = ["Mahasiswa", "Admin"]
const statusOptions = ["Aktif", "Nonaktif"]

function AdminUserFormSidebar({
  formData,
  updateField,
  onPublish,
  isEditMode,
}) {
  const inputRef = useRef(null)

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const previewUrl = URL.createObjectURL(file)
    updateField("avatar", previewUrl)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Publish Box */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <button
          type="button"
          onClick={onPublish}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-500 hover:bg-[position:100%_0]"
        >
          {isEditMode ? "Simpan Perubahan" : "Tambah User"}
        </button>
      </div>

      {/* Avatar */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold text-white">Foto Profil</div>

        <div className="mt-3 flex items-center gap-4">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-cyan-500 to-blue-700">
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt="Preview avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold text-white">?</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500 text-white shadow-lg hover:bg-cyan-400 transition-colors"
            >
              <Camera size={11} />
            </button>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <p className="text-xs text-slate-400">
            Klik ikon kamera untuk mengganti foto
          </p>
        </div>
      </div>

      {/* Role & Status */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold text-white">Detail Akun</div>

        <div className="mt-3 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Role</label>
            <select
              value={formData.role}
              onChange={(e) => updateField("role", e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-cyan-400/50 focus:outline-none"
            >
              {roleOptions.map((role) => (
                <option key={role} value={role} className="bg-brand-navy">
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Status</label>
            <select
              value={formData.status}
              onChange={(e) => updateField("status", e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-cyan-400/50 focus:outline-none"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status} className="bg-brand-navy">
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminUserFormSidebar
