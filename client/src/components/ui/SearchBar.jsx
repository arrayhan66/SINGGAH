import { Search } from "lucide-react";

function SearchBar({ value, onChange, placeholder = "Cari..." }) {
  return (
    <div className="mt-8 sm:mt-9 md:mt-10 3xl:mt-11 4xl:mt-12">
      <div className="group flex items-center gap-2.5 rounded-xl border-2 border-white/60 bg-white/90 px-3.5 py-2.5 backdrop-blur-md shadow-xl transition-all duration-300 hover:shadow-2xl focus-within:-translate-y-1 focus-within:border-cyan-400 focus-within:bg-white focus-within:shadow-cyan-400/30 sm:gap-3 sm:rounded-2xl sm:px-5 sm:py-3 md:py-3.5 lg:py-4 3xl:gap-4 3xl:px-6 3xl:py-4.5 4xl:py-5">
        <Search
          size={16}
          className="text-slate-500 transition-colors duration-300 group-focus-within:text-cyan-500 sm:size-[18px] md:size-5 3xl:size-[22px] 4xl:size-6"
        />

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-500 focus:outline-none sm:text-sm md:text-base lg:text-base 3xl:text-lg 4xl:text-xl"
        />
      </div>
    </div>
  );
}

export default SearchBar;
