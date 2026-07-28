import { useState } from "react"
import { useNavigate } from "react-router-dom"
import UploadThumbnail from "./UploadThumbnail"
import UploadInformation from "./UploadInformation"
import UploadTechnology from "./UploadTechnology"
import UploadGallery from "./UploadGallery"
import UploadDocuments from "./UploadDocuments"
import UploadPreview from "./UploadPreview"
import UploadAction from "./UploadAction"
import api from "../../../../services/api"

const initialFormData = {
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
}

function UploadForm() {
  const [formData, setFormData] = useState(initialFormData)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)

    try {
      const fd = new FormData()
      fd.append("title", formData.title.trim())
      fd.append("description", formData.description.trim())
      fd.append("category_id", formData.category_id)
      fd.append("year", parseInt(formData.year, 10))

      if (formData.thumbnail) {
        fd.append("thumbnail", formData.thumbnail)
      }

      if (formData.images.length > 0) {
        formData.images.forEach((file) => fd.append("images", file))
      }

      if (formData.documents.length > 0) {
        formData.documents.forEach((file) => fd.append("documents", file))
      }

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

      await api.post("/projects", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      navigate("/my-project")
    } catch (err) {
      const msg =
        err.response?.data?.message || "Gagal mengupload project. Coba lagi."
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="relative bg-brand-dark px-4 py-10 sm:py-12 md:px-8 lg:px-12 2xl:px-16 3xl:px-20 4xl:px-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 sm:gap-8 2xl:gap-10 3xl:gap-12 4xl:gap-14">
        <UploadThumbnail
          value={formData.thumbnail}
          onChange={(file) => updateField("thumbnail", file)}
        />

        <UploadInformation formData={formData} updateField={updateField} />

        <UploadTechnology
          value={formData.technologies}
          onChange={(tags) => updateField("technologies", tags)}
        />

        <UploadGallery
          value={formData.images}
          onChange={(files) => updateField("images", files)}
        />

        <UploadDocuments
          value={formData.documents}
          onChange={(files) => updateField("documents", files)}
        />

        <UploadPreview formData={formData} />

        <UploadAction
          formData={formData}
          onSubmit={handleSubmit}
          submitting={submitting}
          apiError={error}
        />
      </div>
    </section>
  )
}

export default UploadForm
