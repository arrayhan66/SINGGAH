const categoryService = require("./categoryService")
const projectService = require("./projectService")

// Data lengkap untuk hall 3D: daftar kategori aktif (urutan tampil di hall)
// + seluruh project published dengan relasi yang dipakai komponen hall.
exports.getHallOverview = async (userId = null) => {
  const [categories, projects] = await Promise.all([
    categoryService.getActiveCategories(),
    projectService.getHallProjects(userId),
  ])

  return { categories, projects }
}
