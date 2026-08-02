import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import {
  Settings2, Save, Globe, Mail, Image, MessageSquare, Shield,
  Check, Upload, Palette, X, ChevronDown
} from "lucide-react"
import AdminLayout from "../../../layouts/AdminLayout"
import AdminHeroBackground from "../../../components/ui/AdminHeroBackground"

const STORAGE_KEY = "singgah_settings"
const SETTINGS_LOGO_KEY = "singgah_settings_logo"

const tabs = [
  { id: "general", label: "Umum", icon: Globe, desc: "Informasi dasar dan identitas website" },
  { id: "contact", label: "Kontak", icon: Mail, desc: "Alamat, email, dan nomor telepon" },
  { id: "logo", label: "Logo & Branding", icon: Image, desc: "Logo, favicon, dan identitas visual" },
  { id: "social", label: "Sosial Media", icon: MessageSquare, desc: "Tautan media sosial official" },
  { id: "security", label: "Keamanan", icon: Shield, desc: "Pengaturan keamanan dan akses" },
]

const defaults = {
  siteName: "SINGGAH",
  siteDescription: "Platform portofolio seni digital untuk mahasiswa dan dosen.",
  email: "admin@singgah.com",
  phone: "0812-3456-7890",
  address: "Jl. Seni Raya No. 1, Jakarta",
  instagram: "@singgah_official",
  twitter: "@singgah",
  youtube: "SINGGAH TV",
  footerText: "© 2026 SINGGAH. All rights reserved.",
  maintenanceMode: false,
  registrationOpen: true,
  emailVerification: true,
  maxUploadSize: 10,
}

function loadSettings() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      return { ...defaults, ...JSON.parse(stored) }
    } catch {
      return { ...defaults }
    }
  }
  return { ...defaults }
}

