import { ExternalLink, FileText } from "lucide-react";
import { toEmbedUrl } from "../../../../utils/videoUrl";
import { openDocument } from "../../../../utils/projectDocument";

function KaryaProjectContent({ project }) {
  const descriptionText = project.description || "";
  const techStack = Array.isArray(project.technologies)
    ? project.technologies
    : [];
  const links = Array.isArray(project.links) ? project.links : [];
  const documents = Array.isArray(project.documents) ? project.documents : [];
  const videos = Array.isArray(project.videos) ? project.videos : [];
  const members = Array.isArray(project.members) ? project.members : [];

  function renderLinkItem(link) {
    return (
      <a
        key={link.id || link.url}
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 min-[350px]:px-4 min-[350px]:py-2.5 min-[350px]:text-sm sm:w-auto 2xl:px-5 2xl:py-3 2xl:text-base"
      >
        <ExternalLink size={14} className="shrink-0 2xl:size-4" />
        <span className="truncate">{link.label}</span>
      </a>
    );
  }

  function renderDocumentItem(doc) {
    return (
      <button
        key={doc.id || doc.file_url}
        type="button"
        onClick={() => openDocument(doc)}
        className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-800 min-[350px]:px-4 min-[350px]:py-2.5 min-[350px]:text-sm sm:w-auto sm:justify-start 2xl:px-5 2xl:py-3 2xl:text-base"
      >
        <FileText size={14} className="shrink-0 2xl:size-4" />
        <span className="truncate">{doc.name}</span>
      </button>
    );
  }

  return (
    <div className="space-y-6 text-slate-300">
      {descriptionText && (
        <p className="text-sm font-medium leading-relaxed text-slate-200 sm:text-base lg:text-lg">
          {descriptionText}
        </p>
      )}

      {/* Team Members */}
      {members.length > 0 && (
        <div className="border-t border-white/10 pt-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white sm:text-sm">
            Tim Pengembang
          </h3>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => (
              <span
                key={m.id}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300"
              >
                {m.name}
                {m.role && (
                  <span className="ml-2 text-xs text-slate-500">
                    ({m.role})
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      {links.length > 0 && (
        <div className="flex flex-col items-stretch gap-2.5 pt-2 sm:flex-row sm:flex-wrap 2xl:gap-4">
          {links.map(renderLinkItem)}
        </div>
      )}

      {/* Video */}
      {videos.length > 0 && (
        <div className="mt-8 space-y-6 2xl:mt-10">
          {videos.map((vid) => (
            <div
              key={vid.id}
              className="aspect-video w-full overflow-hidden rounded-xl"
            >
              <iframe
                src={toEmbedUrl(vid.video_url)}
                title="Video Demo"
                className="h-full w-full border-0"
                allowFullScreen
              />
            </div>
          ))}
        </div>
      )}

      {/* Documents */}
      {documents.length > 0 && (
        <div className="mt-8 2xl:mt-10">
          <h3 className="mb-3 text-sm font-semibold text-slate-300 2xl:text-base">
            Dokumen Pendukung
          </h3>
          <div className="flex flex-col gap-2.5 sm:gap-2 2xl:gap-3">
            {documents.map(renderDocumentItem)}
          </div>
        </div>
      )}

      {/* Technologies */}
      {techStack.length > 0 && (
        <div className="border-t border-white/10 pt-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white sm:text-sm">
            Teknologi yang Digunakan
          </h3>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {techStack.map((tech, index) => (
              <span
                key={index}
                className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 sm:px-3"
              >
                {typeof tech === "string" ? tech : tech?.name || ""}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default KaryaProjectContent;
