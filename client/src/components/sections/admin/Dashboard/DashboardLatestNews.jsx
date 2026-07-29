import { useNavigate } from "react-router-dom"
import { Newspaper, ArrowRight, BookOpen } from "lucide-react"
import { beritaData } from "../../../../data/beritaData"
import GlowBackground from "../../../ui/GlowBackground"
import DustBackground from "../../../ui/DustBackground"

function DashboardLatestNews() {
  const navigate = useNavigate()
  const latestNews = beritaData.slice(0, 4)

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 md:p-6 backdrop-blur-xl">
      <GlowBackground />
      <DustBackground />
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-blue-300" />
            <h2 className="text-sm md:text-base font-semibold text-white">
              Berita Terbaru
            </h2>
          </div>

          <button
            onClick={() => navigate("/admin/berita")}
            className="flex cursor-pointer items-center gap-1.5 text-xs md:text-sm text-cyan-300 hover:text-cyan-200 transition-colors"
          >
            Lihat Semua
            <ArrowRight size={14} />
          </button>
        </div>

        {latestNews.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-2 py-8 text-center">
            <BookOpen className="h-8 w-8 text-slate-500" />
            <p className="text-sm text-slate-400">
              Belum ada berita.
            </p>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            {latestNews.map((news) => (
              <div
                key={news.id}
                className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 min-w-0 transition-all duration-200 hover:bg-white/[0.06] hover:border-white/[0.12]"
              >
                <img
                  src={news.image}
                  alt={news.title}
                  className="h-12 w-16 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium text-white">
                    {news.title}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {news.date}
                  </p>
                </div>
                <span className="hidden sm:inline shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-400">
                  {news.tags[0]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardLatestNews
