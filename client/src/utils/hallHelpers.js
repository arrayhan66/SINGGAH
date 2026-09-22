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

// Merges admin-set category colors (from /hall) into the static palette so
// newly-added categories also get their configured accent color in the hall.
export function seedCategoryColors(categories = []) {
  for (const c of categories) {
    if (c && c.slug && c.color) CATEGORY_COLORS[c.slug] = c.color
  }
}

export function classify(project) {
  // Admin bisa menetapkan tipe penulis secara eksplisit (author_tipe) saat
  // menambah karya atas nama mahasiswa/dosen — ini menang bahkan jika akun
  // admin bermacam "umum" atau "mahasiswa".
  const declared = project.author_tipe
  if (declared === "dosen") return "dosen"
  if (declared === "mahasiswa") return "mahasiswa"

  const tipe = project.User?.tipe || project.authorType
  if (tipe === "dosen") return "dosen"
  if (tipe === "mahasiswa") return "mahasiswa"

  const name = String(project.author?.[0] || project.User?.name || "").toLowerCase()
  if (DOSEN_MARKERS.some((m) => name.includes(m))) return "dosen"
  return "mahasiswa"
}

export function enrichProjects(projects = []) {
  return projects.map((project) => ({
    ...project,
    authorType: classify(project),
  }))
}

export function getCategoryStats(projects = [], categories = []) {
  const enriched = enrichProjects(projects)
  return categories.reduce((acc, cat) => {
    const list = enriched.filter((p) => (p.category || p.Category?.slug) === cat.slug)
    const dosenList = list.filter((p) => p.authorType === "dosen")
    const mhsList = list.filter((p) => p.authorType === "mahasiswa")
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
