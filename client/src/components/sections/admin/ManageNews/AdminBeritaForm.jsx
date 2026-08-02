import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react"
import { useBerita } from "../../../../context/BeritaContext"
import AdminHeroBackground from "../../../ui/AdminHeroBackground"
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
  gallery: [],
  slug: "",
  status: "draft",
}

function extractParagraphsFromHTML(html) {
  if (!html) return []
  const doc = new DOMParser().parseFromString(html, "text/html")
  const paragraphs = doc.querySelectorAll("p")
  if (paragraphs.length > 0) {
    return Array.from(paragraphs)
      .map((p) => p.textContent.trim())
      .filter((p) => p.length > 0)
  }
  const text = doc.body.textContent || ""
  return text
    .split(/\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

function contentArrayToHTML(content) {
  if (!content) return ""
  if (Array.isArray(content)) {
    return content.map((p) => `<p>${p}</p>`).join("")
  }
  return `<p>${content}</p>`
}

function AdminBeritaForm() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { getBeritaBySlug, addBerita, updateBerita, setTempPreviewData } = useBerita()

  const isEditMode = Boolean(slug)
  const [formData, setFormData] = useState(emptyForm)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    if (isEditMode) {
      const existing = getBeritaBySlug(slug)
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
            existing.contentHTML || contentArrayToHTML(existing.content),
          gallery: (existing.gallery || []).map((g) => ({
            file: null,
            url: g.url || "",
            caption: g.caption || "",
          })),
          slug: existing.slug || "",
          status: existing.status || "draft",
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  function showNotification(message, type) {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handlePublish() {
    if (!formData.title.trim() || !formData.event.trim()) {
      showNotification("Judul dan nama event wajib diisi", "error")
      return
    }
    if (!formData.contentText || stripHtml(formData.contentText).trim().length === 0) {
      showNotification("Konten berita tidak boleh kosong", "error")
      return
    }

    const contentParagraphs = extractParagraphsFromHTML(formData.contentText)

    const gallery = (formData.gallery || [])
      .filter((g) => g.url)
      .map((g) => ({
        url: g.url,
        caption: g.caption || "",
      }))

    const payload = {
      title: formData.title,
      event: formData.event,
      winner: formData.winner,
      date: formData.date,
      source: formData.source,
      desc: formData.desc,
      image: formData.image,
      tags: formData.tags,
      content: contentParagraphs.length > 0 ? contentParagraphs : [stripHtml(formData.contentText)],
      contentHTML: formData.contentText,
      gallery,
      slug: formData.slug,
      status: formData.status || "draft",
    }

    if (isEditMode) {
      const existing = getBeritaBySlug(slug)
      if (existing) updateBerita(existing.id, payload)
    } else {
      addBerita(payload)
    }

    showNotification(
      isEditMode ? "Berita berhasil diperbarui" : "Berita berhasil dipublikasikan",
      "success",
    )

    setTimeout(() => navigate("/berita"), 1000)
  }

  function handlePreview() {
    const data = {
      ...formData,
      content: extractParagraphsFromHTML(formData.contentText),
      contentHTML: formData.contentText,
      gallery: (formData.gallery || []).filter((g) => g.url),
    }
    setTempPreviewData(data)
    navigate(`/berita/preview/temp`)
  }

  function stripHtml(html) {
    if (!html) return ""
    const doc = new DOMParser().parseFromString(html, "text/html")
    return doc.body.textContent || ""
  }

  return (
    <AdminHeroBackground fullWidth>
      <div className="px-6 py-8 md:px-10 md:py-10">
        {notification && (
          <div
            className={`fixed top-6 right-6 z-50 flex max-w-[calc(100vw-3rem)] items-center gap-3 rounded-xl border px-5 py-3.5 text-sm font-semibold shadow-2xl backdrop-blur-md transition-all ${
              notification.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-300"
                : "border-red-500/30 bg-red-500/20 text-red-300"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle size={18} />
            ) : (
              <XCircle size={18} />
            )}
            {notification.message}
          </div>
        )}

        <button
          onClick={() => navigate("/berita")}
          className="group inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-xl transition-all duration-200 hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-cyan-300"
        >
          <ArrowLeft
            size={14}
            className="transition-transform duration-200 group-hover:-translate-x-0.5"
          />
          Kembali ke Kelola Berita
        </button>

        <h1 className="mt-4 text-[clamp(1.125rem,1rem+0.75vw,1.25rem)] md:text-2xl font-bold text-white">
          {isEditMode ? "Edit Berita" : "Tambah Berita Baru"}
        </h1>

        <p className="mt-1 text-[clamp(0.8125rem,0.75rem+0.5vw,0.875rem)] text-slate-400">
          {isEditMode
            ? "Perbarui judul, konten, dan pengaturan berita."
            : "Buat berita baru untuk dipublikasikan di halaman Berita & Kegiatan."}
        </p>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <AdminBeritaEditorMain
            formData={formData}
            updateField={updateField}
          />
          <AdminBeritaEditorSidebar
            formData={formData}
            updateField={updateField}
            onPublish={handlePublish}
            onPreview={handlePreview}
            isEditMode={isEditMode}
          />
        </div>
      </div>
    </AdminHeroBackground>
  )
}

export default AdminBeritaForm
