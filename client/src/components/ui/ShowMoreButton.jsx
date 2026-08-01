import { ChevronDown, ChevronUp } from "lucide-react"

function ShowMoreButton({ label, total, showAll, onToggle, className = "" }) {
  return (
    <div className={`mt-2 flex justify-center ${className}`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-5 py-2.5 text-sm font-medium text-slate-200 shadow-lg shadow-black/10 backdrop-blur-xl transition-all duration-[250ms] hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-cyan-200"
      >
        {showAll ? (
          <>
            <ChevronUp size={16} />
            Tampilkan Lebih Sedikit
          </>
        ) : (
          <>
            <ChevronDown size={16} />
            {label} ({total})
          </>
        )}
      </button>
    </div>
  )
}

export default ShowMoreButton
