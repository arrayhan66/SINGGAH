import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { useBerita } from "../../../../context/BeritaContext"
import AdminHeroBackground from "../../../ui/AdminHeroBackground"
import AdminBeritaEditorMain from "../../../../components/sections/admin/ManageNews/AdminBeritaEditorMain"
import AdminBeritaEditorSidebar from "../../../../components/sections/admin/ManageNews/AdminBeritaEditorSidebar"
import Toast from "../../../ui/Toast"
import { AdminNewsFormSkeleton } from "../../../ui/PageSkeletons"

const emptyForm = {
  title: "",
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

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
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

function previewToFormData(data) {
  return {
    title: data.title || "",
    winner: data.winner || "",
    date: data.date || "",
    source: data.source || "",
    desc: data.desc || "",
    image: data.image || data.headline_image || null,
    tags: data.tags || [],
    contentText: data.contentHTML || contentArrayToHTML(data.content),
    gallery: (data.gallery || []).map((g) => ({
      file: null,
      url: g.url || "",
      caption: g.caption || "",
    })),
    slug: data.slug || "",
    status: data.status || "draft",
  }
}

function AdminBeritaForm() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { getBeritaBySlug, addBerita, updateBerita, setTempPreviewData, tempPreviewData, loading, fetchBeritaDetail } = useBerita()

  const isEditMode = Boolean(slug)
  const [formData, setFormData] = useState(emptyForm)
  const [notification, setNotification] = useState(null)
  const [saving, setSaving] = useState(false)
  const [pendingRedirect, setPendingRedirect] = useState(false)

  // Saat admin kembali dari halaman pratinjau, data form dikirim lewat state
  // navigasi. Ini membuat isi editor tidak hilang walau tempPreviewData di
  // context sudah dibersihkan (mis. oleh efek form saat berpindah halaman).
  const restoredFromPreview = location.state?.previewData || null

  useEffect(() => {
    const restored = restoredFromPreview || tempPreviewData

    if (restored) {
      setFormData(previewToFormData(restored))
      if (tempPreviewData) setTempPreviewData(null)
      return undefined
    }

    if (isEditMode) {
      if (loading) return undefined

      // Daftar berita tidak membawa contentHTML, jadi form edit harus
      // mengambil beritanya sendiri. Tanpa ini, admin mengedit artikel yang
      // isinya hilang lalu menimpanya dengan hasil contentArrayToHTML, yang
      // membuang format dan gambar.
      let cancelled = false

      fetchBeritaDetail(slug)
        .then((existing) => {
          if (cancelled || !existing) return
          setFormData(previewToFormData(existing))
        })
        .catch((err) => {
          console.error("Failed to load berita for editing:", err)
        })

      return () => {
        cancelled = true
      }
    }

    setFormData(emptyForm)
    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, loading, isEditMode, tempPreviewData, restoredFromPreview, fetchBeritaDetail])

  function showNotification(message, type) {
    setNotification({ message, type })
  }

  function handleNotificationDone() {
    setNotification(null)
    if (pendingRedirect) {
      setPendingRedirect(false)
      navigate("/admin/berita")
    }
  }

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  async function handlePublish() {
    if (saving) return
    if (!formData.title.trim()) {
      showNotification("Judul berita wajib diisi", "error")
      return
    }
    if (!formData.contentText || stripHtml(formData.contentText).trim().length === 0) {
      showNotification("Konten berita tidak boleh kosong", "error")
      return
    }

    setSaving(true)

    const contentParagraphs = extractParagraphsFromHTML(formData.contentText)

    const gallery = (formData.gallery || [])
      .filter((g) => g.url)
      .map((g) => ({
        url: g.url,
        caption: g.caption || "",
      }))

    const payload = {
      title: formData.title,
      winner: formData.winner,
      date: formData.date,
      source: formData.source,
      desc: formData.desc,
      headline_image: formData.image,
      tags: formData.tags,
      content: contentParagraphs.length > 0 ? contentParagraphs : [stripHtml(formData.contentText)],
      contentHTML: formData.contentText,
      gallery,
      slug: formData.slug ? slugify(formData.slug) : slugify(formData.title),
      status: formData.status || "draft",
    }

    try {
      if (isEditMode) {
        const existing = getBeritaBySlug(slug)
        if (existing) await updateBerita(existing.id, payload)
      } else {
        await addBerita(payload)
      }

      const status = formData.status || "draft"
      let successMsg
      if (isEditMode) {
        successMsg = "Berita berhasil diperbarui"
      } else if (status === "draft") {
        successMsg = "Berita berhasil disimpan sebagai draft"
      } else {
        successMsg = "Berita berhasil dipublikasikan"
      }
      showNotification(successMsg, "success")
      setPendingRedirect(true)
    } catch (err) {
      const message =
        err.response?.data?.message || "Gagal menyimpan berita"
      showNotification(message, "error")
    } finally {
      setSaving(false)
    }
  }

  function handlePreview() {
    const data = {
      ...formData,
      content: extractParagraphsFromHTML(formData.contentText),
      contentHTML: formData.contentText,
      gallery: (formData.gallery || []).filter((g) => g.url),
    }
    setTempPreviewData(data)
    // Sertakan juga lewat state navigasi agar halaman pratinjau tetap dapat
    // data meskipun context dibersihkan oleh efek form.
    const options = { state: { previewData: data } }
    if (isEditMode) {
      navigate(`/admin/berita/preview/temp?from=edit&slug=${slug}`, options)
    } else {
      navigate("/admin/berita/preview/temp", options)
    }
  }

  function stripHtml(html) {
    if (!html) return ""
    const doc = new DOMParser().parseFromString(html, "text/html")
    return doc.body.textContent || ""
  }

  return (
    <AdminHeroBackground fullWidth className="admin-berita-form-root">
      <div className="px-6 py-8 md:px-10 md:py-10">
        {notification && (
          <Toast
            message={notification.message}
            type={notification.type}
            onDone={handleNotificationDone}
          />
        )}

        {isEditMode && loading && !saving ? (
          <AdminNewsFormSkeleton />
        ) : (
          <>
        <button
          onClick={() => navigate("/admin/berita")}
          className="user-form-back group inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-xl transition-all duration-200 hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-cyan-300"
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
            isEditMode={isEditMode}
          />
          <AdminBeritaEditorSidebar
            formData={formData}
            updateField={updateField}
            onPublish={handlePublish}
            onPreview={handlePreview}
            isEditMode={isEditMode}
            saving={saving}
          />
        </div>
          </>
        )}
      </div>
    </AdminHeroBackground>
  )
}

export default AdminBeritaForm
