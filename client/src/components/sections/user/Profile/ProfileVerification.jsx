import { useState, useRef } from "react"
import {
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Clock,
  XCircle,
  IdCard,
  ImageOff,
  X,
} from "lucide-react"
import GlassCard from "../../../ui/GlassCard"
import FormAlert from "../../../ui/FormAlert"
import api from "../../../../services/api"
import { useAuth } from "../../../../context/AuthContext"
import { useTheme } from "../../../../context/ThemeContext"
import { compressImage } from "../../../../utils/compressImage"

const tipeLabel = {
  mahasiswa: "Mahasiswa",
  dosen: "Dosen",
}

function ProfileVerification() {
  const { user, login, token } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [targetTipe, setTargetTipe] = useState(null) // "mahasiswa" | "dosen" | null
  const [nimNip, setNimNip] = useState("")
  const [identitasPhoto, setIdentitasPhoto] = useState(null)
  const [applying, setApplying] = useState(false)
  const [message, setMessage] = useState({ type: null, text: "" })
  const fileInputRef = useRef(null)

  if (user?.tipe !== "umum") return null

  const isPending = Boolean(user?.pending_tipe)
  const rejectedReason = user?.rejection_reason

  function clearMessage() {
    setMessage({ type: null, text: "" })
  }

  function handleStartApply(tipe) {
    clearMessage()
    setTargetTipe(tipe)
    setNimNip("")
    setIdentitasPhoto(null)
  }

  function handleCancelApply() {
    setTargetTipe(null)
    setNimNip("")
    setIdentitasPhoto(null)
    clearMessage()
  }

  async function handleSubmitApply(e) {
    e.preventDefault()
    clearMessage()

    if (targetTipe === "mahasiswa" && !nimNip.trim()) {
      setMessage({
        type: "error",
        text: "NIM wajib diisi untuk mahasiswa.",
      })
      return
    }

    if (!identitasPhoto && !user?.identitas_photo) {
      setMessage({
        type: "error",
        text: `Foto ${
          targetTipe === "mahasiswa" ? "KTM" : "Kartu Identitas"
        } wajib diunggah.`,
      })
      return
    }

    setApplying(true)
    try {
      const formData = new FormData()
      formData.append("tipe", targetTipe)
      formData.append("nim_nip", nimNip.trim())
      if (identitasPhoto) {
        formData.append("identitas_photo", identitasPhoto)
      }

      const res = await api.post("/auth/apply-tipe", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      login({ ...user, ...res.data.data }, token)
      const submittedTipe = targetTipe
      setTargetTipe(null)
      setMessage({
        type: "success",
        text: `Pengajuan verifikasi ${tipeLabel[submittedTipe]} berhasil dikirim ke admin.`,
      })
    } catch (err) {
      const msg =
        err.response?.data?.message || "Terjadi kesalahan. Silakan coba lagi."
      setMessage({ type: "error", text: msg })
    } finally {
      setApplying(false)
    }
  }

  const previewUrl = identitasPhoto ? URL.createObjectURL(identitasPhoto) : null

  return (
    <GlassCard className="p-5 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm min-[350px]:text-base md:text-lg font-semibold text-white">
            Verifikasi Tipe Akun
          </h2>
          <p className="mt-1 text-xs md:text-sm text-slate-400">
            {isPending
              ? "Pengajuan verifikasi sedang diproses admin."
              : "Ajukan verifikasi agar tipe akun menjadi Mahasiswa atau Dosen."}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10">
          <ShieldCheck className="h-5 w-5 text-cyan-300" />
        </div>
      </div>

      {isPending ? (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <Clock className="h-5 w-5 shrink-0 text-amber-400" />
          <p className="text-xs md:text-sm text-amber-200">
            Permintaan verifikasi sebagai{" "}
            <strong>{tipeLabel[user.pending_tipe]}</strong> sedang menunggu
            persetujuan admin. Anda akan mendapat notifikasi begitu admin
            memutuskan.
          </p>
        </div>
      ) : targetTipe ? (
        /* Form Pengajuan Interaktif di dalam Card */
        <form onSubmit={handleSubmitApply} className="mt-5 flex flex-col gap-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm font-semibold text-cyan-300">
              Form Pengajuan Verifikasi {tipeLabel[targetTipe]}
            </span>
            <button
              type="button"
              onClick={handleCancelApply}
              className="text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-[11px] leading-relaxed text-slate-400 md:text-xs">
            {targetTipe === "mahasiswa"
              ? "Ajukan ulang dengan NIM dan foto KTM kamu yang valid."
              : "Ajukan ulang dengan NIP/NIDN dan foto Kartu Identitas yang valid."}
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs md:text-sm font-medium text-slate-300">
              {targetTipe === "mahasiswa"
                ? "Nomor Induk Mahasiswa (NIM)"
                : "Nomor Induk Pegawai / NIDN (Opsional)"}
            </label>
            <input
              type="text"
              required={targetTipe === "mahasiswa"}
              value={nimNip}
              onChange={(e) => setNimNip(e.target.value)}
              placeholder={
                targetTipe === "mahasiswa"
                  ? "Masukkan NIM kamu"
                  : "Masukkan Kartu Identitas"
              }
              className={`w-full rounded-xl border px-4 py-2.5 text-sm transition-colors focus:outline-none ${isDark ? "border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-cyan-400/50" : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-cyan-500"}`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs md:text-sm font-medium text-slate-300">
              Foto {targetTipe === "mahasiswa" ? "KTM" : "Kartu Identitas"} <span className="text-red-400">*</span>
            </label>
            {previewUrl ? (
              <div className="relative overflow-hidden rounded-xl border border-white/10">
                <img
                  src={previewUrl}
                  alt={targetTipe === "mahasiswa" ? "KTM Preview" : "Kartu Identitas Preview"}
                  className="max-h-48 w-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => setIdentitasPhoto(null)}
                  aria-label="Hapus foto"
                  title="Hapus foto"
                  className="group/remove absolute right-2 top-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-slate-900/90 text-white shadow-lg ring-1 ring-white/40 transition-all duration-200 hover:bg-red-500 hover:ring-red-300 hover:shadow-red-500/50 active:scale-90"
                >
                  <X size={15} strokeWidth={3} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/15 bg-white/[0.03] px-4 py-6 text-slate-400 transition-colors hover:border-cyan-400/40 hover:text-cyan-300"
              >
                <ImageOff className="h-6 w-6" />
                <span className="text-xs">
                  Klik untuk mengunggah foto{" "}
                  {targetTipe === "mahasiswa" ? "KTM" : "Kartu Identitas"}
                </span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0]
                if (!f) return
                const compressed = await compressImage(f, {
                  maxSize: 1024 * 1024,
                })
                setIdentitasPhoto(compressed)
                if (fileInputRef.current) fileInputRef.current.value = ""
              }}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleCancelApply}
              disabled={applying}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs md:text-sm font-medium text-slate-300 hover:bg-white/10 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={applying}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs md:text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {applying ? "Mengirim..." : "Kirim Pengajuan"}
            </button>
          </div>
        </form>
      ) : (
        <>
          {rejectedReason && (
            <div className={`mt-5 rounded-xl border p-4 ${isDark ? "border-red-500/30 bg-red-500/10 text-red-200" : "border-red-200 bg-red-50 text-red-900"}`}>
              <div className={`flex items-center gap-2 text-sm font-medium ${isDark ? "text-red-400" : "text-red-700"}`}>
                <XCircle size={16} className="shrink-0 max-[389px]:hidden" />
                Pengajuan sebelumnya ditolak
              </div>
              <div className="mt-1.5 flex items-start gap-1.5">
                <span className={`text-xs md:text-sm font-semibold ${isDark ? "text-red-300" : "text-red-700"}`}>
                  Alasan:
                </span>
                <p className={`text-xs md:text-sm ${isDark ? "text-red-200" : "text-red-800"}`}>
                  {rejectedReason}
                </p>
              </div>
              <p className={`mt-2 text-[11px] ${isDark ? "text-red-300/70" : "text-red-700/80"}`}>
                Silakan ajukan ulang dengan dokumen yang valid.
              </p>
            </div>
          )}

          {!rejectedReason && (
            <p className="mt-4 flex items-start gap-2 text-xs text-slate-400 md:text-sm">
              <IdCard className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
              Verifikasi membuka fitur khusus.
            </p>
          )}

          <div className="mt-5 grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleStartApply("mahasiswa")}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-md shadow-cyan-500/10 transition-colors duration-300 hover:bg-slate-200"
            >
              <GraduationCap size={16} className="max-[599px]:hidden text-cyan-500" />
              Ajukan sebagai Mahasiswa
            </button>
            <button
              type="button"
              onClick={() => handleStartApply("dosen")}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-md shadow-blue-500/10 transition-colors duration-300 hover:bg-slate-200"
            >
              <Briefcase size={16} className="max-[599px]:hidden text-blue-500" />
              Ajukan sebagai Dosen
            </button>
          </div>
        </>
      )}

      {message.text && (
        <FormAlert
          message={message.text}
          type={message.type === "success" ? "success" : "error"}
          onClose={clearMessage}
        />
      )}
    </GlassCard>
  )
}

export default ProfileVerification
