import { FolderKanban, Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"

function MyProjectHero() {
  const navigate = useNavigate()

  return (
    <div className="text-center">
      <div className="mt-8 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 border border-cyan-400/30 sm:h-14 sm:w-14 md:h-16 md:w-16 3xl:h-20 3xl:w-20 4xl:h-24 4xl:w-24">
        <FolderKanban className="h-6 w-6 text-cyan-300 sm:h-7 sm:w-7 md:h-8 md:w-8 3xl:h-10 3xl:w-10 4xl:h-12 4xl:w-12" />
      </div>

      <h2 className="mt-8 text-3xl font-black text-white sm:text-4xl lg:text-5xl 2xl:text-6xl 3xl:text-7xl 4xl:text-8xl">
        Project <span className="text-cyan-300">Saya</span>
      </h2>

      <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8 2xl:mt-8 2xl:max-w-4xl 2xl:text-xl 2xl:leading-9 3xl:mt-10 3xl:max-w-5xl 3xl:text-2xl 3xl:leading-10 4xl:mt-12 4xl:max-w-6xl 4xl:text-3xl 4xl:leading-11">
        Kelola semua project yang sudah kamu upload ke SINGGAH.
      </p>

      <div className="mt-8 2xl:mt-10 3xl:mt-12 4xl:mt-14">
        <button
          type="button"
          onClick={() => navigate("/upload")}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-500 hover:bg-[position:100%_0] sm:rounded-2xl sm:px-6 sm:py-3.5 sm:text-sm md:px-7 md:py-3.5 md:text-sm lg:text-base 3xl:px-8 3xl:py-4 3xl:text-base 4xl:px-10 4xl:py-5 4xl:text-lg"
        >
          <Plus size={18} className="sm:hidden" />
          <Plus size={20} className="hidden sm:block lg:hidden" />
          <Plus size={22} className="hidden lg:block" />
          Upload Project Baru
        </button>
      </div>
    </div>
  )
}

export default MyProjectHero
