import { inputClass } from "../../../../utils/settingsHelpers"

export default function SettingsContact({ form, onChange }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
          Email Resmi
        </label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={onChange}
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
          Nomor Telepon / WhatsApp
        </label>
        <input
          type="text"
          name="phone"
          value={form.phone}
          onChange={onChange}
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
          Alamat Kantor / Studio
        </label>
        <textarea
          name="address"
          value={form.address}
          onChange={onChange}
          rows={2}
          className={`${inputClass} resize-none`}
        />
      </div>
    </div>
  )
}