function loadLogo() {
  return localStorage.getItem(SETTINGS_LOGO_KEY) || null
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none backdrop-blur-md transition-all duration-200 focus:border-cyan-400/50 focus:bg-white/[0.1] focus:ring-2 focus:ring-cyan-400/20"

const toggleClass =
  "relative inline-flex cursor-pointer items-center"
const switchClass =
  "h-6 w-11 rounded-full border border-white/10 bg-white/10 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-slate-300 after:shadow-md after:transition-all peer-checked:border-cyan-400 peer-checked:bg-cyan-500 peer-checked:after:translate-x-full peer-checked:after:bg-white"

function Settings() {
  const [activeTab, setActiveTab] = useState("general")
  const [animDir, setAnimDir] = useState("right")
  const [form, setForm] = useState(loadSettings)
  const [saved, setSaved] = useState(false)
  const [logoPreview, setLogoPreview] = useState(loadLogo)
  const [favicon, setFavicon] = useState(() => {
    try { return localStorage.getItem("singgah_favicon") || "" } catch { return "" }
  })
  const logoInputRef = useRef(null)
  const faviconInputRef = useRef(null)
  const menuButtonRef = useRef(null)
  const menuRef = useRef(null)
  const rafRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState(null)

  function getNavbarBottom() {
    const main = document.querySelector("main")
    if (main) {
      const pt = parseFloat(window.getComputedStyle(main).paddingTop)
      if (!Number.isNaN(pt)) return pt
    }
    const header = document.querySelector("header")
    return header ? header.getBoundingClientRect().bottom : 0
  }

  function applyMenuPosition() {
    const btn = menuButtonRef.current
    const panel = menuRef.current
    if (!btn || !panel) return
    const rect = btn.getBoundingClientRect()
    const navbarBottom = getNavbarBottom()

    if (rect.bottom <= navbarBottom) {
      setMenuOpen(false)
      return
    }

    panel.style.top = `${rect.bottom + 6}px`
    panel.style.left = `${rect.left}px`
    panel.style.width = `${rect.width}px`
  }

  function handleScrollReposition() {
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      applyMenuPosition()
    })
  }

  useEffect(() => {
    function handleClickOutside(e) {
      const inButton = menuButtonRef.current && menuButtonRef.current.contains(e.target)
      const inMenu = menuRef.current && menuRef.current.contains(e.target)
      if (!inButton && !inMenu) setMenuOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    function handleClose() {
      setMenuOpen(false)
    }
    window.addEventListener("scroll", handleScrollReposition, { capture: true, passive: true })
    window.addEventListener("resize", handleClose)
    return () => {
      window.removeEventListener("scroll", handleScrollReposition, { capture: true, passive: true })
      window.removeEventListener("resize", handleClose)
    }
  }, [menuOpen])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
  }, [form])

  useEffect(() => {
    if (logoPreview) {
      localStorage.setItem(SETTINGS_LOGO_KEY, logoPreview)
    } else {
      localStorage.removeItem(SETTINGS_LOGO_KEY)
    }
  }, [logoPreview])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
  }

  function handleSave(e) {
    e.preventDefault()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleLogoSelect(e) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setLogoPreview(ev.target.result)
      reader.readAsDataURL(file)
    }
    e.target.value = ""
  }

  function handleFaviconSelect(e) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const dataUrl = ev.target.result
        setFavicon(dataUrl)
        localStorage.setItem("singgah_favicon", dataUrl)
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ""
  }

  function removeLogo() {
    setLogoPreview(null)
    localStorage.removeItem(SETTINGS_LOGO_KEY)
  }

  function switchTab(id) {
    if (id === activeTab) return
    const oldIdx = tabs.findIndex((t) => t.id === activeTab)
    const newIdx = tabs.findIndex((t) => t.id === id)
    setAnimDir(newIdx > oldIdx ? "right" : "left")
    setActiveTab(id)
  }

  function toggleMenu() {
    if (!menuOpen && menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect()
      setMenuPos({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
      })
    }
    setMenuOpen((v) => !v)
  }

  function selectTabFromMenu(id) {
    switchTab(id)
    setMenuOpen(false)
  }

  const active = tabs.find((t) => t.id === activeTab)
  const TabIcon = active.icon

  function renderGeneral() {
    return (
      <div className="space-y-6" key="general">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">Nama Website</label>
          <input type="text" name="siteName" value={form.siteName} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">Deskripsi Website</label>
          <textarea name="siteDescription" value={form.siteDescription} onChange={handleChange} rows={3} className={`${inputClass} resize-none`} />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">Footer Text</label>
          <input type="text" name="footerText" value={form.footerText} onChange={handleChange} className={inputClass} />
        </div>
        <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-5 text-center transition-colors hover:border-white/20">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10">
            <Palette className="h-6 w-6 text-amber-300" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Mode Maintenance</p>
            <p className="mt-0.5 text-xs text-slate-400">Nonaktifkan akses publik ke website sementara waktu</p>
          </div>
          <label className={`${toggleClass} shrink-0`}>
            <input type="checkbox" name="maintenanceMode" checked={form.maintenanceMode} onChange={handleChange} className="peer sr-only" />
            <div className={switchClass} />
          </label>
        </div>
      </div>
    )
  }

  function renderContact() {
    return (
      <div className="space-y-6" key="contact">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">Email Resmi</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">Nomor Telepon / WhatsApp</label>
          <input type="text" name="phone" value={form.phone} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">Alamat Kantor / Studio</label>
          <textarea name="address" value={form.address} onChange={handleChange} rows={2} className={`${inputClass} resize-none`} />
        </div>
      </div>
    )
  }

  function renderLogo() {
    return (
      <div className="space-y-6" key="logo">
        <div className="group relative overflow-hidden rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-center backdrop-blur-md transition-all duration-300 hover:border-cyan-400/50 hover:bg-white/[0.05] min-[480px]:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative">
            {logoPreview ? (
              <div className="relative mx-auto inline-block rounded-2xl border border-white/10 bg-white/[0.06] p-2 shadow-lg">
                <img src={logoPreview} alt="Logo preview" className="h-24 w-auto max-w-[220px] rounded-xl object-contain min-[480px]:max-w-xs" />
                <button
                  type="button"
                  onClick={removeLogo}
                  className="absolute -right-2.5 -top-2.5 cursor-pointer rounded-full bg-red-500 p-1.5 text-white shadow-md transition-colors hover:bg-red-600"
                  title="Hapus Logo"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] transition-colors group-hover:border-cyan-400/40 group-hover:bg-cyan-400/10">
                <Upload className="h-7 w-7 text-slate-400 transition-colors group-hover:text-cyan-300" />
              </div>
            )}
            <p className="mt-4 text-sm font-medium text-white">{logoPreview ? "Logo Website Aktif" : "Upload logo website utama"}</p>
            <p className="mt-1 text-xs text-slate-400">Format PNG, SVG, atau JPG (maksimal 2MB)</p>
            <input ref={logoInputRef} type="file" accept="image/png,image/svg+xml,image/jpeg" onChange={handleLogoSelect} className="hidden" />
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="mt-5 w-full cursor-pointer rounded-xl border border-cyan-400/30 bg-cyan-400/15 px-6 py-2.5 text-sm font-semibold text-cyan-200 transition-all duration-200 hover:bg-cyan-400/25 hover:shadow-lg hover:shadow-cyan-400/10 active:scale-[0.98] min-[480px]:w-auto"
            >
              {logoPreview ? "Ganti File Logo" : "Pilih File Logo"}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">Favicon Browser</label>
          <div className="flex items-center gap-3">
            <input
              ref={faviconInputRef}
              type="file"
              accept="image/png,image/svg+xml,image/x-icon"
              onChange={handleFaviconSelect}
              className="hidden"
            />
            <input type="text" placeholder="/favicon.ico" value={favicon} readOnly className={`${inputClass} min-w-0 flex-1 cursor-pointer`} onClick={() => faviconInputRef.current?.click()} />
            {favicon && (
              <button
                type="button"
                onClick={() => { setFavicon(""); localStorage.removeItem("singgah_favicon") }}
                className="cursor-pointer rounded-xl border border-white/10 bg-white/5 p-3 text-slate-400 transition-colors hover:bg-white/10 hover:text-red-400"
                title="Hapus Favicon"
              >
                <X size={16} />
              </button>
            )}
          </div>
          {favicon && favicon.startsWith("data:") && (
            <div className="mt-3 flex w-fit items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <img src={favicon} alt="favicon preview" className="h-6 w-6 rounded object-contain bg-white/10 p-0.5" />
              <span className="text-xs text-slate-400">Favicon terpasang</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  function renderSocial() {
    return (
      <div className="space-y-6" key="social">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">Instagram Official</label>
          <input type="text" name="instagram" value={form.instagram} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">Twitter / X Handle</label>
          <input type="text" name="twitter" value={form.twitter} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">YouTube Channel</label>
          <input type="text" name="youtube" value={form.youtube} onChange={handleChange} className={inputClass} />
        </div>
      </div>
    )
  }

  function renderSecurity() {
    return (
      <div className="space-y-6" key="security">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-5 text-center transition-colors hover:border-white/20">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Registrasi Pengguna Baru</p>
            <p className="mt-0.5 text-xs text-slate-400">Izinkan pengunjung mendaftar akun baru secara mandiri</p>
          </div>
          <label className={`${toggleClass} shrink-0`}>
            <input type="checkbox" name="registrationOpen" checked={form.registrationOpen} onChange={handleChange} className="peer sr-only" />
            <div className={switchClass} />
          </label>
        </div>
        <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-5 text-center transition-colors hover:border-white/20">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Verifikasi Email Wajib</p>
            <p className="mt-0.5 text-xs text-slate-400">Kirim tautan verifikasi email saat registrasi akun baru</p>
          </div>
          <label className={`${toggleClass} shrink-0`}>
            <input type="checkbox" name="emailVerification" checked={form.emailVerification} onChange={handleChange} className="peer sr-only" />
            <div className={switchClass} />
          </label>
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">Maksimal Ukuran Upload File (MB)</label>
          <input type="number" name="maxUploadSize" value={form.maxUploadSize} onChange={handleChange} className={`${inputClass} max-w-xs`} />
        </div>
      </div>
    )
  }

  const tabContent = {
    general: renderGeneral(),
    contact: renderContact(),
    logo: renderLogo(),
    social: renderSocial(),
    security: renderSecurity(),
  }

  const animClass = animDir === "right" ? "animate-slide-right" : "animate-slide-left"

  return (
    <AdminLayout>
      <AdminHeroBackground fullWidth>
        <div className="px-4 min-[260px]:px-3 pt-5 min-[260px]:pt-5 md:px-6 md:pt-6">
          <div className="flex flex-col items-center text-center sm:flex-row sm:text-left gap-[clamp(0.75rem,0.5rem+1vw,1rem)]">
            <div className="flex h-[clamp(2.75rem,2.25rem+2vw,3.5rem)] w-[clamp(2.75rem,2.25rem+2vw,3.5rem)] shrink-0 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 sm:h-16 sm:w-16">
              <Settings2 className="h-[clamp(1.375rem,1.25rem+0.6vw,1.75rem)] w-[clamp(1.375rem,1.25rem+0.6vw,1.75rem)] text-cyan-300 sm:h-8 sm:w-8" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[clamp(1.25rem,0.9375rem+1.5vw,1.5rem)] sm:text-3xl font-black text-white">
                Pengaturan <span className="text-cyan-300">Website</span>
              </h1>
              <p className="mt-1 max-w-xl text-[clamp(0.8125rem,0.75rem+0.5vw,0.875rem)] text-slate-400">
                Kelola konfigurasi, identitas visual, dan sistem platform SINGGAH
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 min-[260px]:px-3 pt-8 min-[260px]:pt-8 pb-5 min-[260px]:pb-5 md:px-6 md:pt-10 md:pb-6">
          <div role="tablist" aria-label="Menu pengaturan" className="hidden flex-wrap gap-2 min-[800px]:flex">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  onClick={() => switchTab(tab.id)}
                  className={`group relative flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 text-[13px] font-semibold transition-all duration-200 active:scale-[0.98] ${
                    isActive
                      ? "border-cyan-400/40 bg-gradient-to-b from-cyan-500/[0.18] to-cyan-500/[0.04] text-cyan-200 shadow-lg shadow-cyan-500/15"
                      : "border-white/[0.08] bg-white/[0.04] text-slate-400 hover:border-cyan-400/30 hover:bg-cyan-500/[0.06] hover:text-white"
                  }`}
                >
                  <span className={`flex h-6 w-6 items-center justify-center rounded-md transition-all duration-200 ${
                    isActive
                      ? "bg-cyan-400/15 text-cyan-300"
                      : "text-slate-500 group-hover:text-cyan-300"
                  }`}>
                    <Icon size={14} />
                  </span>
                  <span className="tracking-tight">{tab.label}</span>
                </button>
              )
            })}
          </div>

          <div className="min-[800px]:hidden">
            <button
              ref={menuButtonRef}
              type="button"
              aria-haspopup="listbox"
              aria-expanded={menuOpen}
              onClick={toggleMenu}
              className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 backdrop-blur-xl transition-all duration-200 hover:bg-white/[0.08]"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-400/15 text-cyan-300">
                  <TabIcon size={15} />
                </span>
                <span className="truncate">{active.label}</span>
              </span>
              <ChevronDown
                size={16}
                className={`shrink-0 text-slate-400 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {menuOpen &&
              menuPos &&
              createPortal(
                <div
                  ref={menuRef}
                  role="listbox"
                  style={{
                    position: "fixed",
                    top: menuPos.top,
                    left: menuPos.left,
                    width: menuPos.width,
                  }}
                  className="z-50 min-w-[220px] animate-fade-in-up overflow-hidden rounded-xl border border-white/10 bg-slate-900/95 shadow-2xl shadow-black/40 backdrop-blur-xl"
                >
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onClick={() => selectTabFromMenu(tab.id)}
                        className={`flex w-full cursor-pointer items-center gap-2.5 px-4 py-3 text-left text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-cyan-400/10 text-cyan-300"
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                          isActive ? "bg-cyan-400/15 text-cyan-300" : "text-slate-500"
                        }`}>
                          <Icon size={14} />
                        </span>
                        <span className="min-w-0 flex-1 truncate">{tab.label}</span>
                        <span className="min-w-0 flex-1 truncate text-xs text-slate-400 [@media(max-width:600px)]:hidden">{tab.desc}</span>
                        <div className="flex w-4 shrink-0 items-center justify-center">
                          {isActive && <Check size={16} className="shrink-0 text-cyan-400" />}
                        </div>
                      </button>
                    )
                  })}
                </div>,
                document.body
              )}
          </div>
        </div>
      </AdminHeroBackground>

      <div className="px-4 min-[260px]:px-3 pb-12 md:px-6 md:pb-16 lg:px-8">
        <form onSubmit={handleSave} className="mx-auto mt-6 max-w-5xl md:mt-8">
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-xl backdrop-blur-xl min-[500px]:p-6 md:p-8">
            <div className="mb-7 flex items-center gap-3.5 border-b border-white/10 pb-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
                <TabIcon className="h-5 w-5 text-cyan-300" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">{active.label}</h3>
                <p className="mt-0.5 text-xs text-slate-400">{active.desc}</p>
              </div>
            </div>

            <div key={activeTab} id={`panel-${activeTab}`} role="tabpanel" className={animClass}>
              {tabContent[activeTab]}
            </div>

            <div className="mt-8 flex flex-col items-stretch gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <button
                type="submit"
                className="group relative flex cursor-pointer items-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all duration-500 hover:bg-[position:100%_0] hover:shadow-xl hover:shadow-cyan-500/35 active:scale-[0.98]"
              >
                <Save size={16} className="transition-transform duration-300 group-hover:rotate-12" />
                Simpan Pengaturan
              </button>
              {saved && (
                <span className="flex min-w-0 animate-fade-in items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3.5 py-1.5 text-sm font-semibold text-emerald-300">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/20">
                    <Check size={12} className="text-emerald-300" />
                  </span>
                  Pengaturan berhasil disimpan!
                </span>
              )}
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}

export default Settings
