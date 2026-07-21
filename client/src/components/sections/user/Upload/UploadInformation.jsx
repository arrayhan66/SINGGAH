import { Plus, X } from "lucide-react"
import GlassCard from "../../../ui/GlassCard"

const categoryOptions = [
  { value: "iot", label: "Internet of Things" },
  { value: "robotika", label: "Robotika" },
  { value: "kendali", label: "Sistem Kendali" },
  { value: "energi", label: "Energi Terbarukan" },
  { value: "elektronika", label: "Elektronika" },
  { value: "otomasi", label: "Otomasi Industri" },
]

function UploadInformation({ formData, updateField }) {
  function handleAddMember() {
    updateField("teamMembers", [...formData.teamMembers, ""])
  }

  function handleMemberChange(index, value) {
    const updated = [...formData.teamMembers]
    updated[index] = value
    updateField("teamMembers", updated)
  }

  function handleRemoveMember(index) {
    updateField(
      "teamMembers",
      formData.teamMembers.filter((_, i) => i !== index),
    )
  }

  return (
    <GlassCard className="p-5 md:p-6">
      <h2 className="text-sm min-[350px]:text-base md:text-lg font-semibold text-white">
        Informasi Project
      </h2>
      <p className="mt-1 text-xs md:text-sm text-slate-400">
        Lengkapi detail project yang akan kamu upload.
      </p>

      <div className="mt-5 flex flex-col gap-4">
        {/* Judul */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs md:text-sm font-medium text-slate-300">
            Judul Project
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="Contoh: Sistem Monitoring Suhu Berbasis IoT"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none"
          />
        </div>

        {/* Kategori */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs md:text-sm font-medium text-slate-300">
            Kategori
          </label>
          <select
            value={formData.category}
            onChange={(e) => updateField("category", e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
          >
            <option value="" className="bg-brand-navy">
              Pilih kategori
            </option>
            {categoryOptions.map((cat) => (
              <option
                key={cat.value}
                value={cat.value}
                className="bg-brand-navy"
              >
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Deskripsi Singkat */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs md:text-sm font-medium text-slate-300">
            Deskripsi Singkat
          </label>
          <textarea
            value={formData.shortDescription}
            onChange={(e) => updateField("shortDescription", e.target.value)}
            maxLength={150}
            rows={2}
            placeholder="Ringkasan singkat untuk ditampilkan di card Hall (maks 150 karakter)"
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none"
          />
          <span className="text-[11px] text-slate-500">
            {formData.shortDescription.length}/150
          </span>
        </div>

        {/* Deskripsi Lengkap */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs md:text-sm font-medium text-slate-300">
            Deskripsi Lengkap
          </label>
          <textarea
            value={formData.fullDescription}
            onChange={(e) => updateField("fullDescription", e.target.value)}
            rows={5}
            placeholder="Jelaskan project kamu secara lengkap: latar belakang, cara kerja, fitur, dll."
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none"
          />
        </div>

        {/* Anggota Tim */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs md:text-sm font-medium text-slate-300">
            Anggota Tim{" "}
            <span className="text-slate-500 font-normal">(opsional)</span>
          </label>

          <div className="flex flex-col gap-2">
            {formData.teamMembers.map((member, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={member}
                  onChange={(e) => handleMemberChange(index, e.target.value)}
                  placeholder="Nama anggota"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveMember(index)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddMember}
            className="mt-1 flex w-fit items-center gap-1.5 text-xs md:text-sm text-cyan-300 hover:text-cyan-200 transition-colors"
          >
            <Plus size={14} />
            Tambah anggota
          </button>
        </div>

        {/* Link Eksternal & Tahun */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs md:text-sm font-medium text-slate-300">
              Link Eksternal{" "}
              <span className="text-slate-500 font-normal">(opsional)</span>
            </label>
            <input
              type="text"
              value={formData.externalLink}
              onChange={(e) => updateField("externalLink", e.target.value)}
              placeholder="https://github.com/..."
              className="w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs md:text-sm font-medium text-slate-300">
              Tahun / Semester{" "}
              <span className="text-slate-500 font-normal">(opsional)</span>
            </label>
            <input
              type="text"
              value={formData.year}
              onChange={(e) => updateField("year", e.target.value)}
              placeholder="Contoh: 2025 / Semester 5"
              className="w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

export default UploadInformation
