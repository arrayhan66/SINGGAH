import { useNavigate } from "react-router-dom"
import { Newspaper, ArrowRight, BookOpen } from "lucide-react"
import { useBerita } from "../../../../context/BeritaContext"
import { imageUrl } from "../../../../utils/imageUrl"

function DashboardLatestNews() {
  const navigate = useNavigate()
  const { beritaList } = useBerita()
  const latestNews = beritaList.slice(0, 4)

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-slate-800/30 p-5 shadow-xl backdrop-blur-xl md:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15">
            <Newspaper className="h-4 w-4 text-blue-400" />
          </div>
          <h2 className="text-[17px] font-semibold text-white md:text-[18px]">
            Berita Terbaru
          </h2>
        </div>

        <button
          onClick={() => navigate("/berita")}
          className="group flex cursor-pointer items-center gap-1.5 text-xs font-medium text-cyan-400 transition-all duration-200 hover:text-cyan-300"
        >
          Lihat Semua
          <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </div>

      {latestNews.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 py-6 text-center">
          <BookOpen className="h-8 w-8 text-slate-400" />
          <p className="text-sm text-slate-300">
            Belum ada berita.
          </p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {latestNews.map((news) => (
            <div
              key={news.id}
              className="group flex flex-col gap-3 rounded-[14px] border border-slate-200/80 bg-white p-3 transition-all duration-250 hover:-translate-y-[2px] hover:bg-slate-50 hover:shadow-md sm:flex-row sm:items-center"
              style={{ minHeight: 90 }}
            >
              <img
                src={imageUrl(news.image)}
                alt={news.title}
                className="h-[72px] w-full shrink-0 rounded-lg object-cover sm:h-[72px] sm:w-[72px]"
              />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-[15px] font-semibold text-slate-900 md:text-[17px]">
                  {news.title}
                </p>
                <p className="mt-0.5 text-sm text-slate-500">
                  {news.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DashboardLatestNews
