import { inputClass } from "../../../../utils/settingsHelpers"

export default function SettingsSocial({ form, onChange }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
          Instagram Official
        </label>
        <input
          type="text"
          name="instagram"
          value={form.instagram}
          onChange={onChange}
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
          Twitter / X Handle
        </label>
        <input
          type="text"
          name="twitter"
          value={form.twitter}
          onChange={onChange}
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
          YouTube Channel
        </label>
        <input
          type="text"
          name="youtube"
          value={form.youtube}
          onChange={onChange}
          className={inputClass}
        />
      </div>
    </div>
  )
}
