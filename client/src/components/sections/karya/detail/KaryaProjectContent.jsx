import { ExternalLink, FileText, Globe, GitBranch } from "lucide-react";

function KaryaProjectContent({ project }) {
  const descriptionText = project.desc || project.description;
  const techStack = project.techStack || project.technologies || [];
  const links = Array.isArray(project.links) ? project.links : [];
  const documents = Array.isArray(project.documents) ? project.documents : [];

  function renderLinkItem(link) {
    return (
      <a
        key={link.url}
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-cyan-400/30 px-4 py-2.5 text-sm font-medium text-cyan-300 transition hover:bg-cyan-400 hover:text-black sm:w-auto 2xl:px-5 2xl:py-3 2xl:text-base"
      >
        <ExternalLink size={14} className="2xl:size-4" />
        {link.label}
      </a>
    );
  }

  function renderDocumentItem(doc) {
    return (
      <a
        key={doc.url}
        href={doc.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-300 sm:w-auto sm:justify-start 2xl:px-5 2xl:py-3 2xl:text-base"
      >
        <FileText size={14} className="2xl:size-4" />
        {doc.name}
      </a>
    );
  }

  return (
    <div className="space-y-6 text-slate-300">
      {/* Deskripsi Singkat */}
      {descriptionText && (
        <p className="text-sm font-medium leading-relaxed text-slate-200 sm:text-base lg:text-lg">
          {descriptionText}
        </p>
      )}

      {/* Konten HTML */}
      {project.content && (
        <div
          className="prose prose-invert max-w-none space-y-4 pt-2 text-sm leading-relaxed text-slate-300 sm:text-base"
          dangerouslySetInnerHTML={{ __html: project.content }}
        />
      )}

      {/* Area Tombol Eksternal */}
      {(project.liveUrl || project.repoUrl || links.length > 0) && (
        <div className="flex flex-col items-stretch gap-2.5 pt-2 sm:flex-row sm:flex-wrap 2xl:gap-4">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 sm:w-auto 2xl:px-5 2xl:py-3 2xl:text-base"
            >
              <Globe size={16} /> Live Demo
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-300 sm:w-auto 2xl:px-5 2xl:py-3 2xl:text-base"
            >
              <GitBranch size={16} /> Repository
            </a>
          )}
          {links.map(renderLinkItem)}
        </div>
      )}

      {/* Video */}
      {project.videoUrl && (
        <div className="mt-8 aspect-video w-full overflow-hidden rounded-xl 2xl:mt-10">
          <iframe
            src={project.videoUrl}
            title="Video Demo"
            className="h-full w-full border-0"
            allowFullScreen
          />
        </div>
      )}

      {/* Dokumen */}
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

      {/* Stack Teknologi */}
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
                {typeof tech === "string" ? tech : tech.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default KaryaProjectContent;
