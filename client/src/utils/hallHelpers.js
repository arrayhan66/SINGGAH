export const CATEGORY_COLORS = {
  website: "#3b82f6",
  "mobile-app": "#a78bfa",
  iot: "#06b6d4",
  "artificial-intelligence": "#ec4899",
  "data-science": "#34d399",
  "cyber-security": "#fbbf24",
  "ui-ux-design": "#fb7185",
  "game-development": "#f97316",
}

const DOSEN_MARKERS = ["dr.", "prof.", "dra.", "h."]
const MAX_DOSEN = 4
const MAX_MAHASISWA = 12

function classify(project, indexInCategory) {
  const tipe = project.User?.tipe || project.authorType
  if (tipe === "dosen") return "dosen"
  if (tipe === "mahasiswa") return "mahasiswa"

  const name = String(project.author?.[0] || project.User?.name || "").toLowerCase()
  if (DOSEN_MARKERS.some((m) => name.includes(m))) return "dosen"
  return (indexInCategory - 1) % 4 === 0 ? "dosen" : "mahasiswa"
}

export function enrichProjects(projects = []) {
  const counter = {}
  return projects.map((project) => {
    const cat = project.category || project.Category?.slug || "other"
    counter[cat] = (counter[cat] || 0) + 1
    return { ...project, authorType: classify(project, counter[cat]) }
  })
}

export function getCategoryStats(projects = [], categories = []) {
  const enriched = enrichProjects(projects)
  return categories.reduce((acc, cat) => {
    const list = enriched.filter((p) => (p.category || p.Category?.slug) === cat.slug)
    const dosenList = list.filter((p) => p.authorType === "dosen").slice(0, MAX_DOSEN)
    const mhsList = list.filter((p) => p.authorType === "mahasiswa").slice(0, MAX_MAHASISWA)
    acc[cat.slug] = {
      total: dosenList.length + mhsList.length,
      dosen: dosenList.length,
      mahasiswa: mhsList.length,
    }
    return acc
  }, {})
}

export function getDosenProjects(projects = []) {
  return enrichProjects(projects).filter((p) => p.authorType === "dosen")
}

export function getMahasiswaProjects(projects = []) {
  return enrichProjects(projects).filter((p) => p.authorType === "mahasiswa")
}
