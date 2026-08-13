import { createContext, useContext, useState, useEffect, useCallback } from "react"
import api from "../services/api"

const ProjectContext = createContext(null)

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([
    {
      id: 1,
      slug: "sistem-informasi-akademik-poliban",
      title: "Sistem Informasi Akademik Poliban",
      description: "Platform manajemen akademik kampus berbasis web menggunakan Laravel.",
      thumbnail: "https://placehold.co/600x400/0f172a/38bdf8?text=Website",
      images: [{ image_url: "https://placehold.co/600x400/0f172a/38bdf8?text=Website" }],
      User: { name: "Ahmad Fauzan" },
      Category: { id: 1, name: "Website", slug: "website" },
      status: "approved",
      created_at: "2024-01-10",
      likesCount: 30,
      viewsCount: 150,
    }
  ])

  const fetchProjects = useCallback(async () => {
    try {
      const res = await api.get("/projects")
      const items = res.data.data.items || res.data.data || []
      if (items.length > 0) {
        setProjects(items)
      }
    } catch (err) {
      console.error("Failed to fetch projects, keeping fallback:", err)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const addProject = useCallback(async (formData) => {
    try {
      const res = await api.post("/projects", formData)
      await fetchProjects()
      return res.data.data.id
    } catch (err) {
      console.error("Failed to add project:", err)
      throw err
    }
  }, [fetchProjects])

  const updateProject = useCallback(async (id, formData) => {
    try {
      await api.put(`/projects/${id}`, formData)
      await fetchProjects()
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
      await api.post(`/projects/${id}/approve`, { note })
      await fetchProjects()
    } catch (err) {
      console.error("Failed to approve project:", err)
      throw err
    }
  }, [fetchProjects])

  const rejectProject = useCallback(async (id, reason = "") => {
    try {
      await api.post(`/projects/${id}/reject`, { reason })
      await fetchProjects()
    } catch (err) {
      console.error("Failed to reject project:", err)
      throw err
    }
  }, [fetchProjects])

  const getProjectById = useCallback((id) => {
    return projects.find((p) => String(p.id) === String(id))
  }, [projects])

  const getProjectBySlug = useCallback((slug) => {
    return projects.find((p) => String(p.slug) === String(slug))
  }, [projects])

  const value = {
    projects,
    addProject,
    updateProject,
    deleteProject,
    approveProject,
    rejectProject,
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
