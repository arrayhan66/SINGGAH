import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, FolderKanban, Check, Sparkles } from "lucide-react"
import AdminLayout from "../../../../layouts/AdminLayout"
import { useProjects } from "../../../../context/ProjectContext"
import AdminHeroBackground from "../../../ui/AdminHeroBackground"

const emptyForm = {
  title: "",
  description: "",
  categoryName: "IoT",
  userName: "",
  userNim: "",
  year: new Date().getFullYear(),
  technologies: "",
  thumbnail: "",
  status: "pending",
}

const categoriesList = ["IoT", "Elektronika", "Energi", "Otomasi", "Robotika", "Multimedia"]

function AdminProjectForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProjectById, addProject, updateProject } = useProjects()

  const isEditMode = Boolean(id)
  const [formData, setFormData] = useState(emptyForm)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    if (isEditMode) {
      const existing = getProjectById(id)
      if (existing) {
        setFormData({
          title: existing.title || "",
          description: existing.description || "",
          categoryName: existing.Category?.name || "IoT",
          userName: existing.User?.name || "",
          userNim: existing.User?.nim || "",
          year: existing.year || new Date().getFullYear(),
          technologies: Array.isArray(existing.technologies) ? existing.technologies.join(", ") : (existing.technologies || ""),
          thumbnail: existing.thumbnail || "",
          status: existing.status || "pending",
        })
      }
    }
  }, [id, getProjectById])

  function showNotification(message, type = "success") {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!formData.title.trim() || !formData.description.trim()) {
      showNotification("Judul dan deskripsi project wajib diisi!", "error")
      return
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      categoryName: formData.categoryName,
      userName: formData.userName || "Mahasiswa SINGGAH",
      userNim: formData.userNim || "TE2025000",
      year: Number(formData.year) || new Date().getFullYear(),
      technologies: formData.technologies,
      thumbnail: formData.thumbnail || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400",
      images: [{ image_url: formData.thumbnail || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800" }],
      status: formData.status,
    }

    if (isEditMode) {
      updateProject(Number(id), payload)
      showNotification("Project berhasil diperbarui!", "success")
    } else {
      addProject(payload)
      showNotification("Project berhasil ditambahkan!", "success")
    }

    setTimeout(() => {
      navigate("/admin/projects")
    }, 1000)
  }

  return (
    <AdminLayout>
      <AdminHeroBackground>
        <div className="px-6 py-8 md:px-10 md:py-10 max-w-4xl mx-auto">
          {notification && (
            <div className={`mb-6 flex items-center gap-3 rounded-xl p-4 text-sm font-medium shadow-lg backdrop-blur-xl transition-all ${
              notification.type === "error"
                ? "bg-red-500/20 border border-red-500/30 text-red-300"
                : "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300"
            }`}>
              <span>{notification.message}</span>
            </div>
          )}

          <button
            onClick={() => navigate("/admin/projects")}
            className="flex cursor-pointer items-center gap-2 text-sm text-slate-300 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft size={16} />
            Kembali ke Kelola Project
          </button>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 border border-cyan-400/30">
              <FolderKanban className="h-6 w-6 text-cyan-300" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">
                {isEditMode ? "Edit Project Mahasiswa" : "Tambah Project Baru"}
              </h1>
              <p className="text-xs md:text-sm text-slate-400">
                {isEditMode ? "Perbarui informasi project yang sudah ada." : "Tambahkan project baru ke dalam sistem katalog SINGGAH."}
              </p>
            </div>
          </div>
        </div>
      </AdminHeroBackground>

      <div className="px-6 md:px-10 max-w-4xl mx-auto pb-8 md:pb-10">
        <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-2xl border border-white/10 bg-slate-900/60 p-6 md:p-8 backdrop-blur-xl shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-300">Judul Project *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Cth: Sistem Monitoring Suhu IoT"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-300">Deskripsi Project *</label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Jelaskan fungsionalitas dan detail project secara singkat..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Kategori</label>
              <select
                name="categoryName"
                value={formData.categoryName}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Tahun Pembuatan</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Nama Pembuat / Mahasiswa</label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                placeholder="Cth: Ahmad Fadillah"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">NIM Pembuat</label>
              <input
                type="text"
                name="userNim"
                value={formData.userNim}
                onChange={handleChange}
                placeholder="Cth: TE2021001"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-300">Teknologi (pisahkan dengan koma)</label>
              <input
                type="text"
                name="technologies"
                value={formData.technologies}
                onChange={handleChange}
                placeholder="Cth: Arduino, ESP32, React, Node.js"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-300">URL Thumbnail Gambar</label>
              <input
                type="url"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Status Review Project</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              >
                <option value="pending" className="bg-slate-900 text-white">Menunggu Review (Pending)</option>
                <option value="approved" className="bg-slate-900 text-white">Disetujui (Approved)</option>
                <option value="rejected" className="bg-slate-900 text-white">Ditolak (Rejected)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={() => navigate("/admin/projects")}
              className="cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-500 hover:bg-[position:100%_0]"
            >
              <Sparkles size={16} />
              {isEditMode ? "Simpan Perubahan" : "Publikasikan Project"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}

export default AdminProjectForm
