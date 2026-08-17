import { useEffect, useState } from "react";
import { Megaphone, X, Send, Users, Check } from "lucide-react";

const audienceOptions = [
  { value: "all", label: "Semua Pengguna" },
  { value: "mahasiswa", label: "Mahasiswa" },
  { value: "dosen", label: "Dosen" },
  { value: "umum", label: "Umum" },
];

const audienceLabel = {
  all: "Semua Pengguna",
  mahasiswa: "Mahasiswa",
  dosen: "Dosen",
  umum: "Umum",
};

function AnnouncementModal({ onSend, onClose, isSending, error, success }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all");
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
    }
  }, [success]);

  const canSubmit = title.trim().length > 0 && message.trim().length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit || isSending) return;
    setSubmittedData({ title: title.trim(), message: message.trim(), audience });
    onSend({ title: title.trim(), message: message.trim(), audience });
  };

  const handleClose = () => {
    setShowSuccess(false);
    setSubmittedData(null);
    setTitle("");
    setMessage("");
    setAudience("all");
    onClose();
  };

  if (showSuccess && success) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
        <div className="w-full max-w-[calc(100vw-2rem)] sm:max-w-md animate-modal-in overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-brand-navy to-brand-dark shadow-2xl">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />
          <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />

          <div className="relative flex flex-col items-center px-6 pb-7 pt-10 text-center sm:px-8">
            <div className="relative">
              <div className="absolute inset-0 -m-4 rounded-full bg-amber-400/20 blur-2xl animate-fade-in" />
              <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 p-[3px] shadow-lg shadow-amber-500/30">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-brand-navy">
                  <svg
                    viewBox="0 0 40 40"
                    className="h-11 w-11"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                      className="animate-spark-draw"
                    />
                    <path
                      d="M13 20.5l5 5 9-11"
                      stroke="#f59e0b"
                      strokeWidth="3.5"
                      className="animate-spark-draw"
                      style={{ animationDelay: "0.35s" }}
                    />
                  </svg>
                </div>
              </div>
            </div>

            <h2 className="mt-8 text-xl font-black text-white sm:text-2xl">
              Pengumuman Terkirim!
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Pesanmu sudah dikirim dan akan muncul di notifikasi penerima.
            </p>

            {submittedData && (
              <div className="mt-6 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10">
                    <Megaphone className="h-4 w-4 text-amber-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                      Judul
                    </p>
                    <p className="mt-1 line-clamp-1 break-words text-sm font-semibold leading-snug text-white">
                      {submittedData.title}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10">
                    <Users className="h-4 w-4 text-amber-300" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                      Dikirim ke
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {audienceLabel[submittedData.audience]}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-7 flex w-full flex-col gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-3 text-sm font-semibold text-brand-dark shadow-lg shadow-amber-500/25 transition hover:from-amber-300 hover:to-orange-400"
              >
                <Check className="h-4 w-4" />
                Selesai
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
      <div className="w-full max-w-[calc(100vw-2rem)] sm:max-w-md animate-modal-in overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-brand-navy to-brand-dark shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
              <Megaphone size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Kirim Pengumuman
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Notifikasi akan dikirim sebagai pengumuman
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="cursor-pointer rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-white"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <form onSubmit={handleSubmit} className="px-5 py-5">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">
              Judul Pengumuman
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="cth. Maintenance Terjadwal"
              maxLength={120}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition focus:border-cyan-400/40 focus:bg-white/[0.07]"
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">
              Isi Pesan
            </span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tulis isi pengumuman..."
              rows={4}
              maxLength={500}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition focus:border-cyan-400/40 focus:bg-white/[0.07]"
            />
            <span className="mt-1 block text-right text-[10px] text-slate-600">
              {message.length}/500
            </span>
          </label>

          <label className="mt-3 block">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">
              Dikirim ke
            </span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {audienceOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAudience(opt.value)}
                  className={`cursor-pointer rounded-xl border px-2 py-2 text-xs font-medium transition ${
                    audience === opt.value
                      ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-300"
                      : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </label>

          {/* FOOTER */}
          {error && (
            <p className="mt-4 w-full text-xs font-medium text-red-400">
              {error}
            </p>
          )}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!canSubmit || isSending}
              className="flex-1 cursor-pointer rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2.5 text-sm font-semibold text-brand-dark shadow-lg shadow-amber-500/20 transition hover:from-amber-300 hover:to-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-dark/30 border-t-brand-dark" />
                  Mengirim...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Send className="h-4 w-4" />
                  Kirim Pengumuman
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AnnouncementModal;
