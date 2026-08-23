import { useEffect, useState } from "react";
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
import PCBBackground from "../ui/PCBBackground"
import GlassCard from "../ui/GlassCard"
import api from "../../services/api"

function About() {
  const [stats, setStats] = useState([
    { num: "-", label: "Project" },
    { num: "-", label: "Visitor" },
  ])
  const [settings, setSettings] = useState({})

  useEffect(() => {
    api.get("/settings")
      .then((res) => {
        const d = res.data.data || res.data || {}
        setSettings(d)
      })
      .catch((err) => {
        console.error("Failed to fetch settings:", err)
      })
  }, [])

  useEffect(() => {
    api.get("/stats")
      .then((res) => {
        const d = res.data.data || res.data
        setStats([
          { num: String(d.totalProject ?? "-"), label: "Project" },
          { num: String(d.totalVisitors ?? "-"), label: "Visitor" },
        ])
      })
      .catch((err) => {
        console.error("Failed to fetch stats:", err)
      })
  }, [])
  return (
    <section
      id="about"
      className="relative overflow-hidden bg-brand-dark pt-[calc(var(--navbar-h)+16px)] sm:pt-[calc(var(--navbar-h)+24px)] pb-12 lg:pb-16 2xl:pb-32 3xl:pb-24 4xl:pb-32"
    >
      <GlowBackground />
      <PCBBackground />
      <DustBackground />

      <div className="mx-auto w-full max-w-7xl px-4 min-[280px]:px-5 min-[350px]:px-6 sm:px-8 lg:px-12 2xl:max-w-7xl 2xl:px-16 3xl:max-w-[1600px] 3xl:px-20 4xl:max-w-[2000px] 4xl:px-24">
        <div>
          <h2 className="mt-8 text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl 2xl:text-7xl 3xl:text-7xl 4xl:text-8xl">
            Wadah <span className="text-cyan-300">Inovasi</span>
            <br />
            Mahasiswa
          </h2>

          <p className="mt-6 text-justify text-base leading-relaxed text-slate-300 lg:mt-8 lg:text-lg 2xl:mt-10 2xl:text-2xl 2xl:leading-loose 3xl:mt-12 3xl:text-3xl 3xl:leading-loose 4xl:mt-14 4xl:text-4xl 4xl:leading-loose">
            {settings.siteDescription ||
              "PamerIT merupakan platform digital yang menampilkan berbagai karya terbaik mahasiswa di bidang teknologi informasi. Pengunjung dapat mengeksplorasi project secara interaktif layaknya memasuki sebuah exhibition hall virtual."}
          </p>
        </div>

        {/* 2. HUBUNGI KAMI */}
        <div className="mt-10 lg:mt-12">
          <GlassCard className="group relative p-3 min-[280px]:p-5 sm:p-8 2xl:p-12 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-cyan-500/50 hover:bg-slate-900/30 3xl:p-14 4xl:p-16">
            <h3 className="text-xl font-bold text-white transition-colors duration-500 group-hover:text-cyan-200 sm:text-3xl 2xl:text-4xl 3xl:text-5xl 4xl:text-6xl">
              Hubungi Kami
            </h3>

            <div className="mt-4 space-y-4 min-[280px]:mt-6 min-[280px]:space-y-6 sm:mt-10 sm:space-y-8 2xl:mt-12 2xl:space-y-10 3xl:mt-14 3xl:space-y-12 4xl:mt-16 4xl:space-y-14">
              <div className="group/item flex items-center gap-3 min-[280px]:gap-5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:pl-2 2xl:gap-8 3xl:gap-10 4xl:gap-12">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/item:bg-cyan-500/20 group-hover/item:border-cyan-400 group-hover/item:text-cyan-300 min-[280px]:h-14 min-[280px]:w-14 2xl:h-20 2xl:w-20 2xl:rounded-2xl 3xl:h-24 3xl:w-24 4xl:h-28 4xl:w-28">
                  <Mail className="h-5 w-5 min-[280px]:h-6 min-[280px]:w-6 2xl:h-8 2xl:w-8 3xl:h-10 3xl:w-10 4xl:h-12 4xl:w-12" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-white/90 transition-colors duration-300 group-hover/item:text-cyan-300 2xl:text-2xl 3xl:text-3xl 4xl:text-4xl">
                    Email
                  </h4>
                  <p className="break-all text-xs min-[280px]:text-sm text-slate-300 sm:text-base 2xl:mt-2 2xl:text-xl 3xl:text-2xl 4xl:mt-3 4xl:text-3xl">
                    {settings.email || "elektro@poliban.ac.id"}
                  </p>
                </div>
              </div>

              <div className="group/item flex items-center gap-3 min-[280px]:gap-5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:pl-2 2xl:gap-8 3xl:gap-10 4xl:gap-12">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/item:bg-cyan-500/20 group-hover/item:border-cyan-400 group-hover/item:text-cyan-300 min-[280px]:h-14 min-[280px]:w-14 2xl:h-20 2xl:w-20 2xl:rounded-2xl 3xl:h-24 3xl:w-24 4xl:h-28 4xl:w-28">
                  <Phone className="h-5 w-5 min-[280px]:h-6 min-[280px]:w-6 2xl:h-8 2xl:w-8 3xl:h-10 3xl:w-10 4xl:h-12 4xl:w-12" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-white/90 transition-colors duration-300 group-hover/item:text-cyan-300 2xl:text-2xl 3xl:text-3xl 4xl:text-4xl">
                    Telepon
                  </h4>
                  <p className="text-xs min-[280px]:text-sm text-slate-300 sm:text-base 2xl:mt-2 2xl:text-xl 3xl:text-2xl 4xl:mt-3 4xl:text-3xl">
                    {settings.phone || "(0511) 487566"}
                  </p>
                </div>
              </div>

              <div className="group/item flex items-center gap-3 min-[280px]:gap-5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:pl-2 2xl:gap-8 3xl:gap-10 4xl:gap-12">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/item:bg-teal-500/20 group-hover/item:border-teal-400 group-hover/item:text-teal-300 min-[280px]:h-14 min-[280px]:w-14 2xl:h-20 2xl:w-20 2xl:rounded-2xl 3xl:h-24 3xl:w-24 4xl:h-28 4xl:w-28">
                  <MapPin className="h-5 w-5 min-[280px]:h-6 min-[280px]:w-6 2xl:h-8 2xl:w-8 3xl:h-10 3xl:w-10 4xl:h-12 4xl:w-12" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-white/90 transition-colors duration-300 group-hover/item:text-teal-300 2xl:text-2xl 3xl:text-3xl 4xl:text-4xl">
                    Alamat
                  </h4>
                  <p className="text-xs min-[280px]:text-sm text-slate-300 sm:text-base 2xl:mt-2 2xl:text-xl 3xl:text-2xl 4xl:mt-3 4xl:text-3xl">
                    {settings.address ||
                      "Jl. Brigjen H. Hasan Basri, Banjarmasin, Kalimantan Selatan"}
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* 3. 4 KARTU KECIL */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 2xl:mt-16 2xl:gap-10 3xl:mt-20 3xl:gap-12 4xl:mt-24 4xl:gap-14">
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
                className="group relative p-4 sm:p-6 2xl:p-8 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-cyan-500/40 hover:bg-white/[0.02] 3xl:p-10 4xl:p-12"
              >
                <div className="text-cyan-400 transition-colors duration-500 group-hover:text-cyan-300">
                  <IconEl className="h-7 w-7 sm:h-[38px] sm:w-[38px] 2xl:h-[48px] 2xl:w-[48px] 3xl:h-14 3xl:w-14 4xl:h-16 4xl:w-16" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-white transition-colors duration-500 group-hover:text-cyan-200 2xl:mt-6 2xl:text-3xl 3xl:text-4xl 3xl:mt-8 4xl:text-5xl 4xl:mt-10">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm text-slate-300 leading-relaxed transition-colors duration-500 group-hover:text-slate-200 sm:text-base 2xl:text-lg 3xl:text-xl 3xl:mt-4 4xl:text-2xl 4xl:mt-5">
                  {item.desc}
                </p>
              </GlassCard>
            )
          })}
        </div>

        {/* 4. KOTAK STATISTIK */}
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 2xl:mt-16 2xl:gap-10 3xl:mt-20 3xl:gap-12 4xl:mt-24 4xl:gap-14">
          {stats.map((stat, idx) => (
            <GlassCard
              key={idx}
              className="group relative flex flex-col items-center justify-center p-4 sm:p-8 2xl:p-12 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-cyan-500/40 hover:bg-white/[0.02] 3xl:p-16 4xl:p-20"
            >
              <h2 className="m-0 text-center text-3xl font-black text-cyan-300 transition-colors duration-500 group-hover:text-white sm:text-5xl 2xl:text-7xl 3xl:text-8xl 4xl:text-9xl">
                {stat.num}
              </h2>
              <p className="m-0 mt-2 text-center text-sm text-slate-300 transition-colors duration-500 group-hover:text-cyan-300 sm:mt-3 sm:text-base 2xl:mt-4 2xl:text-2xl 3xl:text-3xl 3xl:mt-5 4xl:text-4xl 4xl:mt-6">
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
