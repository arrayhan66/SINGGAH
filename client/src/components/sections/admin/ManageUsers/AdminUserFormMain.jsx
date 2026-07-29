import { GraduationCap, Briefcase, Users } from "lucide-react"

const tipeOptions = [
  { value: "mahasiswa", label: "Mahasiswa", icon: GraduationCap },
  { value: "dosen", label: "Dosen", icon: Briefcase },
  { value: "umum", label: "Umum", icon: Users },
]

function AdminUserFormMain({ formData, updateField }) {
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
          Kategori pengguna di SINGGAH.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {tipeOptions.map((opt) => {
            const Icon = opt.icon
            const isActive = formData.tipe === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateField("tipe", opt.value)}
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border px-4 py-4 text-center transition-all ${
                  isActive
                    ? "border-cyan-400/40 bg-cyan-400/10 shadow-lg shadow-cyan-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
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
    </div>
  )
}

export default AdminUserFormMain
