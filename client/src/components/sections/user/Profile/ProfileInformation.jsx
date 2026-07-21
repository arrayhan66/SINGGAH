import GlassCard from "../../../ui/GlassCard"

function ProfileInformation({ profileData, updateProfileField }) {
  return (
    <GlassCard className="p-5 md:p-6">
      <h2 className="text-sm min-[350px]:text-base md:text-lg font-semibold text-white">
        Data Diri
      </h2>
      <p className="mt-1 text-xs md:text-sm text-slate-400">
        Informasi ini akan ditampilkan pada profil dan project kamu.
      </p>

      <div className="mt-5 flex flex-col gap-4">
        {/* Nama */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs md:text-sm font-medium text-slate-300">
            Nama Lengkap
          </label>
          <input
            type="text"
            value={profileData.name}
            onChange={(e) => updateProfileField("name", e.target.value)}
            placeholder="Nama lengkap kamu"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs md:text-sm font-medium text-slate-300">
            Email
          </label>
          <input
            type="email"
            value={profileData.email}
            onChange={(e) => updateProfileField("email", e.target.value)}
            placeholder="nama@poliban.ac.id"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none"
          />
        </div>

        {/* NIM & Jurusan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs md:text-sm font-medium text-slate-300">
              NIM
            </label>
            <input
              type="text"
              value={profileData.nim}
              onChange={(e) => updateProfileField("nim", e.target.value)}
              placeholder="Contoh: 2110130210012"
              className="w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs md:text-sm font-medium text-slate-300">
              Jurusan / Program Studi
            </label>
            <input
              type="text"
              value={profileData.jurusan}
              onChange={(e) => updateProfileField("jurusan", e.target.value)}
              placeholder="Contoh: D4 Teknik Elektronika"
              className="w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

export default ProfileInformation
