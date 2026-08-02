import { useRef, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router-dom"
import { Users, UserCheck, UserX, Search, Plus, LayoutGrid, ChevronDown, Check } from "lucide-react"
import { useUsers } from "../../../../context/UserContext"
import AdminHeroBackground from "../../../ui/AdminHeroBackground"

const statsConfig = [
  { key: "total", label: "Total User", icon: Users, color: "cyan" },
  { key: "aktif", label: "Aktif", icon: UserCheck, color: "emerald" },
  { key: "nonaktif", label: "Nonaktif", icon: UserX, color: "red" },
]

const statusTabs = [
  { value: "all", label: "Semua", icon: LayoutGrid },
  { value: "Aktif", label: "Aktif", icon: UserCheck },
  { value: "Nonaktif", label: "Nonaktif", icon: UserX },
]

function AdminUserHero({ search, onSearchChange, statusFilter, onStatusChange }) {
  const navigate = useNavigate()
  const { userList } = useUsers()

  const stats = {
    total: userList.length,
    aktif: userList.filter((u) => u.status === "Aktif").length,
    nonaktif: userList.filter((u) => u.status === "Nonaktif").length,
  }

  const statusCounts = {
    all: userList.length,
    Aktif: stats.aktif,
    Nonaktif: stats.nonaktif,
  }

  const iconBgMap = {
    cyan: "bg-cyan-400/15 border-cyan-400/40",
    emerald: "bg-emerald-400/15 border-emerald-400/40",
    red: "bg-red-400/15 border-red-400/40",
  }

  const textMap = {
    cyan: "text-cyan-300",
    emerald: "text-emerald-300",
    red: "text-red-300",
  }

  const gradMap = {
    cyan: "from-cyan-500/20 via-cyan-500/[0.06] to-transparent",
    emerald: "from-emerald-500/20 via-emerald-500/[0.06] to-transparent",
    red: "from-red-500/20 via-red-500/[0.06] to-transparent",
  }

  const glowMap = {
    cyan: "shadow-cyan-500/20",
    emerald: "shadow-emerald-500/20",
    red: "shadow-red-500/20",
  }

  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPos, setDropdownPos] = useState(null)
  const buttonRef = useRef(null)
  const panelRef = useRef(null)

  const selectedTab = statusTabs.find((t) => t.value === statusFilter) || statusTabs[0]
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

  const statsContent = statsConfig.map((s, i) => {
    const Icon = s.icon
    return (
      <div
        key={s.key}
        className={`group relative min-w-0 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${gradMap[s.color]} px-4 py-4 transition-all duration-300 hover:border-white/20 hover:-translate-y-0.5 ${
          i === statsConfig.length - 1 ? "min-[600px]:col-span-2 min-[1000px]:col-span-1" : ""
        }`}
      >
        <Icon
          className={`absolute -right-2 -top-2 h-20 w-20 rotate-12 ${textMap[s.color]} opacity-[0.07] transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110`}
        />
        <div className="relative flex items-center gap-3.5">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-lg ${glowMap[s.color]} ${iconBgMap[s.color]} transition-transform duration-300 group-hover:scale-105`}>
            <Icon className={`h-5 w-5 ${textMap[s.color]}`} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-2xl font-black text-white leading-tight tabular-nums">
              {stats[s.key]}
            </p>
            <p className="truncate text-xs text-slate-300/80 leading-tight">
              {s.label}
            </p>
          </div>
        </div>
      </div>
    )
  })

  return (
    <AdminHeroBackground fullWidth>
      <div className="px-4 md:px-6 lg:px-8 pt-8 pb-8">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-6 backdrop-blur-xl md:p-8">
          <div className="flex flex-col items-center text-center sm:flex-row sm:text-left gap-[clamp(0.75rem,0.5rem+1vw,1rem)]">
            <div className="relative">
              <div className="flex h-[clamp(2.75rem,2.25rem+2vw,3.5rem)] w-[clamp(2.75rem,2.25rem+2vw,3.5rem)] items-center justify-center rounded-xl bg-cyan-400/10 border border-cyan-400/30">
                <Users className="h-[clamp(1.375rem,1.25rem+0.6vw,1.75rem)] w-[clamp(1.375rem,1.25rem+0.6vw,1.75rem)] text-cyan-300" />
              </div>
              <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-white shadow-md">
                {stats.total}
              </div>
            </div>
            <div className="min-w-0">
              <h1 className="text-[clamp(1.25rem,0.9375rem+1.5vw,1.5rem)] sm:text-3xl font-black text-white">
                Kelola <span className="text-cyan-300">User</span>
              </h1>
              <p className="mt-1 text-[clamp(0.8125rem,0.75rem+0.5vw,0.875rem)] text-slate-400 max-w-xl">
                Tambah, edit, hapus, dan kelola seluruh pengguna SINGGAH.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 min-[600px]:grid-cols-2 min-[1000px]:grid-cols-3">
            {statsContent}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
          <div className="relative flex-1 min-w-0">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={onSearchChange}
              placeholder="Cari nama, email, atau username..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none shadow-sm focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <button
            type="button"
            onClick={() => navigate("/users/tambah")}
            className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-500 hover:bg-[position:100%_0]"
          >
            <Plus size={16} />
            Tambah User
          </button>
        </div>

        <div className="mt-4">
          <div className="relative w-full min-[550px]:hidden">
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
                {statusCounts[selectedTab.value] !== undefined && (
                  <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[11px] tabular-nums text-cyan-300">
                    {statusCounts[selectedTab.value]}
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
                  {statusTabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = statusFilter === tab.value
                    return (
                      <button
                        key={tab.value}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onClick={() => {
                          onStatusChange(tab.value)
                          setIsOpen(false)
                        }}
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
                        {statusCounts[tab.value] !== undefined && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] tabular-nums ${
                              isActive
                                ? "bg-cyan-500/20 text-cyan-300"
                                : "bg-white/[0.07] text-slate-400"
                            }`}
                          >
                            {statusCounts[tab.value]}
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

          <div className="hidden min-[550px]:flex min-[550px]:w-fit min-[550px]:flex-wrap min-[550px]:items-center min-[550px]:gap-1 rounded-xl border border-white/10 bg-white/5 min-[550px]:p-1">
            {statusTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = statusFilter === tab.value
              const count = statusCounts[tab.value]
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => onStatusChange(tab.value)}
                  className={`inline-flex min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-cyan-400/40 focus-visible:outline-none ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500/25 to-blue-500/25 text-white shadow-sm ring-1 ring-cyan-400/30"
                      : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                  }`}
                  aria-pressed={isActive}
                >
                  <Icon
                    className={`h-3.5 w-3.5 shrink-0 transition-colors duration-200 ${isActive ? "text-cyan-300" : "text-slate-500"}`}
                  />
                  {tab.label}
                  {count !== undefined && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
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
        </div>
      </div>
    </AdminHeroBackground>
  )
}

export default AdminUserHero
