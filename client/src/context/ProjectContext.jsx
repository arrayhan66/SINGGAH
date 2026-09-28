import { createContext, useContext, useState, useEffect, useCallback } from "react"
import api from "../services/api"
import { useAuth } from "./AuthContext"

const ProjectContext = createContext(null)

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  const { user, isLoading: authLoading } = useAuth()
  const isAuthed = Boolean(user)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      // Dulu limit: 500. Setiap pengunjung anonim langsung menarik 500 karya
      // penuh, padahal yang tampil di layar cuma 9. Pada 1000 pengguna
      // bersamaan itu 500.000 baris JSON untuk halaman yang sama.
      // Batas server untuk user biasa adalah 100; admin boleh 500.
      const res = await api.get("/projects", {
        params: { limit: user?.role === "admin" ? 500 : 100 },
      })
      const items = res.data.data.items || res.data.data || []
      setProjects(items)
    } catch (err) {
      console.error("Failed to fetch projects:", err)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }, [user?.role])

  // Fetch baru setiap status login berubah (guest->member/admin, login/logout)
  // supaya data & hitungan filter tidak basi. Menunggu auth selesai dulu.
  useEffect(() => {
    if (authLoading) return
    fetchProjects()
  }, [fetchProjects, authLoading, isAuthed])

  // Kembalikan karya yang tersimpan supaya pemanggil bisa membaca status
  // akhirnya (pending untuk mahasiswa, published untuk dosen) dan menampilkan
  // popup yang sesuai, bukan asumsi "langsung tayang".
  const addProject = useCallback(async (formData) => {
    try {
      const res = await api.post("/projects", formData)
      await fetchProjects()
      return res.data.data
    } catch (err) {
      console.error("Failed to add project:", err)
      throw err
    }
  }, [fetchProjects])

  const updateProject = useCallback(async (id, formData) => {
    try {
      const res = await api.put(`/projects/${id}`, formData)
      await fetchProjects()
      return res.data.data
    } catch (err) {
      console.error("Failed to update project:", err)
      throw err
    }
  }, [fetchProjects])

  const deleteProject = useCallback(async (id) => {
    try {
      await api.delete(`/projects/${id}`)
      await fetchProjects()
    } catch (err) {
      console.error("Failed to delete project:", err)
      throw err
    }
  }, [fetchProjects])

  const approveProject = useCallback(async (id, note = "") => {
    try {
      await api.patch(`/projects/${id}/status`, {
        status: "published",
        reason: note,
      })
      await fetchProjects()
    } catch (err) {
      console.error("Failed to approve project:", err)
      throw err
    }
  }, [fetchProjects])

  const rejectProject = useCallback(async (id, reason = "") => {
    try {
      await api.patch(`/projects/${id}/status`, {
        status: "rejected",
        reason,
      })
      await fetchProjects()
    } catch (err) {
      console.error("Failed to reject project:", err)
      throw err
    }
  }, [fetchProjects])

  // Slot unggulan & slideshow: optimistis dulu supaya tombol langsung berubah,
  // lalu pakai row terbaru yang dikembalikan endpoint PATCH (bukan refetch
  // seluruh daftar). Refetch 500 karya itu berat (1-3 detik) dan selama itu
  // tombol jadi mati, jadi admin harus klik berkali-kali baru terasa nyangkut.
  const patchProjectLocally = useCallback((id, patch) => {
    setProjects((prev) =>
      prev.map((p) => (String(p.id) === String(id) ? { ...p, ...patch } : p)),
    )
  }, [])

  const setFeaturedSlot = useCallback(
    async (id, slot) => {
      const normalized =
        slot === null || slot === undefined || slot === "" ? null : Number(slot)
      // Melepas unggulan juga otomatis menurunkan karya dari slideshow.
      patchProjectLocally(id, {
        featured_slot: normalized,
        ...(normalized === null ? { is_shown_in_slideshow: false } : null),
      })
      try {
        const res = await api.patch(`/projects/${id}/featured`, { slot })
        const saved = res.data?.data
        if (saved) {
          patchProjectLocally(id, {
            featured_slot: saved.featured_slot ?? null,
            is_shown_in_slideshow: Boolean(saved.is_shown_in_slideshow),
          })
        }
      } catch (err) {
        console.error("Failed to set featured slot:", err)
        await fetchProjects()
        throw err
      }
    },
    [fetchProjects, patchProjectLocally],
  )

  const setSlideshowVisible = useCallback(
    async (id, visible) => {
      patchProjectLocally(id, { is_shown_in_slideshow: Boolean(visible) })
      try {
        const res = await api.patch(`/projects/${id}/slideshow`, { visible })
        const saved = res.data?.data
        if (saved) {
          patchProjectLocally(id, {
            is_shown_in_slideshow: Boolean(saved.is_shown_in_slideshow),
          })
        }
      } catch (err) {
        console.error("Failed to set slideshow visibility:", err)
        await fetchProjects()
        throw err
      }
    },
    [fetchProjects, patchProjectLocally],
  )

  const getProjectById = useCallback((id) => {
    return projects.find((p) => String(p.id) === String(id))
  }, [projects])

  const getProjectBySlug = useCallback((slug) => {
    return projects.find((p) => String(p.slug) === String(slug))
  }, [projects])

  const value = {
    projects,
    loading,
    refreshProjects: fetchProjects,
    addProject,
    updateProject,
    deleteProject,
    approveProject,
    rejectProject,
    setFeaturedSlot,
    setSlideshowVisible,
    getProjectById,
    getProjectBySlug,
  }

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  )
}

export function useProjects() {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error("useProjects harus dipakai di dalam ProjectProvider")
  }
  return context
}
