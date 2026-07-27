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
    <section className="relative overflow-hidden bg-brand-dark px-4 pt-28 pb-16 md:px-12 md:pt-32 md:pb-20">
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
        <div className="relative">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-16 w-16 md:h-20 md:w-20 rounded-full border-2 border-white/10 object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-700 border border-white/10">
              <UserCircle className="h-7 w-7 md:h-8 md:w-8 text-white" />
            </div>
          )}
        </div>

        <h1 className="mt-4 text-2xl min-[350px]:text-3xl md:text-4xl font-black text-white">
          {user?.name || "Profil Saya"}
        </h1>

        <div className="mt-2 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
          <TipeIcon className="h-3.5 w-3.5 text-cyan-400" />
          {user?.tipe === "mahasiswa"
            ? "Mahasiswa"
            : user?.tipe === "dosen"
              ? "Dosen"
              : "Pengguna Umum"}
        </div>

        <p className="mt-3 max-w-xl text-xs min-[350px]:text-sm md:text-base text-slate-300">
          Kelola informasi akun dan keamanan profil kamu di SINGGAH.
        </p>
      </div>
    </section>
  )
}

export default ProfileHero
