import { useEffect, useState } from "react"
import { Megaphone, Send, Check } from "lucide-react"
import PopupToast from "./PopupToast"

const audienceOptions = [
  { value: "all", label: "Semua Pengguna" },
  { value: "mahasiswa", label: "Mahasiswa" },
  { value: "dosen", label: "Dosen" },
  { value: "umum", label: "Umum" },
]

const audienceLabel = { all: "Semua Pengguna", mahasiswa: "Mahasiswa", dosen: "Dosen", umum: "Umum" }

function AnnouncementModal({ onSend, onClose, isSending, error, success }) {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [audience, setAudience] = useState("all")
  const [showSuccess, setShowSuccess] = useState(false)
  const [submittedData, setSubmittedData] = useState(null)

  useEffect(() => {
    if (success) setShowSuccess(true)
  }, [success])

  const canSubmit = title.trim().length > 0 && message.trim().length > 0

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit || isSending) return
    setSubmittedData({ title: title.trim(), message: message.trim(), audience })
    onSend({ title: title.trim(), message: message.trim(), audience })
  }

  const handleClose = () => {
    setShowSuccess(false)
    setSubmittedData(null)
    setTitle("")
    setMessage("")
    setAudience("all")
    onClose()
  }

  if (showSuccess && success) {
    return (
      <PopupToast key="success" show variant="success" onClose={handleClose} position="center">
        <div className="success-panel px-4 py-3.5 animate-fade-up">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/20 border border-cyan-400/30 animate-success-pop">
              <Check className="h-4.5 w-4.5 text-cyan-300" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="pt-1 text-sm font-semibold text-white">Pengumuman Terkirim!</h3>
              <p className="mt-0.5 text-xs text-slate-400">Pesan sudah dikirim ke {audienceLabel[submittedData?.audience]}.</p>
            </div>
          </div>
          <div className="mt-3">
            <button type="button" onClick={handleClose} className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-600 px-4 py-2 text-xs font-semibold text-brand-dark shadow-lg shadow-cyan-500/25 cursor-pointer">
              Selesai
            </button>
          </div>
        </div>
      </PopupToast>
    )
  }

  return (
    <PopupToast key="form" show variant="default" onClose={handleClose} position="center">
      <form onSubmit={handleSubmit} className="px-4 py-3.5 max-h-[80vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-500/30">
            <Megaphone className="h-4.5 w-4.5 text-cyan-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="pt-1 text-sm font-semibold text-white">Kirim Pengumuman</h3>
            <p className="mt-0.5 text-[11px] text-slate-500">Notifikasi akan dikirim sebagai pengumuman</p>
          </div>
        </div>

        <div className="mt-3 space-y-2.5">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul pengumuman..."
            maxLength={120}
            className="announce-field w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-cyan-400/40"
          />
          <div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Isi pesan..."
              rows={3}
              maxLength={500}
              className="announce-field w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-cyan-400/40"
            />
            <span className="mt-0.5 block text-right text-[10px] text-slate-600">{message.length}/500</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {audienceOptions.map((opt) => (
              <button key={opt.value} type="button" onClick={() => setAudience(opt.value)}
                className={`cursor-pointer rounded-lg border px-2 py-1.5 text-[11px] font-medium transition ${
                  audience === opt.value ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-300" : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="mt-2.5 text-[11px] font-medium text-red-400">{error}</p>}

        <div className="mt-3 flex gap-2">
          <button type="button" onClick={handleClose} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 cursor-pointer">
            Batal
          </button>
          <button type="submit" disabled={!canSubmit || isSending}
            className="announce-submit flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-600 px-4 py-2 text-xs font-semibold text-brand-dark shadow-lg shadow-cyan-500/20 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50">
            {isSending ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-dark/30 border-t-brand-dark" /> : <Send className="h-3.5 w-3.5" />}
            {isSending ? "Mengirim..." : "Kirim"}
          </button>
        </div>
      </form>
    </PopupToast>
  )
}

export default AnnouncementModal