import {
  Mail,
  AtSign,
  ShieldCheck,
  CalendarDays,
  FolderKanban,
  Pencil,
  Trash2,
} from "lucide-react"

function AdminUserProfileCard({ user, onEdit, onDelete }) {
  if (!user) return null

  const isActive = user.status === "Aktif"

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-cyan-500 to-blue-700">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-white">
              {user.name?.charAt(0)?.toUpperCase() || "?"}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-lg md:text-xl font-bold text-white break-words">
            {user.name}
          </h2>
          <p className="text-sm text-slate-400">@{user.username}</p>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300 border border-cyan-400/20">
              {user.role}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium border ${
                isActive
                  ? "bg-emerald-400/10 text-emerald-300 border-emerald-400/20"
                  : "bg-red-400/10 text-red-300 border-red-400/20"
              }`}
            >
              {user.status}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/10 pt-6">
        <div className="flex items-center gap-3">
          <Mail className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-sm text-slate-300 min-w-0 break-all">
            {user.email}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <AtSign className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-sm text-slate-300 min-w-0 break-words">
            {user.username}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <CalendarDays className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-sm text-slate-300">
            Bergabung {user.joinedAt}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <FolderKanban className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-sm text-slate-300">
            {user.projectCount ?? 0} project
          </span>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => onEdit(user)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/10 transition-colors"
        >
          <Pencil size={15} />
          Edit User
        </button>
        <button
          type="button"
          onClick={() => onDelete(user)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-2.5 text-sm font-medium text-red-300 hover:bg-red-500/20 transition-colors"
        >
          <Trash2 size={15} />
          Hapus User
        </button>
      </div>
    </div>
  )
}

export default AdminUserProfileCard
