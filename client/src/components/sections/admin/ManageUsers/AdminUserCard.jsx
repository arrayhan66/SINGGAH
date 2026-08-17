import { Pencil, Trash2, BadgeCheck, FolderKanban, ShieldCheck, ShieldX, Hourglass } from "lucide-react"

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

const pendingTipeLabel = {
  mahasiswa: "Mahasiswa",
  dosen: "Dosen",
}

function AdminUserCard({ user, onEdit, onDelete, onDetail, onApprove, onReject, approving }) {
  const tipe = tipeConfig[user.tipe] || tipeConfig.umum
  const isPending = Boolean(user.pending_tipe)
  const pendingLabel = pendingTipeLabel[user.pending_tipe] || "Tipe Baru"

  return (
    <div className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl transition-all duration-500 hover:shadow-2xl ${
      isPending
        ? "border-amber-400/30 shadow-amber-500/10 hover:border-amber-400/50"
        : "border-white/[0.06] hover:border-white/20 hover:shadow-cyan-500/5"
    }`}>
      {isPending && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400" />
      )}

      <div
        className="relative z-10 cursor-pointer p-5"
        onClick={() => onDetail(user)}
      >
        <div className="flex flex-col items-center text-center gap-4 min-[420px]:flex-row min-[420px]:items-start min-[420px]:text-left">
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
            {isPending ? (
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 shadow-md">
                <Hourglass className="h-3 w-3 text-white" />
              </div>
            ) : (
              user.is_verified && (
                <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 shadow-md">
                  <BadgeCheck className="h-3.5 w-3.5 text-white" />
                </div>
              )
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-white">
              {user.name}
            </h3>
            <p className="truncate text-sm text-slate-400">{user.email}</p>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 min-[420px]:justify-start">
              <span
                className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${tipeBadge[tipe.color]}`}
              >
                {tipe.label}
              </span>
              {isPending && (
                <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
                  <Hourglass className="h-3 w-3" />
                  Verifikasi {pendingLabel}
                </span>
              )}
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
        {isPending ? (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onApprove(user)
              }}
              disabled={approving}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.06] py-2 text-xs font-semibold text-emerald-300 transition-all hover:border-emerald-500/40 hover:bg-emerald-500/15 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShieldCheck size={13} />
              Setujui
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onReject(user)
              }}
              disabled={approving}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-red-500/25 bg-red-500/[0.04] py-2 text-xs font-semibold text-red-400 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShieldX size={13} />
              Tolak
            </button>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  )
}

export default AdminUserCard
