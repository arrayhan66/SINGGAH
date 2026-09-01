import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Hourglass, CheckCircle2, ShieldCheck, UserRound, LogIn } from "lucide-react";

const pendingTipeInfo = {
  mahasiswa: {
    label: "Mahasiswa",
    hint: "NIM kamu akan dicek oleh admin",
  },
  dosen: {
    label: "Dosen",
    hint: "Kartu identitas kamu akan dicek oleh admin",
  },
};

function VerificationPendingModal({ tipe, onClose }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const info = pendingTipeInfo[tipe] || pendingTipeInfo.mahasiswa;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-in-up relative my-auto w-full max-w-md overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-brand-navy to-brand-dark shadow-2xl shadow-cyan-500/10"
      >
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />

        <div className="relative max-h-[90dvh] overflow-y-auto p-6 sm:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-2xl bg-cyan-400/20" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/30 to-blue-600/30 shadow-lg shadow-cyan-500/20">
                <Hourglass className="h-9 w-9 animate-pulse text-cyan-300" />
              </div>
            </div>

            <h2 className="mt-6 text-2xl font-black leading-tight text-white sm:text-3xl">
              Permintaan Sedang{" "}
              <span className="text-cyan-300">Ditinjau</span>
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-slate-300/90 sm:text-base">
              Selamat! Email kamu berhasil diverifikasi. Permintaan pendaftaran sebagai{" "}
              <span className="font-bold text-cyan-300">{info.label}</span>{" "}
              sedang menunggu persetujuan admin.
            </p>
          </div>

          <div className="mt-7 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Apa yang terjadi selanjutnya?
            </p>
            <ul className="mt-4 flex flex-col gap-3.5">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />
                <span className="text-sm leading-relaxed text-slate-300">
                  Admin akan memverifikasi <strong className="text-white">{info.hint}</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />
                <span className="text-sm leading-relaxed text-slate-300">
                  Jika data cocok, tipe akun kamu berubah menjadi{" "}
                  <strong className="text-white">{info.label}</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <UserRound className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />
                <span className="text-sm leading-relaxed text-slate-300">
                  Sampai saat itu, kamu tetap bisa menggunakan aplikasi sebagai{" "}
                  <strong className="text-white">Umum</strong>.
                </span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="group mt-7 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 transition-all duration-500 hover:bg-[position:100%_0] hover:shadow-cyan-400/40"
          >
            <LogIn className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            Saya Mengerti, Lanjutkan
          </button>

          <p className="mt-4 text-center text-xs text-slate-500">
            Pemberitahuan status akan dikirim ke email kamu.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default VerificationPendingModal;
