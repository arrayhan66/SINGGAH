import GlassCard from "../../../ui/GlassCard"
import {
  GraduationCap,
  Briefcase,
  Users,
  CreditCard,
  ImageOff,
  X,
  Upload,
} from "lucide-react"
import { useRef } from "react"
import { useNavigate } from "react-router-dom"
import { MailCheck } from "lucide-react"

const tipeConfig = {
  admin: { label: "Admin", icon: CreditCard, color: "amber" },
  mahasiswa: { label: "Mahasiswa", icon: GraduationCap, color: "cyan" },
  dosen: { label: "Dosen", icon: Briefcase, color: "blue" },
  umum: { label: "Umum", icon: Users, color: "slate" },
}

function ProfileInformation({
  profileData,
  updateProfileField,
  userTipe,
  pendingEmail,
  identitasPhoto,
  identitasUrl,
  onIdentitasChange,
  onIdentitasRemove,
}) {
  const navigate = useNavigate()
  const tipe = tipeConfig[userTipe] || tipeConfig.umum
  const TipeIcon = tipe.icon
  const identitasInputRef = useRef(null)

  const isSpecial = userTipe === "mahasiswa" || userTipe === "dosen"
  const previewUrl = identitasPhoto
    ? URL.createObjectURL(identitasPhoto)
    : identitasUrl || null

  function goVerify() {
    localStorage.setItem("verifyType", "profile")
    localStorage.setItem("profileEmail", pendingEmail)
    navigate("/verify-code")
  }

  return (
    <GlassCard className="p-5 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm min-[350px]:text-base md:text-lg font-semibold text-white">
            Data Diri
          </h2>
          <p className="mt-1 text-xs md:text-sm text-slate-400">
            Informasi ini akan ditampilkan pada profil dan project kamu.
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
          <TipeIcon className="h-3.5 w-3.5 text-cyan-400" />
          {tipe.label}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {/* Nama */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs md:text-sm font-medium text-slate-300">
            Nama Lengkap
          </label>
          <input
            type="text"
            value={profileData.name}
            onChange={(e) => updateProfileField("name", e.target.value)}
            placeholder="Nama lengkap kamu"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none transition-colors"
          />
        </div>

        {/* Username & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs md:text-sm font-medium text-slate-300">
              Username
            </label>
            <input
              type="text"
              value={profileData.username}
              onChange={(e) => updateProfileField("username", e.target.value)}
              placeholder="username"
              className="w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs md:text-sm font-medium text-slate-300">
              Email
            </label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => updateProfileField("email", e.target.value)}
              placeholder="nama@poliban.ac.id"
              className="w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none transition-colors"
            />
            <p className="text-[11px] text-slate-500">
              Mengubah email akan memerlukan verifikasi di email baru. Email aktif
              baru berubah setelah kode berhasil diverifikasi.
            </p>
          </div>
        </div>

        {pendingEmail && (
          <div className="flex flex-col gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <div className="flex items-start gap-2.5">
              <MailCheck size={16} className="mt-0.5 shrink-0 text-amber-400" />
              <p className="text-xs md:text-sm text-amber-200">
                Perubahan email ke{" "}
                <span className="font-semibold text-amber-100">{pendingEmail}</span>{" "}
                masih menunggu verifikasi. Email kamu belum berubah sampai kode
                diverifikasi.
              </p>
            </div>
            <button
              type="button"
              onClick={goVerify}
              className="self-start cursor-pointer rounded-lg border border-amber-500/40 bg-amber-500/20 px-4 py-2 text-xs md:text-sm font-medium text-amber-100 transition-colors hover:bg-amber-500/30"
            >
              Verifikasi Email Baru
            </button>
          </div>
        )}

        {isSpecial && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs md:text-sm font-medium text-slate-300">
              {userTipe === "dosen" ? "NIP" : "NIM"}
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <CreditCard size={16} />
              </div>
              <input
                type="text"
                value={profileData.nim_nip || ""}
                onChange={(e) => updateProfileField("nim_nip", e.target.value)}
                placeholder={
                  userTipe === "dosen" ? "Masukkan NIP" : "Masukkan NIM"
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none transition-colors"
              />
            </div>
          </div>
        )}

        {isSpecial && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs md:text-sm font-medium text-slate-300">
              Foto {userTipe === "dosen" ? "Kartu Identitas" : "KTM"}
            </label>
            {previewUrl ? (
              <div className="relative overflow-hidden rounded-xl border border-white/10">
                <img
                  src={previewUrl}
                  alt="Foto identitas"
                  className="max-h-56 w-full object-contain"
                />
                <button
                  type="button"
                  onClick={onIdentitasRemove}
                  className="absolute right-2 top-2 cursor-pointer rounded-lg border border-white/10 bg-black/70 p-1.5 text-slate-300 transition-colors hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => identitasInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/15 bg-white/[0.03] px-4 py-8 text-slate-400 transition-colors hover:border-cyan-400/40 hover:text-cyan-300"
              >
                <ImageOff className="h-6 w-6" />
                <span className="text-xs md:text-sm">
                  Belum ada foto. Klik untuk mengunggah {userTipe === "dosen" ? "Kartu Identitas" : "KTM"}.
                </span>
              </button>
            )}
            <input
              ref={identitasInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onIdentitasChange(file)
              }}
            />
            {!previewUrl && (
              <button
                type="button"
                onClick={() => identitasInputRef.current?.click()}
                className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs md:text-sm font-medium text-slate-300 transition-colors hover:bg-white/10"
              >
                <Upload size={14} />
                Unggah Foto
              </button>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  )
}

export default ProfileInformation
