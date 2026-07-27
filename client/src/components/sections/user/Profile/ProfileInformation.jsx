import GlassCard from "../../../ui/GlassCard"
import { GraduationCap, Briefcase, Users } from "lucide-react"

const tipeConfig = {
  mahasiswa: { label: "Mahasiswa", icon: GraduationCap, color: "cyan" },
  dosen: { label: "Dosen", icon: Briefcase, color: "blue" },
  umum: { label: "Umum", icon: Users, color: "slate" },
}

function ProfileInformation({ profileData, updateProfileField, userTipe }) {
  const tipe = tipeConfig[userTipe] || tipeConfig.umum
  const TipeIcon = tipe.icon

  return (
    <GlassCard className="p-5 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm min-[350px]:text-base md:text-lg font-semibold text-white">
            Data Diri
          </h2>
          <p className="mt-1 text-xs md:text-sm text-slate-400">
            Informasi ini akan ditampilkan pada profil dan project kamu.
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
          <TipeIcon className="h-3.5 w-3.5 text-cyan-400" />
          {tipe.label}
        </div>
      </div>

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
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none transition-colors"
          />
        </div>

        {/* Username & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs md:text-sm font-medium text-slate-300">
              Username
            </label>
            <input
              type="text"
              value={profileData.username}
              onChange={(e) => updateProfileField("username", e.target.value)}
              placeholder="username"
              className="w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs md:text-sm font-medium text-slate-300">
              Email
            </label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => updateProfileField("email", e.target.value)}
              placeholder="nama@poliban.ac.id"
              className="w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

export default ProfileInformation
