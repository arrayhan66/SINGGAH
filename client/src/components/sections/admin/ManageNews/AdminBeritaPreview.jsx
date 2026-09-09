import { useMemo } from "react"
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom"
import {
  ArrowLeft,
  Calendar,
  Newspaper,
  Eye,
} from "lucide-react"
import { useBerita } from "../../../../context/BeritaContext"
import { useTheme } from "../../../../context/ThemeContext"
import { imageUrl } from "../../../../utils/imageUrl"
import SmartImage from "../../../ui/SmartImage"
import { NewsContent } from "../../berita/BeritaDetail"

function AdminBeritaPreview() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { beritaList, getBeritaBySlug, tempPreviewData } = useBerita()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const isTempPreview = String(slug) === "temp"
  const fromEditor = isTempPreview && searchParams.get("from") === "edit"
  const editSlug = searchParams.get("slug")
  const item = isTempPreview ? tempPreviewData : getBeritaBySlug(slug)
  const relatedNews = isTempPreview ? [] : beritaList.filter((b) => b.slug !== slug).slice(0, 3)

  const backTarget = isTempPreview
    ? (fromEditor && editSlug ? `/berita/edit/${editSlug}` : "/berita/tambah")
    : "/berita"

  const headlineSrc = useMemo(() => {
    if (!item?.image) return null
    if (typeof item.image === "string") return imageUrl(item.image)
    if (item.image instanceof File) return URL.createObjectURL(item.image)
    return null
  }, [item?.image])

  if (!item) {
    return (
      <section className="relative min-h-screen bg-brand-dark pt-16 pb-16">
        <div className="relative z-10 mx-auto max-w-2xl px-4 text-center">
          <Newspaper className="mx-auto h-12 w-12 text-slate-500" />
          <h2 className="mt-4 text-xl font-bold text-white">
            Berita tidak ditemukan
          </h2>
          <p className="mt-2 text-sm text-slate-400">
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
    <section className="relative overflow-hidden bg-brand-dark min-h-screen pb-16 sm:pb-20 lg:pb-24">
      <div className="relative z-10 mx-auto max-w-4xl px-3 min-[350px]:px-5 sm:px-8 2xl:max-w-5xl pt-10 sm:pt-14 lg:pt-16">
        <div className="berita-article-card overflow-hidden border border-slate-700/60 rounded-2xl min-[350px]:rounded-3xl bg-brand-navy">
          <div className="p-4 min-[350px]:p-5 sm:p-8 lg:p-10 pb-6 min-[350px]:pb-8 sm:pb-12 lg:pb-14 bg-brand-navy border-b border-slate-800/80">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-0">
              <Link
                to={backTarget}
                className="group inline-flex items-center gap-1.5 min-[350px]:gap-2 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs min-[350px]:text-sm transition-all duration-300 shadow-sm cursor-pointer border border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 shrink-0">
                  <ArrowLeft
                    size={14}
                    className="transition-transform duration-300 group-hover:-translate-x-0.5"
                  />
                </span>
                <span className="font-semibold">
                  Kembali{" "}
                  <span className="hidden sm:inline">{backTarget === "/berita" ? "ke Kelola Berita" : "ke Editor"}</span>
                </span>
              </Link>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-[11px] text-cyan-300 shadow-sm min-[650px]:gap-2 min-[650px]:px-4 min-[650px]:py-2 min-[650px]:text-sm">
                <Eye size={11} className="shrink-0 text-cyan-400 min-[650px]:h-4 min-[650px]:w-4" />
                <span className="font-semibold">Preview Mode</span>
              </span>
            </div>

            <div className="mt-6 min-[350px]:mt-8 sm:mt-10 space-y-2 min-[350px]:space-y-3">
              {item.tags?.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 min-[350px]:gap-2">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md min-[350px]:rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-2 min-[350px]:px-3 py-0.5 min-[350px]:py-1 text-[10px] min-[350px]:text-xs font-bold tracking-wider uppercase text-cyan-300 shadow-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 3 && (
                    <span className="rounded-md min-[350px]:rounded-lg border border-white/10 bg-white/5 px-2 min-[350px]:px-3 py-0.5 min-[350px]:py-1 text-[10px] min-[350px]:text-xs font-semibold tracking-wider text-slate-400">
                      +{item.tags.length - 3}
                    </span>
                  )}
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

                  <div className="flex items-center gap-1 min-[350px]:gap-1.5 font-medium">
                    <Eye
                      size={12}
                      className={`min-[350px]:w-3.5 min-[350px]:h-3.5 ${isDark ? "text-cyan-400" : "text-cyan-600"}`}
                    />
                    <span>Preview</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {headlineSrc && (
            <div className="relative h-48 min-[350px]:h-64 sm:h-88 lg:h-[420px] w-full overflow-hidden bg-slate-950">
              <SmartImage
                src={headlineSrc}
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
          )}

          <div className={`p-3 min-[350px]:p-6 sm:p-10 lg:p-14 pt-3 min-[350px]:pt-5 space-y-3 min-[350px]:space-y-6 ${isDark ? "bg-brand-navy text-white" : "bg-white text-slate-900"}`}>
            <div className={`flex flex-col gap-2 min-[350px]:gap-6 text-sm min-[350px]:text-base sm:text-lg leading-relaxed font-normal ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              <NewsContent item={item} />
            </div>

            <div className={`pt-6 min-[350px]:pt-8 border-t flex flex-wrap items-center justify-between gap-3 min-[350px]:gap-4 ${isDark ? "border-slate-700" : "border-slate-200"}`}>
              <span className={`inline-flex items-center gap-1.5 px-3 min-[350px]:px-4 py-1.5 min-[350px]:py-2 rounded-lg min-[350px]:rounded-xl text-[11px] min-[350px]:text-xs font-bold transition-all shadow-xs ${isDark ? "border border-cyan-400/30 bg-cyan-400/10 text-cyan-300" : "bg-cyan-400/10 border border-cyan-400/40 text-cyan-300"}`}>
                <Eye size={12} className="min-[350px]:w-3.5 min-[350px]:h-3.5" />
                Preview Admin
              </span>

              {item.source && (
                <div className={`text-[10px] min-[350px]:text-xs flex items-center gap-1 min-[350px]:gap-1.5 px-2 min-[350px]:px-2.5 sm:px-3.5 py-1.5 min-[350px]:py-2 rounded-lg min-[350px]:rounded-xl ${isDark ? "text-slate-400 bg-white/5 border border-white/10" : "text-slate-600 bg-slate-50 border border-slate-200"}`}>
                  <Newspaper size={12} className="min-[350px]:w-3.5 min-[350px]:h-3.5 text-cyan-600 shrink-0" />
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
                Berita & Kegiatan Lainnya
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
                  onClick={() => navigate(`/berita/preview/${news.slug}`)}
                  className={`berita-related-card group cursor-pointer overflow-hidden rounded-xl min-[350px]:rounded-2xl transition-all duration-300 hover:-translate-y-1.5 ${isDark ? "border border-slate-700/50 bg-brand-navy hover:border-cyan-400/50" : "border border-slate-200 bg-white hover:border-cyan-400/50"}`}
                >
                  <div className={`h-40 min-[350px]:h-44 w-full overflow-hidden relative ${isDark ? "bg-slate-950" : "bg-slate-100"}`}>
                    <SmartImage
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
    </section>
  )
}

export default AdminBeritaPreview
