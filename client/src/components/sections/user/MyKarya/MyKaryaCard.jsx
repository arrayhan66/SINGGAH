import {
  Pencil,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../../../ui/GlassCard";
import { imageUrl } from "../../../../utils/imageUrl";

const statusConfig = {
  pending: {
    label: "Menunggu Review",
    icon: Clock,
    className: "border-amber-400/30 bg-brand-navy/80 text-amber-300",
  },
  published: {
    label: "Disetujui",
    icon: CheckCircle2,
    className: "border-emerald-400/30 bg-brand-navy/80 text-emerald-300",
  },
  rejected: {
    label: "Ditolak",
    icon: XCircle,
    className: "border-red-400/30 bg-brand-navy/80 text-red-300",
  },
};

const categoryLabels = {
  website: "Website",
  mobile: "Mobile App",
  iot: "IoT",
  ai: "AI",
  data: "Data Science",
  cybersecurity: "Cyber Security",
  ux: "UI/UX Design",
  robotika: "Robotika",
  energi: "Energi",
  otomasi: "Otomasi",
};

function MyKaryaCard({ karya, onDeleteClick, isDosen = false, isDeleting = false }) {
  const navigate = useNavigate();

  const showEdit = true;
  const status = statusConfig[isDosen ? "published" : karya.status] || statusConfig.published;
  const StatusIcon = status.icon;

  const year = karya.year || (karya.createdAt ? new Date(karya.createdAt).getFullYear() : "");
  const categorySlug = karya.Category?.slug || karya.category || "";
  const categoryLabel = karya.Category?.name || categoryLabels[karya.category] || karya.category;
  const rawTechnologies = karya.technologies || karya.techStack || [];
  const technologies = rawTechnologies
    .map((tech) => (typeof tech === "string" ? tech : tech?.name || ""))
    .filter(Boolean);
  const projectSlug = karya.slug || karya.id;
  const firstAdditionalImage =
    Array.isArray(karya.images) && karya.images.length > 0
      ? karya.images[0]?.image_url || karya.images[0]
      : null;
  const coverImage = karya.thumbnail || firstAdditionalImage;

  function handleDetail(e) {
    if (e) e.stopPropagation();
    if (projectSlug) {
      navigate(`/karya/${categorySlug}/${projectSlug}`);
    }
  }

  function handleEdit(e) {
    e.stopPropagation();
    navigate(`/edit-karya/${karya.slug || karya.id}`);
  }

  function handleDelete(e) {
    e.stopPropagation();
    onDeleteClick(karya);
  }

  return (
    <GlassCard
      hover
      onClick={projectSlug ? handleDetail : undefined}
      className="group flex h-full flex-col overflow-hidden p-0"
    >
      {/* Cover */}
      <div className="relative overflow-hidden">
        <img
          src={imageUrl(coverImage)}
          alt={karya.title}
          className="h-40 w-full object-cover transition-all duration-500 sm:h-48 md:h-52 lg:h-56 xl:h-60 3xl:h-72 4xl:h-80"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-transparent to-transparent" />

        <span
          className={`absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium text-cyan-300 backdrop-blur-sm sm:left-4 sm:top-4 sm:px-3 sm:py-1 sm:text-xs md:left-5 md:top-5 md:px-4 md:py-1.5 md:text-sm 3xl:text-sm 4xl:px-5 4xl:py-2 4xl:text-base ${status.className}`}
        >
          <StatusIcon
            size={12}
            className="sm:size-[13px] md:size-3.5 lg:size-4 3xl:size-[18px] 4xl:size-5"
          />
          {status.label}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5 md:p-6 lg:p-7 xl:p-8 3xl:p-9 4xl:p-10">
        {/* Category + Year */}
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {categoryLabel && (
            <span className="rounded-md bg-cyan-400/10 px-2 py-0.5 text-[10px] font-medium text-cyan-300 sm:text-xs">
              {categoryLabel}
            </span>
          )}
          {year && (
            <span className="flex items-center gap-1 text-[10px] text-slate-400 sm:text-xs">
              <Calendar size={10} className="sm:size-3" />
              {year}
            </span>
          )}
        </div>

        <h3 className="text-base font-bold text-white sm:text-lg md:text-xl lg:text-2xl xl:text-2xl 3xl:text-3xl 4xl:text-4xl">
          {karya.title}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-300 sm:mt-2.5 sm:text-sm sm:leading-6 md:mt-3 md:text-base md:leading-7 lg:text-base 3xl:mt-4 3xl:text-lg 3xl:leading-8 4xl:text-xl 4xl:leading-9">
          {karya.description || karya.shortDescription}
        </p>

        {/* Technology tags */}
        {technologies.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4">
            {technologies.slice(0, 2).map((tech) => (
              <span
                key={tech}
                className="rounded-md border border-slate-700/50 bg-slate-800/50 px-2 py-0.5 text-[10px] text-slate-300 sm:text-xs"
              >
                {tech}
              </span>
            ))}
            {technologies.length > 2 && (
              <span className="text-[10px] text-slate-500 sm:text-xs">
                +{technologies.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Rejection reason */}
        {!isDosen && karya.status === "rejected" && karya.rejection_reason && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-xs sm:mt-4 sm:text-sm md:text-sm text-red-300 3xl:mt-5 3xl:p-4 3xl:text-base 4xl:text-lg">
            <AlertTriangle
              size={16}
              className="mt-0.5 shrink-0 sm:size-[18px] md:size-5 3xl:size-[22px] 4xl:size-6"
            />
            <span><span className="font-semibold">Alasan Penolakan:</span> {karya.rejection_reason}</span>
          </div>
        )}

        {/* Approve note */}
        {!isDosen && karya.status === "published" && karya.approve_note && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-xs sm:mt-4 sm:text-sm md:text-sm text-emerald-300 3xl:mt-5 3xl:p-4 3xl:text-base 4xl:text-lg">
            <CheckCircle2
              size={16}
              className="mt-0.5 shrink-0 sm:size-[18px] md:size-5 3xl:size-[22px] 4xl:size-6"
            />
            <span>Catatan Admin: {karya.approve_note}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-auto flex items-center gap-3 pt-5 sm:pt-6 md:pt-7 lg:pt-8 3xl:pt-9 4xl:pt-10">
          {showEdit && (
            <button
              type="button"
              onClick={handleEdit}
              className="group/btn flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-xs font-semibold text-slate-900 transition-colors duration-300 hover:bg-slate-200 sm:py-3 sm:text-sm md:text-sm lg:py-3.5 lg:text-base 3xl:py-4 3xl:text-base 4xl:py-5 4xl:text-lg"
            >
              <Pencil
                size={14}
                className="sm:size-[15px] md:size-4 lg:size-[18px] 3xl:size-5 4xl:size-[22px]"
              />
              Edit
            </button>
          )}

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="group/btn flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 text-xs font-semibold text-white transition-colors duration-300 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70 sm:py-3 sm:text-sm md:text-sm lg:py-3.5 lg:text-base 3xl:py-4 3xl:text-base 4xl:py-5 4xl:text-lg"
          >
            {isDeleting ? (
              <Loader2
                size={14}
                className="animate-spin sm:size-[15px] md:size-4 lg:size-[18px] 3xl:size-5 4xl:size-[22px]"
              />
            ) : (
              <Trash2
                size={14}
                className="sm:size-[15px] md:size-4 lg:size-[18px] 3xl:size-5 4xl:size-[22px]"
              />
            )}
            {isDeleting ? "Menghapus" : "Hapus"}
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

export default MyKaryaCard;
