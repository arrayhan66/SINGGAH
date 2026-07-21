import { X, Image as ImageIcon, Upload, Trash } from "lucide-react"

function AdminBeritaEditorSidebar({
  formData,
  updateField,
  onPublish,
  isEditMode,
}) {
  function handleTagAdd(e) {
    if (e.key !== "Enter") return
    e.preventDefault()
    const trimmed = e.target.value.trim()
    if (!trimmed || formData.tags.includes(trimmed)) return
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

  return (
    <div className="flex flex-col gap-4">
      {/* Publish Box */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <button
          type="button"
          onClick={onPublish}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-500 hover:bg-[position:100%_0]"
        >
          {isEditMode ? "Simpan Perubahan" : "Publikasikan"}
        </button>
      </div>

      {/* Foto Headline */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
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
              Belum ada foto
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
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
          >
            <Trash size={16} />
            Hapus Foto
          </button>
        )}
      </div>

      {/* Detail Event */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold text-white">Detail</div>

        <div className="mt-3 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Pemenang / Tim</label>
            <input
              type="text"
              value={formData.winner}
              onChange={(e) => updateField("winner", e.target.value)}
              placeholder="Contoh: Tim Elektro Innovate"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Tanggal</label>
            <input
              type="text"
              value={formData.date}
              onChange={(e) => updateField("date", e.target.value)}
              placeholder="Contoh: 12 Maret 2025"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">
              Sumber <span className="text-slate-500">(opsional)</span>
            </label>
            <input
              type="text"
              value={formData.source}
              onChange={(e) => updateField("source", e.target.value)}
              placeholder="Contoh: Humas Poliban"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold text-white">Tags</div>

        <input
          type="text"
          onKeyDown={handleTagAdd}
          placeholder="Ketik lalu Enter"
          className="mt-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none"
        />

        {formData.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-[11px] text-cyan-300"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleTagRemove(tag)}
                  className="text-cyan-300 hover:text-white transition-colors"
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
