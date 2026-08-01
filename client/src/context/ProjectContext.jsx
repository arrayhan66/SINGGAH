import { createContext, useContext, useState, useCallback } from "react"
import { dummyAdminProjects } from "../components/sections/admin/dummyAdminProjects"

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
  const [projects, setProjects] = useState(() =>
    dummyAdminProjects.map((p) => ({ ...p, slug: p.slug || slugify(p.title) })),
  )

  const addProject = useCallback((formData) => {
    const newId = Math.max(...projects.map((p) => p.id), 0) + 1
    const newProject = {
      id: newId,
      slug: slugify(formData.title) + "-" + newId,
      title: formData.title,
      description: formData.description,
      year: Number(formData.year) || new Date().getFullYear(),
      thumbnail: formData.thumbnail || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400",
      images: formData.images || [{ image_url: formData.thumbnail || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800" }],
      User: {
        name: formData.userName || "Admin SINGGAH",
        nim: formData.userNim || "ADMIN001",
      },
      Category: {
        id: Number(formData.categoryId) || 1,
        name: formData.categoryName || "IoT",
        slug: (formData.categoryName || "iot").toLowerCase().replace(/\s+/g, "-"),
      },
      technologies: Array.isArray(formData.technologies)
        ? formData.technologies
        : (formData.technologies || "").split(",").map((t) => t.trim()).filter(Boolean),
      status: formData.status || "pending",
      created_at: new Date().toISOString().split("T")[0],
      likesCount: 0,
      viewsCount: 0,
    }

    setProjects((prev) => [newProject, ...prev])
    return newId
  }, [projects])

  const updateProject = useCallback((id, formData) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        return {
          ...p,
          title: formData.title !== undefined ? formData.title : p.title,
          description: formData.description !== undefined ? formData.description : p.description,
          year: formData.year !== undefined ? Number(formData.year) : p.year,
          thumbnail: formData.thumbnail !== undefined ? formData.thumbnail : p.thumbnail,
          images: formData.images !== undefined ? formData.images : p.images,
          User: {
            ...p.User,
            name: formData.userName !== undefined ? formData.userName : p.User?.name,
            nim: formData.userNim !== undefined ? formData.userNim : p.User?.nim,
          },
          Category: formData.categoryName ? {
            id: Number(formData.categoryId) || p.Category?.id || 1,
            name: formData.categoryName,
            slug: formData.categoryName.toLowerCase().replace(/\s+/g, "-"),
          } : p.Category,
          technologies: formData.technologies !== undefined
            ? (Array.isArray(formData.technologies) ? formData.technologies : formData.technologies.split(",").map((t) => t.trim()).filter(Boolean))
            : p.technologies,
          status: formData.status !== undefined ? formData.status : p.status,
          approveNote: formData.approveNote !== undefined ? formData.approveNote : p.approveNote,
          rejectionReason: formData.rejectionReason !== undefined ? formData.rejectionReason : p.rejectionReason,
        }
      })
    )
  }, [])

  const deleteProject = useCallback((id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const approveProject = useCallback((id, note = "") => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "approved", approveNote: note, rejectionReason: undefined } : p))
    )
  }, [])

  const rejectProject = useCallback((id, reason = "") => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "rejected", rejectionReason: reason } : p))
    )
  }, [])

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
