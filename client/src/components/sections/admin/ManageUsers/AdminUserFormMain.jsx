function AdminUserFormMain({ formData, updateField }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Nama */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs md:text-sm font-medium text-slate-300">
          Nama Lengkap
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="Nama lengkap user"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none"
        />
      </div>

      {/* Username */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs md:text-sm font-medium text-slate-300">
          Username
        </label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => updateField("username", e.target.value)}
          placeholder="username"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none"
        />
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs md:text-sm font-medium text-slate-300">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => updateField("email", e.target.value)}
          placeholder="user@email.com"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none"
        />
      </div>
    </div>
  )
}

export default AdminUserFormMain
