import {
  Users,
  LinkIcon,
  Calendar,
  FileText,
  Video,
  Eye,
} from "lucide-react"
import GlassCard from "../../../ui/GlassCard"

function UploadPreview({ formData, existingThumbnail }) {
  const thumbnailUrl = formData.thumbnail
    ? URL.createObjectURL(formData.thumbnail)
    : existingThumbnail || null

  const filledTeamMembers = formData.members.filter((m) => m.name.trim())

  return (
    <GlassCard className="p-3 min-[280px]:p-5 sm:p-6 2xl:p-8 3xl:p-10 4xl:p-12">
      <div className="flex items-center gap-2">
        <div className="flex shrink-0 h-[clamp(2.5rem,1.5rem+2.5vw,5rem)] w-[clamp(2.5rem,1.5rem+2.5vw,5rem)] items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/30">
          <Eye className="text-cyan-300 h-[clamp(1.25rem,0.75rem+1.25vw,2.5rem)] w-[clamp(1.25rem,0.75rem+1.25vw,2.5rem)]" />
        </div>
        <div>
          <h2 className="text-xs min-[280px]:text-base sm:text-lg 2xl:text-xl 3xl:text-2xl 4xl:text-3xl font-semibold text-white">
            Preview
          </h2>
        </div>
      </div>

      <div className="mt-2 min-[280px]:mt-4 max-w-sm overflow-hidden rounded-xl border border-white/10 bg-white/5">
        {/* Thumbnail */}
        <div className="aspect-video w-full bg-brand-navy">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt="Preview thumbnail"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
              Belum ada thumbnail
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5 min-[280px]:gap-2 p-2.5 min-[280px]:p-4 2xl:p-5 3xl:p-6 min-w-0">
          {/* Kategori badge */}
          {formData.category_id && (
            <span className="w-fit rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[10px] min-[280px]:text-[11px] text-cyan-300 2xl:text-xs 3xl:text-sm">
              Kategori
            </span>
          )}

          {/* Judul */}
          <h3 className="truncate text-xs min-[280px]:text-base sm:text-lg font-semibold text-white 2xl:text-xl 3xl:text-2xl">
            {formData.title || "Judul karya belum diisi"}
          </h3>

          {/* Deskripsi */}
          <p className="line-clamp-2 text-[10px] min-[280px]:text-sm text-slate-400 2xl:text-base 3xl:text-lg">
            {formData.description || "Deskripsi karya belum diisi"}
          </p>

          {/* Teknologi */}
          {formData.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1 min-[280px]:gap-1.5 mt-1">
              {formData.technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full bg-white/10 px-1.5 min-[280px]:px-2 py-0.5 text-[9px] min-[280px]:text-[10px] text-slate-300 2xl:text-xs"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          {/* Info tambahan */}
          <div className="mt-1.5 min-[280px]:mt-2 flex flex-col gap-1 min-[280px]:gap-1.5 border-t border-white/10 pt-2 min-[280px]:pt-2.5">
            {filledTeamMembers.length > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] min-[280px]:text-xs text-slate-400 min-w-0 2xl:text-sm">
                <Users className="h-3.5 w-3.5 shrink-0 2xl:h-4 2xl:w-4" />
                <span className="truncate">
                  {filledTeamMembers.map((m) => m.name).join(", ")}
                </span>
              </div>
            )}
            {formData.year && (
              <div className="flex items-center gap-1.5 text-[10px] min-[280px]:text-xs text-slate-400 2xl:text-sm">
                <Calendar className="h-3.5 w-3.5 shrink-0 2xl:h-4 2xl:w-4" />
                <span>{formData.year}</span>
              </div>
            )}
            {formData.links.length > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] min-[280px]:text-xs text-slate-400 min-w-0 2xl:text-sm">
                <LinkIcon className="h-3.5 w-3.5 shrink-0 2xl:h-4 2xl:w-4" />
                <span className="truncate">
                  {formData.links.length} link tersedia
                </span>
              </div>
            )}
            {formData.documents.length > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] min-[280px]:text-xs text-slate-400 min-w-0 2xl:text-sm">
                <FileText className="h-3.5 w-3.5 shrink-0 2xl:h-4 2xl:w-4" />
                <span className="truncate">
                  {formData.documents.length} dokumen
                </span>
              </div>
            )}
            {formData.videoUrl && (
              <div className="flex items-center gap-1.5 text-[10px] min-[280px]:text-xs text-slate-400 min-w-0 2xl:text-sm">
                <Video className="h-3.5 w-3.5 shrink-0 2xl:h-4 2xl:w-4" />
                <span className="truncate">Video demo tersedia</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

export default UploadPreview
