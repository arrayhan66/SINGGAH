import { useAuth } from "../../../../context/AuthContext"
import GlassCard from "../../../ui/GlassCard"
import {
  Shield,
  BadgeCheck,
  BadgeAlert,
  CalendarDays,
  GraduationCap,
  Briefcase,
  Users,
  Crown,
} from "lucide-react"

const tipeConfig = {
  mahasiswa: { label: "Mahasiswa", icon: GraduationCap },
  dosen: { label: "Dosen", icon: Briefcase },
  umum: { label: "Umum", icon: Users },
  admin: { label: "Admin", icon: Crown },
}

function formatDate(dateString) {
  if (!dateString) return "-"
  const d = new Date(dateString)
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function ProfileAccountInfo() {
  const { user } = useAuth()

  const tipe = tipeConfig[user?.tipe] || tipeConfig.umum
  const TipeIcon = tipe.icon

  const infoItems = [
    {
      label: "Tipe Akun",
      value: tipe.label,
      icon: TipeIcon,
      iconColor: "text-cyan-400",
    },
    {
      label: "Role",
      value: user?.role === "admin" ? "Administrator" : "Pengguna",
      icon: Shield,
      iconColor: "text-blue-400",
    },
    {
      label: "Status Akun",
      value: user?.status === "active" ? "Aktif" : "Tidak Aktif",
      icon: user?.status === "active" ? BadgeCheck : BadgeAlert,
      iconColor:
        user?.status === "active" ? "text-emerald-400" : "text-red-400",
    },
    {
      label: "Email Terverifikasi",
      value: user?.is_verified ? "Terverifikasi" : "Belum Diverifikasi",
      icon: user?.is_verified ? BadgeCheck : BadgeAlert,
      iconColor: user?.is_verified ? "text-emerald-400" : "text-amber-400",
    },
    {
      label: "Bergabung",
      value: formatDate(user?.created_at),
      icon: CalendarDays,
      iconColor: "text-purple-400",
    },
  ]

  return (
    <GlassCard className="p-5 md:p-6">
      <h2 className="text-sm min-[350px]:text-base md:text-lg font-semibold text-white">
        Info Akun
      </h2>
      <p className="mt-1 text-xs md:text-sm text-slate-400">
        Informasi akun yang tidak dapat diubah.
      </p>

      <div className="mt-5 flex flex-col gap-3">
        {infoItems.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${item.iconColor}`} />
                <span className="text-xs md:text-sm text-slate-400">
                  {item.label}
                </span>
              </div>
              <span className="text-xs md:text-sm font-medium text-white text-end min-w-0">
                {item.value}
              </span>
            </div>
          )
        })}
      </div>
    </GlassCard>
  )
}

export default ProfileAccountInfo
