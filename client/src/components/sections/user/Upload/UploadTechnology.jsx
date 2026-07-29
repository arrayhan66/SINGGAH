import { useState } from "react"
import { Plus, X, Layers } from "lucide-react"
import GlassCard from "../../../ui/GlassCard"

function UploadTechnology({ value, onChange }) {
  const [inputValue, setInputValue] = useState("")

  function handleAdd() {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    if (value.some((tag) => tag.toLowerCase() === trimmed.toLowerCase())) {
      setInputValue("")
      return
    }
    onChange([...value, trimmed])
    setInputValue("")
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAdd()
    }
  }

  function handleRemove(tag) {
    onChange(value.filter((t) => t !== tag))
  }

  return (
    <GlassCard className="p-3 min-[280px]:p-5 sm:p-6 2xl:p-8 3xl:p-10 4xl:p-12">
      <div className="flex items-center gap-2">
        <div className="flex shrink-0 h-[clamp(2.5rem,1.5rem+2.5vw,5rem)] w-[clamp(2.5rem,1.5rem+2.5vw,5rem)] items-center justify-center rounded-lg bg-cyan-400/10 border border-cyan-400/30">
          <Layers className="text-cyan-300 h-[clamp(1.25rem,0.75rem+1.25vw,2.5rem)] w-[clamp(1.25rem,0.75rem+1.25vw,2.5rem)]" />
        </div>
        <div>
          <h2 className="text-xs min-[280px]:text-base sm:text-lg 2xl:text-xl 3xl:text-2xl 4xl:text-3xl font-semibold text-white">
            Teknologi yang Digunakan
          </h2>
        </div>
        <span className="ml-auto inline-flex items-center rounded-full border border-slate-600 bg-slate-800 px-1.5 min-[280px]:px-2 py-0.5 text-[8px] min-[280px]:text-[10px] font-medium text-slate-400 2xl:text-xs 3xl:text-sm">
          Opsional
        </span>
      </div>

      <div className="mt-2 min-[280px]:mt-4 flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="React, Node.js, Laravel..."
          className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 min-[280px]:px-4 min-[280px]:py-2.5 text-xs min-[280px]:text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:outline-none 2xl:text-base 2xl:px-5 2xl:py-3 3xl:text-lg 3xl:px-6 3xl:py-3.5 4xl:text-xl 4xl:px-7 4xl:py-4"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="flex h-8 w-8 min-[280px]:h-10 min-[280px]:w-10 cursor-pointer shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-400/20 transition-colors 2xl:h-11 2xl:w-11 3xl:h-12 3xl:w-12 4xl:h-14 4xl:w-14"
        >
          <Plus className="h-5 w-5 2xl:h-6 2xl:w-6 3xl:h-7 3xl:w-7 4xl:h-8 4xl:w-8" />
        </button>
      </div>

      {value.length > 0 && (
        <div className="mt-2 min-[280px]:mt-4 flex flex-wrap gap-1.5 min-[280px]:gap-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 min-[280px]:px-3 min-[280px]:py-1.5 text-[11px] min-[280px]:text-sm text-cyan-300 2xl:text-base 3xl:text-lg 4xl:text-xl"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemove(tag)}
                className="cursor-pointer text-cyan-300 hover:text-white transition-colors"
              >
                <X className="h-3 w-3 min-[280px]:h-3.5 min-[280px]:w-3.5 2xl:h-4 2xl:w-4 3xl:h-[18px] 3xl:w-[18px] 4xl:h-5 4xl:w-5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </GlassCard>
  )
}

export default UploadTechnology
