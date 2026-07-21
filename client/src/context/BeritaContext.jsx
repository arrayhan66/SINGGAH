import { createContext, useContext, useState } from "react"
import { beritaData as initialBeritaData } from "../data/beritaData"

const BeritaContext = createContext(null)

export function BeritaProvider({ children }) {
  const [beritaList, setBeritaList] = useState(initialBeritaData)

  function addBerita(formData) {
    const newId = Math.max(...beritaList.map((b) => b.id), 0) + 1
    setBeritaList((prev) => [...prev, { ...formData, id: newId }])
    return newId
  }

  function updateBerita(id, formData) {
    setBeritaList((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...formData, id } : b)),
    )
  }

  function deleteBerita(id) {
    setBeritaList((prev) => prev.filter((b) => b.id !== id))
  }

  function getBeritaById(id) {
    return beritaList.find((b) => String(b.id) === String(id))
  }

  const value = {
    beritaList,
    addBerita,
    updateBerita,
    deleteBerita,
    getBeritaById,
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
