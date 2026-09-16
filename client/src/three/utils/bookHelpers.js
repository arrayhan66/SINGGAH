import bookMetadata from "../../data/bookMetadata.json"

// Buku di scene memakai kunci alias (mis. "atomic", "bintang", "golang",
// "fullstack", "sherlock", "cpp") sementara bookMetadata.json memakai kunci
// file canonical ("ATMOICHABITS", dst). Resolusi ini memastikan sinopsis/
// penulis manual di JSON tetap dipakai walau kunci yang diklik adalah alias.
// Kunci harus lowercase; "knhilafah" (kunci file lama) dipetakan ke "khilafah".
const BOOK_META_ALIASES = {
  atomic: "ATMOICHABITS",
  atmoichabits: "ATMOICHABITS",
  cpp: "buku pemrograman c++",
  python: "bukupython",
  eragon: "Christopher-Paolini-Eragon",
  bintang: "cover-novel-bintang-karya-tere-liye",
  dasar: "dasar-dasarpemrograman",
  golang: "dasar-dasarpemrograman",
  demon: "demoninthewood",
  einstein: "einsteinwalterisaacson",
  teras: "filosofi teras",
  gus: "gustirabykatakokoh",
  atta: "mohammadattauntuknegeriku",
  sherlock: "sherlock holmes",
  fullstack: "pemrograman berbasis kecerdansan buatan",
  ai: "pemrograman berbasis kecerdansan buatan",
  ananda: "saat ananda bertanya islam",
  putusin: "udahputusin aja",
  knhilafah: "khilafah",
  laskar: "laskar-pelangi",
  tanahjawa: "kisah tanah jawa",
}

export function formatTitleFromKey(key) {
  if (!key) return "Buku Tanpa Judul"
  // Clean extension if present, replace dashes/underscores with spaces
  const clean = key.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ")
  // Capitalize words
  return clean
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
}

export function getBookMeta(coverKey) {
  if (!coverKey) {
    return {
      judul: "Buku Interaktif",
      penulis: "(isi manual)",
      sinopsis: "Sinopsis belum tersedia.",
    }
  }

  // Exact match / case-insensitive / resolusi alias ke kunci canonical.
  const lower = coverKey.toLowerCase()
  const foundKey = Object.keys(bookMetadata).find((k) => k.toLowerCase() === lower)
  const resolvedKey = foundKey || BOOK_META_ALIASES[lower]
  const meta = resolvedKey ? bookMetadata[resolvedKey] : null
  const formattedTitle = formatTitleFromKey(coverKey)

  return {
    judul: meta?.judul || formattedTitle,
    penulis: meta?.penulis || "(isi manual)",
    sinopsis: meta?.sinopsis || "Sinopsis belum tersedia.",
  }
}

export async function fetchGoogleBookData(coverKey, manualMeta) {
  // Data manual (bookMetadata.json) adalah sumber utama. Kalau sinopsis sudah
  // diisi manual, jangan pernah timpa dengan API Google maupun cache lama di
  // localStorage — cache lama dari pencarian sebelumnya justru mengalahkan
  // perubahan manual di JSON.
  const isManualComplete =
    !!manualMeta.sinopsis && manualMeta.sinopsis !== "Sinopsis belum tersedia."
  if (isManualComplete) return manualMeta

  const cacheKey = `book_meta_cache_${coverKey}`
  const cached = localStorage.getItem(cacheKey)
  if (cached) {
    try {
      return JSON.parse(cached)
    } catch {
      // ignore
    }
  }

  const queryTitle = manualMeta.judul || formatTitleFromKey(coverKey)
  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(
        queryTitle
      )}&maxResults=1`
    )
    if (!res.ok) return manualMeta
    const data = await res.json()
    if (data.items && data.items.length > 0) {
      const vol = data.items[0].volumeInfo
      const apiTitle = vol.title || queryTitle
      const apiAuthors = vol.authors ? vol.authors.join(", ") : manualMeta.penulis
      const apiDesc = vol.description ? stripHtml(vol.description) : manualMeta.sinopsis

      const result = {
        judul: apiTitle,
        penulis: apiAuthors,
        sinopsis: apiDesc,
        fromApi: true,
      }
      localStorage.setItem(cacheKey, JSON.stringify(result))
      return result
    }
  } catch {
    // Network or CORS error - fallback to manual
  }
  return manualMeta
}

function stripHtml(html) {
  const tmp = document.createElement("DIV")
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ""
}
