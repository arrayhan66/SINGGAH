import { useEffect } from "react";
import { LogOut, X } from "lucide-react";

function LogoutConfirmModal({ onConfirm, onCancel }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
      <div className="w-full max-w-[calc(100vw-2rem)] sm:max-w-sm animate-modal-in rounded-2xl border border-white/10 bg-gradient-to-b from-brand-navy to-brand-dark p-5 sm:p-7 shadow-2xl shadow-red-500/5">
        {/* HEADER */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/10 border border-red-500/30 shadow-lg shadow-red-500/10">
            <LogOut className="h-5 w-5 sm:h-[22px] sm:w-[22px] text-red-400" />
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="mt-0.5 text-slate-500 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <h3 className="mt-4 sm:mt-5 text-base sm:text-lg font-semibold text-white leading-snug">
          Yakin ingin keluar?
        </h3>
        <p className="mt-2 text-sm text-slate-400 leading-relaxed">
          Kamu akan kembali ke halaman login. Pastikan semua perubahan sudah
          tersimpan.
        </p>

        {/* FOOTER */}
        <div className="mt-6 sm:mt-7 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/25 hover:from-red-600 hover:to-orange-600 hover:shadow-red-500/40 transition-all cursor-pointer"
          >
            Ya, Keluar
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogoutConfirmModal;
