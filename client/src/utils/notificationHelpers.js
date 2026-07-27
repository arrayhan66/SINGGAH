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

const iconMap = {
  like: "♡",
  comment: "💬",
  project_approved: "✓",
  project_rejected: "✗",
  announcement: "📢",
}

const bgMap = {
  like: "bg-pink-500/15",
  comment: "bg-blue-500/15",
  project_approved: "bg-emerald-500/15",
  project_rejected: "bg-red-500/15",
  announcement: "bg-amber-500/15",
}

const textMap = {
  like: "text-pink-400",
  comment: "text-blue-400",
  project_approved: "text-emerald-400",
  project_rejected: "text-red-400",
  announcement: "text-amber-400",
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
