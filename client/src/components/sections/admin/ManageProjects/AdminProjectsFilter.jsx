import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { Clock, CheckCircle2, XCircle, LayoutGrid, ChevronDown, Check } from "lucide-react"

const tabs = [
  { value: "all", label: "Semua", icon: LayoutGrid },
  { value: "pending", label: "Menunggu", icon: Clock },
  { value: "published", label: "Disetujui", icon: CheckCircle2 },
  { value: "rejected", label: "Ditolak", icon: XCircle },
]

function AdminProjectsFilter({
  statusFilter,
  onStatusChange,
  counts,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPos, setDropdownPos] = useState(null)
  const buttonRef = useRef(null)
  const panelRef = useRef(null)

  const selectedTab = tabs.find((t) => t.value === statusFilter) || tabs[0]
  const SelectedIcon = selectedTab.icon

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
        width: rect.width,
      })
    }
    setIsOpen((v) => !v)
  }

  function handleSelect(value) {
    onStatusChange(value)
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
            <SelectedIcon className="h-4 w-4 shrink-0 text-cyan-300" />
            <span className="truncate">{selectedTab.label}</span>
          </span>
          <span className="flex shrink-0 items-center gap-2">
            {counts?.[selectedTab.value] !== undefined && (
              <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[11px] tabular-nums text-cyan-300">
                {counts[selectedTab.value]}
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
              className="z-50 min-w-[200px] animate-fade-in-up overflow-hidden rounded-xl border border-white/10 bg-slate-900/95 shadow-2xl shadow-black/40 backdrop-blur-xl"
            >
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = statusFilter === tab.value
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
                      className={`h-4 w-4 shrink-0 ${isActive ? "text-cyan-300" : "text-slate-500"}`}
                    />
                    <span className="min-w-0 flex-1 truncate">{tab.label}</span>
                    {counts?.[tab.value] !== undefined && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] tabular-nums ${
                          isActive
                            ? "bg-cyan-500/20 text-cyan-300"
                            : "bg-white/[0.07] text-slate-400"
                        }`}
                      >
                        {counts[tab.value]}
                      </span>
                    )}
                    {isActive && <Check className="h-4 w-4 shrink-0 text-cyan-400" />}
                  </button>
                )
              })}
            </div>,
            document.body
          )}
      </div>

      <div className="hidden min-[450px]:grid w-full grid-cols-2 gap-1.5 rounded-xl border border-white/10 bg-white/5 p-1.5 min-[630px]:flex min-[630px]:w-fit min-[630px]:flex-wrap min-[630px]:items-center min-[630px]:gap-1 min-[630px]:p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = statusFilter === tab.value
          const count = counts?.[tab.value]

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onStatusChange(tab.value)}
              className={`inline-flex min-w-0 cursor-pointer items-center justify-between gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-cyan-400/40 focus-visible:outline-none min-[630px]:justify-center min-[630px]:gap-1.5 min-[630px]:px-3 min-[630px]:py-1.5 min-[630px]:text-xs ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500/25 to-blue-500/25 text-white shadow-sm ring-1 ring-cyan-400/30"
                  : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
              }`}
              aria-pressed={isActive}
            >
              <span className="flex min-w-0 items-center gap-2 min-[630px]:gap-1.5">
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors duration-200 min-[630px]:h-3.5 min-[630px]:w-3.5 ${isActive ? "text-cyan-300" : "text-slate-500"}`}
                />
                {tab.label}
              </span>
              {count !== undefined && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] tabular-nums min-[630px]:px-1.5 min-[630px]:text-[10px] ${
                    isActive
                      ? "bg-cyan-500/25 text-cyan-300"
                      : "bg-white/[0.07] text-slate-400"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </>
  )
}

export default AdminProjectsFilter
