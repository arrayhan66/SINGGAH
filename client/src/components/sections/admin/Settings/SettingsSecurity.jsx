import { toggleClass, switchClass, inputClass } from "../../../../utils/settingsHelpers"

export default function SettingsSecurity({ form, onChange }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-5 text-center transition-colors hover:border-white/20">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">
            Registrasi Pengguna Baru
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            Izinkan pengunjung mendaftar akun baru secara mandiri
          </p>
        </div>
        <label className={`${toggleClass} shrink-0`}>
          <input
            type="checkbox"
            name="registrationOpen"
            checked={form.registrationOpen}
            onChange={onChange}
            className="peer sr-only"
          />
          <div className={switchClass} />
        </label>
      </div>
      <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-5 text-center transition-colors hover:border-white/20">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">
            Verifikasi Email Wajib
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            Kirim tautan verifikasi email saat registrasi akun baru
          </p>
        </div>
        <label className={`${toggleClass} shrink-0`}>
          <input
            type="checkbox"
            name="emailVerification"
            checked={form.emailVerification}
            onChange={onChange}
            className="peer sr-only"
          />
          <div className={switchClass} />
        </label>
      </div>
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
