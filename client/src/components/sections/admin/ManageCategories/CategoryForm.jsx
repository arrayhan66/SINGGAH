import { Plus, Pencil, Loader2 } from "lucide-react"

export default function CategoryForm({
  editing,
  formName,
  onNameChange,
  formDesc,
  onDescChange,
  onSave,
  onClose,
  saving = false,
}) {
  return (
    <div className="animate-slide-down absolute inset-x-0 top-0 z-20 mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-brand-navy/95 via-brand-dark/95 to-slate-900/95 p-6 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:p-8 3xl:max-w-4xl 3xl:p-10 4xl:p-12">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 3xl:h-11 3xl:w-11 4xl:h-12 4xl:w-12">
          {editing ? (
            <Pencil size={16} className="text-white 4xl:h-[18px] 4xl:w-[18px]" />
          ) : (
            <Plus size={16} className="text-white 4xl:h-[18px] 4xl:w-[18px]" />
          )}
        </div>
        <h3 className="text-base font-bold text-white 3xl:text-lg 4xl:text-xl">
          {editing ? "Edit Kategori" : "Tambah Kategori Baru"}
        </h3>
      </div>
      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Nama kategori..."
          value={formName}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !saving && onSave()}
          disabled={saving}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50 3xl:py-3.5 3xl:text-base 4xl:py-4 4xl:text-lg"
          autoFocus
        />
        <textarea
          placeholder="Deskripsi kategori..."
          value={formDesc}
          onChange={(e) => onDescChange(e.target.value)}
          rows={3}
          disabled={saving}
          className="flex-1 resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50 3xl:py-3.5 3xl:text-base 4xl:py-4 4xl:text-lg"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:to-blue-500 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 3xl:px-7 3xl:py-3.5 3xl:text-base 4xl:px-8 4xl:py-4 4xl:text-lg"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              editing ? "Simpan" : "Tambah"
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-300 transition-all hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 3xl:px-6 3xl:py-3.5 3xl:text-base 4xl:px-7 4xl:py-4 4xl:text-lg"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  )
}
