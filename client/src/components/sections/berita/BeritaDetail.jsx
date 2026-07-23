import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
} from "lucide-react";
import { useBerita } from "../../../context/BeritaContext";
import DustBackground from "../../ui/DustBackground";

function BeritaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { beritaList } = useBerita();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const item = beritaList.find((b) => String(b.id) === id);
  const relatedNews = beritaList.filter((b) => String(b.id) !== id).slice(0, 3);

  const currentUrl = window.location.href;
  const shareTitle = encodeURIComponent(item?.title || "Berita SINGGAH");

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!item) {
    return (
      <section className="relative min-h-screen bg-brand-navy pt-28 pb-16 px-5">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-white">
            Berita tidak ditemukan
          </h2>
          <p className="mt-2 text-slate-400">
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
    );
  }

  return (
    <section className="relative overflow-hidden bg-brand-navy min-h-screen pt-28 sm:pt-32 lg:pt-36 pb-20 px-5 sm:px-8">
      <DustBackground />

      <div className="relative z-10 mx-auto max-w-4xl 2xl:max-w-5xl">
        <div className="overflow-hidden border border-slate-700/60 shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-3xl">
          {/* HEADER ARTIKEL */}
          <div className="p-5 sm:p-8 lg:p-10 bg-brand-navy/80 border-b border-slate-800/80">
            {/* Navigasi & Tombol Share (Tanpa border-b dan padding bawah diminimalkan) */}
            <div className="flex items-center justify-between pb-0">
              <Link
                to="/berita"
                aria-label="Kembali"
                className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-2.5 sm:py-2 sm:pl-3 sm:pr-4 text-sm text-slate-300 transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300 shadow-sm"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 transition-colors duration-300 group-hover:bg-cyan-400/20 group-hover:text-cyan-300">
                  <ArrowLeft
                    size={14}
                    className="transition-transform duration-300 group-hover:-translate-x-0.5"
                  />
                </span>
                <span className="hidden sm:inline font-semibold">Kembali</span>
              </Link>

              <button
                onClick={() => setIsShareModalOpen(true)}
                aria-label="Bagikan Artikel"
                className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300 shadow-sm cursor-pointer"
              >
                <Share2 size={15} className="text-cyan-400" />
                <span className="hidden sm:inline font-semibold">Bagikan</span>
              </button>
            </div>

            {/* Container Konten Header Bawah (Tags, Judul, Metadata) dengan jarak atas yang pas */}
            <div className="mt-5 sm:mt-6 space-y-4">
              {/* Kategori & Tag Utama */}
              {item.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-bold tracking-wider uppercase text-cyan-300 shadow-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Judul Artikel Utama */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-[1.15] tracking-tight">
                {item.title}
              </h1>

              {/* Metadata Jurnalisme */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800/80 text-xs sm:text-sm text-slate-400">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 font-bold text-xs">
                    {(item.winner || item.source || "A")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-200 text-xs sm:text-sm">
                      {item.winner || item.source || "Tim Redaksi SINGGAH"}
                    </p>
                    <p className="text-[11px] text-cyan-400 font-medium">
                      Divisi Publikasi & Media Akademik
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-400">
                  {item.date && (
                    <div className="flex items-center gap-1.5 font-medium">
                      <Calendar size={14} className="text-cyan-400" />
                      <span>{item.date}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 font-medium">
                    <Eye size={14} className="text-cyan-400" />
                    <span>1.4RB Views</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Foto Headline Utama */}
          <div className="relative h-64 sm:h-88 lg:h-[420px] w-full overflow-hidden bg-slate-950 border-b border-slate-800">
            <img
              src={item.image}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-102"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-3 left-4 right-4 sm:left-6 sm:right-6 text-right">
              <span className="text-[11px] sm:text-xs text-slate-200 bg-slate-950/80 px-3 py-1 rounded-md backdrop-blur-md border border-slate-700/50 italic font-medium">
                Dokumentasi Resmi SINGGAH
              </span>
            </div>
          </div>

          {/* BODI ARTIKEL */}
          <div className="p-6 sm:p-10 lg:p-14 pt-8 space-y-8 bg-white text-slate-900">
            <div className="flex flex-col gap-8 text-base sm:text-lg leading-relaxed text-slate-700 font-normal">
              {item.content?.map((paragraph, index) => {
                const correspondingPhoto = item.gallery?.[index];

                if (index === 0) {
                  const firstLetter = paragraph.charAt(0);
                  const restOfParagraph = paragraph.slice(1);

                  return (
                    <div key={index} className="space-y-8">
                      <p className="text-lg sm:text-xl leading-relaxed text-slate-800 font-normal">
                        <span className="float-left text-5xl sm:text-6xl font-black text-cyan-600 mr-3.5 leading-none pt-1">
                          {firstLetter}
                        </span>
                        {restOfParagraph}
                      </p>

                      {correspondingPhoto && (
                        <figure className="my-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-md">
                          <div className="w-full max-h-[500px] overflow-hidden bg-slate-200">
                            <img
                              src={correspondingPhoto.url}
                              alt={correspondingPhoto.caption}
                              className="w-full h-auto object-cover transition-transform duration-500 hover:scale-[1.02]"
                            />
                          </div>
                          <figcaption className="px-5 py-3.5 text-xs sm:text-sm text-slate-600 border-t border-slate-200 italic leading-relaxed flex items-center justify-between bg-white">
                            <span>{correspondingPhoto.caption}</span>
                            <span className="not-italic text-cyan-700 font-bold uppercase tracking-wider text-[10px] bg-cyan-50 px-2.5 py-1 rounded border border-cyan-200 ml-2 shrink-0">
                              Dok. SINGGAH
                            </span>
                          </figcaption>
                        </figure>
                      )}
                    </div>
                  );
                }

                return (
                  <div key={index} className="space-y-8">
                    <p className="leading-relaxed text-slate-700">
                      {paragraph}
                    </p>

                    {correspondingPhoto && (
                      <figure className="my-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-md">
                        <div className="w-full max-h-[500px] overflow-hidden bg-slate-200">
                          <img
                            src={correspondingPhoto.url}
                            alt={correspondingPhoto.caption}
                            className="w-full h-auto object-cover transition-transform duration-500 hover:scale-[1.02]"
                          />
                        </div>
                        <figcaption className="px-5 py-3.5 text-xs sm:text-sm text-slate-600 border-t border-slate-200 italic leading-relaxed flex items-center justify-between bg-white">
                          <span>{correspondingPhoto.caption}</span>
                          <span className="not-italic text-cyan-700 font-bold uppercase tracking-wider text-[10px] bg-cyan-50 px-2.5 py-1 rounded border border-cyan-200 ml-2 shrink-0">
                            Dok. SINGGAH
                          </span>
                        </figcaption>
                      </figure>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer Artikel */}
            <div className="pt-8 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-bold hover:bg-cyan-600 hover:text-white transition-all shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Share2 size={14} />
                  Bagikan
                </button>
              </div>

              {item.source && (
                <div className="text-xs text-slate-600 flex items-center gap-1.5 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
                  <Newspaper size={14} className="text-cyan-600" />
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

        {/* Berita Terkait */}
        {relatedNews.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span className="w-2 h-6 bg-cyan-400 rounded-full inline-block"></span>
                Berita & Kegiatan Terkait
              </h2>
              <Link
                to="/berita"
                className="text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Lihat Semua &rarr;
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {relatedNews.map((news) => (
                <div
                  key={news.id}
                  onClick={() => navigate(`/berita/${news.id}`)}
                  className="group cursor-pointer overflow-hidden border border-slate-700/50 bg-slate-900/40 backdrop-blur-xl rounded-2xl transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan-400/50 shadow-xl"
                >
                  <div className="h-44 w-full overflow-hidden bg-slate-950 relative">
                    <img
                      src={news.image}
                      alt={news.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="rounded-md bg-slate-950/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold tracking-wider text-cyan-300 uppercase border border-cyan-400/30">
                        {news.event}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Calendar size={12} className="text-cyan-400" />
                      <span>{news.date || "Terbaru"}</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                      {news.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* POP-UP MODAL SHARE */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                  <Share2 size={18} />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Bagikan Berita Ini
                </h3>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="h-8 w-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Opsi Media Sosial */}
            <div className="grid grid-cols-3 gap-3">
              <a
                href={`https://api.whatsapp.com/send?text=${shareTitle}%20-%20${currentUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-cyan-400/50 hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer group"
              >
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageCircle size={20} />
                </div>
                <span className="text-xs font-semibold">WhatsApp</span>
              </a>

              <a
                href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${currentUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-cyan-400/50 hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer group"
              >
                <div className="h-10 w-10 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Send size={18} />
                </div>
                <span className="text-xs font-semibold">Twitter / X</span>
              </a>

              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-cyan-400/50 hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer group"
              >
                <div className="h-10 w-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Share2 size={18} />
                </div>
                <span className="text-xs font-semibold">LinkedIn</span>
              </a>
            </div>

            {/* Salin Tautan Otomatis */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">
                Atau salin tautan artikel
              </label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-2xl p-2 pl-3">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="w-full bg-transparent text-xs text-slate-300 focus:outline-none truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check size={14} />
                      <span>Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
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
  );
}

export default BeritaDetail;
