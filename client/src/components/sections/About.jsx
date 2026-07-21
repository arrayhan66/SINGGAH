import {
  GraduationCap,
  Users,
  Rocket,
  Trophy,
  Mail,
  Phone,
  MapPin,
} from "lucide-react"
import DustBackground from "../ui/DustBackground"
import GlowBackground from "../ui/GlowBackground"
import GlassCard from "../ui/GlassCard"

function About() {
  return (
    <section
      id="about"
      className="relative overflow-hidden bg-brand-dark pt-24 lg:pt-28 pb-12 lg:pb-16"
    >
      {/* Glow */}
      <GlowBackground />

      {/* Dust Particles */}
      <DustBackground />

      <div className="mx-auto grid max-w-7xl gap-10 lg:gap-16 px-4 sm:px-8 lg:grid-cols-2">
        {/* LEFT */}
        <div>
          <h2 className="mt-6 text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            Wadah <span className="text-cyan-300">Inovasi</span>
            <br />
            Mahasiswa
          </h2>

          <p className="mt-6 lg:mt-8 text-base lg:text-lg leading-relaxed text-slate-300 text-justify">
            Pamer<span className="text-cyan-300">IT</span> merupakan platform
            digital yang menampilkan berbagai karya terbaik mahasiswa di bidang
            teknologi informasi. Pengunjung dapat mengeksplorasi project secara
            interaktif layaknya memasuki sebuah exhibition hall virtual.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <GlassCard className="p-4 sm:p-6">
              <GraduationCap className="h-7 w-7 text-cyan-400 sm:h-[38px] sm:w-[38px]" />
              <h3 className="mt-5 text-xl font-bold text-white">Edukasi</h3>
              <p className="mt-3 text-slate-300">
                Media pembelajaran dan publikasi karya mahasiswa.
              </p>
            </GlassCard>

            <GlassCard className="p-4 sm:p-6">
              <Rocket className="h-7 w-7 text-cyan-400 sm:h-[38px] sm:w-[38px]" />
              <h3 className="mt-5 text-xl font-bold text-white">Inovasi</h3>
              <p className="mt-3 text-slate-300">
                Menampilkan solusi digital yang kreatif dan modern.
              </p>
            </GlassCard>

            <GlassCard className="p-4 sm:p-6">
              <Users className="h-7 w-7 text-cyan-400 sm:h-[38px] sm:w-[38px]" />
              <h3 className="mt-5 text-xl font-bold text-white">Kolaborasi</h3>
              <p className="mt-3 text-slate-300">
                Menghubungkan mahasiswa, dosen dan industri.
              </p>
            </GlassCard>

            <GlassCard className="p-4 sm:p-6">
              <Trophy className="h-7 w-7 text-cyan-400 sm:h-[38px] sm:w-[38px]" />
              <h3 className="mt-5 text-xl font-bold text-white">Prestasi</h3>
              <p className="mt-3 text-slate-300">
                Mengapresiasi project terbaik setiap tahunnya.
              </p>
            </GlassCard>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-5 sm:space-y-8 mt-6">
          <GlassCard className="p-5 sm:p-8">
            <h3 className="text-xl sm:text-3xl font-bold text-white">
              Hubungi Kami
            </h3>
            <div className="mt-6 sm:mt-10 space-y-6 sm:space-y-8">
              <div className="flex gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-cyan-500">
                  <Mail className="text-white" />
                </div>

                <div className="min-w-0">
                  <h4 className="text-white font-semibold">Email</h4>
                  <p className="text-slate-300 break-all">
                    elektro@poliban.ac.id
                  </p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-cyan-500">
                  <Phone className="text-white" />
                </div>

                <div className="min-w-0">
                  <h4 className="text-white font-semibold">Telepon</h4>
                  <p className="text-slate-300">(0511) 487566</p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-teal-500">
                  <MapPin className="text-white" />
                </div>

                <div className="min-w-0">
                  <h4 className="text-white font-semibold">Alamat</h4>
                  <p className="text-slate-300">
                    Jl. Brigjen H. Hasan Basri, Banjarmasin, Kalimantan Selatan
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          <div className="grid grid-cols-2 gap-2 sm:gap-6">
            <GlassCard className="p-4 sm:p-8 text-center">
              <h2 className="text-3xl sm:text-5xl font-black text-cyan-300">
                50
              </h2>
              <p className="mt-2 sm:mt-3 text-sm sm:text-base text-slate-300">
                Project
              </p>
            </GlassCard>

            <GlassCard className="p-4 sm:p-8 text-center">
              <h2 className="text-3xl sm:text-5xl font-black text-cyan-300">
                1000
              </h2>
              <p className="mt-2 sm:mt-3 text-sm sm:text-base text-slate-300">
                Visitor
              </p>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
