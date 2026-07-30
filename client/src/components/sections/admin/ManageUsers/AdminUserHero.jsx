import { Users, UserCheck, UserX, UserPlus } from "lucide-react"
import { useUsers } from "../../../../context/UserContext"
import AdminHeroBackground from "../../../ui/AdminHeroBackground"

const statsConfig = [
  { key: "total", label: "Total User", icon: Users, color: "cyan" },
  { key: "aktif", label: "Aktif", icon: UserCheck, color: "emerald" },
  { key: "nonaktif", label: "Nonaktif", icon: UserX, color: "red" },
]

function AdminUserHero() {
  const { userList } = useUsers()

  const stats = {
    total: userList.length,
    aktif: userList.filter((u) => u.status === "Aktif").length,
    nonaktif: userList.filter((u) => u.status === "Nonaktif").length,
  }

  const colorMap = {
    cyan: "from-cyan-400 to-blue-500 shadow-cyan-500/25",
    emerald: "from-emerald-400 to-teal-500 shadow-emerald-500/25",
    red: "from-red-400 to-rose-500 shadow-red-500/25",
  }

  const iconBgMap = {
    cyan: "bg-cyan-400/10 border-cyan-400/30",
    emerald: "bg-emerald-400/10 border-emerald-400/30",
    red: "bg-red-400/10 border-red-400/30",
  }

  const textMap = {
    cyan: "text-cyan-300",
    emerald: "text-emerald-300",
    red: "text-red-300",
  }

  return (
    <AdminHeroBackground>
      <div className="px-4 md:px-6 lg:px-8 pt-8 pb-8">
        <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-6 backdrop-blur-xl md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/30">
                <Users className="h-7 w-7 text-white" />
              </div>
              <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-md">
                {stats.total}
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white md:text-2xl">
                Kelola User
              </h1>
              <p className="mt-1 text-xs text-slate-400 md:text-sm">
                Tambah, edit, hapus, dan kelola seluruh pengguna SINGGAH.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {statsConfig.map((s) => {
              const Icon = s.icon
              return (
                <div
                  key={s.key}
                  className={`flex items-center gap-2 rounded-xl border ${iconBgMap[s.color]} px-4 py-2.5`}
                >
                  <Icon className={`h-4 w-4 ${textMap[s.color]}`} />
                  <div>
                    <span className="text-lg font-bold text-white">
                      {stats[s.key]}
                    </span>
                    <span className="ml-1.5 text-[11px] text-slate-400">
                      {s.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </AdminHeroBackground>
  )
}

export default AdminUserHero
