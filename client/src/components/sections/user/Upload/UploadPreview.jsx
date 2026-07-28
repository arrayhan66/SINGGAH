import {
  Users,
  LinkIcon,
  Calendar,
  FileText,
  Video,
} from "lucide-react"
import GlassCard from "../../../ui/GlassCard"

function UploadPreview({ formData }) {
  const thumbnailUrl = formData.thumbnail
    ? URL.createObjectURL(formData.thumbnail)
    : null

  const filledTeamMembers = formData.members.filter((m) => m.name.trim())

  return (
    <GlassCard className="p-4 min-[280px]:p-5 sm:p-6 2xl:p-8 3xl:p-10 4xl:p-12">
      <h2 className="text-sm min-[280px]:text-base sm:text-lg 2xl:text-xl 3xl:text-2xl 4xl:text-3xl font-semibold text-white">
        Preview
      </h2>
      <p className="mt-1 text-xs min-[280px]:text-sm text-slate-400 2xl:text-base 3xl:text-lg 4xl:text-xl">
        Begini kira-kira tampilan card project kamu di Hall.
      </p>

      <div className="mt-4 max-w-sm overflow-hidden rounded-xl border border-white/10 bg-white/5">
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

        <div className="flex flex-col gap-2 p-3 min-[280px]:p-4 2xl:p-5 3xl:p-6 min-w-0">
          {/* Kategori badge */}
          {formData.category_id && (
            <span className="w-fit rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-[11px] text-cyan-300 2xl:text-xs 3xl:text-sm">
              Kategori
            </span>
          )}

          {/* Judul */}
          <h3 className="truncate text-sm min-[280px]:text-base sm:text-lg font-semibold text-white 2xl:text-xl 3xl:text-2xl">
            {formData.title || "Judul project belum diisi"}
          </h3>

          {/* Deskripsi */}
          <p className="line-clamp-2 text-xs min-[280px]:text-sm text-slate-400 2xl:text-base 3xl:text-lg">
            {formData.description || "Deskripsi project belum diisi"}
          </p>

          {/* Teknologi */}
          {formData.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {formData.technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-slate-300 2xl:text-xs"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          {/* Info tambahan */}
          <div className="mt-2 flex flex-col gap-1.5 border-t border-white/10 pt-2.5">
            {filledTeamMembers.length > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] min-[280px]:text-xs text-slate-400 min-w-0 2xl:text-sm">
                <Users size={12} className="shrink-0 2xl:size-4" />
                <span className="truncate">
                  {filledTeamMembers.map((m) => m.name).join(", ")}
                </span>
              </div>
            )}
            {formData.year && (
              <div className="flex items-center gap-1.5 text-[11px] min-[280px]:text-xs text-slate-400 2xl:text-sm">
                <Calendar size={12} className="shrink-0 2xl:size-4" />
                <span>{formData.year}</span>
              </div>
            )}
            {formData.links.length > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] min-[280px]:text-xs text-slate-400 min-w-0 2xl:text-sm">
                <LinkIcon size={12} className="shrink-0 2xl:size-4" />
                <span className="truncate">
                  {formData.links.length} link tersedia
                </span>
              </div>
            )}
            {formData.documents.length > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] min-[280px]:text-xs text-slate-400 min-w-0 2xl:text-sm">
                <FileText size={12} className="shrink-0 2xl:size-4" />
                <span className="truncate">
                  {formData.documents.length} dokumen
                </span>
              </div>
            )}
            {formData.videoUrl && (
              <div className="flex items-center gap-1.5 text-[11px] min-[280px]:text-xs text-slate-400 min-w-0 2xl:text-sm">
                <Video size={12} className="shrink-0 2xl:size-4" />
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
