import {
  Mail,
  AtSign,
  Shield,
  CalendarDays,
  FolderKanban,
  BadgeCheck,
  BadgeAlert,
  GraduationCap,
  Briefcase,
  Users,
  Crown,
  Pencil,
  Trash2,
  CreditCard,
  ImageOff,
  IdCard,
} from "lucide-react"

const tipeConfig = {
  mahasiswa: { label: "Mahasiswa", icon: GraduationCap, color: "cyan" },
  dosen: { label: "Dosen", icon: Briefcase, color: "blue" },
  admin: { label: "Admin", icon: Crown, color: "purple" },
  umum: { label: "Umum", icon: Users, color: "slate" },
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

function AdminUserProfileCard({ user, onEdit, onDelete }) {
  if (!user) return null

  const isActive = user.status === "Aktif"
  const tipe = tipeConfig[user.tipe] || tipeConfig.umum
  const TipeIcon = tipe.icon

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500/20 via-blue-600/10 to-transparent p-6 md:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-400/20 blur-[80px]" />
        <div className="relative z-10 flex flex-col items-center gap-5 sm:flex-row sm:text-left">
          <div className="relative shrink-0">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/20 bg-gradient-to-br from-cyan-500 to-blue-700 shadow-2xl shadow-cyan-500/20">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-white">
                  {user.name?.charAt(0)?.toUpperCase() || "?"}
                </span>
              )}
            </div>
            {user.is_verified && (
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30">
                <BadgeCheck className="h-4 w-4 text-white" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-white md:text-2xl">
              {user.name}
            </h2>
            <p className="text-sm text-slate-400">@{user.username}</p>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                <TipeIcon className="h-3.5 w-3.5 text-cyan-400" />
                {tipe.label}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  isActive
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                    : "border-red-400/20 bg-red-400/10 text-red-300"
                }`}
              >
                {user.status}
              </span>
              {user.is_verified ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  <BadgeCheck className="h-3 w-3" />
                  Terverifikasi
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">
                  <BadgeAlert className="h-3 w-3" />
                  Belum Verifikasi
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Sections */}
      <div className="p-6 md:p-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Identitas */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Identitas
            </h3>
            <div className="mt-3 flex flex-col gap-3">
              <div className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.03] px-4 py-3">
                <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-500">Email</p>
                  <p className="truncate text-sm text-slate-200">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.03] px-4 py-3">
                <AtSign className="h-4 w-4 shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-500">Username</p>
                  <p className="truncate text-sm text-slate-200">
                    {user.username}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.03] px-4 py-3">
                <Shield className="h-4 w-4 shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-500">Role</p>
                  <p className="truncate text-sm text-slate-200">
                    {user.role}
                  </p>
                </div>
              </div>
              {user.nim_nip && (
                <div className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.03] px-4 py-3">
                  <CreditCard className="h-4 w-4 shrink-0 text-slate-400" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-500">
                      {user.tipe === "dosen" || user.pending_tipe === "dosen"
                        ? "Kartu Identitas"
                        : "NIM"}
                    </p>
                    <p className="truncate font-mono text-sm text-slate-200">
                      {user.nim_nip}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Statistik */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Statistik
            </h3>
            <div className="mt-3 flex flex-col gap-3">
              <div className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.03] px-4 py-3">
                <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-500">Bergabung</p>
                  <p className="text-sm text-slate-200">
                    {formatDate(user.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.03] px-4 py-3">
                <FolderKanban className="h-4 w-4 shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-500">Project</p>
                  <p className="text-sm text-slate-200">
                    {user.projectCount ?? 0} project
                  </p>
                </div>
              </div>
            </div>
          </div>
          </div>

          {user.identitas_photo && (
            <div className="mt-6">
              <div className="flex items-center gap-2">
                <IdCard className="h-4 w-4 text-cyan-300" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Foto Identitas
                </h3>
              </div>
              <div className="mt-3 rounded-xl border border-white/[0.04] bg-white/[0.03] p-4">
                {user.identitas_photo ? (
                  <img
                    src={user.identitas_photo}
                    alt="Foto identitas"
                    className="mx-auto max-h-72 rounded-lg border border-white/10 object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 py-6 text-slate-500">
                    <ImageOff className="h-8 w-8" />
                    <span className="text-xs">
                      Foto identitas tidak diunggah
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
        <div className="mt-6 flex gap-3 border-t border-white/[0.06] pt-6">
          <button
            type="button"
            onClick={() => onEdit(user)}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-200 transition-all hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300"
          >
            <Pencil size={15} />
            Edit User
          </button>
          <button
            type="button"
            onClick={() => onDelete(user)}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.04] px-4 py-2.5 text-sm font-medium text-red-400 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
          >
            <Trash2 size={15} />
            Hapus User
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminUserProfileCard
