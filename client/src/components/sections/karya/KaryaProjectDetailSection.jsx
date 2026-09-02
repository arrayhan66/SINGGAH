import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import DustBackground from "../../ui/DustBackground"
import GlowBackground from "../../ui/GlowBackground"
import PCBBackground from "../../ui/PCBBackground"
import GlassCard from "../../ui/GlassCard"
import { X, MessageCircle, Check, Send, Share2, Link2 } from "lucide-react"
import { useAuth } from "../../../context/AuthContext"
import api from "../../../services/api"
import { imageUrl } from "../../../utils/imageUrl"

import KaryaProjectGallery from "./detail/KaryaProjectGallery"
import KaryaProjectHeader from "./detail/KaryaProjectHeader"
import KaryaProjectContent from "./detail/KaryaProjectContent"
import KaryaProjectComments from "./detail/KaryaProjectComments"
import { ProjectDetailSkeleton, CommentsSkeleton } from "../../ui/PageSkeletons"

function KaryaProjectDetailSection() {
  const { slug, projectSlug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const isLoggedIn = user !== null

  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)

  const [activeImage, setActiveImage] = useState(0)
  const [comments, setComments] = useState([])
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    api.post(`/projects/${projectSlug}/view`)
      .then(() => {})
      .catch((err) => {
        console.error("Failed to record view:", err)
      })

    api.get(`/projects/${projectSlug}`)
      .then((res) => {
        const p = res.data.data
        setProject(p)
        setLikeCount(p.likesCount || 0)
        setIsLiked(Boolean(p.liked))
        setIsBookmarked(Boolean(p.bookmarked))
      })
      .catch((err) => {
        console.error("Failed to fetch project detail:", err)
      })
      .finally(() => setLoading(false))

    api.get(`/projects/${projectSlug}/comments`)
      .then((res) => {
        setComments(Array.isArray(res.data.data) ? res.data.data : [])
      })
      .catch((err) => {
        console.error("Failed to fetch comments:", err)
      })
  }, [projectSlug])

  if (loading) {
    return (
      <section className="relative min-h-screen overflow-hidden bg-brand-dark pt-[calc(var(--navbar-h)+16px)] sm:pt-[calc(var(--navbar-h)+24px)] pb-10 sm:pb-12 md:pb-16">
        <DustBackground />
        <GlowBackground />
        <div className="pt-6 sm:pt-8">
          <ProjectDetailSkeleton />
          <CommentsSkeleton />
        </div>
      </section>
    )
  }

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

  const gallery = Array.from(
    new Set([
      project.thumbnail,
      ...(Array.isArray(project.images) ? project.images : []).map(
        (img) => img.image_url,
      ),
    ]),
  ).filter(Boolean)

  const formatDate = (dateString) => {
    if (!dateString) return ""
    try {
      const options = { year: "numeric", month: "long", day: "numeric" }
      return new Date(dateString).toLocaleDateString("id-ID", options)
    } catch {
      return dateString
    }
  }

  const shareImage = imageUrl(gallery[0] || project.thumbnail)

  function handleLike() {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: location } })
      return
    }
    api.post(`/projects/${projectSlug}/like`)
      .then((res) => {
        const { liked, likesCount } = res.data.data || {}
        setIsLiked(Boolean(liked))
        if (typeof likesCount === "number") setLikeCount(likesCount)
      })
      .catch((err) => {
        console.error("Failed to update like:", err)
      })
  }

  function handleBookmark() {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: location } })
      return
    }
    api.post(`/projects/${projectSlug}/bookmark`)
      .then((res) => {
        setIsBookmarked(Boolean(res.data.data?.bookmarked))
      })
      .catch((err) => {
        console.error("Failed to update bookmark:", err)
      })
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

  return (
    <section
      id="karya-project-detail"
      className="relative min-h-screen overflow-hidden bg-brand-dark pb-16 2xl:pb-24"
    >
      <GlowBackground />
      <PCBBackground />
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
          setComments={setComments}
          projectSlug={projectSlug}
          isLoggedIn={isLoggedIn}
          user={user}
          handleAuthRedirect={() => navigate("/login", { state: { from: location } })}
          formatDate={formatDate}
        />
      </div>

      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div
            className="share-modal-backdrop absolute inset-0"
            onClick={() => setShowShareModal(false)}
          ></div>

          <div className="share-modal relative w-full max-w-md overflow-hidden p-6 sm:p-8">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="share-modal-badge flex h-10 w-10 items-center justify-center rounded-2xl">
                  <Share2 size={18} />
                </span>
                <div>
                  <h3 className="share-modal-title text-xl font-bold leading-tight">
                    Bagikan Karya
                  </h3>
                  <p className="share-modal-sub mt-0.5 text-xs">
                    Sebarkan karya ini ke temanmu
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="share-modal-close flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Preview kartu karya */}
            <div className="share-preview mb-6">
              <div className="share-preview-media">
                <img
                  src={shareImage}
                  alt={project.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <span className="share-preview-tag absolute left-3 top-3">
                  {project.Category?.name || "Karya"}
                </span>
              </div>
              <div className="share-preview-body">
                <p className="share-preview-title truncate">{project.title}</p>
                <p className="share-preview-meta">
                  Karya SinggaH{project.year ? ` · ${project.year}` : ""}
                </p>
              </div>
            </div>

            {/* Aksi bagikan */}
            <div className="mb-6 grid grid-cols-4 gap-3 sm:gap-4">
              <button
                onClick={shareToWhatsApp}
                className="share-soc group flex cursor-pointer flex-col items-center gap-2"
              >
                <div className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-social-whatsapp/10 text-social-whatsapp transition group-hover:bg-social-whatsapp group-hover:text-white sm:h-14 sm:w-14">
                  <MessageCircle size={24} />
                </div>
                <span className="share-soc-label text-xs font-medium">
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
                className="share-soc group flex cursor-pointer flex-col items-center gap-2"
              >
                <div className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white/10 text-slate-200 transition group-hover:bg-black group-hover:text-white sm:h-14 sm:w-14">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <span className="share-soc-label text-xs font-medium">
                  X
                </span>
              </button>

              <button
                onClick={() =>
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
                    "_blank",
                  )
                }
                className="share-soc group flex cursor-pointer flex-col items-center gap-2"
              >
                <div className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-social-facebook/10 text-social-facebook transition group-hover:bg-social-facebook group-hover:text-white sm:h-14 sm:w-14">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </div>
                <span className="share-soc-label text-xs font-medium">
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
                className="share-soc group flex cursor-pointer flex-col items-center gap-2"
              >
                <div className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-social-telegram/10 text-social-telegram transition group-hover:bg-social-telegram group-hover:text-white sm:h-14 sm:w-14">
                  <Send size={24} />
                </div>
                <span className="share-soc-label text-xs font-medium">
                  Telegram
                </span>
              </button>
            </div>

            {/* Salin link */}
            <div className="share-copylink flex items-center justify-between p-1.5 pl-4">
              <div className="share-copylink-url mr-3 overflow-hidden text-ellipsis whitespace-nowrap text-sm">
                {window.location.href}
              </div>
              <button
                onClick={copyToClipboard}
                className="share-copylink-btn flex shrink-0 cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-300"
              >
                {isCopied ? <Check size={16} /> : <Link2 size={16} />}
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
