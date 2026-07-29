import { createContext, useContext, useState, useCallback } from "react"
import { beritaData as initialBeritaData } from "../data/beritaData"

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
  const [beritaList, setBeritaList] = useState(initialBeritaData)
  const [tempPreviewData, setTempPreviewData] = useState(null)

  function addBerita(formData) {
    const newId = Math.max(...beritaList.map((b) => b.id), 0) + 1
    const slug = formData.slug || slugify(formData.title) + "-" + newId
    setBeritaList((prev) => [
      ...prev,
      { ...formData, id: newId, slug, status: formData.status || "draft" },
    ])
    return newId
  }

  function updateBerita(id, formData) {
    setBeritaList((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b
        const slug = formData.slug || b.slug || slugify(formData.title || b.title) + "-" + id
        return { ...b, ...formData, id, slug, status: formData.status || b.status || "draft" }
      }),
    )
  }

  function deleteBerita(id) {
    setBeritaList((prev) => prev.filter((b) => b.id !== id))
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
