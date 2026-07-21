import { useState } from "react"
import UploadThumbnail from "./UploadThumbnail"
import UploadInformation from "./UploadInformation"
import UploadTechnology from "./UploadTechnology"
import UploadGallery from "./UploadGallery"
import UploadPreview from "./UploadPreview"
import UploadAction from "./UploadAction"

const initialFormData = {
  title: "",
  shortDescription: "",
  fullDescription: "",
  category: "",
  thumbnail: null, // File object
  gallery: [], // array of File objects
  technologies: [], // array of string
  teamMembers: [], // array of string
  externalLink: "",
  year: "",
}

function UploadForm() {
  const [formData, setFormData] = useState(initialFormData)

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit() {
    // sementara cuma log dulu, belum ada backend
    console.log("Submit project:", formData)
  }

  return (
    <section className="relative bg-brand-dark px-4 py-12 md:px-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
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
          value={formData.gallery}
          onChange={(files) => updateField("gallery", files)}
        />

        <UploadPreview formData={formData} />

        <UploadAction formData={formData} onSubmit={handleSubmit} />
      </div>
    </section>
  )
}

export default UploadForm
