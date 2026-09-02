import { useState } from "react"
import { Image, Info, Layers, ImagePlus, FileText, Eye, Send } from "lucide-react"
import UploadThumbnail from "./UploadThumbnail"
import UploadInformation from "./UploadInformation"
import UploadTechnology from "./UploadTechnology"
import UploadGallery from "./UploadGallery"
import UploadDocuments from "./UploadDocuments"
import UploadPreview from "./UploadPreview"
import UploadAction from "./UploadAction"
import { useProjects } from "../../../../context/ProjectContext"
import GlowBackground from "../../../ui/GlowBackground"
import DustBackground from "../../../ui/DustBackground"
import SubmitSuccessModal from "../../../ui/SubmitSuccessModal"

const steps = [
  { icon: Image, label: "Thumbnail" },
  { icon: Info, label: "Informasi" },
  { icon: Layers, label: "Teknologi" },
  { icon: ImagePlus, label: "Galeri" },
  { icon: FileText, label: "Dokumen" },
  { icon: Eye, label: "Preview" },
  { icon: Send, label: "Submit" },
]

function StepDivider({ step, currentIndex }) {
  const Icon = step.icon
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="flex shrink-0 h-[clamp(1.5rem,0.875rem+1.25vw,3rem)] w-[clamp(1.5rem,0.875rem+1.25vw,3rem)] items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/10 border border-cyan-400/30 shadow-lg shadow-cyan-400/10">
          <Icon className="h-[clamp(0.75rem,0.4375rem+0.625vw,1.5rem)] w-[clamp(0.75rem,0.4375rem+0.625vw,1.5rem)] text-cyan-300" />
        </div>
        <span className="text-[clamp(0.65rem,0.5rem+0.3vw,1rem)] font-medium text-slate-400 4xl:text-lg">
          {step.label}
        </span>
      </div>
      {currentIndex < steps.length - 1 && (
        <div className="h-px flex-1 bg-gradient-to-r from-cyan-400/40 via-cyan-400/20 to-transparent" />
      )}
    </div>
  )
}

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
  const [successOpen, setSuccessOpen] = useState(false)
  const { addProject } = useProjects()

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

      await addProject(fd)

      setSuccessOpen(true)
    } catch (err) {
      const msg =
        err.response?.data?.message || "Gagal mengupload karya. Coba lagi."
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="upload-page relative overflow-hidden bg-brand-dark px-4 py-10 sm:py-12 md:px-8 lg:px-12 2xl:px-16 3xl:px-20 4xl:px-24">
      <GlowBackground />
      <DustBackground />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-6 sm:gap-8 2xl:gap-10 3xl:gap-12 4xl:gap-14">
        <StepDivider step={steps[0]} currentIndex={0} />
        <UploadThumbnail
          value={formData.thumbnail}
          onChange={(file) => updateField("thumbnail", file)}
        />

        <StepDivider step={steps[1]} currentIndex={1} />
        <UploadInformation formData={formData} updateField={updateField} />

        <StepDivider step={steps[2]} currentIndex={2} />
        <UploadTechnology
          value={formData.technologies}
          onChange={(tags) => updateField("technologies", tags)}
        />

        <StepDivider step={steps[3]} currentIndex={3} />
        <UploadGallery
          value={formData.images}
          onChange={(files) => updateField("images", files)}
        />

        <StepDivider step={steps[4]} currentIndex={4} />
        <UploadDocuments
          value={formData.documents}
          onChange={(files) => updateField("documents", files)}
        />

        <StepDivider step={steps[5]} currentIndex={5} />
        <UploadPreview formData={formData} />

        <StepDivider step={steps[6]} currentIndex={6} />
        <UploadAction
          formData={formData}
          onSubmit={handleSubmit}
          submitting={submitting}
          apiError={error}
        />
      </div>

      <SubmitSuccessModal
        isOpen={successOpen}
        karyaTitle={formData.title}
        redirectPath="/my-karya"
        mode="upload"
        onClose={() => setSuccessOpen(false)}
      />
    </section>
  )
}

export default UploadForm
