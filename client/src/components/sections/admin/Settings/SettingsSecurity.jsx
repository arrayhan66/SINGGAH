import { UserPlus, MailCheck } from "lucide-react"
import { toggleClass, getSwitchClass, inputClass } from "../../../../utils/settingsHelpers"
import { useTheme } from "../../../../context/ThemeContext"

const toggleCards = [
  {
    name: "registrationOpen",
    icon: UserPlus,
    title: "Registrasi Pengguna Baru",
    desc: "Izinkan pengunjung mendaftar akun baru secara mandiri",
    dark: "border-cyan-400/25 bg-cyan-400/10",
    light: "from-cyan-400 to-blue-600",
    iconDark: "text-cyan-300",
  },
  {
    name: "emailVerification",
    icon: MailCheck,
    title: "Verifikasi Email Wajib",
    desc: "Kirim tautan verifikasi email saat registrasi akun baru",
    dark: "border-purple-400/25 bg-purple-400/10",
    light: "from-purple-400 to-blue-600",
    iconDark: "text-purple-300",
  },
]

export default function SettingsSecurity({ form, onChange }) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <div className="space-y-6">
      {toggleCards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.name}
            className={`flex flex-col items-center gap-3 rounded-xl border p-5 text-center transition-colors ${
              isDark
                ? "border-white/10 bg-white/[0.04] hover:border-white/20"
                : "border-slate-200 bg-white shadow-sm hover:border-blue-300"
            }`}
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                isDark
                  ? `border ${card.dark}`
                  : `bg-gradient-to-br ${card.light} shadow-lg shadow-blue-500/25`
              }`}
            >
              <Icon
                className={`h-6 w-6 ${isDark ? card.iconDark : "text-white"}`}
              />
            </div>
            <div className="min-w-0">
              <p
                className={`text-sm font-semibold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {card.title}
              </p>
              <p
                className={`mt-0.5 text-xs ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {card.desc}
              </p>
            </div>
            <label className={`${toggleClass} shrink-0`}>
              <input
                type="checkbox"
                name={card.name}
                checked={form[card.name]}
                onChange={onChange}
                className="peer sr-only"
              />
              <div className={getSwitchClass(isDark)} />
            </label>
          </div>
        )
      })}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
          Maksimal Ukuran Upload File (MB)
        </label>
        <input
          type="number"
          name="maxUploadSize"
          value={form.maxUploadSize}
          onChange={onChange}
          className={`${inputClass} max-w-xs`}
        />
      </div>
    </div>
  )
}