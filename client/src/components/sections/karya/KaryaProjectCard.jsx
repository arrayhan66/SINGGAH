import { Link, useNavigate } from "react-router-dom"
import {
  ArrowRight,
  User,
  Calendar,
  Heart,
  Eye,
  Bookmark,
  MessageSquare,
} from "lucide-react"
import GlassCard from "../../ui/GlassCard"
import { karyaCategories } from "../../../data/karyaData"

function KaryaProjectCard({ project }) {
  const navigate = useNavigate()

  const category = karyaCategories.find(
    (item) => item.slug === project.category,
  )

  const coverImage =
    Array.isArray(project.images) && project.images.length > 0
      ? project.images[0]
      : project.image

  const authorLabel = Array.isArray(project.author)
    ? project.author.length > 1
      ? `${project.author[0]} +${project.author.length - 1}`
      : project.author[0]
    : project.author

  return (
    <GlassCard
      hover
      className="group flex h-full flex-col overflow-hidden p-0 !cursor-default"
    >
      <div className="relative overflow-hidden">
        <img
          src={coverImage}
          alt={project.title}
          className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-110 2xl:h-64"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-transparent to-transparent" />

        {category && (
          <span className="absolute left-4 top-4 z-10 rounded-full border border-cyan-400/30 bg-brand-navy/80 px-3 py-1 text-xs font-medium text-cyan-300 backdrop-blur-sm 2xl:left-5 2xl:top-5 2xl:px-4 2xl:py-1.5 2xl:text-sm">
            {category.title}
          </span>
        )}

        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            navigate("/login")
          }}
          aria-label="Bookmark"
          className="absolute right-4 top-4 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-brand-navy/80 text-slate-200 backdrop-blur-sm transition hover:scale-110 hover:text-cyan-300 2xl:right-5 2xl:top-5 2xl:h-10 2xl:w-10"
        >
          <Bookmark
            size={16}
            className={`transition-colors 2xl:size-5 ${
              project.isBookmarked ? "fill-cyan-300 text-cyan-300" : ""
            }`}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-8 2xl:p-10">
        <h3 className="text-xl font-bold text-white sm:text-2xl 2xl:text-3xl">
          {project.title}
        </h3>

        <p className="mt-3 line-clamp-2 leading-7 text-slate-300 2xl:mt-4 2xl:text-lg 2xl:leading-8">
          {project.desc}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-400 2xl:mt-6 2xl:gap-5 2xl:text-base">
          {authorLabel && (
            <span className="flex items-center gap-1.5">
              <User size={14} className="2xl:size-4" />
              {authorLabel}
            </span>
          )}
          {project.year && (
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="2xl:size-4" />
              {project.year}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center gap-5 border-t border-slate-700/50 pt-4 text-sm text-slate-400 2xl:mt-5 2xl:gap-6 2xl:pt-5 2xl:text-base">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              navigate("/login")
            }}
            className="group/action flex cursor-pointer items-center gap-1.5 transition-colors hover:text-pink-400"
          >
            <Heart
              size={16}
              className={`transition-transform group-hover/action:scale-110 2xl:size-5 ${
                project.isLiked ? "fill-pink-500 text-pink-500" : ""
              }`}
            />
            <span>{project.likesCount || 0}</span>
          </button>

          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              navigate("/login")
            }}
            className="group/action flex cursor-pointer items-center gap-1.5 transition-colors hover:text-cyan-300"
          >
            <MessageSquare
              size={16}
              className="transition-transform group-hover/action:scale-110 2xl:size-5"
            />
            <span>{project.commentsCount || 0}</span>
          </button>

          <span className="ml-auto flex items-center gap-1.5 text-slate-500">
            <Eye size={16} className="2xl:size-5" />
            <span>{project.viewsCount || 0}</span>
          </span>
        </div>

        <div className="mt-auto pt-6 2xl:pt-8">
          <Link
            to={`/karya/${project.category}/${project.slug}`}
            className="group/btn flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-slate-900 transition-colors duration-300 hover:bg-slate-200 2xl:py-4 2xl:text-base"
          >
            Lihat Detail
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover/btn:translate-x-1 2xl:size-[18px]"
            />
          </Link>
        </div>
      </div>
    </GlassCard>
  )
}

export default KaryaProjectCard
