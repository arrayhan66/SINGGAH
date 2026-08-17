export const FALLBACK_IMAGE =
  "https://placehold.co/600x400/0f172a/38bdf8?text=No+Image"

export function imageUrl(url) {
  return url && String(url).trim() ? url : FALLBACK_IMAGE
}
