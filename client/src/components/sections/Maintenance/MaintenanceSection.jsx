import { Wrench, Construction } from "lucide-react"

export default function MaintenanceSection() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-brand-dark via-brand-navy to-brand-dark px-6 text-center">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative animate-fade-in-up">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-400/20 bg-white/[0.06] shadow-2xl shadow-black/30 backdrop-blur-xl">
          <Construction className="h-10 w-10 text-cyan-300" />
        </div>

        <h1 className="mt-8 text-2xl font-bold tracking-tight text-white md:text-4xl">
          SINGGAH Sedang Maintenance
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-400 md:text-base">
          Kami sedang melakukan perbaikan dan peningkatan sistem.
          Website akan segera kembali. Silakan coba lagi beberapa saat lagi.
        </p>

        <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-slate-400">
          <Wrench size={14} className="text-cyan-400" />
          Terima kasih atas kesabaran Anda
        </div>
      </div>
    </div>
  )
}
