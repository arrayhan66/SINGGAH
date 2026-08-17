import { createContext, useContext, useState, useEffect, useCallback } from "react"
import api from "../services/api"

const BeritaContext = createContext(null)

export function BeritaProvider({ children }) {
  const [beritaList, setBeritaList] = useState([])
  const [tempPreviewData, setTempPreviewData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchNews = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get("/news")
      const items = res.data.data.items || res.data.data || []
      const normalized = items.map((item) => ({
        ...item,
        image: item.image || item.headline_image || "",
        desc: item.desc || item.summary || "",
        contentHTML: item.contentHTML || "",
      }))
      setBeritaList(normalized)
    } catch (err) {
      console.error("Failed to fetch news:", err)
      setBeritaList([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  function toFormData(data) {
    const fd = new FormData()
    for (const [key, value] of Object.entries(data)) {
      if (value instanceof File) {
        fd.append(key, value)
      } else if (Array.isArray(value)) {
        fd.append(key, JSON.stringify(value))
      } else if (value != null) {
        fd.append(key, String(value))
      }
    }
    return fd
  }

  async function addBerita(formData) {
    try {
      const res = await api.post("/news", toFormData(formData))
      await fetchNews()
      return res.data.data.id
    } catch (err) {
      console.error("Failed to add berita:", err)
      throw err
    }
  }

  async function updateBerita(id, formData) {
    try {
      await api.put(`/news/${id}`, toFormData(formData))
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
    loading,
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
