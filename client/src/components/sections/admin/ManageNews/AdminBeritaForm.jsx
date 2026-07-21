import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import AdminLayout from "../../../../layouts/AdminLayout"
import { useBerita } from "../../../../context/BeritaContext"
import AdminBeritaEditorMain from "../../../../components/sections/admin/ManageNews/AdminBeritaEditorMain"
import AdminBeritaEditorSidebar from "../../../../components/sections/admin/ManageNews/AdminBeritaEditorSidebar"

const emptyForm = {
  title: "",
  event: "",
  winner: "",
  date: "",
  source: "",
  desc: "",
  image: null,
  tags: [],
  contentText: "",
}

function AdminBeritaForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getBeritaById, addBerita, updateBerita } = useBerita()

  const isEditMode = Boolean(id)
  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    if (isEditMode) {
      const existing = getBeritaById(id)
      if (existing) {
        setFormData({
          title: existing.title || "",
          event: existing.event || "",
          winner: existing.winner || "",
          date: existing.date || "",
          source: existing.source || "",
          desc: existing.desc || "",
          image: existing.image || null,
          tags: existing.tags || [],
          contentText:
            typeof existing.content === "string"
              ? existing.content
              : (existing.content || []).join("\n\n"),
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handlePublish() {
    if (!formData.title.trim() || !formData.event.trim()) {
      alert("Judul dan nama event wajib diisi")
      return
    }

    const contentParagraphs = formData.contentText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0)

    const payload = {
      title: formData.title,
      event: formData.event,
      winner: formData.winner,
      date: formData.date,
      source: formData.source,
      desc: formData.desc,
      image: formData.image,
      tags: formData.tags,
      content: contentParagraphs,
    }

    if (isEditMode) {
      updateBerita(Number(id), payload)
    } else {
      addBerita(payload)
    }

    navigate("/admin/berita")
  }

  return (
    <AdminLayout>
      <div className="px-6 py-8 md:px-10 md:py-10">
        <button
          onClick={() => navigate("/admin/berita")}
          className="flex items-center gap-2 text-sm text-slate-300 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali ke Kelola Berita
        </button>

        <h1 className="mt-4 text-xl md:text-2xl font-bold text-white">
          {isEditMode ? "Edit Berita" : "Tambah Berita Baru"}
        </h1>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <AdminBeritaEditorMain
            formData={formData}
            updateField={updateField}
          />
          <AdminBeritaEditorSidebar
            formData={formData}
            updateField={updateField}
            onPublish={handlePublish}
            isEditMode={isEditMode}
          />
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminBeritaForm
