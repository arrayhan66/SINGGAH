import { useEffect, useRef, useState } from "react"
import { Search, Smile, X } from "lucide-react"

const RECENT_KEY = "singgah-recent-emojis"
const MAX_RECENT = 16

const EMOJI_CATEGORIES = [
  {
    id: "smileys",
    label: "Wajah",
    tab: "😀",
    emojis: [
      { e: "😀", n: "Tersenyum lebar" },
      { e: "😄", n: "Bahagia" },
      { e: "😁", n: "Menyeringai" },
      { e: "😆", n: "Tertawa" },
      { e: "😂", n: "Tertawa terpingkal" },
      { e: "🤣", n: "Tertawa guling-guling" },
      { e: "😊", n: "Malu-malu" },
      { e: "😇", n: "Malaikat" },
      { e: "🙂", n: "Tersenyum" },
      { e: "🙃", n: "Terbalik" },
      { e: "😉", n: "Mengedip" },
      { e: "😍", n: "Jatuh cinta" },
      { e: "🥰", n: "Sayang" },
      { e: "😘", n: "Mencium" },
      { e: "😋", n: "Lapar" },
      { e: "😎", n: "Keren" },
      { e: "🤔", n: "Berpikir" },
      { e: "🤨", n: "Curiga" },
      { e: "😐", n: "Netral" },
      { e: "😮", n: "Terkejut" },
      { e: "😯", n: "Hening" },
      { e: "😲", n: "Kagum" },
      { e: "🥹", n: "Terharu" },
      { e: "😢", n: "Sedih" },
      { e: "😭", n: "Menangis" },
      { e: "😤", n: "Kesal" },
      { e: "😡", n: "Marah" },
      { e: "😴", n: "Mengantuk" },
      { e: "🤯", n: "Pikiran meledak" },
      { e: "🥳", n: "Pesta" },
      { e: "🥺", n: "Memelas" },
    ],
  },
  {
    id: "gestures",
    label: "Gestur",
    tab: "👍",
    emojis: [
      { e: "👍", n: "Jempol" },
      { e: "👎", n: "Jempol ke bawah" },
      { e: "👏", n: "Tepuk tangan" },
      { e: "🙌", n: "Tangan ke atas" },
      { e: "🙏", n: "Berdoa" },
      { e: "🤝", n: "Jabat tangan" },
      { e: "✌️", n: "Tanda V" },
      { e: "🤞", n: "Semoga beruntung" },
      { e: "🤟", n: "Aku cinta kamu" },
      { e: "👌", n: "Tanda OK" },
      { e: "💪", n: "Kuat" },
      { e: "👊", n: "Tinju" },
      { e: "✊", n: "Solidaritas" },
      { e: "👋", n: "Melambai" },
      { e: "🫡", n: "Salut" },
      { e: "🫶", n: "Tangan hati" },
    ],
  },
  {
    id: "hearts",
    label: "Hati",
    tab: "❤️",
    emojis: [
      { e: "❤️", n: "Hati merah" },
      { e: "🧡", n: "Hati oranye" },
      { e: "💛", n: "Hati kuning" },
      { e: "💚", n: "Hati hijau" },
      { e: "💙", n: "Hati biru" },
      { e: "💜", n: "Hati ungu" },
      { e: "🖤", n: "Hati hitam" },
      { e: "🤍", n: "Hati putih" },
      { e: "💖", n: "Hati berkilau" },
      { e: "💕", n: "Dua hati" },
      { e: "💘", n: "Panah cinta" },
      { e: "💝", n: "Kotak cokelat" },
      { e: "💞", n: "Hati berputar" },
      { e: "💓", n: "Hati berdetak" },
      { e: "💗", n: "Hati membesar" },
      { e: "💋", n: "Bekas ciuman" },
    ],
  },
  {
    id: "celebrate",
    label: "Rayakan",
    tab: "🎉",
    emojis: [
      { e: "🎉", n: "Konfeti" },
      { e: "🎊", n: "Bola konfeti" },
      { e: "🎂", n: "Kue ulang tahun" },
      { e: "🎁", n: "Hadiah" },
      { e: "🏆", n: "Trofi" },
      { e: "🥇", n: "Medali emas" },
      { e: "🥈", n: "Medali perak" },
      { e: "🥉", n: "Medali perunggu" },
      { e: "🌟", n: "Bintang berkilau" },
      { e: "⭐", n: "Bintang kuning" },
      { e: "✨", n: "Kilauan" },
      { e: "🔥", n: "Api" },
      { e: "💯", n: "Seratus" },
      { e: "👑", n: "Mahkota" },
      { e: "🚀", n: "Roket" },
      { e: "🎓", n: "Topi kelulusan" },
    ],
  },
  {
    id: "misc",
    label: "Lainnya",
    tab: "💡",
    emojis: [
      { e: "💡", n: "Bohlam" },
      { e: "⚡", n: "Petir" },
      { e: "📚", n: "Buku" },
      { e: "💻", n: "Laptop" },
      { e: "📱", n: "Ponsel" },
      { e: "🧠", n: "Otak" },
      { e: "💾", n: "Disket" },
      { e: "🧪", n: "Tabung reaksi" },
      { e: "🔬", n: "Mikroskop" },
      { e: "💎", n: "Berlian" },
      { e: "🤖", n: "Robot" },
      { e: "👾", n: "Monster alien" },
      { e: "🎯", n: "Target" },
      { e: "🌈", n: "Pelangi" },
      { e: "🌍", n: "Bumi" },
      { e: "🐱", n: "Kucing" },
    ],
  },
]

