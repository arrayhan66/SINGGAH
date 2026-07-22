import { Search } from "lucide-react";

function SearchBar({ value, onChange, placeholder = "Cari..." }) {
  return (
    <div className="mt-10">
      <div className="group flex items-center gap-3 rounded-2xl border-2 border-white/60 bg-white/90 px-5 py-3.5 backdrop-blur-md shadow-xl transition-all duration-300 hover:shadow-2xl focus-within:-translate-y-1 focus-within:border-cyan-400 focus-within:bg-white focus-within:shadow-cyan-400/30">
        <Search
          size={20}
          className="text-slate-500 transition-colors duration-300 group-focus-within:text-cyan-500"
        />

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent font-medium text-slate-800 placeholder:text-slate-500 focus:outline-none"
        />
      </div>
    </div>
  );
}

export default SearchBar;
