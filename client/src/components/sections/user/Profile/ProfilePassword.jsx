import { useState } from "react"
import { Eye, EyeOff, Lock } from "lucide-react"
import GlassCard from "../../../ui/GlassCard"

function PasswordInput({ label, value, onChange, placeholder }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs md:text-sm font-medium text-slate-300">
        {label}
      </label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pr-11 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none transition-colors"
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  )
}

function ProfilePassword({ passwordData, updatePasswordField }) {
  return (
    <GlassCard className="p-5 md:p-6">
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-cyan-300" />
        <h2 className="text-sm min-[350px]:text-base md:text-lg font-semibold text-white">
          Ganti Password
        </h2>
      </div>
      <p className="mt-1 text-xs md:text-sm text-slate-400">
        Kosongkan bagian ini jika kamu tidak ingin mengganti password.
      </p>

      <div className="mt-5 flex flex-col gap-4">
        <PasswordInput
          label="Password Saat Ini"
          value={passwordData.currentPassword}
          onChange={(val) => updatePasswordField("currentPassword", val)}
          placeholder="Masukkan password lama"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PasswordInput
            label="Password Baru"
            value={passwordData.newPassword}
            onChange={(val) => updatePasswordField("newPassword", val)}
            placeholder="Masukkan password baru"
          />

          <PasswordInput
            label="Konfirmasi Password Baru"
            value={passwordData.confirmPassword}
            onChange={(val) => updatePasswordField("confirmPassword", val)}
            placeholder="Ulangi password baru"
          />
        </div>
      </div>
    </GlassCard>
  )
}

export default ProfilePassword
