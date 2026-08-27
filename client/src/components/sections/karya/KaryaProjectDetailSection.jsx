import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import DustBackground from "../../ui/DustBackground"
import GlowBackground from "../../ui/GlowBackground"
import PCBBackground from "../../ui/PCBBackground"
import GlassCard from "../../ui/GlassCard"
import { X, MessageCircle, Copy, Check, Send } from "lucide-react"
import { useAuth } from "../../../context/AuthContext"
import api from "../../../services/api"

import KaryaProjectGallery from "./detail/KaryaProjectGallery"
import KaryaProjectHeader from "./detail/KaryaProjectHeader"
import KaryaProjectContent from "./detail/KaryaProjectContent"
import KaryaProjectComments from "./detail/KaryaProjectComments"
import { DetailHeroSkeleton } from "../../ui/Skeleton"

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
          <DetailHeroSkeleton />
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
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 cursor-pointer items-center justify-center rounded-full bg-social-whatsapp/10 text-social-whatsapp transition group-hover:bg-social-whatsapp group-hover:text-white">
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
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 cursor-pointer items-center justify-center rounded-full bg-white/10 text-slate-200 transition group-hover:bg-black group-hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200">
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
                className="group flex flex-col items-center gap-2"
              >
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 cursor-pointer items-center justify-center rounded-full bg-social-facebook/10 text-social-facebook transition group-hover:bg-social-facebook group-hover:text-white">
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
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 cursor-pointer items-center justify-center rounded-full bg-social-telegram/10 text-social-telegram transition group-hover:bg-social-telegram group-hover:text-white">
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
