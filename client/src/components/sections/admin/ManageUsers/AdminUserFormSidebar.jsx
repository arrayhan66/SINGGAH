import { useRef, useState } from "react"
import { Camera, BadgeCheck, BadgeAlert, Eye, EyeOff } from "lucide-react"

const roleOptions = ["Mahasiswa", "Admin"]
const statusOptions = ["Aktif", "Nonaktif"]

function AdminUserFormSidebar({ formData, updateField, isEditMode }) {
  const inputRef = useRef(null)
  const [showPassword, setShowPassword] = useState(false)

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const previewUrl = URL.createObjectURL(file)
    updateField("avatar", previewUrl)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Avatar */}
      <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-5 backdrop-blur-xl">
        <h3 className="text-sm font-semibold text-white">Foto Profil</h3>
        <p className="mt-0.5 text-xs text-slate-400">
          Klik ikon kamera untuk mengganti
        </p>

        <div className="mt-4 flex items-center gap-4">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-cyan-500 to-blue-700 shadow-lg">
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt="Preview avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white">?</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-cyan-500 text-white shadow-lg transition-colors hover:bg-cyan-400"
            >
              <Camera size={12} />
            </button>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <p className="text-xs text-slate-500">
            Format JPG/PNG, maksimal 2MB
          </p>
        </div>
      </div>

      {/* Detail Akun */}
      <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-5 backdrop-blur-xl">
        <h3 className="text-sm font-semibold text-white">Detail Akun</h3>

        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400">Role</label>
            <select
              value={formData.role}
              onChange={(e) => updateField("role", e.target.value)}
              className="w-full cursor-pointer rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition-colors focus:border-cyan-400/50 focus:outline-none"
            >
              {roleOptions.map((role) => (
                <option key={role} value={role} className="bg-brand-navy">
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400">Status</label>
            <select
              value={formData.status}
              onChange={(e) => updateField("status", e.target.value)}
              className="w-full cursor-pointer rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition-colors focus:border-cyan-400/50 focus:outline-none"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status} className="bg-brand-navy">
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password || ""}
                onChange={(e) => updateField("password", e.target.value)}
                placeholder={isEditMode ? "Biarkan kosong jika tidak diganti" : "Minimal 8 karakter"}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 pr-9 text-xs text-white placeholder:text-slate-500 transition-colors focus:border-cyan-400/50 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 transition-colors hover:text-slate-200"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400">
              Verifikasi Email
            </label>
            <button
              type="button"
              onClick={() =>
                updateField("is_verified", !formData.is_verified)
              }
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                formData.is_verified
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                  : "border-amber-400/30 bg-amber-400/10 text-amber-300"
              }`}
            >
              {formData.is_verified ? (
                <>
                  <BadgeCheck size={14} />
                  Terverifikasi
                </>
              ) : (
                <>
                  <BadgeAlert size={14} />
                  Belum Terverifikasi
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminUserFormSidebar
