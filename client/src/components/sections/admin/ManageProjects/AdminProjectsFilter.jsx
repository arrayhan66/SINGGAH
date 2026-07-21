import SearchBar from "../../../ui/SearchBar"

const statusOptions = [
  { value: "all", label: "Semua Status" },
  { value: "pending", label: "Menunggu Review" },
  { value: "approved", label: "Disetujui" },
  { value: "rejected", label: "Ditolak" },
]

function AdminProjectsFilter({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
}) {
  return (
    <div className="flex flex-col min-[500px]:flex-row gap-3">
      <div className="flex-1 min-w-0">
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder="Cari judul project atau nama mahasiswa..."
        />
      </div>

      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="w-full min-[500px]:w-auto rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-brand-navy">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default AdminProjectsFilter
