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
import UserAvatar from "../../../ui/UserAvatar"
import SmartImage from "../../../ui/SmartImage"

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

function InfoRow({ icon: Icon, label, value, mono, accent = "email" }) {
  return (
    <div className="admin-user-detail-row flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.03] px-4 py-3 transition-colors hover:bg-white/[0.05]">
      <span className="admin-user-detail-icon" data-accent={accent}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-slate-500">{label}</p>
        <p className={`truncate text-sm text-slate-200 ${mono ? "font-mono" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  )
}

function AdminUserProfileCard({ user, onEdit, onDelete }) {
  if (!user) return null

  const isActive = user.status === "Aktif"
  const tipe = tipeConfig[user.role === "admin" ? "admin" : user.tipe] || tipeConfig.umum
  const TipeIcon = tipe.icon

  return (
    <div className="admin-user-detail-card admin-user-form-panel overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl">
      {/* Accent hairline */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600" />

      {/* Header */}
      <div className="admin-user-detail-hero relative overflow-hidden bg-gradient-to-br from-cyan-500/20 via-blue-600/10 to-transparent p-6 md:p-8">
        <div className="pointer-events-none absolute inset-0 opacity-80 admin-user-detail-grid" />

        <div className="relative z-10 flex flex-col items-center gap-5 sm:flex-row sm:text-left">
          <div className="relative shrink-0 rounded-full bg-gradient-to-br from-cyan-300 via-blue-400 to-indigo-500 p-[3px] shadow-xl shadow-blue-950/40">
            <UserAvatar
              name={user.name}
              avatar={user.avatar}
              imgSizeClass="h-24 w-24"
              imgClass="rounded-full"
              fallbackSizeClass="h-24 w-24"
              fallbackClass="bg-gradient-to-br from-cyan-500 to-blue-700 font-bold text-white rounded-full"
              textClass="text-3xl"
            />
            {user.is_verified && (
              <div className="absolute bottom-0.5 right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white/40 shadow-lg shadow-emerald-500/40">
                <BadgeCheck className="h-4 w-4 text-white" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-white md:text-2xl">{user.name}</h2>
            <p className="mt-0.5 text-sm text-slate-400">@{user.username}</p>

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

      {/* Body */}
      <div className="admin-user-detail-body p-6 md:p-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Identitas */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Identitas
            </h3>
            <div className="mt-3 flex flex-col gap-3">
              <InfoRow icon={Mail} label="Email" value={user.email} accent="email" />
              <InfoRow
                icon={AtSign}
                label="Username"
                value={user.username}
                accent="username"
              />
              <InfoRow icon={Shield} label="Role" value={user.role} accent="role" />
              {user.nim_nip && (
                <InfoRow
                  icon={CreditCard}
                  label={
                    user.tipe === "dosen" || user.pending_tipe === "dosen"
                      ? "Kartu Identitas"
                      : "NIM"
                  }
                  value={user.nim_nip}
                  mono
                  accent="nim"
                />
              )}
            </div>
          </div>

          {/* Statistik */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Statistik
            </h3>
            <div className="mt-3 flex flex-col gap-3">
              <InfoRow
                icon={CalendarDays}
                label="Bergabung"
                value={formatDate(user.created_at)}
                accent="join"
              />
              <InfoRow
                icon={FolderKanban}
                label="Karya"
                value={`${user.projectCount ?? 0} karya`}
                accent="karya"
              />
            </div>
          </div>
        </div>

        {user.identitas_photo && (
          <div className="mt-6">
            <div className="flex items-center gap-2">
              <span className="admin-user-detail-icon admin-user-detail-icon-sm" data-accent="nim">
                <IdCard className="h-3.5 w-3.5" />
              </span>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Foto Identitas
              </h3>
            </div>
            <div className="admin-user-detail-photo mt-3 overflow-hidden rounded-xl border border-white/[0.04] bg-white/[0.03] p-3">
              {user.identitas_photo ? (
                <SmartImage
                  src={user.identitas_photo}
                  alt="Foto identitas"
                  className="mx-auto max-h-72 rounded-lg object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 py-6 text-slate-500">
                  <ImageOff className="h-8 w-8" />
                  <span className="text-xs">Foto identitas tidak diunggah</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="admin-user-detail-actions mt-6 flex gap-3 border-t border-white/[0.06] pt-6">
          <button
            type="button"
            onClick={() => onEdit(user)}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-cyan-500/20 transition-all hover:-translate-y-0.5 hover:from-cyan-400 hover:to-blue-500 active:translate-y-0"
          >
            <Pencil size={15} className="max-[390px]:hidden" />
            <span className="max-[390px]:hidden">Edit User</span>
            <span className="hidden max-[390px]:inline">Edit</span>
          </button>
          <button
            type="button"
            onClick={() => onDelete(user)}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-white/10 hover:text-white"
          >
            <Trash2 size={15} className="max-[390px]:hidden" />
            <span className="max-[390px]:hidden">Hapus User</span>
            <span className="hidden max-[390px]:inline">Hapus</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminUserProfileCard