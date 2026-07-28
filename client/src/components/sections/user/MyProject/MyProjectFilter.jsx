import { useState, useRef, useEffect } from "react"
import { Search, ChevronDown, Check } from "lucide-react"

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "pending", label: "Menunggu Review" },
  { value: "published", label: "Disetujui" },
  { value: "rejected", label: "Ditolak" },
]

function MyProjectFilter({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const selected = STATUS_OPTIONS.find((o) => o.value === statusFilter)

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  function handleSelect(value) {
    onStatusChange(value)
    setIsOpen(false)
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5 md:gap-6 lg:gap-7 3xl:gap-8 4xl:gap-9">
      <div className="group flex flex-1 min-w-0 items-center gap-2.5 rounded-xl border-2 border-white/60 bg-white/90 px-3.5 py-2.5 backdrop-blur-md shadow-xl transition-all duration-300 hover:shadow-2xl focus-within:-translate-y-1 focus-within:border-cyan-400 focus-within:bg-white focus-within:shadow-cyan-400/30 sm:gap-3 sm:rounded-2xl sm:px-5 sm:py-3 md:py-3.5 lg:py-4 3xl:gap-4 3xl:px-6 3xl:py-4.5 4xl:py-5">
        <Search
          size={16}
          className="text-slate-500 transition-colors duration-300 group-focus-within:text-cyan-500 sm:size-[18px] md:size-5 3xl:size-[22px] 4xl:size-6"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari project..."
          className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-500 focus:outline-none sm:text-sm md:text-base lg:text-base 3xl:text-lg 4xl:text-xl"
        />
      </div>

      <div className="relative min-w-0 shrink-0" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="flex w-full sm:w-auto items-center gap-2.5 rounded-xl border-2 border-white/60 bg-white/90 px-4 py-2.5 text-sm font-medium text-slate-800 backdrop-blur-md shadow-xl transition-all duration-300 hover:shadow-2xl focus-within:-translate-y-1 focus-within:border-cyan-400 focus-within:bg-white focus-within:shadow-cyan-400/30 sm:rounded-2xl sm:px-5 sm:py-3 md:py-3.5 lg:py-4 3xl:gap-3 3xl:px-6 3xl:py-4.5 4xl:py-5"
        >
          <span className="truncate">{selected.label}</span>
          <ChevronDown
            size={16}
            className={`shrink-0 text-slate-500 transition-transform duration-200 sm:size-[18px] md:size-5 3xl:size-[22px] 4xl:size-6 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 z-30 mt-2 w-full min-w-[200px] overflow-hidden rounded-xl border-2 border-white/10 bg-slate-900/95 shadow-2xl shadow-cyan-900/20 backdrop-blur-xl sm:rounded-2xl">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium text-left transition-colors sm:px-5 sm:py-3.5 md:py-4 lg:py-4.5 3xl:px-6 3xl:py-5 4xl:py-5.5 ${
                  statusFilter === option.value
                    ? "bg-cyan-400/10 text-cyan-300"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="min-w-0 truncate">{option.label}</span>
                {statusFilter === option.value && (
                  <Check size={16} className="shrink-0 text-cyan-400 sm:size-[18px] md:size-5 3xl:size-[22px] 4xl:size-6" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyProjectFilter
