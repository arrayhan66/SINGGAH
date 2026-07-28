import { useState, useEffect } from "react"
import { Plus, X, Link2, Video } from "lucide-react"
import GlassCard from "../../../ui/GlassCard"
import api from "../../../../services/api"

function UploadInformation({ formData, updateField }) {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    api
      .get("/categories")
      .then((res) => setCategories(res.data.data || res.data))
      .catch(() => setCategories([]))
  }, [])

  function handleAddMember() {
    updateField("members", [...formData.members, { name: "", role: "" }])
  }

  function handleMemberChange(index, field, value) {
    const updated = [...formData.members]
    updated[index] = { ...updated[index], [field]: value }
    updateField("members", updated)
  }

  function handleRemoveMember(index) {
    updateField(
      "members",
      formData.members.filter((_, i) => i !== index),
    )
  }

  function handleAddLink() {
    updateField("links", [...formData.links, { label: "", url: "" }])
  }

  function handleLinkChange(index, field, value) {
    const updated = [...formData.links]
    updated[index] = { ...updated[index], [field]: value }
    updateField("links", updated)
  }

  function handleRemoveLink(index) {
    updateField(
      "links",
      formData.links.filter((_, i) => i !== index),
    )
  }

  return (
    <GlassCard className="p-4 min-[280px]:p-5 sm:p-6 2xl:p-8 3xl:p-10 4xl:p-12">
      <h2 className="text-sm min-[280px]:text-base sm:text-lg 2xl:text-xl 3xl:text-2xl 4xl:text-3xl font-semibold text-white">
        Informasi Project
      </h2>
      <p className="mt-1 text-xs min-[280px]:text-sm text-slate-400 2xl:text-base 3xl:text-lg 4xl:text-xl">
        Lengkapi detail project yang akan kamu upload.
      </p>

      <div className="mt-4 min-[280px]:mt-5 flex flex-col gap-3 min-[280px]:gap-4 2xl:gap-5 3xl:gap-6 4xl:gap-7">
        {/* Judul */}
        <div className="flex flex-col gap-1 min-[280px]:gap-1.5">
          <label className="text-xs min-[280px]:text-sm font-medium text-slate-300 2xl:text-base 3xl:text-lg 4xl:text-xl">
            Judul Project
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="Contoh: Sistem Monitoring Suhu Berbasis IoT"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 min-[280px]:px-4 min-[280px]:py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none 2xl:text-base 2xl:px-5 2xl:py-3 3xl:text-lg 3xl:px-6 3xl:py-3.5 4xl:text-xl 4xl:px-7 4xl:py-4"
          />
        </div>

        {/* Kategori */}
        <div className="flex flex-col gap-1 min-[280px]:gap-1.5">
          <label className="text-xs min-[280px]:text-sm font-medium text-slate-300 2xl:text-base 3xl:text-lg 4xl:text-xl">
            Kategori
          </label>
          <select
            value={formData.category_id}
            onChange={(e) => updateField("category_id", e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 min-[280px]:px-4 min-[280px]:py-2.5 text-sm text-white focus:border-cyan-400/50 focus:outline-none 2xl:text-base 2xl:px-5 2xl:py-3 3xl:text-lg 3xl:px-6 3xl:py-3.5 4xl:text-xl 4xl:px-7 4xl:py-4"
          >
            <option value="" className="bg-brand-navy">
              Pilih kategori
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-brand-navy">
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Deskripsi */}
        <div className="flex flex-col gap-1 min-[280px]:gap-1.5">
          <label className="text-xs min-[280px]:text-sm font-medium text-slate-300 2xl:text-base 3xl:text-lg 4xl:text-xl">
            Deskripsi Project
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={5}
            placeholder="Jelaskan project kamu secara lengkap: latar belakang, cara kerja, fitur, dll."
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 min-[280px]:px-4 min-[280px]:py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none 2xl:text-base 2xl:px-5 2xl:py-3 3xl:text-lg 3xl:px-6 3xl:py-3.5 4xl:text-xl 4xl:px-7 4xl:py-4"
          />
        </div>

        {/* Anggota Tim */}
        <div className="flex flex-col gap-1 min-[280px]:gap-1.5">
          <label className="text-xs min-[280px]:text-sm font-medium text-slate-300 2xl:text-base 3xl:text-lg 4xl:text-xl">
            Anggota Tim{" "}
            <span className="text-slate-500 font-normal">(opsional)</span>
          </label>

          <div className="flex flex-col gap-2">
            {formData.members.map((member, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => handleMemberChange(index, "name", e.target.value)}
                  placeholder="Nama anggota"
                  className="w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 min-[280px]:px-4 min-[280px]:py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none 2xl:text-base 2xl:px-5 2xl:py-3"
                />
                <input
                  type="text"
                  value={member.role}
                  onChange={(e) => handleMemberChange(index, "role", e.target.value)}
                  placeholder="Peran"
                  className="w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 min-[280px]:px-4 min-[280px]:py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none 2xl:text-base 2xl:px-5 2xl:py-3"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveMember(index)}
                  className="flex h-8 w-8 min-[280px]:h-9 min-[280px]:w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddMember}
            className="mt-1 flex w-fit items-center gap-1.5 text-xs min-[280px]:text-sm text-cyan-300 hover:text-cyan-200 transition-colors 2xl:text-base"
          >
            <Plus size={14} className="2xl:size-5" />
            Tambah anggota
          </button>
        </div>

        {/* Link Eksternal */}
        <div className="flex flex-col gap-1 min-[280px]:gap-1.5">
          <label className="flex items-center gap-1.5 text-xs min-[280px]:text-sm font-medium text-slate-300 2xl:text-base 3xl:text-lg 4xl:text-xl">
            <Link2 size={14} className="2xl:size-4" />
            Link Eksternal{" "}
            <span className="text-slate-500 font-normal">(opsional)</span>
          </label>

          <div className="flex flex-col gap-2">
            {formData.links.map((link, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => handleLinkChange(index, "label", e.target.value)}
                  placeholder="Label (GitHub, Live Demo, Figma)"
                  className="w-1/3 min-w-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 min-[280px]:px-4 min-[280px]:py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none 2xl:text-base 2xl:px-5 2xl:py-3"
                />
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => handleLinkChange(index, "url", e.target.value)}
                  placeholder="https://..."
                  className="w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 min-[280px]:px-4 min-[280px]:py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none 2xl:text-base 2xl:px-5 2xl:py-3"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveLink(index)}
                  className="flex h-8 w-8 min-[280px]:h-9 min-[280px]:w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddLink}
            className="mt-1 flex w-fit items-center gap-1.5 text-xs min-[280px]:text-sm text-cyan-300 hover:text-cyan-200 transition-colors 2xl:text-base"
          >
            <Plus size={14} className="2xl:size-5" />
            Tambah link
          </button>
        </div>

        {/* Video URL */}
        <div className="flex flex-col gap-1 min-[280px]:gap-1.5">
          <label className="flex items-center gap-1.5 text-xs min-[280px]:text-sm font-medium text-slate-300 2xl:text-base 3xl:text-lg 4xl:text-xl">
            <Video size={14} className="2xl:size-4" />
            Video Demo{" "}
            <span className="text-slate-500 font-normal">(opsional)</span>
          </label>
          <input
            type="url"
            value={formData.videoUrl}
            onChange={(e) => updateField("videoUrl", e.target.value)}
            placeholder="https://youtube.com/..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 min-[280px]:px-4 min-[280px]:py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none 2xl:text-base 2xl:px-5 2xl:py-3 3xl:text-lg 3xl:px-6 3xl:py-3.5 4xl:text-xl 4xl:px-7 4xl:py-4"
          />
        </div>

        {/* Tahun */}
        <div className="flex flex-col gap-1 min-[280px]:gap-1.5">
          <label className="text-xs min-[280px]:text-sm font-medium text-slate-300 2xl:text-base 3xl:text-lg 4xl:text-xl">
            Tahun
          </label>
          <input
            type="number"
            min="2000"
            max="2099"
            value={formData.year}
            onChange={(e) => updateField("year", e.target.value)}
            placeholder="Contoh: 2025"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 min-[280px]:px-4 min-[280px]:py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none 2xl:text-base 2xl:px-5 2xl:py-3 3xl:text-lg 3xl:px-6 3xl:py-3.5 4xl:text-xl 4xl:px-7 4xl:py-4"
          />
        </div>
      </div>
    </GlassCard>
  )
}

export default UploadInformation
