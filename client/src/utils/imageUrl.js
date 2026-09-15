export const FALLBACK_IMAGE =
  "https://placehold.co/600x400/0f172a/38bdf8?text=No+Image"

export function imageUrl(url) {
  return url && String(url).trim() ? url : FALLBACK_IMAGE
}

// Buat URL Cloudinary terkait transformasi ukuran/format/kualitas, mis:
//   https://res.cloudinary.com/<cloud>/image/upload/w_1920,f_auto,q_85/v.../file.png
// Dipakai untuk menyajikan gambar slide dengan resolusi sesuai layar
// (retina) + format modern (WebP via f_auto) + kualitas seimbang q_85,
// bukan mengunduh PNG orisinal 1.5-1.8MB yang di-upscale browser.
const CLOUDINARY_HOST_RE = /res\.cloudinary\.com/
const CLOUDINARY_UPLOAD_MARKER = "/image/upload/"

export function cloudinarySrc(url, { w, q = 85, f = "auto" } = {}) {
  if (!url || !String(url).trim()) return url
  const source = String(url)
  if (!CLOUDINARY_HOST_RE.test(source)) return undefined
  const i = source.indexOf(CLOUDINARY_UPLOAD_MARKER)
  if (i === -1) return undefined
  const parts = []
  if (w) parts.push(`w_${w}`)
  if (f) parts.push(`f_${f}`)
  if (q) parts.push(`q_${q}`)
  if (parts.length === 0) return undefined
  return (
    source.slice(0, i + CLOUDINARY_UPLOAD_MARKER.length) +
    parts.join(",") +
    "/" +
    source.slice(i + CLOUDINARY_UPLOAD_MARKER.length)
  )
}

// srcSet responsif: set widths menyesuaikan ukuran kontainer slide
// (640px max) dikali 1x/2x/3x untuk retina. Kembalikan undefined untuk
// URL non-Cloudinary agar <img> memakai src biasa.
export function buildSrcSet(url, widths = [640, 1024, 1920], q = 85) {
  const entries = widths
    .map((w) => {
      const u = cloudinarySrc(url, { w, q })
      return u ? `${u} ${w}w` : null
    })
    .filter(Boolean)
  return entries.length ? entries.join(", ") : undefined
}
