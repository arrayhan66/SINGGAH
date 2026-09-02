import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  ArrowLeft,
  Calendar,
  Newspaper,
  Share2,
  X,
  Check,
  Copy,
  MessageCircle,
  Send,
  BookOpen,
  Megaphone,
} from "lucide-react"
import { useBerita } from "../../../context/BeritaContext"
import { useTheme } from "../../../context/ThemeContext"
import DustBackground from "../../ui/DustBackground"
import PCBBackground from "../../ui/PCBBackground"
import { BeritaDetailSkeleton } from "../../ui/PageSkeletons"
import { imageUrl } from "../../../utils/imageUrl"
import { processContentHtml } from "../../../utils/processContentHtml"

function parseSeeAlsoItems(htmlStr) {
  if (!htmlStr) return []
  try {
    return JSON.parse(htmlStr)
  } catch {
    return []
  }
}

function SeeAlsoBlock({ htmlAttributes }) {
  const items = parseSeeAlsoItems(htmlAttributes["data-see-also-items"])

  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-md">
      <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3">
        <BookOpen size={18} className="text-white" />
        <span className="text-sm font-black uppercase tracking-widest text-white">
          Baca Juga
        </span>
        <div className="h-px flex-1 bg-white/30" />
      </div>
      {items.length > 0 ? (
        <div className="grid divide-y divide-amber-100">
          {items.map((item, index) => (
            <a
              key={index}
              href={item.url || "#"}
              target={item.url ? "_blank" : undefined}
              rel={item.url ? "noopener noreferrer" : undefined}
              className={`flex items-start gap-3 px-5 py-3.5 transition-colors ${
                item.url ? "hover:bg-amber-50/80 cursor-pointer" : ""
              }`}
            >
              {item.image ? (
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-amber-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-sm font-bold text-amber-500">
                  {index + 1}
                </div>
              )}
              <div className="min-w-0 flex-1 py-0.5">
                <p className="text-sm font-bold leading-snug text-slate-800 line-clamp-2 group-hover:text-amber-700">
                  {item.title}
                </p>
                {item.url && (
                  <p className="mt-1 text-[11px] text-cyan-600 truncate">
                    {item.url}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="px-5 py-6 text-center">
          <p className="text-xs text-amber-400 italic">
            Tidak ada rekomendasi artikel.
          </p>
        </div>
      )}
    </div>
  )
}

function AdBlockRender({ htmlAttributes }) {
  const title = htmlAttributes["data-ad-title"] || ""
  const content = htmlAttributes["data-ad-content"] || ""
  const url = htmlAttributes["data-ad-url"] || ""

  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm">
      <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-3">
        <Megaphone size={16} className="text-white" />
        <span className="text-xs font-black uppercase tracking-widest text-white">
          {title || "Promo"}
        </span>
        <div className="h-px flex-1 bg-white/30" />
      </div>
      <div className="px-5 py-4">
        {content && (
          <p className="text-sm leading-relaxed text-slate-700">{content}</p>
        )}
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Selengkapnya &rarr;
          </a>
        )}
      </div>
    </div>
  )
}

function NewsContent({ item }) {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const hasHTML =
    item.contentHTML &&
    typeof item.contentHTML === "string" &&
    item.contentHTML.includes("<")

  const hasCustomBlocks =
    hasHTML &&
    (item.contentHTML.includes('data-type="see-also"') ||
      item.contentHTML.includes('data-type="ad-block"'))

  if (hasCustomBlocks) {
    const parts = item.contentHTML.split(
      /(<div[^>]*data-type="(?:see-also|ad-block)"[^>]*>[\s\S]*?<\/div>)/g
    )

    return (
      <>
        {parts.map((part, index) => {
          if (part.includes('data-type="see-also"')) {
            const parser = new DOMParser()
            const doc = parser.parseFromString(part, "text/html")
            const el = doc.body.firstChild
            if (!el) return null
            const attrs = {}
            for (const attr of el.attributes) {
              attrs[attr.name] = attr.value
            }
            return <SeeAlsoBlock key={index} htmlAttributes={attrs} />
          }
          if (part.includes('data-type="ad-block"')) {
            const parser = new DOMParser()
            const doc = parser.parseFromString(part, "text/html")
            const el = doc.body.firstChild
            if (!el) return null
            const attrs = {}
            for (const attr of el.attributes) {
              attrs[attr.name] = attr.value
            }
            return <AdBlockRender key={index} htmlAttributes={attrs} />
          }
          if (part.trim()) {
            return (
              <div
                key={index}
                className={`prose prose-sm sm:prose-base max-w-none prose-headings:font-bold prose-img:rounded-none prose-img:mx-auto prose-p:leading-relaxed prose-p:my-4 prose-img:my-0 prose-figure:my-0 ${isDark ? "prose-invert prose-slate" : "prose-slate"}`}
                dangerouslySetInnerHTML={{ __html: processContentHtml(part) }}
              />
            )
          }
          return null
        })}
      </>
    )
  }

  if (hasHTML) {
    return (
      <div
        className={`prose prose-sm sm:prose-base max-w-none prose-headings:font-bold prose-img:rounded-none prose-img:mx-auto prose-p:leading-relaxed prose-p:my-4 prose-img:my-0 prose-figure:my-0 ${isDark ? "prose-invert prose-slate" : "prose-slate"}`}
        dangerouslySetInnerHTML={{ __html: processContentHtml(item.contentHTML) }}
      />
    )
  }

  if (Array.isArray(item.content)) {
    return item.content.map((paragraph, index) => {
      const correspondingPhoto = item.gallery?.[index]

      if (index === 0) {
        const firstLetter = paragraph.charAt(0)
        const restOfParagraph = paragraph.slice(1)

        return (
          <div key={index} className="space-y-3 min-[350px]:space-y-8">
            <p className={`text-base min-[350px]:text-lg sm:text-xl leading-relaxed font-normal ${isDark ? "text-slate-200" : "text-slate-800"}`}>
              <span className={`float-left text-4xl min-[350px]:text-5xl sm:text-6xl font-black mr-2.5 min-[350px]:mr-3.5 leading-none pt-1 ${isDark ? "text-cyan-400" : "text-cyan-600"}`}>
                {firstLetter}
              </span>
              {restOfParagraph}
            </p>
            {correspondingPhoto && (
              <figure className="relative my-2 min-[350px]:my-5 rounded-none overflow-hidden">
                <div className={`w-full max-h-[500px] overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                  <img
                    src={imageUrl(correspondingPhoto.url)}
                    alt={correspondingPhoto.caption}
                    className="block h-auto w-full max-w-full"
                  />
                </div>
                {correspondingPhoto.caption && (
                  <div className="bg-slate-800 rounded-lg mx-1 my-2">
                    <figcaption className="text-slate-300 text-xs sm:text-sm pl-4 pr-3 py-2.5 italic">
                      {correspondingPhoto.caption}
                    </figcaption>
                  </div>
                )}
              </figure>
            )}
          </div>
        )
      }

      return (
        <div key={index} className="space-y-3 min-[350px]:space-y-8">
          <p className={`leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>{paragraph}</p>
          {correspondingPhoto && (
            <figure className="my-2 min-[350px]:my-5 rounded-none overflow-hidden">
              <div className={`w-full max-h-[500px] overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                <img
                  src={correspondingPhoto.url}
                  alt={correspondingPhoto.caption}
                  className="block h-auto w-full max-w-full"
                />
              </div>
              {correspondingPhoto.caption && (
                <div className="bg-slate-800 rounded-lg mx-1 my-2">
                  <figcaption className="text-slate-300 text-xs sm:text-sm pl-4 pr-3 py-2.5 italic">
                    {correspondingPhoto.caption}
                  </figcaption>
                </div>
              )}
            </figure>
          )}
        </div>
      )
    })
  }

  return (
    <p className={`text-base min-[350px]:text-lg sm:text-xl leading-relaxed font-normal whitespace-pre-line ${isDark ? "text-slate-200" : "text-slate-800"}`}>
      {typeof item.content === "string"
        ? item.content
        : item.description || "Tidak ada konten"}
    </p>
  )
}

function BeritaDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { beritaList, loading } = useBerita()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const item = beritaList.find((b) => b.slug === slug)
  const relatedNews = beritaList.filter((b) => b.slug !== slug).slice(0, 3)

  const currentUrl = window.location.href
  const shareTitle = encodeURIComponent(item?.title || "Berita SINGGAH")

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <section className="relative min-h-screen overflow-hidden bg-brand-dark pt-[calc(var(--navbar-h)+16px)] sm:pt-[calc(var(--navbar-h)+24px)] pb-16 sm:pb-20">
        <DustBackground />
        <div className="pt-6 sm:pt-8">
          <BeritaDetailSkeleton />
        </div>
      </section>
    )
  }

  if (!item) {
    return (
      <section className="relative min-h-screen bg-brand-dark pt-[calc(var(--navbar-h)+16px)] sm:pt-[calc(var(--navbar-h)+24px)] pb-16">
        <div className="mx-auto max-w-2xl px-4 min-[350px]:px-5 text-center">
          <h2 className="text-xl min-[350px]:text-2xl font-bold text-white">
            Berita tidak ditemukan
          </h2>
          <p className="mt-2 text-sm min-[350px]:text-base text-slate-400">
            Artikel yang kamu cari mungkin sudah dihapus atau tidak tersedia.
          </p>
          <Link
            to="/berita"
            className="mt-6 inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition-colors"
          >
            <ArrowLeft size={16} />
            Kembali
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden bg-brand-dark min-h-screen pt-[calc(var(--navbar-h)+16px)] sm:pt-[calc(var(--navbar-h)+24px)] pb-16 sm:pb-20 lg:pb-24">
      <PCBBackground />
      <DustBackground />

      <div className="relative z-10 mx-auto max-w-4xl px-3 min-[350px]:px-5 sm:px-8 2xl:max-w-5xl">
        <div className="berita-article-card overflow-hidden border border-slate-700/60 rounded-2xl min-[350px]:rounded-3xl bg-brand-navy">
          <div className="p-4 min-[350px]:p-5 sm:p-8 lg:p-10 pb-6 min-[350px]:pb-8 sm:pb-12 lg:pb-14 bg-brand-navy border-b border-slate-800/80">
            {/* Dibikin flex-wrap biar di 260px tombolnya nggak maksa nyamping */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-0">
              <Link
                to="/berita"
                aria-label="Kembali"
                className={`group inline-flex items-center gap-1.5 min-[350px]:gap-2 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs min-[350px]:text-sm transition-all duration-300 shadow-sm cursor-pointer ${isDark ? "border border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300" : "border border-cyan-400/40 bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20 hover:border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-400/10"}`}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 shrink-0">
                  <ArrowLeft
                    size={14}
                    className="transition-transform duration-300 group-hover:-translate-x-0.5"
                  />
                </span>
                <span className="font-semibold">Kembali</span>
              </Link>

              <button
                onClick={() => setIsShareModalOpen(true)}
                aria-label="Bagikan Artikel"
                className={`group inline-flex items-center gap-1.5 min-[350px]:gap-2 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs min-[350px]:text-sm transition-all duration-300 shadow-sm cursor-pointer ${isDark ? "border border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300" : "border border-cyan-400/40 bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20 hover:border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-400/10"}`}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 shrink-0">
                  <Share2
                    size={14}
                    className="text-cyan-400 shrink-0"
                  />
                </span>
                <span className="font-semibold">Bagikan</span>
              </button>
            </div>

            <div className="mt-6 min-[350px]:mt-8 sm:mt-10 space-y-2 min-[350px]:space-y-3">
              {item.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 min-[350px]:gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md min-[350px]:rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-2 min-[350px]:px-3 py-0.5 min-[350px]:py-1 text-[10px] min-[350px]:text-xs font-bold tracking-wider uppercase text-cyan-300 shadow-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="text-xl min-[350px]:text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-[1.2] min-[350px]:leading-[1.15] tracking-tight">
                {item.title}
              </h1>

              <div className={`flex flex-col min-[350px]:flex-row flex-wrap items-start min-[350px]:items-center justify-between gap-3 min-[350px]:gap-4 pt-3 border-t text-xs sm:text-sm ${isDark ? "border-slate-700 text-slate-400" : "border-slate-800/80 text-slate-400"}`}>
                <div className="flex items-center gap-2.5 min-[350px]:gap-3">
                  <div className={`h-7 w-7 min-[350px]:h-9 min-[350px]:w-9 rounded-full flex items-center justify-center font-bold text-[10px] min-[350px]:text-xs shrink-0 ${isDark ? "bg-cyan-500/20 border border-cyan-400/30 text-cyan-300" : "bg-cyan-100 border border-cyan-200 text-cyan-700"}`}>
                    {(item.winner || item.source || "A")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className={`font-bold text-[11px] min-[350px]:text-xs sm:text-sm leading-tight min-[350px]:leading-normal ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                      {item.winner || item.source || "Tim Redaksi SINGGAH"}
                    </p>
                    <p className={`text-[9px] min-[350px]:text-[11px] font-medium leading-tight min-[350px]:leading-normal ${isDark ? "text-cyan-400" : "text-cyan-600"}`}>
                      Divisi Publikasi & Media Akademik
                    </p>
                  </div>
                </div>

                <div className={`flex flex-wrap items-center gap-3 min-[350px]:gap-4 text-[10px] min-[350px]:text-xs sm:text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {item.date && (
                    <div className="flex items-center gap-1 min-[350px]:gap-1.5 font-medium">
                      <Calendar
                        size={12}
                        className={`min-[350px]:w-3.5 min-[350px]:h-3.5 ${isDark ? "text-cyan-400" : "text-cyan-600"}`}
                      />
                      <span>{item.date}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="relative h-48 min-[350px]:h-64 sm:h-88 lg:h-[420px] w-full overflow-hidden bg-slate-950">
            <img
              src={imageUrl(item.image)}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-102"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-3 min-[350px]:bottom-4 left-3 min-[350px]:left-4 right-3 min-[350px]:right-4 sm:left-6 sm:right-6 flex justify-end">
              <span className="inline-flex items-center gap-1.5 text-[9px] min-[350px]:text-[11px] sm:text-xs text-white/95 bg-gradient-to-r from-black/60 to-black/40 backdrop-blur-lg px-3 min-[350px]:px-4 py-1.5 min-[350px]:py-2 rounded-full border border-white/15 font-semibold tracking-wide shadow-lg shadow-black/20">
                <Newspaper size={11} className="min-[350px]:w-3 min-[350px]:h-3 shrink-0 opacity-80" />
                Dokumentasi Resmi SINGGAH
              </span>
            </div>
          </div>

          <div className={`p-3 min-[350px]:p-6 sm:p-10 lg:p-14 pt-3 min-[350px]:pt-5 space-y-3 min-[350px]:space-y-6 ${isDark ? "bg-brand-navy text-white" : "bg-white text-slate-900"}`}>
            <div className={`flex flex-col gap-2 min-[350px]:gap-6 text-sm min-[350px]:text-base sm:text-lg leading-relaxed font-normal ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              <NewsContent item={item} />
            </div>

            <div className={`pt-6 min-[350px]:pt-8 border-t flex flex-wrap items-center justify-between gap-3 min-[350px]:gap-4 ${isDark ? "border-slate-700" : "border-slate-200"}`}>
              <div className="flex items-center gap-2 min-[350px]:gap-3">
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className={`inline-flex items-center gap-1.5 min-[350px]:gap-2 px-3 min-[350px]:px-4 py-1.5 min-[350px]:py-2 rounded-lg min-[350px]:rounded-xl text-[11px] min-[350px]:text-xs font-bold transition-all shadow-xs cursor-pointer ${isDark ? "border border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300" : "bg-cyan-400/10 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-400/20 hover:border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-400/10"}`}
                >
                  <Share2
                    size={12}
                    className="min-[350px]:w-3.5 min-[350px]:h-3.5"
                  />
                  Bagikan
                </button>
              </div>

              {item.source && (
                <div className={`text-[10px] min-[350px]:text-xs flex items-center gap-1 min-[350px]:gap-1.5 px-2 min-[350px]:px-2.5 sm:px-3.5 py-1.5 min-[350px]:py-2 rounded-lg min-[350px]:rounded-xl ${isDark ? "text-slate-400 bg-white/5 border border-white/10" : "text-slate-600 bg-slate-50 border border-slate-200"}`}>
                  <Newspaper
                    size={12}
                    className="min-[350px]:w-3.5 min-[350px]:h-3.5 text-cyan-600 shrink-0"
                  />
                  <span>
                    Sumber:{" "}
                    <strong className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {item.source}
                    </strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {relatedNews.length > 0 && (
          <div className="mt-10 min-[350px]:mt-16">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 min-[350px]:mb-6">
              <h2 className={`text-lg min-[350px]:text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 ${isDark ? "text-white" : "text-slate-800"}`}>
                <span className={`w-1.5 min-[350px]:w-2 h-5 min-[350px]:h-6 rounded-full inline-block ${isDark ? "bg-cyan-400" : "bg-cyan-600"}`}></span>
                Berita & Kegiatan Terkait
              </h2>
              <Link
                to="/berita"
                className={`text-[11px] min-[350px]:text-xs sm:text-sm font-semibold transition-all ${isDark ? "text-cyan-400 hover:text-cyan-300 hover:underline hover:underline-offset-4" : "text-cyan-600 hover:text-cyan-700 hover:underline hover:underline-offset-4"}`}
              >
                Lihat Semua &rarr;
              </Link>
            </div>

            <div className="grid gap-4 min-[350px]:gap-6 sm:grid-cols-3">
              {relatedNews.map((news) => (
                <div
                  key={news.id}
                  onClick={() => navigate(`/berita/${news.slug}`)}
                  className={`berita-related-card group cursor-pointer overflow-hidden rounded-xl min-[350px]:rounded-2xl transition-all duration-300 hover:-translate-y-1.5 ${isDark ? "border border-slate-700/50 bg-brand-navy hover:border-cyan-400/50" : "border border-slate-200 bg-white hover:border-cyan-400/50"}`}
                >
                  <div className={`h-40 min-[350px]:h-44 w-full overflow-hidden relative ${isDark ? "bg-slate-950" : "bg-slate-100"}`}>
                    <img
                      src={imageUrl(news.image)}
                      alt={news.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                  </div>
                  <div className="p-4 min-[350px]:p-5 space-y-2 min-[350px]:space-y-2.5">
                    <div className={`flex items-center gap-1.5 min-[350px]:gap-2 text-[10px] min-[350px]:text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      <Calendar
                        size={10}
                        className={`min-[350px]:w-3 min-[350px]:h-3 ${isDark ? "text-cyan-400" : "text-cyan-600"}`}
                      />
                      <span>{news.date || "Terbaru"}</span>
                    </div>
                    <h3 className={`text-xs min-[350px]:text-sm sm:text-base font-bold line-clamp-2 leading-snug ${isDark ? "text-white" : "text-slate-800"}`}>
                      {news.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsShareModalOpen(false)}
          ></div>

          <div className={`relative w-full max-w-md transform overflow-hidden rounded-3xl border p-6 shadow-2xl transition-all sm:p-8 ${isDark ? "border-white/10 bg-slate-900 text-white shadow-cyan-900/20" : "border-slate-200 bg-white text-slate-900 shadow-slate-300/50"}`}>
            <div className="mb-6 flex items-center justify-between">
              <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Bagikan ke...</h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className={`cursor-pointer rounded-full p-2 transition ${isDark ? "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"}`}
                aria-label="Tutup"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-8 grid grid-cols-4 gap-4">
              <a
                href={`https://api.whatsapp.com/send?text=${shareTitle}%20-%20${currentUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-2"
              >
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 cursor-pointer items-center justify-center rounded-full bg-social-whatsapp/10 text-social-whatsapp transition group-hover:bg-social-whatsapp group-hover:text-white">
                  <MessageCircle size={24} />
                </div>
                <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200">
                  WhatsApp
                </span>
              </a>

              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${shareTitle}`}
                target="_blank"
                rel="noopener noreferrer"
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
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
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
              </a>

              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${shareTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-2"
              >
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 cursor-pointer items-center justify-center rounded-full bg-social-telegram/10 text-social-telegram transition group-hover:bg-social-telegram group-hover:text-white">
                  <Send size={24} />
                </div>
                <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200">
                  Telegram
                </span>
              </a>
            </div>

            <div className={`flex items-center justify-between rounded-xl border p-1.5 pl-4 ${isDark ? "border-white/10 bg-black/30" : "border-slate-200 bg-slate-50"}`}>
              <div className={`mr-4 overflow-hidden text-ellipsis whitespace-nowrap text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                {currentUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition border ${isDark ? "bg-white text-slate-700 hover:bg-slate-50 border-white/10" : "bg-blue-600 text-white hover:bg-blue-700 border-blue-600"}`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Tersalin!" : "Salin"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default BeritaDetail
