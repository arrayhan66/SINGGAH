import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import DustBackground from "../../ui/DustBackground"
import GlowBackground from "../../ui/GlowBackground"
import GlassCard from "../../ui/GlassCard"
import { X, MessageCircle, Copy, Check, Send } from "lucide-react"
import { karyaProjects, normalizeProject } from "../../../data/karyaData"
import { useAuth } from "../../../context/AuthContext"

import KaryaProjectGallery from "./detail/KaryaProjectGallery"
import KaryaProjectHeader from "./detail/KaryaProjectHeader"
import KaryaProjectContent from "./detail/KaryaProjectContent"
import KaryaProjectComments from "./detail/KaryaProjectComments"

function KaryaProjectDetailSection() {
  const { slug, projectId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isLoggedIn = user !== null

  const rawProject = karyaProjects.find((p) => p.id === Number(projectId))
  const project = rawProject ? normalizeProject(rawProject) : null

  const [activeImage, setActiveImage] = useState(0)
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState(
    Array.isArray(project?.comments) ? project.comments : [],
  )
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(project?.likesCount || 0)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  if (!project) {
    return (
      <section className="relative overflow-hidden bg-brand-dark py-32 text-center">
        <p className="text-slate-300">Project tidak ditemukan.</p>
        <button
          onClick={() => navigate("/karya")}
          className="mt-6 cursor-pointer rounded-xl border border-slate-200 bg-white px-5 py-3 text-slate-700 transition hover:bg-slate-50"
        >
          Kembali ke Karya
        </button>
      </section>
    )
  }

  const gallery =
    Array.isArray(project.images) && project.images.length > 0
      ? project.images.map((img) => img.image_url)
      : [project.thumbnail]

  const formatDate = (dateString) => {
    if (!dateString) return ""
    try {
      const options = { year: "numeric", month: "long", day: "numeric" }
      return new Date(dateString).toLocaleDateString("id-ID", options)
    } catch {
      return dateString
    }
  }

  function handleLike() {
    setIsLiked(!isLiked)
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1))
  }

  function handleBookmark() {
    setIsBookmarked(!isBookmarked)
  }

  function handleShare() {
    setShowShareModal(true)
  }

  const shareToWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent("Lihat karya ini: " + window.location.href)}`
    window.open(waUrl, "_blank")
    setShowShareModal(false)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setIsCopied(true)
      setTimeout(() => {
        setIsCopied(false)
        setShowShareModal(false)
      }, 2000)
    } catch (err) {
      console.error("Gagal menyalin", err)
    }
  }

  function handleAddComment(e) {
    e.preventDefault()
    if (!newComment.trim()) return

    setComments((prev) => [
      {
        id: Date.now(),
        User: { name: user?.name || "Anonim" },
        text: newComment,
        created_at: new Date().toISOString(),
      },
      ...prev,
    ])
    setNewComment("")
  }

  return (
    <section
      id="karya-project-detail"
      className="relative min-h-screen overflow-hidden bg-brand-dark pb-16 2xl:pb-24"
    >
      <GlowBackground />
      <DustBackground />

      <div className="relative mx-auto max-w-5xl px-2 min-[280px]:px-3 sm:px-5 pt-[calc(var(--navbar-h)+16px)] sm:pt-[calc(var(--navbar-h)+24px)]">
        <GlassCard className="overflow-hidden p-0">
          <KaryaProjectGallery
            slug={slug}
            gallery={gallery}
            activeImage={activeImage}
            setActiveImage={setActiveImage}
            projectTitle={project.title}
          />

          <div className="p-4 sm:p-8 lg:p-10 2xl:p-12">
            <KaryaProjectHeader
              project={project}
              formatDate={formatDate}
              isLiked={isLiked}
              likeCount={likeCount}
              handleLike={handleLike}
              isBookmarked={isBookmarked}
              handleBookmark={handleBookmark}
              handleShare={handleShare}
            />
            <KaryaProjectContent project={project} />
          </div>
        </GlassCard>

        <KaryaProjectComments
          comments={comments}
          isLoggedIn={isLoggedIn}
          newComment={newComment}
          setNewComment={setNewComment}
          handleAuthRedirect={() => navigate("/login")}
          handleAddComment={handleAddComment}
          formatDate={formatDate}
        />
      </div>

      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setShowShareModal(false)}
          ></div>

          <div className="relative w-full max-w-md transform overflow-hidden rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl shadow-cyan-900/20 transition-all sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Bagikan ke...</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="cursor-pointer rounded-full bg-white/80 p-2 text-slate-500 transition hover:bg-white hover:text-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-8 grid grid-cols-4 gap-4">
              <button
                onClick={shareToWhatsApp}
                className="group flex flex-col items-center gap-2"
              >
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 cursor-pointer items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366] transition group-hover:bg-[#25D366] group-hover:text-white">
                  <MessageCircle size={24} />
                </div>
                <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200">
                  WhatsApp
                </span>
              </button>

              <button
                onClick={() =>
                  window.open(
                    `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=Lihat%20karya%20menarik%20ini!`,
                    "_blank",
                  )
                }
                className="group flex flex-col items-center gap-2"
              >
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 cursor-pointer items-center justify-center rounded-full bg-white/5 text-slate-300 transition group-hover:bg-slate-800 group-hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200">
                  Twitter
                </span>
              </button>

              <button
                onClick={() =>
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
                    "_blank",
                  )
                }
                className="group flex flex-col items-center gap-2"
              >
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 cursor-pointer items-center justify-center rounded-full bg-[#1877F2]/10 text-[#1877F2] transition group-hover:bg-[#1877F2] group-hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200">
                  Facebook
                </span>
              </button>

              <button
                onClick={() =>
                  window.open(
                    `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=Lihat%20karya%20menarik%20ini!`,
                    "_blank",
                  )
                }
                className="group flex flex-col items-center gap-2"
              >
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 cursor-pointer items-center justify-center rounded-full bg-[#0088cc]/10 text-[#0088cc] transition group-hover:bg-[#0088cc] group-hover:text-white">
                  <Send size={24} />
                </div>
                <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200">
                  Telegram
                </span>
              </button>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 p-1.5 pl-4">
              <div className="mr-4 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-slate-400">
                {window.location.href}
              </div>
              <button
                onClick={copyToClipboard}
                className="flex shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 border border-slate-200"
              >
                {isCopied ? <Check size={16} /> : <Copy size={16} />}
                {isCopied ? "Tersalin!" : "Salin"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default KaryaProjectDetailSection
