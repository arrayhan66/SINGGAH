const YOUTUBE_ID_RE =
  /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/

exports.toEmbedUrl = (url) => {
  if (!url || typeof url !== "string") return ""
  const trimmed = url.trim()
  const match = trimmed.match(YOUTUBE_ID_RE)
  if (match) return `https://www.youtube.com/embed/${match[1]}`
  return trimmed
}
