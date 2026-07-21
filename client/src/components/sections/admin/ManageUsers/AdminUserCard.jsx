import { Pencil, Trash2 } from "lucide-react"

function AdminUserCard({ user, onEdit, onDelete, onDetail }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 cursor-pointer transition-colors hover:bg-white/[0.07]">
      <div
        className="flex items-center gap-4 p-5"
        onClick={() => onDetail(user)}
      >
        <img
          src={user.avatar}
          alt={user.name}
          className="h-16 w-16 rounded-full object-cover"
        />

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-white">
            {user.name}
          </h3>

          <p className="truncate text-sm text-slate-400">{user.email}</p>

          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-cyan-400/10 px-2 py-1 text-xs text-cyan-300">
              {user.role}
            </span>

            <span
              className={`rounded-full px-2 py-1 text-xs ${
                user.status === "Aktif"
                  ? "bg-green-500/10 text-green-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {user.status}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-t border-white/10 p-4">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit(user)
          }}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2 text-sm text-slate-300 hover:bg-white/10"
        >
          <Pencil size={14} />
          Edit
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(user)
          }}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 py-2 text-sm text-red-400 hover:bg-red-500/10"
        >
          <Trash2 size={14} />
          Hapus
        </button>
      </div>
    </div>
  )
}

export default AdminUserCard
