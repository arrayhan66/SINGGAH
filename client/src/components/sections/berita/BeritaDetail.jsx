import { useParams, useNavigate, Link } from "react-router-dom"
import { ArrowLeft, User, Calendar, Newspaper, ImageIcon } from "lucide-react"
import { useBerita } from "../../../context/BeritaContext"
import DustBackground from "../../ui/DustBackground"
import GlowBackground from "../../ui/GlowBackground"
import GlassCard from "../../ui/GlassCard"

function BeritaDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { beritaList } = useBerita()

  const item = beritaList.find((b) => String(b.id) === id)
  const relatedNews = beritaList.filter((b) => String(b.id) !== id).slice(0, 3)

  if (!item) {
    return (
      <section className="relative min-h-screen bg-brand-navy pt-32 pb-16 px-5">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-white">
            Berita tidak ditemukan
          </h2>
          <p className="mt-2 text-slate-400">
            Artikel yang kamu cari mungkin sudah dihapus atau tidak tersedia.
          </p>
          <Link
            to="/berita"
            className="mt-6 inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-200"
          >
            <ArrowLeft size={16} />
            Kembali ke Berita
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden bg-brand-navy pt-24 lg:pt-28 pb-16 px-5 sm:px-8">
      <GlowBackground />
      <DustBackground />

      <div className="relative z-10 mx-auto max-w-3xl">
        <button
          onClick={() => navigate("/berita")}
          className="flex items-center gap-2 text-sm text-slate-300 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali ke Berita
        </button>

        <GlassCard className="mt-6 overflow-hidden">
          {/* Foto Headline */}
          <div className="relative h-56 sm:h-80 w-full overflow-hidden bg-brand-dark">
            <img
              src={item.image}
              alt={item.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 via-transparent to-transparent" />
          </div>

          <div className="p-6 sm:p-10">
            {/* Tags */}
            {item.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[11px] font-medium text-cyan-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className="mt-4 text-2xl sm:text-3xl font-black text-white">
              {item.title}
            </h1>
            <p className="mt-2 text-base font-medium text-cyan-300">
              {item.event}
            </p>

            {/* Meta info */}
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-white/10 py-4 text-sm text-slate-400">
              <div className="flex items-center gap-2 min-w-0">
                <User size={16} className="text-cyan-400 shrink-0" />
                <span className="truncate">{item.winner}</span>
              </div>
              {item.date && (
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-cyan-400 shrink-0" />
                  <span>{item.date}</span>
                </div>
              )}
              {item.source && (
                <div className="flex items-center gap-2 min-w-0">
                  <Newspaper size={16} className="text-cyan-400 shrink-0" />
                  <span className="truncate">{item.source}</span>
                </div>
              )}
            </div>

            {/* Isi artikel */}
            <div className="mt-6 flex flex-col gap-4">
              {item.content.map((paragraph, index) => (
                <p key={index} className="leading-7 text-slate-300">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Galeri Foto */}
            {item.gallery?.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <ImageIcon size={16} className="text-cyan-400" />
                  Galeri Foto
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {item.gallery.map((photo, index) => (
                    <div
                      key={index}
                      className="overflow-hidden rounded-xl border border-white/10 bg-white/5"
                    >
                      <div className="aspect-video w-full overflow-hidden">
                        <img
                          src={photo.url}
                          alt={photo.caption}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                      </div>
                      <p className="px-3 py-2.5 text-xs text-slate-400 leading-relaxed">
                        {photo.caption}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Berita Lainnya */}
        {relatedNews.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Berita Lainnya
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {relatedNews.map((news) => (
                <GlassCard
                  key={news.id}
                  hover
                  onClick={() => navigate(`/berita/${news.id}`)}
                  className="cursor-pointer overflow-hidden"
                >
                  <div className="h-32 w-full overflow-hidden bg-brand-dark">
                    <img
                      src={news.image}
                      alt={news.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="truncate text-sm font-semibold text-white">
                      {news.title}
                    </h3>
                    <p className="mt-1 truncate text-xs text-slate-400">
                      {news.event}
                    </p>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default BeritaDetail
