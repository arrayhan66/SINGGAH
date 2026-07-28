import { useState } from "react"
import { Plus, X } from "lucide-react"
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
    <GlassCard className="p-4 min-[280px]:p-5 sm:p-6 2xl:p-8 3xl:p-10 4xl:p-12">
      <h2 className="text-sm min-[280px]:text-base sm:text-lg 2xl:text-xl 3xl:text-2xl 4xl:text-3xl font-semibold text-white">
        Teknologi yang Digunakan
      </h2>
      <p className="mt-1 text-xs min-[280px]:text-sm text-slate-400 2xl:text-base 3xl:text-lg 4xl:text-xl">
        Tambahkan tools, bahasa, atau komponen yang dipakai.
      </p>

      <div className="mt-3 min-[280px]:mt-4 flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ketik teknologi lalu Enter"
          className="w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 min-[280px]:px-4 min-[280px]:py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none 2xl:text-base 2xl:px-5 2xl:py-3 3xl:text-lg 3xl:px-6 3xl:py-3.5 4xl:text-xl 4xl:px-7 4xl:py-4"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="flex h-9 w-9 min-[280px]:h-10 min-[280px]:w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-400/20 transition-colors 2xl:h-11 2xl:w-11 3xl:h-12 3xl:w-12 4xl:h-14 4xl:w-14"
        >
          <Plus size={16} className="2xl:size-5 3xl:size-6 4xl:size-7" />
        </button>
      </div>

      {value.length > 0 && (
        <div className="mt-3 min-[280px]:mt-4 flex flex-wrap gap-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 min-[280px]:px-3 min-[280px]:py-1.5 text-xs min-[280px]:text-sm text-cyan-300 2xl:text-base 3xl:text-lg 4xl:text-xl"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemove(tag)}
                className="text-cyan-300 hover:text-white transition-colors"
              >
                <X size={12} className="2xl:size-3.5 3xl:size-4 4xl:size-5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </GlassCard>
  )
}

export default UploadTechnology
