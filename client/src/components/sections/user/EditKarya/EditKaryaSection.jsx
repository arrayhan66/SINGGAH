import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ImagePlus, X, FileText, FileUp, Image, Info, Layers, Eye, Send, Loader, AlertCircle } from "lucide-react"
import GlowBackground from "../../../ui/GlowBackground"
import DustBackground from "../../../ui/DustBackground"
import GlassCard from "../../../ui/GlassCard"
import UploadInformation from "../Upload/UploadInformation"
import UploadTechnology from "../Upload/UploadTechnology"
import UploadPreview from "../Upload/UploadPreview"
import UploadAction from "../Upload/UploadAction"
import api from "../../../../services/api"

function EditKaryaSection() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

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
        const res = await api.get(`/projects/${id}`)
        const project = res.data.data || res.data

        setFormData({
          title: project.title || "",
          description: project.description || "",
          category_id: project.category_id?.toString() || "",
          thumbnail: null,
          images: [],
          technologies: project.technologies
            ? (typeof project.technologies === "string"
                ? JSON.parse(project.technologies)
                : project.technologies)
            : [],
          members: project.members
            ? (typeof project.members === "string"
                ? JSON.parse(project.members)
                : project.members)
            : [],
          links: project.links
            ? (typeof project.links === "string"
                ? JSON.parse(project.links)
                : project.links)
            : [],
          documents: [],
          videoUrl: project.videos
            ? (typeof project.videos === "string"
                ? JSON.parse(project.videos)?.[0]?.video_url || ""
                : project.videos?.[0]?.video_url || "")
            : "",
          year: project.year?.toString() || "",
        })

        setExistingThumbnail(project.thumbnail || "")

        const images = project.images || []
        setExistingImages(Array.isArray(images) ? images : [])

        const docs = project.documents || []
        setExistingDocuments(Array.isArray(docs) ? docs : [])
      } catch (err) {
        setFetchError(err.response?.data?.message || "Gagal memuat data karya.")
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
  }, [id])

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handleThumbnailChange(file) {
    setFormData((prev) => ({ ...prev, thumbnail: file }))
  }

  function handleRemoveExistingThumbnail() {
    setExistingThumbnail("")
    setFormData((prev) => ({ ...prev, thumbnail: null }))
  }

  function handleAddGalleryImages(files) {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }))
  }

  function handleRemoveNewImage(index) {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  function handleRemoveExistingImage(index) {
    setRemovedImages((prev) => [...prev, existingImages[index]])
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  function handleAddDocuments(files) {
    setFormData((prev) => ({ ...prev, documents: [...prev.documents, ...files] }))
  }

  function handleRemoveNewDocument(index) {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }))
  }

  function handleRemoveExistingDocument(index) {
    setRemovedDocuments((prev) => [...prev, existingDocuments[index]])
    setExistingDocuments((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit() {
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

      await api.put(`/projects/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      navigate("/my-karya")
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
      <section className="relative flex min-h-screen items-center justify-center bg-brand-navy">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 animate-spin text-cyan-400" />
          <p className="text-sm text-slate-400">Memuat data karya...</p>
        </div>
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
            onClick={() => navigate("/my-karya")}
            className="cursor-pointer rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Kembali ke My Karya
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="relative bg-brand-dark px-4 py-10 sm:py-12 md:px-8 lg:px-12 2xl:px-16 3xl:px-20 4xl:px-24">
      <GlowBackground />
      <DustBackground />

      <div className="mx-auto flex max-w-5xl flex-col gap-6 sm:gap-8 2xl:gap-10 3xl:gap-12 4xl:gap-14">
        {/* Thumbnail */}
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400/10 border border-cyan-400/30">
              <ImagePlus className="h-3.5 w-3.5 text-cyan-300" />
            </div>
            <span className="text-xs font-medium text-slate-500">Thumbnail</span>
            <div className="h-px flex-1 bg-gradient-to-r from-cyan-400/20 to-transparent" />
          </div>

          <GlassCard className="p-3 min-[280px]:p-5 sm:p-6 2xl:p-8">
            <div className="flex items-start gap-2 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/30">
                <ImagePlus className="h-6 w-6 text-cyan-300" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xs min-[280px]:text-base sm:text-lg font-semibold text-white">
                  Thumbnail Karya
                </h2>
              </div>
              <span className="rounded-full border border-red-400/30 bg-red-400/10 px-1.5 min-[280px]:px-2.5 py-0.5 text-[9px] min-[280px]:text-[11px] font-medium text-red-400">
                Wajib
              </span>
            </div>

            <div className="relative">
              {existingThumbnail && !formData.thumbnail ? (
                <div className="relative w-full">
                  <img
                    src={existingThumbnail}
                    alt="Current thumbnail"
                    className="aspect-video w-full rounded-xl object-cover border border-white/10 shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveExistingThumbnail}
                    className="absolute -right-2 -top-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => document.getElementById("edit-thumbnail-input")?.click()}
                    className="absolute bottom-3 right-3 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-800 shadow-lg backdrop-blur-sm hover:bg-white transition-colors cursor-pointer"
                  >
                    Ganti
                  </button>
                </div>
              ) : formData.thumbnail ? (
                <div className="relative w-full">
                  <img
                    src={URL.createObjectURL(formData.thumbnail)}
                    alt="New thumbnail"
                    className="aspect-video w-full rounded-xl object-cover border border-white/10 shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, thumbnail: null }))
                      if (!existingThumbnail) {
                        document.getElementById("edit-thumbnail-input")?.click()
                      }
                    }}
                    className="absolute -right-2 -top-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => document.getElementById("edit-thumbnail-input")?.click()}
                  className="group flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-white hover:border-cyan-400 hover:bg-cyan-50 transition-all"
                >
                  <ImagePlus className="h-10 w-10 text-cyan-400" />
                  <span className="text-sm font-medium text-slate-600">
                    Klik untuk upload thumbnail
                  </span>
                  <span className="text-[10px] text-slate-400">
                    PNG, JPG, atau WEBP — Maks 5MB
                  </span>
                </button>
              )}
              <input
                id="edit-thumbnail-input"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleThumbnailChange(file)
                }}
                className="hidden"
              />
            </div>
          </GlassCard>
        </div>

        {/* Informasi */}
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400/10 border border-cyan-400/30">
              <Info className="h-3.5 w-3.5 text-cyan-300" />
            </div>
            <span className="text-xs font-medium text-slate-500">Informasi</span>
            <div className="h-px flex-1 bg-gradient-to-r from-cyan-400/20 to-transparent" />
          </div>
          <UploadInformation formData={formData} updateField={updateField} />
        </div>

        {/* Teknologi */}
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400/10 border border-cyan-400/30">
              <Layers className="h-3.5 w-3.5 text-cyan-300" />
            </div>
            <span className="text-xs font-medium text-slate-500">Teknologi</span>
            <div className="h-px flex-1 bg-gradient-to-r from-cyan-400/20 to-transparent" />
          </div>
          <UploadTechnology
            value={formData.technologies}
            onChange={(tags) => updateField("technologies", tags)}
          />
        </div>

        {/* Galeri */}
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400/10 border border-cyan-400/30">
              <Image className="h-3.5 w-3.5 text-cyan-300" />
            </div>
            <span className="text-xs font-medium text-slate-500">Galeri</span>
            <div className="h-px flex-1 bg-gradient-to-r from-cyan-400/20 to-transparent" />
          </div>

          <GlassCard className="p-3 min-[280px]:p-5 sm:p-6 2xl:p-8">
            <div className="flex items-start gap-2 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/30">
                <Image className="h-6 w-6 text-cyan-300" />
              </div>
              <div>
                <h2 className="text-xs min-[280px]:text-base sm:text-lg font-semibold text-white">
                  Galeri Karya
                </h2>
              </div>
              <span className="ml-auto inline-flex items-center rounded-full border border-slate-600 bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                Opsional
              </span>
            </div>

            <div className="grid grid-cols-2 min-[400px]:grid-cols-3 md:grid-cols-4 gap-3">
              {existingImages.map((img, index) => (
                <div key={`existing-${index}`} className="relative aspect-square">
                  <img
                    src={typeof img === "string" ? img : img.image_url || img.url}
                    alt={`Existing ${index + 1}`}
                    className="h-full w-full rounded-xl object-cover border border-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(index)}
                    className="absolute -right-2 -top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {formData.images.map((file, index) => (
                <div key={`new-${index}`} className="relative aspect-square">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`New ${index + 1}`}
                    className="h-full w-full rounded-xl object-cover border border-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveNewImage(index)}
                    className="absolute -right-2 -top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => document.getElementById("edit-gallery-input")?.click()}
                className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-200 bg-white text-slate-600 transition-colors hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-600"
              >
                <ImagePlus className="h-5 w-5 text-cyan-400" />
                <span className="text-xs">Tambah</span>
              </button>
            </div>

            <input
              id="edit-gallery-input"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || [])
                if (files.length > 0) handleAddGalleryImages(files)
                e.target.value = ""
              }}
              className="hidden"
            />
          </GlassCard>
        </div>

        {/* Dokumen */}
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400/10 border border-cyan-400/30">
              <FileText className="h-3.5 w-3.5 text-cyan-300" />
            </div>
            <span className="text-xs font-medium text-slate-500">Dokumen</span>
            <div className="h-px flex-1 bg-gradient-to-r from-cyan-400/20 to-transparent" />
          </div>

          <GlassCard className="p-3 min-[280px]:p-5 sm:p-6 2xl:p-8">
            <div className="flex items-start gap-2 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/30">
                <FileText className="h-6 w-6 text-cyan-300" />
              </div>
              <div>
                <h2 className="text-xs min-[280px]:text-base sm:text-lg font-semibold text-white">
                  Dokumen Pendukung
                </h2>
              </div>
              <span className="ml-auto inline-flex items-center rounded-full border border-slate-600 bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                Opsional
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {existingDocuments.map((doc, index) => (
                <div
                  key={`existing-doc-${index}`}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5"
                >
                  <FileText className="h-[18px] w-[18px] shrink-0 text-cyan-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-white">
                      {typeof doc === "string" ? doc.split("/").pop() : doc.name || doc.filename || `Dokumen ${index + 1}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingDocument(index)}
                    className="flex h-7 w-7 cursor-pointer shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {formData.documents.map((file, index) => (
                <div
                  key={`new-doc-${index}`}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5"
                >
                  <FileText className="h-[18px] w-[18px] shrink-0 text-cyan-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-white">{file.name}</p>
                    <p className="text-xs text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveNewDocument(index)}
                    className="flex h-7 w-7 cursor-pointer shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => document.getElementById("edit-document-input")?.click()}
              className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-white py-8 text-sm text-slate-600 transition-colors hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-600"
            >
              <FileUp className="h-5 w-5 text-cyan-400" />
              Klik untuk tambah dokumen
            </button>

            <input
              id="edit-document-input"
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || [])
                if (files.length > 0) handleAddDocuments(files)
                e.target.value = ""
              }}
              className="hidden"
            />
          </GlassCard>
        </div>

        {/* Preview */}
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400/10 border border-cyan-400/30">
              <Eye className="h-3.5 w-3.5 text-cyan-300" />
            </div>
            <span className="text-xs font-medium text-slate-500">Preview</span>
            <div className="h-px flex-1 bg-gradient-to-r from-cyan-400/20 to-transparent" />
          </div>
          <UploadPreview formData={formData} />
        </div>

        {/* Submit */}
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400/10 border border-cyan-400/30">
              <Send className="h-3.5 w-3.5 text-cyan-300" />
            </div>
            <span className="text-xs font-medium text-slate-500">Simpan</span>
            <div className="h-px flex-1 bg-gradient-to-r from-cyan-400/20 to-transparent" />
          </div>
          <UploadAction
            formData={formData}
            onSubmit={handleSubmit}
            submitting={submitting}
            apiError={submitError}
            isEdit={true}
          />
        </div>
      </div>
    </section>
  )
}

export default EditKaryaSection
