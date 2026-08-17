import { Plus, Pencil } from "lucide-react"

export default function CategoryForm({
  editing,
  formName,
  onNameChange,
  formDesc,
  onDescChange,
  onSave,
  onClose,
}) {
  return (
    <div className="animate-slide-down absolute inset-x-0 top-0 z-20 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-brand-navy/95 via-brand-dark/95 to-slate-900/95 p-6 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:p-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600">
          {editing ? (
            <Pencil size={16} className="text-white" />
          ) : (
            <Plus size={16} className="text-white" />
          )}
        </div>
        <h3 className="text-base font-bold text-white">
          {editing ? "Edit Kategori" : "Tambah Kategori Baru"}
        </h3>
      </div>
      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Nama kategori (contoh: Desain Grafis)"
          value={formName}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSave()}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          autoFocus
        />
        <textarea
          placeholder="Deskripsi kategori (paragraf yang tampil di halaman visitor, contoh: Menampilkan karya desain grafis mahasiswa Teknik Elektro.)"
          value={formDesc}
          onChange={(e) => onDescChange(e.target.value)}
          rows={3}
          className="flex-1 resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onSave}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:to-blue-500 hover:-translate-y-0.5 active:translate-y-0"
          >
            {editing ? "Simpan" : "Tambah"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-300 transition-all hover:bg-white/10 hover:text-white"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  )
}
