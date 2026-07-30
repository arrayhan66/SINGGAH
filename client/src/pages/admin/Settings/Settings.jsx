import { useState, useEffect, useRef } from "react"
import {
  Settings2, Save, Globe, Mail, Image, MessageSquare, Shield,
  Check, Upload, Palette, X, Sparkles
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
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return { ...defaults, ...JSON.parse(stored) }
    }
  } catch {}
  return { ...defaults }
}

function loadLogo() {
  try {
    return localStorage.getItem(SETTINGS_LOGO_KEY) || null
  } catch {
    return null
  }
}

const inputClass = "w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all duration-200 focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 focus:bg-slate-950"

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
    const oldIdx = tabs.findIndex((t) => t.id === activeTab)
    const newIdx = tabs.findIndex((t) => t.id === id)
    setAnimDir(newIdx > oldIdx ? "right" : "left")
    setActiveTab(id)
  }

  const active = tabs.find((t) => t.id === activeTab)
  const TabIcon = active.icon

  function renderGeneral() {
    return (
      <div className="space-y-6" key="general">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Nama Website</label>
          <input type="text" name="siteName" value={form.siteName} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Deskripsi Website</label>
          <textarea name="siteDescription" value={form.siteDescription} onChange={handleChange} rows={3} className={`${inputClass} resize-none`} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Footer Text</label>
          <input type="text" name="footerText" value={form.footerText} onChange={handleChange} className={inputClass} />
        </div>
        <div className="flex items-center justify-between rounded-xl bg-slate-950/50 p-4 border border-slate-800/80 transition-colors hover:border-slate-700">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Palette className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">Mode Maintenance</p>
              <p className="text-xs text-slate-400 mt-0.5">Nonaktifkan akses publik ke website sementara waktu</p>
            </div>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" name="maintenanceMode" checked={form.maintenanceMode} onChange={handleChange} className="peer sr-only" />
            <div className="h-6 w-11 rounded-full bg-slate-800 border border-slate-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-slate-300 after:shadow-md after:transition-all peer-checked:bg-indigo-600 peer-checked:border-indigo-500 peer-checked:after:translate-x-full peer-checked:after:bg-white" />
          </label>
        </div>
      </div>
    )
  }

  function renderContact() {
    return (
      <div className="space-y-6" key="contact">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Resmi</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Nomor Telepon / WhatsApp</label>
          <input type="text" name="phone" value={form.phone} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Alamat Kantor / Studio</label>
          <textarea name="address" value={form.address} onChange={handleChange} rows={2} className={`${inputClass} resize-none`} />
        </div>
      </div>
    )
  }

  function renderLogo() {
    return (
      <div className="space-y-6" key="logo">
        <div className="group relative overflow-hidden rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-8 text-center transition-all duration-300 hover:border-indigo-500/50 hover:bg-slate-950/70">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative">
            {logoPreview ? (
              <div className="relative mx-auto inline-block p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
                <img src={logoPreview} alt="Logo preview" className="h-24 max-w-xs rounded-xl object-contain" />
                <button
                  type="button"
                  onClick={removeLogo}
                  className="absolute -top-2.5 -right-2.5 cursor-pointer rounded-full bg-red-500 p-1.5 text-white shadow-md hover:bg-red-600 transition-colors"
                  title="Hapus Logo"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 transition-colors group-hover:border-indigo-500/40 group-hover:bg-indigo-500/10">
                <Upload className="h-7 w-7 text-slate-400 transition-colors group-hover:text-indigo-400" />
              </div>
            )}
            <p className="mt-4 text-sm font-medium text-slate-200">{logoPreview ? "Logo Website Aktif" : "Upload logo website utama"}</p>
            <p className="text-xs text-slate-400 mt-1">Format PNG, SVG, atau JPG (maksimal 2MB)</p>
            <input ref={logoInputRef} type="file" accept="image/png,image/svg+xml,image/jpeg" onChange={handleLogoSelect} className="hidden" />
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="mt-5 cursor-pointer rounded-xl bg-indigo-500/15 px-6 py-2.5 text-sm font-semibold text-indigo-300 border border-indigo-500/30 transition-all duration-200 hover:bg-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/10 active:scale-[0.98]"
            >
              {logoPreview ? "Ganti File Logo" : "Pilih File Logo"}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Favicon Browser</label>
          <div className="flex items-center gap-3">
            <input
              ref={faviconInputRef}
              type="file"
              accept="image/png,image/svg+xml,image/x-icon"
              onChange={handleFaviconSelect}
              className="hidden"
            />
            <input type="text" placeholder="/favicon.ico" value={favicon} readOnly className={`${inputClass} flex-1 cursor-pointer`} onClick={() => faviconInputRef.current?.click()} />
            {favicon && (
              <button
                type="button"
                onClick={() => { setFavicon(""); localStorage.removeItem("singgah_favicon") }}
                className="cursor-pointer rounded-xl bg-slate-800 p-3 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-red-400 transition-colors"
                title="Hapus Favicon"
              >
                <X size={16} />
              </button>
            )}
          </div>
          {favicon && favicon.startsWith("data:") && (
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-950/60 p-3 border border-slate-800 w-fit">
              <img src={favicon} alt="favicon preview" className="h-6 w-6 rounded object-contain bg-slate-900 p-0.5" />
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
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Instagram Official</label>
          <input type="text" name="instagram" value={form.instagram} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Twitter / X Handle</label>
          <input type="text" name="twitter" value={form.twitter} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">YouTube Channel</label>
          <input type="text" name="youtube" value={form.youtube} onChange={handleChange} className={inputClass} />
        </div>
      </div>
    )
  }

  function renderSecurity() {
    return (
      <div className="space-y-6" key="security">
        <div className="flex items-center justify-between rounded-xl bg-slate-950/50 p-4 border border-slate-800/80 transition-all duration-200 hover:border-slate-700">
          <div>
            <p className="text-sm font-semibold text-slate-200">Registrasi Pengguna Baru</p>
            <p className="text-xs text-slate-400 mt-0.5">Izinkan pengunjung mendaftar akun baru secara mandiri</p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" name="registrationOpen" checked={form.registrationOpen} onChange={handleChange} className="peer sr-only" />
            <div className="h-6 w-11 rounded-full bg-slate-800 border border-slate-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-slate-300 after:shadow-md after:transition-all peer-checked:bg-indigo-600 peer-checked:border-indigo-500 peer-checked:after:translate-x-full peer-checked:after:bg-white" />
          </label>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-slate-950/50 p-4 border border-slate-800/80 transition-all duration-200 hover:border-slate-700">
          <div>
            <p className="text-sm font-semibold text-slate-200">Verifikasi Email Wajib</p>
            <p className="text-xs text-slate-400 mt-0.5">Kirim tautan verifikasi email saat registrasi akun baru</p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" name="emailVerification" checked={form.emailVerification} onChange={handleChange} className="peer sr-only" />
            <div className="h-6 w-11 rounded-full bg-slate-800 border border-slate-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-slate-300 after:shadow-md after:transition-all peer-checked:bg-indigo-600 peer-checked:border-indigo-500 peer-checked:after:translate-x-full peer-checked:after:bg-white" />
          </label>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Maksimal Ukuran Upload File (MB)</label>
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
      <div className="max-w-5xl mx-auto pb-12">
        <AdminHeroBackground className="rounded-2xl border border-slate-800/80 shadow-xl overflow-hidden mb-6">
          <div className="px-6 md:px-8 py-8 md:py-10">
            <div className="flex items-center gap-4">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-purple-600/20 border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
                <Settings2 className="h-7 w-7 text-indigo-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Pengaturan Website</h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-300 border border-indigo-500/20">
                    <Sparkles size={11} /> Admin Panel
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-400 mt-1">Kelola konfigurasi, identitas visual, dan sistem platform SINGGAH</p>
              </div>
            </div>
          </div>
        </AdminHeroBackground>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => switchTab(tab.id)}
                className={`group relative flex cursor-pointer items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/40 shadow-lg shadow-indigo-500/10"
                    : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-900 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                {isActive && (
                  <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-600/5 pointer-events-none" />
                )}
                <span className="relative">
                  <Icon size={16} className={isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"} />
                </span>
                <span className="relative font-semibold">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Form Container */}
        <form onSubmit={handleSave}>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-6 md:p-8 shadow-2xl">
            <div className="flex items-center gap-3.5 mb-7 pb-5 border-b border-slate-800/80">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <TabIcon className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">{active.label}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{active.desc}</p>
              </div>
            </div>

            <div key={activeTab} className={animClass}>
              {tabContent[activeTab]}
            </div>

            <div className="mt-8 flex items-center justify-between gap-4 pt-6 border-t border-slate-800/80">
              <button
                type="submit"
                className="group relative flex cursor-pointer items-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-[length:200%_100%] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-500 hover:bg-[position:100%_0] hover:shadow-xl hover:shadow-indigo-500/35 active:scale-[0.98]"
              >
                <Save size={16} className="transition-transform duration-300 group-hover:rotate-12" />
                Simpan Pengaturan
              </button>
              {saved && (
                <span className="flex items-center gap-2 text-sm text-emerald-400 font-semibold bg-emerald-500/10 px-3.5 py-1.5 rounded-xl border border-emerald-500/20 animate-fade-in">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
                    <Check size={12} className="text-emerald-400" />
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
