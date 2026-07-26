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
      className="relative overflow-hidden bg-brand-dark pt-[calc(var(--navbar-h)+24px)] pb-12 lg:pb-16 2xl:pb-32"
    >
      <GlowBackground />
      <DustBackground />

      <div className="mx-auto w-full max-w-7xl px-4 min-[280px]:px-5 min-[350px]:px-6 sm:px-8 lg:px-12 2xl:max-w-7xl 2xl:px-16">
        <div>
          <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl 2xl:text-7xl">
            Wadah <span className="text-cyan-300">Inovasi</span>
            <br />
            Mahasiswa
          </h2>

          <p className="mt-6 text-justify text-base leading-relaxed text-slate-300 lg:mt-8 lg:text-lg 2xl:mt-10 2xl:text-2xl 2xl:leading-loose">
            Pamer<span className="text-cyan-300">IT</span> merupakan platform
            digital yang menampilkan berbagai karya terbaik mahasiswa di bidang
            teknologi informasi. Pengunjung dapat mengeksplorasi project secara
            interaktif layaknya memasuki sebuah exhibition hall virtual.
          </p>
        </div>

        {/* 2. HUBUNGI KAMI */}
        <div className="mt-10 lg:mt-12">
          <GlassCard className="group relative p-5 sm:p-8 2xl:p-12 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-cyan-500/50 hover:bg-slate-900/30">
            <h3 className="text-xl font-bold text-white transition-colors duration-500 group-hover:text-cyan-200 sm:text-3xl 2xl:text-4xl">
              Hubungi Kami
            </h3>

            <div className="mt-6 space-y-6 sm:mt-10 sm:space-y-8 2xl:mt-12 2xl:space-y-10">
              <div className="group/item flex items-center gap-5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:pl-2 2xl:gap-8">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/item:bg-cyan-500/20 group-hover/item:border-cyan-400 group-hover/item:text-cyan-300 2xl:h-20 2xl:w-20 2xl:rounded-2xl">
                  <Mail className="h-6 w-6 2xl:h-8 2xl:w-8" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-white/90 transition-colors duration-300 group-hover/item:text-cyan-300 2xl:text-2xl">
                    Email
                  </h4>
                  <p className="break-all text-sm text-slate-300 sm:text-base 2xl:mt-2 2xl:text-xl">
                    elektro@poliban.ac.id
                  </p>
                </div>
              </div>

              <div className="group/item flex items-center gap-5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:pl-2 2xl:gap-8">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/item:bg-cyan-500/20 group-hover/item:border-cyan-400 group-hover/item:text-cyan-300 2xl:h-20 2xl:w-20 2xl:rounded-2xl">
                  <Phone className="h-6 w-6 2xl:h-8 2xl:w-8" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-white/90 transition-colors duration-300 group-hover/item:text-cyan-300 2xl:text-2xl">
                    Telepon
                  </h4>
                  <p className="text-sm text-slate-300 sm:text-base 2xl:mt-2 2xl:text-xl">
                    (0511) 487566
                  </p>
                </div>
              </div>

              <div className="group/item flex items-center gap-5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:pl-2 2xl:gap-8">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/item:bg-teal-500/20 group-hover/item:border-teal-400 group-hover/item:text-teal-300 2xl:h-20 2xl:w-20 2xl:rounded-2xl">
                  <MapPin className="h-6 w-6 2xl:h-8 2xl:w-8" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-white/90 transition-colors duration-300 group-hover/item:text-teal-300 2xl:text-2xl">
                    Alamat
                  </h4>
                  <p className="text-sm text-slate-300 sm:text-base 2xl:mt-2 2xl:text-xl">
                    Jl. Brigjen H. Hasan Basri, Banjarmasin, Kalimantan Selatan
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* 3. 4 KARTU KECIL */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 2xl:mt-16 2xl:gap-10">
          {[
            {
              icon: GraduationCap,
              title: "Edukasi",
              desc: "Media pembelajaran dan publikasi karya mahasiswa.",
            },
            {
              icon: Rocket,
              title: "Inovasi",
              desc: "Menampilkan solusi digital yang kreatif dan modern.",
            },
            {
              icon: Users,
              title: "Kolaborasi",
              desc: "Menghubungkan mahasiswa, dosen dan industri.",
            },
            {
              icon: Trophy,
              title: "Prestasi",
              desc: "Mengapresiasi project terbaik setiap tahunnya.",
            },
          ].map((item, idx) => {
            const IconEl = item.icon
            return (
              <GlassCard
                key={idx}
                className="group relative p-4 sm:p-6 2xl:p-8 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-cyan-500/40 hover:bg-white/[0.02]"
              >
                <div className="text-cyan-400 transition-colors duration-500 group-hover:text-cyan-300">
                  <IconEl className="h-7 w-7 sm:h-[38px] sm:w-[38px] 2xl:h-[48px] 2xl:w-[48px]" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-white transition-colors duration-500 group-hover:text-cyan-200 2xl:mt-6 2xl:text-3xl">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm text-slate-300 leading-relaxed transition-colors duration-500 group-hover:text-slate-200 sm:text-base 2xl:text-lg">
                  {item.desc}
                </p>
              </GlassCard>
            )
          })}
        </div>

        {/* 4. KOTAK STATISTIK */}
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 2xl:mt-16 2xl:gap-10">
          {[
            { num: "50", label: "Project" },
            { num: "1000", label: "Visitor" },
          ].map((stat, idx) => (
            <GlassCard
              key={idx}
              className="group relative flex flex-col items-center justify-center p-4 sm:p-8 2xl:p-12 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-cyan-500/40 hover:bg-white/[0.02]"
            >
              <h2 className="m-0 text-center text-3xl font-black text-cyan-300 transition-colors duration-500 group-hover:text-white sm:text-5xl 2xl:text-7xl">
                {stat.num}
              </h2>
              <p className="m-0 mt-2 text-center text-sm text-slate-300 transition-colors duration-500 group-hover:text-cyan-300 sm:mt-3 sm:text-base 2xl:mt-4 2xl:text-2xl">
                {stat.label}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  )
}

export default About
