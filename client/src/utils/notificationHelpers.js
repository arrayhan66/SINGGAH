export function formatRelativeTime(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now - date) / 1000)
  if (diff < 60) return "Baru saja"
  if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`
  if (diff < 86400) return `${Math.floor(diff / 3600)}j lalu`
  if (diff < 604800) return `${Math.floor(diff / 86400)}h lalu`
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
}

export function formatFullDate(dateStr) {
  return new Date(dateStr).toLocaleString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const typeLabel = {
  like: "Disukai",
  comment: "Komentar",
  project_approved: "Disetujui",
  project_rejected: "Ditolak",
  new_project: "Karya Baru",
  project_updated: "Diperbarui Admin",
  project_deleted: "Dihapus Admin",
  announcement: "Pengumuman",
  user_registered: "Pendaftaran Baru",
  tipe_approved: "Verifikasi Disetujui",
  tipe_rejected: "Verifikasi Ditolak",
}

import {
  Heart,
  MessageCircle,
  BadgeCheck,
  XCircle,
  Sparkles,
  Pencil,
  Trash2,
  Megaphone,
  UserPlus,
  IdCard,
  ShieldX,
  Bell,
} from "lucide-react"

const iconMap = {
  like: Heart,
  comment: MessageCircle,
  project_approved: BadgeCheck,
  project_rejected: XCircle,
  new_project: Sparkles,
  project_updated: Pencil,
  project_deleted: Trash2,
  announcement: Megaphone,
  user_registered: UserPlus,
  tipe_approved: IdCard,
  tipe_rejected: ShieldX,
}

const bgMap = {
  like: "bg-gradient-to-br from-pink-500/25 to-rose-500/10 ring-1 ring-inset ring-pink-400/30 shadow-lg shadow-pink-500/10",
  comment: "bg-gradient-to-br from-sky-500/25 to-blue-500/10 ring-1 ring-inset ring-sky-400/30 shadow-lg shadow-sky-500/10",
  project_approved: "bg-gradient-to-br from-emerald-500/25 to-teal-500/10 ring-1 ring-inset ring-emerald-400/30 shadow-lg shadow-emerald-500/10",
  project_rejected: "bg-gradient-to-br from-red-500/25 to-rose-500/10 ring-1 ring-inset ring-red-400/30 shadow-lg shadow-red-500/10",
  new_project: "bg-gradient-to-br from-indigo-500/25 to-violet-500/10 ring-1 ring-inset ring-indigo-400/30 shadow-lg shadow-indigo-500/10",
  project_updated: "bg-gradient-to-br from-cyan-500/25 to-blue-500/10 ring-1 ring-inset ring-cyan-400/40 shadow-lg shadow-cyan-500/10",
  project_deleted: "bg-gradient-to-br from-orange-500/25 to-amber-500/10 ring-1 ring-inset ring-orange-400/30 shadow-lg shadow-orange-500/10",
  announcement: "bg-gradient-to-br from-amber-500/25 to-yellow-500/10 ring-1 ring-inset ring-amber-400/30 shadow-lg shadow-amber-500/10",
  user_registered: "bg-gradient-to-br from-fuchsia-500/25 to-purple-500/10 ring-1 ring-inset ring-fuchsia-400/30 shadow-lg shadow-fuchsia-500/10",
  tipe_approved: "bg-gradient-to-br from-emerald-500/25 to-teal-500/10 ring-1 ring-inset ring-emerald-400/30 shadow-lg shadow-emerald-500/10",
  tipe_rejected: "bg-gradient-to-br from-red-500/25 to-rose-500/10 ring-1 ring-inset ring-red-400/30 shadow-lg shadow-red-500/10",
}

const textMap = {
  like: "text-pink-400",
  comment: "text-sky-400",
  project_approved: "text-emerald-400",
  project_rejected: "text-red-400",
  new_project: "text-indigo-400",
  project_updated: "text-cyan-400",
  project_deleted: "text-orange-400",
  announcement: "text-amber-400",
  user_registered: "text-fuchsia-400",
  tipe_approved: "text-emerald-400",
  tipe_rejected: "text-red-400",
}

export function notifTypeLabel(type) {
  return typeLabel[type] || "Notifikasi"
}

export function notifIcon(type) {
  return iconMap[type] || Bell
}

export function notifBg(type) {
  return (
    bgMap[type] ||
    "bg-gradient-to-br from-slate-500/25 to-slate-600/10 ring-1 ring-inset ring-slate-400/30 shadow-lg shadow-slate-500/10"
  )
}

export function notifText(type) {
  return textMap[type] || "text-slate-400"
}
