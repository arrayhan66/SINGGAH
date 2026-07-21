import { Newspaper } from "lucide-react"

function AdminBeritaHero() {
  return (
    <div className="px-6 py-8 md:px-10 md:py-10">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 border border-cyan-400/30">
          <Newspaper className="h-5 w-5 text-cyan-300" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">
            Kelola Berita
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Tambah, ubah, atau hapus berita dan pencapaian SINGGAH.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminBeritaHero
