import { Link } from "react-router-dom"
import { ArrowRight, User, Calendar } from "lucide-react"
import GlassCard from "../../ui/GlassCard"
import { karyaCategories } from "../../../data/karyaData"

function KaryaProjectCard({ project }) {
  const category = karyaCategories.find(
    (item) => item.slug === project.category,
  )

  return (
    <GlassCard hover className="group flex flex-col overflow-hidden p-0">
      <div className="relative overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-transparent to-transparent" />

        {category && (
          <span className="absolute left-4 top-4 rounded-full border border-cyan-400/30 bg-brand-navy/70 px-3 py-1 text-xs font-medium text-cyan-300 backdrop-blur-sm">
            {category.title}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <h3 className="text-xl font-bold text-white sm:text-2xl">
          {project.title}
        </h3>

        <p className="mt-3 line-clamp-2 leading-7 text-slate-300">
          {project.desc}
        </p>

        <div className="mt-6 flex items-center gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-1.5">
            <User size={14} />
            {project.author}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            {project.year}
          </span>
        </div>

        <Link
          to={`/karya/${project.category}/${project.id}`}
          className="group/btn mt-6 flex items-center justify-center gap-2 rounded-xl border border-cyan-400/30 py-3 text-sm font-medium text-cyan-300 transition-colors duration-300 hover:bg-cyan-400 hover:text-black"
        >
          Lihat Detail
          <ArrowRight
            size={16}
            className="transition-transform duration-300 group-hover/btn:translate-x-1"
          />
        </Link>
      </div>
    </GlassCard>
  )
}

export default KaryaProjectCard
