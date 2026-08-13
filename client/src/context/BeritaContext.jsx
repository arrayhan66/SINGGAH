import { createContext, useContext, useState, useEffect, useCallback } from "react"
import api from "../services/api"

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

const BeritaContext = createContext(null)

export function BeritaProvider({ children }) {
  const [beritaList, setBeritaList] = useState([
    {
      id: 1,
      slug: "pameran-karya-teknik-elektro-2026",
      title: "Pameran Karya Mahasiswa Teknik Elektro 2026 Resmi Dibuka",
      content: "Pameran tahunan SINGGAH menampilkan berbagai inovasi digital dari mahasiswa dan dosen.",
      image: "https://placehold.co/600x400/0f172a/38bdf8?text=Berita",
      date: "2026-07-27",
      status: "published",
    }
  ])
  const [tempPreviewData, setTempPreviewData] = useState(null)

  const fetchNews = useCallback(async () => {
    try {
      const res = await api.get("/news")
      const items = res.data.data.items || res.data.data || []
      if (items.length > 0) {
        setBeritaList(items)
      }
    } catch (err) {
      console.error("Failed to fetch news, keeping fallback:", err)
    }
  }, [])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  async function addBerita(formData) {
    try {
      const res = await api.post("/news", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      await fetchNews()
      return res.data.data.id
    } catch (err) {
      console.error("Failed to add berita:", err)
      throw err
    }
  }

  async function updateBerita(id, formData) {
    try {
      await api.put(`/news/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      await fetchNews()
    } catch (err) {
      console.error("Failed to update berita:", err)
      throw err
    }
  }

  async function deleteBerita(id) {
    try {
      await api.delete(`/news/${id}`)
      await fetchNews()
    } catch (err) {
      console.error("Failed to delete berita:", err)
      throw err
    }
  }

  function getBeritaById(id) {
    if (String(id) === "temp") return tempPreviewData
    return beritaList.find((b) => String(b.id) === String(id))
  }

  function getBeritaBySlug(slug) {
    return beritaList.find((b) => b.slug === slug)
  }

  const value = {
    beritaList,
    addBerita,
    updateBerita,
    deleteBerita,
    getBeritaById,
    getBeritaBySlug,
    tempPreviewData,
    setTempPreviewData,
  }

  return (
    <BeritaContext.Provider value={value}>{children}</BeritaContext.Provider>
  )
}

export function useBerita() {
  const context = useContext(BeritaContext)
  if (!context) {
    throw new Error("useBerita harus dipakai di dalam BeritaProvider")
  }
  return context
}
