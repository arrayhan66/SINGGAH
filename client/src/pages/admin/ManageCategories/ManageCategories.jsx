import { useState, useMemo, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { 
  Tag, 
  Plus, 
  Pencil, 
  Trash2, 
  LayoutList, 
  Search, 
  Palette, 
  Camera, 
  Video, 
  Film, 
  PenTool, 
  Sparkles, 
  Code, 
  BookOpen, 
  FolderOpen,
  LayoutGrid, 
  PackageOpen,
  ChevronDown,
  Check
} from "lucide-react"
import AdminLayout from "../../../layouts/AdminLayout"
import AdminHeroBackground from "../../../components/ui/AdminHeroBackground"
import AdminCategoryDeleteModal from "../../../components/sections/admin/ManageCategories/AdminCategoryDeleteModal"
import ShowMoreButton from "../../../components/ui/ShowMoreButton"

const INITIAL_VISIBLE = 9

const getCategoryIcon = (name) => {
  const lower = name.toLowerCase()
  if (lower.includes("desain") || lower.includes("grafis")) return Palette
  if (lower.includes("ilustrasi") || lower.includes("gambar")) return PenTool
  if (lower.includes("fotografi") || lower.includes("foto")) return Camera
  if (lower.includes("videografi") || lower.includes("video")) return Video
  if (lower.includes("animasi")) return Film
  if (lower.includes("lukis") || lower.includes("seni")) return Sparkles
  if (lower.includes("kode") || lower.includes("pemrograman") || lower.includes("web")) return Code
  if (lower.includes("buku") || lower.includes("literatur")) return BookOpen
  return FolderOpen
}

const stateTabs = [
  { value: "all", label: "Semua", icon: LayoutGrid },
  { value: "used", label: "Berisi Project", icon: FolderOpen },
  { value: "empty", label: "Kosong", icon: PackageOpen },
]

const initialCategories = [
  { id: 1, name: "Desain Grafis", slug: "desain-grafis", projectCount: 12 },
  { id: 2, name: "Ilustrasi", slug: "ilustrasi", projectCount: 8 },
  { id: 3, name: "Fotografi", slug: "fotografi", projectCount: 15 },
  { id: 4, name: "Videografi", slug: "videografi", projectCount: 6 },
  { id: 5, name: "Animasi", slug: "animasi", projectCount: 4 },
  { id: 6, name: "Seni Lukis", slug: "seni-lukis", projectCount: 7 },
]

function ManageCategories() {
  const [categories, setCategories] = useState(initialCategories)
  const [search, setSearch] = useState("")
  const [stateFilter, setStateFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formName, setFormName] = useState("")
  const [showAll, setShowAll] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPos, setDropdownPos] = useState(null)
  const buttonRef = useRef(null)
  const panelRef = useRef(null)

  const selectedTab = stateTabs.find((t) => t.value === stateFilter) || stateTabs[0]
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

  const filterKey = `${search}|${stateFilter}`
  const [activeFilter, setActiveFilter] = useState(filterKey)
  if (filterKey !== activeFilter) {
    setActiveFilter(filterKey)
    setShowAll(false)
  }

  const filtered = useMemo(() => {
    const s = search.toLowerCase()
    return categories.filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(s)
      const matchState =
        stateFilter === "all" ||
        (stateFilter === "used" ? c.projectCount > 0 : c.projectCount === 0)
      return matchSearch && matchState
    })
  }, [categories, search, stateFilter])

  const stateCounts = {
    all: categories.length,
    used: categories.filter((c) => c.projectCount > 0).length,
    empty: categories.filter((c) => c.projectCount === 0).length,
  }

  const visibleCategories = showAll ? filtered : filtered.slice(0, INITIAL_VISIBLE)

  function handleOpenAdd() {
    setEditing(null)
    setFormName("")
    setShowForm(true)
  }

  function handleOpenEdit(cat) {
    setEditing(cat)
    setFormName(cat.name)
    setShowForm(true)
  }

  function handleSave() {
    if (!formName.trim()) return
    if (editing) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editing.id
            ? { ...c, name: formName.trim(), slug: formName.trim().toLowerCase().replace(/\s+/g, "-") }
            : c
        )
      )
    } else {
      setCategories((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: formName.trim(),
          slug: formName.trim().toLowerCase().replace(/\s+/g, "-"),
          projectCount: 0,
        },
      ])
    }
    setShowForm(false)
    setEditing(null)
    setFormName("")
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return
    setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <AdminLayout>
      <AdminHeroBackground fullWidth>
        <div className="px-4 md:px-6 lg:px-8 pt-8 md:pt-10">
          <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-[clamp(0.75rem,0.5rem+1vw,1rem)] sm:gap-5">
            <div className="flex h-[clamp(2.75rem,2.25rem+2vw,3.5rem)] w-[clamp(2.75rem,2.25rem+2vw,3.5rem)] shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 border border-cyan-400/30 sm:h-16 sm:w-16">
              <LayoutList className="h-[clamp(1.375rem,1.25rem+0.6vw,1.75rem)] w-[clamp(1.375rem,1.25rem+0.6vw,1.75rem)] text-cyan-300 sm:h-8 sm:w-8" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[clamp(1.25rem,0.9375rem+1.5vw,1.5rem)] sm:text-3xl font-black text-white">
                Kelola <span className="text-cyan-300">Kategori</span>
              </h1>
              <p className="mt-1 text-[clamp(0.8125rem,0.75rem+0.5vw,0.875rem)] text-slate-400 max-w-xl">
                Atur dan kelompokkan kategori untuk project dan berita mahasiswa dengan rapi.
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 pt-6 pb-6 md:px-6 md:pt-7 md:pb-7 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kategori..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="group flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-500 hover:bg-[position:100%_0]"
            >
              <Plus size={16} className="transition-transform duration-300 group-hover:rotate-90" />
              <span>Tambah Kategori</span>
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
                  {stateCounts[selectedTab.value] !== undefined && (
                    <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[11px] tabular-nums text-cyan-300">
                      {stateCounts[selectedTab.value]}
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
                    {stateTabs.map((tab) => {
                      const Icon = tab.icon
                      const isActive = stateFilter === tab.value
                      return (
                        <button
                          key={tab.value}
                          type="button"
                          role="option"
                          aria-selected={isActive}
                          onClick={() => {
                            setStateFilter(tab.value)
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
                          {stateCounts[tab.value] !== undefined && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] tabular-nums ${
                                isActive
                                  ? "bg-cyan-500/20 text-cyan-300"
                                  : "bg-white/[0.07] text-slate-400"
                              }`}
                            >
                              {stateCounts[tab.value]}
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
              {stateTabs.map((tab) => {
                const Icon = tab.icon
                const isActive = stateFilter === tab.value
                const count = stateCounts[tab.value]
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setStateFilter(tab.value)}
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

      <div className="relative px-4 pb-8 md:px-6 md:pb-10 lg:px-8 lg:pb-12 mt-6 md:mt-8">
        {showForm && (
          <div className="animate-slide-down absolute inset-x-0 top-0 z-20 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-brand-navy/95 via-brand-dark/95 to-slate-900/95 p-6 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600">
                {editing ? <Pencil size={16} className="text-white" /> : <Plus size={16} className="text-white" />}
              </div>
              <h3 className="text-base font-bold text-white">
                {editing ? "Edit Kategori" : "Tambah Kategori Baru"}
              </h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Masukkan kategori"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                autoFocus
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:to-blue-500 hover:-translate-y-0.5 active:translate-y-0"
                >
                  {editing ? "Simpan" : "Tambah"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditing(null); setFormName("") }}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-300 transition-all hover:bg-white/10 hover:text-white"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-5 rounded-3xl border border-dashed border-slate-700/50 bg-white/[0.02] py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/40 ring-1 ring-slate-700/30 backdrop-blur-sm">
              <Tag className="h-7 w-7 text-slate-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-300">
                {search ? "Kategori tidak ditemukan" : "Belum ada kategori"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {search
                  ? `Tidak ada kategori yang cocok dengan "${search}"`
                  : 'Klik "Tambah Kategori" untuk membuat kategori baru.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 min-[750px]:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {visibleCategories.map((cat) => {
              const IconComponent = getCategoryIcon(cat.name)
              return (
                <div
                  key={cat.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/40 hover:bg-white/[0.06] hover:shadow-xl hover:shadow-cyan-500/5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 transition-transform duration-300 group-hover:scale-105 sm:h-14 sm:w-14">
                        <IconComponent size={24} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-white truncate">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                          /{cat.slug}
                        </p>
                      </div>
                    </div>

                    <div className="hidden min-[400px]:flex gap-1 opacity-80 sm:opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(cat)}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-cyan-500/10 hover:text-cyan-300"
                        title="Edit Kategori"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(cat)}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-400"
                        title="Hapus Kategori"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                      {cat.projectCount} Project
                    </span>
                    <span className="hidden text-[11px] text-slate-500 min-[400px]:inline">
                      ID: #{cat.id}
                    </span>
                    <div className="flex gap-1 min-[400px]:hidden">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(cat)}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-cyan-500/10 hover:text-cyan-300"
                        title="Edit Kategori"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(cat)}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-400"
                        title="Hapus Kategori"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {filtered.length > INITIAL_VISIBLE && (
          <ShowMoreButton
            label="Lihat Semua Kategori"
            total={filtered.length}
            showAll={showAll}
            onToggle={() => setShowAll((prev) => !prev)}
            className="mt-4 md:mt-5"
          />
        )}
      </div>

      <AdminCategoryDeleteModal
        category={deleteTarget}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  )
}

export default ManageCategories
