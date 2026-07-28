import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  ArrowLeft,
  Calendar,
  Newspaper,
  Share2,
  Eye,
  X,
  Check,
  Copy,
  MessageCircle,
  Send,
} from "lucide-react"
import { useBerita } from "../../../context/BeritaContext"
import DustBackground from "../../ui/DustBackground"

function BeritaDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { beritaList } = useBerita()

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

  if (!item) {
    return (
      <section className="relative min-h-screen bg-brand-navy pt-[calc(var(--navbar-h)+16px)] sm:pt-[calc(var(--navbar-h)+24px)] pb-16">
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
    <section className="relative overflow-hidden bg-brand-navy min-h-screen pt-[calc(var(--navbar-h)+16px)] sm:pt-[calc(var(--navbar-h)+24px)] pb-16 sm:pb-20 lg:pb-24">
      <DustBackground />

      <div className="relative z-10 mx-auto max-w-4xl px-3 min-[350px]:px-5 sm:px-8 2xl:max-w-5xl">
        <div className="overflow-hidden border border-slate-700/60 shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-2xl min-[350px]:rounded-3xl bg-brand-navy">
          <div className="p-4 min-[350px]:p-5 sm:p-8 lg:p-10 bg-brand-navy border-b border-slate-800/80">
            {/* Dibikin flex-wrap biar di 260px tombolnya nggak maksa nyamping */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-0">
              <Link
                to="/berita"
                aria-label="Kembali"
                className="group inline-flex items-center gap-1.5 min-[350px]:gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 min-[350px]:p-2.5 sm:py-2 sm:pl-3 sm:pr-4 text-xs min-[350px]:text-sm text-slate-300 transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300 shadow-sm"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 shrink-0">
                  <ArrowLeft
                    size={14}
                    className="transition-transform duration-300 group-hover:-translate-x-0.5"
                  />
                </span>
                <span className="font-semibold">
                  Kembali{" "}
                  <span className="hidden sm:inline">ke Indeks Berita</span>
                </span>
              </Link>

              <button
                onClick={() => setIsShareModalOpen(true)}
                aria-label="Bagikan Artikel"
                className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300 transition-all duration-300 shadow-sm cursor-pointer"
              >
                <Share2
                  size={13}
                  className="min-[350px]:w-3.5 min-[350px]:h-3.5 text-cyan-400 shrink-0"
                />
                <span className="font-semibold">Bagikan</span>
              </button>
            </div>

            <div className="mt-4 min-[350px]:mt-5 sm:mt-6 space-y-3 min-[350px]:space-y-4">
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

              <div className="flex flex-col min-[350px]:flex-row flex-wrap items-start min-[350px]:items-center justify-between gap-3 min-[350px]:gap-4 pt-3 border-t border-slate-800/80 text-xs sm:text-sm text-slate-400">
                <div className="flex items-center gap-2.5 min-[350px]:gap-3">
                  <div className="h-7 w-7 min-[350px]:h-9 min-[350px]:w-9 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 font-bold text-[10px] min-[350px]:text-xs shrink-0">
                    {(item.winner || item.source || "A")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-200 text-[11px] min-[350px]:text-xs sm:text-sm leading-tight min-[350px]:leading-normal">
                      {item.winner || item.source || "Tim Redaksi SINGGAH"}
                    </p>
                    <p className="text-[9px] min-[350px]:text-[11px] text-cyan-400 font-medium leading-tight min-[350px]:leading-normal">
                      Divisi Publikasi & Media Akademik
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 min-[350px]:gap-4 text-[10px] min-[350px]:text-xs sm:text-sm text-slate-400">
                  {item.date && (
                    <div className="flex items-center gap-1 min-[350px]:gap-1.5 font-medium">
                      <Calendar
                        size={12}
                        className="min-[350px]:w-3.5 min-[350px]:h-3.5 text-cyan-400"
                      />
                      <span>{item.date}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 min-[350px]:gap-1.5 font-medium">
                    <Eye
                      size={12}
                      className="min-[350px]:w-3.5 min-[350px]:h-3.5 text-cyan-400"
                    />
                    <span>1.4RB Views</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative h-48 min-[350px]:h-64 sm:h-88 lg:h-[420px] w-full overflow-hidden bg-slate-950 border-b border-slate-800">
            <img
              src={item.image}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-102"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-2 min-[350px]:bottom-3 left-3 min-[350px]:left-4 right-3 min-[350px]:right-4 sm:left-6 sm:right-6 text-right">
              <span className="text-[9px] min-[350px]:text-[11px] sm:text-xs text-slate-200 bg-slate-950/80 px-2 min-[350px]:px-3 py-0.5 min-[350px]:py-1 rounded-md backdrop-blur-md border border-slate-700/50 italic font-medium">
                Dokumentasi Resmi SINGGAH
              </span>
            </div>
          </div>

          <div className="p-4 min-[350px]:p-6 sm:p-10 lg:p-14 pt-6 min-[350px]:pt-8 space-y-6 min-[350px]:space-y-8 bg-white text-slate-900">
            <div className="flex flex-col gap-6 min-[350px]:gap-8 text-sm min-[350px]:text-base sm:text-lg leading-relaxed text-slate-700 font-normal">
              {item.content?.map((paragraph, index) => {
                const correspondingPhoto = item.gallery?.[index]

                if (index === 0) {
                  const firstLetter = paragraph.charAt(0)
                  const restOfParagraph = paragraph.slice(1)

                  return (
                    <div
                      key={index}
                      className="space-y-6 min-[350px]:space-y-8"
                    >
                      <p className="text-base min-[350px]:text-lg sm:text-xl leading-relaxed text-slate-800 font-normal">
                        <span className="float-left text-4xl min-[350px]:text-5xl sm:text-6xl font-black text-cyan-600 mr-2.5 min-[350px]:mr-3.5 leading-none pt-1">
                          {firstLetter}
                        </span>
                        {restOfParagraph}
                      </p>

                      {correspondingPhoto && (
                        <figure className="my-6 min-[350px]:my-8 overflow-hidden rounded-xl min-[350px]:rounded-2xl border border-slate-200 bg-slate-50 shadow-md">
                          <div className="w-full max-h-[500px] overflow-hidden bg-slate-200">
                            <img
                              src={correspondingPhoto.url}
                              alt={correspondingPhoto.caption}
                              className="w-full h-auto object-cover transition-transform duration-500 hover:scale-[1.02]"
                            />
                          </div>
                          <figcaption className="px-3 min-[350px]:px-5 py-2.5 min-[350px]:py-3.5 text-[10px] min-[350px]:text-xs sm:text-sm text-slate-600 border-t border-slate-200 italic leading-relaxed flex flex-col min-[350px]:flex-row items-start min-[350px]:items-center justify-between gap-2 min-[350px]:gap-0 bg-white">
                            <span>{correspondingPhoto.caption}</span>
                            <span className="not-italic text-cyan-700 font-bold uppercase tracking-wider text-[9px] min-[350px]:text-[10px] bg-cyan-50 px-2 min-[350px]:px-2.5 py-0.5 min-[350px]:py-1 rounded border border-cyan-200 min-[350px]:ml-2 shrink-0">
                              Dok. SINGGAH
                            </span>
                          </figcaption>
                        </figure>
                      )}
                    </div>
                  )
                }

                return (
                  <div key={index} className="space-y-6 min-[350px]:space-y-8">
                    <p className="leading-relaxed text-slate-700">
                      {paragraph}
                    </p>

                    {correspondingPhoto && (
                      <figure className="my-6 min-[350px]:my-8 overflow-hidden rounded-xl min-[350px]:rounded-2xl border border-slate-200 bg-slate-50 shadow-md">
                        <div className="w-full max-h-[500px] overflow-hidden bg-slate-200">
                          <img
                            src={correspondingPhoto.url}
                            alt={correspondingPhoto.caption}
                            className="w-full h-auto object-cover transition-transform duration-500 hover:scale-[1.02]"
                          />
                        </div>
                        <figcaption className="px-3 min-[350px]:px-5 py-2.5 min-[350px]:py-3.5 text-[10px] min-[350px]:text-xs sm:text-sm text-slate-600 border-t border-slate-200 italic leading-relaxed flex flex-col min-[350px]:flex-row items-start min-[350px]:items-center justify-between gap-2 min-[350px]:gap-0 bg-white">
                          <span>{correspondingPhoto.caption}</span>
                          <span className="not-italic text-cyan-700 font-bold uppercase tracking-wider text-[9px] min-[350px]:text-[10px] bg-cyan-50 px-2 min-[350px]:px-2.5 py-0.5 min-[350px]:py-1 rounded border border-cyan-200 min-[350px]:ml-2 shrink-0">
                            Dok. SINGGAH
                          </span>
                        </figcaption>
                      </figure>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="pt-6 min-[350px]:pt-8 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 min-[350px]:gap-4">
              <div className="flex items-center gap-2 min-[350px]:gap-3">
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="px-3 min-[350px]:px-4 py-1.5 min-[350px]:py-2 rounded-lg min-[350px]:rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 text-[11px] min-[350px]:text-xs font-bold hover:bg-cyan-600 hover:text-white transition-all shadow-xs cursor-pointer flex items-center gap-1.5 min-[350px]:gap-2"
                >
                  <Share2
                    size={12}
                    className="min-[350px]:w-3.5 min-[350px]:h-3.5"
                  />
                  Bagikan
                </button>
              </div>

              {item.source && (
                <div className="text-[10px] min-[350px]:text-xs text-slate-600 flex items-center gap-1 min-[350px]:gap-1.5 bg-slate-50 px-2.5 min-[350px]:px-3.5 py-1.5 min-[350px]:py-2 rounded-lg min-[350px]:rounded-xl border border-slate-200">
                  <Newspaper
                    size={12}
                    className="min-[350px]:w-3.5 min-[350px]:h-3.5 text-cyan-600 shrink-0"
                  />
                  <span>
                    Sumber:{" "}
                    <strong className="text-slate-900 font-bold">
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
              <h2 className="text-lg min-[350px]:text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span className="w-1.5 min-[350px]:w-2 h-5 min-[350px]:h-6 bg-cyan-400 rounded-full inline-block"></span>
                Berita & Kegiatan Terkait
              </h2>
              <Link
                to="/berita"
                className="text-[11px] min-[350px]:text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Lihat Semua &rarr;
              </Link>
            </div>

            <div className="grid gap-4 min-[350px]:gap-6 sm:grid-cols-3">
              {relatedNews.map((news) => (
                <div
                  key={news.id}
                  onClick={() => navigate(`/berita/${news.slug}`)}
                  className="group cursor-pointer overflow-hidden border border-slate-700/50 bg-slate-900/40 backdrop-blur-xl rounded-xl min-[350px]:rounded-2xl transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan-400/50 shadow-xl"
                >
                  <div className="h-40 min-[350px]:h-44 w-full overflow-hidden bg-slate-950 relative">
                    <img
                      src={news.image}
                      alt={news.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 min-[350px]:top-3 left-2 min-[350px]:left-3">
                      <span className="rounded-md bg-slate-950/80 backdrop-blur-md px-2 min-[350px]:px-2.5 py-0.5 min-[350px]:py-1 text-[9px] min-[350px]:text-[10px] font-bold tracking-wider text-cyan-300 uppercase border border-cyan-400/30">
                        {news.event}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 min-[350px]:p-5 space-y-2 min-[350px]:space-y-2.5">
                    <div className="flex items-center gap-1.5 min-[350px]:gap-2 text-[10px] min-[350px]:text-[11px] text-slate-400">
                      <Calendar
                        size={10}
                        className="min-[350px]:w-3 min-[350px]:h-3 text-cyan-400"
                      />
                      <span>{news.date || "Terbaru"}</span>
                    </div>
                    <h3 className="text-xs min-[350px]:text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 min-[350px]:p-4 bg-slate-950/80 backdrop-blur-md transition-all">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl min-[350px]:rounded-3xl p-5 min-[350px]:p-6 sm:p-8 shadow-2xl space-y-5 min-[350px]:space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 min-[350px]:pb-4">
              <div className="flex items-center gap-2 min-[350px]:gap-2.5">
                <div className="h-7 w-7 min-[350px]:h-9 min-[350px]:w-9 rounded-lg min-[350px]:rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <Share2
                    size={14}
                    className="min-[350px]:w-[18px] min-[350px]:h-[18px]"
                  />
                </div>
                <h3 className="text-base min-[350px]:text-lg font-bold text-white leading-tight">
                  Bagikan Berita Ini
                </h3>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="h-7 w-7 min-[350px]:h-8 min-[350px]:w-8 shrink-0 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={14} className="min-[350px]:w-4 min-[350px]:h-4" />
              </button>
            </div>

            {/* Dibikin 1 kolom di 260px, 3 kolom di 350px ke atas biar gak numpuk/melar */}
            <div className="grid grid-cols-1 min-[350px]:grid-cols-3 gap-2 min-[350px]:gap-3">
              <a
                href={`https://api.whatsapp.com/send?text=${shareTitle}%20-%20${currentUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-row min-[350px]:flex-col items-center justify-start min-[350px]:justify-center gap-3 min-[350px]:gap-2 p-3 min-[350px]:p-4 rounded-xl min-[350px]:rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-cyan-400/50 hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer group"
              >
                <div className="h-8 w-8 min-[350px]:h-10 min-[350px]:w-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                  <MessageCircle
                    size={16}
                    className="min-[350px]:w-5 min-[350px]:h-5"
                  />
                </div>
                <span className="text-[11px] min-[350px]:text-xs font-semibold">
                  WhatsApp
                </span>
              </a>

              <a
                href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${currentUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-row min-[350px]:flex-col items-center justify-start min-[350px]:justify-center gap-3 min-[350px]:gap-2 p-3 min-[350px]:p-4 rounded-xl min-[350px]:rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-cyan-400/50 hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer group"
              >
                <div className="h-8 w-8 min-[350px]:h-10 min-[350px]:w-10 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                  <Send
                    size={14}
                    className="min-[350px]:w-[18px] min-[350px]:h-[18px]"
                  />
                </div>
                <span className="text-[11px] min-[350px]:text-xs font-semibold">
                  Twitter / X
                </span>
              </a>

              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-row min-[350px]:flex-col items-center justify-start min-[350px]:justify-center gap-3 min-[350px]:gap-2 p-3 min-[350px]:p-4 rounded-xl min-[350px]:rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-cyan-400/50 hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer group"
              >
                <div className="h-8 w-8 min-[350px]:h-10 min-[350px]:w-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                  <Share2
                    size={14}
                    className="min-[350px]:w-[18px] min-[350px]:h-[18px]"
                  />
                </div>
                <span className="text-[11px] min-[350px]:text-xs font-semibold">
                  LinkedIn
                </span>
              </a>
            </div>

            <div className="space-y-1.5 min-[350px]:space-y-2">
              <label className="text-[10px] min-[350px]:text-xs font-semibold text-slate-400">
                Atau salin tautan artikel
              </label>
              {/* Flex-col di layar 260px biar input & tombol ga saling dempet sampe jebol */}
              <div className="flex flex-col min-[350px]:flex-row items-stretch min-[350px]:items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl min-[350px]:rounded-2xl p-1.5 min-[350px]:p-2 min-[350px]:pl-3">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="w-full bg-slate-900 min-[350px]:bg-transparent rounded-lg min-[350px]:rounded-none p-2 min-[350px]:p-0 text-[10px] min-[350px]:text-xs text-slate-300 focus:outline-none truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 min-[350px]:px-4 py-2 min-[350px]:py-2 rounded-lg min-[350px]:rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[11px] min-[350px]:text-xs font-bold transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer w-full min-[350px]:w-auto"
                >
                  {copied ? (
                    <>
                      <Check
                        size={12}
                        className="min-[350px]:w-3.5 min-[350px]:h-3.5"
                      />
                      <span>Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy
                        size={12}
                        className="min-[350px]:w-3.5 min-[350px]:h-3.5"
                      />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default BeritaDetail
