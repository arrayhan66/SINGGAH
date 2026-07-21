import { useParams, useNavigate, Link } from "react-router-dom"
import { ArrowLeft, User, Calendar, Layers } from "lucide-react"
import DustBackground from "../../ui/DustBackground"
import GlowBackground from "../../ui/GlowBackground"
import GlassCard from "../../ui/GlassCard"
import { karyaCategories, karyaProjects } from "../../../data/karyaData"

function KaryaProjectDetailSection() {
  const { slug, id } = useParams()
  const navigate = useNavigate()

  const category = karyaCategories.find((item) => item.slug === slug)
  const project = karyaProjects.find(
    (item) => item.category === slug && String(item.id) === id,
  )

  if (!category || !project) {
    return (
      <section className="relative overflow-hidden bg-brand-navy py-32 text-center">
        <p className="text-slate-300">Karya tidak ditemukan.</p>
        <button
          onClick={() => navigate("/karya")}
          className="mt-6 rounded-xl border border-cyan-400/30 px-5 py-3 text-cyan-300 transition hover:bg-cyan-400 hover:text-black"
        >
          Kembali ke Karya
        </button>
      </section>
    )
  }

  return (
    <section
      id="karya-project-detail"
      className="relative overflow-hidden bg-brand-navy pt-28 pb-16 sm:pt-32 lg:pt-36"
    >
      <GlowBackground />
      <DustBackground />

      <div className="mx-auto max-w-5xl px-5 sm:px-8 relative">
        <Link
          to={`/karya/${slug}`}
          className="group absolute left-5 top-0 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-2 pl-3 pr-4 text-sm text-slate-300 backdrop-blur-sm transition-colors duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300 sm:left-8"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 transition-colors duration-300 group-hover:bg-cyan-400/20">
            <ArrowLeft
              size={14}
              className="transition-transform duration-300 group-hover:-translate-x-0.5"
            />
          </span>
          Kembali
        </Link>

        <GlassCard className="overflow-hidden p-0">
          <img
            src={project.image}
            alt={project.title}
            className="h-64 w-full object-cover sm:h-80 lg:h-96"
          />

          <div className="p-6 sm:p-10">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 px-3 py-1 text-xs font-medium text-cyan-300">
              <Layers size={12} />
              {category.title}
            </span>

            <h1 className="mt-4 text-2xl font-black text-white sm:text-3xl lg:text-4xl">
              {project.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <User size={14} />
                {project.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {project.year}
              </span>
            </div>

            <p className="mt-6 leading-8 text-slate-300">{project.desc}</p>
          </div>
        </GlassCard>
      </div>
    </section>
  )
}

export default KaryaProjectDetailSection
