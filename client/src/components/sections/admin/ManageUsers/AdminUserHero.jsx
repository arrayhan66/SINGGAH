import { Users } from "lucide-react"

function AdminUserHero() {
  return (
    <div className="px-6 py-8 md:px-10 md:py-10">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10">
          <Users className="h-5 w-5 text-cyan-300" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-white md:text-2xl">
            Kelola User
          </h1>

          <p className="text-xs text-slate-400 md:text-sm">
            Tambah, edit, hapus, dan kelola seluruh pengguna SINGGAH.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminUserHero