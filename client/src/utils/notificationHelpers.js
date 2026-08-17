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

const iconMap = {
  like: "♡",
  comment: "💬",
  project_approved: "✓",
  project_rejected: "✗",
  new_project: "🆕",
  project_updated: "✎",
  project_deleted: "🗑",
  announcement: "📢",
  user_registered: "📝",
  tipe_approved: "🪪",
  tipe_rejected: "🚫",
}

const bgMap = {
  like: "bg-pink-500/15",
  comment: "bg-blue-500/15",
  project_approved: "bg-emerald-500/15",
  project_rejected: "bg-red-500/15",
  new_project: "bg-indigo-500/15",
  project_updated: "bg-cyan-500/15",
  project_deleted: "bg-orange-500/15",
  announcement: "bg-amber-500/15",
  user_registered: "bg-indigo-500/15",
  tipe_approved: "bg-emerald-500/15",
  tipe_rejected: "bg-red-500/15",
}

const textMap = {
  like: "text-pink-400",
  comment: "text-blue-400",
  project_approved: "text-emerald-400",
  project_rejected: "text-red-400",
  new_project: "text-indigo-400",
  project_updated: "text-cyan-400",
  project_deleted: "text-orange-400",
  announcement: "text-amber-400",
  user_registered: "text-indigo-400",
  tipe_approved: "text-emerald-400",
  tipe_rejected: "text-red-400",
}

export function notifTypeLabel(type) {
  return typeLabel[type] || "Notifikasi"
}

export function notifIcon(type) {
  return iconMap[type] || "🔔"
}

export function notifBg(type) {
  return bgMap[type] || "bg-slate-500/15"
}

export function notifText(type) {
  return textMap[type] || "text-slate-400"
}
