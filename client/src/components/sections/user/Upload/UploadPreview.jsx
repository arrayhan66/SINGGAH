import { Users, LinkIcon, Calendar } from "lucide-react"
import GlassCard from "../../../ui/GlassCard"

const categoryLabels = {
  iot: "Internet of Things",
  robotika: "Robotika",
  kendali: "Sistem Kendali",
  energi: "Energi Terbarukan",
  elektronika: "Elektronika",
  otomasi: "Otomasi Industri",
}

function UploadPreview({ formData }) {
  const thumbnailUrl = formData.thumbnail
    ? URL.createObjectURL(formData.thumbnail)
    : null

  const filledTeamMembers = formData.teamMembers.filter((m) => m.trim())

  return (
    <GlassCard className="p-5 md:p-6">
      <h2 className="text-sm min-[350px]:text-base md:text-lg font-semibold text-white">
        Preview
      </h2>
      <p className="mt-1 text-xs md:text-sm text-slate-400">
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

        <div className="flex flex-col gap-2 p-4 min-w-0">
          {/* Kategori badge */}
          {formData.category && (
            <span className="w-fit rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-[11px] text-cyan-300">
              {categoryLabels[formData.category] || formData.category}
            </span>
          )}

          {/* Judul */}
          <h3 className="truncate text-sm md:text-base font-semibold text-white">
            {formData.title || "Judul project belum diisi"}
          </h3>

          {/* Deskripsi singkat */}
          <p className="line-clamp-2 text-xs md:text-sm text-slate-400">
            {formData.shortDescription || "Deskripsi singkat belum diisi"}
          </p>

          {/* Teknologi */}
          {formData.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {formData.technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-slate-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          {/* Info tambahan */}
          <div className="mt-2 flex flex-col gap-1.5 border-t border-white/10 pt-2.5">
            {filledTeamMembers.length > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 min-w-0">
                <Users size={12} className="shrink-0" />
                <span className="truncate">{filledTeamMembers.join(", ")}</span>
              </div>
            )}
            {formData.year && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Calendar size={12} className="shrink-0" />
                <span>{formData.year}</span>
              </div>
            )}
            {formData.externalLink && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 min-w-0">
                <LinkIcon size={12} className="shrink-0" />
                <span className="truncate">{formData.externalLink}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

export default UploadPreview
