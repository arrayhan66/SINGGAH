import { useAuth } from "../../../../context/AuthContext"
import { UserCircle, GraduationCap, Briefcase, Users } from "lucide-react"

const tipeIcon = {
  mahasiswa: GraduationCap,
  dosen: Briefcase,
  umum: Users,
}

function ProfileHero() {
  const { user } = useAuth()
  const TipeIcon = tipeIcon[user?.tipe] || Users

  return (
    <section className="relative overflow-hidden bg-brand-dark px-4 pt-28 pb-6 md:px-12 md:pt-32 md:pb-8 lg:px-16 lg:pb-10 2xl:px-20 2xl:pt-36 2xl:pb-12">
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center lg:max-w-6xl 2xl:max-w-7xl">
        <div className="relative">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-20 w-20 min-[350px]:h-24 min-[350px]:w-24 md:h-[120px] md:w-[120px] lg:h-36 lg:w-36 2xl:h-40 2xl:w-40 rounded-full border-2 border-white/10 object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 min-[350px]:h-20 min-[350px]:w-20 md:h-28 md:w-28 lg:h-32 lg:w-32 2xl:h-36 2xl:w-36 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-700 border border-white/10">
              <UserCircle className="h-8 w-8 min-[350px]:h-10 min-[350px]:w-10 md:h-14 md:w-14 lg:h-16 lg:w-16 2xl:h-[72px] 2xl:w-[72px] text-white" />
            </div>
          )}
        </div>

        <h1 className="mt-3 min-[350px]:mt-4 md:mt-4 text-xl min-[350px]:text-2xl md:text-3xl lg:text-4xl 2xl:text-5xl font-black text-white lg:mt-5 2xl:mt-6">
          {user?.name || "Profil Saya"}
        </h1>

        <div className="mt-2 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 lg:mt-3 lg:text-sm 2xl:mt-4 2xl:text-base">
          <TipeIcon className="h-3.5 w-3.5 text-cyan-400" />
          {user?.tipe === "mahasiswa"
            ? "Mahasiswa"
            : user?.tipe === "dosen"
              ? "Dosen"
              : "Pengguna Umum"}
        </div>

        <p className="mt-3 max-w-xl text-xs min-[350px]:text-sm md:text-base lg:text-lg lg:mt-4 2xl:text-xl 2xl:mt-5 text-slate-300">
          Kelola informasi akun dan keamanan profil kamu di SINGGAH.
        </p>
      </div>
    </section>
  )
}

export default ProfileHero
