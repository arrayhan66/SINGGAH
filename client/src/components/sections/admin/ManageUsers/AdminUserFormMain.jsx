import { GraduationCap, Briefcase, Users, CreditCard, Loader2 } from "lucide-react"
import { imageUrl } from "../../../../utils/imageUrl"
import SmartImage from "../../../ui/SmartImage"

const tipeOptions = [
  { value: "mahasiswa", label: "Mahasiswa", icon: GraduationCap, color: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300" },
  { value: "dosen", label: "Dosen", icon: Briefcase, color: "border-blue-400/25 bg-blue-400/10 text-blue-300" },
  { value: "umum", label: "Umum", icon: Users, color: "border-amber-400/25 bg-amber-400/10 text-amber-300" },
]

function AdminUserFormMain({ formData, updateField, onPublish, isEditMode, saving }) {
  const isAdmin = formData.role === "admin"
  const isSpecial = !isAdmin && (formData.tipe === "mahasiswa" || formData.tipe === "dosen")
  const preservedTipe = tipeOptions.find((opt) => opt.value === formData.tipe)?.label || "Umum"

  return (
    <div className="admin-user-form-panel flex flex-col gap-6 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-xl md:p-8">
      <div>
        <h2 className="text-base font-semibold text-white">Data Diri</h2>
        <p className="mt-1 text-xs text-slate-400">
          Informasi dasar pengguna.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-300">
            Nama Lengkap
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Nama lengkap user"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 transition-colors focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/20"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => updateField("username", e.target.value)}
              placeholder="username"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 transition-colors focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/20"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="user@email.com"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 transition-colors focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/20"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.06] pt-6">
        <h2 className="text-base font-semibold text-white">Tipe Pengguna</h2>
        <p className="mt-1 text-xs text-slate-400">
          {isAdmin
            ? `Role Administrator tidak memakai tipe pengguna. Tipe asli "${preservedTipe}" akan aktif kembali saat role diubah ke User Biasa.`
            : "Kategori pengguna di SINGGAH."}
        </p>

        <div className="mt-5 grid grid-cols-1 gap-2 sm:gap-3 md:grid-cols-3">
          {tipeOptions.map((opt) => {
            const Icon = opt.icon
            const isActive = !isAdmin && formData.tipe === opt.value
            return (
              <label
                key={opt.value}
                data-role-card
                className={`group relative flex min-h-24 sm:min-h-28 md:min-h-36 cursor-pointer flex-col items-center justify-center gap-2 sm:gap-3 md:gap-4 overflow-hidden rounded-xl sm:rounded-2xl border-2 p-3 sm:p-4 text-center transition-all duration-300 ease-out ${
                  isActive
                    ? "border-cyan-400 bg-cyan-500/10 text-cyan-300 shadow-lg shadow-cyan-500/25 ring-2 ring-cyan-400/40 ring-offset-2 ring-offset-slate-950"
                    : isAdmin
                      ? "cursor-not-allowed border-white bg-white text-slate-800 shadow-sm opacity-40"
                      : "border-white bg-white text-slate-800 shadow-sm hover:-translate-y-1.5 hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-700 hover:shadow-xl hover:shadow-cyan-400/15 active:scale-[0.97]"
                }`}
              >
                <input
                  className="hidden"
                  type="radio"
                  value={opt.value}
                  name="role"
                  checked={isActive}
                  disabled={isAdmin}
                  onChange={() => updateField("tipe", opt.value)}
                />
                <span
                  className={`pointer-events-none absolute -bottom-8 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full bg-cyan-400 blur-2xl transition-opacity duration-300 ${
                    isActive ? "opacity-40" : isAdmin ? "opacity-0" : "opacity-0 group-hover:opacity-15"
                  }`}
                />
                <Icon
                  className={`relative w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 transition-transform duration-300 ease-out ${
                    isActive
                      ? "scale-110 text-cyan-300"
                      : isAdmin
                        ? "text-slate-400"
                        : "text-cyan-500 group-hover:scale-110 group-hover:-rotate-6 group-hover:text-cyan-600"
                  }`}
                />
                <span className="relative text-sm sm:text-base font-semibold leading-none">
                  {opt.label}
                </span>
              </label>
            )
          })}
        </div>
      </div>

      {isSpecial && (
        <div className="flex flex-col gap-5 border-t border-white/[0.06] pt-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">
              {formData.tipe === "dosen" ? "Kartu Identitas" : "NIM"}
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <CreditCard size={16} />
              </div>
              <input
                type="text"
                value={formData.nim_nip || ""}
                onChange={(e) => updateField("nim_nip", e.target.value)}
                placeholder={formData.tipe === "dosen" ? "Masukkan Kartu Identitas" : "Masukkan NIM"}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 transition-colors focus:border-cyan-400/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">
              Foto {formData.tipe === "dosen" ? "Kartu Identitas" : "KTM"}
            </label>
            {formData.identitas_photo ? (
              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-2">
                <SmartImage
                  src={
                    formData.identitas_photo instanceof File
                      ? URL.createObjectURL(formData.identitas_photo)
                      : typeof formData.identitas_photo === "string" && formData.identitas_photo.startsWith("blob:")
                        ? formData.identitas_photo
                        : imageUrl(formData.identitas_photo)
                  }
                  alt="Kartu Identitas / KTM"
                  className="max-h-56 w-full object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => updateField("identitas_photo", "")}
                  className="user-form-img-remove absolute right-3 top-3 cursor-pointer rounded-lg border border-red-400/30 bg-slate-900/80 p-1.5 text-red-300 backdrop-blur-sm transition-colors hover:border-red-400/50 hover:bg-red-500/20 hover:text-red-200"
                >
                  Hapus
                </button>
              </div>
            ) : (
              <label className="user-form-upload flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/15 bg-white/[0.03] px-4 py-8 text-slate-400 transition-colors hover:border-cyan-400/40 hover:text-cyan-300">
                <span className="text-xs">Belum ada foto. Klik untuk upload {formData.tipe === "dosen" ? "Kartu Identitas" : "KTM"}.</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      updateField("identitas_photo", file)
                    }
                  }}
                />
              </label>
            )}
          </div>
        </div>
      )}

      <div className="hidden border-t border-white/[0.06] pt-6 min-[1000px]:block">
        <button
          type="button"
          onClick={onPublish}
          disabled={saving}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-500 hover:bg-[position:100%_0] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Menyimpan...
            </>
          ) : isEditMode ? (
            "Simpan Perubahan"
          ) : (
            "Tambah User"
          )}
        </button>
      </div>
    </div>
  )
}

export default AdminUserFormMain
