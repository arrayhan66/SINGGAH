import { useState, useEffect } from "react"
import { Plus, X, Link2, Video, Info } from "lucide-react"
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
    <GlassCard className="p-3 min-[280px]:p-5 sm:p-6 2xl:p-8 3xl:p-10 4xl:p-12">
      <div className="flex items-center gap-2">
        <div className="flex shrink-0 h-[clamp(2.5rem,1.5rem+2.5vw,5rem)] w-[clamp(2.5rem,1.5rem+2.5vw,5rem)] items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/30">
          <Info className="text-cyan-300 h-[clamp(1.25rem,0.75rem+1.25vw,2.5rem)] w-[clamp(1.25rem,0.75rem+1.25vw,2.5rem)]" />
        </div>
        <div>
          <h2 className="text-xs min-[280px]:text-base sm:text-lg 2xl:text-xl 3xl:text-2xl 4xl:text-3xl font-semibold text-white">
            Informasi Karya
          </h2>
        </div>
      </div>

      <div className="mt-2 min-[280px]:mt-5 flex flex-col gap-3 min-[280px]:gap-4 2xl:gap-5 3xl:gap-6 4xl:gap-7">
        {/* Judul */}
        <div className="flex flex-col gap-1 min-[280px]:gap-1.5">
          <div className="flex items-center gap-2">
            <label className="text-[11px] min-[280px]:text-sm font-medium text-slate-300 2xl:text-base 3xl:text-lg 4xl:text-xl">
              Judul Karya <span className="text-red-400">*</span>
            </label>
            <span className="rounded-full border border-red-400/30 bg-red-400/10 px-1.5 min-[280px]:px-2 py-0.5 text-[9px] min-[280px]:text-[11px] font-medium text-red-400 2xl:text-xs 3xl:text-sm">
              Wajib
            </span>
          </div>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="Cth: Sistem Monitoring Suhu"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 min-[280px]:px-4 min-[280px]:py-2.5 text-xs min-[280px]:text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:outline-none 2xl:text-base 2xl:px-5 2xl:py-3 3xl:text-lg 3xl:px-6 3xl:py-3.5 4xl:text-xl 4xl:px-7 4xl:py-4"
          />
        </div>

        {/* Kategori */}
        <div className="flex flex-col gap-1 min-[280px]:gap-1.5">
          <div className="flex items-center gap-2">
            <label className="text-[11px] min-[280px]:text-sm font-medium text-slate-300 2xl:text-base 3xl:text-lg 4xl:text-xl">
              Kategori <span className="text-red-400">*</span>
            </label>
            <span className="rounded-full border border-red-400/30 bg-red-400/10 px-1.5 min-[280px]:px-2 py-0.5 text-[9px] min-[280px]:text-[11px] font-medium text-red-400 2xl:text-xs 3xl:text-sm">
              Wajib
            </span>
          </div>
          <select
            value={formData.category_id}
            onChange={(e) => updateField("category_id", e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 min-[280px]:px-4 min-[280px]:py-2.5 text-xs min-[280px]:text-sm text-slate-900 focus:border-cyan-400 focus:bg-white focus:outline-none 2xl:text-base 2xl:px-5 2xl:py-3 3xl:text-lg 3xl:px-6 3xl:py-3.5 4xl:text-xl 4xl:px-7 4xl:py-4"
          >
            <option value="" className="bg-white">
              Pilih kategori
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-white">
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Deskripsi */}
        <div className="flex flex-col gap-1 min-[280px]:gap-1.5">
          <div className="flex items-center gap-2">
            <label className="text-[11px] min-[280px]:text-sm font-medium text-slate-300 2xl:text-base 3xl:text-lg 4xl:text-xl">
              Deskripsi Karya <span className="text-red-400">*</span>
            </label>
            <span className="rounded-full border border-red-400/30 bg-red-400/10 px-1.5 min-[280px]:px-2 py-0.5 text-[9px] min-[280px]:text-[11px] font-medium text-red-400 2xl:text-xs 3xl:text-sm">
              Wajib
            </span>
          </div>
          <textarea
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={5}
            placeholder="Ceritain karya kamu secara singkat"
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 min-[280px]:px-4 min-[280px]:py-2.5 text-xs min-[280px]:text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:outline-none 2xl:text-base 2xl:px-5 2xl:py-3 3xl:text-lg 3xl:px-6 3xl:py-3.5 4xl:text-xl 4xl:px-7 4xl:py-4"
          />
        </div>

        {/* Anggota Tim */}
        <div className="flex flex-col gap-1 min-[280px]:gap-1.5">
          <div className="flex items-center gap-2">
            <label className="text-[11px] min-[280px]:text-sm font-medium text-slate-300 2xl:text-base 3xl:text-lg 4xl:text-xl">
              Anggota Tim
            </label>
            <span className="inline-flex items-center rounded-full border border-slate-600 bg-slate-800 px-1.5 min-[280px]:px-2 py-0.5 text-[8px] min-[280px]:text-[10px] font-medium text-slate-400 2xl:text-xs 3xl:text-sm">
              Opsional
            </span>
          </div>

          <div className="flex flex-col gap-1.5 min-[280px]:gap-2">
            {formData.members.map((member, index) => (
              <div key={index} className="flex items-center gap-1.5 min-[280px]:gap-2">
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => handleMemberChange(index, "name", e.target.value)}
                  placeholder="Nama tim..."
                  className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 min-[280px]:px-4 min-[280px]:py-2.5 text-xs min-[280px]:text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:outline-none 2xl:text-base 2xl:px-5 2xl:py-3"
                />
                <input
                  type="text"
                  value={member.role}
                  onChange={(e) => handleMemberChange(index, "role", e.target.value)}
                  placeholder="Frontend, Backend, UI/UX..."
                  className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 min-[280px]:px-4 min-[280px]:py-2.5 text-xs min-[280px]:text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:outline-none 2xl:text-base 2xl:px-5 2xl:py-3"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveMember(index)}
                  className="flex h-6 w-6 min-[280px]:h-9 min-[280px]:w-9 cursor-pointer shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <X className="h-3.5 w-3.5 min-[280px]:h-4 min-[280px]:w-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddMember}
            className="mt-1 flex w-fit cursor-pointer items-center gap-1.5 text-xs min-[280px]:text-sm text-cyan-300 hover:text-cyan-200 hover:underline transition-colors 2xl:text-base"
          >
            <Plus className="h-4 w-4 2xl:h-5 2xl:w-5" />
            Tambah anggota
          </button>
        </div>

        {/* Link Eksternal */}
        <div className="flex flex-col gap-1 min-[280px]:gap-1.5">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-[11px] min-[280px]:text-sm font-medium text-slate-300 2xl:text-base 3xl:text-lg 4xl:text-xl">
              <Link2 className="h-4 w-4 2xl:h-5 2xl:w-5" />
              Link Eksternal
            </label>
            <span className="inline-flex items-center rounded-full border border-slate-600 bg-slate-800 px-1.5 min-[280px]:px-2 py-0.5 text-[8px] min-[280px]:text-[10px] font-medium text-slate-400 2xl:text-xs 3xl:text-sm">
              Opsional
            </span>
          </div>

          <div className="flex flex-col gap-1.5 min-[280px]:gap-2">
            {formData.links.map((link, index) => (
              <div key={index} className="flex items-center gap-1.5 min-[280px]:gap-2">
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => handleLinkChange(index, "label", e.target.value)}
                  placeholder="Cth: GitHub, Demo"
                  className="w-1/4 min-[400px]:w-1/3 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 min-[280px]:px-4 min-[280px]:py-2.5 text-xs min-[280px]:text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:outline-none 2xl:text-base 2xl:px-5 2xl:py-3"
                />
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => handleLinkChange(index, "url", e.target.value)}
                  placeholder="https://..."
                  className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 min-[280px]:px-4 min-[280px]:py-2.5 text-xs min-[280px]:text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:outline-none 2xl:text-base 2xl:px-5 2xl:py-3"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveLink(index)}
                  className="flex h-6 w-6 min-[280px]:h-9 min-[280px]:w-9 cursor-pointer shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <X className="h-3.5 w-3.5 min-[280px]:h-4 min-[280px]:w-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddLink}
            className="mt-1 flex w-fit cursor-pointer items-center gap-1.5 text-xs min-[280px]:text-sm text-cyan-300 hover:text-cyan-200 hover:underline transition-colors 2xl:text-base"
          >
            <Plus className="h-4 w-4 2xl:h-5 2xl:w-5" />
            Tambah link
          </button>
        </div>

        {/* Video URL */}
        <div className="flex flex-col gap-1 min-[280px]:gap-1.5">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-[11px] min-[280px]:text-sm font-medium text-slate-300 2xl:text-base 3xl:text-lg 4xl:text-xl">
              <Video className="h-4 w-4 2xl:h-5 2xl:w-5" />
              Video Demo
            </label>
            <span className="inline-flex items-center rounded-full border border-slate-600 bg-slate-800 px-1.5 min-[280px]:px-2 py-0.5 text-[8px] min-[280px]:text-[10px] font-medium text-slate-400 2xl:text-xs 3xl:text-sm">
              Opsional
            </span>
          </div>
          <input
            type="url"
            value={formData.videoUrl}
            onChange={(e) => updateField("videoUrl", e.target.value)}
            placeholder="https://youtube.com/..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 min-[280px]:px-4 min-[280px]:py-2.5 text-xs min-[280px]:text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:outline-none 2xl:text-base 2xl:px-5 2xl:py-3 3xl:text-lg 3xl:px-6 3xl:py-3.5 4xl:text-xl 4xl:px-7 4xl:py-4"
          />
        </div>

        {/* Tahun */}
        <div className="flex flex-col gap-1 min-[280px]:gap-1.5">
          <div className="flex items-center gap-2">
            <label className="text-[11px] min-[280px]:text-sm font-medium text-slate-300 2xl:text-base 3xl:text-lg 4xl:text-xl">
              Tahun <span className="text-red-400">*</span>
            </label>
            <span className="rounded-full border border-red-400/30 bg-red-400/10 px-1.5 min-[280px]:px-2 py-0.5 text-[9px] min-[280px]:text-[11px] font-medium text-red-400 2xl:text-xs 3xl:text-sm">
              Wajib
            </span>
          </div>
          <input
            type="number"
            min="2000"
            max="2099"
            value={formData.year}
            onChange={(e) => updateField("year", e.target.value)}
            placeholder="Contoh: 2025"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 min-[280px]:px-4 min-[280px]:py-2.5 text-xs min-[280px]:text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:outline-none 2xl:text-base 2xl:px-5 2xl:py-3 3xl:text-lg 3xl:px-6 3xl:py-3.5 4xl:text-xl 4xl:px-7 4xl:py-4 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
      </div>
    </GlassCard>
  )
}

export default UploadInformation
