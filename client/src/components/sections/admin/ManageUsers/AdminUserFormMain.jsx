import { GraduationCap, Briefcase, Users, CreditCard } from "lucide-react"
import { imageUrl } from "../../../../utils/imageUrl"

const tipeOptions = [
  { value: "mahasiswa", label: "Mahasiswa", icon: GraduationCap },
  { value: "dosen", label: "Dosen", icon: Briefcase },
  { value: "umum", label: "Umum", icon: Users },
]

function AdminUserFormMain({ formData, updateField, onPublish, isEditMode, saving }) {
  const isAdmin = formData.role === "admin"
  const isSpecial = !isAdmin && (formData.tipe === "mahasiswa" || formData.tipe === "dosen")

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-xl md:p-8">
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
            ? "Admin menggunakan tipe Umum secara default."
            : "Kategori pengguna di SINGGAH."}
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {tipeOptions.map((opt) => {
            const Icon = opt.icon
            const isActive = isAdmin ? opt.value === "umum" : formData.tipe === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                disabled={isAdmin}
                onClick={() => !isAdmin && updateField("tipe", opt.value)}
                className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-4 text-center transition-all ${
                  isAdmin
                    ? "cursor-not-allowed border-white/5 bg-white/[0.02] opacity-40"
                    : `cursor-pointer ${isActive
                        ? "border-cyan-400/40 bg-cyan-400/10 shadow-lg shadow-cyan-500/10"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"}`
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${isActive ? "text-cyan-300" : "text-slate-400"}`}
                />
                <span
                  className={`text-xs font-medium ${isActive ? "text-cyan-200" : "text-slate-400"}`}
                >
                  {opt.label}
                </span>
              </button>
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
                <img
                  src={
                    typeof formData.identitas_photo === "string" && formData.identitas_photo.startsWith("blob:")
                      ? formData.identitas_photo
                      : imageUrl(formData.identitas_photo)
                  }
                  alt="Kartu Identitas / KTM"
                  className="max-h-56 w-full object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => updateField("identitas_photo", "")}
                  className="absolute right-3 top-3 cursor-pointer rounded-lg border border-white/10 bg-black/70 p-1.5 text-slate-300 transition-colors hover:text-white"
                >
                  Hapus
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/15 bg-white/[0.03] px-4 py-8 text-slate-400 transition-colors hover:border-cyan-400/40 hover:text-cyan-300">
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
          className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-500 hover:bg-[position:100%_0] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving
            ? "Menyimpan..."
            : isEditMode
              ? "Simpan Perubahan"
              : "Tambah User"}
        </button>
      </div>
    </div>
  )
}

export default AdminUserFormMain
