import { Pencil, Trash2, BadgeCheck, FolderKanban } from "lucide-react"

const tipeConfig = {
  mahasiswa: { label: "Mahasiswa", color: "cyan" },
  dosen: { label: "Dosen", color: "blue" },
  admin: { label: "Admin", color: "purple" },
  umum: { label: "Umum", color: "slate" },
}

const tipeBadge = {
  cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
  blue: "border-blue-400/20 bg-blue-400/10 text-blue-300",
  purple: "border-purple-400/20 bg-purple-400/10 text-purple-300",
  slate: "border-slate-400/20 bg-slate-400/10 text-slate-300",
}

function AdminUserCard({ user, onEdit, onDelete, onDetail }) {
  const tipe = tipeConfig[user.tipe] || tipeConfig.umum

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl transition-all duration-500 hover:border-white/20 hover:shadow-2xl hover:shadow-cyan-500/5">
      <div
        className="relative z-10 cursor-pointer p-5"
        onClick={() => onDetail(user)}
      >
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-cyan-500 to-blue-700 shadow-lg">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold text-white">
                  {user.name?.charAt(0)?.toUpperCase() || "?"}
                </span>
              )}
            </div>
            {user.is_verified && (
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 shadow-md">
                <BadgeCheck className="h-3.5 w-3.5 text-white" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-white">
              {user.name}
            </h3>
            <p className="truncate text-sm text-slate-400">{user.email}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${tipeBadge[tipe.color]}`}
              >
                {tipe.label}
              </span>
              <span
                className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${
                  user.status === "Aktif"
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                    : "border-red-400/20 bg-red-400/10 text-red-300"
                }`}
              >
                {user.status}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-slate-500/20 bg-slate-500/10 px-2 py-0.5 text-[11px] text-slate-400">
                <FolderKanban className="h-3 w-3" />
                {user.projectCount ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex gap-2 border-t border-white/[0.06] px-5 py-3">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit(user)
          }}
          className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.04] py-2 text-xs font-medium text-slate-300 transition-all hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300"
        >
          <Pencil size={13} />
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(user)
          }}
          className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/[0.04] py-2 text-xs font-medium text-red-400 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
        >
          <Trash2 size={13} />
          Hapus
        </button>
      </div>
    </div>
  )
}

export default AdminUserCard
