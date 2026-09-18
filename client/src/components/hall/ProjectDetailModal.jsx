import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  X,
  ExternalLink,
  ArrowRight,
  MessageCircle,
  Check,
  Send,
  Share2,
  Link2,
} from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import { saveHallReturn } from "../../three/hooks/useWalk"
import api from "../../services/api"
import { imageUrl } from "../../utils/imageUrl"
import GlassCard from "../ui/GlassCard"
import SmartImage from "../ui/SmartImage"
import KaryaProjectGallery from "../sections/karya/detail/KaryaProjectGallery"
import KaryaProjectHeader from "../sections/karya/detail/KaryaProjectHeader"
import KaryaProjectContent from "../sections/karya/detail/KaryaProjectContent"

function ProjectDetailModal({ project, categoryTitle, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { theme } = useTheme()
  const isLight = theme === "light"
  const isLoggedIn = Boolean(user)
  const categorySlug = project.Category?.slug || project.category

  const links = Array.isArray(project.links) ? project.links : []

  const [activeImage, setActiveImage] = useState(0)
  const [isLiked, setIsLiked] = useState(Boolean(project.isLiked))
  const [likeCount, setLikeCount] = useState(project.likesCount || 0)
  const [isBookmarked, setIsBookmarked] = useState(Boolean(project.bookmarked))
  const [showShareModal, setShowShareModal] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    if (!project.id) return
    api.post(`/projects/${project.id}/view`).catch((err) => {
      console.error("Failed to record view:", err)
    })
  }, [project.id])

  const gallery = Array.from(
    new Set([
      project.thumbnail,
      ...(Array.isArray(project.images) ? project.images : []).map(
        (img) => img.image_url,
      ),
    ]),
  ).filter(Boolean)

  const detailPath = `/karya/${categorySlug}/${project.slug || project.id}`
  const shareLink = `${window.location.origin}${detailPath}`
  const shareImage = imageUrl(gallery[0] || project.thumbnail)

  function openDetail() {
    saveHallReturn()
    onClose()
    navigate(detailPath, { state: { fromHall: true } })
  }

  function handleLike() {
    if (!isLoggedIn) {
      onClose()
      navigate("/login", { state: { from: location } })
      return
    }
    api.post(`/projects/${project.id}/like`)
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
      onClose()
      navigate("/login", { state: { from: location } })
      return
    }
    api.post(`/projects/${project.id}/bookmark`)
      .then((res) => {
        setIsBookmarked(Boolean(res.data.data?.bookmarked))
      })
      .catch((err) => {
        console.error("Failed to update bookmark:", err)
      })
  }

  const shareToWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent("Lihat karya ini: " + shareLink)}`
    window.open(waUrl, "_blank")
    setShowShareModal(false)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
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
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 ${isLight ? "bg-slate-900/70" : "bg-black/80"} backdrop-blur-md`}
      />

      {/* Container modal — class karya-projectdetail-page mengaktifkan semua
          override dark/light detail-light.css seperti halaman KaryaProjectDetail.
          Ops: wrapper luar bisa scroll (biar modal besar tak pernah terpotong) &
          tinggi memakai dvh (dynamic) supaya pas di viewport browser HP. */}
      <div className="relative flex min-h-full items-center justify-center p-3 sm:p-6">
        <div className="karya-projectdetail-page relative w-full max-w-3xl max-h-[92dvh] overflow-y-auto overscroll-contain animate-fade-in">
        <GlassCard className="overflow-hidden p-0 shadow-2xl">
          {/* Tombol close (di atas galeri) */}
          <button
            onClick={onClose}
            aria-label="Tutup detail karya"
            className={`absolute right-3 top-3 z-30 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border backdrop-blur-md transition-colors duration-300 ${
              isLight
                ? "border-slate-300 bg-white/80 text-slate-700 hover:bg-slate-200"
                : "border-white/20 bg-brand-dark/90 text-slate-100 hover:bg-brand-navy hover:text-cyan-300"
            }`}
          >
            <X className="h-5 w-5" />
          </button>

          <KaryaProjectGallery
            slug={categorySlug}
            gallery={gallery}
            activeImage={activeImage}
            setActiveImage={setActiveImage}
            projectTitle={project.title}
            showBack={false}
          />

          <div className="p-4 sm:p-8 lg:p-10">
            <KaryaProjectHeader
              project={project}
              isLiked={isLiked}
              likeCount={likeCount}
              handleLike={handleLike}
              isBookmarked={isBookmarked}
              handleBookmark={handleBookmark}
              handleShare={() => setShowShareModal(true)}
            />
            <KaryaProjectContent project={project} />
          </div>

          {/* Footer aksi — di HP tombol full-width (mudah disentuh), di layar
              besar rapat ke kanan */}
          <div className="flex flex-col gap-3 border-t border-white/10 px-4 pb-4 pt-4 sm:flex-row sm:items-center sm:justify-end sm:px-8 sm:pb-8 sm:pt-6 lg:px-10">
            {links[0]?.url && (
              <a
                href={links[0].url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white sm:w-auto sm:py-2.5"
              >
                <span>Kunjungi Demo</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            )}

            <button
              onClick={openDetail}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition-all hover:from-sky-500 hover:to-cyan-300 sm:w-auto sm:py-2.5"
            >
              <span>Lihat Detail Lengkap</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </GlassCard>
      </div>
      </div>

      {/* Modal bagikan — markup identik dengan halaman KaryaProjectDetail */}
      {showShareModal && (
        <div className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain">
          <div
            className="share-modal-backdrop fixed inset-0"
            onClick={() => setShowShareModal(false)}
          ></div>

          <div className="relative flex min-h-full items-center justify-center p-4">
            <div className="share-modal relative w-full max-w-md overflow-y-auto overscroll-contain p-6 sm:p-8">
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
                <SmartImage
                  src={shareImage}
                  alt={project.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <span className="share-preview-tag absolute left-3 top-3">
                  {project.Category?.name || categoryTitle || "Karya"}
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
                    `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}&text=Lihat%20karya%20menarik%20ini!`,
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
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`,
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
                    `https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=Lihat%20karya%20menarik%20ini!`,
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
                {shareLink}
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
          </div>
      )}
    </div>
  )
}

export default ProjectDetailModal