import { useEffect } from "react"
import { X, Loader2 } from "lucide-react"
import { useTheme } from "../../context/ThemeContext"
import { useBookInfoStore } from "../../three/hooks/useBookInfo"
import { useWalkStore } from "../../three/hooks/useWalk"
import { BOOK_COVER_FILES, DEFAULT_COVER_KEY } from "../../three/utils/bookCovers"

function BookInfoModal() {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const bookKey = useBookInfoStore((s) => s.bookKey)
  const bookInfo = useBookInfoStore((s) => s.bookInfo)
  const loading = useBookInfoStore((s) => s.loading)
  const close = () => useBookInfoStore.getState().close()

  useEffect(() => {
    useWalkStore.getState().setLocked(Boolean(bookKey))
    if (!bookKey) return
    const onKey = (e) => {
      if (e.key === "Escape") close()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [bookKey])

  if (!bookKey || !bookInfo) return null

  const coverImg = BOOK_COVER_FILES[bookKey] || BOOK_COVER_FILES[DEFAULT_COVER_KEY]

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-md ${
        isDark ? "bg-black/70" : "bg-slate-900/30"
      }`}
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Info buku"
        className={`relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl border p-8 shadow-2xl ${
          isDark
            ? "border-sky-700/60 bg-gradient-to-b from-sky-950 via-slate-950 to-sky-950 text-white"
            : "border-sky-200/80 bg-gradient-to-b from-white via-slate-50 to-sky-50 text-slate-900"
        }`}
      >
        <button
          onClick={close}
          aria-label="Tutup informasi"
          className={`absolute top-5 right-5 w-10 h-10 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
            isDark
              ? "bg-sky-900/60 hover:bg-sky-800 border-sky-700/50 text-white"
              : "bg-sky-100 hover:bg-sky-200 border-sky-200 text-sky-700"
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-28 h-40 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg border border-sky-500/30 bg-slate-800">
            <img src={coverImg} alt={bookInfo.judul} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-[11px] font-bold uppercase tracking-[0.24em] ${
                  isDark ? "text-sky-400/90" : "text-sky-600"
                }`}
              >
                Informasi Buku
              </span>
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />}
            </div>

            <h3
              className={`text-2xl md:text-3xl font-extrabold mb-2 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              {bookInfo.judul}
            </h3>

            <p
              className={`text-sm font-semibold mb-4 ${
                isDark ? "text-sky-300" : "text-sky-700"
              }`}
            >
              Penulis: {bookInfo.penulis || "(isi manual)"}
            </p>

            <div className="space-y-1">
              <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Sinopsis
              </h4>
              <p
                className={`text-sm leading-relaxed ${
                  isDark ? "text-slate-100/85" : "text-slate-700"
                }`}
              >
                {bookInfo.sinopsis || "Sinopsis belum tersedia."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookInfoModal
