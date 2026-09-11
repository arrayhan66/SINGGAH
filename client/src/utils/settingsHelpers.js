import { Globe, Mail, MessageSquare, Shield } from "lucide-react"

export const tabs = [
  { id: "general", label: "Umum", icon: Globe, desc: "Informasi dasar dan identitas website" },
  { id: "contact", label: "Kontak", icon: Mail, desc: "Alamat, email, dan nomor telepon" },
  { id: "social", label: "Sosial Media", icon: MessageSquare, desc: "Tautan media sosial official" },
  { id: "security", label: "Keamanan", icon: Shield, desc: "Pengaturan keamanan dan akses" },
]

export const DEFAULT_SETTINGS = {
  email: "",
  phone: "",
  address: "",
  instagram: "",
  twitter: "",
  youtube: "",
  maintenanceMode: false,
  registrationOpen: true,
  emailVerification: true,
  maxUploadSize: 10,
}

export const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none backdrop-blur-md transition-all duration-200 focus:border-cyan-400/50 focus:bg-white/[0.1] focus:ring-2 focus:ring-cyan-400/20"

export const toggleClass = "relative inline-flex cursor-pointer items-center"

export const getSwitchClass = (isDark) =>
  isDark
    ? "h-6 w-11 rounded-full border border-white/15 bg-white/10 shadow-inner transition-all after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-slate-300 after:shadow-md after:transition-all peer-checked:border-transparent peer-checked:bg-gradient-to-r peer-checked:from-cyan-400 peer-checked:to-blue-600 peer-checked:shadow-[0_0_10px_rgba(34,211,238,0.4)] peer-checked:after:translate-x-5 peer-checked:after:bg-white"
    : "h-6 w-11 rounded-full border border-slate-300 bg-gradient-to-b from-slate-100 to-slate-200 shadow-inner transition-all after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:border-blue-600 peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-600 peer-checked:shadow-[0_2px_10px_rgba(37,99,235,0.45)] peer-checked:after:translate-x-5 peer-checked:after:bg-white"
