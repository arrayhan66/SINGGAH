import { Search } from "lucide-react"

function SearchBar({ value, onChange, placeholder = "Cari..." }) {
  return (
    <div className="mt-10">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-xl transition focus-within:border-cyan-400/40">
        <Search size={20} className="text-slate-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-white placeholder:text-slate-400 focus:outline-none"
        />
      </div>
    </div>
  )
}

export default SearchBar