const ALL_EMOJIS = EMOJI_CATEGORIES.flatMap((c) => c.emojis)

function loadRecent() {
  try {
    const raw = JSON.parse(localStorage.getItem(RECENT_KEY))
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

function EmojiButton({ item, onClick, onHover }) {
  return (
    <button
      type="button"
      onMouseEnter={() => onHover?.(item)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick(item)}
      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-lg leading-none transition hover:scale-110 hover:bg-cyan-500/25"
    >
      {item.e}
    </button>
  )
}

function EmojiPicker({
  onSelect,
  align = "left",
  showLabel = false,
  label = "Tambah emoji",
  buttonClassName = "",
  closeOnSelect = true,
  direction = "up",
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [activeCat, setActiveCat] = useState(EMOJI_CATEGORIES[0].id)
  const [recent, setRecent] = useState(loadRecent)
  const [preview, setPreview] = useState(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return

    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  function toggle() {
    if (open) {
      setOpen(false)
    } else {
      setQuery("")
      setPreview(null)
      setOpen(true)
    }
  }

  function handlePick(item) {
    onSelect(item.e)
    setRecent((prev) => {
      const next = [item, ...prev.filter((r) => r.e !== item.e)].slice(0, MAX_RECENT)
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
    if (closeOnSelect) setOpen(false)
  }

  const trimmedQuery = query.trim().toLowerCase()
  const activeEmojis = EMOJI_CATEGORIES.find((c) => c.id === activeCat)?.emojis || []
  const searchResults = trimmedQuery
    ? ALL_EMOJIS.filter(
        (e) => e.n.toLowerCase().includes(trimmedQuery) || e.e === trimmedQuery,
      )
    : null
  const visibleEmojis = searchResults || activeEmojis

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={label}
        title={label}
        onClick={toggle}
        className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 text-slate-300 shadow-sm transition hover:border-cyan-400/50 hover:bg-cyan-500/10 hover:text-cyan-300 hover:shadow-cyan-500/10 ${
          showLabel ? "px-3.5 py-2 text-xs font-semibold" : "px-2.5 py-2"
        } ${buttonClassName}`}
      >
        <Smile size={showLabel ? 16 : 15} />
        {showLabel && <span>Emoji</span>}
      </button>

      {open && (
        <div
          className={`emoji-pop animate-modal-in absolute z-50 w-72 max-w-[calc(100vw-1.25rem)] overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl shadow-black/60 ring-1 ring-cyan-400/10 backdrop-blur-2xl sm:w-80 ${
            direction === "down" ? "top-full mt-2" : "bottom-full mb-2"
          } ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {/* Header + Pencarian */}
          <div className="emoji-pop-head border-b border-white/10 bg-white/[0.04] px-3 py-2.5">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search
                  size={13}
                  className="emoji-pop-search pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari emoji..."
                  className="emoji-pop-input w-full rounded-lg border border-white/10 bg-white/5 py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/50 focus:bg-white/10"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="emoji-pop-clear absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-0.5 text-slate-500 transition hover:bg-white/10 hover:text-white"
                    aria-label="Hapus pencarian"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Recent */}
          {!searchResults && recent.length > 0 && (
            <div className="px-3 pt-2.5 bg-white/[0.04]">
              <p className="emoji-pop-label mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Baru-baru ini
              </p>
              <div className="flex flex-wrap gap-0.5">
                {recent.map((item) => (
                  <EmojiButton
                    key={item.e}
                    item={item}
                    onClick={handlePick}
                    onHover={setPreview}
                  />
                ))}
              </div>
              <div className="emoji-pop-divider my-2.5 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            </div>
          )}

          {/* Tab kategori */}
          {!searchResults && (
            <div className="mt-2 flex items-center gap-1 px-3 pb-2 bg-white/[0.04]">
              {EMOJI_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCat(cat.id)}
                  title={cat.label}
                  className={`emoji-pop-tab flex h-7 flex-1 cursor-pointer items-center justify-center rounded-lg text-base transition ${
                    activeCat === cat.id
                      ? "emoji-pop-tab-active bg-cyan-500/15 ring-1 ring-cyan-400/30"
                      : "opacity-60 hover:bg-white/5 hover:opacity-100"
                  }`}
                >
                  {cat.tab}
                </button>
              ))}
            </div>
          )}

          {/* Grid emoji */}
          <div className="emoji-pop-grid scrollbar-thin scrollbar-thumb-white/10 max-h-44 overflow-y-auto px-3 pb-3 bg-white/[0.04]">
            {searchResults && searchResults.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-2xl">🤷</p>
                <p className="emoji-pop-empty mt-2 text-[11px] text-slate-500">
                  Emoji &ldquo;{query}&rdquo; tidak ditemukan.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-0.5">
                {visibleEmojis.map((item) => (
                  <EmojiButton
                    key={item.e}
                    item={item}
                    onClick={handlePick}
                    onHover={setPreview}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="emoji-pop-preview flex items-center gap-2.5 border-t border-white/10 bg-white/[0.04] px-3 py-2">
            <span className="emoji-pop-preview-icon flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-xl ring-1 ring-cyan-400/20">
              {preview?.e || "😀"}
            </span>
            <p className="emoji-pop-preview-text truncate text-[11px] font-medium text-slate-300">
              {preview ? preview.n : "Pilih emoji untuk menyisipkan"}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmojiPicker
