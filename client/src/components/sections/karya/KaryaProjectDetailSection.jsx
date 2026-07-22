import React, { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  ArrowLeft,
  Calendar,
  Layers,
  Heart,
  Bookmark,
  Eye,
  ExternalLink,
  FileText,
  MessageCircle,
  Send,
  Code2,
  GitBranch,
  Globe,
  Users,
  UserCheck,
  CheckCircle2,
  Clock,
} from "lucide-react"
import DustBackground from "../../ui/DustBackground"
import GlowBackground from "../../ui/GlowBackground"
import GlassCard from "../../ui/GlassCard"
import { karyaCategories, karyaProjects } from "../../../data/karyaData"

function KaryaProjectDetailSection() {
  const { slug, projectSlug } = useParams()
  const navigate = useNavigate()

  const category = karyaCategories.find((item) => item.slug === slug)
  const project = karyaProjects.find(
    (item) => item.category === slug && item.slug === projectSlug,
  )

  const [activeImage, setActiveImage] = useState(0)
  const [isLoggedIn] = useState(false)
  const [newComment, setNewComment] = useState("")

  if (!category || !project) {
    return (
      <section className="relative overflow-hidden bg-brand-navy py-32 text-center">
        <p className="text-slate-300">Karya tidak ditemukan.</p>
        <button
          onClick={() => navigate("/karya")}
          className="mt-6 rounded-xl border border-cyan-400/30 px-5 py-3 text-cyan-300 transition hover:bg-cyan-400 hover:text-black cursor-pointer"
        >
          Kembali ke Karya
        </button>
      </section>
    )
  }

  const gallery =
    Array.isArray(project.images) && project.images.length > 0
      ? project.images
      : [project.image]

  const authors = Array.isArray(project.author)
    ? project.author
    : project.author
      ? [project.author]
      : []

  const links = Array.isArray(project.links) ? project.links : []
  const documents = Array.isArray(project.documents) ? project.documents : []
  const comments = Array.isArray(project.comments) ? project.comments : []
  const techStack = Array.isArray(project.techStack) ? project.techStack : []
  const contributors = Array.isArray(project.contributors)
    ? project.contributors
    : []

  // Helper untuk format tanggal dari ISO string ke format lokal yang rapi
  const formatDate = (dateString) => {
    if (!dateString) return ""
    try {
      const options = { year: "numeric", month: "long", day: "numeric" }
      return new Date(dateString).toLocaleDateString("id-ID", options)
    } catch {
      return dateString
    }
  }

  function handleAuthRedirect(e) {
    e.preventDefault()
    navigate("/login")
  }

  function handleAddComment(e) {
    e.preventDefault()
    if (!newComment.trim()) return
    console.log("Komentar dikirim:", newComment)
    setNewComment("")
  }

  function renderLinkItem(link) {
    const anchorProps = {
      key: link.url,
      href: link.url,
      target: "_blank",
      rel: "noopener noreferrer",
      className:
        "flex items-center gap-2 rounded-xl border border-cyan-400/30 px-4 py-2.5 text-sm font-medium text-cyan-300 transition hover:bg-cyan-400 hover:text-black cursor-pointer 2xl:px-5 2xl:py-3 2xl:text-base",
    }

    return React.createElement(
      "a",
      anchorProps,
      React.createElement(ExternalLink, { size: 14, className: "2xl:size-4" }),
      link.label,
    )
  }

  function renderDocumentItem(doc) {
    const anchorProps = {
      key: doc.url,
      href: doc.url,
      target: "_blank",
      rel: "noopener noreferrer",
      className:
        "flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-300 cursor-pointer 2xl:px-5 2xl:py-3 2xl:text-base",
    }

    return React.createElement(
      "a",
      anchorProps,
      React.createElement(FileText, { size: 14, className: "2xl:size-4" }),
      doc.name,
    )
  }

  return (
    <section
      id="karya-project-detail"
      className="relative overflow-hidden bg-brand-navy pt-28 pb-16 sm:pt-32 lg:pt-36 2xl:pt-40 2xl:pb-24"
    >
      <GlowBackground />
      <DustBackground />

      <div className="relative mx-auto max-w-5xl px-5 sm:px-8 2xl:max-w-6xl">
        <Link
          to={`/karya/${slug}`}
          className="group absolute left-5 top-0 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-2 pl-3 pr-4 text-sm text-slate-300 backdrop-blur-sm transition-colors duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300 sm:left-8 cursor-pointer"
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
          <div>
            <img
              src={gallery[activeImage]}
              alt={project.title}
              className="h-64 w-full object-cover sm:h-80 lg:h-96 2xl:h-128"
            />

            {gallery.length > 1 && (
              <div className="flex gap-3 overflow-x-auto p-4 sm:p-6 2xl:p-8">
                {gallery.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition cursor-pointer sm:h-20 sm:w-28 2xl:h-24 2xl:w-32 ${
                      activeImage === index
                        ? "border-cyan-400"
                        : "border-white/10 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${project.title} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 sm:p-10 2xl:p-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 px-3 py-1 text-xs font-medium text-cyan-300 2xl:px-4 2xl:py-1.5 2xl:text-sm">
                  <Layers size={12} className="2xl:size-3.5" />
                  {category.title}
                </span>

                {project.status && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300 capitalize">
                    <CheckCircle2 size={12} />
                    {project.status}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-sm text-slate-400 2xl:text-base">
                  <Eye size={16} className="2xl:size-4.5" />
                  {project.viewsCount || 0}
                </span>

                <button
                  onClick={handleAuthRedirect}
                  className="flex cursor-pointer items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-sm text-slate-300 transition hover:border-pink-400/40 hover:text-pink-400 2xl:px-4 2xl:py-2 2xl:text-base"
                >
                  <Heart
                    size={16}
                    className={
                      project.isLiked
                        ? "fill-pink-500 text-pink-500 2xl:size-4.5"
                        : "2xl:size-4.5"
                    }
                  />
                  {project.likesCount || 0}
                </button>

                <button
                  onClick={handleAuthRedirect}
                  aria-label="Bookmark"
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:border-cyan-400/40 hover:text-cyan-300 2xl:h-11 2xl:w-11"
                >
                  <Bookmark
                    size={16}
                    className={
                      project.isBookmarked
                        ? "fill-cyan-300 text-cyan-300 2xl:size-4.5"
                        : "2xl:size-4.5"
                    }
                  />
                </button>
              </div>
            </div>

            <h1 className="mt-4 text-2xl font-black text-white sm:text-3xl lg:text-4xl 2xl:text-5xl">
              {project.title}
            </h1>

            {techStack.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {techStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-md bg-white/5 border border-white/10 px-2.5 py-1 text-xs font-medium text-cyan-300/90 2xl:text-sm"
                  >
                    <Code2 size={11} className="text-cyan-400" />
                    {tech}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400 2xl:text-base">
              {authors.length > 0 && (
                <span className="font-medium text-slate-300">
                  {authors.join(", ")}
                </span>
              )}
              {project.year && (
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Calendar size={14} />
                  {project.year}
                </span>
              )}
              {project.createdAt && (
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Clock size={14} />
                  {formatDate(project.createdAt)}
                </span>
              )}
            </div>

            {contributors.length > 0 && (
              <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-400 2xl:text-sm">
                <Users size={13} className="text-slate-500" />
                <div className="flex flex-wrap gap-1.5">
                  {contributors.map((c, i) => (
                    <span key={i} className="text-slate-400">
                      {c.name}{" "}
                      <span className="text-slate-500">({c.role})</span>
                      {i < contributors.length - 1 ? "," : ""}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="mt-6 leading-8 text-slate-300 2xl:text-lg 2xl:leading-9">
              {project.desc}
            </p>

            <div className="mt-8 flex flex-wrap gap-3 2xl:mt-10 2xl:gap-4">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 cursor-pointer 2xl:px-5 2xl:py-3 2xl:text-base"
                >
                  <Globe size={16} />
                  Live Demo
                </a>
              )}
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-300 cursor-pointer 2xl:px-5 2xl:py-3 2xl:text-base"
                >
                  <GitBranch size={16} />
                  Repository
                </a>
              )}
              {links.map(renderLinkItem)}
            </div>

            {project.videoUrl && (
              <div className="mt-8 aspect-video w-full overflow-hidden rounded-xl 2xl:mt-10">
                <iframe
                  src={project.videoUrl}
                  title="Video Demo"
                  className="h-full w-full"
                  allowFullScreen
                />
              </div>
            )}

            {documents.length > 0 && (
              <div className="mt-8 2xl:mt-10">
                <h3 className="text-sm font-semibold text-slate-300 2xl:text-base">
                  Dokumen Pendukung
                </h3>
                <div className="mt-3 flex flex-col gap-2 2xl:gap-3">
                  {documents.map(renderDocumentItem)}
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Bagian Komentar */}
        <GlassCard className="mt-8 p-6 sm:p-10 2xl:mt-10 2xl:p-12">
          <h3 className="flex items-center gap-2 text-lg font-bold text-white sm:text-xl 2xl:text-2xl">
            <MessageCircle size={20} className="2xl:size-6" />
            Komentar ({comments.length})
          </h3>

          {!isLoggedIn ? (
            <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white shadow-md py-8 text-center 2xl:py-10">
              <p className="text-sm text-slate-600 font-medium 2xl:text-base">
                Silakan login terlebih dahulu untuk bergabung dalam diskusi.
              </p>
              <button
                onClick={handleAuthRedirect}
                className="mt-4 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 cursor-pointer 2xl:px-8 2xl:py-3 2xl:text-base"
              >
                Login untuk Komentar
              </button>
            </div>
          ) : (
            <form onSubmit={handleAddComment} className="mt-6">
              <div className="flex flex-col gap-3">
                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Tulis tanggapan atau diskusimu di sini..."
                  className="w-full rounded-xl border border-slate-300 bg-white p-4 text-sm text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:outline-none shadow-sm 2xl:text-base"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 cursor-pointer 2xl:px-6 2xl:py-3 2xl:text-base"
                  >
                    <Send size={16} />
                    Kirim Komentar
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="mt-8 flex flex-col gap-4 2xl:gap-5">
            {comments.length > 0 ? (
              comments.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3.5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm 2xl:p-5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-100 border border-cyan-200 text-cyan-700 2xl:h-10 2xl:w-10">
                    <UserCheck size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900 2xl:text-base">
                        {item.author}
                      </p>
                      {item.createdAt && (
                        <span className="text-xs text-slate-400">
                          {formatDate(item.createdAt)}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-700 2xl:text-base 2xl:leading-7">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-slate-500 2xl:text-base">
                Belum ada komentar.
              </p>
            )}
          </div>
        </GlassCard>
      </div>
    </section>
  )
}

export default KaryaProjectDetailSection
