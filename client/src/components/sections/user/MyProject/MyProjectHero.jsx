import { FolderKanban, Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"

function MyProjectHero() {
  const navigate = useNavigate()

  return (
    <section className="relative overflow-hidden bg-brand-dark px-4 pt-28 pb-10 md:px-12 md:pt-32">
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 border border-cyan-400/30">
            <FolderKanban className="h-7 w-7 text-cyan-300" />
          </div>

          <h1 className="mt-5 text-2xl min-[350px]:text-3xl md:text-4xl font-black text-white">
            Project Saya
          </h1>

          <p className="mt-3 max-w-xl text-xs min-[350px]:text-sm md:text-base text-slate-300">
            Kelola semua project yang sudah kamu upload ke SINGGAH.
          </p>
        </div>

        <button
          onClick={() => navigate("/user/upload")}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-500 hover:bg-[position:100%_0]"
        >
          <Plus size={18} />
          Upload Project Baru
        </button>
      </div>
    </section>
  )
}

export default MyProjectHero
