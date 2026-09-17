import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AlertCircle, Info } from "lucide-react"
import GlowBackground from "../../../ui/GlowBackground"
import DustBackground from "../../../ui/DustBackground"
import UploadThumbnail from "../Upload/UploadThumbnail"
import UploadInformation from "../Upload/UploadInformation"
import UploadTechnology from "../Upload/UploadTechnology"
import UploadGallery from "../Upload/UploadGallery"
import UploadDocuments from "../Upload/UploadDocuments"
import UploadPreview from "../Upload/UploadPreview"
import UploadAction from "../Upload/UploadAction"
import api from "../../../../services/api"
import { useProjects } from "../../../../context/ProjectContext"
import { useAuth } from "../../../../context/AuthContext"
import SubmitSuccessModal from "../../../ui/SubmitSuccessModal"
import PopupToast from "../../../ui/PopupToast"
import { EditKaryaFormSkeleton } from "../../../ui/PageSkeletons"

function normalizeList(list) {
  return (Array.isArray(list) ? list : [])
    .map((v) => (typeof v === "string" ? v.trim() : JSON.stringify(v)))
    .filter(Boolean)
    .sort()
    .join("|")
}

// Sebelum submit (yang memicu verifikasi ke admin bila mahasiswa), pastikan
// benar-benar ada yang berubah. Kalau tidak ada perubahan sama sekali, submit
// dibatalkan dan muncul popup "Tidak ada perubahan".
function hasNoChanges(formData, existing, original) {
  const norm = (v) => String(v ?? "").trim()

  if (norm(formData.title) !== norm(original.title)) return false
  if (norm(formData.description) !== norm(original.description)) return false
  if (norm(formData.category_id) !== norm(original.category_id)) return false
  if (norm(formData.year) !== norm(original.year)) return false
  if (norm(formData.videoUrl) !== norm(original.videoUrl)) return false
  if (normalizeList(formData.technologies) !== normalizeList(original.technologies)) return false
  if (normalizeList(formData.members) !== normalizeList(original.members)) return false
  if (normalizeList(formData.links) !== normalizeList(original.links)) return false

  // Thumbnail: file baru ditambah, atau thumbnail lama dihapus/diganti.
  if (formData.thumbnail) return false
  if (existing.existingThumbnail !== original.thumbnail) return false

  // Galeri & dokumen: ada file baru, ada yang dihapus, atau urutan lama berubah.
  if (formData.images.length > 0) return false
  if (existing.removedImages.length > 0) return false
  if (normalizeList(existing.existingImages) !== normalizeList(original.images)) return false
  if (formData.documents.length > 0) return false
  if (existing.removedDocuments.length > 0) return false
  if (normalizeList(existing.existingDocuments) !== normalizeList(original.documents)) return false

  return true
}

function EditKaryaSection({ redirectPath = "/my-karya" }) {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { updateProject } = useProjects()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [successOpen, setSuccessOpen] = useState(false)
  const [noChangeOpen, setNoChangeOpen] = useState(false)
  const originalRef = useRef(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    thumbnail: null,
    images: [],
    technologies: [],
    members: [],
    links: [],
    documents: [],
    videoUrl: "",
    year: "",
  })

  const [existingThumbnail, setExistingThumbnail] = useState("")
  const [existingImages, setExistingImages] = useState([])
  const [removedImages, setRemovedImages] = useState([])
  const [existingDocuments, setExistingDocuments] = useState([])
  const [removedDocuments, setRemovedDocuments] = useState([])

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await api.get(`/projects/${slug}`)
        const project = res.data.data || res.data

        const technologies = project.technologies
          ? (typeof project.technologies === "string"
              ? JSON.parse(project.technologies)
              : project.technologies
            )
              .map((t) => (typeof t === "string" ? t : t?.name || ""))
              .filter(Boolean)
          : []
        const members = project.members
          ? (typeof project.members === "string"
              ? JSON.parse(project.members)
              : project.members)
          : []
        const links = project.links
          ? (typeof project.links === "string"
              ? JSON.parse(project.links)
              : project.links)
          : []
        const videoUrl = project.videos
          ? (typeof project.videos === "string"
              ? JSON.parse(project.videos)?.[0]?.video_url || ""
              : project.videos?.[0]?.video_url || "")
          : ""

        setFormData({
          title: project.title || "",
          description: project.description || "",
          category_id: project.category_id?.toString() || "",
          thumbnail: null,
          images: [],
          technologies,
          members,
          links,
          documents: [],
          videoUrl,
          year: project.year?.toString() || "",
        })

        const images = Array.isArray(project.images) ? project.images : []
        const docs = Array.isArray(project.documents) ? project.documents : []

        setExistingThumbnail(project.thumbnail || "")
        setExistingImages(images)
        setExistingDocuments(docs)

        originalRef.current = {
          title: project.title || "",
          description: project.description || "",
          category_id: project.category_id?.toString() || "",
          year: project.year?.toString() || "",
          videoUrl,
          technologies,
          members,
          links,
          thumbnail: project.thumbnail || "",
          images,
          documents: docs,
        }
      } catch (err) {
        setFetchError(err.response?.data?.message || "Gagal memuat data karya.")
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
  }, [slug])

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handleRemoveExistingImage(index) {
    setRemovedImages((prev) => [...prev, existingImages[index]])
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  function handleRemoveExistingDocument(index) {
    setRemovedDocuments((prev) => [...prev, existingDocuments[index]])
    setExistingDocuments((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit() {
    const original = originalRef.current

    if (original && hasNoChanges(formData, {
      existingThumbnail,
      existingImages,
      removedImages,
      existingDocuments,
      removedDocuments,
    }, original)) {
      setNoChangeOpen(true)
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      const fd = new FormData()
      fd.append("title", formData.title.trim())
      fd.append("description", formData.description.trim())
      fd.append("category_id", formData.category_id)
      fd.append("year", parseInt(formData.year, 10))

      if (formData.thumbnail) {
        fd.append("thumbnail", formData.thumbnail)
      }

      formData.images.forEach((file) => fd.append("images", file))
      formData.documents.forEach((file) => fd.append("documents", file))

      if (formData.technologies.length > 0) {
        fd.append("technologies", JSON.stringify(formData.technologies))
      }

      if (formData.members.length > 0) {
        fd.append("members", JSON.stringify(formData.members))
      }

      if (formData.links.length > 0) {
        fd.append("links", JSON.stringify(formData.links))
      }

      if (formData.videoUrl.trim()) {
        fd.append("videos", JSON.stringify([{ video_url: formData.videoUrl.trim() }]))
      }

      if (removedImages.length > 0) {
        fd.append("removedImages", JSON.stringify(removedImages))
      }

      if (removedDocuments.length > 0) {
        fd.append("removedDocuments", JSON.stringify(removedDocuments))
      }

      await updateProject(slug, fd)

      setSuccessOpen(true)
    } catch (err) {
      const msg =
        err.response?.data?.message || "Gagal menyimpan perubahan. Coba lagi."
      setSubmitError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <section className="relative min-h-screen overflow-hidden bg-brand-dark px-4 py-10 sm:py-12 md:px-8 lg:px-12 2xl:px-16 3xl:px-20 4xl:px-24">
        <GlowBackground />
        <DustBackground />
        <EditKaryaFormSkeleton />
      </section>
    )
  }

  if (fetchError) {
    return (
      <section className="relative flex min-h-screen items-center justify-center bg-brand-navy">
        <div className="flex flex-col items-center gap-4 px-4 text-center">
          <AlertCircle className="h-10 w-10 text-red-400" />
          <p className="text-sm text-slate-300">{fetchError}</p>
          <button
            onClick={() => navigate(redirectPath)}
            className="cursor-pointer rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-white"
          >
            {redirectPath === "/my-karya" ? "Kembali ke My Karya" : "Kembali ke Kelola Karya"}
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden bg-brand-dark px-4 py-10 sm:py-12 md:px-8 lg:px-12 2xl:px-16 3xl:px-20 4xl:px-24">
      <GlowBackground />
      <DustBackground />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-6 sm:gap-8 2xl:gap-10 3xl:gap-12 4xl:gap-14">
        {/* Thumbnail */}
        <UploadThumbnail
          value={formData.thumbnail}
          onChange={(file) => updateField("thumbnail", file)}
          existingValue={existingThumbnail}
          onRemoveExisting={() => {
            setExistingThumbnail("")
            updateField("thumbnail", null)
          }}
        />

        {/* Informasi */}
        <UploadInformation formData={formData} updateField={updateField} />

        {/* Teknologi */}
        <UploadTechnology
          value={formData.technologies}
          onChange={(tags) => updateField("technologies", tags)}
        />

        {/* Galeri */}
        <UploadGallery
          value={formData.images}
          onChange={(files) => updateField("images", files)}
          existingItems={existingImages}
          onRemoveExisting={handleRemoveExistingImage}
        />

        {/* Dokumen */}
        <UploadDocuments
          value={formData.documents}
          onChange={(files) => updateField("documents", files)}
          existingItems={existingDocuments}
          onRemoveExisting={handleRemoveExistingDocument}
        />

        {/* Preview */}
        <UploadPreview formData={formData} existingThumbnail={existingThumbnail} />

        {/* Submit */}
        <UploadAction
          formData={formData}
          onSubmit={handleSubmit}
          submitting={submitting}
          apiError={submitError}
          isEdit={true}
        />
      </div>

      <SubmitSuccessModal
        isOpen={successOpen}
        karyaTitle={formData.title}
        redirectPath={redirectPath}
        mode="edit"
        role={user?.role || "user"}
        tipe={user?.tipe || "umum"}
        onClose={() => setSuccessOpen(false)}
      />

      <PopupToast
        show={noChangeOpen}
        position="center"
        autoDismiss={false}
        onClose={() => setNoChangeOpen(false)}
      >
        <div className="px-4 py-3.5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10">
              <Info className="h-4.5 w-4.5 text-cyan-300" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="pt-1 text-sm font-semibold text-white">
                Tidak Ada Perubahan
              </h3>
              <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">
                Semua isian masih sama dengan data sebelumnya, jadi tidak ada
                yang disimpan. Tidak ada pengajuan verifikasi yang dikirim ke
                admin karena tidak ada yang berubah.
              </p>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => setNoChangeOpen(false)}
              className="cursor-pointer rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/25"
            >
              Tutup
            </button>
          </div>
        </div>
      </PopupToast>
    </section>
  )
}

export default EditKaryaSection
