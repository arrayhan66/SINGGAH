import { useNavigate } from "react-router-dom"
import { X, ExternalLink, Eye, Heart, GraduationCap, User, ArrowRight } from "lucide-react"

function ProjectDetailModal({ project, categoryTitle, onClose }) {
  const navigate = useNavigate()
  const isDosen = project.authorType === "dosen"
  const authorName = project.User?.name || project.author?.[0] || "Kreator"
  const categorySlug = project.Category?.slug || project.category
  const coverImage = project.thumbnail || project.image || "https://placehold.co/800x500/0f172a/38bdf8?text=Preview"
  const description = project.description || project.desc || ""
  const technologies = Array.isArray(project.technologies) ? project.technologies : []
  const links = Array.isArray(project.links) ? project.links : []

  function openDetail() {
    onClose()
    navigate(`/karya/${categorySlug}/${project.id}`)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-sky-700/60 bg-gradient-to-b from-sky-950 via-slate-950 to-sky-950 p-6 md:p-8 space-y-6 shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-sky-900/60 hover:bg-sky-800 border border-sky-700/50 flex items-center justify-center text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-3 pr-12">
          <span
            className={`inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
              isDosen
                ? "bg-sky-500/20 text-sky-300 border-sky-400/40"
                : "bg-indigo-600/20 text-indigo-300 border-indigo-500/40"
            }`}
          >
            {isDosen ? <GraduationCap className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
            <span>{isDosen ? "Karya Dosen" : "Karya Mahasiswa"}</span>
          </span>
          <span className="text-xs text-sky-300/70">
            Kategori: {categoryTitle || project.Category?.name || project.category}
          </span>
        </div>

        <h3 className="text-2xl md:text-3xl font-extrabold text-white">{project.title}</h3>

        <div className="rounded-2xl overflow-hidden border border-sky-800/60 bg-black/50 flex items-center justify-center">
          <img
            src={coverImage}
            alt={project.title}
            className="w-full max-h-72 object-contain"
          />
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-sky-300">Deskripsi Karya</h4>
          <p className="text-sm text-slate-100/80 leading-relaxed line-clamp-4">{description}</p>
        </div>

        <div className="bg-sky-900/30 border border-sky-800/50 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-sky-600/30 flex items-center justify-center text-sky-300 font-bold">
              {authorName[0]}
            </div>
            <div>
              <div className="text-sm font-bold text-white">{authorName}</div>
              <div className="text-xs text-sky-300/70">
                {isDosen ? "Dosen / Peneliti" : "Mahasiswa"} • Tahun {project.year || "-"}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs text-sky-300/80">
            <span className="flex items-center space-x-1">
              <Eye className="w-4 h-4 text-sky-400" />
              <span>{project.viewsCount || 0}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Heart className="w-4 h-4 text-red-400" />
              <span>{project.likesCount || 0}</span>
            </span>
          </div>
        </div>

        {technologies.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-sky-300">Teknologi Digunakan</h4>
            <div className="flex flex-wrap gap-2">
              {technologies.map((tech, i) => {
                const label = typeof tech === "string" ? tech : tech?.name
                return (
                  <span
                    key={i}
                    className="text-xs bg-sky-900/60 border border-sky-700/50 px-3 py-1 rounded-lg text-sky-200"
                  >
                    {label}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-sky-900/80 flex items-center justify-end gap-3 flex-wrap">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sm font-medium text-sky-200 transition-colors cursor-pointer"
          >
            Tutup
          </button>

          {links[0]?.url && (
            <a
              href={links[0].url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-sky-900 hover:bg-sky-800 border border-sky-700 text-sm font-semibold text-sky-100 flex items-center space-x-2 transition-colors"
            >
              <span>Kunjungi Demo</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          <button
            onClick={openDetail}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 hover:from-sky-500 hover:to-cyan-300 text-sm font-bold text-white flex items-center space-x-2 shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
          >
            <span>Lihat Detail Lengkap</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetailModal
