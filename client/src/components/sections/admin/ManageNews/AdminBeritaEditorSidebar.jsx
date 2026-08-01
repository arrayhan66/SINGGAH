import { X, Image as ImageIcon, Upload, Trash, Eye, Globe, Save } from "lucide-react"

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

function AdminBeritaEditorSidebar({
  formData,
  updateField,
  onPublish,
  isEditMode,
  onPreview,
}) {
  function handleTagAdd(e) {
    if (e.key !== "Enter") return
    e.preventDefault()
    const trimmed = e.target.value.trim()
    if (!trimmed) return
    if (formData.tags.includes(trimmed)) {
      e.target.classList.add("border-yellow-400/50")
      setTimeout(() => e.target.classList.remove("border-yellow-400/50"), 1000)
      return
    }
    updateField("tags", [...formData.tags, trimmed])
    e.target.value = ""
  }

  function handleTagRemove(tag) {
    updateField(
      "tags",
      formData.tags.filter((t) => t !== tag),
    )
  }

  function handleHeadlineUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    updateField("image", file)
  }

  function handleRemoveHeadline() {
    updateField("image", null)
  }

  function handleTitleSlug(title) {
    updateField("title", title)
    if (!isEditMode && !formData.slug) {
      updateField("slug", slugify(title))
    }
  }

  function handleStatusChange(status) {
    updateField("status", status)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Status & Publish Box */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
          <Save size={15} className="text-cyan-400" />
          Status
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleStatusChange("draft")}
            className={`flex-1 cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
              formData.status === "draft"
                ? "bg-yellow-400/20 border border-yellow-400/40 text-yellow-300"
                : "bg-white/5 border border-white/10 text-slate-400 hover:border-white/20"
            }`}
          >
            Draft
          </button>
          <button
            type="button"
            onClick={() => handleStatusChange("published")}
            className={`flex-1 cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
              formData.status === "published"
                ? "bg-emerald-400/20 border border-emerald-400/40 text-emerald-300"
                : "bg-white/5 border border-white/10 text-slate-400 hover:border-white/20"
            }`}
          >
            Published
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onPublish}
            className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-500 hover:bg-[position:100%_0]"
          >
            {formData.status === "draft" ? "Simpan sebagai Draft" : isEditMode ? "Simpan Perubahan" : "Publikasikan"}
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <button
          type="button"
          onClick={onPreview}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2.5 text-sm font-medium text-cyan-300 transition hover:bg-cyan-400/20"
        >
          <Eye size={16} />
          Preview Berita
        </button>
      </div>

      {/* Slug / Permalink */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Globe size={15} className="text-cyan-400" />
          Permalink
        </div>
        <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
          <span className="text-[10px] text-slate-500 truncate shrink-0">
            /berita/
          </span>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => updateField("slug", slugify(e.target.value))}
            placeholder="slug-judul-berita"
            className="w-full bg-transparent text-xs text-cyan-300 placeholder:text-slate-500 focus:outline-none font-mono"
          />
        </div>
      </div>

      {/* Foto Headline */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <ImageIcon size={15} className="text-cyan-400" />
          Foto Headline
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-dashed border-white/10 bg-brand-dark">
          {formData.image ? (
            <img
              src={
                typeof formData.image === "string"
                  ? formData.image
                  : URL.createObjectURL(formData.image)
              }
              alt="Headline"
              className="aspect-video w-full object-cover"
            />
          ) : (
            <div className="flex aspect-video items-center justify-center text-slate-500">
              <ImageIcon size={32} className="opacity-30" />
            </div>
          )}
        </div>

        <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2.5 text-sm font-medium text-cyan-300 transition hover:bg-cyan-400/20">
          <Upload size={16} />
          {formData.image ? "Ganti Foto" : "Upload Foto"}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleHeadlineUpload}
          />
        </label>

        {formData.image && (
          <button
            type="button"
            onClick={handleRemoveHeadline}
            className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
          >
            <Trash size={16} />
            Hapus Foto
          </button>
        )}
      </div>

      {/* Detail Event */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="text-sm font-semibold text-white">Detail Kegiatan</div>

        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400">
              Pemenang / Tim
            </label>
            <input
              type="text"
              value={formData.winner}
              onChange={(e) => updateField("winner", e.target.value)}
              placeholder="Contoh: Tim Elektro Innovate"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/20 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400">Tanggal</label>
            <input
              type="text"
              value={formData.date}
              onChange={(e) => updateField("date", e.target.value)}
              placeholder="Contoh: 12 Maret 2025"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/20 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400">
              Sumber <span className="text-slate-500">(opsional)</span>
            </label>
            <input
              type="text"
              value={formData.source}
              onChange={(e) => updateField("source", e.target.value)}
              placeholder="Contoh: Humas Poliban"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="text-sm font-semibold text-white">Tags</div>

        <input
          type="text"
          onKeyDown={handleTagAdd}
          placeholder="Ketik lalu Enter"
          className="mt-4 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/20 transition-all"
        />

        {formData.tags.length === 0 && (
          <p className="mt-2 text-[10px] text-slate-500">
            Tambah tag untuk memudahkan pencarian berita
          </p>
        )}

        {formData.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-[11px] text-cyan-300"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleTagRemove(tag)}
                  className="cursor-pointer text-cyan-300 hover:text-white transition-colors"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminBeritaEditorSidebar
