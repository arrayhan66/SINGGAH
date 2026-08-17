import {
  Palette,
  Camera,
  Video,
  Film,
  PenTool,
  Sparkles,
  Code,
  BookOpen,
  FolderOpen,
} from "lucide-react"

export function getCategoryIcon(name) {
  const lower = name.toLowerCase()
  if (lower.includes("desain") || lower.includes("grafis")) return Palette
  if (lower.includes("ilustrasi") || lower.includes("gambar")) return PenTool
  if (lower.includes("fotografi") || lower.includes("foto")) return Camera
  if (lower.includes("videografi") || lower.includes("video")) return Video
  if (lower.includes("animasi")) return Film
  if (lower.includes("lukis") || lower.includes("seni")) return Sparkles
  if (lower.includes("kode") || lower.includes("pemrograman") || lower.includes("web")) return Code
  if (lower.includes("buku") || lower.includes("literatur")) return BookOpen
  return FolderOpen
}

export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}
