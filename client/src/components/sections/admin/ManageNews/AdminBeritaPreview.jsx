import { useParams, useNavigate, Link } from "react-router-dom"
import {
  ArrowLeft,
  Calendar,
  Newspaper,
  Eye,
  Share2,
} from "lucide-react"
import { useBerita } from "../../../../context/BeritaContext"
import DustBackground from "../../../ui/DustBackground"

function AdminBeritaPreview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { beritaList, getBeritaById, tempPreviewData } = useBerita()

  const isTempPreview = String(id) === "temp"
  const item = getBeritaById(id)
  const relatedNews = isTempPreview ? [] : beritaList.filter((b) => b.id !== Number(id)).slice(0, 3)

  if (!item) {
    return (
      <section className="relative min-h-screen bg-brand-navy pt-16 pb-16">
        <DustBackground />
        <div className="relative z-10 mx-auto max-w-2xl px-4 text-center">
          <Newspaper className="mx-auto h-12 w-12 text-slate-500" />
          <h2 className="mt-4 text-xl font-bold text-white">
            Berita tidak ditemukan
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Artikel yang kamu cari mungkin sudah dihapus atau tidak tersedia.
          </p>
          <Link
            to="/admin/berita"
            className="mt-6 inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition-colors"
          >
            <ArrowLeft size={16} />
            Kembali
          </Link>
        </div>
      </section>
    )
  }

  function renderContent() {
    const hasHTML = item.contentHTML && typeof item.contentHTML === "string" && item.contentHTML.includes("<")

    if (hasHTML) {
      return (
        <div
          className="prose prose-sm sm:prose-base max-w-none prose-headings:font-bold prose-a:text-cyan-600 prose-img:rounded-xl prose-img:mx-auto prose-p:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: item.contentHTML }}
        />
      )
    }

    const paragraphs = Array.isArray(item.content) ? item.content : [String(item.content || "")]

    return (
      <>
        {paragraphs.map((paragraph, index) => {
          const correspondingPhoto = item.gallery?.[index]

          if (index === 0) {
            const firstLetter = paragraph.charAt(0)
            const restOfParagraph = paragraph.slice(1)

            return (
              <div key={index} className="space-y-6">
                <p className="text-base sm:text-lg leading-relaxed text-slate-800 font-normal">
                  <span className="float-left text-4xl sm:text-5xl font-black text-cyan-600 mr-3 leading-none pt-1">
                    {firstLetter}
                  </span>
                  {restOfParagraph}
                </p>

                {correspondingPhoto && (
                  <figure className="my-6 sm:my-8 overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 shadow-md">
                    <div className="w-full max-h-[500px] overflow-hidden bg-slate-200">
                      <img
                        src={correspondingPhoto.url}
                        alt={correspondingPhoto.caption}
                        className="w-full h-auto object-cover transition-transform duration-500 hover:scale-[1.02]"
                      />
                    </div>
                    <figcaption className="px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs sm:text-sm text-slate-600 border-t border-slate-200 italic leading-relaxed flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-white">
                      <span>{correspondingPhoto.caption}</span>
                      <span className="not-italic text-cyan-700 font-bold uppercase tracking-wider text-[10px] bg-cyan-50 px-2.5 py-1 rounded border border-cyan-200 shrink-0">
                        Dok. SINGGAH
                      </span>
                    </figcaption>
                  </figure>
                )}
              </div>
            )
          }

          return (
            <div key={index} className="space-y-6">
              <p className="leading-relaxed text-slate-700">{paragraph}</p>

              {correspondingPhoto && (
                <figure className="my-6 sm:my-8 overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 shadow-md">
                  <div className="w-full max-h-[500px] overflow-hidden bg-slate-200">
                    <img
                      src={correspondingPhoto.url}
                      alt={correspondingPhoto.caption}
                      className="w-full h-auto object-cover transition-transform duration-500 hover:scale-[1.02]"
                    />
                  </div>
                  <figcaption className="px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs sm:text-sm text-slate-600 border-t border-slate-200 italic leading-relaxed flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-white">
                    <span>{correspondingPhoto.caption}</span>
                    <span className="not-italic text-cyan-700 font-bold uppercase tracking-wider text-[10px] bg-cyan-50 px-2.5 py-1 rounded border border-cyan-200 shrink-0">
                      Dok. SINGGAH
                    </span>
                  </figcaption>
                </figure>
              )}
            </div>
          )
        })}

        {/* Gallery items beyond paragraph count */}
        {item.gallery && paragraphs.length > 0 && item.gallery.length > paragraphs.length && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-1 h-5 bg-cyan-400 rounded-full" />
              <h3 className="text-lg font-bold text-slate-800">Dokumentasi Lainnya</h3>
            </div>
            {item.gallery.slice(paragraphs.length).map((photo, i) => (
              <figure key={i} className="overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 shadow-md">
                <div className="w-full max-h-[500px] overflow-hidden bg-slate-200">
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="w-full h-auto object-cover"
                  />
                </div>
                {photo.caption && (
                  <figcaption className="px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs sm:text-sm text-slate-600 border-t border-slate-200 italic bg-white">
                    {photo.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </>
    )
  }

  return (
    <section className="relative overflow-hidden bg-brand-navy min-h-screen pb-16 sm:pb-20 lg:pb-24">
      <DustBackground />

      <div className="relative z-10 mx-auto max-w-4xl px-3 sm:px-8 2xl:max-w-5xl pt-10 sm:pt-14 lg:pt-16">
        <div className="overflow-hidden border border-slate-700/60 shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-2xl sm:rounded-3xl bg-brand-navy">
          <div className="p-4 sm:p-8 lg:p-10 bg-brand-navy border-b border-slate-800/80">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-0">
              <Link
                to="/admin/berita"
                className="group inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 sm:py-2 sm:pl-3 sm:pr-4 text-xs sm:text-sm text-slate-300 transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300 shadow-sm"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 shrink-0">
                  <ArrowLeft
                    size={14}
                    className="transition-transform duration-300 group-hover:-translate-x-0.5"
                  />
                </span>
                <span className="font-semibold">
                  Kembali{" "}
                  <span className="hidden sm:inline">ke Kelola Berita</span>
                </span>
              </Link>

              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300 shadow-sm">
                <Eye size={13} className="text-cyan-400 shrink-0" />
                <span className="font-semibold">Preview Mode</span>
              </span>
            </div>

            <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
              {item.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md sm:rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold tracking-wider uppercase text-cyan-300 shadow-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-white leading-[1.2] tracking-tight">
                {item.title}
              </h1>

              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-3 sm:gap-4 pt-3 border-t border-slate-800/80 text-xs sm:text-sm text-slate-400">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 font-bold text-[10px] sm:text-xs shrink-0">
                    {(item.winner || item.source || "A")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-200 text-xs sm:text-sm leading-tight">
                      {item.winner || item.source || "Tim Redaksi SINGGAH"}
                    </p>
                    <p className="text-[11px] text-cyan-400 font-medium leading-tight">
                      Divisi Publikasi & Media Akademik
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-400">
                  {item.date && (
                    <div className="flex items-center gap-1 sm:gap-1.5 font-medium">
                      <Calendar size={12} className="sm:w-3.5 sm:h-3.5 text-cyan-400" />
                      <span>{item.date}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 sm:gap-1.5 font-medium">
                    <Eye size={12} className="sm:w-3.5 sm:h-3.5 text-cyan-400" />
                    <span>Preview</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {item.image && (
            <div className="relative h-48 sm:h-88 lg:h-[420px] w-full overflow-hidden bg-slate-950 border-b border-slate-800">
              <img
                src={
                  typeof item.image === "string"
                    ? item.image
                    : URL.createObjectURL(item.image)
                }
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-2 sm:bottom-3 left-3 sm:left-6 right-3 sm:right-6 text-right">
                <span className="text-[11px] sm:text-xs text-slate-200 bg-slate-950/80 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md backdrop-blur-md border border-slate-700/50 italic font-medium">
                  Dokumentasi Resmi SINGGAH
                </span>
              </div>
            </div>
          )}

          <div className="p-4 sm:p-10 lg:p-14 pt-6 sm:pt-8 space-y-6 sm:space-y-8 bg-white text-slate-900">
            <div className="flex flex-col gap-6 sm:gap-8 text-sm sm:text-base sm:text-lg leading-relaxed text-slate-700 font-normal">
              {item.desc && (
                <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-4 text-cyan-800 text-sm italic">
                  {item.desc}
                </div>
              )}

              {renderContent()}
            </div>

            <div className="pt-6 sm:pt-8 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
              {item.source && (
                <div className="text-xs text-slate-600 flex items-center gap-1.5 bg-slate-50 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-slate-200">
                  <Newspaper size={12} className="text-cyan-600 shrink-0" />
                  <span>
                    Sumber:{" "}
                    <strong className="text-slate-900 font-bold">
                      {item.source}
                    </strong>
                  </span>
                </div>
              )}

              <span className="text-[10px] sm:text-xs text-cyan-700 font-bold uppercase tracking-wider bg-cyan-50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-cyan-200">
                Preview Admin
              </span>
            </div>
          </div>
        </div>

        {relatedNews.length > 0 && (
          <div className="mt-10 sm:mt-16">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span className="w-1.5 sm:w-2 h-5 sm:h-6 bg-cyan-400 rounded-full inline-block"></span>
                Berita & Kegiatan Terkait
              </h2>
              <Link
                to="/admin/berita"
                className="text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Lihat Semua &rarr;
              </Link>
            </div>

            <div className="grid gap-4 sm:gap-6 sm:grid-cols-3">
              {relatedNews.map((news) => (
                <div
                  key={news.id}
                  onClick={() => navigate(`/admin/berita/preview/${news.id}`)}
                  className="group cursor-pointer overflow-hidden border border-slate-700/50 bg-slate-900/40 backdrop-blur-xl rounded-xl sm:rounded-2xl transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan-400/50 shadow-xl"
                >
                  <div className="h-40 sm:h-44 w-full overflow-hidden bg-slate-950 relative">
                    <img
                      src={news.image}
                      alt={news.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                      <span className="rounded-md bg-slate-950/80 backdrop-blur-md px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] font-bold tracking-wider text-cyan-300 uppercase border border-cyan-400/30">
                        {news.event}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5 space-y-2 sm:space-y-2.5">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] text-slate-400">
                      <Calendar size={10} className="sm:w-3 sm:h-3 text-cyan-400" />
                      <span>{news.date || "Terbaru"}</span>
                    </div>
                    <h3 className="text-xs sm:text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
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