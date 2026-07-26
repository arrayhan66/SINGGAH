import { CheckCircle } from "lucide-react"

function SuccessPopup({ isOpen }) {
  return (
    // Background overlay (fade in effect)
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ease-out ${
        isOpen
          ? "visible bg-black/60 opacity-100 backdrop-blur-sm"
          : "invisible bg-black/0 opacity-0 backdrop-blur-none"
      }`}
    >
      {/* Box Pop-up (slide up & scale in effect) */}
      <div
        className={`relative flex w-full max-w-sm transform flex-col items-center rounded-3xl border border-cyan-400/30 bg-slate-900 p-8 text-center shadow-2xl shadow-cyan-900/50 transition-all duration-500 ease-out ${
          isOpen
            ? "translate-y-0 scale-100 opacity-100 delay-100" // Posisi akhir saat muncul
            : "translate-y-10 scale-90 opacity-0" // Posisi awal sebelum muncul
        }`}
      >
        {/* Ikon Centang Hijau */}
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
          <CheckCircle className="h-10 w-10 text-green-400" />
        </div>

        <h3 className="mb-2 text-2xl font-bold text-white">Berhasil!</h3>
        <p className="text-sm text-slate-300">
          Password akun Anda telah berhasil diubah.
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Mengalihkan ke halaman login...
        </p>

        {/* Animasi titik loading keren */}
        <div className="mt-6 flex items-center justify-center gap-1.5">
          <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-400 [animation-delay:-0.3s]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-400 [animation-delay:-0.15s]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-400"></div>
        </div>
      </div>
    </div>
  )
}

export default SuccessPopup
