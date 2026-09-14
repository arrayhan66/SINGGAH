import bookMetadata from "../../data/bookMetadata.json"

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

  // Exact match or case-insensitive match
  const foundKey = Object.keys(bookMetadata).find(
    (k) => k.toLowerCase() === coverKey.toLowerCase()
  )

  const meta = foundKey ? bookMetadata[foundKey] : null
  const formattedTitle = formatTitleFromKey(coverKey)

  return {
    judul: meta?.judul || formattedTitle,
    penulis: meta?.penulis || "(isi manual)",
    sinopsis: meta?.sinopsis || "Sinopsis belum tersedia.",
  }
}

export async function fetchGoogleBookData(coverKey, manualMeta) {
  const cacheKey = `book_meta_cache_${coverKey}`
  const cached = localStorage.getItem(cacheKey)
  if (cached) {
    try {
      return JSON.parse(cached)
    } catch (e) {
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
  } catch (e) {
    // Network or CORS error - fallback to manual
  }
  return manualMeta
}

function stripHtml(html) {
  const tmp = document.createElement("DIV")
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ""
}
