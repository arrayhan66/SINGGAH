import { FolderKanban, Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"

function MyKaryaHero() {
  const navigate = useNavigate()

  return (
    <div className="text-center">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 border border-cyan-400/30 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 3xl:h-28 3xl:w-28 4xl:h-32 4xl:w-32">
        <FolderKanban className="h-7 w-7 text-cyan-300 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 3xl:h-14 3xl:w-14 4xl:h-16 4xl:w-16" />
      </div>

      <h2 className="mt-2 sm:mt-3 md:mt-4 lg:mt-5 2xl:mt-6 3xl:mt-7 4xl:mt-8 text-3xl font-black text-white sm:text-4xl lg:text-5xl 2xl:text-6xl 3xl:text-7xl 4xl:text-8xl">
        Karya <span className="text-cyan-300">Saya</span>
      </h2>

      <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8 2xl:mt-8 2xl:max-w-4xl 2xl:text-xl 2xl:leading-9 3xl:mt-10 3xl:max-w-5xl 3xl:text-2xl 3xl:leading-10 4xl:mt-12 4xl:max-w-6xl 4xl:text-3xl 4xl:leading-11">
        Kelola semua karya yang sudah kamu upload ke SINGGAH.
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
          Upload Karya Baru
        </button>
      </div>
    </div>
  )
}

export default MyKaryaHero
