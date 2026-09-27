import { createContext, useContext, useState, useEffect, useCallback } from "react"
import api from "../services/api"

const BeritaContext = createContext(null)

// Dulu limit: 1000. Semua berita diambil utuh oleh SETIAP pengunjung
// (context ini berada di atas router) termasuk yang cuma membuka halaman
// depan. Batas server untuk user biasa adalah 100, admin 500.
const NEWS_PAGE_SIZE = 100

export function BeritaProvider({ children }) {
  const [beritaList, setBeritaList] = useState([])
  const [tempPreviewData, setTempPreviewData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchNews = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get("/news", { params: { limit: NEWS_PAGE_SIZE } })
      const items = res.data.data.items || res.data.data || []
      // contentHTML sengaja tidak ikut di sini. Field itu menyimpan HTML dari
      // editor yang bisa memuat gambar inline sebagai base64; satu data yang
      // diukur punya contentHTML 956 KB (99,6% di antaranya satu PNG base64),
      // sehingga 4 berita jadi 1,16 MB untuk satu respons daftar. Isi artikel
      // diambil sendiri lewat fetchBeritaDetail di bawah.
      const normalized = items.map((item) => ({
        ...item,
        image: item.image || item.headline_image || "",
        desc: item.desc || item.summary || "",
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

  // Mengambil satu berita lengkap (dengan contentHTML) untuk halaman detail,
  // form edit admin, dan pratinjau admin. Ketiganya butuh isi artikel, jadi
  // lebih baik satu request tambahan daripada menarik seluruh isi artikel
  // setiap kali halaman depan dibuka.
  const fetchBeritaDetail = useCallback(async (slug) => {
    if (!slug) return null

    const res = await api.get(`/news/slug/${encodeURIComponent(slug)}`)
    const item = res.data.data
    if (!item) return null

    return {
      ...item,
      image: item.image || item.headline_image || "",
      desc: item.desc || item.summary || "",
      contentHTML: item.contentHTML || "",
    }
  }, [])

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
    fetchBeritaDetail,
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
