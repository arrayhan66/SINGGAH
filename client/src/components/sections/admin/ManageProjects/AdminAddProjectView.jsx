import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { UploadCloud } from "lucide-react"
import AdminLayout from "../../../../layouts/AdminLayout"
import GlowBackground from "../../../ui/GlowBackground"
import UploadThumbnail from "../../user/Upload/UploadThumbnail"
import UploadInformation from "../../user/Upload/UploadInformation"
import UploadTechnology from "../../user/Upload/UploadTechnology"
import UploadGallery from "../../user/Upload/UploadGallery"
import UploadDocuments from "../../user/Upload/UploadDocuments"
import UploadPreview from "../../user/Upload/UploadPreview"
import UploadAction from "../../user/Upload/UploadAction"
import { useProjects } from "../../../../context/ProjectContext"
import api from "../../../../services/api"

const steps = [
  { icon: UploadCloud, label: "Thumbnail" },
  { icon: UploadCloud, label: "Informasi" },
  { icon: UploadCloud, label: "Teknologi" },
  { icon: UploadCloud, label: "Galeri" },
  { icon: UploadCloud, label: "Dokumen" },
  { icon: UploadCloud, label: "Preview" },
  { icon: UploadCloud, label: "Submit" },
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
  categoryName: "",
  userName: "",
  userNim: "",
  thumbnail: null,
  images: [],
  technologies: [],
  members: [],
  links: [],
  documents: [],
  videoUrl: "",
  year: "",
}

function AdminAddProjectView() {
  const [formData, setFormData] = useState(initialFormData)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])
  const navigate = useNavigate()
  const { addProject } = useProjects()
  const categoriesFetched = useRef(false)

  useEffect(() => {
    if (categoriesFetched.current) return
    categoriesFetched.current = true
    api
      .get("/categories")
      .then((res) => setCategories(res.data.data || res.data))
      .catch(() => setCategories([]))
  }, [])

  function updateField(field, value) {
    setFormData((prev) => {
      const next = { ...prev, [field]: value }
      if (field === "category_id") {
        const cat = categories.find((c) => String(c.id) === String(value))
        next.categoryName = cat ? cat.name : ""
      }
      return next
    })
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        categoryName: formData.categoryName || "IoT",
        userName: formData.userName.trim() || "Mahasiswa SINGGAH",
        userNim: formData.userNim.trim() || "TE2025000",
        year: Number(formData.year) || new Date().getFullYear(),
        technologies: formData.technologies,
        thumbnail: formData.thumbnail
          ? URL.createObjectURL(formData.thumbnail)
          : "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400",
        images: formData.images.length > 0
          ? formData.images.map((f) => ({ image_url: URL.createObjectURL(f) }))
          : [{ image_url: formData.thumbnail ? URL.createObjectURL(formData.thumbnail) : "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800" }],
        status: "approved",
      }

      addProject(payload)
      navigate("/admin/projects")
    } catch (err) {
      const msg =
        err.response?.data?.message || "Gagal menambahkan project. Coba lagi."
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminLayout>
      <section className="relative overflow-hidden bg-brand-dark px-4 pt-[calc(var(--navbar-h)+24px)] pb-10 sm:px-6 sm:pt-[calc(var(--navbar-h)+32px)] sm:pb-16 md:px-8 lg:px-12 2xl:px-16 2xl:pb-20 3xl:px-20 3xl:pb-24 4xl:px-24 4xl:pb-28">
        <GlowBackground />
        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 border border-cyan-400/30 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 3xl:h-28 3xl:w-28 4xl:h-32 4xl:w-32">
            <UploadCloud className="h-8 w-8 text-cyan-300 sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-12 lg:w-12 3xl:h-14 3xl:w-14 4xl:h-16 4xl:w-16" />
          </div>

          <h1 className="mt-2 sm:mt-3 md:mt-4 lg:mt-5 2xl:mt-6 3xl:mt-7 4xl:mt-8 text-2xl min-[280px]:text-4xl sm:text-4xl lg:text-5xl 2xl:text-6xl 3xl:text-7xl 4xl:text-8xl font-black text-white">
            Tambah <span className="text-cyan-300">Project</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8 2xl:mt-8 2xl:max-w-4xl 2xl:text-xl 2xl:leading-9 3xl:mt-10 3xl:max-w-5xl 3xl:text-2xl 3xl:leading-10 4xl:mt-12 4xl:max-w-6xl 4xl:text-3xl 4xl:leading-11">
            Tambahkan project mahasiswa ke SINGGAH. Project akan langsung
            dipublikasikan ke Hall.
          </p>
        </div>
      </section>

      <section className="relative bg-brand-dark px-4 py-10 sm:py-12 md:px-8 lg:px-12 2xl:px-16 3xl:px-20 4xl:px-24">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 sm:gap-8 2xl:gap-10 3xl:gap-12 4xl:gap-14">
          <StepDivider step={steps[0]} currentIndex={0} />
          <UploadThumbnail
            value={formData.thumbnail}
            onChange={(file) => updateField("thumbnail", file)}
          />

          <StepDivider step={steps[1]} currentIndex={1} />
          <UploadInformation
            formData={formData}
            updateField={updateField}
            showUserFields
          />

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
            submitLabel="Publikasikan"
            cancelPath="/admin/projects"
          />
        </div>
      </section>
    </AdminLayout>
  )
}

export default AdminAddProjectView
