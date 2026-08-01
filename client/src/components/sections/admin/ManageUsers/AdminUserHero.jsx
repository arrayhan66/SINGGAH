import { useNavigate } from "react-router-dom"
import { Users, UserCheck, UserX, Search, Plus, LayoutGrid } from "lucide-react"
import { useUsers } from "../../../../context/UserContext"
import AdminHeroBackground from "../../../ui/AdminHeroBackground"

const statsConfig = [
  { key: "total", label: "Total User", icon: Users, color: "cyan" },
  { key: "aktif", label: "Aktif", icon: UserCheck, color: "emerald" },
  { key: "nonaktif", label: "Nonaktif", icon: UserX, color: "red" },
]

const statusTabs = [
  { value: "all", label: "Semua", icon: LayoutGrid },
  { value: "Aktif", label: "Aktif", icon: UserCheck },
  { value: "Nonaktif", label: "Nonaktif", icon: UserX },
]

function AdminUserHero({ search, onSearchChange, statusFilter, onStatusChange }) {
  const navigate = useNavigate()
  const { userList } = useUsers()

  const stats = {
    total: userList.length,
    aktif: userList.filter((u) => u.status === "Aktif").length,
    nonaktif: userList.filter((u) => u.status === "Nonaktif").length,
  }

  const statusCounts = {
    all: userList.length,
    Aktif: stats.aktif,
    Nonaktif: stats.nonaktif,
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
    <AdminHeroBackground fullWidth>
      <div className="px-4 md:px-6 lg:px-8 pt-8 pb-8">
        <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-6 backdrop-blur-xl md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-400/10 border border-cyan-400/30">
                <Users className="h-7 w-7 text-cyan-300" />
              </div>
              <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-white shadow-md">
                {stats.total}
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Kelola <span className="text-cyan-300">User</span>
              </h1>
              <p className="mt-1 text-sm text-slate-400 max-w-xl">
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

        <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
          <div className="relative flex-1 min-w-0">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={onSearchChange}
              placeholder="Cari nama, email, atau username..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none shadow-sm focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <button
            type="button"
            onClick={() => navigate("/users/tambah")}
            className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-500 hover:bg-[position:100%_0]"
          >
            <Plus size={16} />
            Tambah User
          </button>
        </div>

        <div className="mt-4 flex w-fit flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
          {statusTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = statusFilter === tab.value
            const count = statusCounts[tab.value]
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => onStatusChange(tab.value)}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-cyan-400/40 focus-visible:outline-none ${
                  isActive
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
                aria-pressed={isActive}
              >
                <Icon
                  className={`h-3.5 w-3.5 transition-colors duration-200 ${isActive ? "text-cyan-300" : "text-slate-500"}`}
                />
                {tab.label}
                {count !== undefined && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                      isActive
                        ? "bg-cyan-500/20 text-cyan-300"
                        : "bg-white/[0.07] text-slate-400"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </AdminHeroBackground>
  )
}

export default AdminUserHero
