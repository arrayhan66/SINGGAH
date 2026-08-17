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

export const switchClass =
  "h-6 w-11 rounded-full border border-white/10 bg-white/10 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-slate-300 after:shadow-md after:transition-all peer-checked:border-cyan-400 peer-checked:bg-cyan-500 peer-checked:after:translate-x-full peer-checked:after:bg-white"
