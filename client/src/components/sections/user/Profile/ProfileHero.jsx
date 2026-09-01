import { useAuth } from "../../../../context/AuthContext"
import { GraduationCap, Briefcase, Users, CreditCard, Shield } from "lucide-react"
import AdminHeroBackground from "../../../ui/AdminHeroBackground"
import UserAvatar from "../../../ui/UserAvatar"

const tipeIcon = {
  admin: Shield,
  mahasiswa: GraduationCap,
  dosen: Briefcase,
  umum: Users,
}

const heroSize =
  "h-16 w-16 min-[350px]:h-20 min-[350px]:w-20 md:h-28 md:w-28 lg:h-32 lg:w-32 2xl:h-36 2xl:w-36"

function ProfileHero({ isAdmin = false }) {
  const { user } = useAuth()
  const TipeIcon = user?.role === "admin" ? Shield : tipeIcon[user?.tipe] || Users

  const content = (
    <>
      <div className="relative">
        <UserAvatar
          name={user?.name}
          avatar={user?.avatar}
          imgSizeClass={`${heroSize} border-2 border-white/10`}
          fallbackSizeClass={heroSize}
          fallbackClass="bg-gradient-to-br from-cyan-400 to-blue-600 font-bold text-white border border-cyan-400/30"
          textClass="text-xl min-[350px]:text-2xl md:text-4xl lg:text-5xl 2xl:text-6xl"
        />
      </div>

      <h1 className="mt-3 min-[350px]:mt-4 md:mt-4 text-xl min-[350px]:text-2xl md:text-3xl lg:text-4xl 2xl:text-5xl font-black text-white lg:mt-5 2xl:mt-6">
        {user?.name || "Profil Saya"}
      </h1>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 lg:mt-0 lg:text-sm">
          <TipeIcon className="h-3.5 w-3.5 text-cyan-400" />
          {user?.role === "admin"
            ? "Administrator"
            : user?.tipe === "mahasiswa"
              ? "Mahasiswa"
              : user?.tipe === "dosen"
                ? "Dosen"
                : "Pengguna Umum"}
        </div>
        {(user?.tipe === "mahasiswa" || user?.tipe === "dosen") &&
          user?.nim_nip && (
            <div className="flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200 lg:text-sm">
              <CreditCard className="h-3.5 w-3.5" />
              {user?.tipe === "dosen" ? "Kartu Identitas" : "NIM"}: {user.nim_nip}
            </div>
          )}
      </div>

      <p className="mt-3 max-w-xl text-xs min-[350px]:text-sm md:text-base lg:text-lg lg:mt-4 2xl:text-xl 2xl:mt-5 text-slate-300">
        Kelola informasi akun dan keamanan profil kamu di SINGGAH.
      </p>
    </>
  )

  if (isAdmin) {
    return (
      <AdminHeroBackground fullWidth>
        <div className="px-6 pt-6 pb-6 md:px-10 md:pt-8 md:pb-8">
          <div className="mx-auto flex max-w-5xl flex-col items-center text-center lg:max-w-6xl 2xl:max-w-7xl">
            {content}
          </div>
        </div>
      </AdminHeroBackground>
    )
  }

  return (
    <AdminHeroBackground className="px-4 pt-28 pb-6 md:px-12 md:pt-32 md:pb-8 lg:px-16 lg:pb-10 2xl:px-20 2xl:pt-36 2xl:pb-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center text-center lg:max-w-6xl 2xl:max-w-7xl">
        {content}
      </div>
    </AdminHeroBackground>
  )
}

export default ProfileHero
