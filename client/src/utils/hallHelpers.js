import { karyaCategories, karyaProjects } from "../data/karyaData"

export const CATEGORY_COLORS = {
  website: "#3b82f6",
  "mobile-app": "#a78bfa",
  iot: "#06b6d4",
  "artificial-intelligence": "#ec4899",
  "data-science": "#34d399",
  "cyber-security": "#fbbf24",
  "ui-ux-design": "#fb7185",
}

const DOSEN_MARKERS = ["dr.", "prof.", "dra.", "h."]

function classify(project, indexInCategory) {
  const name = String(project.author?.[0] || project.User?.name || "").toLowerCase()
  if (DOSEN_MARKERS.some((m) => name.includes(m))) return "dosen"
  return (indexInCategory - 1) % 4 === 0 ? "dosen" : "mahasiswa"
}

export function enrichProjects(projects = karyaProjects) {
  const counter = {}
  return projects.map((project) => {
    const cat = project.category || "other"
    counter[cat] = (counter[cat] || 0) + 1
    return { ...project, authorType: classify(project, counter[cat]) }
  })
}

export function getCategoryStats(projects = karyaProjects) {
  const enriched = enrichProjects(projects)
  return karyaCategories.reduce((acc, cat) => {
    const list = enriched.filter((p) => p.category === cat.slug)
    acc[cat.slug] = {
      total: list.length,
      dosen: list.filter((p) => p.authorType === "dosen").length,
      mahasiswa: list.filter((p) => p.authorType === "mahasiswa").length,
    }
    return acc
  }, {})
}

export function getDosenProjects(projects = karyaProjects) {
  return enrichProjects(projects).filter((p) => p.authorType === "dosen")
}

export function getMahasiswaProjects(projects = karyaProjects) {
  return enrichProjects(projects).filter((p) => p.authorType === "mahasiswa")
}
