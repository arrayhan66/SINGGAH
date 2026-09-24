import { useState, useRef, useEffect, useMemo } from "react"
import { createPortal } from "react-dom"
import { LayoutGrid, Tag, ChevronDown, Check } from "lucide-react"

function AdminProjectsCategoryFilter({
  categories,
  categoryFilter,
  onCategoryChange,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPos, setDropdownPos] = useState(null)
  const buttonRef = useRef(null)
  const panelRef = useRef(null)

  const tabs = useMemo(() => {
    // Hanya kategori aktif yang ditampilkan. Kategori nonaktif (ilang dari hall)
    // disembunyikan dari filter, kecuali sedang terpilih agar filter tetap konsisten.
    return [
      { value: "all", label: "Semua Jenis", count: categories.totalCount },
      ...categories.items
        .filter(
          (c) =>
            c.is_active !== false || String(c.id) === String(categoryFilter),
        )
        .map((c) => ({
          value: String(c.id),
          label: c.name,
          count: c.count,
        })),
    ]
  }, [categories, categoryFilter])

  const selectedTab = tabs.find((t) => t.value === categoryFilter) || tabs[0]
  const SelectedIcon = selectedTab.value === "all" ? LayoutGrid : Tag

  useEffect(() => {
    function handleClickOutside(e) {
      const inButton = buttonRef.current && buttonRef.current.contains(e.target)
      const inPanel = panelRef.current && panelRef.current.contains(e.target)
      if (!inButton && !inPanel) {
        setIsOpen(false)
      }
    }
    function updatePosition() {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        setDropdownPos({
          top: rect.bottom + 6,
          left: rect.left,
          width: Math.max(rect.width, 220),
        })
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      window.addEventListener("scroll", updatePosition, true)
      window.addEventListener("resize", updatePosition)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
        window.removeEventListener("scroll", updatePosition, true)
        window.removeEventListener("resize", updatePosition)
      }
    }
  }, [isOpen])

  function toggleDropdown() {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom + 6,
        left: rect.left,
        width: Math.max(rect.width, 220),
      })
    }
    setIsOpen((v) => !v)
  }

  function handleSelect(value) {
    onCategoryChange(value)
    setIsOpen(false)
  }

  return (
    <div className="relative w-full md:w-80">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleDropdown}
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 backdrop-blur-xl transition-all duration-200 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="flex min-w-0 items-center gap-2">
          <SelectedIcon className="h-4 w-4 shrink-0 text-cyan-300" />
          <span className="truncate">{selectedTab.label}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {selectedTab.count !== undefined && (
            <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[11px] tabular-nums text-cyan-300">
              {selectedTab.count}
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      {isOpen &&
        dropdownPos &&
        createPortal(
          <div
            ref={panelRef}
            role="listbox"
            style={{
              position: "fixed",
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
            }}
            className="admin-filter-panel z-50 max-h-[70vh] min-w-[220px] animate-fade-in-up overflow-y-auto rounded-2xl border border-cyan-400/25 bg-gradient-to-b from-[#0d1f3c] via-[#0b1628] to-[#081020] shadow-[0_24px_60px_-16px_rgba(34,211,238,0.35),0_18px_40px_-12px_rgba(0,0,0,0.85)] ring-1 ring-white/5 backdrop-blur-xl"
          >
            {tabs.map((tab) => {
              const isActive = categoryFilter === tab.value
              const Icon = tab.value === "all" ? LayoutGrid : Tag
              return (
                <button
                  key={tab.value}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => handleSelect(tab.value)}
                  className={`flex w-full cursor-pointer items-center gap-2.5 px-4 py-3 text-left text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-cyan-400/10 text-cyan-300"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? "text-cyan-300" : "text-slate-500"
                    }`}
                  />
                  <span className="min-w-0 flex-1 truncate">
                    {tab.label}
                  </span>
                  {tab.count !== undefined && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] tabular-nums ${
                        isActive
                          ? "bg-cyan-500/20 text-cyan-300"
                          : "bg-white/[0.07] text-slate-400"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                  {isActive && (
                    <Check className="h-4 w-4 shrink-0 text-cyan-400" />
                  )}
                </button>
              )
            })}
          </div>,
          document.body,
        )}
    </div>
  )
}

export default AdminProjectsCategoryFilter