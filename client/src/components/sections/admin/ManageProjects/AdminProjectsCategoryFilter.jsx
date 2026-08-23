import { useState, useRef, useEffect } from "react"
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

  const tabs = [
    { value: "all", label: "Semua Jenis", count: categories.totalCount },
    ...categories.items.map((c) => ({
      value: String(c.id),
      label: c.name,
      count: c.count,
    })),
  ]

  const selectedTab = tabs.find((t) => t.value === categoryFilter) || tabs[0]

  useEffect(() => {
    function handleClickOutside(e) {
      const inButton = buttonRef.current && buttonRef.current.contains(e.target)
      const inPanel = panelRef.current && panelRef.current.contains(e.target)
      if (!inButton && !inPanel) {
        setIsOpen(false)
      }
    }
    function handleClose() {
      setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      window.addEventListener("scroll", handleClose, true)
      window.addEventListener("resize", handleClose)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
        window.removeEventListener("scroll", handleClose, true)
        window.removeEventListener("resize", handleClose)
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
    <>
      <div className="relative w-full min-[450px]:hidden">
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleDropdown}
          className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 backdrop-blur-xl transition-all duration-200 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className="flex min-w-0 items-center gap-2">
            <Tag className="h-4 w-4 shrink-0 text-cyan-300" />
            <span className="truncate">{selectedTab.label}</span>
          </span>
          <span className="flex shrink-0 items-center gap-2">
            {selectedTab.count !== undefined && (
              <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[11px] tabular-nums text-cyan-300">
                {selectedTab.count}
              </span>
            )}
            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
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
              className="z-50 max-h-[70vh] min-w-[220px] animate-fade-in-up overflow-y-auto rounded-xl border border-white/10 bg-slate-900/95 shadow-2xl shadow-black/40 backdrop-blur-xl"
            >
              {tabs.map((tab) => {
                const isActive = categoryFilter === tab.value
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
                    {tab.value === "all" ? (
                      <LayoutGrid className="h-4 w-4 shrink-0 text-cyan-300" />
                    ) : (
                      <Tag
                        className={`h-4 w-4 shrink-0 ${isActive ? "text-cyan-300" : "text-slate-500"}`}
                      />
                    )}
                    <span className="min-w-0 flex-1 truncate">{tab.label}</span>
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
                    {isActive && <Check className="h-4 w-4 shrink-0 text-cyan-400" />}
                  </button>
                )
              })}
            </div>,
            document.body,
          )}
      </div>

      <div className="hidden min-[450px]:flex min-[450px]:w-fit min-[450px]:max-w-full min-[450px]:flex-wrap min-[450px]:items-center min-[450px]:gap-1 rounded-xl border border-white/10 bg-white/5 min-[450px]:p-1">
        {tabs.map((tab) => {
          const isActive = categoryFilter === tab.value
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onCategoryChange(tab.value)}
              className={`inline-flex min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-cyan-400/40 focus-visible:outline-none ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500/25 to-blue-500/25 text-white shadow-sm ring-1 ring-cyan-400/30"
                  : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
              }`}
              aria-pressed={isActive}
            >
              {tab.value === "all" ? (
                <LayoutGrid
                  className={`h-3.5 w-3.5 shrink-0 transition-colors duration-200 ${
                    isActive ? "text-cyan-300" : "text-slate-500"
                  }`}
                />
              ) : (
                <Tag
                  className={`h-3.5 w-3.5 shrink-0 transition-colors duration-200 ${
                    isActive ? "text-cyan-300" : "text-slate-500"
                  }`}
                />
              )}
              <span className="min-w-0 truncate">{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                    isActive
                      ? "bg-cyan-500/25 text-cyan-300"
                      : "bg-white/[0.07] text-slate-400"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </>
  )
}

export default AdminProjectsCategoryFilter
